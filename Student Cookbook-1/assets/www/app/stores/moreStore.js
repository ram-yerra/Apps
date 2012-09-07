CookingApp.moreStore = new Ext.data.TreeStore({
	model: 'GeneralListItem',
	root: {
		items: [{
			text: 'About',
			card: {xtype: 'aboutcard'},
			leaf: true
		},
		{
			text: 'Links',
			card: {xtype: 'linkcard'},
			leaf: true
		},
		{
			text: 'Credits',
			card: {xtype: 'creditcard'},
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