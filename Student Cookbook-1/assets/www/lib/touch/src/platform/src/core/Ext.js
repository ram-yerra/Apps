/*
 * Additional functions for Ext Core and Ext JS
 */

// for old browsers
window.undefined = window.undefined;

/**
 * @class Ext
 * Ext core utilities and functions.
 * @singleton
 */
(function(){
    var idSeed = 0,
        toString = Object.prototype.toString,
        ua = navigator.userAgent.toLowerCase(),
        check = function(r){
            return r.test(ua);
        },
        DOC = document,
        docMode = DOC.documentMode,
        isStrict = DOC.compatMode == "CSS1Compat",
        isOpera = check(/opera/),
        isChrome = check(/\bchrome\b/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isIE = !isOpera && check(/msie/),
        isIE7 = isIE && (check(/msie 7/) || docMode == 7),
        isIE8 = isIE && (check(/msie 8/) && docMode != 7 && docMode != 9 || docMode == 8),
        isIE9 = isIE && (check(/msie 9/) && docMode != 7 && docMode != 8 || docMode == 9),
        isIE6 = isIE && !isIE7 && !isIE8 && !isIE9,
        isGecko = !isWebKit && check(/gecko/),
        isGecko2 = isGecko && check(/rv:1\.8/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isGecko4 = isGecko && check(/rv:2\.0/),
        isBorderBox = isIE && !isStrict,
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isAir = check(/adobeair/),
        isLinux = check(/linux/),
        isSecure = /^https/i.test(window.location.protocol);

    // remove css image flicker
    if (isIE6) {
        try {
            DOC.execCommand("BackgroundImageCache", false, true);
        } catch(e) {}
    }

    Ext.apply(Ext, {
        /**
         * The version of the framework
         * @type String
         */
        version : '4.0.0',
        versionDetail : {
            major : 4,
            minor : 0,
            patch : 0
        },
        
        /**
         * URL to a blank file used by Ext when in secure mode for iframe src and onReady src to prevent
         * the IE insecure content warning (<tt>'about:blank'</tt>, except for IE in secure mode, which is <tt>'javascript:""'</tt>).
         * @type String
         */
        SSL_SECURE_URL : isSecure && isIE ? 'javascript:""' : 'about:blank',
        
        /**
         * True if the browser is in strict (standards-compliant) mode, as opposed to quirks mode
         * @type Boolean
         */
        isStrict : isStrict,

        /**
         * True if the {@link Ext.Fx} Class is available
         * @type Boolean
         * @property enableFx
         */

        /**
         * HIGHLY EXPERIMENTAL
         * True to force css based border-box model override and turning off javascript based adjustments. This is a
         * runtime configuration and must be set before onReady.
         * @type Boolean
         */
        enableForcedBoxModel : true,

        /**
         * EXPERIMENTAL - True to cascade listener removal to child elements when an element is removed.
         * Currently not optimized for performance.
         * @type Boolean
         */
        enableNestedListenerRemoval : false,

        /**
         * Indicates whether to use native browser parsing for JSON methods.
         * This option is ignored if the browser does not support native JSON methods.
         * <b>Note: Native JSON methods will not work with objects that have functions.
         * Also, property names must be quoted, otherwise the data will not parse.</b> (Defaults to false)
         * @type Boolean
         */
        USE_NATIVE_JSON : false,

        /**
         * Converts any iterable (numeric indices and a length property) into a true array
         * Don't use this on strings. IE doesn't support "abc"[0] which this implementation depends on.
         * For strings, use this instead: "abc".match(/./g) => [a,b,c];
         * @param {Iterable} the iterable object to be turned into a true Array.
         * @return (Array) array
         */
        toArray : function() {
            return isIE ?
                function(a, i, j, res) {
                    res = [];
                    for (var x = 0, len = a.length; x < len; x++) {
                        res.push(a[x]);
                    }
                    return res.slice(i || 0, j || res.length);
                } :
                function(a, i, j) {
                    return Array.prototype.slice.call(a, i || 0, j || a.length);
                };
        }(),

        /**
         * Return the dom node for the passed String (id), dom node, or Ext.Element.
         * Optional 'strict' flag is needed for IE since it can return 'name' and
         * 'id' elements by using getElementById.
         * Here are some examples:
         * <pre><code>
// gets dom node based on id
var elDom = Ext.getDom('elId');
// gets dom node based on the dom node
var elDom1 = Ext.getDom(elDom);

// If we don&#39;t know if we are working with an
// Ext.Element or a dom node use Ext.getDom
function(el){
    var dom = Ext.getDom(el);
    // do something with the dom node
}
         * </code></pre>
         * <b>Note</b>: the dom node to be found actually needs to exist (be rendered, etc)
         * when this method is called to be successful.
         * @param {Mixed} el
         * @return HTMLElement
         */
        getDom : function(el, strict) {
            if (!el || !DOC) {
                return null;
            }
            if (el.dom) {
                return el.dom;
            } else {
                if (typeof el == 'string') {
                    var e = DOC.getElementById(el);
                    // IE returns elements with the 'name' and 'id' attribute.
                    // we do a strict check to return the element with only the id attribute
                    if (e && isIE && strict) {
                        if (el == e.getAttribute('id')) {
                            return e;
                        } else {
                            return null;
                        }
                    }
                    return e;
                } else {
                    return el;
                }
            }
        },

        /**
         * <p>Removes this element from the document, removes all DOM event listeners, and deletes the cache reference.
         * All DOM event listeners are removed from this element. If {@link Ext#enableNestedListenerRemoval} is
         * <code>true</code>, then DOM event listeners are also removed from all child nodes. The body node
         * will be ignored if passed in.</p>
         * @param {HTMLElement} node The node to remove
         */
        removeNode : isIE && !isIE8 ? function() {
            var d;
            return function(n){
                if(n && n.tagName != 'BODY'){
                    (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true) : Ext.EventManager.removeAll(n);
                    d = d || DOC.createElement('div');
                    d.appendChild(n);
                    d.innerHTML = '';
                    delete Ext.cache[n.id];
                }
            };
        }() : function(n) {
            if (n && n.parentNode && n.tagName != 'BODY') {
                (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true) : Ext.EventManager.removeAll(n);
                n.parentNode.removeChild(n);
                delete Ext.cache[n.id];
            }
        },

        /**
         * True if the detected browser is Opera.
         * @type Boolean
         */
        isOpera : isOpera,
        
        /**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,
        
        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,
        
        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,
        
        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,
        
        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,
        
        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,
        
        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,
        
        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,
        
        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,
        
        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,

        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,
        
        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,
        
        /**
         * True if the detected browser uses a pre-Gecko 1.9 layout engine (e.g. Firefox 2.x).
         * @type Boolean
         */
        isGecko2 : isGecko2,
        
        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * True if the detected browser uses a Gecko 2.0+ layout engine (e.g. Firefox 4.x).
         * @type Boolean
         */
        isGecko4 : isGecko4,
        
        /**
         * True if the detected browser is Internet Explorer running in non-strict mode.
         * @type Boolean
         */
        isBorderBox : isBorderBox,
        
        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,
        
        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,
        
        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,
        
        /**
         * True if the detected platform is Adobe Air.
         * @type Boolean
         */
        isAir : isAir
    });

    /**
     * Creates namespaces to be used for scoping variables and classes so that they are not global.
     * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
     * <pre><code>
Ext.namespace('Company', 'Company.data');
Ext.namespace('Company.data'); // equivalent and preferable to above syntax
Company.Widget = function() { ... }
Company.data.CustomStore = function(config) { ... }
</code></pre>
     * @param {String} namespace1
     * @param {String} namespace2
     * @param {String} etc
     * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
     * @method ns
     */
    Ext.ns = Ext.namespace;
})();

Ext.ns('Ext.util', 'Ext.lib', 'Ext.data');

Ext.cache = {};

/**
 * @class Function
 * These functions are available on every Function object (any JavaScript function).
 */
Ext.apply(Function.prototype, {
     /**
     * Creates a callback that passes arguments[0], arguments[1], arguments[2], ...
     * Call directly on any function. Example: <code>myFunction.createCallback(arg1, arg2)</code>
     * Will create a function that is bound to those 2 args. <b>If a specific scope is required in the
     * callback, use {@link #Ext.util.Function.createDelegate} instead.</b> The function returned by createCallback always
     * executes in the window scope.
     * <p>This method is required when you want to pass arguments to a callback function.  If no arguments
     * are needed, you can simply pass a reference to the function as a callback (e.g., callback: myFn).
     * However, if you tried to pass a function with arguments (e.g., callback: myFn(arg1, arg2)) the function
     * would simply execute immediately when the code is parsed. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// clicking the button alerts "Hi, Fred"
new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody(),
    handler: sayHi.createCallback('Fred')
});
</code></pre>
     * @return {Function} The new function
    */
    createCallback : function(/*args...*/){
        // make args available, in function below
        var args = arguments,
            method = this;
        return function() {
            return method.apply(window, args);
        };
    }
});

/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String, {
    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = Ext.util.Format.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
     * </code></pre>
     * @param {String} string The tokenized string to be formatted
     * @param {String} value1 The value to replace token {0}
     * @param {String} value2 Etc...
     * @return {String} The formatted string
     * @static
     */
    format : function(format) {
        var args = Ext.toArray(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});
