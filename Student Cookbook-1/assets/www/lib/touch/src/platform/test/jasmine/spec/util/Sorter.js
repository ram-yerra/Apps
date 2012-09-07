describe("Ext.util.Sorter", function() {
    var sorter;
    
    describe("instantiation", function() {
        var createSorter = function(config) {
            return function() {
                new Ext.util.Sorter(config);
            };
        };
        
        it("should require either a property or a function", function() {
            expect(createSorter({})).toThrow();
        });
        
        it("should accept a property config", function() {
            expect(createSorter({property: 'test'})).not.toThrow();
        });
        
        it("should accept a sorter function", function() {
            expect(createSorter({sorterFn: Ext.emptyFn})).not.toThrow();
        });
    });
    
    describe("building sorter functions", function() {
        it("should default to sorting ASC", function() {
            sorter = new Ext.util.Sorter({
                property: 'age'
            });
            
            var rec1   = {age: 24},
                rec2   = {age: 25},
                result = sorter.sort(rec1, rec2);
            
            expect(result).toEqual(-1);
        });
        
        it("should accept DESC direction", function() {
            sorter = new Ext.util.Sorter({
                property : 'age',
                direction: 'DESC'
            });
            
            var rec1   = {age: 24},
                rec2   = {age: 25},
                result = sorter.sort(rec1, rec2);
            
            expect(result).toEqual(1);
        });
        
        it("should allow specification of the root property", function() {
            sorter = new Ext.util.Sorter({
                root    : 'data',
                property: 'age'
            });
            
            var rec1   = {data: {age: 24}},
                rec2   = {data: {age: 25}},
                result = sorter.sort(rec1, rec2);
            
            expect(result).toEqual(-1);
        });
    });
});
