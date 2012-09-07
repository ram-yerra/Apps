describe("Ext.PluginMgr", function() {

    describe("create", function() {
        var TestPlugin;

        afterEach(function() {
            delete Ext.PluginMgr.types['testplugin'];
        });

        describe("if the plugin is already instantiated", function() {
            beforeEach(function() {
                TestPlugin = function() {
                    return {
                        init: Ext.emptyFn
                    };
                }();
                Ext.preg("testplugin", TestPlugin);
            });

            describe("without defaultType", function() {
                it("should return the plugin directly", function() {
                    expect(Ext.PluginMgr.create({
                        ptype: "testplugin"
                    })).toBe(TestPlugin);
                });
            });

            describe("with defaultType", function() {
                it("should return the plugin directly", function() {
                    expect(Ext.PluginMgr.create({}, "testplugin")).toBe(TestPlugin);
                });
            });
        });

        describe("if the plugin is not instantiated", function() {
            beforeEach(function() {
                TestPlugin = Ext.extend(Object, {
                    constructor: function() {
                        this.spyConstructorArgument.apply(this, arguments);
                        TestPlugin.superclass.constructor.apply(this, arguments);
                    },
                    spyConstructorArgument: jasmine.createSpy("TestPluginConstructorArgumentsSpy"),
                    init: Ext.emptyFn
                });
                Ext.preg("testplugin", TestPlugin);
            });

            describe("without defaultType", function() {
                it("should return an instance of plugin class", function() {
                    expect(Ext.PluginMgr.create({
                        ptype: "testplugin"
                    })).toEqual(new TestPlugin({}));
                });
            });

            describe("with defaultType", function() {
                it("should return an instance of plugin class", function() {
                    expect(Ext.PluginMgr.create({}, "testplugin")).toEqual(new TestPlugin({}));
                });
            });

            it("should pass configuration to plugin constructor", function() {
                Ext.PluginMgr.create({
                    someConfig: "foo"
                }, "testplugin");

                expect(TestPlugin.prototype.spyConstructorArgument).toHaveBeenCalledWith({
                    someConfig: "foo"
                });
            });
        });
    });

    describe("findByType", function() {
        var TestPlugin1, 
            TestPlugin2, 
            TestPlugin3, 
            TestPlugin4, 
            TestPlugin5;

        beforeEach(function() {
            TestPlugin1 = Ext.extend(Object, {
                init: Ext.emptyFn
            });

            Ext.apply(TestPlugin1, {
                type: 'model'
            });
            
            Ext.preg("testplugin1", TestPlugin1);

            TestPlugin2 = Ext.extend(Object, {
                init: Ext.emptyFn
            });
            
            Ext.apply(TestPlugin2, {
                type: 'model'
            });
            
            Ext.preg("testplugin2", TestPlugin2);

            TestPlugin3 = Ext.extend(Object, {
                init: Ext.emptyFn
            });

            Ext.apply(TestPlugin3, {
                type: 'component'
            });
            
            Ext.preg("testplugin3", TestPlugin3);

            TestPlugin4 = Ext.extend(Object, {
                init: Ext.emptyFn
            });

            Ext.apply(TestPlugin4, {
                type: 'component',
                isDefault: true
            });
            
            Ext.preg("testplugin4", TestPlugin4);

            TestPlugin5 = Ext.extend(Object, {
                init: Ext.emptyFn
            });
                
            Ext.apply(TestPlugin5, {
                type: 'component',
                isDefault: true
            });
            
            Ext.preg("testplugin5", TestPlugin5);
        });

        afterEach(function() {
            delete Ext.PluginMgr.types['testplugin1'];
            delete Ext.PluginMgr.types['testplugin2'];
            delete Ext.PluginMgr.types['testplugin3'];
            delete Ext.PluginMgr.types['testplugin4'];
            delete Ext.PluginMgr.types['testplugin5'];
        });

        it("should return all plugins registered with the given type", function() {
            expect(Ext.PluginMgr.findByType('model')).toEqual([TestPlugin1, TestPlugin2]);
            expect(Ext.PluginMgr.findByType('component')).toEqual([TestPlugin3, TestPlugin4, TestPlugin5]);
        });

        describe("defaultsOnly", function() {
            it("should return all plugins registered with the given type where isDefault property is truthy", function() {
                expect(Ext.PluginMgr.findByType('model', true)).toEqual([]);
                expect(Ext.PluginMgr.findByType('component', true)).toEqual([TestPlugin4, TestPlugin5]);
            });
        });

    });

    describe("Ext.preg", function() {
        it("should call Ext.PluginMgr.registerType", function() {
            var spy = spyOn(Ext.PluginMgr, "registerType");

            Ext.preg(1, 2, 3);

            expect(spy).toHaveBeenCalledWith(1, 2, 3);
        });
    });
});

