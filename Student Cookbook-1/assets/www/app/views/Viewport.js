CookingApp.views.Viewport = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
	deferredRender: false,

	/* disable animation for Android until the next Sencha Touch update fixes the flickering */
	cardSwitchAnimation: false,


	tabBar: {
		dock: 'bottom',
		layout: {
			pack: 'center'
		}
	},

	defaults: {
		scroll: 'vertical',
		styleHtmlContent: false
	},

	/*listeners: {
		tabchange: function(tp,newTab) {
			alert(1);
			var um = newTab.getUpdater();
			if(um) um.refresh();
		}
	},*/

	items: [
		{ xtype: 'recipecard', scroll: false },
		{ xtype: 'healthcard' },
		{ xtype: 'shoppingcard', styleHtmlContent: true },
		{ xtype: 'tipcard' },
		{ xtype: 'morecard' }
	]
});