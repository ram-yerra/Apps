describe("A Model", function() {
    var user, customUser, validations, User;
    
    beforeEach(function() {
        Ext.regModel('Article', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'title', type: 'string'},
                {name: 'body',  type: 'string'}
            ]
        });
        
        Ext.regModel('Group', {
            fields: [
                {name: 'id',   type: 'int'},
                {name: 'name', type: 'string'}
            ]
        });
        
        validations = [
            {type: 'presence',  field: 'id'},
            {type: 'length',    field: 'description', min: 100, max: 200},
            {type: 'inclusion', field: 'color', list: ['red', 'white', 'blue']},
            {type: 'exclusion', field: 'first', list: ['Ed']},

            {type: 'format',    field: 'email', matcher: /123/}
        ];
        
        User = Ext.regModel('User', {
            fields: [
                {name: 'id',          type: 'int'},
                {name: 'first',       type: 'string'},
                {name: 'email',       type: 'string'},
                {name: 'phone',       type: 'string'},
                {name: 'color',       type: 'string'},
                {name: 'description', type: 'string'},
                {
                    name: 'initial', 
                    type: 'string',
                    convert: function(value, record) {
                        return value.toUpperCase();
                    }
                }
            ],
            
            validations: validations,
            
            doValidate: function() {
                //custom validations
            }
        });
        
        Ext.regModel('CustomUser', {
            idProperty: 'customId',
            fields: [
                {name: 'customId', type: 'int'},
                {name: 'first',    type: 'string'}
            ]
        });
        
        user = Ext.ModelMgr.create({
            id   : 10,
            first: 'Ed',
            last : 'Spencer',
            initial: 't'
        }, 'User');
        
        customUser = Ext.ModelMgr.create({
            customId: 100,
            first   : 'Tommy'
        }, 'CustomUser');
    });
    
    describe("initializing", function() {
        it("should set passed data", function() {
            expect(user.data.first).toEqual("Ed");
            expect(user.data.id).toEqual(10);
        });
        
        it("should set the phantom status", function() {
            expect(user.phantom).toBe(false);
        });
        
        it("should use a convert function if specified", function() {
            expect(user.data.initial).toEqual('T');
        });
        
        it("should call the init function", function() {
            var executed = false;
            
            var Product = Ext.regModel('Product', {
                fields: [],
                init: function() {
                    executed = true;
                }
            });
            
            new Product({});
            
            expect(executed).toBe(true);
        });
    });
    
    describe("instantiation", function() {
        var instance, data, User;
        
        beforeEach(function() {
            data = {
                id: 50,
                first: 'Ariya',
                last : 'Hidayat'
            };
            
            User = Ext.ModelMgr.types.User;
        });
        
        it("should set its values", function() {
            spyOn(Ext.data.Model.prototype, 'set').andCallThrough();
            
            new User(data);
            
            expect(Ext.data.Model.prototype.set).toHaveBeenCalledWith(data);
        });
        
        it("should not be dirty", function() {
            instance = new User(data);
            
            expect(instance.dirty).toBe(false);
        });
    });
    
    describe("running validations", function() {
        var instance;
        
        beforeEach(function() {
            instance = Ext.ModelMgr.create({
                id: 10,
                first: 'Ed',
                email: 'ed@sencha.com',
                description: 'Test',
                color: 'red'
            }, 'User');
            
            Ext.each(['presence', 'length', 'inclusion', 'exclusion', 'format'], function(name) {
                spyOn(Ext.data.validations, name).andCallThrough();
            }, this);
            
            instance.validate();
        });
        
        it("should collect failing validations into an Errors object", function() {
            var errors = instance.validate();
            
            expect(errors instanceof Ext.data.Errors).toBe(true);
        });
        
        describe("the Errors object", function() {
            var validations = Ext.data.validations,
                errors;
            
            beforeEach(function() {
                instance = Ext.ModelMgr.create({
                    description: 'this is too short',
                    color: 'not a valid color',
                    first: 'Ed',
                    email: 'abc'
                }, 'User');
                
                errors = instance.validate();
            });
            
            it("should have the correct number of error messages", function() {
                expect(errors.items.length).toEqual(5);
            });
            
            it("should have the correct non-presence message", function() {
                expect(errors.get(errors.findIndex('field', 'id')).message).toEqual(validations.presenceMessage);
            });
            
            it("should have the correct bad length message", function() {
                expect(errors.get(errors.findIndex('field', 'description')).message).toEqual(validations.lengthMessage);
            });
            
            it("should have the correct bad format message", function() {
                expect(errors.get(errors.findIndex('field', 'email')).message).toEqual(validations.formatMessage);
            });
            
            it("should have the correct non-inclusion message", function() {
                expect(errors.get(errors.findIndex('field', 'color')).message).toEqual(validations.inclusionMessage);
            });
            
            it("should have the correct non-exclusion message", function() {
                expect(errors.get(errors.findIndex('field', 'first')).message).toEqual(validations.exclusionMessage);
            });
        });
        
        describe("custom error messages", function() {
            beforeEach(function() {
                Ext.regModel('Product', {
                    fields: [
                        {name: 'name', type: 'string'}
                    ],
                    
                    validations: [
                        {type: 'presence', field: 'name', message: 'my custom message'}
                    ]
                });
            });
            
            it("should allow user-defined error messages", function() {
                var product = Ext.ModelMgr.create({}, 'Product'),
                    errors  = product.validate(),
                    error   = errors.items[0];
                
                expect(error.message).toEqual('my custom message');
            });
        });
        
        it("should map 'presence' to a Presence validation", function() {
            expect(Ext.data.validations.presence).toHaveBeenCalledWith(validations[0], 10);
        });
        
        it("should map 'length' to a Length validation", function() {
            expect(Ext.data.validations.length).toHaveBeenCalledWith(validations[1], 'Test');
        });
        
        it("should map 'inclusion' to a Inclusion validation", function() {
            expect(Ext.data.validations.inclusion).toHaveBeenCalledWith(validations[2], 'red');
        });
        
        it("should map 'exclusion' to a Exclusion validation", function() {
            expect(Ext.data.validations.exclusion).toHaveBeenCalledWith(validations[3], 'Ed');
        });
        
        it("should map 'format' to a Format validation", function() {
            expect(Ext.data.validations.format).toHaveBeenCalledWith(validations[4], 'ed@sencha.com');
        });
    });
    
    describe("static loading via a proxy", function() {
        var fakeProxy, fakeReadFn, readArgs;
        
        var loadModel = function(config) {
            User.load(10, config);
        };
        
        beforeEach(function() {
            readArgs = [];
            
            fakeProxy = {
                read: function() {
                    readArgs = arguments;
                }
            };
            
            User.proxy = fakeProxy;
            
            spyOn(fakeProxy, 'read').andCallThrough();
        });
        
        it("should issue a read to the Proxy", function() {
            loadModel();
            
            expect(fakeProxy.read).toHaveBeenCalled();
        });
        
        it("should pass an Operation to the Proxy", function() {
            loadModel();
            
            expect(readArgs[0] instanceof Ext.data.Operation).toBe(true);
        });
        
        it("should pass a custom callback function to the Proxy's read function", function() {
            loadModel();
            
            expect(typeof readArgs[1] == 'function').toBe(true);
        });
        
        it("should pass any user configuration to the Operation", function() {
            loadModel({
                myProperty: 'someValue'
            });
            
            expect(readArgs[0].myProperty).toEqual('someValue');
        });
        
        describe("the Operation", function() {
            var operation;
            
            beforeEach(function() {
                loadModel();
                
                operation = readArgs[0];
            });
            
            it("should use the 'read' action", function() {
                expect(operation.action).toEqual('read');
            });
            
            it("should set the correct id", function() {
                expect(operation.id).toEqual(10);
            });
        });
        
        describe("when the Operation has completed", function() {
            var callbackFn, successFn, failureFn, fakeOperation, fakeRecord;
            
            loadModel = function(config) {
                User.load(10, Ext.apply({
                    scope: fakeScope,
                    callback: callbackFn,
                    failure : failureFn,
                    success : successFn
                }, config));
            };
            
            beforeEach(function() {
                fakeRecord = {
                    data: {}
                };
                
                fakeOperation = {
                    getRecords: function() {
                        return [fakeRecord];
                    },
                    wasSuccessful: function() {
                        return true;
                    }
                };
                
                //here we just fake the completion of the proxy load
                fakeProxy.read = function(operation, callback, scope) {
                    callback.call(scope, fakeOperation);
                };
                
                callbackFn = jasmine.createSpy('callbackFn');
                failureFn  = jasmine.createSpy('failureFn');
                successFn  = jasmine.createSpy('successFn');
            });
            
            it("should call the callback function", function() {
                loadModel();
                
                expect(callbackFn).toHaveBeenCalled();
            });
            
            it("should call the callback in the correct scope", function() {
                var theScope;
                
                callbackFn = function() {
                    theScope = this;
                };
                
                loadModel();
                
                expect(theScope).toBe(fakeScope);
            });
            
            describe("if the Operation was successful", function() {
                beforeEach(function() {
                    spyOn(fakeOperation, 'wasSuccessful').andReturn(true);
                });
                
                it("should call the success callback", function() {
                    loadModel();
                    
                    expect(successFn).toHaveBeenCalled();
                });
                
                it("should use the correct scope", function() {
                    var theScope;

                    successFn = function() {
                        theScope = this;
                    };

                    loadModel();

                    expect(theScope).toBe(fakeScope);
                });
                
                it("should pass the loaded record to the callback", function() {
                    var theRecord;
                    
                    successFn = function(record) {
                        theRecord = record;
                    };
                    
                    loadModel();
                    
                    expect(theRecord).toEqual(fakeRecord);
                });
                
                it("should pass the Operation object to the callback", function() {
                    var theOperation;
                    
                    successFn = function(record, operation) {
                        theOperation = operation;
                    };
                    
                    loadModel();
                    
                    expect(theOperation).toEqual(fakeOperation);
                });
            });

            describe("if the Operation was not successful", function() {
                beforeEach(function() {
                    spyOn(fakeOperation, 'wasSuccessful').andReturn(false);
                });
                
                it("should call the failure callback", function() {
                    loadModel();
                    
                    expect(failureFn).toHaveBeenCalled();
                });
                
                it("should use the correct scope", function() {
                    var theScope;

                    failureFn = function() {
                        theScope = this;
                    };

                    loadModel();

                    expect(theScope).toBe(fakeScope);
                });
                
                it("should pass the (non-loaded) record instance to the failure callback", function() {
                    var theRecord;
                    
                    failureFn = function(record) {
                        theRecord = record;
                    };
                    
                    loadModel();
                    
                    expect(theRecord).toEqual(fakeRecord);
                });
                
                it("should pass the Operation object to the failure callback", function() {
                    var theOperation;
                    
                    failureFn = function(record, operation) {
                        theOperation = operation;
                    };
                    
                    loadModel();
                    
                    expect(theOperation).toEqual(fakeOperation);
                });
            });
        });
    });
    
    describe("saving via its proxy", function() {
        var instance, operation, proxy, failureCb, successCb;
        
        function doSave() {
            instance.save({
                failure: failureCb,
                success: successCb
            });
        }
        
        beforeEach(function() {
            failureCb = jasmine.createSpy('failureCb');
            successCb = jasmine.createSpy('successCb');
            
            proxy = {
                create: function(op, callback) {
                    operation = op;
                    spyOn(operation, 'wasSuccessful').andReturn(true);
                    
                    callback(op);
                },
                update: function(op, callback) {
                    operation = op;
                    spyOn(operation, 'wasSuccessful').andReturn(true);
                    
                    callback(op);
                }
            };
            
            var model = Ext.regModel("SomeModel", {
                fields: [
                    'id', 'name'
                ]
            });
            
            model.proxy = proxy;
            
            instance = new model({});
        });
        
        afterEach(function() {
            delete Ext.ModelMgr.types.SomeModel;
        });
        
        describe("if the model had already been saved", function() {
            beforeEach(function() {
                spyOn(proxy, 'create').andCallThrough();
                spyOn(proxy, 'update').andCallThrough();
                
                instance.phantom = false;
                doSave();
            });
            
            it("should call the Proxy's update function", function() {
                expect(proxy.update).toHaveBeenCalled();
            });
            
            it("should pass in an update Operation", function() {
                expect(operation.action).toEqual('update');
            });
            
            it("should mark itself as not dirty", function() {
                expect(instance.dirty).toBeFalsy();
            });
        });
        
        describe("if the model had never been saved before", function() {
            var successful;
            
            beforeEach(function() {
                spyOn(proxy, 'create').andCallFake(function(op, callback) {
                    operation = op;
                    
                    op.wasSuccessful = function() {
                        return successful;
                    };
                    
                    callback(op);
                });
                
                spyOn(proxy, 'update').andCallThrough();
                
                instance.phantom = true;
                doSave();
            });
            
            it("should call the Proxy's create function", function() {
                expect(proxy.create).toHaveBeenCalled();
            });
            
            it("should pass in a create Operation", function() {
                expect(operation.action).toEqual('create');
            });
            
            describe("if successful", function() {
                beforeEach(function() {
                    successful = true;
                    
                    spyOn(instance, 'set').andCallThrough();
                    
                    doSave();
                });
                
                it("should call the success callback", function() {
                    expect(successCb).toHaveBeenCalled();
                });
                
                it("should mark itself as not dirty", function() {
                    expect(instance.dirty).toBeFalsy();
                });
                
                it("should set its values to the values returned by the server", function() {
                    expect(instance.set).toHaveBeenCalled();
                });
            });
            
            describe("if not successful", function() {
                beforeEach(function() {
                    successful = false;

                    doSave();
                });
                
                it("should call the failure callback", function() {
                    expect(failureCb).toHaveBeenCalled();
                });
            });
        });
    });
    
    describe("getting values", function() {
        it("should get id", function() {
            expect(user.getId()).toEqual(10);
        });
        
        it("should get custom id", function() {
            expect(customUser.getId()).toEqual(100);
        });
        
        it("should get a value", function() {
            expect(user.get('first')).toEqual('Ed');
        });        
    });
    
    describe("setting values", function() {
        it("should set id", function() {
            user.setId(20);
            
            expect(user.getId()).toEqual(20);
        });
        
        it("should set a value", function() {
            user.set('first', 'Edward');
            
            expect(user.data.first).toEqual('Edward');
        });
        
        it("should use a convert function if specified", function() {
            user.set('initial', 'j');
            
            expect(user.data.initial).toEqual('J');
        });
    });
    
    describe("store binding", function() {
        var store;
        
        beforeEach(function() {
            store = new Ext.data.Store({
                model: 'User'
            });
        });
        
        it("should join a store", function() {
            user.join(store);
            
            expect(user.store).toEqual(store);
        });
        
        it("should unjoin store", function() {
            user.join(store);
            
            user.unjoin(store);
            expect(user.store).not.toBeDefined();
        });
        
        describe("when joined to a store", function() {
            beforeEach(function() {
                user.join(store);
            });
            
            it("should call afterEdit", function() {
                spyOn(store, 'afterEdit');
                
                user.afterEdit();
                
                expect(store.afterEdit).toHaveBeenCalled();
            });
            
            it("should call afterCommit", function() {
                spyOn(store, 'afterCommit');
                
                user.afterCommit();
                
                expect(store.afterCommit).toHaveBeenCalled();
            });
            
            it("should call afterReject", function() {
                spyOn(store, 'afterReject');
                
                user.afterReject();
                
                expect(store.afterReject).toHaveBeenCalled();
            });
        });
    });
});
