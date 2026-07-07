# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class HDCustomer(Document):
    @staticmethod
    def default_list_data():
        columns = [
            {
                "label": "Client",
                "key": "customer_name",
                "width": "14rem",
                "type": "Data",
            },
            {
                "label": "Domain",
                "key": "domain",
                "width": "14rem",
                "type": "Data",
            },
            {
                "label": "Serviced By Agent",
                "key": "serviced_by_agent",
                "width": "14rem",
                "type": "Link",
                "options": "HD Agent",
            },
            {
                "label": "Status",
                "key": "status",
                "width": "8rem",
                "type": "Select",
            },
            {
                "label": "Created On",
                "key": "creation",
                "width": "9rem",
                "type": "Datetime",
            },
        ]
        rows = ["name", "customer_name", "domain", "serviced_by_agent", "status", "creation", "image"]
        return {"columns": columns, "rows": rows}
