/**
 * Renders stack trace tool.
 * @param {Jasmine.spec} The jasmine spec.
 * @return {HTMLElement} The created HTMLElement.
 */
jasmine.panel.SpecStackTrace = function(config) {
    this.spec = config.spec;
    this.badLinesEls = [];
    this.reporter = jasmine.getEnv().reporter.subReporters_[0];
    
    var resultItems = this.spec.results().getItems(),
        length = resultItems.length,
        result,
        error,
        lines,
        i;

    if (jasmine.browser.isIE || !this.spec.hasError) {
        return this;
    }
    
    for (i = 0; i < length; i++) {
        result = resultItems[i];
        if (result.type == "expect" && result.passed && !result.passed()) {
            if (result.error) {
                error = result.error;
                break;
            }
        }
    }   
    
    if (error) {
        lines = this.extractStackTrace(error);

        this.el = new jasmine.Dom({
                tag: "div",
                cls: "panel stackTrace",
                children: this.renderStackLines(lines)
        });
    }

    return this;
};

/**
 * Extracts error stack trace.
 * @param {Error} e The javascript error object.
 * @return {Array} An array which contains all stack trace files and lineNumbers.
 */
jasmine.panel.SpecStackTrace.prototype.extractStackTrace = function(error) {
    var stack = error.stack || error.stackTrace,
        results = [],
        lines, line, length, i, extract, file, lineNumber;
    
    if (stack) {
        lines = stack.split("\n");
        length = lines.length;
        for(i = 0; i < length; i++) {
            line = lines[i];
            if (!line.match("jasmine.js")) {
                extract = this.extractFileAndLine(line);
                if (extract) {
                    results.push(extract);
                }
            }
        }
    } else {
        file = error.sourceURL || error.fileName;  
        lineNumber = error.line || error.lineNumber;

        if (file && lineNumber) {
            results.push({
                file: file,
                lineNumber: lineNumber
            });
        }
    }
    return results;
};

/**
 * Extracts filename and line number from a stack trace line.
 * @param {String} line The stack trace line.
 * @return {Object} An object containing the filename and the line number or null.
 */
jasmine.panel.SpecStackTrace.prototype.extractFileAndLine = function(line) {
    var splitString = this.reporter.remote  ? "http://" : "file:///",
        arr = line.split(splitString);

    if (arr[1]) {
        arr = arr[1].split(":");
    } else {
        return null;
    }
    return {
        file: splitString + arr[0],
        lineNumber: arr[1]
    }; 
};

/**
 * Render stack trace lines.
 * @param {String} file The filename.
 * @param {String/Number} lineNumber The line number.
 * @return {Array} An array containing all strace trace HTMLElements.
 */
jasmine.panel.SpecStackTrace.prototype.renderStackLines = function(lines) {
    var els = [],
        length = lines.length,
        el, line, i, file, lineNumber;

    for (i = 0; i < length; i++) {
        line = lines[i];
        file = line.file;
        lineNumber = parseInt(line.lineNumber, 0);
        el = new jasmine.Dom({
            cls: "stackTraceLine",
            children: [{
                cls: "fileName",
                html: "File: "+ file + " (line " + lineNumber + ")"
            },{
                cls: "fileSources",
                html: this.renderTraceFileSource(file, lineNumber) 
            }]
        });
        
        this.badLinesEls.push({
            el: el.children[1],
            line: lineNumber
        });
        els.push(el);
    }
    
    return els;
};

/**
 * Downloads source file.
 * @param {String} url The filename url.
 * @return {String} The file source or null.
 */
jasmine.panel.SpecStackTrace.prototype.getFile = function(file) {
    var request;

    if (jasmine.browser.isIE || !this.reporter.remote) {
        return null;
    }
    this.downloadedFiles = this.downloadedFiles || {};

    if (!this.downloadedFiles[file]) {
        request = new XMLHttpRequest();
        
        if (!request) {
            return null;
        }
        request.open("GET", file, false);

        request.send("");

        this.downloadedFiles[file] = request.responseText;        
    }
    
    return this.downloadedFiles[file];
};

/**
 * Renders stack trace source file.
 * @param {String} file The filename.
 * @param {String/Number} lineNumber The line number.
 * @return {HTMLElement} The javascript source file HTMLElement.
 */
jasmine.panel.SpecStackTrace.prototype.renderTraceFileSource = function (file, lineNumber) {
    return new jasmine.CodeHighLighter({
        source: this.getFile(file),
        lineNumber: lineNumber
    }).renderJsSources();
};

/**
 * Ensure that line which contains the error is visible without scroll.
 */
jasmine.panel.SpecStackTrace.prototype.afterRender = function() {
    var length = this.badLinesEls.length,
        badLine, firstChild, el, i, lineHeigth, visiblesLines;

    for (i = 0; i < length; i++) {
        badLine = this.badLinesEls[i];
        el = badLine.el;
        lineHeigth = el.children[0].children[0].offsetHeight;
        visiblesLines = el.clientHeight/lineHeigth;
        el.scrollTop = Math.max(badLine.line - visiblesLines/2, 0) * lineHeigth;
    }
    
    this.badLinesEls = [];
};
