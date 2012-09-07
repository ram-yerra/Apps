describe("Ext.util.Filter", function() {
    var filter;
    
    describe("construction", function() {
        var createFilter = function(config) {
            return function() {
                new Ext.util.Filter(config);
            };
        };
        
        it("should accept a property and value", function() {
            expect(createFilter({property: 'test', value: 'a'})).not.toThrow();
        });
        
        it("should accept a filter function", function() {
            expect(createFilter({filterFn: Ext.emptyFn})).not.toThrow();
        });
        
        //removed temporarily until Model can accept string ids. TODO: reinstate this after updating Model
        xit("should require at least a filter function or a property/value combination", function() {
            expect(createFilter()).toThrow();
        });
    });
    
    describe("creating filter functions", function() {
        var edRecord     = {name: 'Ed'},
            tedRecord    = {name: 'Ted'},
            abeRecord    = {name: 'Abe'},
            edwardRecord = {name: 'Edward'};
        
        it("should honor a simple property matcher", function() {
            filter = new Ext.util.Filter({
                property: 'name',
                value   : 'Ed'
            });
            
            expect(filter.filter(edRecord)).toBe(true);
            expect(filter.filter(edwardRecord)).toBe(true);
            expect(filter.filter(tedRecord)).toBe(false);
            expect(filter.filter(abeRecord)).toBe(false);
        });
        
        it("should honor anyMatch", function() {
            filter = new Ext.util.Filter({
                anyMatch: true,
                property: 'name',
                value   : 'Ed'
            });
            
            expect(filter.filter(edRecord)).toBe(true);
            expect(filter.filter(edwardRecord)).toBe(true);
            expect(filter.filter(tedRecord)).toBe(true);
            expect(filter.filter(abeRecord)).toBe(false);
        });
        
        it("should honor exactMatch", function() {
            filter = new Ext.util.Filter({
                exactMatch: true,
                property  : 'name',
                value     : 'Ed'
            });
            
            expect(filter.filter(edRecord)).toBe(true);
            expect(filter.filter(edwardRecord)).toBe(false);
            expect(filter.filter(tedRecord)).toBe(false);
            expect(filter.filter(abeRecord)).toBe(false);
        });
        
        it("should honor case sensitivity", function() {
            filter = new Ext.util.Filter({
                caseSensitive: true,
                property     : 'name',
                value        : 'Ed'
            });
            
            expect(filter.filter(edRecord)).toBe(true);
            expect(filter.filter(edwardRecord)).toBe(true);
            expect(filter.filter(tedRecord)).toBe(false);
        });
        
        it("should honor case sensitivity and anyMatch", function() {
            filter = new Ext.util.Filter({
                caseSensitive: true,
                anyMatch     : true,
                property     : 'name',
                value        : 'ed'
            });
            
            expect(filter.filter(tedRecord)).toBe(true);
            expect(filter.filter(edRecord)).toBe(false);
            expect(filter.filter(edwardRecord)).toBe(false);
        });
        
        it("should honor the root property", function() {
            var users = [
                {
                    data: {name: 'Ed'}
                },
                {
                    data: {name: 'Ted'}
                },
                {
                    data: {name: 'Edward'}
                },
                {
                    data: {name: 'Abe'}
                }
            ];
            
            var filter = new Ext.util.Filter({
                root    : 'data',
                property: 'name',
                value   : 'Ed'
            });
            
            expect(filter.filter(users[0])).toBe(true);
            expect(filter.filter(users[2])).toBe(true);
            expect(filter.filter(users[1])).toBe(false);
            expect(filter.filter(users[3])).toBe(false);
        });
    });
});
