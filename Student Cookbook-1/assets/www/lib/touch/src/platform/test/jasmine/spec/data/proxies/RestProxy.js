describe("Ext.data.RestProxy", function() {
    var proxy;
    
    beforeEach(function() {
        proxy = new Ext.data.RestProxy({});
    });

    describe("instantiation", function() {
        it("should extend Ext.data.AjaxProxy", function() {
            expect(proxy.superclass()).toEqual(Ext.data.AjaxProxy.prototype);
        });
        
        it("should have correct actionMethods", function() {
            var actionMethods =  {
                create : 'POST',
                read   : 'GET',
                update : 'PUT',
                destroy: 'DELETE'
            };
                
            expect(proxy.actionMethods).toEqual(actionMethods);
        });

        it("should have correct api", function() {
            var api =  {
                create : 'create',
                read   : 'read',
                update : 'update',
                destroy: 'destroy'
            };
                
            expect(proxy.api).toEqual(api);
        });
    });
    
    describe("building URLs", function() {
        var collectionOperation, singleOperation, collectionRequest, singleRequest, record1;
        
        function createProxy(config) {
            return new Ext.data.RestProxy(Ext.apply({}, config, {
                url: '/users'
            }));
        }
        
        function stripCache(url) {
            return url.split("?")[0];
        }
        
        beforeEach(function() {
            delete Ext.ModelMgr.types.User;
            
            var User = Ext.regModel('User', {
                fields: ['id', 'name', 'email']
            });
            
            record1 = new User({
                id   : 123,
                name : 'Ed Spencer',
                email: 'ed@sencha.com'
            });
            
            collectionOperation = new Ext.data.Operation({
                action: 'read',
                records: []
            });
            
            singleOperation = new Ext.data.Operation({
                action: 'read',
                records: [record1]
            });
            
            collectionRequest = new Ext.data.Request({
                operation: collectionOperation
            });
            
            singleRequest = new Ext.data.Request({
                operation: singleOperation
            });
        });
        
        afterEach(function() {
            delete Ext.ModelMgr.types.User;
        });
        
        describe("if there are no records in the Operation", function() {
            it("should not fail", function() {
                collectionOperation = new Ext.data.Operation({
                    action: 'read'
                });
                
                collectionRequest = new Ext.data.Request({
                    operation: collectionOperation
                });
                
                proxy = createProxy({appendId: false});
                
                expect(stripCache(proxy.buildUrl(collectionRequest))).toEqual('/users');
            });
        });
        
        describe("if appendId is false", function() {
            beforeEach(function() {
                proxy = createProxy({appendId: false});
            });
            
            it("should not append the ID to a single Operation", function() {
                expect(stripCache(proxy.buildUrl(collectionRequest))).toEqual('/users');
            });
            
            it("should not append the ID to a collection Operation", function() {
                expect(stripCache(proxy.buildUrl(singleRequest))).toEqual('/users');
            });
        });
        
        describe("if appendId is true", function() {
            beforeEach(function() {
                proxy = createProxy({appendId: true});
            });
            
            it("should append the ID to a single Operation", function() {
                expect(stripCache(proxy.buildUrl(collectionRequest))).toEqual('/users');
            });
            
            it("should not append the ID to a collection Operation", function() {
                expect(stripCache(proxy.buildUrl(singleRequest))).toEqual('/users/123');
            });
        });
        
        describe("if format is undefined", function() {
            beforeEach(function() {
                proxy = createProxy({
                    appendId: false, 
                    format  : undefined
                });
            });
            
            it("should not append the format to a single Operation", function() {
                expect(stripCache(proxy.buildUrl(collectionRequest))).toEqual('/users');
            });
            
            it("should not append the format to a collection Operation", function() {
                expect(stripCache(proxy.buildUrl(singleRequest))).toEqual('/users');
            });
        });
        
        describe("if a format is given", function() {
            beforeEach(function() {
                proxy = createProxy({
                    appendId: true,
                    format  : 'json'
                });
            });
            
            it("should append the format to a single Operation", function() {
                expect(stripCache(proxy.buildUrl(collectionRequest))).toEqual('/users.json');
            });
            
            it("should append the format to a collection Operation", function() {
                expect(stripCache(proxy.buildUrl(singleRequest))).toEqual('/users/123.json');
            });
        });
    });
});
