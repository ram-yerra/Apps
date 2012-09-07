describe("jasmine.Dom", function () {
    var fakeBody;

    beforeEach(function() {
        fakeBody = sandBox();
    });
    
    describe("createHTML", function() {
        it("should return directly passed argument if it's an HTMLElement", function() {
            expect(new jasmine.Dom(fakeBody)).toBe(fakeBody);
        });

        it("should set HTMLElement tagName to div by default", function () {
            expect(new jasmine.Dom({}).tagName).toEqual("DIV");
        });

        describe("cls option", function() {
            it("should set className", function() {
                var domEl = new jasmine.Dom({cls: "foobar"});
                expect(domEl.className).toEqual("foobar");
            });
        });

        describe("html option", function() {
            it("should set innerHTML", function() {
                var domEl = new jasmine.Dom({html: "foobar"});
                expect(domEl.innerHTML).toEqual("foobar");
            });
        });

        describe("other attributes", function() {
            it("should apply other attributes", function() {
                var domEl = new jasmine.Dom({
                    tag: "input",
                    type: "checkbox"
                });

                expect(domEl.tagName).toEqual("INPUT");
                expect(domEl.type).toEqual("checkbox");
            });
        });
        
        describe("children", function() {
            var domEl;
         
            beforeEach(function() {
                domEl = new jasmine.Dom({
                    children: [{
                        id: "foo"
                    }, {
                        id: "bar"
                    }]
                });
            });
            
            it("should append children to created element", function() {
                expect(domEl.children[0].id).toEqual("foo");
                expect(domEl.children[1].id).toEqual("bar");
                expect(domEl.children.length).toEqual(2);
            });
        });
    });

    describe("setHTML", function() {
        it("should set HTMLElement innerHTML", function() {
            jasmine.Dom.setHTML(fakeBody, "foobar");
            expect(fakeBody.innerHTML, "foobar");
        });
    });

    describe("setCls", function() {
        it("should set HTMLElement className", function() {
            jasmine.Dom.setCls(fakeBody, "foobar");
            expect(fakeBody.className, "foobar");
        });
    });
});
