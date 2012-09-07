CookingApp.views.RecipeDetail = Ext.extend(Ext.Panel, {
	id: 'recipeDetailPanelOuter',
	layout: 'fit',
	initComponent: function(){
		this.recipeDetailPanel = new Ext.Panel({
			id: 'recipeDetailPanel',
			styleHtmlContent: true,
			layout: 'fit',

			dockedItems: [
				{
					data: this.record.data,
					flex:1,
					tpl: [
						'<div class="overview" style="background:#{titleBgCol};">',
							'<div class="overviewInr" style="background-image:url({bnr})">',
								'<h2 style="color:#{titleTxtCol};">{title}</h2>',
								'<div<tpl if="titleSubTxtCol"> style="color:#{titleSubTxtCol}"</tpl>>',
									'Easy to make: <tpl if="difficulty==1"><span class="difficulty difficultySel"></span><span class="difficulty"></span><span class="difficulty"></span></tpl><tpl if="difficulty==2"><span class="difficulty difficultySel"></span><span class="difficulty difficultySel"></span><span class="difficulty"></span></tpl><tpl if="difficulty==3"><span class="difficulty difficultySel"></span><span class="difficulty difficultySel"></span><span class="difficulty difficultySel"></span></tpl><br />',
								'</div>',
							'</div>',
							'<div class="clear"></div>',
						'</div>'
					]
				}],


			items: [
				new Ext.TabPanel({
					id: 'recipeDetailTabPanel',
					styleHtmlContent: true,
					data: this.record.data,
					layout:'fit',
					cls: this.record.data.tabCls,

					/* disable animation for Android until the next Sencha Touch update fixes the flickering */
					cardSwitchAnimation: false,

					tabBar: {ui: 'light'},

					items: [
						{
							title: 'Summary',
							id: 'summaryTab',
							scroll: 'vertical',
							data: this.record.data,
							tpl: [
								'<div class="recipeTabContent"><tpl if="cost"><h3 class="titleAngle">Rough Cost</h3><div class="boxAngle">{cost}</div></tpl><h3 class="titleAngle"><tpl if="summaryTitle">{summaryTitle}</tpl><tpl if="!summaryTitle">Summary</tpl></h3><div class="boxAngle">{summary}</div></div>'
							]
						},
						{
							title: 'Ingredients',
							id: 'ingredientsTab',
							scroll: 'vertical',
							data: this.record.data,
							tpl: [
								'<div class="recipeTabContent">',
									'<tpl if="people"><h3 class="titleAngle">Serves:</h3><div class="boxAngle">{people}<tpl if="peopleText"> {peopleText}</tpl></div></tpl>',
									'<tpl if="cookingTime"><h3 class="titleAngle">Cooking time:</h3><div class="boxAngle">{cookingTime}<tpl if="cookingTimeText"> {cookingTimeText}</tpl></div></tpl>',
									'<h3 class="titleAngle">Ingredients:</h3><div class="boxAngle">{ingredients}</div>',
								'</div>'
							]
						},

						{
							title: 'Method',
							id: 'methodTab',
							scroll: 'vertical',
							data: this.record.data,
							tpl: ['<div class="recipeTabContent">{method}</div>']
						}
					]
				})

			],
		});

		this.items = [this.recipeDetailPanel];

		this.dockedItems = [{
			xtype: 'toolbar',
			title: 'Recipes',
			items: [{
				ui: 'back',
				text: 'Back',
				scope: this,
				handler: function(){
					/*this.ownerCt.setActiveItem(this.prevCard, {
						type: 'slide',
						reverse: true,
						scope: this,
						after: function(){
							this.destroy();
						}
					});*/

					/* disable animation for Android until the next Sencha Touch update fixes the flickering - issue is that the item won't be destroyed */
					this.ownerCt.setActiveItem(this.prevCard);
				}
			}]
		}];

		CookingApp.views.RecipeDetail.superclass.initComponent.call(this);
	}
});

Ext.reg('recipedetail', CookingApp.views.RecipeDetail);