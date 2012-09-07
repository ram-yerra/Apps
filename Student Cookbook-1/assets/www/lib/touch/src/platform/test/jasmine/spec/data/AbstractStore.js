describe("Ext.data.AbstractStore", function() {
    var AbstractStore = Ext.data.AbstractStore,
        store, User;
    
    var createStore = function(config) {
        return new Ext.data.AbstractStore(Ext.apply({
            proxy: {
                type: 'memory',
                id  : 'some-store'
            }
        }, config));
    };
    
    beforeEach(function() {
        User = Ext.regModel('User', {
            fields: []
        });
    });
    
    describe("synchronizing", function() {
        beforeEach(function() {
            store = createStore();
        });
        
        describe("if a sync is required", function() {
            beforeEach(function() {
                spyOn(store, 'getNewRecords').andReturn([{id: 1}]);
                spyOn(store.proxy, 'batch').andReturn();
            });
            
            it("should fire the beforesync event before syncing", function() {
                var executed = false;

                store.on('beforesync', function() {
                    executed = true;
                }, this);

                store.sync();

                expect(executed).toBe(true);
            });

            it("should allow any beforesync listener to cancel the sync call", function() {
                store.on('beforesync', function() {
                    return false;
                }, this);

                store.sync();

                expect(store.proxy.batch).not.toHaveBeenCalled();
            });
        });
    });
    
    describe("after initialization", function() {
        
        it("should have an empty removed array", function() {
            store = createStore();
            var removed = store.removed;
            
            expect(Ext.isArray(removed)).toBe(true);
            expect(removed.length).toEqual(0);
        });
        
        it("should have an empty sortToggle object", function() {
            store = createStore();
            var sortToggle = store.sortToggle;
            
            expect(Ext.isObject(sortToggle)).toBe(true);
        });
        
        describe("if a model was defined", function() {
            var fakeModel = Ext.regModel("FakeModel", {
                fields: ['id']
            });
            
            beforeEach(function() {
                spyOn(Ext.ModelMgr, 'getModel').andReturn(fakeModel);
                
                store = createStore({
                    model: 'User'
                });
            });
            
            afterEach(function() {
                delete Ext.ModelMgr.types.FakeModel;
            });
            
            it("should find the model using the model manager", function() {
                expect(Ext.ModelMgr.getModel).toHaveBeenCalledWith('User');
            });
            
            it("should store a reference to the model", function() {
                expect(store.model).toEqual(fakeModel);
            });
        });
        
        describe("if no model was defined, but fields were defined", function() {
            beforeEach(function() {
                store = createStore({
                    fields: []
                });
            });
            
            it("should create an implicit model", function() {
                expect(typeof store.model == 'function').toBe(true);
            });
            
            it("should set implicit model to true", function() {
                expect(store.implicitModel).toBe(true);
            });
            
            it("should remove the fields array from the Store instance", function() {
                expect(store.fields).toBeUndefined();
            });
        });
        
        describe("if an id was defined", function() {
            var storeId = 'myStoreId';
            
            beforeEach(function() {
                spyOn(Ext.StoreMgr, 'register').andReturn();
                
                store = createStore({
                    id: storeId
                });
            });
            
            it("should set the storeId equal to the id", function() {
                expect(store.storeId).toEqual('myStoreId');
            });
            
            it("should delete the id from the Store instance", function() {
                expect(store.id).toBeUndefined();
            });
            
            it("should register the Store with the Store Manager", function() {
                expect(Ext.StoreMgr.register).toHaveBeenCalledWith(store);
            });
        });
        
        describe("if a proxy was defined", function() {
            it("should call setProxy", function() {
                spyOn(AbstractStore.prototype, 'setProxy').andReturn();
                
                store = createStore();
                
                expect(AbstractStore.prototype.setProxy).toHaveBeenCalled();
            });
        });
    });
    
    describe("loading", function() {
        var sorters, filters, operation;
        
        beforeEach(function() {
            sorters = [{property: 'name', direction: 'ASC'}];
            filters = [{property: 'name', value: 'Ed'}];
            
            store = createStore({
                sorters: sorters,
                filters: filters
            });
            
            spyOn(store.proxy, 'read').andCallFake(function(op) {
                operation = op;
            });
        });
        
        it("should fire the beforeload event", function() {
            var executed = false;
            
            store.on('beforeload', function() {
                executed = true;
            }, this);
            
            store.load();
            
            expect(executed).toBe(true);
        });
        
        it("should cancel the load if any beforeload listener returns false", function() {
            store.on('beforeload', function() {
                return false;
            }, this);
            
            store.load();
            
            expect(store.proxy.read).not.toHaveBeenCalled();
        });
        
        it("should load via its Proxy, passing onProxyLoad as a callback", function() {
            store.load();
            
            expect(store.proxy.read).toHaveBeenCalled();
        });
        
        describe("the read Operation", function() {
            it("should have the Store's sorters", function() {
                expect(operation.sorters[0].property).toEqual(sorters[0].property);
            });

            it("should have the Store's filters", function() {
                expect(operation.filters[0].property).toEqual(filters[0].property);
            });

            it("should set the Operation action to read", function() {
                expect(operation.action).toEqual('read');
            });
        });
    });
    
    describe("setting the Store's proxy", function() {
        var fakeProxy = {
            setModel: Ext.emptyFn
        };
        
        describe("if the proxy has not already been created", function() {
            beforeEach(function() {
                spyOn(Ext.data.ProxyMgr, 'create').andReturn(fakeProxy);
                spyOn(fakeProxy, 'setModel').andCallThrough();

                store = createStore({model: 'SomeModel'});
                store.setProxy({});
            });

            it("should return the Proxy", function() {
                expect(store.setProxy({})).toEqual(fakeProxy);
            });
            
            it("should create the Proxy instance", function() {
                expect(Ext.data.ProxyMgr.create).toHaveBeenCalledWith({});
            });

            it("should set the Store's reference to the Proxy", function() {
                expect(store.proxy).toEqual(fakeProxy);
            });
        });
        
        describe("if the proxy has already been created", function() {
            var proxy;
            
            beforeEach(function() {
                proxy = new Ext.data.Proxy();
                
                spyOn(proxy, 'setModel').andCallThrough();
                
                store.setProxy(proxy);
            });
            
            it("should set the new Proxy's Model to the Store's Model", function() {
                expect(proxy.setModel).toHaveBeenCalledWith(store.model);
            });
        });
    });
    
    describe("getting the proxy", function() {
        it("should return the proxy", function() {
            store = createStore();
            
            expect(store.getProxy()).toEqual(store.proxy);
        });
    });
    
    describe("the create method", function() {
        var record, data, options, callbackFn, createOpts;
        
        function create() {
            store.create(data, options);
        }
        
        beforeEach(function() {
            store = createStore({model: 'User'});
            
            callbackFn = jasmine.createSpy('callbackFn');
            
            options = {
                scope: fakeScope,
                callback: callbackFn
            };
            
            data = {
                id: 100
            };
            
            record = {
                data: data
            };
            
            spyOn(Ext.ModelMgr, 'create').andReturn(record);
            spyOn(store.proxy, 'create').andCallFake(function(opts) {
                createOpts = opts;
            });
            
            create();
        });
        
        it("should instantiate a new model instance with the given data", function() {
            expect(Ext.ModelMgr.create).toHaveBeenCalledWith(data, 'User');
        });
        
        it("should call the proxy's create function with an Operation", function() {
            expect(store.proxy.create).toHaveBeenCalledWith(jasmine.any(Ext.data.Operation), jasmine.any(Function), jasmine.any(Object));
        });
        
        describe("the create operation", function() {
            it("should be a 'create' operation", function() {
                expect(createOpts.action).toEqual('create');
            });
            
            it("should contain the new model instance", function() {
                expect(createOpts.records[0]).toEqual(record);
            });
            
            it("should contain the callback and scope", function() {
                expect(createOpts.callback).toEqual(callbackFn);
                expect(createOpts.scope).toEqual(options.scope);
            });
        });
    });
    
    describe("decoding sorters", function() {
        it("should create Sorter instances", function() {
            var sorter1 = new Ext.util.Sorter({
                property: 'property1',
                value   : 'value1'
            });

            var sorter2 = {
                property: 'property2',
                value   : 'value2'
            };

            var decoded = Ext.data.Store.prototype.decodeSorters([sorter1, sorter2]);
            
            expect(decoded[0] instanceof Ext.util.Sorter).toBe(true);
            expect(decoded[1] instanceof Ext.util.Sorter).toBe(true);
        });
        
        it("should accept sorterFn", function() {
            //ensure support for 3.x style 'fn'
            var sorter = {
                fn: function(r1, r2) {
                    return r1 < r2;
                }
            };

            var decoded = Ext.data.Store.prototype.decodeSorters([sorter]);
            
            expect(decoded[0] instanceof Ext.util.Sorter).toBe(true);
        });
        
        it("should accept a function as a sorter", function() {
            var sorterFn = function(record) {
                return record.get('name') == 'Ed';
            };

            var sorter = sorterFn;

            var decoded = Ext.data.Store.prototype.decodeSorters([sorter]);

            expect(decoded[0] instanceof Ext.util.Sorter).toBe(true);
            expect(decoded[0].sorterFn).toEqual(sorterFn);
        });
        
        describe("when a single string is passed", function() {
            var decoded;
            
            beforeEach(function() {
                decoded = Ext.data.AbstractStore.prototype.decodeSorters('someProperty');
            });
            
            it("should create a Sorter", function() {
                expect(decoded[0] instanceof Ext.util.Sorter).toBe(true);
            });
            
            it("should default the direction to ASC", function() {
                expect(decoded[0].direction).toEqual('ASC');
            });
            
            it("should set the property correctly", function() {
                expect(decoded[0].property).toEqual('someProperty');
            });
        });
    });
    
    describe("decoding filters", function() {
        it("should create filters", function() {
            var filter1 = new Ext.util.Filter({
                property: 'property1',
                value   : 'value1'
            });

            var filter2 = {
                property: 'property2',
                value   : 'value2'
            };

            var decoded = Ext.data.Store.prototype.decodeFilters([filter1, filter2]);
            
            expect(decoded[0] instanceof Ext.util.Filter).toBe(true);
            expect(decoded[1] instanceof Ext.util.Filter).toBe(true);
        });
        
        it("should accept a filterFn", function() {
            //ensure support for 3.x style 'fn'
            var filter = {
                fn: function(record) {
                    return record.get('name') == 'Ed';
                }
            };

            var decoded = Ext.data.Store.prototype.decodeFilters([filter]);
            
            expect(decoded[0] instanceof Ext.util.Filter).toBe(true);
            expect(decoded[0].filterFn).toEqual(filter.fn);
        });
        
        it("should accept a function as a filter", function() {
            var filterFn = function(record) {
                return record.get('name') == 'Ed';
            };

            var filter = filterFn;

            var decoded = Ext.data.Store.prototype.decodeFilters([filter]);
            
            expect(decoded[0] instanceof Ext.util.Filter).toBe(true);
            expect(decoded[0].filterFn).toEqual(filterFn);
        });
    });
});
