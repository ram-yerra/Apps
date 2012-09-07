CakeFest.Views.Sponsors = new Ext.Panel({
	title: 'Sponsors',
	iconCls: 'heart',
	cls: 'list',
	layout: 'fit',
	items: [{
		xtype: 'list',
		store: CakeFest.Store.SponsorStore,
		grouped: true,
		indexBar: false,
		itemSelector: 'div.sponsor',
		tpl: [
			'<tpl for=".">',
				'<div class="sponsor">',
					'<a href="{url}"><img src="{logo}" alt="{name}"/></a>',
					'<div class="name">{name}</div>',
					'<div class="url">{url}</div>',
				'</div>',
			'</tpl>'
		]
	}]
});