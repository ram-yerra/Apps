Ext.namespace("BVApp", "BVApp.views", "BVApp.models", "BVApp.templates", "BVApp.utils", "BVApp.data");
BVApp.Main = {
    ui: null,
    errorEMail: "bvapp@berlin-vegan.org",
    version: "1.3.5",
    favoriteListStoreID: "favoriteListStore",
    favoriteStoreID: "favoriteStore",
    restaurantStoreID: "restaurantStore",
    cafeStoreID: "cafeStore",
    shopStoreID: "shopStore",
    maxListItems: 13,
    maxToolbarLetters: 14,
    timeoutLocationRequest: 4000,
    locationDistanceLimit: 30,
    launched: false,
    startTime: null,
    performance: 0,
    init: function () {
        var c = this;
        if (this.startTime === null) {
            this.startTime = (new Date).getTime()
        }
        BVApp.utils.Settings.init();
        if (BVApp.utils.AppUtils.isAndroid()) {
            this.maxToolbarLetters += 6
        }
        var d = Ext.StoreMgr.lookup(BVApp.Main.favoriteListStoreID);
        d.updateFromFavorites();
        var b = Ext.StoreMgr.lookup(BVApp.Main.restaurantStoreID);
        var a = Ext.StoreMgr.lookup(BVApp.Main.cafeStoreID);
        b.clearFilter(false);
        b.filter([{
            property: "tags",
            value: "Cafe",
            anyMatch: true,
            caseSensitive: true
        }]);
        a.insert(0, b.getRange());
        console.log("BVApp.Main.init Mainpanel start");
        this.ui = new BVApp.views.MainPanel();
        this.ui.determinePositionMask.show();
        setTimeout(function () {
            c.locationReady.call(c)
        }, this.timeoutLocationRequest);
        BVApp.utils.CurrentGeoPosition.updateLocation(function () {
            c.locationReady.call(c)
        });
        console.log("BVApp.Main.init Mainpanel ready");
        this.performance = (new Date).getTime() - this.startTime;
        console.log("Performance " + this.performance)
    },
    locationReady: function () {
        this.ui.determinePositionMask.hide();
        this.showCurrentLocation()
    },
    showCurrentLocation: function () {
        var a = this.getCurrentLocationRecord();
        if (a !== null) {
            this.ui.favoriteRestaurantPanel.updateRestaurant(a);
            this.ui.setActiveItem(this.ui.favoriteRestaurantPanel, false);
            this.ui.activeView = this.ui.favoriteRestaurantPanel
        }
    },
    getCurrentLocationRecord: function () {
        var a = null;
        var b;
        [BVApp.Main.restaurantStoreID, BVApp.Main.shopStoreID, BVApp.Main.cafeStoreID].forEach(function (d, c) {
            b = Ext.StoreMgr.lookup(c);
            b.clearFilter(false);
            b.filter([b.nowOpenFilter]);
            b.updateDistance();
            b.sort({
                property: "distance",
                direction: "ASC"
            });
            if (b.getCount() > 0) {
                if (a === null) {
                    a = b.getAt(0)
                } else {
                    if (a.get("distance") > b.getAt(0).get("distance")) {
                        a = b.getAt(0)
                    }
                }
            }
        });
        if (a !== null) {
            if (a.get("distance") > this.locationDistanceLimit) {
                a = null
            }
        }
        return a
    },
    getLangString: function (a, b) {
        if (b === undefined) {
            b = BVApp.utils.Settings.language
        }
        return BVApp.utils.Locales[b][a]
    },
    getAppInfoPhoneGapForEMail: function () {
        var a = "";
        a += "**************************\n";
        a += "App Version: " + this.version + "\n";
        a += "Device Name: " + device.name + "\n";
        a += "Platform: " + device.platform + "\n";
        a += "Device Version: " + device.version + "\n";
        a += "Performance: " + this.performance + "\n";
        a += "**************************\n";
        return a
    },
    findLocationByLat: function (c) {
        var b = Ext.StoreMgr.lookup(BVApp.Main.restaurantStoreID);
        var a = b.findRecord("lat", c);
        if (a !== null) {
            return a
        }
        b = Ext.StoreMgr.lookup(BVApp.Main.cafeStoreID);
        a = b.findRecord("lat", c);
        if (a !== null) {
            return a
        }
        b = Ext.StoreMgr.lookup(BVApp.Main.shopStoreID);
        a = b.findRecord("lat", c);
        return a
    }
};
Ext.setup({
    icon: "resources/images/icon.png",
    tabletStartupScreen: "tablet_startup.png",
    phoneStartupScreen: "resources/images/splashscreen.png",
    statusBarStyle: "black",
    glossOnIcon: true,
    onReady: function () {
        console.log("Ext.setup.onReady");
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=Ext.emptyFn";
        document.body.appendChild(a);
        BVApp.Main.launched = true;
        BVApp.Main.init()
    }
});
BVApp.templates.HomeMenuTemplate = new Ext.XTemplate('<tpl for=".">', '<div class="main-menu-wrapper {classID}">', '<div class="image-wrap">', '<img src="resources/images/{Icon}" alt="{Text}" /></div>{Text}</div></tpl>');
BVApp.templates.LocationListItemTemplate = new Ext.XTemplate('<tpl if="lat != 0"><div class="row-section"><div class="row-label">{name} </div>', '<div class="row-sublabel">{street}</div>', '<div class="row-distance">{distanceStr}</div>', '<div class="row-arrow"></div></div></tpl>', '<tpl if="showMore"><div class="row-section"><center><div class="row-label">{name}</div></center></div></tpl>', {
    compiled: true
});
BVApp.templates.RestaurantDescriptionTemplate = new Ext.XTemplate('<div class="description">{text}</div>', {
    compiled: true
});
BVApp.templates.RestaurantDetailsTemplate = new Ext.XTemplate('<div class="details"><div class="details-title">{[this.getLangString("DetailsContact")]}</div><div class="details-fieldset"><div class="details-field"><div class="details-label">{[this.getLangString("DetailsAddress")]}</div><div class="details-value">{street}<br/>{citycode} Berlin</div></div><tpl if="telephone.length &gt; 0 "><div class="details-field"><div class="details-label">{[this.getLangString("DetailsTelephone")]}</div><div class="details-value"><a href="tel:{telephone}"><img width="20px" height="20px" src="resources/images/phone2.png" alt=""/> {telephone}</a></div></div></tpl></div><div class="details-title">{[this.getLangString("DetailsOpenTimes")]}</div><div class="details-fieldset"><tpl for="openTimes"><div class="details-field"><div class="details-label">{day}</div><div class="details-value">{time}</div></div></tpl></div><tpl if="vegan &gt; 0"><div class="details-title">{[this.getLangString("DetailsMisc")]}</div><div class="details-fieldset"><div class="details-field"><div class="details-value-full"><ul><tpl if="vegan == 5"><li>{[this.getLangString("DetailsVegan5")]}</li>', '</tpl><tpl if="vegan == 4"><li>{[this.getLangString("DetailsVegan4")]}</li>', '</tpl><tpl if="vegan == 3"><li>{[this.getLangString("DetailsVegan3")]}</li>', '</tpl><tpl if="vegan == 2"><li>{[this.getLangString("DetailsVegan2")]}</li>', '</tpl><tpl if="vegan == 1"><li>{[this.getLangString("DetailsVegan1")]}</li>', '</tpl><tpl if="organic == 1"><li>{[this.getLangString("DetailsOrganic")]}<br/>', '</tpl><tpl if="wheelchair == 1"><li>{[this.getLangString("DetailsWheelchair")]}</li>', '</tpl><tpl if="!this.isEmpty(wheelchair) && wheelchair != 1"><li>{[this.getLangString("DetailsNotWheelchair")]}</li>', '</tpl><tpl if="wheelchairWC == 1"><li>{[this.getLangString("DetailsWCWheelchair")]}</li>', '</tpl><tpl if="wheelchairWC == 0 && wheelchair == 1"><li>{[this.getLangString("DetailsWCNotWheelchair")]}</li>', '</tpl><tpl if="childseat == 1"><li>{[this.getLangString("DetailsChildSeat")]}</li>', '</tpl><tpl if="dog == 1"><li>{[this.getLangString("DetailsDogsAllowed")]}</li>', '</tpl><tpl if="delivery == 1"><li>{[this.getLangString("DetailsDelivery")]}</li>', '</tpl><tpl if="catering == 1"><li>{[this.getLangString("DetailsCatering")]}</li>', "</tpl></ul></div></div></div></tpl></div>", {
    compiled: true,
    getLangString: function (a) {
        return BVApp.Main.getLangString(a)
    },
    isEmpty: function (a) {
        if (null === a || "" === a) {
            return true
        }
        return false
    }
});
BVApp.views.AboutPanel = Ext.extend(Ext.Panel, {
    constructor: function (b) {
        this.addEvents("back");
        BVApp.views.AboutPanel.superclass.constructor.call(this, b)
    },
    initComponent: function () {
        var a = this;
        Ext.apply(this, {
            autoDestroy: true,
            dockedItems: [{
                dock: "top",
                xtype: "toolbar",
                title: BVApp.Main.getLangString("OptionsInfo"),
                items: BVApp.utils.AppUtils.isAndroid() ? null : [{
                    text: BVApp.Main.getLangString("Back"),
                    ui: "back",
                    handler: this.doBack,
                    scope: this
                }]
            }],
            scroll: true,
            listeners: {
                added: function (b, d, c) {
                    var e = "about_" + BVApp.utils.Settings.language + ".html";
                    var f = b;
                    BVApp.utils.AppUtils.loadFile(e, function (g) {
                        f.update(g)
                    })
                }
            }
        });
        BVApp.views.AboutPanel.superclass.initComponent.call(this)
    },
    doBack: function () {
        this.fireEvent("back")
    }
});
BVApp.views.FavoritesPanel = Ext.extend(Ext.Panel, {
    favoriteList: null,
    initComponent: function () {
        this.favoriteList = new Ext.List({
            store: BVApp.Main.favoriteListStoreID,
            itemTpl: BVApp.templates.LocationListItemTemplate
        });
        Ext.apply(this, {
            layout: "fit",
            title: BVApp.Main.getLangString("Favorites"),
            iconCls: "favorites",
            items: [this.favoriteList],
            dockedItems: [{
                dock: "top",
                xtype: "toolbar",
                title: BVApp.Main.getLangString("Favorites")
            }],
            autoDestroy: true
        });
        BVApp.views.FavoritesPanel.superclass.initComponent.call(this)
    },
    getFavoriteList: function () {
        return this.favoriteList
    }
});
BVApp.views.FilterPanel = Ext.extend(Ext.Panel, {
    type: null,
    filterForm: null,
    constructor: function (b) {
        this.addEvents("back");
        BVApp.views.FilterPanel.superclass.constructor.call(this, b)
    },
    initComponent: function () {
        var a = this;
        this.filterForm = new Ext.form.FormPanel({
            items: [{
                xtype: "fieldset",
                defaults: {
                    xtype: "checkboxfield",
                    labelWidth: "80%"
                },
                items: this.buildItems()
            }]
        });
        Ext.apply(this, {
            scroll: true,
            items: [this.filterForm, {
                xtype: "panel",
                componentCls: "helpdescription",
                html: BVApp.Main.getLangString("HelpFilterDesc")
            }],
            dockedItems: [{
                dock: "top",
                xtype: "toolbar",
                title: BVApp.Main.getLangString("Filter"),
                items: BVApp.utils.AppUtils.isAndroid() ? null : [{
                    text: BVApp.Main.getLangString("Back"),
                    ui: "back",
                    handler: this.doBack,
                    scope: this
                }]
            }],
            autoDestroy: true
        });
        BVApp.views.OptionPanel.superclass.initComponent.call(this)
    },
    buildItems: function () {
        var a = new Array();
        a.push({
            label: BVApp.Main.getLangString("FilterNowOpen"),
            checked: BVApp.utils.Settings.filterNowOpen === true,
            listeners: {
                afterrender: function (b) {
                    b.on("check", function (c) {
                        BVApp.utils.Settings.filterNowOpen = true
                    });
                    b.on("uncheck", function (c) {
                        BVApp.utils.Settings.filterNowOpen = false
                    })
                }
            }
        });
        if (this.type === "restaurants" || this.type === "imbiss" || this.type === "icecafes") {
            if (BVApp.utils.Settings.language !== "en") {
                a.push({
                    label: BVApp.Main.getLangString("FilterVeganDeclared"),
                    checked: BVApp.utils.Settings.filterVeganDeclared,
                    listeners: {
                        afterrender: function (b) {
                            b.on("check", function (c) {
                                BVApp.utils.Settings.filterVeganDeclared = true
                            });
                            b.on("uncheck", function (c) {
                                BVApp.utils.Settings.filterVeganDeclared = false
                            })
                        }
                    }
                })
            }
            a.push({
                label: BVApp.Main.getLangString("FilterOrganic"),
                checked: BVApp.utils.Settings.filterOrganic,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterOrganic = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterOrganic = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterWheelchair"),
                checked: BVApp.utils.Settings.filterWheelChair,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterWheelChair = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterWheelChair = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterDogsAllowed"),
                checked: BVApp.utils.Settings.filterDogsAllowed,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterDogsAllowed = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterDogsAllowed = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterDelivery"),
                checked: BVApp.utils.Settings.filterDelivery,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterDelivery = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterDelivery = false
                        })
                    }
                }
            })
        }
        if (this.type === "shopping") {
            a.push({
                label: BVApp.Main.getLangString("FilterOrganicStore"),
                checked: BVApp.utils.Settings.filterShoppingOrganicStore,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterShoppingOrganicStore = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterShoppingOrganicStore = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterBackedGoods"),
                checked: BVApp.utils.Settings.filterShoppingBakedGoods,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterShoppingBakedGoods = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterShoppingBakedGoods = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterIcecream"),
                checked: BVApp.utils.Settings.filterShoppingIcecream,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterShoppingIcecream = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterShoppingIcecream = false
                        })
                    }
                }
            });
            a.push({
                label: BVApp.Main.getLangString("FilterDrugStore"),
                checked: BVApp.utils.Settings.filterShoppingDrugStore,
                listeners: {
                    afterrender: function (b) {
                        b.on("check", function (c) {
                            BVApp.utils.Settings.filterShoppingDrugStore = true
                        });
                        b.on("uncheck", function (c) {
                            BVApp.utils.Settings.filterShoppingDrugStore = false
                        })
                    }
                }
            })
        }
        return a
    },
    doBack: function () {
        this.fireEvent("back")
    }
});
BVApp.views.HomeMenuDataView = Ext.extend(Ext.DataView, {
    initComponent: function () {
        Ext.apply(this, {
            cls: "homepageMainMenu",
            store: new BVApp.models.HomeMenuStore(),
            tpl: BVApp.templates.HomeMenuTemplate,
            autoHeight: true,
            multiSelect: false,
            overItemCls: "x-view-over",
            itemSelector: "div.main-menu-wrapper",
            pressedCls: "main-menu-wrapper-selected",
            scroll: false,
            pressedDelay: 50
        });
        BVApp.views.HomeMenuDataView.superclass.initComponent.call(this)
    }
});
BVApp.views.HomePanel = Ext.extend(Ext.Panel, {
    homeMenuDataView: null,
    initComponent: function () {
        this.homeMenuDataView = new BVApp.views.HomeMenuDataView();
        Ext.apply(this, {
            title: BVApp.Main.getLangString("Home"),
            iconCls: "home",
            autoDestro