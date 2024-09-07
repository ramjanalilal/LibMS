# Copyright (c) 2024, ramjanali and contributors
# For license information, please see license.txt

import frappe
from frappe.website.website_generator import WebsiteGenerator

class Book(WebsiteGenerator):
    def validate(self):
        # Uncomment the line below to create an item when the book is saved
        # self.create_item_from_book()
        #frappe.msgprint("Validation successful")
        self.create_item_from_book()
        
    def create_item_from_book(self):
        if self.is_new():
            frappe.msgprint("Creating Item from Book")
            category = frappe.get_value('Library Setting', 'default_asset_category','default_asset_category')
            asset_naming = frappe.get_value('Library Setting', 'asset_naming_series','asset_naming_series')
            if not category:
                frappe.throw("Default asset category is not set in Library Settings.")
                
            item_doc = frappe.get_doc({
                'doctype': 'Item',
                'item_code': self.name,
                'item_name': self.book_title,
                'item_group': self.book_category,
                'is_stock_item': 0,
                'include_item_in_manufacturing': 0,
                'is_fixed_asset': 1,
                'auto_create_assets': 1,
                'asset_naming_series': asset_naming,
                'asset_category': category,
                'is_sales_item': 0
            })
            item_doc.insert()
            self.item_name = item_doc.name
            frappe.msgprint("Item created successfully")

