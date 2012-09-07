CookingApp.views.Linkcard = Ext.extend(Ext.Panel, {
	id: 'linkcard',
	styleHtmlContent: true,
	scroll: 'vertical',
	layout:'fit',
	styleHtmlContent:false,

	initComponent: function() {
		this.list = new Ext.List({
			itemTpl: '<a href="{url}" target="_blank"><span class="avatar"<tpl if="icon"> style="background-image: url({icon})"</tpl>></span><span class="title">{title}</span></a>',
			store: 'LinkStore'/*,
			listeners:{
				itemTap:function(dataView,index, item, e) {
					var thisData = dataView.store.getAt(index);
					location.href=thisData.data.url;
				}
			}*/
		});

		this.listpanel = new Ext.Panel({
			layout: 'fit',
			items: this.list,
			dockedItems: [{
				xtype: 'toolbar',
				title: 'Links',
				ui:'light'
			}]
		});

		this.items = this.listpanel;

		CookingApp.views.Linkcard.superclass.initComponent.call(this);
	}
});

Ext.reg('linkcard', CookingApp.views.Linkcard);