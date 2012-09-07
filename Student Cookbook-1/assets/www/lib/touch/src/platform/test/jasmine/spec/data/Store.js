describe("Ext.data.Store", function() {
    var store;

    beforeEach(function() {
        Ext.regModel("User", {
            idProperty: 'email',

            fields: [
                {name: 'name',      type: 'string'},
                {name: 'email',     type: 'string'},
                {name: 'evilness', type: 'int'},
                {name: 'group',     type: 'string'},
                {name: 'old',       type: 'boolean'}
            ],

            proxy: {
                type: 'memory',
                id  : 'ext-data-store-test'
            }
        });

        store = new Ext.data.Store({
            model: "User",
            storeId: 'myStore',
            remoteSort: false,
            groupField: 'group'
        });

        store.add(
            {name: 'Ed Spencer',   email: 'ed@extjs.com',    evilness: 100, group: 'code',  old: false},
            {name: 'Abe Elias',    email: 'abe@extjs.com',   evilness: 70,  group: 'admin', old: false},
            {name: 'Aaron Conran', email: 'aaron@extjs.com', evilness: 5,   group: 'admin', old: true},
            {name: 'Tommy Maintz', email: 'tommy@extjs.com', evilness: -15, group: 'code',  old: true}
        );
    });

    describe("initializing", function() {
        var data1 = {},
            data2 = {};

        var createStore = function(config) {
            store = new Ext.data.Store(Ext.apply({
                model: "User"
            }, config));
        };

        describe("registering with the StoreMgr", function() {
            beforeEach(function() {
                spyOn(Ext.StoreMgr, 'register').andCallThrough();
            });

            it("should register with storeId", function() {
                createStore({storeId: 'someStore'});

                expect(Ext.StoreMgr.register).toHaveBeenCalledWith(store);
            });

            it("should not register without storeId or id", function() {
                createStore({});

                expect(Ext.StoreMgr.register).not.toHaveBeenCalledWith(store);
            });

            describe("if id is passed but storeId is not", function() {
                it("should set the storeId to the id", function() {
                    createStore({storeId: 'someStore'});

                    expect(store.storeId).toEqual('someStore');
                });

                it("should register with the StoreMgr using the id", function() {
                    createStore({id: 'someStore'});

                    expect(Ext.StoreMgr.register).toHaveBeenCalledWith(store);
                });
            });
        });

        it("should create a data MixedCollection", function() {
            expect(store.data instanceof Ext.util.MixedCollection).toBe(true);
        });

        // TODO: reenable when MemoryProxy read method is implemented
        xdescribe("if a data array was provided", function() {
            it("should call add with the data array", function() {
                spyOn(Ext.data.Store.prototype, 'add');

                createStore({data: [data1, data2]});

                expect(Ext.data.Store.prototype.add).toHaveBeenCalledWith(data1, data2);
            });
        });

        describe("if using autoLoad", function() {
            beforeEach(function() {
                spyOn(Ext.data.Store.prototype, 'load').andReturn();
            });

            it("should call load on the store", function() {
                createStore({autoLoad: true});

                waitsFor(function(){
                    return Ext.data.Store.prototype.load.calls.length === 1;
                }, "load was never called", 1000);

                runs(function() {
                    expect(Ext.data.Store.prototype.load).toHaveBeenCalledWith(undefined);
                });
            });

            it("should pass the autoLoad object to load if set", function() {
                var myObject = {};

                createStore({autoLoad: myObject});

                waitsFor(function(){
                    return Ext.data.Store.prototype.load.calls.length === 1;
                }, "load was never called");

                runs(function() {
                    expect(Ext.data.Store.prototype.load).toHaveBeenCalledWith(myObject);
                });
            });
        });
    });

    describe("getting groups", function() {
        var groups;

        it("should return an array", function() {
            expect(Ext.isArray(store.getGroups())).toBe(true);

            groups = store.getGroups();
        });

        it("should group the items by the configured groupField", function() {
            expect(groups.length).toEqual(2);
        });

        it("should give each group a name", function() {
            expect(groups[0].name).toEqual('code');
            expect(groups[1].name).toEqual('admin');
        });

        it("should give each group an array of children", function() {
            expect(Ext.isArray(groups[0].children)).toBe(true);
            expect(Ext.isArray(groups[1].children)).toBe(true);
        });

        it("should put the correct children in each group", function() {
            var code  = groups[0].children,
                admin = groups[1].children;

            expect(code[0].get('name')).toEqual('Ed Spencer');
            expect(code[1].get('name')).toEqual('Tommy Maintz');
            expect(admin[0].get('name')).toEqual('Abe Elias');
            expect(admin[1].get('name')).toEqual('Aaron Conran');
        });
    });

    describe("finding", function() {
        describe("when calling find", function() {
            it("should create a filter function", function() {
                spyOn(store, 'createFilterFn').andCallThrough();

                store.find('id', 1);

                expect(store.createFilterFn).toHaveBeenCalled();
            });

            it("should return the MixedCollection's index for the given function", function() {
                spyOn(store.data, 'findIndexBy').andReturn(10);

                expect(store.find('id', 1)).toEqual(10);
                expect(store.data.findIndexBy).toHaveBeenCalled();
            });

            it("should return -1 if value is empty", function() {
                expect(store.find('id', null)).toEqual(-1);
                expect(store.find('id', '')).toEqual(-1);
                expect(store.find('id', undefined)).toEqual(-1);
                expect(store.find('id', [])).toEqual(-1);
            });
        });

        describe("when calling findRecord", function() {
            it("should delegate to the find function", function() {
                spyOn(store, 'find').andCallThrough();

                store.findRecord('id', 1);

                expect(store.find).toHaveBeenCalledWith('id', 1);
            });

            describe("if a record was found", function() {
                it("should return the record instance", function() {
                    expect(store.findRecord('name', 'Ed Spencer').get('name')).toEqual('Ed Spencer');
                });
            });

            describe("if a record was not found", function() {
                it("should return null", function() {
                    spyOn(store, 'find').andReturn(-1);

                    expect(store.findRecord('name', 'Ed Spencer')).toEqual(null);
                });
            });
        });

        describe("finding exact", function() {
            it("should find the first exact matching record", function() {
                expect(store.findExact('name', 'Ed Spencer')).toEqual(0); //Ed
            });

            it("should honor the start index", function() {
                expect(store.findExact('group', 'code', 1)).toEqual(3); //Tommy
            });
        });

        describe("findBy", function() {
            it("should pass straight through to the MixedCollection's findIndexBy", function() {
                var result = {};

                spyOn(store.data, 'findIndexBy').andReturn(result);

                expect(store.findBy(Ext.emptyFn, {}, 1)).toEqual(result);
                expect(store.data.findIndexBy).toHaveBeenCalledWith(Ext.emptyFn, {}, 1);
            });
        });

        describe("getting by ID", function() {
            it("should find the correct record instance by id", function() {
                expect(store.getById('ed@extjs.com').get('email')).toEqual('ed@extjs.com');
            });
        });

        describe("indexOf", function() {
            it("should pass straight through to the MixedCollection's indexOf", function() {
                var result = 100;

                spyOn(store.data, 'indexOf').andReturn(result);

                expect(store.indexOf('ed@extjs.com')).toEqual(result);
                expect(store.data.indexOf).toHaveBeenCalledWith('ed@extjs.com');
            });
        });

        describe("indexOfId", function() {
            it("should pass straight through to the MixedCollection's indexOfKey", function() {
                var result = 100;

                spyOn(store.data, 'indexOfKey').andReturn(result);

                expect(store.indexOfId('ed@extjs.com')).toEqual(result);
                expect(store.data.indexOfKey).toHaveBeenCalledWith('ed@extjs.com');
            });
        });
    });
    
    describe("sorting", function() {
        var sorters;
        
        it("should create a sorters MixedCollection", function() {
            expect(store.sorters instanceof Ext.util.MixedCollection).toEqual(true);
        });
        
        describe("if new sort parameters were specified", function() {
            beforeEach(function() {
                sorters = store.sorters;
                
                spyOn(sorters, 'clear').andReturn();
            });
            
            it("should clear existing sorters", function() {
                store.sort('name', 'ASC');
                expect(sorters.clear).toHaveBeenCalled();
            });
        });
        
        describe("if new sort parameters were not specified", function() {
            beforeEach(function() {
                store.sort('name', 'ASC');
                sorters = store.sorters;
                
                spyOn(sorters, 'clear').andReturn();
            });
            
            it("should not clear the existing sorters", function() {
                store.sort();
                expect(sorters.clear).not.toHaveBeenCalled();
            });
        });
        
        describe("local sorting", function() {
            it("should sort by field", function() {
                store.sort('name', 'ASC');

                expect(store.getAt(0).get('name')).toEqual("Aaron Conran");
                expect(store.getAt(1).get('name')).toEqual("Abe Elias");
                expect(store.getAt(2).get('name')).toEqual("Ed Spencer");
                expect(store.getAt(3).get('name')).toEqual("Tommy Maintz");
            });

            describe("when a direction is omitted", function() {
                it("should default to 'ASC' the first time we sort on this field", function() {
                    store.sort('name');

                    expect(store.getAt(0).get('name')).toEqual("Aaron Conran");
                    expect(store.getAt(1).get('name')).toEqual("Abe Elias");
                    expect(store.getAt(2).get('name')).toEqual("Ed Spencer");
                    expect(store.getAt(3).get('name')).toEqual("Tommy Maintz");
                });

                it("should toggle between ASC and DESC on subsequent calls", function() {
                    store.sort('name');
                    store.sort('name');

                    //should now be sorted DESC
                    expect(store.getAt(3).get('name')).toEqual("Aaron Conran");
                    expect(store.getAt(2).get('name')).toEqual("Abe Elias");
                    expect(store.getAt(1).get('name')).toEqual("Ed Spencer");
                    expect(store.getAt(0).get('name')).toEqual("Tommy Maintz");
                });
            });

            it("should allow multiple sorters", function() {
                var sorters = [
                    {
                        property : 'group',
                        direction: 'ASC'
                    },
                    {
                        property : 'old',
                        direction: 'DESC'
                    }
                ];

                store.sort(sorters);

                expect(store.getAt(0).get('name')).toEqual('Aaron Conran');
                expect(store.getAt(1).get('name')).toEqual('Abe Elias');
                expect(store.getAt(2).get('name')).toEqual('Tommy Maintz');
                expect(store.getAt(3).get('name')).toEqual('Ed Spencer');
            });

            it("should fire the datachanged event", function() {
                var executed = false;

                store.on('datachanged', function() {
                    executed = true;
                });

                store.sort('name');
                expect(executed).toBe(true);
            });

            it("should save sorters", function() {
                store.sort('name', 'DESC');

                var sorter = store.sorters.get(0);

                expect(sorter.property).toEqual('name');
                expect(sorter.root).toEqual('data');
                expect(sorter.direction).toEqual('DESC');
            });

            it("should ignore invalid fields", function() {
                //first we'll sort by name to give some reference sorting
                store.sort('name', 'ASC');

                //this field does not exist
                store.sort('someUnknownField');

                //make sure the original sorting was preserved
                expect(store.getAt(0).get('name')).toEqual('Aaron Conran');
                expect(store.getAt(1).get('name')).toEqual('Abe Elias');
                expect(store.getAt(2).get('name')).toEqual('Ed Spencer');
                expect(store.getAt(3).get('name')).toEqual('Tommy Maintz');
            });
        });
    });
    
    describe("filtering", function() {
        var filters;
        
        it("should make a filters MixedCollection", function() {
            expect(store.filters instanceof Ext.util.MixedCollection).toEqual(true);
        });
        
        describe("local filtering", function() {
            it("should filter by field", function() {
                store.filter('group', 'code');

                expect(store.getCount()).toEqual(2);
            });

            it("should clear filters", function() {
                var executed = false;

                store.on('datachanged', function() {
                    executed = true;
                });

                store.filter('group', 'code');
                expect(store.getCount()).toEqual(2);

                store.clearFilter();
                expect(store.getCount()).toEqual(4);

                expect(executed).toBe(true);
            });

            it("should suppress clear filter event", function() {
                var executed = false;

                store.filter('group', 'email');

                store.on('datachanged', function() {
                    executed = true;
                }, this);

                store.clearFilter(true);

                expect(executed).toBe(false);
            });

            it("should mark itself as filtered", function() {
                store.filter('group', 'code');
                expect(store.isFiltered()).toBe(true);
            });

            it("should mark itself as not filtered", function() {
                store.clearFilter();
                expect(store.isFiltered()).toBe(false);
            });

            it("should filter by function", function() {
                var executed, execScope;

                store.on('datachanged', function() {
                    executed = true;
                }, this);

                var filterFn = function(item) {
                    execScope = this;

                    return item.get('evilness') > 50;
                };

                store.filterBy(filterFn, fakeScope);

                expect(execScope).toBe(fakeScope);
                expect(store.getCount()).toEqual(2);
                expect(executed).toBe(true);
            });

            it("should not clear existing filters when adding another", function() {
                store.filter('group', 'code');
                expect(store.getCount()).toEqual(2);

                store.filter('old', false);
                expect(store.getCount()).toEqual(1);
            });
        });

        describe("multiple filters", function() {
            var filters = [
                {
                    property: 'group',
                    value   : 'code'
                },
                {
                    property: 'old',
                    value   : true
                }
            ];

            it("should filter using basic filters", function() {
                store.filter(filters);

                expect(store.getCount()).toEqual(1);
                expect(store.data.first().get('name')).toEqual('Tommy Maintz');
            });

            it("should fire the datachanged event", function() {
                var executed = false;

                store.on('datachanged', function() {
                    executed = true;
                }, this);

                store.filter(filters);

                expect(executed).toBe(true);
            });

            it("should accept a custom filter", function() {
                var execScope;

                //tests that the passed filter function is called
                //tests that the filter is called in the right scope
                store.filter({
                    fn: function(record) {
                        execScope = this;
                        return record.get('group') == 'admin' && record.get('old') === true;
                    },
                    scope: fakeScope
                });

                expect(execScope).toBe(fakeScope);
                expect(store.getCount()).toEqual(1);
                expect(store.data.first().get('name')).toEqual('Aaron Conran');
            });

            it("should allow multiple custom filters", function() {
                store.filter([
                    {
                        fn: function(record) {
                            return record.get('group') == 'admin';
                        }
                    },
                    {
                        fn: function(record) {
                            return record.get('old') === false;
                        }
                    }
                ]);

                expect(store.getCount()).toEqual(1);
                expect(store.data.first().get('name')).toEqual('Abe Elias');
            });

            it("should allow a combination of basic and custom filters", function() {
                store.filter([
                    {
                        fn: function(record) {
                            return record.get('old') === false;
                        }
                    },
                    {
                        property: 'group',
                        value   : 'code'
                    }
                ]);

                expect(store.getCount()).toEqual(1);
                expect(store.data.first().get('name')).toEqual('Ed Spencer');
            });

            it("should clear multiple filters", function() {
                store.filter(filters);
                expect(store.getCount()).toEqual(1);

                store.clearFilter();
                expect(store.getCount()).toEqual(4);
            });
        });
    });

    describe("adding records", function() {
        var record1 = {name: 'Ed'},
            record2 = {name: 'Abe'},
            store;

        beforeEach(function() {
            store = new Ext.data.Store({
                model: 'User'
            });
        });

        it("should convert a non-model object into a model instance", function() {
            store.add(record1);

            expect(store.data.items[0] instanceof Ext.data.Model).toBe(true);
        });

        it("should add the new model to the set of new model instances", function() {
            var count = store.getNewRecords().length;

            store.add(record1);

            expect(store.getNewRecords().length).toEqual(count + 1);
        });

        describe("to an empty store", function() {
            it("should add a single record correctly", function() {
                store.add(record1);

                expect(store.data.length).toEqual(1);
            });

            describe("when adding multiple records", function() {
                beforeEach(function() {
                    store.add(record1, record2);
                });

                it("should increase the record count by the correct number", function() {
                    expect(store.data.length).toEqual(2);
                });

                it("should add the records in the correct order", function() {
                    var data   = store.data.items,
                        model1 = data[0],
                        model2 = data[1];

                    expect(model1.get('name')).toEqual('Ed');
                    expect(model2.get('name')).toEqual('Abe');
                });
            });
        });

        describe("to a store with existing records", function() {
            var record3 = {name: 'Aaron'},
                record4 = {name: 'Tommy'};

            beforeEach(function() {
                store.add(record1, record2);
            });

            it("should add a single record to the end of the data array", function() {
                expect(store.data.length).toEqual(2);

                store.add(record3);

                expect(store.data.length).toEqual(3);
                expect(store.data.items[2].get('name')).toEqual('Aaron');
            });
            
            describe("when adding multiple records in an array", function() {
                beforeEach(function() {
                    store.add([record3, record4]);
                });

                it("should increase the record count by the correct number", function() {
                    expect(store.data.length).toEqual(4);
                });

                it("should add multiple records to the end of the data array, in the given order", function() {
                    var data   = store.data.items,
                        model3 = data[2],
                        model4 = data[3];

                    expect(model3.get('name')).toEqual('Aaron');
                    expect(model4.get('name')).toEqual('Tommy');
                });
            });

            describe("when adding multiple records as individual arguments", function() {
                beforeEach(function() {
                    store.add(record3, record4);
                });

                it("should increase the record count by the correct number", function() {
                    expect(store.data.length).toEqual(4);
                });

                it("should add multiple records to the end of the data array, in the given order", function() {
                    var data   = store.data.items,
                        model3 = data[2],
                        model4 = data[3];

                    expect(model3.get('name')).toEqual('Aaron');
                    expect(model4.get('name')).toEqual('Tommy');
                });
            });
        });
    });

    describe("inserting model instances", function() {
        var user1, user2, store;

        beforeEach(function() {
            store = new Ext.data.Store({
                model: 'User'
            });

            user1 = Ext.ModelMgr.create({
                name: 'Ed'
            }, 'User');

            user2 = Ext.ModelMgr.create({
                name: 'Abe'
            }, 'User');
        });

        it("should fire the add event", function() {
            var executed = false;

            store.on('add', function() {
                executed = true;
            }, this);

            store.insert(0, user1);

            expect(executed).toBe(true);
        });

        it("should fire the datachanged event", function() {
            var executed = false;

            store.on('datachanged', function() {
                executed = true;
            }, this);

            store.insert(0, user1);

            expect(executed).toBe(true);
        });

        describe("when inserting records into a non-empty store", function() {
            beforeEach(function() {
                store.add({name: 'Aaron'}, {name: 'Tommy'});
            });

            it("should insert the records at the correct index", function() {
                store.insert(1, [user1, user2]);

                var items = store.data.items;

                expect(items.indexOf(user1)).toEqual(1);
                expect(items.indexOf(user2)).toEqual(2);
            });

            it("should update the indexes of the existing records", function() {
                store.insert(1, [user1, user2]);

                var items = store.data.items;

                expect(items[0].get('name')).toEqual('Aaron');
                expect(items[3].get('name')).toEqual('Tommy');
            });
        });

        it("should join each model instance to the store", function() {
            spyOn(user1, 'join').andCallThrough();
            spyOn(user2, 'join').andCallThrough();

            store.insert(0, [user1, user2]);

            expect(user1.join).toHaveBeenCalledWith(store);
            expect(user2.join).toHaveBeenCalledWith(store);
        });

        describe("if there is currently a snapshot", function() {
            beforeEach(function() {
                store.snapshot = {
                    addAll: Ext.emptyFn
                };

                spyOn(store.snapshot, 'addAll').andReturn(true);
            });

            it("should add all model instances to the snapshot", function() {
                store.insert(0, [user1, user2]);

                expect(store.snapshot.addAll).wasCalledWith([user1, user2]);
            });
        });
    });

    describe("loading from a Proxy", function() {
        var store, fakeProxy;

        var createStore = function(config) {
            var store = new Ext.data.Store(Ext.apply({
                model: 'User',
                proxy: {
                    type: 'memory',
                    id  : 'notreal'
                }
            }, config));

            store.proxy = fakeProxy;

            return store;
        };

        beforeEach(function() {

            //this is a fake proxy that pretends to have loaded a couple of new model instances
            fakeProxy = {
                read: function(operation, callback, scope) {
                    operation.getRecords = function() {
                        return [
                            Ext.ModelMgr.create({email: 1}, 'User'),
                            Ext.ModelMgr.create({email: 2}, 'User')
                        ];
                    };

                    callback.call(scope, operation);
                }
            };

            store = createStore();
        });

        it("should add the records to the mixed collection", function() {
            store.load();
            expect(store.data.length).toEqual(2);
        });

        it("should not add the records to the set of new model instances", function() {
            store.load();
            expect(store.getNewRecords().length).toEqual(0);
        });

        describe("the configured callback function", function() {
            var callbackArgs;

            function defaultCallback() {
                callbackArgs = arguments;
            }

            it("should be passable as a function reference", function() {
                var executed = false;

                store.load(function() {
                    executed = true;
                });

                expect(executed).toBe(true);
            });

            it("should be passable as an object containing a 'callback' property", function() {
                var executed = false;

                store.load({
                    callback: function() {
                        executed = true;
                    }
                });

                expect(executed).toBe(true);
            });

            it("should allow the scope of the callback to be set", function() {
                var scope = {
                    foo: 'bar'
                }, theScope;

                store.load({
                    scope: scope,
                    callback: function() {
                        theScope = this;
                    }
                });

                expect(theScope).toEqual(scope);
            });

            it("should pass the loaded records to the callback", function() {
                store.load(defaultCallback);

                expect(Ext.isArray(callbackArgs[0])).toBeTruthy();
            });

            it("should pass the Operation to the callback", function() {
                store.load(defaultCallback);

                expect(callbackArgs[1] instanceof Ext.data.Operation).toBeTruthy();
            });

            it("should pass the success status of the Operation to the callback", function() {
                store.load(defaultCallback);

                expect(typeof callbackArgs[2] == 'boolean').toEqual(true);
            });
        });

        it("should call sort if using local sorting and sortOnLoad is true", function() {
            store = createStore({
                remoteSort: false,
                sortOnLoad: true
            });

            spyOn(store, 'sort').andReturn();
            store.load();

            expect(store.sort).toHaveBeenCalled();
        });

        it("should not call sort if using local sorting but sortOnLoad is false", function() {
            store = createStore({
                remoteSort: false,
                sortOnLoad: false,
                sortOnFilter: false
            });

            spyOn(store, 'sort').andReturn();
            store.load();

            expect(store.sort).not.toHaveBeenCalled();
        });

        it("should call filter if using local filtering and filterOnLoad is true", function() {
            store = createStore({
                remoteFilter: false,
                filterOnLoad: true
            });

            spyOn(store, 'filter').andReturn();
            store.load();

            expect(store.filter).toHaveBeenCalled();
        });

        it("should not call sort if using local filtering but filterOnLoad is false", function() {
            store = createStore({
                remoteFilter: false,
                filterOnLoad: false
            });

            spyOn(store, 'filter').andReturn();
            store.load();

            expect(store.filter).not.toHaveBeenCalled();
        });

        describe("if using remote sorting", function() {
            beforeEach(function() {
                store = createStore({remoteSort: true});
                spyOn(store, 'sort').andReturn();
            });

            it("should not attempt to sort the data again", function() {
                store.load();
                expect(store.sort).not.toHaveBeenCalled();
            });
        });
    });

    describe("loading data with a MemoryProxy", function() {
        var proxy, data;

        beforeEach(function() {
            Ext.regModel('MemoryUser', {
                fields: [
                    {name: 'id',    type: 'int'},
                    {name: 'name',  type: 'string'},
                    {name: 'phone', type: 'string', mapping: 'phoneNumber'}
                ]
            });

            data = {
                users: [
                    {
                        id: 1,
                        name: 'Ed Spencer',
                        phoneNumber: '555 1234'
                    },
                    {
                        id: 2,
                        name: 'Abe Elias',
                        phoneNumber: '666 1234'
                    }
                ]
            };

            store = new Ext.data.Store({
                model: 'MemoryUser',
                data : data,
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        root: 'users'
                    }
                }
            });

            proxy = store.proxy;
        });

        afterEach(function() {
            proxy.clear();
            delete Ext.ModelMgr.types.MemoryUser;
        });

        it("should set the MemoryProxy's data", function() {
            expect(proxy.data).toEqual(data);
        });

        it("should use the MemoryProxy to load the inline data", function() {
            spyOn(proxy, 'read').andCallThrough();

            store.load();
            expect(proxy.read).toHaveBeenCalled();
        });
    });

    describe("removing records", function() {
        var record1;

        beforeEach(function() {
            record1 = store.data.items[0];
        });

        it("should add the removed records to the removed array", function() {
            store.remove(record1);

            expect(store.removed.length).toEqual(1);
            expect(store.removed[0]).toEqual(record1);
        });

        it("should remove the record from the data MixedCollection", function() {
            spyOn(store.data, 'remove').andCallThrough();

            store.remove(record1);
            expect(store.data.remove).toHaveBeenCalledWith(record1);
        });

        it("should unjoin the record from the Store", function() {
            spyOn(record1, 'unjoin').andCallThrough();

            store.remove(record1);

            expect(record1.unjoin).toHaveBeenCalledWith(store);
        });

        it("should fire the remove event", function() {
            var theRecord;

            store.on('remove', function(store, record) {
                theRecord = record;
            }, this);

            store.remove(record1);

            expect(theRecord).toEqual(record1);
        });

        it("should fire the remove event", function() {
            var executed = false;

            store.on('remove', function() {
                executed = true;
            }, this);

            store.remove(record1);

            expect(executed).toBe(true);
        });

        describe("if there is currently a filter snapshot", function() {
            beforeEach(function() {
                store.snapshot = {
                    remove: Ext.emptyFn
                };

                spyOn(store.snapshot, 'remove').andReturn();
            });

            it("should remove the record from the snapshot MixedCollection", function() {
                store.remove(record1);
                expect(store.snapshot.remove).toHaveBeenCalledWith(record1);
            });
        });

        describe("by using removeAt", function() {
            it("should find record with getAt", function() {
                spyOn(store, "getAt");

                store.removeAt(0);

                expect(store.getAt).toHaveBeenCalledWith(0);
            });

            it("should remove the record if it is found", function() {
                spyOn(store, "remove");

                store.removeAt(0);

                expect(store.remove).toHaveBeenCalledWith(record1);
            });

            it("should do nothing if record couln't be found", function() {
                spyOn(store, "remove");

                store.removeAt(9999);

                expect(store.remove).not.toHaveBeenCalled();

            });
        });
    });

    describe("syncing after removing records", function() {
        var record1, batch, operation;

        beforeEach(function() {
            record1 = store.data.items[0];

            store.remove(record1);
        });

        describe("passing records via the destroy operation config", function() {
            beforeEach(function() {
                store.proxy.batch = function(operations) {
                    batch = operations;
                };

                spyOn(store, 'getNewRecords').andReturn([]);
                spyOn(store, 'getUpdatedRecords').andReturn([]);
                store.sync();
            });

            it("should send the proxy a destroy operation", function() {
                expect(batch.destroy.length).toEqual(1);
            });

            it("should contain the removed records", function() {
                expect(batch.destroy[0]).toEqual(record1);
            });

            it("should not contain a create key", function() {
                expect(batch.create).toBeUndefined();
            });

            it("should not contain an update key", function() {
                expect(batch.update).toBeUndefined();
            });
        });

        describe("when the Batch has completed", function() {
            var fakeBatchCompletion = function() {
                //we're faking the completion of the Batch triggering onBatchComplete here
                store.onBatchComplete(batch);
            };

            beforeEach(function() {
                operation = new Ext.data.Operation({
                    action : 'destroy',
                    records: [record1]
                });

                spyOn(operation, 'getRecords').andReturn([record1]);

                batch = new Ext.data.Batch();
                batch.add(operation);
            });

            it("should call onProxyWrite", function() {
                spyOn(store, 'onProxyWrite').andReturn();

                fakeBatchCompletion();

                expect(store.onProxyWrite).toHaveBeenCalledWith(operation);
            });
        });
    });

    describe("onProxyWrite", function() {
        var operation, record1;

        function createOperation(type) {
            record1 = store.data.items[0];

            operation = new Ext.data.Operation({
                action : type,
                records: [record1],
                callback: Ext.emptyFn
            });

            spyOn(operation, 'getRecords').andReturn([record1]);
        }

        describe("if the Operation was successful", function() {
            describe("if calling a destroy action", function() {
                beforeEach(function() {
                    createOperation('destroy');
                    spyOn(operation, 'wasSuccessful').andReturn(true);
                });

                it("should flush the removed array", function() {
                    store.onProxyWrite(operation);
                    expect(store.removed.length).toEqual(0);
                });

                it("should remove the record from the data MixedCollection", function() {
                    spyOn(store.data, 'remove').andReturn();

                    store.onProxyWrite(operation);

                    expect(store.data.remove).toHaveBeenCalledWith(record1);
                });
            });

            Ext.each(['create', 'update'], function(action) {
                describe("if calling a " + action + " action", function() {
                    beforeEach(function() {
                        record1.phantom = true;

                        spyOn(store.data, 'replace').andReturn(true);

                        createOperation(action);
                        spyOn(operation, 'wasSuccessful').andReturn(true);

                        spyOn(record1, 'join').andCallThrough();
                        store.onProxyWrite(operation);
                    });

                    it("should set the phantom status of each record to false", function() {
                        expect(record1.phantom).toBe(false);
                    });

                    it("should join each record to the store", function() {
                        expect(record1.join).toHaveBeenCalledWith(store);
                    });

                    it("should replace existing record definitions in the MixedCollection with the new instance", function() {
                        expect(store.data.replace).toHaveBeenCalledWith(record1);
                    });
                });
            }, this);
        });

        describe("if the Operation was not successful", function() {
            beforeEach(function() {
                spyOn(operation, 'wasSuccessful').andReturn(false);
                store.removed = [record1];
            });

            it("should not remove the record from the data MixedCollection", function() {
                spyOn(store.data, 'remove').andReturn();

                store.onProxyWrite(operation);

                expect(store.data.remove).not.toHaveBeenCalled();
            });

            it("should not flush the removed array", function() {
                store.onProxyWrite(operation);
                expect(store.removed.length).toEqual(1);
            });
        });

        it("should call the operation callback", function() {
            createOperation("update");

            spyOn(operation, "wasSuccessful").andReturn(true);
            spyOn(operation, "callback");

            store.onProxyWrite(operation);

            expect(operation.callback).toHaveBeenCalledWith([record1], operation, true);
        });
    });

    describe("destroying the Store", function() {
        it("should unregister from the Store Manager", function() {
            spyOn(Ext.StoreMgr, 'unregister').andCallThrough();

            store.destroyStore();

            expect(Ext.StoreMgr.unregister).toHaveBeenCalledWith(store);
        });

        it("should clear data", function() {
            spyOn(store, 'clearData').andCallThrough();

            store.destroyStore();

            expect(store.clearData).toHaveBeenCalled();
        });

        it("should unset references", function() {
            store.destroyStore();

            expect(store.reader).toBeNull();
            expect(store.writer).toBeNull();
            expect(store.data).toBeNull();
        });

        it("should mark itself destroyed", function() {
            expect(store.isDestroyed).toBe(false);

            store.destroyStore();

            expect(store.isDestroyed).toBe(true);
        });

        //TODO: reinstate this
        xit("should destroy its proxy", function() {
            var proxy = store.proxy;

            spyOn(Ext, 'destroy').andReturn(true);

            store.destroyStore();

            expect(Ext.destroy).toHaveBeenCalledWith(proxy);
        });
    });

    describe("getting a range", function() {
        it("should return the requested range", function() {
            expect(store.getRange(1, 2).length).toEqual(2);
        });

        it("should return all records if no range was requested", function() {
            expect(store.getRange().length).toEqual(4);
        });
    });

    describe("first and last", function() {
        it("should proxy calls to first() to the data MixedCollection", function() {
            spyOn(store.data, 'first').andReturn(1);

            expect(store.first()).toEqual(1);
            expect(store.data.first).toHaveBeenCalled();
        });

        it("should proxy calls to last() to the data MixedCollection", function() {
            spyOn(store.data, 'last').andReturn(1);

            expect(store.last()).toEqual(1);
            expect(store.data.last).toHaveBeenCalled();
        });
    });

    describe("paging", function() {
        var store, proxy, operation;

        beforeEach(function() {
            proxy = new Ext.data.Proxy();

            store = new Ext.data.Store({
                fields: ['id'],
                proxy: proxy,
                perPage: 25
            });

            spyOn(proxy, 'read').andCallFake(function(op) {
                operation = op;
            });
        });

        function loadPage(pageNumber) {
            store.loadPage(pageNumber || 1);
        }

        it("should issue a read request to the Proxy", function() {
            loadPage();
            expect(proxy.read).toHaveBeenCalled();
        });

        it("should pass the Proxy a 'read' Operation", function() {
            loadPage();

            expect(operation instanceof Ext.data.Operation).toBeTruthy();
        });

        describe("the Operation", function() {
            it("should send the start and limit params to the Proxy", function() {
                loadPage();

                expect(operation.start).not.toEqual(undefined);
                expect(operation.limit).not.toEqual(undefined);
            });

            describe("when loading the first page", function() {
                beforeEach(function() {
                    loadPage();
                });

                it("should set start to zero", function() {
                    expect(operation.start).toEqual(0);
                });

                it("should set limit to the pageSize config", function() {
                    expect(operation.limit).toEqual(25);
                });

                it("should set the page config", function() {
                    expect(operation.page).toEqual(1);
                });
            });

            describe("when loading a specific page", function() {
                var pageNumber = 3;

                beforeEach(function() {
                    loadPage(pageNumber);
                });

                it("should pass the correct start index", function() {
                    expect(operation.start).toEqual(50);
                });

                it("should pass the correct perPage", function() {
                    expect(operation.limit).toEqual(25);
                });

                it("should set the page config", function() {
                    expect(operation.page).toEqual(3);
                });

                it("should save the current page", function() {
                    expect(store.currentPage).toEqual(3);
                });
            });
        });

        describe("when replacing the existing page", function() {

        });

        describe("when not replacing the existing page", function() {

        });
    });


    describe("counting and iterators", function() {
        it("should return the correct count", function() {
            expect(store.getCount()).toEqual(4);
        });

        //PENDING - need a fake remote data set test with paging
        xit("should get the correct total count", function() {

        });

        it("should iterate over all records with .each", function() {
            var count = 0,
                callScope;

            store.each(function() {
                callScope = this;
                count ++;
            }, fakeScope);

            expect(count).toEqual(4);
            expect(callScope).toBe(fakeScope);
        });

        it("should sum over records", function() {
            var sum = store.sum('evilness');

            expect(sum).toEqual(160);
        });

        it("should sum with a start and end", function() {
            var sum = store.sum('evilness', 1, 3);

            expect(sum).toEqual(60);
        });

        it("should collect values", function() {
            var values = store.collect('name');

            expect(values.length).toEqual(4);
            expect(values.indexOf("Ed Spencer")).not.toEqual(-1);
            expect(values.indexOf("Abe Elias")).not.toEqual(-1);
            expect(values.indexOf("Aaron Conran")).not.toEqual(-1);
            expect(values.indexOf("Tommy Maintz")).not.toEqual(-1);
        });

        it("should collect unique values", function() {
            var values = store.collect('group');

            expect(values.length).toEqual(2);
            expect(values.indexOf('code')).not.toEqual(-1);
            expect(values.indexOf('admin')).not.toEqual(-1);
        });
    });



    xdescribe("committing", function() {
        it("should commit changes", function() {

        });

        it("should reject changes", function() {

        });

        it("should call afterCommit", function() {

        });

        it("should call afterReject", function() {

        });
    });
});
