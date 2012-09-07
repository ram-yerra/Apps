describe("Ext.data.MemoryProxy", function() {
    var proxy, data;
    
    beforeEach(function() {
        Ext.regModel('User', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'name',  type: 'string'},
                {name: 'phone', type: 'string', mapping: 'phoneNumber'}
            ]
        });
        
        data = {
            users: [
                {
                    id: 1,
                    name: 'Ed Spencer',
                    phoneNumber: '555 1234'
                },
                {
                    id: 2,
                    name: 'Abe Elias',
                    phoneNumber: '666 1234'
                }
            ]
        };
        
        proxy = new Ext.data.MemoryProxy({
            data: data,
            model: 'User',
            reader: {
                type: 'json',
                root: 'users'
            }
        });
    });
    
    afterEach(function() {
        delete Ext.ModelMgr.types.User;
    });
    
    describe("reading data", function() {
        var operation, records;
        
        beforeEach(function() {
            operation = new Ext.data.Operation({
                action: 'read'
            });
            
            proxy.read(operation, function(operation) {
                records = operation.getRecords();
            });
        });
        
        it("should read the records correctly", function() {
            expect(records.length).toEqual(2);
            
            expect(records[0].get('phone')).toEqual('555 1234');
        });
    });
});
