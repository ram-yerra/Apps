describe("jasmine.browser", function() {
    it("should detect ie", function() {
        expect(jasmine.browser.isIE).toBe(/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent));
    });
});
