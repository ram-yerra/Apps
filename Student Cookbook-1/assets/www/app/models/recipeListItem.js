Ext.regModel('RecipeListItem', {
	idProperty: 'id',
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'title', type: 'string' },
		{ name: 'subTitle', type: 'string' },
		{ name: 'titleBgCol', type: 'string' },
		{ name: 'titleTxtCol', type: 'string' },
		{ name: 'titleSubTxtCol', type: 'string' },
		{ name: 'tabCls', type: 'string' },
		{ name: 'bnr', type: 'string' },
		{ name: 'summaryTitle', type: 'string' },
		{ name: 'summary', type: 'string' },
		{ name: 'people', type: 'string' },
		{ name: 'peopleText', type: 'string' },
		{ name: 'cookingTime', type: 'string' },
		{ name: 'cookingTimeText', type: 'string' },
		{ name: 'cost', type: 'string' },
		{ name: 'ingredients', type: 'string' },
		{ name: 'method', type: 'string' },
		{ name: 'difficulty', type: 'int' }
	],
	validations: [
		{ type: 'presence', field: 'id' },
		{ type: 'presence', field: 'title' },
		{ type: 'presence', field: 'tabCls' },
		{ type: 'presence', field: 'summary' },
		{ type: 'presence', field: 'cost' },
		{ type: 'presence', field: 'ingredients' },
		{ type: 'presence', field: 'method' },
		{ type: 'presence', field: 'difficulty' }
	]
});