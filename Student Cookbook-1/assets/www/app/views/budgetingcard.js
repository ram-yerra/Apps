CookingApp.views.Budgetingcard = Ext.extend(Ext.Panel, {
	id: 'budgetingcard',
	styleHtmlContent: true,
	scroll: 'vertical',
	html: '<h2 class="titleAngle">Budgeting</h2><div class="boxAngle"><p>Congratulations on passing your exams and becoming a student! For many of you this might be the first time you\'ve got to look after yourself - from doing your own washing to feeding yourself! Living on a tight budget isn\'t easy, you\'ll be juggling your money but buying food and eating healthily is essential.</p><p>With a little help from us and your ingenuity you\'ll be able to cook, eat well and it really is a lot easier and cheaper than you think!</p><p>Whilst budgets are tight, always try and buy the best quality you can.</p><p>It\'s good to know Welsh Lamb &amp; Welsh Beef\'s quality, welfare and safety standards are first class - producing some of the best and tastiest Lamb and Beef money can buy. You can also be reassured the meat really is from Wales.</p></div>'
});

Ext.reg('budgetingcard', CookingApp.views.Budgetingcard);