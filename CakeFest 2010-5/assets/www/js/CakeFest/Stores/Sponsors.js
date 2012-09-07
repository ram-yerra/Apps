CakeFest.Store.SponsorStore = new Ext.data.Store({
	model: 'Sponsor',
	sorters: 'levelNumber',
	getGroupString: function(record) {
		return record.get('level');
	},
	data: [
		{
			name:        'Cake Development Corporation',
			url:         'http://cakedc.com',
			logo:        'images/sponsors/cakedc.png',
			level:       'Diamond',
			levelNumber: 1
		},
		{
			name:        'Microsoft',
			url:         'http://microsoft.com',
			logo:        'images/sponsors/microsoft.png',
			level:       'Gold',
			levelNumber: 2
		},
		{
			name:        'O\'Reilly Media',
			url:         'http://oreilly.com',
			logo:        'images/sponsors/oreilly.png',
			level:       'Silver',
			levelNumber: 3
		},
		{
			name:        'Widget Press',
			url:         'http://widgetpress.com',
			logo:        'images/sponsors/widget_press.png',
			level:       'Silver',
			levelNumber: 3
		},
		{
			name:        'Github',
			url:         'http://github.com',
			logo:        'images/sponsors/github.png',
			level:       'Silver',
			levelNumber: 3
		},
		{
			name:        'Loadsys',
			url:         'http://loadsys.com',
			logo:        'images/sponsors/loadsys.png',
			level:       'Exhibitor',
			levelNumber: 10
		},
		{
			name:        'Fluid Lino Creative',
			url:         'http://fluidlino.com.au',
			logo:        'images/sponsors/FL_Logo_266x112.png',
			level:       'Sponsor',
			levelNumber: 15
		},
		{
			name:        'ActiveState',
			url:         'http://activestate.com',
			logo:        'images/sponsors/activestate.png',
			level:       'Sponsor',
			levelNumber: 15
		},
		{
			name:        'Affilorama',
			url:         'http://affilorama.com',
			logo:        'images/sponsors/affilorama_white.png',
			level:       'Sponsor',
			levelNumber: 15
		},
		{
			name:        'Traffic Travis',
			url:         'http://traffictravis.com',
			logo:        'images/sponsors/tt_white.png',
			level:       'Sponsor',
			levelNumber: 15
		},
		{
			name:        'Guestlist',
			url:         'http://guestlistapp.com',
			logo:        'images/sponsors/guestlist.png',
			level:       'Sponsor',
			levelNumber: 15
		}
	]
});