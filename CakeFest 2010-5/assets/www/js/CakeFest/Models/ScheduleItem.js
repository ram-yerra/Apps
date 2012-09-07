Ext.regModel('ScheduleItem', {
	fields: [
		{name: 'dayNumber', type: 'int'},
		{name: 'day',       type: 'date'},
		{name: 'start',     type: 'string'},
		{name: 'finish',    type: 'string'},
		{name: 'title',     type: 'string'},
		{name: 'subtitle',  type: 'string'},
		{name: 'type',      type: 'string'}
	]
});
