describe("jasmine.util.getWindow", function() {
    it("should return global window object", function() {
        expect(jasmine.util.getWindow()).toEqual(window);
    });
});

describe("jasmine.util.getBody", function() {
    it("should return document.body HTMLElement", function() {
        expect(jasmine.util.getBody()).toEqual(document.body);
    });
});

 describe("jasmine.util.urlDecode", function() {
    it ("should return an empty object if string is empty", function (){
        expect(jasmine.util.urlDecode("")).toEqual({});
    });
    
    it("should decode 2 keys", function(){
        expect(jasmine.util.urlDecode("foo=1&bar=2")).toEqual({
            foo: "1",
            bar: "2"
        });
    });
});
    
describe("jasmine.util.urlEncode", function() {
    it("should encode 2 keys", function() {
        expect(jasmine.util.urlEncode({
            foo: "1",
            bar: "2"
        })).toEqual("foo=1&bar=2");
    });
});
