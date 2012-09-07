describe("Ext.data.ResultSet", function() {
    var resultset,
        ModelMgr = Ext.ModelMgr,
        ResultSet = Ext.data.ResultSet;
    
    describe("instantiation with records", function(){

        var config, nico, flo;
        
        beforeEach(function(){
            ModelMgr.registerType('User', {
                fields: [
                    {name: 'name',  type: 'string'}
                ]
            });
            
            nico = ModelMgr.create({name: 'nico'}, 'User');
            flo = ModelMgr.create({name: 'flo'}, 'User');
            
            config = {
                records: [nico, flo]
            };
        });
        
        afterEach(function(){
            delete ModelMgr.types['User'];
            delete resultset;
            delete nico;
            delete flo;
        });

        it("shoud call Ext.apply 1 time", function(){ //spyOn doesn't work with array in objects !!!
            var spy = spyOn(Ext, 'apply').andCallThrough();
            
            resultset = new ResultSet(config);
            expect(spy).toHaveBeenCalledWith(resultset, config);
        });
        
        it("shoud have count equal to records.length", function(){
            resultset = new ResultSet(config);
            expect(resultset.loaded).toBe(true);
            expect(resultset.count).toEqual(2);
            expect(resultset.total).toEqual(0);
            expect(resultset.totalRecords).toEqual(0);
            expect(resultset.success).toBe(false);
        });
        
    });
    
    describe("instantiation without records and with a count", function(){
        var config = {count: 16};
    
        
        afterEach(function(){
            delete resultset;
        });
        
        it("should have correct configuration options", function(){
            resultset = new ResultSet(config);
            expect(resultset.loaded).toBe(true);
            expect(resultset.count).toEqual(16);
            expect(resultset.total).toEqual(0);
            expect(resultset.totalRecords).toEqual(0);
            expect(resultset.success).toBe(false);
        });
        
    });
});