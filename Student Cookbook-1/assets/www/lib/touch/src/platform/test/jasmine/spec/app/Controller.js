describe("Ext.Controller", function() {
    var controller;
    
    beforeEach(function() {
        controller = Ext.regController('users', {
            
        });
    });
    
    describe("rendering", function() {
        var viewConfig, newView;
        
        beforeEach(function() {
            viewConfig = {
                xtype: 'sometype'
            };
            
            newView = {
                some: 'fake view object'
            };
            
            spyOn(Ext.ComponentMgr, 'create').andReturn(newView);
        });
        
        it("should create the new component", function() {
            controller.render(viewConfig);
            
            expect(Ext.ComponentMgr.create).toHaveBeenCalledWith(viewConfig);
        });
        
        it("should return the new component instance", function() {
            expect(controller.render(viewConfig)).toEqual(newView);
        });
        
        describe("if no target was passed", function() {
            afterEach(function() {
                delete Ext.Controller.defaultTarget;
            });
            
            describe("if a default target has been specified", function() {
                var fakeDefaultTarget = {
                    some: 'target',
                    add: Ext.emptyFn,
                    doComponentLayout: Ext.emptyFn
                };
                
                beforeEach(function() {
                    spyOn(Ext, 'getCmp').andReturn(fakeDefaultTarget);
                    
                    spyOn(fakeDefaultTarget, 'add').andReturn();
                    spyOn(fakeDefaultTarget, 'doComponentLayout').andReturn();
                });
                
                describe("if the default target is a string", function() {
                    beforeEach(function() {
                        controller.render(viewConfig, 'mainPanel');
                    });
                    
                    it("should find the target first", function() {
                        expect(Ext.getCmp).toHaveBeenCalledWith('mainPanel');
                    });
                });
                
                describe("if the default target is a container", function() {
                    beforeEach(function() {
                        controller.render(viewConfig, fakeDefaultTarget);
                    });
                    
                    it("should add to the default target", function() {
                        expect(fakeDefaultTarget.add).toHaveBeenCalledWith(newView);
                    });

                    it("should call the default target's component layout", function() {
                        expect(fakeDefaultTarget.doComponentLayout).toHaveBeenCalled();
                    });
                });
            });
        });
        
        describe("if a target was passed", function() {
            it("should add to the given target", function() {
                
            });
            
            it("should call the default target's component layout", function() {
                
            });
        });
    });
});