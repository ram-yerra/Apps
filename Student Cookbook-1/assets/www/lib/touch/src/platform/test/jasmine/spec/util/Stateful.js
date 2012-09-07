describe("Ext.util.Stateful", function() {
    var stateful;

    describe("instantiation", function() {
        beforeEach(function() {
            stateful = new Ext.util.Stateful();    
        });
        
        it("should be an extend of Ext.util.Observable", function() {
            expect(stateful.superclass()).toEqual(Ext.util.Observable.prototype);
        });
        
        it("should create an empty data object if there is no data property in configuration", function() {
            expect(stateful.data).toEqual({});
        });
        
        describe("properties", function() {
            it("should have default persistanceProperty set to data", function() {
                expect(stateful.persistanceProperty).toEqual("data");
            });
            
            it("should create an empty modified object", function() {
                expect(stateful.modified).toEqual({});
            });
            
            it("should create an empty persistable object", function() {
                expect(stateful[stateful.persistanceProperty]).toEqual({});
            });
        });
    });
});
