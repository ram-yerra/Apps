CookingApp.views.Creditcard = Ext.extend(Ext.Panel, {
	id: 'creditcard',
	styleHtmlContent: true,
	scroll: 'vertical',
	html: '<h2 class="titleAngle">Credits</h2><div class="boxAngle"><p>A special thanks to our Students:<br />Alex, Curtis, Dani, Emma, Hanna, Laura, Lowri, Kirsty & Rob</p><p>Design: VWD Design<br />Styling: Barbara Newman, VWD Design<br />Photography: Phil Boorman<br />Home economist: Elwen Roberts, HCC</p></div>'/*<p>This publication has received funding through the Rural Development Plan for Wales 2007-2013</p>*/
});

Ext.reg('creditcard', CookingApp.views.Creditcard);