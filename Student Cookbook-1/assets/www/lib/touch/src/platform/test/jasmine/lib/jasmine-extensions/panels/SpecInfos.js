/**
 * Renders spec infos.
 * @param {Jasmine.spec} spec The spec.
 * @param {HTMLElement} panelsEl The HTMLElement which encapsulate the tools panels.
 */
jasmine.panel.SpecInfos = function(config) {
    var resultItems = config.spec.results().getItems(),
        length = resultItems.length,
        resultEl,
        result,
        i;
            
    this.el = new jasmine.Dom({
        cls: "panel infos"   
    });
        
    for (i = 0; i < length; i++) {
        result = resultItems[i];
        if (result.type == "expect" && result.passed) {
            
            if (!result.passed()) {
                resultEl = this.renderFailedResult(result);
            } else {
                resultEl = this.renderPassedResult(result);
            }
            
            if (i === 0) {
                jasmine.Dom.setCls(resultEl, resultEl.className + " first");
            }
            
            this.el.appendChild(resultEl);
            
            if (result.error) {
                break;
            }
        }
    }

    return this;
};

/**
 * Renders failed spec result.
 * @param {Object} result The spec result.
 * @return {HTMLElement} The spec result message HTMLElement
 */
jasmine.panel.SpecInfos.prototype.renderFailedResult = function(result) {
    var me = this,
        message = result.message,
        children;

    children = [{
        cls: "prettyPrint",
        html: "Failed!!!\n" + jasmine.util.htmlEscape(message)
    }];

    if (result.error && !jasmine.browser.isIE) {
        children.push({
            cls: "stackTrace inspectStackTrace",
            html: "Inspect stack trace" 
        });
    }
    
    return new jasmine.Dom({
        cls: "resultMessage fail",
        children: children
    });
};


/**
 * Renders failed spec result.
 * @param {Object} result The spec result.
 * @return {HTMLElement} The spec result message HTMLElement
 */
jasmine.panel.SpecInfos.prototype.renderPassedResult = function(result) {
    var children = [{
        cls: "prettyPrint",
        html: "Passed!!!\nActual: "+ jasmine.pp(result.actual) + "\nExpected: " + jasmine.pp(result.expected) + "\nMatcher: " + result.matcherName + "."
    }];
    
    return new jasmine.Dom({
        cls: "resultMessage pass",
        children: children
    });
};
