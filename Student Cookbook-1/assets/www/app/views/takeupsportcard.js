CookingApp.views.Takeupsportcard = Ext.extend(Ext.Panel, {
	id: 'takeupsportcard',
	styleHtmlContent: true,
	scroll: 'vertical',
	html: '<h2 class="titleAngle">Take up a sport!</h2><div class="boxAngle"><p>Try to take up a sport at Uni - you don\'t have to be good at sport, there\'s so many groups and clubs to choose from, it\'ll help you feel better, look better and it\'s a great way of getting to know other students.</p></div>'
});

Ext.reg('takeupsportcard', CookingApp.views.Takeupsportcard);