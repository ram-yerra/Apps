describe("Ext.data.Request", function() {
    var Request = Ext.data.Request;
    
    describe("instantiation", function(){
        var action = 'create',
            config = {
                action: action
            };
        
        it("shoud call Ext.apply 1 time", function(){
            var spy = spyOn(Ext, 'apply').andCallThrough();
            
            request = new Request(config);
                
            expect(spy).toHaveBeenCalledWith(request, config);
            
            delete request;
        });
        
        it("should have correct configuration options", function(){
            request = new Request();
            expect(request.action).toBeUndefined();
            expect(request.params).toBeUndefined();
            expect(request.method).toEqual('GET');
            expect(request.url).toBeUndefined();
            delete request;
        });
    });
});