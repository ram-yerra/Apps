describe("SenchaReporter", function() {
    var reporter,
        fakeBody,
        fakeWindow,
        spec1,
        spec2,
        suite1,
        addBeforesAndAftersToQueueFn,
        startFn,
        queueFn,
        passed,
        saveGetBody,
        saveGetWindow;
        
    beforeEach(function() {
        passed = true;
        
        fakeBody = sandBox();
        
        fakeWindow =  {
            location: {
                search: '',
                reload: function() {}
            }
        };
        
        reporter = new SenchaReporter();
        
        saveGetBody = jasmine.util.getBody;
        jasmine.util.getBody = function() {
            return fakeBody;
        };
        
        saveGetWindow = jasmine.util.getWindow;
        jasmine.util.getWindow = function() {
            return fakeWindow;
        };
        
        reporter.options = {};
        
        suite1 = {
            id: 1,
            results: function() {
                return {
                    passed: function() {
                        return passed;
                    }
                };
            }
        };

        queueFn = function() {};
        addBeforesAndAftersToQueueFn = function() {};
        spec1 = {
            id: 2,
            addBeforesAndAftersToQueue: addBeforesAndAftersToQueueFn,
            queue: {
                start: queueFn
            },
            getFullName: function() {
                return "spec 1";
            },
            results: function() {
                return {
                    passed: function() {
                        return passed;
                    }
                };
            }
        };

        spec2 = {
            id : 3,
            addBeforesAndAftersToQueue: addBeforesAndAftersToQueueFn,
            queue: {
                start: queueFn
            }
        };        
    });

    afterEach(function() {
        jasmine.util.getWindow = saveGetWindow;
        jasmine.util.getBody = saveGetBody;
    });
    
    describe("internals", function() {
        describe("instantiation", function() {
            
            it("should have 0 runned specs", function() {
                expect(reporter.runnedSpecsCount).toBe(0);
            });
            
            it("should have 0 failed specs", function() {
                expect(reporter.failedSpecsCount).toBe(0);
            });

            it("should not create any suite divs", function() {
                expect(reporter.suitesEls).toEqual({});
            });

            it("should not create any spec divs", function() {
                expect(reporter.specsEls).toEqual({});
            });
            
            it("should have no options", function() {
                expect(reporter.options).toEqual({});
            });
                        
            it("shoud initialize an empty object that will contain option checkbox elements", function() {
                expect(reporter.optionCheckBoxesEl).toEqual({});
            });
        });

        describe("methods", function() {

                 
            describe("getReporterEl", function() {
                it("should return reporter HTMLElement", function() {
                    reporter.renderReporter();
                    expect(reporter.getReporterEl().className).toEqual("jasmine_reporter");
                });
            });
                        
            describe("reloadWindow", function() {
                it("should reload window with options", function() {
                    reporter.options.showPassed = true;
                    
                    reporter.reloadWindow();

                    expect(jasmine.util.getWindow().location.search).toEqual("showPassed=true");
                });
            });

            describe("reportRunnerStarting", function() {
                beforeEach(function() {
                    spyOn(reporter, "renderReporter");
                    spyOn(reporter, "renderBanner");
                    spyOn(reporter, "renderRunner");
                    spyOn(reporter, "renderWarning");
                    spyOn(reporter, "startAutoReloadTask");
                    reporter.reportRunnerStarting();
                });
                
                it("should set startedAt", function() {
                    expect(reporter.startedAt instanceof Date).toBe(true);
                    expect(reporter.startedAt <= new Date()).toBe(true);
                });

                it("should render reporter", function() {
                    expect(reporter.renderReporter).toHaveBeenCalled();
                });

                it("should render banner", function() {
                    expect(reporter.renderBanner).toHaveBeenCalled();
                });

                it("should render runner", function() {
                    expect(reporter.renderRunner).toHaveBeenCalled();
                });
                            
                it("should initialize dom sandbox system", function() {
                     expect(reporter.domSandbox).toBeDefined();
                });

                it("should warn user if specRunner is executed locally", function() {
                    expect(reporter.renderWarning).toHaveBeenCalled();
                });
                
                if (!jasmine.browser.isIE) {
                    it("should initialize improper global variables detector", function() {
                        expect(reporter.badGlobalsFinder).toBeDefined();
                    });
                }
                
                it("should start autoReload task", function() {
                    expect(reporter.startAutoReloadTask).toHaveBeenCalled();
                });
            });

            describe("startAutoReloadTask", function() {
                beforeEach(function() {
                    spyOn(window, "setInterval");
                });
                
                describe("if options autoReload is set", function() {
                    beforeEach(function() {
                       reporter.options.autoReload = true;
                       reporter.startAutoReloadTask();
                    });
                    
                    it("should do start a task", function() {
                       expect(setInterval).toHaveBeenCalled(); 
                    });                    
                });
                describe("if options autoReload isn't set", function() {
                    beforeEach(function() {
                       reporter.options.autoReload = false;
                       reporter.startAutoReloadTask();
                    });
                    
                    it("should do not start a task", function() {
                       expect(setInterval).not.toHaveBeenCalled(); 
                    });
                });
            });
            describe("reportRunnerResults", function() {
                beforeEach(function() {
                    reporter.reportRunnerStarting();
                    spyOn(reporter, "renderResults");
                    spyOn(reporter.domSandbox, "stop");
                    reporter.reportRunnerResults();
                });
                
                it("should render results", function() {
                    expect(reporter.renderResults).toHaveBeenCalled();
                });

                it("should stop dom sandbox", function() {
                    expect(reporter.domSandbox.stop).toHaveBeenCalled();
                });
            });

            describe("reportSuiteResults", function() {
                var suite2;

                beforeEach(function() {
                    suite2 = {
                        id: 2,
                        results: function() {
                            return {
                                passed: function() {
                                    return passed;
                                }
                            };
                        }
                    };
                                    
                    reporter.suitesEls = {
                        "1": {foo: "bar"}
                    };
                    reporter.reportRunnerStarting();
                    spyOn(jasmine.Dom, "setCls");
                    if (!jasmine.browser.isIE) {
                        spyOn(reporter.badGlobalsFinder, "check");
                    }
                });

                describe("if suite div rendered", function() {
                    describe("if suite passed", function() {
                        it("should set class name to suite passed", function() {
                            passed = true;
                            reporter.reportSuiteResults(suite1);
                            expect(jasmine.Dom.setCls).toHaveBeenCalledWith({foo: "bar"}, "suite passed");
                        });
                    });

                    describe("if suite failed", function()  {
                        it("should set class name to suite failed", function() {
                            passed = false;
                            reporter.reportSuiteResults(suite1);
                            expect(jasmine.Dom.setCls).toHaveBeenCalledWith({foo: "bar"}, "suite failed");                       
                        });
                    });
                });

                describe("if suite div is not rendered", function() {
                    it("should skip suite", function() {
                        expect(jasmine.Dom.setCls).not.toHaveBeenCalled(); 
                    });
                });
            });

            describe("filterSpec", function() {
                describe("spec option", function() {
                    describe("if options does not contain any spec", function() {
                        beforeEach(function() {
                            reporter.filterSpec(spec1);
                        });
                        
                        it("should not skip any spec", function() {
                            expect(spec1.skipped).toBeUndefined();
                            expect(spec2.skipped).toBeUndefined();
                        });
                    });

                    describe("if options contains one spec", function() {
                        beforeEach(function() {
                            reporter.options.spec = spec1.id;
                        });
                        
                        it("should not skip passed spec", function() {
                            reporter.filterSpec(spec1);
                            expect(spec1.skipped).toBeUndefined();
                        });

                        it("should not skip other specs", function() {
                            reporter.filterSpec(spec2);
                            expect(spec2.skipped).toBe(true);
                        });
                    });
                });
                
                describe("suite option", function() {
                    describe("if options does not contain any suite", function() {
                        beforeEach(function() {
                            reporter.filterSpec(spec1);
                        });
                        
                        it("should not skip any spec", function() {
                            expect(spec1.skipped).toBeUndefined();
                            expect(spec2.skipped).toBeUndefined();
                        });
                    });

                    describe("if options contains one suite", function() {
                        beforeEach(function() {
                            reporter.options.suite = suite1.id;
                            spec1.suite = suite1;
                        });
                        
                        it("should not skip passed spec", function() {
                            reporter.filterSpec(spec1);
                            expect(spec1.skipped).toBeUndefined();
                        });

                        it("should not skip other specs", function() {
                            reporter.filterSpec(spec2);
                            expect(spec2.skipped).toBe(true);
                        });
                    });
                });
            });

            describe("reportSpecStarting", function() {
                beforeEach(function() {
                    spyOn(reporter, "filterSpec");
                    spyOn(jasmine.Dom, "setHTML");
                    reporter.reportSpecStarting(spec1);
                });
                
                it("should set current spec", function() {
                    expect(reporter.currentSpec).toEqual(spec1);
                });

                it("should filter spec", function() {
                    expect(reporter.filterSpec).toHaveBeenCalledWith(spec1);
                });

                describe("if spec is skipped", function() {
                    it("should increment runnedSpecsCount", function() {
                        spec2.skipped = true;
                        reporter.reportSpecStarting(spec2);
                        expect(reporter.runnedSpecsCount).toEqual(1);
                    });

                    it("should not update runner message", function() {
                        expect(jasmine.Dom.setHTML.calls.length).toEqual(1);
                    });
                });

                describe("if spec isn't skipped", function() {
                    it("should increment runnedSpecsCount", function() {
                        expect(reporter.runnedSpecsCount).toEqual(1);
                    });

                    it("should update runner message", function() {
                        expect(jasmine.Dom.setHTML).toHaveBeenCalled();
                    });
                });
            });

            describe("reportSpecResults", function() {
                beforeEach(function() {
                    reporter.reportRunnerStarting();
                    spyOn(reporter, "renderSpec");
                    spyOn(reporter.domSandbox, "remove");
                });

                describe("if spec skipped", function() {
                        beforeEach(function() {
                            spec1.skipped = true;
                            reporter.reportSpecResults(spec1);
                        });

                        it("should not increment failedSpecsCount", function() {
                            expect(reporter.failedSpecsCount).toEqual(0);
                        });

                        it("should render spec", function() {
                            expect(reporter.renderSpec).not.toHaveBeenCalled();
                        });

                        it("should remove sandbox", function() {
                            expect(reporter.domSandbox.remove).not.toHaveBeenCalled();                    
                        });
                });

                describe("if spec is not skipped", function() {
                    describe("if spec passed", function() {
                        beforeEach(function() {
                            reporter.reportSpecResults(spec1);
                        });

                        it("should not increment failedSpecsCount", function() {
                            expect(reporter.failedSpecsCount).toEqual(0);
                        });

                        it("should not render spec", function() {
                            expect(reporter.renderSpec).not.toHaveBeenCalled();
                        });

                        it("should remove sandbox", function() {
                            expect(reporter.domSandbox.remove).toHaveBeenCalled();                    
                        });
                    });
                    
                    describe("if spec failed", function() {
                        beforeEach(function() {
                            passed = false;
                            reporter.reportSpecResults(spec1);
                        });

                        it("should increment failedSpecsCount", function() {
                            expect(reporter.failedSpecsCount).toEqual(1);
                        });

                        it("should render spec", function() {
                            expect(reporter.renderSpec).toHaveBeenCalledWith(spec1);
                        });

                        it("should remove sandbox", function() {
                            expect(reporter.domSandbox.remove).toHaveBeenCalled();                    
                        });
                    });

                    describe("if options showPassed", function() {
                        beforeEach(function() {
                            reporter.options.showPassed = true;
                            reporter.reportSpecResults(spec1);
                        });

                        it("should render spec", function() {
                            expect(reporter.renderSpec).toHaveBeenCalledWith(spec1);
                        });               
                    });
                });
            });
        });
    });
});
