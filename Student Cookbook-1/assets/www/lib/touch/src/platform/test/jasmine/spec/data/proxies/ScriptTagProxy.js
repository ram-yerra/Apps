describe("Ext.data.ScriptTagProxy", function() {
   var proxy;
   
    beforeEach(function(){
        proxy = new Ext.data.ScriptTagProxy({noCache: false});
    });
    
    describe("instantiation", function() {
        it("should extend Ext.data.ServerProxy", function(){
            expect(proxy.superclass()).toEqual(Ext.data.ServerProxy.prototype);
        });
        
        it("should have defaultWriterType equal to base", function(){
            expect(proxy.defaultWriterType).toEqual('base');
        });
        
        it("should have callbackParam equal to callback", function(){
            expect(proxy.callbackParam).toEqual('callback');
        });
        
        it("should have scriptIdPrefix equal to stcScript", function(){
            expect(proxy.scriptIdPrefix).toEqual('stcScript');
        });

        it("should have callbackPrefix equal to stcCallback", function(){
            expect(proxy.callbackPrefix).toEqual('stcCallback');
        });

        it("should have recordParam equal to records", function(){
            expect(proxy.recordParam).toEqual('records');
        });

        it("should not have lastRequest defined", function(){
            expect(proxy.lastRequest).not.toBeDefined();
        });
    });
   
    describe("methods", function() {
        describe("buildUrl and encodeRecords", function() {
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
                }, HumanModelName),
                request = new Ext.data.Request({
                        url: 'somewhere',
                        records: [nicolas],
                        params: {
                            beyond: 'the_sea',
                            filters: [
                                new Ext.util.Filter({
                                    property: 'filter',
                                    value   : 'value'
                                })
                            ]
                        }
                });
            it("should return a url based on a given Ext.data.Request object", function() {
                var expected = 'somewhere?beyond=the_sea&filter=value&records=id=1&name=Nicolas&age=27&planet=Earth';
                
                expect(proxy.buildUrl(request)).toEqual(expected);
            });
        });
         
        describe("isLoading", function() {
            it("should not have a request pending", function() {
                expect(proxy.isLoading()).toBe(false);
            });
        });
    });
});