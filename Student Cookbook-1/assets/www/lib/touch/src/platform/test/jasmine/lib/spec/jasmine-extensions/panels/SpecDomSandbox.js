describe("jasmine.panel.SpecDomSandbox", function() {
    var panel, spec, sandboxes;

    beforeEach(function() {
        spec = {
            id: '666'
        };
    });

    describe("constructor", function() {
        beforeEach(function() {
            spyOn(jasmine.panel.SpecDomSandbox.prototype, "renderDomSandbox").andCallThrough();
        });
        
        describe("if sandbox", function() {
            beforeEach(function() {
                sandboxes = {};

                sandboxes[spec.id] = sandBox();
                sandboxes[spec.id].appendChild(new jasmine.Dom());
                panel = new jasmine.panel.SpecDomSandbox({
                    spec: spec,
                    sandboxes: sandboxes
                });
            });

            it("should call renderDomSandbox", function() {
                expect(jasmine.panel.SpecDomSandbox.prototype.renderDomSandbox).toHaveBeenCalled();
            });

            it("should create an HTMLElement as el property", function() {
                expect(panel.el.tagName).toBeDefined();
            });
        });

        describe("if no sandbox", function() {
            beforeEach(function() {
                panel = new jasmine.panel.SpecDomSandbox({
                    spec: spec,
                    sandboxes: {}
                });
        
            });

            it("should not call renderDomSandbox", function() {
                expect(jasmine.panel.SpecDomSandbox.prototype.renderDomSandbox).not.toHaveBeenCalled();
            });

            it("should not create el property", function() {
                expect(panel.el).not.toBeDefined();
            });       
        });
    });

    describe("renderDomSandbox", function() {
        beforeEach(function() {
            sandboxes = {};
            sandboxes[spec.id] = sandBox();
            
            panel = new jasmine.panel.SpecDomSandbox({
                spec: spec,
                sandboxes: sandboxes
            });
        });

        describe("if sandbox HTMLElement has content", function() {
            beforeEach(function() {
                panel.sandBox.appendChild(new jasmine.Dom());
            });
            
            it("should return HTMLElement", function() {
                expect(panel.renderDomSandbox().tagName).toBeDefined();
            });
        });

        describe("if sandbox HTMLElement has'nt content", function() {
            it("should return null", function() {
                expect(panel.renderDomSandbox()).toBe(null);
            });
        });
    });
});
