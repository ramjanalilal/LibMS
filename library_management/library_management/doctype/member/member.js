// Copyright (c) 2023, ramjanali and contributors
// For license information, please see license.txt


//frappe.ui.form.on("Member", "member_contact", function(frm, cdt, cdn) {
//			return {
//				filters: {
//					'link_doctype': 'Member',
//					'link_name': doc.name
//				}
//			}
//		})
//		frm.set_query('member_contact', function(doc) {
//			return {
//				filters: {
//					'link_doctype': 'Member',
//					'link_name': doc.name
//				}
//			}
//		})
//	}																	

// frappe.ui.form.on('Member', {
// 	refresh(frm) {
// 		frm.set_query('member_address', function(doc) {
// 			return {
// 				filters: {
// 					'link_doctype': 'Member',
// 					'link_name': doc.name
// 				}
// 			}
// 		})
// 		frm.set_query('member_contact', function(doc) {
// 			return {
// 				filters: {
// 					'link_doctype': 'Member',
// 					'link_name': doc.name
// 				}
// 			}
// 		})
// 	},
// 	verify:function(frm){
// 		var otp = generateOTP();
//         //frm.set_value('otp', otp);
//         frappe.msgprint(__("OTP generated successfully: ") + otp);
// 		let d = new frappe.ui.Dialog({
// 			fields: [
// 				{
// 					label: 'OTP',
// 					fieldname: 'verify_otp',
// 					fieldtype: 'Data'
// 				}
// 			],
// 			primary_action_label: 'Save',
// 			primary_action(values) {
// 				verify_mobile(frm, values.verify_otp); // Pass the entered OTP to the function
// 				d.hide();
// 			}
// 		});
// 		d.show();
// 		function verify_mobile(frm, enteredOTP) {
// 			var generatedOTP = frm.doc.verify_otp;
// 			if (generatedOTP === enteredOTP) {
// 				frappe.msgprint(__('Verify Member'));
// 			} else {
// 				frappe.msgprint(__('Enter Valid OTP'));
// 			}
// 		}
// 	}
// });



// function generateOTP() {
//     var otp = '';
//     var possibleDigits = '0123456789';

//     for (var i = 0; i < 6; i++) {
//         otp += possibleDigits.charAt(Math.floor(Math.random() * possibleDigits.length));
//     }
//     return otp;
// }

frappe.ui.form.on('Member', {
    refresh: function(frm) {
        // Add "Verify" button to the toolbar
        // frm.add_custom_button(__('Verify'), function() {
        //     generateAndVerifyOTP(frm);
        // });
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
    //         callback: function(data) {
    //             // console.log(data);
    //         }
    //     });
    // },
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

