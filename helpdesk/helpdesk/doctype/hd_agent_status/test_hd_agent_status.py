# Copyright (c) 2026, Frappe Technologies and Contributors
# See license.txt

from unittest.mock import patch

import frappe
from frappe.tests.utils import FrappeTestCase

from helpdesk.setup.install import add_default_agent_status
from helpdesk.test_utils import (
    make_agent,
    make_agent_status,
    set_agent_availability,
    set_agent_status_enabled,
    set_default_agent_status,
)


class TestHDAgentStatus(FrappeTestCase):
    DEFAULT_STATUSES = ("Active", "Away", "Unavailable")

    def setUp(self):
        add_default_agent_status()

    def tearDown(self):
        frappe.db.delete("HD Agent Status", {"name": ["not in", self.DEFAULT_STATUSES]})
        add_default_agent_status()

    def _use_default(self, status: str | None):
        current = frappe.db.get_single_value("HD Settings", "default_agent_status")
        set_default_agent_status(status)
        self.addCleanup(set_default_agent_status, current)

    def test_default_statuses_are_seeded(self):
        defaults = {
            "Active": "Active",
            "Away": "Away",
            "Unavailable": "Unavailable",
        }
        for status, category in defaults.items():
            self.assertTrue(frappe.db.exists("HD Agent Status", status))
            self.assertEqual(
                frappe.db.get_value("HD Agent Status", status, "category"), category
            )

        self.assertEqual(
            frappe.db.get_single_value("HD Settings", "default_agent_status"), "Active"
        )

    def test_name_is_the_status_value(self):
        status = make_agent_status("In a Meeting", category="Away")
        self.assertEqual(status.name, "In a Meeting")

    def test_duplicate_status_not_allowed(self):
        make_agent_status("On Lunch", category="Away")
        with self.assertRaises(frappe.DuplicateEntryError):
            make_agent_status("On Lunch", category="Away")

    def test_invalid_category_rejected(self):
        with self.assertRaises(frappe.ValidationError):
            make_agent_status("Busy", category="Busy")

    def test_category_is_mandatory(self):
        with self.assertRaises(frappe.MandatoryError):
            make_agent_status("No Category", category="")

    def test_default_status_cannot_be_disabled(self):
        active = frappe.get_doc("HD Agent Status", "Active")
        active.enabled = 0
        with self.assertRaises(frappe.ValidationError):
            active.save()

    def test_non_default_status_can_be_disabled(self):
        online = make_agent_status("Online", category="Active")
        online.enabled = 0
        online.save()
        self.assertFalse(online.enabled)

    def test_disabling_status_resets_agents_to_default(self):
        focusing = make_agent_status("Focusing", category="Away")
        agent = make_agent("disable_status@test.com", first_name="Disable Status")
        set_agent_availability(agent, "Focusing")

        focusing.enabled = 0
        focusing.save()

        self.assertEqual(
            frappe.db.get_value("HD Agent", agent, "availability"), "Active"
        )

    def test_disabling_status_publishes_for_each_agent(self):
        focusing = make_agent_status("Focusing", category="Away")
        first = make_agent("disable_publish_1@test.com", first_name="Disable Publish 1")
        second = make_agent("disable_publish_2@test.com", first_name="Disable Publish 2")
        set_agent_availability(first, "Focusing")
        set_agent_availability(second, "Focusing")

        with patch(
            "helpdesk.helpdesk.doctype.hd_agent.hd_agent.publish_event"
        ) as publish:
            focusing.enabled = 0
            focusing.save()

        self.assertEqual(publish.call_count, 2)
        self.assertEqual(
            {call.kwargs["data"]["agent"] for call in publish.call_args_list},
            {first, second},
        )

    def test_disabling_status_leaves_other_agents_alone(self):
        online = make_agent_status("Online", category="Active")
        agent = make_agent("unused_status@test.com", first_name="Unused Status")
        set_agent_availability(agent, "Away")

        online.enabled = 0
        online.save()

        self.assertEqual(frappe.db.get_value("HD Agent", agent, "availability"), "Away")

    def test_default_status_cannot_be_deleted(self):
        with self.assertRaises(frappe.ValidationError):
            frappe.delete_doc("HD Agent Status", "Active")
        with self.assertRaises(frappe.ValidationError):
            frappe.delete_doc("HD Agent Status", "Active", force=True)

    def test_non_default_status_can_be_deleted(self):
        make_agent_status("Online", category="Active")
        frappe.delete_doc("HD Agent Status", "Online")
        self.assertFalse(frappe.db.exists("HD Agent Status", "Online"))

    def test_agents_move_to_the_configured_default(self):
        self._use_default("Away")
        focusing = make_agent_status("Focusing", category="Away")
        agent = make_agent("configured_default@test.com", first_name="Configured")
        set_agent_availability(agent, "Focusing")

        focusing.enabled = 0
        focusing.save()

        self.assertEqual(frappe.db.get_value("HD Agent", agent, "availability"), "Away")

    def test_new_agent_uses_the_configured_default(self):
        self._use_default("Away")

        agent = make_agent("new_agent_default@test.com", first_name="New Default")

        self.assertEqual(frappe.db.get_value("HD Agent", agent, "availability"), "Away")

    def test_disabled_default_can_still_save_unrelated_fields(self):
        focusing = make_agent_status("Focusing", category="Away")
        self._use_default("Focusing")
        set_agent_status_enabled("Focusing", 0)

        focusing.reload()
        focusing.color = "Blue"
        focusing.save()

        self.assertEqual(
            frappe.db.get_value("HD Agent Status", "Focusing", "color"), "Blue"
        )

    def test_disabling_an_unheld_status_needs_no_default(self):
        focusing = make_agent_status("Focusing", category="Away")
        self._use_default(None)

        focusing.enabled = 0
        focusing.save()

        self.assertFalse(focusing.enabled)

    def test_hd_settings_rejects_disabled_default_status(self):
        make_agent_status("Focusing", category="Away", enabled=0)

        settings = frappe.get_doc("HD Settings")
        settings.default_agent_status = "Focusing"
        with self.assertRaises(frappe.ValidationError):
            settings.save()
