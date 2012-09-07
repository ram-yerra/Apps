if (!jasmine.browser.isIE) {
    describe("jasmine.panel.SpecStackTrace", function() {
        var remote = (jasmine.util.getWindow().location.toString().search("http:") !== -1),
            panel, spec, result1, result2, result,
            createPanel = function() {
                panel = new jasmine.panel.SpecStackTrace({spec: spec});
                
                panel.reporter = {
                    remote: remote
                };
            };

        beforeEach(function() {
            result1 = {
                type: "expect",
                matcherName: "foo",
                actual: "bar",
                expected: "bar",
                passed: function() {
                    return true;
                }
            };

            result2 = {
                type: "expect",
                error: new Error("foobar"),
                passed: function() {
                    return false;
                }
            };
                    
            spec = {
                hasError: true,
                id: '666',
                results: function() {
                    return {
                        getItems: function() {
                            return [result1, result2];
                        }
                    };
                }
            };
        });

        describe("constructor", function() {
            beforeEach(function() {
                spyOn(jasmine.panel.SpecStackTrace.prototype, "extractStackTrace").andCallThrough();
                spyOn(jasmine.panel.SpecStackTrace.prototype, "renderStackLines").andCallThrough();
                createPanel();
            });
            
            it("should create an HTMLElement as element", function() {
                expect(panel.el.tagName).toBeDefined();
            });

            it("should call extractStackTrace", function() {
                expect(panel.extractStackTrace).toHaveBeenCalled();
            });

            it("should call renderStackLines", function() {
                expect(panel.renderStackLines).toHaveBeenCalled();
            });
        });
        
        describe("extractStackTrace", function() {
            var error;
                generateSpec = function() {
                    if (remote) {
                        it("should extract at least the first file and linenumber", function() {
                            expect(result[0].lineNumber).toBeDefined();
                            expect(result[0].file).toBeDefined();
                        });
                    } else {
                        it("should return empty array", function() {
                            expect(result).toEqual([]);
                        });
                    }

                    it("should call extractFileAndLine", function() {
                        expect(panel.extractFileAndLine).toHaveBeenCalled();
                    });
                };
                
            beforeEach(function() {
                createPanel();
                spyOn(panel, "extractFileAndLine").andCallThrough();
            });
            
            describe("errors", function() {
                describe("EvalError", function() {
                    beforeEach(function() {
                        try {
                           eval.call(-1, "");
                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error);                    
                    });
                    
                    generateSpec();
                });

                describe("RangeError", function() {
                    beforeEach(function() {
                        try {
                            Number("10").toFixed(25);
                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error); 
                    });

                    generateSpec();             
                });

                describe("ReferenceError", function() {
                    beforeEach(function() {
                        try {
                            var a = foobar;
                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error); 
                    });

                    generateSpec();
                });

                describe("SyntaxError", function() {
                    beforeEach(function() {
                        try {
                            eval("[-]");
                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error); 
                    });

                    generateSpec();
                });

                describe("TypeError", function() {
                    beforeEach(function() {
                        try {
                            ({}).kaboom();

                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error); 
                    });

                    generateSpec();
                });

                describe("URIError", function() {
                    beforeEach(function() {
                        try {
                            decodeURIComponent("%96"); 
                        } catch(e) {
                            error = e;
                        }
                        result = panel.extractStackTrace(error); 
                    });

                    generateSpec();
                });

            });
        });

        describe("renderTraceFileSource", function() {
            var ret;
            beforeEach(function() {
                createPanel();
                spyOn(jasmine.CodeHighLighter.prototype, "renderJsSources").andReturn("foo");
                spyOn(panel, "getFile").andReturn("");
                ret = panel.renderTraceFileSource(result.file, result.lineNumber);
            });
            
            it("should call jasmine.CodeHighLighter.prototype.renderJsSources", function() {
                expect(jasmine.CodeHighLighter.prototype.renderJsSources).toHaveBeenCalled();
            });
            
            it("should call getFile", function() {
                expect(panel.getFile).toHaveBeenCalledWith(result.file);
            });

            it("should return renderJsSources results", function() {
                expect(ret).toEqual("foo");
            });
        });
    });
}
