/**
 * @class SenchaReporter
 * The Sencha Unit Tests Reporter
 */
var SenchaReporter = function(config) {
    config = config || {};

    this.options = jasmine.util.urlDecode(jasmine.util.getWindow().location.search.substring(1));
    this.runnedSpecsCount = 0;
    this.failedSpecsCount = 0;

    this.optionCheckBoxesEl = {};
    this.suitesEls = {};
    this.specsEls = {};
};

/**
 * Returns the reporter HTMLElement.
 * @return {HTMLElement} The reporter HTMLElement
 */
SenchaReporter.prototype.getReporterEl = function() {
    var bodyChildren = jasmine.util.getBody().children,
        length = bodyChildren.length,
        child, i;

    for (i = 0; i < length; i++) {
        child = bodyChildren[i];
        if (child.className == "jasmine_reporter") {
            return child;
        }
    }
    
    return null;
};

/**
 * Reloads current page with reporter options.
 */
SenchaReporter.prototype.reloadWindow = function() {
    jasmine.util.getWindow().location.search = jasmine.util.urlEncode(this.options);
};

/**
 * Called before runner execution.
 * @param {jasmine.Runner} runner The Jasmine Runner
 */ 
SenchaReporter.prototype.reportRunnerStarting = function(runner) {
    this.startedAt = new Date();
    this.renderReporter();
    this.renderBanner();
    this.renderRunner();
    this.domSandbox = new jasmine.DomSandbox();
    if (!jasmine.browser.isIE) {
        this.badGlobalsFinder = new jasmine.BadGlobalsFinder(this);
    }
    this.startAutoReloadTask();
    this.runner = runner;

    if (jasmine.util.getWindow().location.toString().search("http:") !== -1) {
        this.remote = true;
    } else {
        this.renderWarning("Warning!", "Because you access TestReporter locally, stack trace report isn't available.");
    }
};

/**
 * Starts autoReload task.
 */
SenchaReporter.prototype.startAutoReloadTask = function() {
    if (this.options.autoReload) {
        var interval = setInterval(function() {
            if (!jasmine.getEnv().currentRunner_.queue.isRunning()) {
                clearInterval(interval);
            
                setTimeout(function() {
                    jasmine.util.getWindow().location.reload();
                }, 2000);
            }
        }, 1500);
    }
};
/**
 * Called after Jasmine runner execution ends.
 * @param {jasmine.Runner} runner The Jasmine Runner
 */ 
SenchaReporter.prototype.reportRunnerResults = function(runner) {
    this.renderResults(runner);
    this.domSandbox.stop();
};

/**
 * Called after suite execution ends.
 * @param {jasmine.Runner} suite A Jasmine suite
 */ 
SenchaReporter.prototype.reportSuiteResults = function(suite) {
    var status = suite.results().passed() ? "passed" : "failed",
        suiteEl = this.suitesEls[suite.id];
    
    if (!jasmine.browser.isIE && !suite.parentSuite && this.badGlobalsFinder.check()){
        if (!suiteEl) {
            suiteEl = this.renderSuite(suite);
        }
        this.badGlobalsFinder.report(suiteEl);
    }
    
    if (suiteEl) {
        jasmine.Dom.setCls(suiteEl, "suite " + status);
    }
};

/**
 * Filters skipped specs.
 * @param {jasmine.Spec} spec The spec to filter.
 */
SenchaReporter.prototype.filterSpec = function(spec) {
    var suite = spec.suite,
        suiteId = this.options.suite,
        specId = this.options.spec;
        
    if (suiteId) {
        spec.skipped = true;
        while(suite) {
            if (suite.id == suiteId) {
                delete spec.skipped;
                break;
            }
            suite = suite.parentSuite;
        }
    }
    if (specId) {
        spec.skipped = true;
        if (spec.id == specId) {
            delete spec.skipped;
        }
    }
    if (spec.skipped) {
        spec.addBeforesAndAftersToQueue = function() {};
        spec.queue.start = function(fn) {
            fn.call(spec);
        };
    }
};

/**
 * Called before spec execution.
 * @param {jasmine.Runner} suite The Jasmine spec
 */ 
SenchaReporter.prototype.reportSpecStarting = function(spec) {
    this.currentSpec = spec;
    this.filterSpec(spec);
    if (!spec.skipped) {
        jasmine.Dom.setHTML(this.runnerMessageEl, "Running: " + jasmine.util.htmlEscape(spec.getFullName()));
        this.runnedSpecsCount = this.runnedSpecsCount + 1;
    }
};

/**
 * Called after spec execution.
 * @param {jasmine.Runner} suite The Jasmine spec
 */ 
SenchaReporter.prototype.reportSpecResults = function(spec) {
    var results, status;
    if (!spec.skipped) {
        results = spec.results();
        status = results.passed() ? "passed" : "failed";

        if(status === "failed") {
            this.failedSpecsCount = this.failedSpecsCount + 1;
        }

        if ((status === "failed" || this.options.showPassed) && !spec.skipped) {
            this.renderSpec(spec);
        }

        this.domSandbox.remove();
    }
};


/**
 * Options checkbox check/uncked handler.
 * @param {HTMLElement} el The checkbox HTMLElement
 */
SenchaReporter.prototype.onOptionClick = function(event) {
    var el, opt;
    event = event || jasmine.util.getWindow().event;
    el = event.target || event.srcElement;
    
    opt = el.className.split(" ")[1];
    if (el.checked) { 
       this.options[opt] = true;
    } else {
        delete this.options[opt];
    }
    this.reloadWindow();
};

/**
 * Renders the reporter htmlElement.
 * @return {HTMLElement} The reporter HTMLElement
 */ 
SenchaReporter.prototype.renderReporter = function() {
    jasmine.util.getBody().appendChild(new jasmine.Dom({
        tag: "div",
        cls: "jasmine_reporter"
    }));
};

/**
 * Renders option checkbox and label.
 * @param {String} name The option name.
 * @param {String} labelText The label text.
 * @return {HTMLElement} The option HTMLElement
 */ 
SenchaReporter.prototype.renderOption = function(name, labelText) {
    var me = this,
        checkbox = new jasmine.Dom({
            tag: "input",
            cls: "option " + name,
            type: "checkbox",
            onclick: function() {
                me.onOptionClick.apply(me, arguments);
            }
        });
        
    me.optionCheckBoxesEl[name] = checkbox; 
      
    return new jasmine.Dom({
        tag: "div",
        cls: "show",
        children: [{
            tag: "label",
            html: labelText
        }, checkbox]
    });
};

/**
 * Checks options checkboxs if needed. 
 */
SenchaReporter.prototype.checkOptions = function() {
    var property, checkbox;
    
    for (property in this.options) {
        checkbox = this.optionCheckBoxesEl[property];
        if (checkbox) {
            checkbox.checked = this.options[property];
        }
    }
};

/**
 * Renders the banner htmlElement, it contains logo and options checkboxes.
 * @return {HTMLElement} The banner HTMLElement
 */ 
SenchaReporter.prototype.renderBanner = function() {
    var me = this,
        options = me.options;
        
        showPassedCheckbox = new jasmine.Dom({
            tag: "input",
            cls: "option showPassed",
            type: "checkbox"
        });
        
        autoReloadCheckbox = new jasmine.Dom({
            tag: "input",
            cls: "option autoReload",
            type: "checkbox"
        });        
        
    me.banner = new jasmine.Dom({
        tag: "div",
        cls: "banner",
        children: [{
            tag: "div",
            cls: "logo"
        },{
            tag: "div",
            cls: "options",
            children: [
                this.renderOption("showPassed", "Show passed"),
                this.renderOption("autoReload", "Automatic reload")
            ]
        }]
    });

    me.getReporterEl().appendChild(me.banner);

    this.checkOptions();
};

/**
 * Renders runner message htmlElement, it shows current run status.
 * @return {HTMLElement} The runner HTMLElement
 */ 
SenchaReporter.prototype.renderRunner = function() {
    var property,
        options = {};

    this.runnerMessageEl = new jasmine.Dom({
            tag: "span",
            cls: "runner_message",
            html: "Starting..."
    });
    
    this.finishedAtEl = new jasmine.Dom({
            tag: "span",
            cls: "finished_at"
    });

    for (property in this.options) {
        if (this.options.hasOwnProperty(property)) {
            options[property] = this.options[property];
        }
    }
    delete options.spec;
    delete options.suite;
            
    this.runnerEl = jasmine.Dom({
        tag: "div",
        cls: "runner running",
        children: [{
            tag: "a",
            cls: "run_spec",
            href: "?" + jasmine.util.urlEncode(options),
            html: "Run all"
        }, this.runnerMessageEl, this.finishedAtEl]
    });
    
    this.getReporterEl().appendChild(this.runnerEl);
};

/**
 * Renders suite htmlElement.
 * @param {jasmine.Suite} suite The jasmine suite.
 * @return {HTMLElement} The suite HTMLElement
 */
SenchaReporter.prototype.renderSuite = function(suite) {
    var parent = this.getReporterEl(),
        options = {},
        property;
    
    if (suite.parentSuite) {
      parent = this.suitesEls[suite.parentSuite.id] || this.renderSuite(suite.parentSuite);
    }

    for (property in this.options) {
        if (this.options.hasOwnProperty(property)) {
            options[property] = this.options[property];
        }
    }

    options.suite = suite.id;
    delete options.spec;
    
    this.suitesEls[suite.id] = new jasmine.Dom({
        tag: "div",
        cls: "suite ",
        children: [{
            tag: "a",
            cls: "run_spec",
            href: "?" + jasmine.util.urlEncode(options),
            html: "Run"
        }, {
            tag: "span",
            cls: "description",
            html: suite.description
        }]
    });
    parent.appendChild(this.suitesEls[suite.id]);
    return this.suitesEls[suite.id];
};

/**
 * Renders spec htmlElement.
 * @param {jasmine.Spec} spec The jasmine spec.
 * @return {HTMLElement} The spec HTMLElement
 */
SenchaReporter.prototype.renderSpec = function(spec) {
    var parent = this.suitesEls[spec.suite.id] || this.renderSuite(spec.suite),
        passed = spec.results().passed(),
        options = {},
        property, specEl, toolsPanel;
        
    for (property in this.options) {
        if (this.options.hasOwnProperty(property)) {
            options[property] = this.options[property];
        }
    }

    options.spec = spec.id;
    delete options.suite;
    
    specEl = {
        tag: "div",
        cls: "spec " + (passed ? "passed": "failed"),
        children: [{
            tag: "a",
            cls: "run_spec",
            href: "?" + jasmine.util.urlEncode(options),
            html: "Run"
        },{
            tag: "span",
            cls: "description",
            html: spec.description
        }]
    };

    if(!passed || this.options.showPassed) {
        toolsPanel = new jasmine.panel.TabPanel({
            spec: spec,
            sandboxes: this.domSandbox.sandboxes
        });
        specEl.children.push(toolsPanel.el);
    }
    
    specEl = new jasmine.Dom(specEl);
    this.specsEls[spec.id] = specEl;
    parent.appendChild(specEl);
};

/**
 * Updates runner message with failed and passed specs
 * @param {jasmine.Runner} runner The jasmine runner.
 */
SenchaReporter.prototype.renderResults = function(runner) {
    var runTime,
        message,
        className = (this.failedSpecsCount > 0) ? "failed" : "passed";
        
    jasmine.Dom.setCls(this.runnerEl, "runner " + className);
    
    runTime = (new Date().getTime() - this.startedAt.getTime()) / 1000;

    message = "" + this.runnedSpecsCount + " spec" + (this.runnedSpecsCount == 1 ? "" : "s" ) + ", " + this.failedSpecsCount + " failure" + ((this.failedSpecsCount == 1) ? "" : "s");
    message += " in " + runTime + "s";
    
    jasmine.Dom.setHTML(this.runnerMessageEl, "");

    message = new jasmine.Dom({
        tag: "a",
        cls: "description",
        href: "?" + jasmine.util.urlEncode(this.options),
        html: message
    });
    
    this.runnerMessageEl.appendChild(message);
    
    jasmine.Dom.setHTML(this.finishedAtEl, "Finished at " + new Date().toString());
};

/**
 * Renders a warning message and append it to the reporter HTMLElement.
 * @param {String} title The warning message title.
 * @param {String} message The warning message.
 * @param {HTMLElement} el The HTMLElement to append the warning message (default to reporteEl)
 */
SenchaReporter.prototype.renderWarning = function (title, message, el) {
    var errorEl = new jasmine.Dom({
            tag: "div",
            cls: "warning",
            children: [{
                tag: "div",
                cls: "description",
                html: title
            },{
                tag: "div",
                cls: "messages",
                children: [{
                    tag: "div",
                    cls: "warningMessage",
                    html: message
                }]
            }]
    });
    el = el || this.getReporterEl();
    el.appendChild(errorEl);
};
