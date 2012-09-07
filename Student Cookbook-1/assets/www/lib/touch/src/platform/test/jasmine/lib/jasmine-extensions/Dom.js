/**
 * Creates an HTMLElement.
 * @param {Object/HTMLElement} config Ext DomHelper style element config object.
 * If no tag is specified (e.g., {tag:'input'}) then a div will be automatically generated with the specified attributes.
 * @return {HTMLElement} The created HTMLElement
 */
jasmine.Dom = function(config) {
    var element, children, length, child, i, property;
    
    config = config || {};
    
    if (config.tagName) {
        return config;
    }
    
    element = document.createElement(config.tag || "div");
        children = config.children || [];
        length = children.length;

    delete config.tag;
    
    for (i = 0; i < length; i++) {
        child = children[i];
        element.appendChild(new jasmine.Dom(child));
    }
    delete config.children;
    
    if (config.cls) {
        jasmine.Dom.setCls(element, config.cls);
        delete config.cls;
    }

    if (config.html) {
        jasmine.Dom.setHTML(element, config.html);
        delete config.html;
    }

    if (config.style) {
        jasmine.Dom.setStyle(element, config.style);
        delete config.style;
    }
    
    for (property in config) {
        if (config.hasOwnProperty(property)) {
            element[property] = config[property];
        }
    }

    return element;
};

/**
 * Sets HTMLElement className.
 * @param {HTMLElement} element The HTMLElement
 * @param {String} cls The className string
 */
jasmine.Dom.setCls = function(element, cls) {
    element.className = cls;
};

/**
 * Sets HTMLElement innerHTML
 * @param {HTMLElement} element The HTMLElement
 * @param {String} html The innerHTML text
 */
jasmine.Dom.setHTML = function(element, html) {
    element.innerHTML = html;
};

/**
 * Sets HTMLElement style
 * @param {HTMLElement} element The HTMLElement
 * @param {String} style The style property to set
 */
jasmine.Dom.setStyle = function(element, style) {
    var property;
    for (property in style) {
        if (style.hasOwnProperty(property)) {
            element.style[property] = style[property];
        }
    }
};
