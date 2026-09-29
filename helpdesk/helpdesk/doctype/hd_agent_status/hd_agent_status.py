# Copyright (c) 2026, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

from helpdesk.utils import publish_event


class HDAgentStatus(Document):
    def validate(self):
        self.validate_default_stays_enabled()

    def on_update(self):
        self.reset_agents_to_default()

    def on_trash(self):
        self.reject_if_default()

    def validate_default_stays_enabled(self):
        if self.enabled or not self.has_value_changed("enabled"):
            return

        self.reject_if_default()

    def reject_if_default(self):
        if self.name != frappe.db.get_single_value(
            "HD Settings", "default_agent_status"
        ):
            return

        frappe.throw(
            _(
                "{0} is the default agent status. Set a different default in HD Settings first."
            ).format(self.name),
            frappe.ValidationError,
        )

    def reset_agents_to_default(self):
        if self.enabled or not self.has_value_changed("enabled"):
            return

        agents = frappe.get_all(
            "HD Agent", filters={"availability": self.name}, pluck="name"
        )
        if not agents:
            return

        default_status = get_default_agent_status()
        changed_on = frappe.utils.now()
        HDAgent = frappe.qb.DocType("HD Agent")
        (
            frappe.qb.update(HDAgent)
            .set(HDAgent.availability, default_status)
            .set(HDAgent.availability_changed_on, changed_on)
            .set(HDAgent.availability_changed_by, frappe.session.user)
            .set(HDAgent.modified, changed_on)
            .set(HDAgent.modified_by, frappe.session.user)
            .where(HDAgent.name.isin(agents))
        ).run()

        for name in agents:
            publish_event(
                "agent_availability_updated",
                data={
                    "agent": name,
                    "availability": default_status,
                    "availability_changed_on": changed_on,
                    "changed_by": frappe.session.user,
                },
            )


def get_default_agent_status() -> str:
    status = frappe.db.get_single_value("HD Settings", "default_agent_status")
    if not status:
        frappe.throw(_("Set a default agent status in HD Settings."))

    return status
