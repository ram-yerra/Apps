describe("Ext.data.ArrayReader", function() {
    var reader, data, records;
    
    beforeEach(function() {
        Ext.regModel('SomeModel', {
            fields: [
               {name: 'floater', type: 'float'},
               {name: 'id'},
               {name: 'totalProp', type: 'integer'},
               {name: 'bool', type: 'boolean'},
               {name: 'msg'}
            ]
        });
        
        reader = new Ext.data.ArrayReader({
            model: 'SomeModel'
        });
        
        data = [
            [ 1.23, 1, 6, true, 'hello' ]
        ];
        
        records = reader.readRecords(data);
    });
    
    it("should find the total number of records", function() {
        expect(records.total).toEqual(1);
    });
    
    it("should extract the records correctly", function() {
        var recData = records.records[0].data;
        
        expect(recData.floater).toEqual(data[0][0]);
        expect(recData.id).toEqual(data[0][1]);
        expect(recData.totalProp).toEqual(data[0][2]);
        expect(recData.bool).toEqual(data[0][3]);
        expect(recData.msg).toEqual(data[0][4]);
    });
});
