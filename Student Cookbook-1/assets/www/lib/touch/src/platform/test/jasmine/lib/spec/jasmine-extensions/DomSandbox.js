describe("jasmine.DomSandbox", function() {
    var fakeWindow,
        fakeBody,
        domSandbox,
        saveGetWindow,
        saveGetBody;

    beforeEach(function() {
        fakeWindow =  {
            location: {
                search: '',
                reload: function() {}
            }
        };
        
        fakeBody = sandBox();
        
        saveGetWindow = jasmine.util.getWindow;
        jasmine.util.getWindow = function() {
            return fakeWindow;
        };

        saveGetBody = jasmine.util.getBody;
        jasmine.util.getBody = function() {
            return fakeBody;
        };
    });

    afterEach(function() {
        jasmine.util.getWindow = saveGetWindow;
        jasmine.util.getBody = saveGetBody;
    });
    
    describe("initialization", function() {
        beforeEach(function() {
            domSandbox = new jasmine.DomSandbox();
        });
        
        it("should initialize an empty sandbox collection", function() {
            expect(domSandbox.sandboxes).toEqual({});
        });

        it("should create an global variable sandbox function", function() {
            expect(typeof jasmine.util.getWindow().sandBox == "function").toBe(true);
        });
    });
           
    describe("with Ext", function() {
        var get, getBody;
        
        beforeEach(function() {
            get = function() {};
            getBody = jasmine.createSpy("Ext.getBody");
            
            fakeWindow.Ext = {
                get: get,
                getBody: getBody
            };
            domSandbox = new jasmine.DomSandbox();
        });
                    
        describe("initialization", function() {
            it("should backup Ext.get and Ext.getBody", function() {
                expect(domSandbox.ExtgetBody).toBe(getBody);
                expect(domSandbox.Extget).toBe(get);
            });
        });
        
        describe("Ext.getBody override", function() {
            it("should replace Ext.getBody function", function() {
                expect(fakeWindow.Ext.getBody).not.toBe(getBody);
            });

            it("should call real Ext.getBody if true is passed as first argument", function() {
                fakeWindow.Ext.getBody(true);
                expect(getBody).toHaveBeenCalled();
            });
        });
    });

    describe("without Ext", function() {
        beforeEach(function() {
            domSandbox = new jasmine.DomSandbox();
        });
        
        describe("initialization", function() {
            it("should not backup Ext.get and Ext.getBody", function() {
                expect(domSandbox.ExtgetBody).toBeUndefined();
                expect(domSandbox.Extget).toBeUndefined();
            });

            it("should not replace or create Ext.get global variable", function() {
                expect(fakeWindow.Ext).toBeUndefined();
            });
        });
    });

    describe("sandbox global function", function() {
        var spec;
        
        beforeEach(function() {
            spec = {
                id: 1
            };
            domSandbox = new jasmine.DomSandbox();
        });


        it("should create a div HTMLElement", function() {
            expect(fakeWindow.sandBox().tagName).toBeDefined();
        });

        it("should create an unique HTMLElement based on spec id", function() {
            var saveCurrentSpec = jasmine.getEnv().currentSpec,
                id;
            jasmine.getEnv().currentSpec = spec;
            id = fakeWindow.sandBox().id;
            jasmine.getEnv().currentSpec = saveCurrentSpec;
            
            expect(id).toEqual("sandbox-" + spec.id);
        });

        it("should append fakeBody to body", function() {
            expect(fakeWindow.sandBox().parentNode).toBe(fakeBody);
        });

        it("should create only one dom HTMLElement per spec", function() {
            fakeWindow.sandBox();
            fakeWindow.sandBox();
            fakeWindow.sandBox();
            expect(fakeBody.children.length).toEqual(1);
        });                
    });

    describe("stop", function() {
        var getBody;
        
        beforeEach(function() {
            getBody = function() {};
            fakeWindow.Ext = {
                get: function() {},
                getBody: getBody
            };

            domSandbox = new jasmine.DomSandbox();
            domSandbox.stop();
        });

        it("should restore original Ext.getBody", function() {
            expect(fakeWindow.Ext.getBody).toBe(getBody);
        }); 
    });

    describe("remove", function() {
        var spec;
        
        beforeEach(function() {
            spec = {
                id: 1
            };
            
            domSandbox = new jasmine.DomSandbox();
            fakeWindow.sandBox();
            domSandbox.remove();
        });
        
        it("should remove sandbox from body", function() {
            expect(fakeBody.children.length).toEqual(0);
        });
    });
});

