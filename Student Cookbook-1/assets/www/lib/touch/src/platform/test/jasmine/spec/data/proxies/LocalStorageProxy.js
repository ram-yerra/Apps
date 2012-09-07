describe("Ext.data.LocalStorageProxy", function() {
    var proxy;

    if (window.localStorage) {
        beforeEach(function() {
            proxy = new Ext.data.LocalStorageProxy({id: 1});
        });
        
        describe("instantiation", function() {
            it("should extend Ext.data.WebStorageProxy", function() {
                expect(proxy.superclass()).toEqual(Ext.data.WebStorageProxy.prototype);
            });
        });

        describe("methods", function() {
            describe("getStorageObject", function() {
                it("should return localStorage object", function() {
                    // IE8 throw Class doesn't support Automation when comparing localStorage to itself (or sessionStorage)
                    var automationBug = false;
                    try {
                        localStorage === localStorage;
                    } catch(e) {
                        automationBug = true;
                    }
                    if (!automationBug) {
                        expect(proxy.getStorageObject()).toEqual(localStorage);
                    } else { 
                        var storageObject = proxy.getStorageObject();
                        expect(window.localStorage.setItem === storageObject.setItem).toBe(true);
                    }
                });
            });
        });
    } else {
        describe("instantiation", function() {
            it("should throw an error", function() {
                expect(function() {
                    new Ext.data.LocalStorageProxy({id: 1});
                }).toThrow("Local Storage is not supported in this browser, please use another type of data proxy");
            });
        });
    }
});
