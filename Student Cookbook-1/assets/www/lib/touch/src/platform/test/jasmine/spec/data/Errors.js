describe("Ext.data.Errors", function() {
    var errors;
    
    beforeEach(function() {
        errors = new Ext.data.Errors();
    });
    
    describe("if valid", function() {
        it("should return true to isValid", function() {
            expect(errors.isValid()).toBe(true);
        });
    });
    
    describe("if not valid", function() {
        beforeEach(function() {
            errors.add({
                field: 'name',
                error: 'must be present'
            });
            
            errors.add({
                name : 'email',
                error: 'is in the wrong format'
            });
        });
        
        it("should return false to isValid", function() {
            expect(errors.isValid()).toBe(false);
        });
        
        it("should return the errors for a single field", function() {
            var getByField = errors.getByField('name');
            
            expect(getByField.length).toEqual(1);
            expect(getByField[0].field).toEqual('name');
        });
    });
});