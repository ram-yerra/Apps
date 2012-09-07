CakeFest.Views.Schedule = new Ext.Panel({
	title: 'Schedule',
	iconCls: 'time',
	cls: 'schedule',
	layout: 'fit',
	items: [{
		xtype: 'list',
		store: CakeFest.Store.Schedule,
		grouped: true,
		indexBar: false,
		itemSelector: 'div.schedule',
		tpl: [
			'<tpl for=".">',
				'<div class="schedule {type}">',
					'<div class="time">',
						'<div class="start">{start}</div>',
						'<div class="finish">till {finish}</div>',
					'</div>',
					'<div class="content">',
						'<div class="title">{title}</div>',
						'<div class="subtitle">{subtitle}</div>',
					'</div>',
				'</div>',
			'</tpl>'
		]
	}]
});

CakeFest.Views.Schedule.on('activate', function(schedule) {
});