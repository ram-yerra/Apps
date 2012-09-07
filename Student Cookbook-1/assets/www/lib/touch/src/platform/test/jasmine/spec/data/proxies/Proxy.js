describe("Ext.data.Proxy", function() {
    var proxy,
        Proxy = Ext.data.Proxy,
        AlienModelName   = 'Alien',
        AlienModelConfig =  {
            fields: [
                {name: 'name',  type: 'string'},
                {name: 'age',   type: 'int'},
                {name: 'planet', type: 'string'}
            ]
        },
        AlienModel = Ext.regModel(AlienModelName, AlienModelConfig),
        HumanModelName   = 'Human',
        HumanModelConfig =  {
            fields: [
                {name: 'name',  type: 'string'},
                {name: 'age',   type: 'int'},
                {name: 'planet', type: 'string', defaultValue: 'Earth'}
            ]
        },
        HumanModel = Ext.regModel(HumanModelName, HumanModelConfig);
        
        beforeEach(function() {
        proxy = new Proxy({});
    });
        
    afterEach(function() {
        delete proxy;    
    });
    
    it("should be an extend of Ext.util.Observable", function() {
        expect(proxy.superclass()).toEqual(Ext.util.Observable.prototype);
    });
    
    describe("instantiation", function() {
        it("should have correct config options", function() {
            expect(proxy.batchOrder).toEqual('create,update,destroy');
        });
        
        it("should have methods create, read, update, destroy equals to EmptyFn", function() {
            expect(proxy.create).toEqual(Ext.emptyFn);
            expect(proxy.read).toEqual(Ext.emptyFn);
            expect(proxy.update).toEqual(Ext.emptyFn);
            expect(proxy.destroy).toEqual(Ext.emptyFn);
        });
    });
    
    describe("methods", function() {
        describe("getModel", function() {
            beforeEach(function() {
                proxy.setModel(AlienModel);
            });
            
            it ("should return the proxy model", function() {
                expect(proxy.getModel()).toEqual(AlienModel);
            });
        });
        
        describe("setModel", function() {
            it('should have a model equal to AlienModel', function(){
                proxy.setModel(AlienModel);
                expect(proxy.model).toEqual(AlienModel);
            });
            
            it("should set the model on the Store", function() {
                var store = {
                    setModel: Ext.emptyFn
                };
                proxy.store = store;
                
                spyOn(store, 'setModel').andCallThrough();
                
                proxy.setModel(AlienModel, true);
                
                expect(store.setModel).toHaveBeenCalledWith(AlienModel);
            });
            
            describe("if the Reader has already been instantiated", function() {
                beforeEach(function() {
                    proxy.reader = new Ext.data.Reader({
                        model: 'AlienModel'
                    });
                    
                    spyOn(proxy.reader, 'setModel').andReturn(true);
                });
                
                it("should set the Reader's Model", function() {
                    proxy.setModel(AlienModel);
                    
                    expect(proxy.reader.setModel).toHaveBeenCalledWith(AlienModel);
                });
            });
        });
        
        describe("batch", function() {
            var spy,
                batchOperations = {
                    create : [AlienModel, HumanModel],
                    update : [AlienModel]
                },
                batchListeners = {
                    complete: {
                        fn    : Ext.emptyFn,
                        scope : this
                    }
                };
                
            it('should run Ext.data.Batch.prototype.add 2 times', function() {
                spy = spyOn(Ext.data.Batch.prototype, 'add').andCallThrough();
                proxy.batch(batchOperations, batchListeners); 
                expect(spy.callCount).toEqual(2);
            });
            
            it('should run Ext.data.Batch.prototype.start 1 times', function(){
                spy = spyOn(Ext.data.Batch.prototype, 'start').andCallThrough();
                proxy.batch(batchOperations, batchListeners); 
                expect(spy.callCount).toEqual(1);
            });
        });
    });
});