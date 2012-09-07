CookingApp.healthStore = new Ext.data.TreeStore({
/*CookingApp.healthStore = new Ext.regStore('HealthStore', {*/
	model: 'GeneralListItem',
	root: {
		items: [{
			text: 'Clean it!',
			card: {xtype: 'cleanitcard'},
			leaf: true
		},
		{
			text: 'Balance it!',
			card: {xtype: 'balanceitcard'},
			leaf: true
		},
		{
			text: 'Essay deadline time!',
			card: {xtype: 'essaydeadlinecard'},
			leaf: true
		},
		{
			text: 'Take up a sport!',
			card: {xtype: 'takeupsportcard'},
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