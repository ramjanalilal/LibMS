// Copyright (c) 2024, ramjanali and contributors
// For license information, please see license.txt

frappe.ui.form.on('Library Membership', {
	refresh(frm) {
        // filter applied on 'New','Active','Current','Expired','Pending','Cancelled'
        frm.set_query('member', function(doc) {
            var status_list = ['New','Active','Expired','Pending','Cancelled'];
            return {
                filters: [
                    ['membership_status', 'in', status_list]
                ]
            };
        });
        frm.set_query("library_service_plan", "library_membership_details", function (doc, cdt, cdn) {
            const child = locals[cdt][cdn];
            return {
                query: "library_management.library_management.doctype.library_membership.library_membership.get_service_plans",
                filters: {
                    'library_service': child.library_service
                }
            }
        });
    },
    onload(frm) {
        frm.set_query("library_service_plan", "library_membership_details", function (doc, cdt, cdn) {
            const child = locals[cdt][cdn];
            return {
                query: "library_management.library_management.doctype.library_membership.library_membership.get_service_plans",
                filters: {
                    'library_service': child.library_service
                }
            }
        });  
    },
    expired(frm) {
        frappe.call({
            method: "library_management.library_management.doctype.library_membership.library_membership.auto_expire_memberships",
            args: {
                member: frm.doc.member
            },
            callback: function(data) {
                
            }
        });
    }
});

frappe.ui.form.on('Library Membership Details', {
    library_service_plan: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (child.library_service_plan && child.library_service) {
            // Call the server-side method to get days and amount
            frappe.call({
                method: "library_management.library_management.doctype.library_membership.library_membership.get_service_plan_details",
                args: {
                    'library_service_plan': child.library_service_plan,
                    'library_service': child.library_service
                },
                callback: function(r) {
                    if (r.message) {
                        // Set the fetched values to fields in the child table
                        frappe.model.set_value(cdt, cdn, 'days', r.message.days);
                        frappe.model.set_value(cdt, cdn, 'amount', r.message.amount);
                        var due = frappe.datetime.add_days(frm.doc.from_date, r.message.days);
                        frappe.model.set_value(cdt, cdn, 'due_date', due);
                    } else {
                        console.warn('No details found for the selected Library Service Plan and Library Service.');
                    }
                }
            });
        }
    },
    from_date: function (frm, cdt, cdn) {
        var child_doc = locals[cdt][cdn];
        var day = child_doc.days;
        var due = frappe.datetime.add_days(child_doc.from_date, day);
        frappe.model.set_value(cdt, cdn, 'due_date', due);
    },
    library_membership_details_add: function(frm, cdt, cdn) {
        calculate_total_amount(frm, amount);
        //console.log("amount")
    },

    // Trigger this function when the amount field is changed
    amount: function(frm, cdt, cdn) {
        calculate_total_amount(frm);
    }
});


function calculate_total_amount(frm) {
    let amount = 0;

    // Loop through each row in the child table
    frm.doc.library_membership_details.forEach(function(row) {
        amount += row.amount;
    });

    // Set the total amount in a field in the parent doctype (e.g., total_amount)
    frm.set_value('amount', amount);
}