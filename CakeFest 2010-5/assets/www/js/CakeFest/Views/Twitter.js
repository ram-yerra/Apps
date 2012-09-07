// Extend the Component class to integrate a twitter refresh function and basic template.
CakeFest.Views.Twitter = Ext.extend(Ext.Component, {
	scroll: 'vertical',
	tpl: [
		'<tpl for=".">',
			'<div class="tweet">',
				'<div class="avatar"><img src="{profile_image_url}" /></div>',
				'<div class="tweet-content">',
					'<h2>{from_user}</h2>',
					'<p>{text}</p>',
					'<p class="time">{created_at}</p>',
				'</div>',
			'</div>',
		'</tpl>'
	],
	refresh: function() {
		Ext.util.JSONP.request({
			url: 'http://search.twitter.com/search.json',
			params: {
				q: '#cakefest',
				rpp: 55
			},
			callbackKey: 'callback',
			callback: function(data) {
				data = data.results;
				for (var i = 0; i < data.length; i++) {
					data[i].text = data[i].text.twitterLinks();
					data[i].created_at = data[i].created_at.twitterRelativeTime();
				}
				CakeFest.Views.Tweets.update(data);
			}
		});
	}
});

CakeFest.Views.Tweets = new CakeFest.Views.Twitter({
	title: 'Tweets',
	iconCls: 'user',
	cls: 'twitter',
});

// Grab the initial list of tweets on app launch
CakeFest.Views.Tweets.on('beforeRender', function(e) {
	CakeFest.Views.Tweets.refresh();
});

// Refresh the tweets each time the window becomes the active window
CakeFest.Views.Tweets.on('beforeShow', function(e) {
	CakeFest.Views.Tweets.refresh();
});
