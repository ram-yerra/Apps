CookingApp.views.Essaydeadlinecard = Ext.extend(Ext.Panel, {
	id: 'essaydeadlinecard',
	styleHtmlContent: true,
	scroll: 'vertical',
	html: '<h2 class="titleAngle">Essay deadline time!</h2><div class="boxAngle"><p>If you are against the clock remember you\'ve still got to eat or you won\'t have energy to meet that deadline. This is when your frozen leftover meal is handy or just rustle up a quick meal within 10 minutes - such as pasta and sauce or Jacket and topping.</p></div>'
});

Ext.reg('essaydeadlinecard', CookingApp.views.Essaydeadlinecard);