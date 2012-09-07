CookingApp.linkStore = new Ext.regStore('LinkStore', {
	model: 'LinkListItem',
	styleHtmlContent:false,
	getGroupString: function(record) {
		return record.get('title')[0];
	},
	sorters: [{
			property: 'id',
			direction: 'ASC'
	}],
	proxy: {
			type: 'localstorage',
			id: 'cooking-app-localstore-link'
	},

	data: [
		{
			id: 1,
			title: 'For more recipes for students and information visit<br /><span class="linkItem">firstdegreecooking.org.uk</span>',
			icon: 'resource/globe.png',
			url:'http://www.firstdegreecooking.org.uk'
		},
		{
			id: 2,
			title: 'For great recipes visit<br /><span class="linkItem">eatwelshlamb.com</span>',
			icon: 'resource/globe.png',
			url:'http://www.eatwelshlamb.com'
		},
		{
			id: 3,
			title: 'For other recipes visit<br /><span class="linkItem">eatwelshbeef.com</span>',
			icon: 'resource/globe.png',
			url:'http://www.eatwelshbeef.com'
		},
		{
			id: 4,
			title: 'See us on YouTube',
			icon: 'resource/logo-youtube.png',
			url:'http://www.youtube.com/user/PGIWelshLamb'
		},
		{
			id: 5,
			title: 'Find us on Facebook',
			icon: 'resource/logo-facebook.png',
			url:'http://www.facebook.com/WelshLamb'
		},
		{
			id: 6,
			title: 'Follow us on Twitter',
			icon: 'resource/logo-twitter.png',
			url:'http://twitter.com/WelshLamb_PGI'
		}
	]
});