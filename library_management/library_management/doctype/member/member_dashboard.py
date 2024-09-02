from frappe import _


def get_data():
	return {
		'heatmap': True,
		'heatmap_message': _('Member Activity'),
		'fieldname': 'member',
		# 'non_standard_fieldnames': {
		# 	'Bank Account': 'party'
		# },
        'Book Ledger': 'book_ledger',
		'transactions': [
			{
				'label': _('Library Membership'),
				'items': ['Library Membership']
			},
            {
                'label': _('Book Transaction'),
				'items': ['Book Transaction']
            }
		]
	}
