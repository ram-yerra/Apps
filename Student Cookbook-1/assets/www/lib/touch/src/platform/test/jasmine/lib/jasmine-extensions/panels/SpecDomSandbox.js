/**
 * Renders spec dom sandbox tool.
 * @param {Jasmine.spec} spec The spec.
 * @param {HTMLElement} panelsEl The HTMLElement which encapsulate the tools panels.
 */
jasmine.panel.SpecDomSandbox = function(config) {
    this.sandBox = config.sandboxes[config.spec.id];
    if (this.sandBox) {
        this.el = this.renderDomSandbox();
    }
    return this;
};

/**
 * Renders spec dom sandbox innerHTML.
 * @return {HTMElement} The formatted dom sandbox innerHTML.
 */
jasmine.panel.SpecDomSandbox.prototype.renderDomSandbox = function() {
    var sources = this.sandBox.innerHTML;
    if (sources !== "") {
        return new jasmine.Dom({
            cls: "panel domSandbox",
            html: jasmine.util.htmlEscape(sources)
        });
    }
    return null;
};
