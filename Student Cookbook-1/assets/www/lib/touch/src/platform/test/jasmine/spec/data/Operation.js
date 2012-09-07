describe("Ext.data.Operation", function() {
    var operation;
    
    beforeEach(function() {
        Ext.regModel('Alien', {
            fields: [
                {name: 'name',  type: 'string'},
                {name: 'age',   type: 'int'},
                {name: 'planet', type: 'string'}
            ]
        });
        
        operation = new Ext.data.Operation();
    });
    
    describe("starting values", function() {
        it("should by synchronous", function() {
            expect(operation.synchronous).toBe(true);
        });
        
        it("should not have an action", function() {
            expect(operation.action).not.toBeDefined();
        });
        
        it("should not have any filters", function() {
            expect(operation.filters).not.toBeDefined();
        });
        
        it("should not have any sorters", function() {
            expect(operation.sorters).not.toBeDefined();
        });
        
        it("should not have any grouping", function() {
            expect(operation.group).not.toBeDefined();
        });
        
        it("should not have a start index", function() {
            expect(operation.start).not.toBeDefined();
        });
        
        it("should not have a limit defined", function() {
            expect(operation.limit).not.toBeDefined();
        });
        
        it("should not have a batch defined", function() {
            expect(operation.batch).not.toBeDefined();
        });
        
        it("should not have started yet", function() {
            expect(operation.started).toBe(false);
        });
        
        it("should not be running yet", function() {
            expect(operation.running).toBe(false);
        });
        
        it("should not be complete yet", function() {
            expect(operation.complete).toBe(false);
        });
        
        it("should not have a success property yet", function() {
            expect(operation.success).not.toBeDefined();
        });
        
        it("should not have encountered an exception", function() {
            expect(operation.exception).toBe(false);
        });
        
        it("should not have an error property yet", function() {
            expect(operation.error).not.toBeDefined();
        });
    });
    
    describe("marking started", function() {
        beforeEach(function() {
            operation.setStarted();
        });
        
        it("should be started", function() {
            expect(operation.isStarted()).toBe(true);
        });
        
        it("should be running", function() {
            expect(operation.isRunning()).toBe(true);
        });
    });
    
    describe("marking completed", function() {
        beforeEach(function() {
            operation.setStarted();
            operation.setCompleted();
        });
        
        it("should not be running", function() {
            expect(operation.isRunning()).toBe(false);
        });
        
        it("should be complete", function() {
            expect(operation.isComplete()).toBe(true);
        });
        
        it("should not have defined success", function() {
            expect(operation.success).not.toBeDefined();
        });
        
        it("should still have been started", function() {
            expect(operation.isStarted()).toBe(true);
        });
    });
    
    describe("marking an exception", function() {
        var error;
        
        beforeEach(function() {
            error = "There was an error somewhere... curses!";
            
            operation.setException(error);
        });
        
        it("should have encountered an exception", function() {
            expect(operation.hasException()).toBe(true);
        });
        
        it("should return the error", function() {
            expect(operation.getError()).toEqual(error);
        });
        
        it("should not still be running", function() {
            expect(operation.isRunning()).toBe(false);
        });
        
        it("should not be marked complete", function() {
            expect(operation.isComplete()).toBe(false);
        });
        
        it("should not be successful", function() {
            expect(operation.wasSuccessful()).toBe(false);
        });
    });
    
    it("should set a batch", function() {
        var batch = 'some batch object';
        
        operation.setBatch(batch);
        
        expect(operation.batch).toEqual(batch);
    });
});
