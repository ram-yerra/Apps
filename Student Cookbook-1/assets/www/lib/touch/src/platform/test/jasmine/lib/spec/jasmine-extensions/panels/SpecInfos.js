describe("jasmine.panel.SpecInfos", function() {
    var panel, spec, result1, result2;

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
            passed: function() {
                return false;
            }
        };
                
        spec = {
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
            spyOn(jasmine.panel.SpecInfos.prototype, "renderFailedResult").andCallThrough();
            panel = new jasmine.panel.SpecInfos({
                spec: spec
            });
        });
        
        it("should create an HTMLElement as el property", function() {
            expect(panel.el.tagName).toBeDefined();
        });

        it("should call renderResultMessage for each failed results", function() {
            expect(jasmine.panel.SpecInfos.prototype.renderFailedResult.calls.length).toEqual(1);
        });
    });

    describe("renderFailedResult", function() {
        beforeEach(function() {
            panel = new jasmine.panel.SpecInfos({
                spec: spec
            });

            result2.error = "aaa";
        });

        it("should return an HTMLElement", function() {
            expect(panel.renderFailedResult(result2).tagName).toBeDefined();
        });

        if (!jasmine.browser.isIE) {
            it("should add a children if result contains error", function() {
                expect(panel.renderFailedResult(result2).children.length).toEqual(2);
            });
        }
    });

    describe("renderPassedResult", function() {
        beforeEach(function() {
            panel = new jasmine.panel.SpecInfos({
                spec: spec
            });
        });

        it("should return an HTMLElement", function() {
            expect(panel.renderFailedResult(result1).tagName).toBeDefined();
        });
    });    
});
