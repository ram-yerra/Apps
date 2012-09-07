describe("jasmine.panel.TabPanel", function() {
    var tabPanel, spec;

    beforeEach(function() {
        spec = {
            id: '666',
            results: function() {
                return {
                    getItems: function() {
                        return [];
                    }
                };
            },
            queue: {
                blocks: []
            }
        };
        spyOn(jasmine.panel, "SpecInfos").andCallThrough();
        spyOn(jasmine.panel.TabPanel.prototype, "add").andCallThrough();
        spyOn(jasmine.panel.TabPanel.prototype, "renderToolBarButtons").andCallThrough();
        tabPanel = new jasmine.panel.TabPanel({
            spec: spec,
            sandboxes: []
        });
    });

    describe("constructor", function() {        
        it("should create el property", function() {
            expect(tabPanel.el.tagName).toBeDefined();
        });

        it("should create toolbar property", function() {
            expect(tabPanel.toolbar.tagName).toBeDefined();
        });

        it("should create body property", function() {
            expect(tabPanel.body.tagName).toBeDefined();
        });
        
        it("should create specInfo panel", function() {
            expect(jasmine.panel.SpecInfos).toHaveBeenCalled();
        });

        it("should render toolbar", function() {
            expect(jasmine.panel.TabPanel.prototype.renderToolBarButtons).toHaveBeenCalled();
        });

        it("should set spec property", function() {
            expect(tabPanel.spec).toBe(spec);
        });
        
        it("should set spec sandboxes", function() {
            expect(tabPanel.sandboxes).toEqual([]);
        });
    });

    describe("add", function() {
        var panel;

        beforeEach(function() {
            spyOn(tabPanel.body, "appendChild");
            panel = {
                el: "foo",
                afterRender: jasmine.createSpy("afterRender")
            };

            tabPanel.add(panel);
        });

        it("should append panel HTMLElement to tabPanel body", function() {
            expect(tabPanel.body.appendChild).toHaveBeenCalledWith("foo");
        });

        it("should run panel afterRender methods", function() {
            expect(panel.afterRender).toHaveBeenCalled();
        });
    });

    describe("activatePanel", function() {
        describe("delegate rendering", function() {
            beforeEach(function() {
                spyOn(jasmine.panel, "SpecStackTrace").andCallThrough();
                spyOn(jasmine.panel, "SpecDomSandbox").andCallThrough();
                spyOn(jasmine.panel, "SpecBlocks").andCallThrough();
            });
            
            describe("stack trace panel", function() {
                it("should be able to delegate rendering", function() {
                    tabPanel.activatePanel("stackTrace");
                    expect(tabPanel.add).toHaveBeenCalled();
                });
            });
            
            describe("blocks panel", function() {
                it("should be able to delegate rendering", function() {
                    tabPanel.activatePanel("blocks");
                    expect(tabPanel.add).toHaveBeenCalled();
                });
            });
            
            describe("dom sandbox panel", function() {
                it("should be able to delegate rendering", function() {
                    tabPanel.activatePanel("domSandbox");
                    expect(tabPanel.add).toHaveBeenCalled();
                });
            }); 
        });

        describe("if panel is already rendered", function() {
            beforeEach(function() {
                spyOn(jasmine.panel, "SpecBlocks").andCallThrough();
                tabPanel.activatePanel("blocks");
            });
            
            it("should remove hideMe cls", function() {
                var el = tabPanel.children[1].el;
                expect(el.className.search("hideMe")).toEqual(-1);
            });
        });
    });

    describe("onTabClick", function() {
        var blocksTab,
            stackTraceTab,
            infoTab;

        beforeEach(function() {
            infoTab = tabPanel.toolbar.children[0];
            blocksTab = tabPanel.toolbar.children[1];
            stackTraceTab = tabPanel.toolbar.children[2];
            spyOn(tabPanel, "activatePanel");
        });

        describe("if tab is not disabled", function() {
            beforeEach(function() {
                tabPanel.onTabClick(blocksTab);
            });
            
            it("should call activatePanel", function() {
                expect(tabPanel.activatePanel).toHaveBeenCalled();
            });

            it("should add the selected cls to the selected tab", function() {
                expect(blocksTab.className.search("selected")).not.toEqual(-1);
            });

            it("should remove the selected cls of the previous tab", function() {
                expect(infoTab.className.search("selected")).toEqual(-1);
            });
        });
    });

    describe("renderToolbarButtons", function() {
        it("should render tab panel buttons", function() {
            expect(tabPanel.toolbar.children.length).toEqual(2);
        });
    });
});
