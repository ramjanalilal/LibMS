// Copyright (c) 2023, ramjanali and contributors
// For license information, please see license.txt

frappe.ui.form.on('Member', {
    refresh: function(frm) {

    },
    
    verify: function(frm) {
        generateAndVerifyOTP(frm);
    },
    // status_check: function(frm) {
    //     frappe.call({
    //         method: "status_update_from_table",
    //         args: {
    //             member: frm.doc.name
    //         },
    //         callback: function(response) {
    //             if (response.message) {
    //                 frappe.msgprint(response.message); // Show message returned from the server
    //             }
    //         }
    //     });
    // }
});


function generateAndVerifyOTP(frm) {
    var otp = generateOTP();
    frappe.msgprint(__("OTP generated successfully: ") + otp);
    frm.set_value('otp', otp); 
    let d = new frappe.ui.Dialog({
        fields: [
            {
                label: 'OTP',
                fieldname: 'verify_otp',
                fieldtype: 'Data'
            }
        ],
        primary_action_label: 'Verify',
        primary_action: function(values) {
            verifyOTP(frm, otp, values.verify_otp);
            d.hide();
        }
    });
    d.show();
}

function verifyOTP(frm, generatedOTP, enteredOTP) {
    var generatedOTP = frm.doc.otp;
    if (generatedOTP === enteredOTP) {
        frappe.msgprint(__('Verification successful'));
        // Perform additional actions upon successful verification
		
    } else {
        frappe.msgprint(__('Invalid OTP. Please try again.'));
		frm.set_value('mobile', "");
    }
}

function generateOTP() {
    var otp = '';
    var possibleDigits = '0123456789';

    for (var i = 0; i < 6; i++) {
        otp += possibleDigits.charAt(Math.floor(Math.random() * possibleDigits.length));
    }
    return otp;
}


frappe.ui.form.on('Member', {
	refresh: function(frm) {

		frappe.dynamic_link = {doc: frm.doc, fieldname: 'name', doctype: 'Member'};

		frm.toggle_display(['address_html','contact_html'], !frm.doc.__islocal);

		if(!frm.doc.__islocal) {
			frappe.contacts.render_address_and_contact(frm);
			erpnext.utils.set_party_dashboard_indicators(frm);

		} else {
			frappe.contacts.clear_address_and_contact(frm);
		}
        if (!frm.doc.customer) {
            frm.add_custom_button(__('Create Customer'), () => {
                frm.call('make_customer_and_link').then(() => {
                    frm.reload_doc();
                });
            });
        }
	},
    after_save: function(frm) {
        if (!frm.doc.customer) {
            frm.call('make_customer_and_link').then(() => {
                frm.reload_doc();
            });
        }
    }
});
