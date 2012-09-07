CookingApp.views.Morecard = Ext.extend(Ext.NestedList, {
	title: "More",
	iconCls: "more",
	cardSwitchAnimation: 'slide',

	listeners:{
		activate: function(panel){
			//alert(panel);
			// on render activate the list
			//panel.getLayout().setActiveItem(1);
			//this.setActiveItem(1);
		}
	},

	initComponent: function() {
		Ext.apply(this, {
			store: CookingApp.moreStore,
			toolbar:{ui:'dark'},
			getDetailCard: function(item, parent) {
				var itemData = item.attributes.record.data;
				return itemData.card;
			}
		});
		//CookingApp.views.Morecard.setRootActive();
		CookingApp.views.Morecard.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('morecard', CookingApp.views.Morecard);