CookingApp.views.Recipecard = Ext.extend(Ext.Panel, {
	layout: 'card',
	iconCls: 'home',
	title: 'Home',

	initComponent: function() {
		this.list = new Ext.List({
			itemTpl: '<div class="avatar"<tpl if="bnrSm"> style="background-image: url({bnrSm})"</tpl>></div><span class="title">{subTitle}<tpl if="difficulty"><br /><span class="secondary">{title}</tpl></span>',
			store: 'RecipeStore',
			listeners: {
				selectionchange: {fn: this.onSelect, scope: this}
			}
		});

		this.listpanel = new Ext.Panel({
			layout: 'fit',
			items: this.list,
			dockedItems: [{
				xtype: 'toolbar',
				title: 'Recipes'
			}],
			listeners: {
				activate: {
					fn: function(){
						this.list.getSelectionModel().deselectAll();
						Ext.repaint();
					},
					scope: this
				}
			}
		});

		this.items = this.listpanel;

		CookingApp.views.Recipecard.superclass.initComponent.call(this);
	},

	onSelect: function(sel, records){
		if(records[0] !== undefined) {
			var bioCard = new CookingApp.views.RecipeDetail({
				prevCard: this.listpanel,
				record: records[0]
			});

			//this.setActiveItem(bioCard, 'slide');

			/* disable animation for Android until the next Sencha Touch update fixes the flickering */
			this.setActiveItem(bioCard);
		}
	}
});

Ext.reg('recipecard', CookingApp.views.Recipecard);