import frappe
from frappe.model.document import Document
from frappe.contacts.address_and_contact import (
	delete_contact_and_address,
	load_address_and_contact,
)

class Member(Document):
    def validate(self):
        self.member_name = f'{self.first_name} {self.middle_name or ""} {self.last_name or ""}'
        self.create_customer_from_member()

    def create_customer_from_member(self):
        if self.is_new():
            customer_doc = frappe.get_doc({
                'doctype': 'Customer',
                'customer': self.name,
                'customer_name': self.member_name
                
            })
            frappe.msgprint("Customer created successfully")
            customer_doc.insert()

@frappe.whitelist()
def update_all_members_status():
    # Fetch all members
    all_members = frappe.get_all('Member', fields=['name'])

    for member in all_members:
        memberships = frappe.get_all('Membership Details',
                                     filters={'parent': member['name']},
                                     fields=['membership_status'])

        # Check if all statuses are "Expired"
        if memberships and all(mm['membership_status'] == "Expired" for mm in memberships):
            # Update the parent Member's status to "Expired"
            frappe.db.set_value('Member', member['name'], 'membership_status', 'Expired')
            frappe.msgprint(f"Member {member['name']} status updated to Expired.")
        else:
            frappe.msgprint(f"Member {member['name']} has active memberships.")


