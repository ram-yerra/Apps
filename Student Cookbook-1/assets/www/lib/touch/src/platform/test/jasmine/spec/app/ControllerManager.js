describe("Ext.ControllerManager", function() {
    describe("registering", function() {
        var fakeController, name, options, controller;
        
        beforeEach(function() {
            spyOn(Ext.ControllerManager.all, 'add').andReturn(true);
            
            name = 'MyController';
            options = {
                init: function() {
                    
                },
                
                myAction: function() {
                    //some action
                }
            };
            
            fakeController = new Ext.Controller(options);
            
            spyOn(options, 'init').andCallThrough();
        });
        
        function registerController() {
            return Ext.ControllerManager.register(name, options);
        }
        
        it("should create a new controller", function() {
            spyOn(Ext, 'Controller').andReturn(fakeController);
            
            controller = registerController();
            
            expect(Ext.Controller).toHaveBeenCalledWith(options);
        });
        
        it("should set the Controller's id", function() {
            controller = registerController();
            
            expect(controller.id).toEqual('MyController');
        });
        
        it("should init the controller", function() {
            controller = registerController();
            
            expect(controller.init).toHaveBeenCalled();
        });
        
        it("should add the controller to the all HashMap", function() {
            controller = registerController();
            
            expect(Ext.ControllerManager.all.add).toHaveBeenCalledWith(controller);
        });
        
        it("should return the new Controller", function() {
            spyOn(Ext, 'Controller').andReturn(fakeController);
            
            controller = registerController();
            
            expect(controller).toEqual(fakeController);
        });
        
        describe("if there is a current Application defined", function() {
            var fakeApp;            
            
            beforeEach(function() {
                fakeApp = new Ext.Application({
                    bindReady: function() {}
                });
                
                Ext.ApplicationManager.currentApplication = fakeApp;
            });
            
            it("should attach the Application to the Controller's configuration", function() {
                controller = registerController();

                expect(controller.application).toEqual(fakeApp);
            });
        });
    });
});