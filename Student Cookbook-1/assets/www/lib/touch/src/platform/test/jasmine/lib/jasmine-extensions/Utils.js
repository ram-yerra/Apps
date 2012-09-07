/**
 * Takes an object and converts it to an encoded URL.
 * @param {Object} o The object to encode
 * @return {String}
 */
jasmine.util.urlEncode = function(object) {
        var buf = [],
            e = encodeURIComponent;

        for (var property in object) {
            if(object.hasOwnProperty(property)) {
                buf.push(property + '=' + e(object[property]));
            }
        }
        return buf.join('&');
};

/**
 * Takes an encoded URL and and converts it to an object. Example:
 * @param {String} string
 * @return {Object} A literal with members
 */
jasmine.util.urlDecode = function(string) {
    var obj = {},
        pairs, d, name, value, pair, i, length;
    if (string != "") {
        pairs = string.split('&');
        d = decodeURIComponent;
        length = pairs.length;
        for (i = 0; i < length; i++) {
            pair = pairs[i].split('=');
            name = d(pair[0]);
            value = d(pair[1]);
            obj[name] = !obj[name] ? value : [].concat(obj[name]).concat(value);
        }
    }
    return obj;
};

/**
 * Returns the window global object.
 * @return {Object} The window global object
 */
jasmine.util.getWindow = function() {
    return window;
};

/**
 * Returns the document.body HTMLElement.
 * @return {HTMLElement} The document body
 */
jasmine.util.getBody = function() {
    return document.body;
};
