Ext.regModel('LinkListItem', {
	idProperty: 'id',
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'title', type: 'string' },
		{ name: 'icon', type: 'string' },
		{ name: 'url', type: 'string' }
	],
	validations: [
		{ type: 'presence', field: 'id' },
		{ type: 'presence', field: 'title' },
		{ type: 'presence', field: 'icon' },
		{ type: 'presence', field: 'url' }
	]
});