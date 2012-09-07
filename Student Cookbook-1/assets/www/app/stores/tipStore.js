CookingApp.tipStore = new Ext.data.TreeStore({
	model: 'GeneralListItem',
	root: {
		items: [{
			text: 'Store it!',
			card: {xtype: 'storeitcard'},
			leaf: true
		},
		{
			text: 'Don\'t panic!',
			card: {xtype: 'dontpaniccard'},
			leaf: true
		},
		{
			text: 'Stock up!',
			card: {xtype: 'stockupcard'},
			leaf: true
		},
		{
			text: 'Cooking &amp; reheating food',
			card: {xtype: 'cookingreheatingcard'},
			leaf: true
		},
		{
			text: 'Budgeting',
			card: {xtype: 'budgetingcard'},
			leaf: true
		}],
	},
	proxy: {
		type: 'ajax',
		reader: {
			type: 'tree',
			root: 'items'
		}
	}
});