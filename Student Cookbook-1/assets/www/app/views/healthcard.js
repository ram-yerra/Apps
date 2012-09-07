CookingApp.views.Healthcard = Ext.extend(Ext.NestedList, {
	title: "Health",
	iconCls: "iconTabHealth",
	cardSwitchAnimation: 'slide',

	listeners:{
		activate: function(panel){
		}
	},

	initComponent: function() {
		Ext.apply(this, {
			store: CookingApp.healthStore,
			toolbar:{ui:'dark'},
			getDetailCard: function(item, parent) {
				var itemData = item.attributes.record.data;
				return itemData.card;
			}
		});
		CookingApp.views.Healthcard.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('healthcard', CookingApp.views.Healthcard);