describe("validations", function() {
    var validation, config;
    
    describe("validating presence", function() {
        beforeEach(function() {
            validation = Ext.data.validations.presence;
        });
        
        it("should reject undefined values", function() {
            expect(validation(undefined)).toBe(false);
        });
        
        it("should reject null values", function() {
            expect(validation(null)).toBe(false);
        });
        
        it("should reject empty strings", function() {
            expect(validation("")).toBe(false);
        });
        
        it("should reject null values", function() {
            expect(validation(null)).toBe(false);
        });
        
        it("should reject undefined values", function() {
            expect(validation(undefined)).toBe(false);
        });
    });
    
    describe("validating length", function() {
        beforeEach(function() {
            validation = Ext.data.validations.length;
            
            config = {
                min: 4,
                max: 6
            };
        });
        
        it("should reject undefined", function() {
            expect(validation(config, undefined)).toBe(false);
        });
        
        it("should reject strings that are too short", function() {
            expect(validation(config, "a")).toBe(false);
        });
        
        it("should reject strings that are too long", function() {
            expect(validation(config, '1234567890')).toBe(false);
        });
        
        it("should accept strings that are within the bounds", function() {
            expect(validation(config, '12345')).toBe(true);
        });
    });
    
    describe("validating inclusion", function() {
        beforeEach(function() {
            validation = Ext.data.validations.inclusion;
            
            config = {
                list: ['some', 'list']
            };
        });
        
        it("should reject undefined", function() {
            expect(validation(config, undefined)).toBe(false);
        });
        
        it("should reject values not in the list", function() {
            expect(validation(config, 'not in the list')).toBe(false);
        });
        
        it("should accept values in the list", function() {
            expect(validation(config, 'some')).toBe(true);
        });
    });
    
    describe("validating exclusion", function() {
        beforeEach(function() {
            validation = Ext.data.validations.exclusion;
            
            config = {
                list: ['some', 'list']
            };
        });
        
        it("should accept undefined", function() {
            expect(validation(config, undefined)).toBe(true);
        });
        
        it("should accept values not in the list", function() {
            expect(validation(config, 'not in the list')).toBe(true);
        });
        
        it("should reject values in the list", function() {
            expect(validation(config, 'some')).toBe(false);
        });
    });
    
    describe("validating format", function() {
        beforeEach(function() {
            validation = Ext.data.validations.format;
            
            config = {
                matcher: /[123]+/
            };
        });
        
        it("should accept values that conform to the matcher", function() {
            expect(validation(config, '222')).toBe(true);
        });
        
        it("should reject values that do not conform to the matcher", function() {
            expect(validation(config, 'abc')).toBe(false);
        });
    });
});