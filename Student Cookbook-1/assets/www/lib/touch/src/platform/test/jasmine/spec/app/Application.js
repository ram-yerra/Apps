describe("An Application", function() {
    var application;

    beforeEach(function() {
        spyOn(Ext.Application.prototype, 'bindReady'); //deactive Ext.onReady
        spyOn(Ext.EventManager, 'onOrientationChange');

        spyOn(Ext, 'ns').andReturn();

        //this is only actually defined in Sencha Touch, so we only check that it is correctly called. This is not ideal :/
        if (Ext.addMetaTags === undefined) {
            Ext.addMetaTags = function() {};
        }

        spyOn(Ext, 'addMetaTags').andReturn();
    });

    describe("the constructor", function() {
        beforeEach(function() {
            application = new Ext.Application({
                name: 'MyApp'
            });
        });

        afterEach(function() {
            if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                window.MyApp = undefined;
            } else {
                delete window.MyApp;
            }
        });
        
        it("should namespace the app and its views, stores, models and controllers", function() {
            expect(Ext.ns).toHaveBeenCalledWith('MyApp', 'MyApp.views', 'MyApp.stores', 'MyApp.models', 'MyApp.controllers');
        });

        it("should assign the Application instance to the global object", function() {
            expect(window.MyApp).toEqual(application);
        });

        it("should set up the appropriate meta tags", function() {
            expect(Ext.addMetaTags).toHaveBeenCalled();
        });
    });

    describe("onReady", function() {
        beforeEach(function() {
            application = createApplication();

            spyOn(application, 'initLoadMask').andReturn(true);
            
            if (!Ext.Viewport) {
                Ext.Viewport = {
                    init: Ext.emptyFn
                };
            }
        });
        
        function createApplication(config) {
            return new Ext.Application(Ext.apply({}, config, {
                defaultTarget: 'someTargetId',
                bindReady: Ext.emptyFn,
                useHistory: false,
                useLoadMask: true
            }));
        }

        it("should initialize a loading mask", function() {
            application.onReady();

            expect(application.initLoadMask).toHaveBeenCalled();
        });

        
        it("should initialize the viewport if autoInitViewport is true", function() {
            application = createApplication({
                autoInitViewport: true
            });
            
            spyOn(Ext.Viewport, 'init').andReturn(true);
            
            application.onReady();
            
            expect(Ext.Viewport.init).toHaveBeenCalled();
        });
        
        it("should not initialize the viewport if autoInitViewport is false", function() {
            application = createApplication({
                autoInitViewport: false
            });
            
            spyOn(Ext.Viewport, 'init').andReturn(true);
            
            application.onReady();
            
            expect(Ext.Viewport.init).not.toHaveBeenCalled();
        });

        describe("if using history", function() {

        });
    });

    describe("onBeforeLaunch", function() {
        beforeEach(function() {
            application = createApplication();

            spyOn(application, 'initLoadMask').andReturn(true);

            if (!Ext.Viewport) {
                Ext.Viewport = {
                    init: Ext.emptyFn
                };
            }
        });

        function createApplication(config) {
            return new Ext.Application(Ext.apply({}, config, {
                defaultTarget: 'someTargetId',
                bindReady: Ext.emptyFn,
                useHistory: false,
                useLoadMask: true
            }));
        }

        it("should determine profile", function() {
            spyOn(application, 'determineProfile').andCallThrough();

            application.onBeforeLaunch();

            expect(application.determineProfile).toHaveBeenCalledWith(true);
        });

        it("should update the component profiles based on the detected profile", function() {
            spyOn(application, 'determineProfile').andReturn('someProfile');
            spyOn(application, 'updateComponentProfiles').andReturn();

            application.onBeforeLaunch();

            expect(application.updateComponentProfiles).toHaveBeenCalledWith('someProfile');
        });
    });

    describe("detecting profiles", function() {
        var profiles;

        beforeEach(function() {
            profiles = {
                profileA: function() {},
                profileB: function() {}
            };

            spyOn(profiles, 'profileA').andReturn(false);
            spyOn(profiles, 'profileB').andReturn(true);

            application = new Ext.Application({
                profiles: profiles,
                autoUpdateComponentProfiles: true
            });
        });

        it("should set the current profile to the first profile function that returns true", function() {
            expect(application.determineProfile()).toEqual('profileB');
        });

        it("should store the new profile name", function() {
            application.determineProfile();

            expect(application.getProfile()).toEqual('profileB');
        });

        describe("when the device profile changes", function() {
            beforeEach(function() {
                application.currentProfile = "profileA";

                spyOn(application, 'updateComponentProfiles').andReturn();
            });

            it("should fire a beforeprofilechange event", function() {
                var called = false,
                    newProfile, oldProfile;

                application.on('beforeprofilechange', function(profileName, oldProfileName) {
                    called = true;
                    newProfile = profileName;
                    oldProfile = oldProfileName;
                }, this);

                application.determineProfile();

                expect(called).toBe(true);
                expect(newProfile).toEqual('profileB');
                expect(oldProfile).toEqual('profileA');
            });

            it("should fire a profilechange event", function() {
                var called = false,
                    newProfile, oldProfile;

                application.on('profilechange', function(profileName, oldProfileName) {
                    called = true;
                    newProfile = profileName;
                    oldProfile = oldProfileName;
                }, this);

                application.determineProfile();

                expect(called).toBe(true);
                expect(newProfile).toEqual('profileB');
                expect(oldProfile).toEqual('profileA');
            });

            it("should update component profiles", function() {
                application.determineProfile();

                expect(application.updateComponentProfiles).toHaveBeenCalled();
            });

            describe("if silent is true", function() {
                it("should not fire the profilechange event", function() {
                    var called = false;

                    application.on('profilechange', function() {
                        called = true;
                    }, this);

                    application.determineProfile(true);

                    expect(called).toBe(false);
                });

                it("should still fire the beforeprofilechange event", function() {
                    var called = false;

                    application.on('beforeprofilechange', function() {
                        called = true;
                    }, this);

                    application.determineProfile(true);

                    expect(called).toBe(true);
                });
            });

            describe("if a listener returns false to beforeprofilechange", function() {
                beforeEach(function() {
                    application.on('beforeprofilechange', function() {
                        return false;
                    }, this);
                });

                it("should not fire the profilechange event", function() {
                    var called = false,
                        newProfile, oldProfile;

                    application.on('profilechange', function(profileName, oldProfileName) {
                        called = true;
                    }, this);

                    application.determineProfile();

                    expect(called).toBe(false);
                });

                it("should not update the component profiles", function() {
                    application.determineProfile();
                    expect(application.updateComponentProfiles).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("updating component profiles", function() {
        var origItems, fakeItems, component1, component2;

        beforeEach(function() {
            origItems = Ext.ComponentMgr.all.getValues();

            component1 = {id: Ext.id(), setProfile: function() {}};
            component2 = {id: Ext.id(), setProfile: function() {}};


            Ext.ComponentMgr.all.clear();
            spyOn(component1, 'setProfile').andReturn();
            spyOn(component2, 'setProfile').andReturn();

            Ext.ComponentMgr.register(component1);
            Ext.ComponentMgr.register(component2);

            application = new Ext.Application();
        });

        afterEach(function() {
            Ext.ComponentMgr.all.clear();
            Ext.each(origItems, function(c){
                Ext.ComponentMgr.register(c);
            });
        });

        it("should set the new profile on all components", function() {
            application.updateComponentProfiles('newProfile');

            expect(component1.setProfile).toHaveBeenCalledWith('newProfile');
            expect(component2.setProfile).toHaveBeenCalledWith('newProfile');
        });
    });

    describe("initializing the loading mask", function() {
        var application, maskEl;

        beforeEach(function() {
            application = new Ext.Application({
                loadMaskFadeDuration: 10,
                loadMaskRemoveDuration: 10,
                useLoadMask: true,
                //we're overriding this because we want to bypass Ext.onReady for these tests
                bindReady: Ext.emptyFn
            });
            
            maskEl = jasmine.createSpyObj("maskEl", ["addCls", "remove"]);
            spyOn(Ext, 'get').andReturn(maskEl);
        });

        it("should inject a loading mask div into the body", function() {
            var body = Ext.getBody();
            
            spyOn(Ext, "getBody").andCallThrough();
            
            spyOn(body, "createChild");
            
            application.initLoadMask();

            expect(Ext.getBody).toHaveBeenCalled();
            expect(body.createChild).toHaveBeenCalled();
        });

        describe("when removing the loading mask", function() {

            it("should add a fadeout class to the given element", function() {
                application.initLoadMask();

                waitsFor(function(){
                    return maskEl.addCls.calls.length === 1;
                }, "maskEl.addCls was never called");

                runs(function() {
                    this.expect(maskEl.addCls).toHaveBeenCalledWith('fadeout');
                });
            });

            it("should fade the mask out after the configured duration", function() {
                application.initLoadMask();

                waitsFor(function(){
                    return maskEl.remove.calls.length === 1;
                }, "maskEl.remove was never called");

                runs(function() {
                    this.expect(maskEl.remove).toHaveBeenCalled();
                });
            });
        });
    });
});
