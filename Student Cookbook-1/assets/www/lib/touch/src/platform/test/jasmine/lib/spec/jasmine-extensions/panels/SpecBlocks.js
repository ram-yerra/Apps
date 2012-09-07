describe("jasmine.panel.SpecBlocks", function() {
    var panel, spec, block;

    beforeEach(function() {
        block = {
            func: function() {}
        };
        block.func.typeName = "foobar";
        
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
                blocks: [block]
            }
        };
        
        spyOn(jasmine.CodeHighLighter.prototype, "renderJsSources");
        panel = new jasmine.panel.SpecBlocks({
            spec: spec
        });
        
    });

    it("should have an HTMLElement as el property", function() {
        expect(panel.el.tagName).toBeDefined();
    });

    it("shouldn't have afterRender method", function() {
        expect(panel.afterRender).toBe(undefined);
    });

    it("shouls calls renderJsSources for each blocks", function() {
        expect(jasmine.CodeHighLighter.prototype.renderJsSources).toHaveBeenCalled();
    });
});
