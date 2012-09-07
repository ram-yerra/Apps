CookingApp = new Ext.Application({
	name: 'CookingApp',

	launch: function() {
		//The message box will stay at the height of the first display of it, so call this after each display to destroy the message box
		resetMsgBox = function() {
			Ext.Msg = new Ext.MessageBox();
			Ext.Msg.on({
				hide: function(component) { component.destroy(); },
				destroy: function(component) { resetMsgBox(); }
			});
		}

		this.views.viewport = new this.views.Viewport();
	}
});