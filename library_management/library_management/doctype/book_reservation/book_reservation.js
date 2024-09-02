// Copyright (c) 2024, ramjanali and contributors
// For license information, please see license.txt

frappe.ui.form.on('Book Reservation', {
    refresh(frm) {
        frm.set_query('member', function (doc) {
            return {
                filters: {
                    'membership_status': 'Active'
                }
            }
        });
    },
    member: function(frm) {
        if (frm.doc.member) {
            frappe.call({
                method: "library_management.library_management.doctype.book_reservation.book_reservation.count_books_issued",
                args: {
                    member: frm.doc.member
                },
                callback: function(response) {
                    if (response.message) {
                        frm.set_value('issued_book', response.message.count);
                    } else {
                        frappe.msgprint(__('Error fetching books count'));
                    }
                }
            });
        } else {
            frm.set_value('issued_book', 0);
        }
    },
    book: function(frm) {
        if (frm.doc.book) {
            // Fetch all assets related to the given item code
            frappe.db.get_list('Asset', {
                filters: { item_code: frm.doc.book},
                fields: ['name','asset_name','status']
            }).then(book => {
                // Clear existing data in the child table
                frm.clear_table('book_reservation_details');

                // Add a new row for each asset related to the item code to the child table
                book.forEach(asset => {
                    let row = frappe.model.add_child(frm.doc, 'Book Reservation Details', 'book_reservation_details');
                    row.access_no = asset.name;
                    row.book_name = asset.asset_name;
                    row.book_status = asset.status;
                });
                // Refresh the child table
                frm.refresh_field('book_reservation_details');

                // Optional: Show a message
                //frappe.msgprint(__('Fetched {0} assets', [book.length]));
            });
        }
    },
    before_save: function(frm) {
        let has_available_book = false;

        // Check if any book has the status 'Available'
        frm.doc.book_reservation_details.forEach(function(row) {
            if (row.book_status === 'Available') {
                has_available_book = true;
            }
        });

        // If there is any book with status 'Available', prevent submission
        if (has_available_book) {
            frappe.msgprint(__('You cannot submit this reservation because one or more books are available.'));
            frappe.validated = false; // Prevent submission
        }
    },
    after_save: function(frm) {
        // Set the field 'status' to read-only after saving
        frm.set_df_property('book', 'read_only', 1);
        frm.refresh_field('book');  // Refresh the field to apply the change
    }
});