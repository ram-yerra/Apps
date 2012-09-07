describe("Ext.ApplicationManager", function() {
    describe("registering", function() {
        var fakeApplication, options;
        
        beforeEach(function() {
            spyOn(Ext.ApplicationManager.all, 'add').andReturn(true);
            
            options = {
                name: 'MyApp'
            };
            
            fakeApplication = new Ext.Application();
            
            spyOn(Ext, 'Application').andReturn(fakeApplication);
        });
        
        describe("with a single argument", function() {
            var application;
            
            function registerApp() {
                return Ext.ApplicationManager.register(options);
            }
            
            beforeEach(function() {
                application = registerApp();
            });

            it("should create a new application", function() {
                expect(Ext.Application).toHaveBeenCalledWith(options);
            });

            it("should add the application to the 'all' HashMap", function() {
                expect(Ext.ApplicationManager.all.add).toHaveBeenCalledWith(fakeApplication);
            });

            it("should set the currentApplication", function() {
                expect(Ext.ApplicationManager.currentApplication).toEqual(fakeApplication);
            });

            it("should return the new application", function() {
                expect(application).toEqual(fakeApplication);
            });
        });
        
        describe("if passed a name and config", function() {
            function registerApp() {
                return Ext.ApplicationManager.register('SomeApp', {});
            }
            
            it("should add the name to the config", function() {
                registerApp();
                
                expect(Ext.Application).toHaveBeenCalledWith({name: 'SomeApp'});
            });
        });
    });
    
});