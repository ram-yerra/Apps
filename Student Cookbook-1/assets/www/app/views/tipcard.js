CookingApp.views.Tipcard = Ext.extend(Ext.NestedList, {
	title: "Tips",
	iconCls: "iconTabRecipe",
	cardSwitchAnimation: 'slide',

	listeners:{
		activate: function(panel){
		}
	},

	initComponent: function() {
		Ext.apply(this, {
			store: CookingApp.tipStore,
			toolbar:{ui:'dark'},
			getDetailCard: function(item, parent) {
				var itemData = item.attributes.record.data;
				return itemData.card;
			}
		});
		CookingApp.views.Tipcard.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('tipcard', CookingApp.views.Tipcard);