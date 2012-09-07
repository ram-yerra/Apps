CookingApp.views.Cookingreheatingcard = Ext.extend(Ext.Panel, {
	id: 'cookingreheatingcard',
	styleHtmlContent: true,
	scroll: 'vertical',
	html: '<h2 class="titleAngle">Cooking and reheating food</h2><div class="boxAngle"><ul><li>Always ensure cooked food is piping hot in the centre.</li><li>Always defrost meat before cooking.</li><li>When re-heating food make sure it\'s piping hot in the centre and remember you can only re-heat food ONCE.</li></ul></div>'
});

Ext.reg('cookingreheatingcard', CookingApp.views.Cookingreheatingcard);