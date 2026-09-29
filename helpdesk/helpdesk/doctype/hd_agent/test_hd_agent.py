# Copyright (c) 2022, Frappe Technologies and Contributors
# See license.txt

from unittest.mock import patch

import frappe
from frappe.client import set_value as client_set_value
from frappe.tests.utils import FrappeTestCase

from helpdesk.api.auth import get_user
from helpdesk.helpdesk.doctype.hd_agent.hd_agent import update_agent_role
from helpdesk.setup.install import add_default_agent_status
from helpdesk.test_utils import (
    make_agent,
    set_agent_availability,
    set_agent_status_enabled,
)
from helpdesk.utils import is_admin, is_agent_manager


class TestHDAgent(FrappeTestCase):
    test_user = "test_user@test.com"

    def setUp(self):
        frappe.set_user("Administrator")
        add_default_agent_status()
        make_agent(self.test_user, first_name="Test User")
        set_agent_availability(self.test_user, "Active")

    def tearDown(self):
        frappe.set_user("Administrator")

    def _get_or_create_user(self, email: str, first_name: str):
        if frappe.db.exists("User", email):
            return frappe.get_doc("User", email)

        return frappe.get_doc(
            {
                "doctype": "User",
                "email": email,
                "first_name": first_name,
                "send_welcome_email": 0,
            }
        ).insert(ignore_permissions=True)

    def _ensure_role(self, role_name: str):
        if frappe.db.exists("Role", role_name):
            return

        frappe.get_doc({"doctype": "Role", "role_name": role_name}).insert(
            ignore_permissions=True
        )

    def _disable_status(self, status: str):
        set_agent_status_enabled(status, 0)
        self.addCleanup(set_agent_status_enabled, status, 1)

    def _set_availability_as(self, user: str, agent: str, availability: str):
        frappe.set_user(user)
        return client_set_value(
            doctype="HD Agent",
            name=agent,
            fieldname="availability",
            value=availability,
        )

    def test_new_agent_defaults_to_configured_status(self):
        agent = make_agent("defaults_active@test.com", first_name="Defaults Active")

        self.assertEqual(
            frappe.db.get_value("HD Agent", agent, "availability"), "Active"
        )

    def test_unauthorized_role_update(self):
        frappe.set_user(self.test_user)

        with self.assertRaises(frappe.PermissionError):
            update_agent_role(self.test_user, "System Manager")

    def test_agent_can_set_own_availability(self):
        frappe.set_user(self.test_user)

        agent = frappe.get_doc("HD Agent", self.test_user)
        agent.availability = "Away"
        agent.save()

        stored = frappe.db.get_value(
            "HD Agent",
            {"user": self.test_user},
            ["availability", "availability_changed_on"],
            as_dict=True,
        )
        self.assertEqual(stored.availability, "Away")
        self.assertIsNotNone(stored.availability_changed_on)

    def test_client_set_value_updates_availability(self):
        self._set_availability_as(self.test_user, self.test_user, "Away")

        self.assertEqual(
            frappe.db.get_value("HD Agent", self.test_user, "availability"), "Away"
        )

    def test_agent_cannot_set_another_agents_availability(self):
        other = make_agent("other_agent@test.com", first_name="Other Agent")

        with self.assertRaises(frappe.PermissionError):
            self._set_availability_as(self.test_user, other, "Away")

        self.assertEqual(
            frappe.db.get_value("HD Agent", other, "availability"), "Active"
        )

    def test_manager_can_set_another_agents_availability(self):
        other = make_agent("managed_agent@test.com", first_name="Managed Agent")
        set_agent_availability(other, "Active")
        manager = make_agent("agent_manager@test.com", first_name="Agent Manager")
        frappe.get_doc("User", manager).add_roles("Agent Manager")

        self._set_availability_as(manager, other, "Away")

        self.assertEqual(frappe.db.get_value("HD Agent", other, "availability"), "Away")
        self.assertEqual(
            frappe.db.get_value("HD Agent", other, "availability_changed_by"), manager
        )

    def test_system_manager_can_set_another_agents_availability(self):
        other = make_agent("sys_managed_agent@test.com", first_name="System Managed")
        manager = self._get_or_create_user("system_manager@test.com", "System Manager")
        manager.add_roles("System Manager")

        self._set_availability_as(manager.name, other, "Away")

        self.assertEqual(frappe.db.get_value("HD Agent", other, "availability"), "Away")

    def test_non_admin_roles_do_not_change_global_is_admin(self):
        system_manager = self._get_or_create_user(
            "system_manager_admin_check@test.com", "System Manager"
        )
        system_manager.add_roles("System Manager")

        self._ensure_role("Kancom Admin")
        kancom_admin = self._get_or_create_user(
            "kancom_admin_check@test.com", "Kancom Admin"
        )
        kancom_admin.add_roles("Kancom Admin")

        self.assertFalse(is_admin(system_manager.name))
        self.assertFalse(is_admin(kancom_admin.name))
        self.assertTrue(is_agent_manager(system_manager.name))
        self.assertTrue(is_agent_manager(kancom_admin.name))

    def test_agent_can_still_read_another_agent(self):
        other = make_agent("readable_agent@test.com", first_name="Readable Agent")
        other_doc = frappe.get_doc("HD Agent", other)
        frappe.set_user(self.test_user)

        self.assertTrue(frappe.has_permission("HD Agent", "read", doc=other_doc))
        self.assertFalse(frappe.has_permission("HD Agent", "write", doc=other_doc))

    def test_availability_rejects_unknown_status(self):
        with self.assertRaises(frappe.ValidationError):
            set_agent_availability(self.test_user, "Not A Status")

    def test_availability_rejects_disabled_status(self):
        self._disable_status("Unavailable")

        with self.assertRaises(frappe.ValidationError):
            set_agent_availability(self.test_user, "Unavailable")

    def test_disabled_status_does_not_block_unrelated_save(self):
        agent = set_agent_availability(self.test_user, "Unavailable")
        self._disable_status("Unavailable")

        agent.reload()
        agent.is_active = 0
        agent.save(ignore_permissions=True)

        self.assertEqual(
            frappe.db.get_value("HD Agent", agent.name, "availability"), "Unavailable"
        )

    def test_availability_change_is_published(self):
        with patch(
            "helpdesk.helpdesk.doctype.hd_agent.hd_agent.publish_event"
        ) as publish:
            agent = set_agent_availability(self.test_user, "Away")

        publish.assert_called_once()
        event, kwargs = publish.call_args[0][0], publish.call_args[1]
        self.assertEqual(event, "agent_availability_updated")
        self.assertEqual(kwargs["data"]["agent"], agent.name)
        self.assertEqual(kwargs["data"]["availability"], "Away")
        self.assertEqual(kwargs["data"]["changed_by"], frappe.session.user)

    def test_save_without_availability_change_is_not_published(self):
        set_agent_availability(self.test_user, "Away")
        agent = frappe.get_doc("HD Agent", {"user": self.test_user})

        with patch(
            "helpdesk.helpdesk.doctype.hd_agent.hd_agent.publish_event"
        ) as publish:
            agent.is_active = 0
            agent.save(ignore_permissions=True)

        publish.assert_not_called()

    def test_get_user_includes_availability(self):
        set_agent_availability(self.test_user, "Away")
        frappe.set_user(self.test_user)

        result = get_user()

        self.assertEqual(result["availability"], "Away")
        self.assertIsNotNone(result["availability_changed_on"])
        self.assertEqual(result["availability_changed_by"], "Administrator")
