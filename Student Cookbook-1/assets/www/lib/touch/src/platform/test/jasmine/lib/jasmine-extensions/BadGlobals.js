/**
 * Init allowedGlobals array.
 */
jasmine.BadGlobalsFinder = function(reporter) {
    var property,
        win = jasmine.util.getWindow();
        
    this.reporter = reporter;
    
    win.id = undefined;
    win._firebug = undefined;
    this.allowedGlobals = [];
    for (property in win) {
        this.allowedGlobals.push(property);
    }
};

/**
 * Returns true if improper global variables are found.
 * @return {Boolean} 
 */
jasmine.BadGlobalsFinder.prototype.check = function() {
    var allowedGlobalsCount = this.allowedGlobals.length,
        effectiveGlobalsCount = 0,
        win = jasmine.util.getWindow(),
        property;
        
    for (property in win) {
        effectiveGlobalsCount++;
    }

    return effectiveGlobalsCount > allowedGlobalsCount;
};

/**
 * Append to suite HTMLElement warning messages if improper global variables are found.
 * @param {HTMLElement} suiteEl The suite HTMLElement.
 */
jasmine.BadGlobalsFinder.prototype.report = function(suiteEl) {
    var allowedGlobals = this.allowedGlobals,
        win = jasmine.util.getWindow(),
        badGlobalEl,
        property;
    
    for (property in win) {
        if (allowedGlobals.indexOf(property) === -1) {
            badGlobalEl = this.reporter.renderWarning("Bad global variable found!", property + " = " + jasmine.pp(win[property]), suiteEl);            
            allowedGlobals.push(property);
        }
    }    
};
