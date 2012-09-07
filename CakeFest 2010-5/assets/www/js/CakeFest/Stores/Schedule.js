CakeFest.Store.Schedule = new Ext.data.Store({
	model: 'ScheduleItem',
	sorters: 'day',
	getGroupString: function(record) {
		return record.get('day').format('dddd, dS mmmm');
	},
	data: [
	/**
	 * THURSDAY
	 */
		{
			day:       new Date('2 Sep 2010'),
			start:     '08:00',
			finish:    '08:30',
			title:     'Workshop registration',
			subtitle:  'Register and collect your name badge',
			type:      'break'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '08:30',
			finish:    '10:30',
			title:     'Morning session',
			subtitle:  'Introduction and application design',
			type:      'talk'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '10:30',
			finish:    '11:00',
			title:     'Morning tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '11:00',
			finish:    '12:00',
			title:     'Mid-morning session',
			subtitle:  'Database design, optimization, implementation',
			type:      'talk'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '12:00',
			finish:    '13:00',
			title:     'Lunch',
			subtitle:  'Lunch provided',
			type:      'break'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '13:00',
			finish:    '14:30',
			title:     'Afternoon session',
			subtitle:  'Question and answers, begin build',
			type:      'talk'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '14:30',
			finish:    '15:00',
			title:     'Afternoon tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '15:00',
			finish:    '17:00',
			title:     'Late-afternoon session',
			subtitle:  'Finish application build, and discussion',
			type:      'talk'
		},
		{
			day:       new Date('2 Sep 2010'),
			start:     '17:30',
			finish:    'late',
			title:     'Evening social activities',
			subtitle:  'External social activities announced on the day',
			type:      'social'
		},
	/**
	 * FRIDAY
	 */
		{
			day:       new Date('3 Sep 2010'),
			start:     '08:00',
			finish:    '08:30',
			title:     'Q & A Session (Optional)',
			subtitle:  'Questions, answers from thursdays session',
			type:      'talk'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '08:30',
			finish:    '10:30',
			title:     'Morning session',
			subtitle:  'Optimization: View Caching, DB caching, and more',
			type:      'talk'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '10:30',
			finish:    '11:00',
			title:     'Morning tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '11:00',
			finish:    '12:00',
			title:     'Mid-morning session',
			subtitle:  'Internationalization / Localization',
			type:      'talk'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '12:00',
			finish:    '13:00',
			title:     'Lunch',
			subtitle:  'Lunch provided',
			type:      'break'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '13:00',
			finish:    '14:30',
			title:     'Afternoon session',
			subtitle:  'Advanced techniques, and user experience',
			type:      'talk'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '14:30',
			finish:    '15:00',
			title:     'Afternoon tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '15:00',
			finish:    '17:00',
			title:     'Late-afternoon session',
			subtitle:  'Open session - One on one time, or tutorial on migration to CakePHP 1.3',
			type:      'talk'
		},
		{
			day:       new Date('3 Sep 2010'),
			start:     '17:30',
			finish:    'late',
			title:     'Evening social activities',
			subtitle:  'External social activities announced on the day',
			type:      'social'
		},
	/**
	 * SATURDAY
	 */
		{
			day:       new Date('4 Sep 2010'),
			start:     '08:00',
			finish:    '08:30',
			title:     'Conference registration',
			subtitle:  'Register and collect your name badge',
			type:      'break'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '08:45',
			finish:    '09:45',
			title:     '<strong>CakeTalk:</strong> Re-imagining CakePHP: The path to 2.0',
			subtitle:  'Speaker: Graham Weldon',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '09:45',
			finish:    '10:30',
			title:     'Talk: Using and reusing plugins across CakePHP applications',
			subtitle:  'Speaker: Pierre Martin',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '10:30',
			finish:    '11:00',
			title:     'Morning tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '11:00',
			finish:    '12:00',
			title:     'Talk: How to use MongoDB with CakePHP',
			subtitle:  'Speaker: Yasushi Ichikawa',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '12:00',
			finish:    '13:00',
			title:     'Lunch',
			subtitle:  'Lunch provided',
			type:      'break'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '13:00',
			finish:    '13:45',
			title:     'Talk: CakePHP in Higher Education',
			subtitle:  'Speaker: J. Erik Schaeffer',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '13:45',
			finish:    '14:30',
			title:     'Integrating CakePHP and Drupal (Plumbing with Cake)',
			subtitle:  'Speaker: Mark Tovey',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '14:30',
			finish:    '15:00',
			title:     'Afternoon tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '15:00',
			finish:    '15:45',
			title:     'Talk: Designing CakePHP plugins for consuming APIs',
			subtitle:  'Speaker: Neil Crookes',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '15:45',
			finish:    '16:00',
			title:     'Prizes, Social event announcements, and some surprizes!',
			subtitle:  'Giveaways, sponsor supported prizes and announcements',
			type:      'social'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '16:00',
			finish:    '17:00',
			title:     'Talk: Simplifying heavy client side web applications using CakePHP and Adobe Flash Builder 4',
			subtitle:  'Speaker: Brandon Plasters',
			type:      'talk'
		},
		{
			day:       new Date('4 Sep 2010'),
			start:     '17:00',
			finish:    'late',
			title:     'Evening social activities',
			subtitle:  'External social activities announced on the day',
			type:      'social'
		},
	/**
	 * SUNDAY
	 */
		{
			day:       new Date('5 Sep 2010'),
			start:     '08:00',
			finish:    '08:45',
			title:     '<strong>CakeTalk:</strong> CakePHP Community: The whole is greater than the sum of its parts',
			subtitle:  'Speaker: Larry E. Masters',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '08:45',
			finish:    '09:45',
			title:     '<strong>CakeTalk:</strong> Win at life with Unit testing',
			subtitle:  'Speaker: Mark Story',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '09:45',
			finish:    '10:30',
			title:     'Talk: It\'s easier to ask forgiveness than it is to get ACL permissions!',
			subtitle:  'Speaker: Erik Peterson',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '10:30',
			finish:    '11:00',
			title:     'Morning tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '11:00',
			finish:    '12:00',
			title:     'Talk: Developing an API',
			subtitle:  'Speaker: Andrew Curioso',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '12:00',
			finish:    '13:00',
			title:     'Lunch',
			subtitle:  'Lunch provided',
			type:      'break'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '13:00',
			finish:    '14:30',
			title:     '<strong>Lightning Talks!</strong>',
			subtitle:  'Register on the day to present!',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '14:30',
			finish:    '15:00',
			title:     'Afternoon tea',
			subtitle:  'Refreshments provided',
			type:      'break'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '15:00',
			finish:    '16:00',
			title:     'Talk: CakePHP at massive scale, on a budget',
			subtitle:  'Speaker: Andy Gale',
			type:      'talk'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '16:00',
			finish:    '17:00',
			title:     'Prizes, wrap-up, and networking sessions',
			subtitle:  'Final catch up and more awesome giveaways!',
			type:      'social'
		},
		{
			day:       new Date('5 Sep 2010'),
			start:     '17:00',
			finish:    'late',
			title:     'Home time, or stick around and socialise.',
			subtitle:  'End of CakeFest 2010',
			type:      'social'
		},
	]
});
