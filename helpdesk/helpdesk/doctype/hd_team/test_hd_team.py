# Copyright (c) 2022, Frappe Technologies and Contributors
# See license.txt

import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from helpdesk.helpdesk.doctype.hd_team.hd_team import HDTeam


class TestHDTeam(unittest.TestCase):
    def test_trusted_team_save_propagates_to_assignment_rule_save(self):
        team = HDTeam({"doctype": "HD Team"})
        team.flags.ignore_permissions = True
        assignment_rule = MagicMock(disabled=False, name="AirOps - Support Rotation")

        with (
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_value",
                side_effect=["Base Support Rotation", None],
            ),
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_doc",
                return_value=SimpleNamespace(name="Base Support Rotation"),
            ),
        ):
            team.update_assignment_rule_users(
                (None, SimpleNamespace(get=lambda key: "agent@example.com")),
                assignment_rule,
            )

        assignment_rule.save.assert_called_once_with(ignore_permissions=True)

    def test_normal_team_save_does_not_bypass_assignment_rule_permissions(self):
        team = HDTeam({"doctype": "HD Team"})
        assignment_rule = MagicMock(disabled=False, name="AirOps - Support Rotation")

        with (
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_value",
                side_effect=["Base Support Rotation", None],
            ),
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_doc",
                return_value=SimpleNamespace(name="Base Support Rotation"),
            ),
        ):
            team.update_assignment_rule_users(
                (None, SimpleNamespace(get=lambda key: "agent@example.com")),
                assignment_rule,
            )

        assignment_rule.save.assert_called_once_with(ignore_permissions=False)

    def test_trusted_team_save_propagates_to_rotation_member_delete(self):
        team = HDTeam({"doctype": "HD Team"})
        team.flags.ignore_permissions = True
        assignment_rule = MagicMock(disabled=False, name="AirOps - Support Rotation")

        with (
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_value",
                side_effect=["Base Support Rotation", "assignment-rule-user-id"],
            ),
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.get_doc",
                return_value=MagicMock(name="Base Support Rotation"),
            ),
            patch(
                "helpdesk.helpdesk.doctype.hd_team.hd_team.frappe.delete_doc"
            ) as delete_doc,
        ):
            team.update_assignment_rule_users(
                (None, SimpleNamespace(get=lambda key: "agent@example.com")),
                assignment_rule,
            )

        delete_doc.assert_called_once_with(
            "Assignment Rule User",
            "assignment-rule-user-id",
            ignore_permissions=True,
        )
