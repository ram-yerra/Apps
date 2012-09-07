Ext.ns('CakeFest', 'CakeFest.Views', 'CakeFest.Store', 'CakeFest.Dates');

Ext.setup({
	phoneStartupScreen: 'images/startup/phone.png',
	glossOnIcon: false,
	onReady: function() {
		var panel = new Ext.TabPanel({
			tabBar: {
				dock: 'bottom',
				layout: {
					pack: 'center'
				}
			},
			fullscreen: true,
			animation: 'cube',
			items: [
				CakeFest.Views.Schedule,
				CakeFest.Views.Tweets,
				CakeFest.Views.Map,
				CakeFest.Views.Sponsors,
				CakeFest.Views.Information
			]
		});
	}
});

function onBodyLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
}
