CookingApp.views.Shoppingcard = Ext.extend(Ext.Panel, {
	title: 'Shopping',
	id: 'shoppingcard',
	iconCls: 'iconTabShopping',
	scroll: 'vertical',
	dockedItems: [{
		xtype: 'toolbar',
		title: 'Shopping'
	}],
	html: '<h2 class="titleAngle">Smart Shopping</h2><div class="boxAngle"><p>Check out our top 10 tips before you hit the shops!</p><ol><li>Set a budget and stick to it.</li><li class="alt">Plan your meals.</li><li>Write a list and don\'t buy on impulse.</li><li class="alt">Don\'t shop on an empty stomach!</li><li>Check out \'value\' ranges - they can be just as good as premium and cheaper.</li><li class="alt">BOGOF (buy one get one free) and money off vouchers - are you really saving? Will you use them?</li><li>Fruit and veg - tinned &amp; frozen last longer. Buy fresh weekly.</li><li class="alt">Meat and Fish - buy the leanest meat you can afford. Cheaper cuts don\'t mean poor quality - they just need longer to cook.</li><li>Check out the bargains - food is often reduced at the end of the day.</li><li class="alt">Vary your menu so you don\'t get bored eating the same things all the time.</li></ol><p>Sorted - now you\'ve got to store it</p></div>'
});

Ext.reg('shoppingcard', CookingApp.views.Shoppingcard);