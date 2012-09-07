describe("Ext.data.ClientProxy", function() {
    var proxy;
    
    beforeEach(function() {
        proxy = new Ext.data.ClientProxy();
    });
    
    it("should extend Ext.data.Proxy", function() {
        expect(proxy.superclass()).toEqual(Ext.data.Proxy.prototype);
    });
    
    it("should throw an error on clear", function() {
        expect(function() {proxy.clear();}).toThrow();
    });
});