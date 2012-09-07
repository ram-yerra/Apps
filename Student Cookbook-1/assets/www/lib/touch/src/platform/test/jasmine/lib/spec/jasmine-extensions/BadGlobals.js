if (!jasmine.browser.isIE) {
    describe("jasmine.BadGlobalsFinder", function() {
        var reporter,
            badGlobalFinder,
            fakeWindow,
            saveGetWindow;

        beforeEach(function() {
            reporter = {};
            fakeWindow = {};
            reporter.renderWarning = jasmine.createSpy("renderWarning");
            saveGetWindow = jasmine.util.getWindow;
            jasmine.util.getWindow = function() {
                return fakeWindow;
            };
            badGlobalFinder = new jasmine.BadGlobalsFinder(reporter);
        });

        afterEach(function() {
            jasmine.util.getWindow = saveGetWindow;
        });
        
        describe("constructor", function() {
            it("should create an array of allowed globals variables", function() {
                expect(badGlobalFinder.allowedGlobals instanceof Array).toBe(true);
            });

            it("should create an id propery protection", function() {
                expect(fakeWindow.hasOwnProperty("id")).toBe(true);
            });

            it("should create an id propery protection", function() {
                expect(fakeWindow.hasOwnProperty("_firebug")).toBe(true);
            });       
        });

        describe("check", function() {
            it("should return false if no global var added", function() {
                expect(badGlobalFinder.check()).toBe(false);
            });

            it("should return true if a bad global var is set", function() {
                fakeWindow.foo = true;

                expect(badGlobalFinder.check()).toBe(true);
            });
        });

        describe("report", function() {
            it("should call reporter.renderWarning if global variables are found", function() {
                fakeWindow.bar = true;
                badGlobalFinder.report();

                expect(reporter.renderWarning).toHaveBeenCalled();
            });
            
            it("should not call reporter.renderWarning if no global variables are found", function() {
                badGlobalFinder.report();

                expect(reporter.renderWarning).not.toHaveBeenCalled();           
            });
        });
    });
}
