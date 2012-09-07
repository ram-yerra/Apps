describe("Ext.data.ProxyMgr", function() {
    var instantiatedProxy, 
        config;

    describe("create", function() {
        beforeEach(function() {
            config = {
                someStupidConfig: 666,
                type: "ajax"
            };
            instantiatedProxy = new Ext.data.AjaxProxy(config);
        });

        it("should create a proxy with the appropried type", function() {
            var proxyCreateWithMgr = Ext.data.ProxyMgr.create(config);

            expect(proxyCreateWithMgr).toEqual(instantiatedProxy);
        });

        it("should return directly the proxy if the first argument is already an instance of Ext.data.proxy", function() {
            expect(Ext.data.ProxyMgr.create(instantiatedProxy)).toBe(instantiatedProxy);
        });

        it("should throw an error if the type is not registered", function() {
            expect(function() {
                Ext.data.ProxyMgr.create("cylon");
            }).toThrow("The 'cylon' type has not been registered with this manager");
        });

        it("should create a proxy with a string as first arguments", function() {
            expect(Ext.data.ProxyMgr.create("ajax") instanceof Ext.data.AjaxProxy).toBe(true);
        });
    });
});

