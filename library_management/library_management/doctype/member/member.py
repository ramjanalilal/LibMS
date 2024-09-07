import frappe
from frappe import _
from frappe.contacts.address_and_contact import load_address_and_contact
from frappe.model.document import Document
from frappe.utils import get_link_to_form

class Member(Document):
    def onload(self):
        """Load address and contacts in `__onload`"""
        load_address_and_contact(self)

    def validate_email_type(self, email):
        from frappe.utils import validate_email_address
        validate_email_address(email.strip(), True)

    def validate(self):
        self.member_name = f'{self.first_name} {self.middle_name or ""} {self.last_name or ""}'
        if self.email_id:
            self.validate_email_type(self.email_id)
            
    @frappe.whitelist()
    def make_customer_and_link(self):
        if self.customer:
            frappe.msgprint(_("A customer is already linked to this Member"))
            return

        customer = create_customer(frappe._dict({
            'fullname': self.member_name,
            'email': self.email_id,
            'phone': None,
            'mobile': self.mobile,
            'member': self.name,
        }))

        self.customer = customer
        self.save()
        frappe.msgprint(_("Customer {0} has been created successfully.").format(self.customer))


def get_or_create_member(user_details):
    member_list = frappe.get_all("Member", filters={'email': user_details.email, 'membership_type': user_details.plan_id})
    if member_list:
        frappe.msgprint()
        return member_list[0]['name']
    else:
        return create_member(user_details)

def create_member(user_details):
    user_details = frappe._dict(user_details)
    member = frappe.new_doc("Member")
    member.update({
        "member_name": user_details.fullname,
        "email_id": user_details.email,
        "pan_number": user_details.pan or None,
        "membership_type": user_details.plan_id,
        "customer_id": user_details.customer_id or None,
        "subscription_id": user_details.subscription_id or None,
        "subscription_status": user_details.subscription_status or ""
    })

    member.insert(ignore_permissions=True)
    member.customer = create_customer(user_details, member.name)
    member.save(ignore_permissions=True)

    return member

def create_customer(user_details, member=None):
    frappe.msgprint(f"Details: {user_details}")
    member = user_details.member
    customer = frappe.new_doc("Customer")
    customer.customer_name = user_details.fullname
    customer.member = member
    customer.customer_type = "Individual"
    customer.customer_group = frappe.db.get_single_value("Library Setting", "customer_group")
    customer.territory = frappe.db.get_single_value("Selling Settings", "territory")
    customer.flags.ignore_mandatory = True
    customer.insert(ignore_permissions=True)

    try:
        frappe.db.savepoint("contact_creation")
        contact = frappe.new_doc("Contact")
        contact.first_name = user_details.fullname
        if user_details.mobile:
            contact.add_phone(user_details.mobile, is_primary_phone=0, is_primary_mobile_no=1)
        if user_details.email:
            contact.add_email(user_details.email, is_primary=1)
        contact.insert(ignore_permissions=True)

        contact.append("links", {
            "link_doctype": "Customer",
            "link_name": customer.name
        })

        if member:
            frappe.msgprint(f"Appending Member link")
            contact.append("links", {
                "link_doctype": "Member",
                "link_name": member
            })

        contact.save(ignore_permissions=True)

    except frappe.DuplicateEntryError:
        return customer.name

    except Exception as e:
        frappe.db.rollback(save_point="contact_creation")
        frappe.log_error(frappe.get_traceback(), _("Contact Creation Failed"))

    return customer.name

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
