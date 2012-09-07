describe("Ext.data.WebStorageProxy", function() {
    var proxy, config;

    var fakeStorageObject = {
        items: {},
        getItem: function(key) {
            return this.items[key];
        },
        setItem: function(key, value) {
            this.items[key] = value;
        },
        removeItem: function(key) {
            delete this.items[key];
        },
        clear: function() {
            this.items = {};
        }
    };

    afterEach(function(){
        fakeStorageObject.clear();
    });
    
    describe("getIds", function() {

        beforeEach(function() {
            spyOn(fakeStorageObject, 'getItem').andCallThrough();

            fakeStorageObject.setItem('wsId', "1,2,3");
            
            proxy = new Ext.data.WebStorageProxy({
                getStorageObject: function() {
                    return fakeStorageObject;
                },
                id: 'wsId'
            });
        });
        
        it("should retrieve the list of ids from the storage object", function() {
            expect(fakeStorageObject.getItem).toHaveBeenCalledWith('wsId');
        });
        
        it("should return an array", function() {
            expect(Ext.isArray(proxy.getIds())).toBe(true);
        });
        
        it("should return each array item as a number", function() {
            var ids    = proxy.getIds(),
                length = ids.length,
                i;

            for (i = 0; i < length; i++) {
                expect(typeof ids[i] == 'number').toBe(true);
            }
        });
    });
    
    describe("instantiation with id configuration option and methods", function() {
        config = {
            id: 42,
            initialize: jasmine.createSpy(),
            getStorageObject: jasmine.createSpy().andReturn(true)
        };
        
        beforeEach(function() {
            proxy = new Ext.data.WebStorageProxy(config);
        });
                
        describe("instantiation", function(){
            it("should set id", function() {
                expect(proxy.id).toEqual(42);
            });
        
            it("should extend Ext.data.ClientProxy", function() {
                expect(proxy.superclass()).toEqual(Ext.data.ClientProxy.prototype);
            });
            
            it("should run initialize in constructor", function() {
               expect(config.initialize).toHaveBeenCalled(); 
            });
            
            it("should test getStorageObject in constructor", function() {
               expect(config.getStorageObject).toHaveBeenCalled(); 
            });
        });

        describe("methods", function() {
            describe("getRecordKey", function() {
                var HumanModelName   = 'Human',
                    HumanModelConfig =  {
                        fields: [
                            {name: 'name',  type: 'string'},
                            {name: 'age',   type: 'int'},
                            {name: 'planet', type: 'string', defaultValue: 'Earth'}
                        ]
                    },
                    HumanModel = Ext.regModel(HumanModelName, HumanModelConfig),
                    nicolas = Ext.ModelMgr.create({
                        id: 1,
                        name: 'Nicolas',
                        age : 27
                    }, HumanModelName);
            
                it("should return a unique string with a string given", function() {
                    expect(proxy.getRecordKey("33")).toEqual("42-33");
                });
                
                it("should return a unique string with a model given", function() {
                    expect(proxy.getRecordKey(nicolas)).toEqual("42-1");
                });
            
            });
            
            describe("getRecordCounterKey", function() {
                it("should return the unique key used to store the current record counter for this proxy", function () {
                    expect(proxy.getRecordCounterKey()).toEqual("42-counter");
                });
            });
            
            describe("getStorageObject", function(){
                it("should throw an error on getStorageObject", function() {
                    expect(Ext.data.WebStorageProxy.prototype.getStorageObject).toThrow();
                });
            });
        });
    });

    describe("instantiation with store configuration option", function() {        
        var config = {
            store: {
                storeId: 66
            },
            initialize: jasmine.createSpy(),
            getStorageObject: function() {
                return fakeStorageObject;
            }
        };
        
        
        beforeEach(function() {
            proxy = new Ext.data.WebStorageProxy(config);
        });
        
        it("should set id", function() {
            expect(proxy.id).toEqual(66);
        });
    });
    
    describe("destroying records after they have been added", function() {
        var store;
        
        beforeEach(function() {
            Ext.regModel('User', {
                fields: [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ]
            });
            
            store = new Ext.data.Store({
                model: 'User',
                proxy: new Ext.data.WebStorageProxy({
                    id  : 'lsTest',
                    getStorageObject: function() {
                        return fakeStorageObject;
                    }
                })
            });
            
            store.add({name: 'Ed'}, {name: 'Abe'}, {name: 'Aaron'}, {name: 'Tommy'});
            store.sync();
        });
        
        it("should remove a single record", function() {
            var count = store.getCount();
            
            store.remove(store.getAt(1));
            store.sync();
            
            expect(store.getCount()).toEqual(count - 1);
            
            expect(store.getAt(0).get('name')).toEqual('Ed');
            expect(store.getAt(1).get('name')).toEqual('Aaron');
        });
        
        it("should remove an array of records", function() {
            var count = store.getCount();
            
            store.remove([store.getAt(1), store.getAt(2)]);
            store.sync();
            
            expect(store.getCount()).toEqual(count - 2);
            
            expect(store.getAt(0).get('name')).toEqual('Ed');
            expect(store.getAt(1).get('name')).toEqual('Tommy');
        });
    });
    
    describe("adding records to the storage object", function() {
        var record, operation;
        
        beforeEach(function() {
            Ext.regModel('User', {
                fields: [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ]
            });
                        
            proxy = new Ext.data.WebStorageProxy({
                model: Ext.ModelMgr.types.User,
                getStorageObject: function() {
                    return fakeStorageObject;
                },
                id: 'someId'
            });
            
            spyOn(proxy, 'getNextId').andReturn(10);
            spyOn(proxy, 'setIds').andCallThrough();
            spyOn(proxy, 'getIds').andReturn([]);
            spyOn(proxy, 'setRecord').andCallThrough();
        });
        
        var createOperation = function() {
            operation = new Ext.data.Operation({
                action : 'create',
                records: [record]
            });
            
            spyOn(operation, 'setStarted').andReturn();
            spyOn(operation, 'setCompleted').andReturn();
            spyOn(operation, 'setSuccessful').andReturn();
        };
        
        describe("if the records are phantoms", function() {
            
            beforeEach(function() {
                record = Ext.ModelMgr.create({name: 'Ed'}, 'User');
                createOperation();
            });
            
            it("should assign the next id to the record", function() {
                proxy.create(operation);
                
                expect(record.getId()).toEqual(10);
            });
            
            it("should mark the Operation as started", function() {
                proxy.create(operation);
                
                expect(operation.setStarted).toHaveBeenCalled();
            });
            
            it("should mark the Operation as completed", function() {
                proxy.create(operation);
                
                expect(operation.setCompleted).toHaveBeenCalled();
            });
            
            it("should mark the Operation as successful", function() {
                proxy.create(operation);
                
                expect(operation.setSuccessful).toHaveBeenCalled();
            });
            
            it("should add the id to the set of all ids", function() {
                proxy.create(operation);
                
                expect(proxy.setIds).toHaveBeenCalledWith([10]);
            });
            
            it("should add the record to the storage object", function() {
                proxy.create(operation);
                
                expect(proxy.setRecord).toHaveBeenCalledWith(record, 10);
            });
            
            it("should call the callback function with the updated Operation", function() {
                var theOperation;
                
                proxy.create(operation, function(op) {
                    theOperation = op;
                });
                
                expect(theOperation).toEqual(operation);
            });
            
            it("should call the callback function with the correct scope", function() {
                var theScope;
                
                proxy.create(operation, function() {
                    theScope = this;
                }, fakeScope);
                
                expect(theScope).toBe(fakeScope);
            });
        });
        
        describe("if the records are not phantoms", function() {
            beforeEach(function() {
                record = Ext.ModelMgr.create({id: 20, name: 'Ed'}, 'User');
                createOperation();
            });
            
            it("should add the id to the set of all ids", function() {
                proxy.create(operation);
                
                expect(proxy.setIds).toHaveBeenCalledWith([20]);
            });
            
            it("should not generate the next id", function() {
                proxy.create(operation);
                
                expect(proxy.getNextId).not.toHaveBeenCalled();
            });
            
            it("should add the record to the storage object", function() {
                proxy.create(operation);
                
                expect(proxy.setRecord).toHaveBeenCalledWith(record, 20);
            });
        });
    });
    
    describe("updating existing records", function() {
        var operation, record;
        
        beforeEach(function() {
            Ext.regModel('User', {
                fields: [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ]
            });

            proxy = new Ext.data.WebStorageProxy({
                model: Ext.ModelMgr.types.User,
                getStorageObject: function() {
                    return fakeStorageObject;
                },
                id: 'someId'
            });

            spyOn(proxy, 'setRecord').andCallThrough();
  
            
            record = Ext.ModelMgr.create({id: 100, name: 'Ed'}, 'User');
            
            operation = new Ext.data.Operation({
                action : 'update',
                records: [record]
            });
            
            spyOn(operation, 'setStarted').andReturn();
            spyOn(operation, 'setCompleted').andReturn();
            spyOn(operation, 'setSuccessful').andReturn();
        });
        
        it("should mark the Operation as started", function() {
            proxy.update(operation);
            
            expect(operation.setStarted).toHaveBeenCalled();
        });
        
        it("should mark the Operation as completed", function() {
            proxy.update(operation);
            
            expect(operation.setCompleted).toHaveBeenCalled();
        });
        
        it("should mark the Operation as successful", function() {
            proxy.update(operation);
            
            expect(operation.setSuccessful).toHaveBeenCalled();
        });
        
        it("should add the record to the storage object", function() {
            proxy.update(operation);
            
            expect(proxy.setRecord).toHaveBeenCalledWith(record);
        });
        
        it("should call the callback function with the updated Operation", function() {
            var theOperation;
            
            proxy.update(operation, function(op) {
                theOperation = op;
            });
            
            expect(theOperation).toEqual(operation);
        });
        
        it("should call the callback function with the correct scope", function() {
            var theScope;
            
            proxy.update(operation, function() {
                theScope = this;
            }, fakeScope);
            
            expect(theScope).toBe(fakeScope);
        });
        
        describe("if the record is not already in the storage object", function() {
            it("should add the record's id to the set of ids", function() {
                spyOn(proxy, 'setIds').andCallThrough();
                
                proxy.update(operation);
                
                expect(proxy.setIds).toHaveBeenCalledWith([100]);
            });
        });
    });
    
    describe("setRecord", function() {
        var record, recordKey, encodedData;
        
        beforeEach(function() {
                        
            spyOn(fakeStorageObject, 'setItem').andReturn();
            spyOn(fakeStorageObject, 'removeItem').andReturn();
            
            proxy = new Ext.data.WebStorageProxy({
                model: Ext.ModelMgr.types.User,
                getStorageObject: function() {
                    return fakeStorageObject;
                },
                id: 'someId'
            });
            
            Ext.regModel('User', {
                fields: [
                    {name: 'id',   type: 'int'},
                    {name: 'name', type: 'string'}
                ]
            });
            
            record = Ext.ModelMgr.create({id: 100, name: 'Ed'}, 'User');
            recordKey = 'someId-100';
            encodedData = 'some encoded data';
            
            spyOn(Ext, 'encode').andReturn(encodedData);
            
            spyOn(record, 'setId').andCallThrough();
            spyOn(proxy, 'getRecordKey').andReturn(recordKey);
        });
        
        describe("if a new id is passed", function() {
            it("should set the id on the record", function() {
                proxy.setRecord(record, 20);
                
                expect(record.setId).toHaveBeenCalledWith(20);
            });
        });
        
        describe("if a new id is not passed", function() {
            it("should get the id from the record", function() {
                spyOn(record, 'getId').andCallThrough();
                
                proxy.setRecord(record);
                
                expect(record.getId).toHaveBeenCalled();
            });
        });
        
        it("should get the record key for the model instance", function() {
            proxy.setRecord(record);
            
            expect(proxy.getRecordKey).toHaveBeenCalledWith(100);
        });
        
        it("should remove the item from the storage object before adding it again", function() {
            proxy.setRecord(record);
            
            expect(fakeStorageObject.removeItem).toHaveBeenCalledWith(recordKey);
        });
        
        it("should add the item to the storage object", function() {
            proxy.setRecord(record);
            
            expect(fakeStorageObject.setItem).toHaveBeenCalledWith(recordKey, encodedData);
        });
        
        it("should json encode the data", function() {
            proxy.setRecord(record);
            
            expect(Ext.encode).toHaveBeenCalledWith(record.data);
        });
    });
    
    describe("caching reads", function() {
        
    });
    
    describe("reading", function() {
        var f, operation;
        
        beforeEach(function() {            
            config = {
                id: 42,
                initialize: jasmine.createSpy(),
                getStorageObject: function() {
                    return fakeStorageObject;
                }
            };
            
            proxy = new Ext.data.WebStorageProxy(config);
        });
        
        describe("if passed an id", function() {
            var fakeRecord;
            
            beforeEach(function() {
                fakeRecord = {};
                
                spyOn(proxy, 'getRecord').andReturn(fakeRecord);
                
                operation = new Ext.data.Operation({
                    id: 100
                });
            });
            
            it("should attempt to get the record for the given id", function() {
                proxy.read(operation);
                
                expect(proxy.getRecord).toHaveBeenCalledWith(100);
            });
            
            it("should mark the operation successful", function() {
                spyOn(operation, 'setSuccessful').andCallThrough();
                
                proxy.read(operation);
                
                expect(operation.setSuccessful).toHaveBeenCalled();
            });
            
            describe("the resultSet", function() {
                var resultSet;
                
                beforeEach(function() {
                    proxy.read(operation, function(op) {
                       resultSet = op.resultSet;
                    });
                });
                
                it("should contain the loaded record", function() {
                    expect(resultSet.records[0]).toEqual(fakeRecord);
                });

                it("should set the correct total number of records", function() {
                    expect(resultSet.total).toEqual(1);
                });
                
                it("should mark itself as loaded", function() {
                    expect(resultSet.loaded).toBe(true);
                });
            });
        });
        
        /**
         * NOTE: In this spec we have to stub out a lot of what is going on in the underlying storage object.
         * We're adding three fake records with ids 1, 2 and 3 - these have fake data and should be filtered
         * correctly by the Proxy
         */
        describe("if not passed an id", function() {
            var fakeRecords;
            
            beforeEach(function() {
                fakeRecords = [
                    {data: {id: 1, name: 'Ed',  email: 'ed@sencha.com'}},
                    {data: {id: 2, name: 'Ed',  email: 'edward@sencha.com'}},
                    {data: {id: 3, name: 'Abe', email: 'abe@sencha.com'}}
                ];
                
                operation = new Ext.data.Operation({
                    filters: [
                        new Ext.util.Filter({
                            property: 'name',
                            value   : 'Ed'
                        })
                    ]
                });
                
                proxy.getIds = function() {
                    return [1, 2, 3];
                };
                
                proxy.getRecord = function(id) {
                    return fakeRecords[id-1];
                };
                
                // fakeStorageObject.setItem();
            });
            
            it("should mark the operation successful", function() {
                spyOn(operation, 'setSuccessful').andCallThrough();
                
                proxy.read(operation);
                
                expect(operation.setSuccessful).toHaveBeenCalled();
            });
        });
    });
});
