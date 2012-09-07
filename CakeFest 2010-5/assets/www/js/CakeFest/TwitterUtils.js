String.prototype.twitterLinks = function() {
	var tweet = this.replace(/(^|\s)@(\w+)/g, '$1<a class="user" href="http://www.twitter.com/$2">@$2</a>');
	return tweet.replace(/(^|\s)#(\w+)/g, '$1<a class="hashtag" href="http://search.twitter.com/search?q=%23$2">#$2</a>');
};

String.prototype.twitterRelativeTime = function() {
	var curDate = new Date();
	var now = curDate - curDate.getTimezoneOffset() / 60;
	var tweetTime = Date.parse(this);
	var diff = (now - tweetTime) / 1000;
	var str = '';
	if (diff < 60) {
		str = parseInt(diff) + ' seconds ago';
	}
	else if (diff < 60 * 60) {
		str = parseInt(diff / 60) + ' minutes ago';
	}
	else if (diff < 60 * 60 * 1.5) {
		str = 'an hour ago';
	}
	else if (diff < 60 * 60 * 23) {
		str = Math.round(diff / 60 / 60) + ' hours ago';
	}
	else if (diff < 60 * 60 * 1.5) {
		str = 'an hour ago';
	}
	else if (diff < 60 * 60 * 24 * 1.5) {
		str = 'one day ago';
	}
	else {		
		var dateArr = this.split(' ');
		str = dateArr[2] + ' ' + dateArr[1] + (dateArr[3] != curDate.getFullYear() ? ' ' + dateArr[3] : '') + ' at ' + dateArr[4].replace(/\:\d+$/, '');
	}
	return str;
};