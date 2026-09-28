import frappe

from helpdesk.setup.install import add_default_agent_status


def execute():
    add_default_agent_status()

    if not frappe.db.has_column("HD Agent", "availability"):
        return

    default_status = frappe.db.get_single_value("HD Settings", "default_agent_status")
    if not default_status:
        return

    frappe.db.sql(
        """
        UPDATE `tabHD Agent`
        SET availability = %s
        WHERE IFNULL(availability, '') = ''
        """,
        (default_status,),
    )
