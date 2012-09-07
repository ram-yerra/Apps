/**
 * @class Ext.data.Connection
 * @extends Ext.util.Observable
 */
Ext.data.Connection = Ext.extend(Ext.util.Observable, {
    url: null,
    async: true,
    method: null,
    username: '',
    password: '',

    /**
     * @cfg {Boolean} disableCaching (Optional) True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    disableCaching: true,

    /**
     * @cfg {String} disableCachingParam (Optional) Change the parameter which is sent went disabling caching
     * through a cache buster. Defaults to '_dc'
     * @type String
     */
    disableCachingParam: '_dc',

    /**
     * @cfg {Number} timeout (Optional) The timeout in milliseconds to be used for requests. (defaults to 30000)
     */
    timeout : 30000,

    useDefaultHeader : true,
    defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
    useDefaultXhrHeader : true,
    defaultXhrHeader : 'XMLHttpRequest',

    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event beforerequest
             * Fires before a network request is made to retrieve a data object.
             * @param {Connection} conn This Connection object.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'beforerequest',
            /**
             * @event requestcomplete
             * Fires if the request was successfully completed.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestcomplete',
            /**
             * @event requestexception
             * Fires if an error HTTP status was returned from the server.
             * See <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html">HTTP Status Code Definitions</a>
             * for details of HTTP status codes.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestexception'
        );
        this.requests = {};
        Ext.data.Connection.superclass.constructor.call(this);
    },
    
    /**
     * Creates the appropriate XHR transport for the browser.
     * @private
     */
    getXHRInstance: (function(){
        var options = [function(){
            return new XMLHttpRequest();
        }, function(){
            return new ActiveXObject('Msxml2.XMLHTTP.6.0');
        }, function(){
            return new ActiveXObject('Msxml2.XMLHTTP.3.0');
        }, function(){
            return new ActiveXObject('Msxml2.XMLHTTP');
        }], i = 0,
            len = options.length,
            xhr;
            
        for(; i < len; ++i) {
            try{
                xhr = options[i];
                xhr();
                break;
            }catch(e){}
        }
        return xhr;
    })(),

    /**
     * <p>Sends an HTTP request to a remote server.</p>
     * <p><b>Important:</b> Ajax server requests are asynchronous, and this call will
     * return before the response has been received. Process any returned data
     * in a callback function.</p>
     * <pre><code>
Ext.Ajax.request({
url: 'ajax_demo/sample.json',
success: function(response, opts) {
  var obj = Ext.decode(response.responseText);
  console.dir(obj);
},
failure: function(response, opts) {
  console.log('server-side failure with status code ' + response.status);
}
});
     * </code></pre>
     * <p>To execute a callback function in the correct scope, use the <tt>scope</tt> option.</p>
     * @param {Object} options An object which may contain the following properties:<ul>
     * <li><b>url</b> : String/Function (Optional)<div class="sub-desc">The URL to
     * which to send the request, or a function to call which returns a URL string. The scope of the
     * function is specified by the <tt>scope</tt> option. Defaults to the configured
     * <tt>{@link #url}</tt>.</div></li>
     * <li><b>params</b> : Object/String/Function (Optional)<div class="sub-desc">
     * An object containing properties which are used as parameters to the
     * request, a url encoded string or a function to call to get either. The scope of the function
     * is specified by the <tt>scope</tt> option.</div></li>
     * <li><b>method</b> : String (Optional)<div class="sub-desc">The HTTP method to use
     * for the request. Defaults to the configured method, or if no method was configured,
     * "GET" if no parameters are being sent, and "POST" if parameters are being sent.  Note that
     * the method name is case-sensitive and should be all caps.</div></li>
     * <li><b>callback</b> : Function (Optional)<div class="sub-desc">The
     * function to be called upon receipt of the HTTP response. The callback is
     * called regardless of success or failure and is passed the following
     * parameters:<ul>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * <li><b>success</b> : Boolean<div class="sub-desc">True if the request succeeded.</div></li>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.
     * See <a href="http://www.w3.org/TR/XMLHttpRequest/">http://www.w3.org/TR/XMLHttpRequest/</a> for details about
     * accessing elements of the response.</div></li>
     * </ul></div></li>
     * <li><a id="request-option-success"></a><b>success</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon success of the request. The callback is passed the following
     * parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>failure</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon failure of the request. The callback is passed the
     * following parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>scope</b> : Object (Optional)<div class="sub-desc">The scope in
     * which to execute the callbacks: The "this" object for the callback function. If the <tt>url</tt>, or <tt>params</tt> options were
     * specified as functions from which to draw values, then this also serves as the scope for those function calls.
     * Defaults to the browser window.</div></li>
     * <li><b>timeout</b> : Number (Optional)<div class="sub-desc">The timeout in milliseconds to be used for this request. Defaults to 30 seconds.</div></li>
     * <li><b>form</b> : Element/HTMLElement/String (Optional)<div class="sub-desc">The <tt>&lt;form&gt;</tt>
     * Element or the id of the <tt>&lt;form&gt;</tt> to pull parameters from.</div></li>
     * <li><a id="request-option-isUpload"></a><b>isUpload</b> : Boolean (Optional)<div class="sub-desc"><b>Only meaningful when used
     * with the <tt>form</tt> option</b>.
     * <p>True if the form object is a file upload (will be set automatically if the form was
     * configured with <b><tt>enctype</tt></b> "multipart/form-data").</p>
     * <p>File uploads are not performed using normal "Ajax" techniques, that is they are <b>not</b>
     * performed using XMLHttpRequests. Instead the form is submitted in the standard manner with the
     * DOM <tt>&lt;form></tt> element temporarily modified to have its
     * <a href="http://www.w3.org/TR/REC-html40/present/frames.html#adef-target">target</a> set to refer
     * to a dynamically generated, hidden <tt>&lt;iframe></tt> which is inserted into the document
     * but removed after the return data has been gathered.</p>
     * <p>The server response is parsed by the browser to create the document for the IFRAME. If the
     * server is using JSON to send the return object, then the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17">Content-Type</a> header
     * must be set to "text/html" in order to tell the browser to insert the text unchanged into the document body.</p>
     * <p>The response text is retrieved from the document, and a fake XMLHttpRequest object
     * is created containing a <tt>responseText</tt> property in order to conform to the
     * requirements of event handlers and callbacks.</p>
     * <p>Be aware that file upload packets are sent with the content type <a href="http://www.faqs.org/rfcs/rfc2388.html">multipart/form</a>
     * and some server technologies (notably JEE) may require some custom processing in order to
     * retrieve parameter names and parameter values from the packet content.</p>
     * </div></li>
     * <li><b>headers</b> : Object (Optional)<div class="sub-desc">Request
     * headers to set for the request.</div></li>
     * <li><b>xmlData</b> : Object (Optional)<div class="sub-desc">XML document
     * to use for the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>jsonData</b> : Object/String (Optional)<div class="sub-desc">JSON
     * data to use as the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>disableCaching</b> : Boolean (Optional)<div class="sub-desc">True
     * to add a unique cache-buster param to GET requests.</div></li>
     * </ul></p>
     * <p>The options object may also contain any other property which might be needed to perform
     * postprocessing in a callback because it is passed to callback functions.</p>
     * @return {Object} request The request object. This may be used
     * to cancel the request.
     */
    request : function(options) {
        options = options || {};
        var me = this,
            scope = options.scope || window,
            username = options.username || me.username,
            password = options.password || me.password || '',
            async,
            requestOptions,
            request, 
            headers,
            xhr;
            
        if (me.fireEvent('beforerequest', me, options) !== false) {
            
            requestOptions = me.setupOptions(options, scope);            

            // if autoabort is set, cancel the current transactions
            if (options.autoAbort === true || me.autoAbort) {
                me.abort();
            }

            // create a connection object
            xhr = this.getXhrInstance();
            
            async = options.async !== false ? (options.async || me.async) : false;

            // open the request
            if (username) {
                xhr.open(requestOptions.method, requestOptions.url, async, username, password);
            } else {
                xhr.open(requestOptions.method, requestOptions.url, async);
            }

            headers = me.setupHeaders(xhr, options, requestOptions.data, requestOptions.params);

            // create the transaction object
            request = {
                id: ++Ext.data.Connection.requestId,
                xhr: xhr,
                headers: headers,
                options: options,
                timeout: setTimeout(function() {
                    request.timedout = true;
                    me.abort(request);
                }, options.timeout || me.timeout)
            };
            me.requests[request.id] = request;

            // bind our statechange listener
            xhr.onreadystatechange = Ext.createDelegate(me.onStateChange, me, [request]);

            // start the request!
            xhr.send(requestOptions.data);
            return request;
        } else {
            this.runCallback(options.callback, options.scope, [options, undefined, undefined]);
            return null;
        }
    },
    
    setupOptions: function(options, scope){
        var me =  this,
            params = options.params || {},
            extraParams = options.extraParams,
            urlParams = options.urlParams,
            url = options.url || me.url,
            jsonData = options.jsonData,
            method,
            disableCache,
            data;
            
        
        // allow params to be a method that returns the params object
        if (Ext.isFunction(params)) {
            params = params.call(scope, options);
        }

        // allow url to be a method that returns the actual url
        if (Ext.isFunction(url)) {
            url = url.call(scope, options);
        }
        
        if (!url) {
            throw 'No URL specified';
        }

        // check for xml or json data, and make sure json data is encoded
        data = options.rawData || options.xmlData || jsonData || null;
        if (jsonData && !Ext.isPrimitive(jsonData)) {
            data = Ext.encode(data);
        }
        
        // make sure params are a url encoded string and include any extraParams if specified
        params = Ext.urlEncode(extraParams, Ext.isObject(params) ? Ext.urlEncode(params) : params);
        
        urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;
        
        // decide the proper method for this request
        method = (options.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();
        
        
        disableCache = options.disableCaching !== false ? (options.disableCaching || me.disableCaching) : false;
        // if the method is get append date to prevent caching
        if (method === 'GET' && disableCache) {
            url = Ext.urlAppend(url, (options.disableCachingParam || me.disableCachingParam) + '=' + (new Date().getTime()));
        }
        
        // if the method is get or there is json/xml data append the params to the url
        if ((method == 'GET' || data) && params) {
            url = Ext.urlAppend(url, params);
            params = null;
        }
        
        // allow params to be forced into the url
        if (urlParams) {
            url = Ext.urlAppend(url, urlParams);
        }
        
        return {
            url: url,
            method: method,
            data: data || params || null
        }
    },
    
    setupHeaders: function(xhr, options, data, params){
        var me = this,
            headers = Ext.apply({}, options.headers || {}, me.defaultHeaders || {}),
            contentType = me.defaultPostHeader,
            jsonData = options.jsonData,
            xmlData = options.xmlData,
            key,
            header;
            
        if (!headers['Content-Type'] && (data || params)) {
            if (data) {
                if (options.rawData) {
                    contentType = 'text/plain';
                } else {
                    if (xmlData && Ext.isDefined(xmlData)) {
                        contentType = 'text/xml';
                    } else if (jsonData && Ext.isDefined(jsonData)) {
                        contentType = 'application/json';
                    }
                }
            }
            headers['Content-Type'] = contentType;
        }
        
        if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = me.defaultXhrHeader;
        }
        // set up all the request headers on the xhr object
        try{
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    header = headers[key];
                    xhr.setRequestHeader(key, header);
                }
                
            }
        } catch(e) {
            me.fireEvent('exception', key, header);
        }
        return headers;
    },

    getXhrInstance : function() {
        return new XMLHttpRequest();
    },
    
    /**
     * Determine whether this object has a request outstanding.
     * @param {Object} request (Optional) defaults to the last transaction
     * @return {Boolean} True if there is an outstanding request.
     */
    isLoading : function(request) {
        if (!(request && request.xhr)) {
            return false;
        }
        // if there is a connection and readyState is not 0 or 4
        var state = request.xhr.readyState;
        return !(state == 0 || state == 4);
    },

    /**
     * Aborts any outstanding request.
     * @param {Object} request (Optional) defaults to the last request
     */
    abort : function(request) {
        var me = this,
            requests = me.requests,
            id;
            
        if (request && me.isLoading(request)) {
            request.xhr.abort();
            me.clearTimeout(request);
            if (!request.timedout) {
                request.aborted = true;
            }
            me.onComplete(request);
        } else if (!request) {
            for(id in requests) {
                if (requests.hasOwnProperty(id)) {
                    me.abort(requests[id]);
                }
            }
        }
    },

    // private
    onStateChange : function(request) {
        if (request.xhr.readyState == 4) {
            this.clearTimeout(request);
            this.onComplete(request);
            this.cleanup(request);
        }
    },
    
    /**
     * Clear the timeout on the request
     * @private
     * @param {Object} The request
     */
    clearTimeout: function(request){
        clearTimeout(request.timeout);
        delete request.timeout;
    },
    
    /**
     * Clean up any left over information from the request
     * @private
     * @param {Object} The request
     */
    cleanup: function(request){
        request.xhr = null;
        delete request.xhr
    },
    
    runCallback: function(fn, scope, args){
        if (fn && Ext.isFunction(fn)) {
            fn.apply(scope || window, args);
        }
    },

    // private
    onComplete : function(request) {
        var me = this,
            options = request.options,
            result = me.parseStatus(request.xhr.status),
            success = result.success,
            response;

        if (success) {
            response = me.createResponse(request);
            me.fireEvent('requestcomplete', me, response, options);
            me.runCallback(options.success, options.scope, [response, options]);
        } else {
            if (result.isException || request.aborted || request.timedout) {
                response = me.createException(request);
            } else {
                response = me.createResponse(request);
            }
            me.fireEvent('requestexception', me, response, options);
            me.runCallback(options.failure, options.scope, [response, options]);
        }
        me.runCallback(options.callback, options.scope, [options, success, response]);
        delete me.requests[request.id];
    },
    
    /**
     * Check if the response status was successful
     * @param {Number} status The status code
     * @return {Object} An object containing success/status state
     */
    parseStatus: function(status) {
        var success = (status >= 200 && status < 300) || status == 304,
            isException = false;
            
        if (!success) {
            switch (status) {
                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    isException = true;
                    break;
            }
        }
        return {
            success: success,
            isException: isException    
        };
    },

    // private
    createResponse : function(request) {
        var xhr = request.xhr,
            headers = {},
            lines = xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, value;

        while (count--) {
            line = lines[count];
            index = line.indexOf(':');
            if(index >= 0) {
                key = line.substr(0, index).toLowerCase();
                if (line.charAt(index + 1) == ' ') {
                    ++index;
                }
                headers[key] = line.substr(index + 1);
            }
        }

        request.xhr = null;
        delete request.xhr;

        return {
            request: request,
            requestId : request.id,
            status : xhr.status,
            statusText : xhr.statusText,
            getResponseHeader : function(header){ return headers[header.toLowerCase()]; },
            getAllResponseHeaders : function(){ return headers; },
            responseText : xhr.responseText,
            responseXML : xhr.responseXML
        };
    },

    // private
    createException : function(request) {
        return {
            request : request,
            requestId : request.id,
            status : request.aborted ? -1 : 0,
            statusText : request.aborted ? 'transaction aborted' : 'communication failure',
            aborted: request.aborted,
            timedout: request.timedout
        };
    }
});

Ext.data.Connection.requestId = 0;

/**
 * @class Ext.Ajax
 * @extends Ext.data.Connection
 * A singleton instance of an {@link Ext.data.Connection}.
 * @singleton
 */
Ext.Ajax = new Ext.data.Connection({
    /**
     * @cfg {String} url @hide
     */
    /**
     * @cfg {Object} extraParams @hide
     */
    /**
     * @cfg {Object} defaultHeaders @hide
     */
    /**
     * @cfg {String} method (Optional) @hide
     */
    /**
     * @cfg {Number} timeout (Optional) @hide
     */
    /**
     * @cfg {Boolean} autoAbort (Optional) @hide
     */

    /**
     * @cfg {Boolean} disableCaching (Optional) @hide
     */

    /**
     * @property  disableCaching
     * True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    /**
     * @property  url
     * The default URL to be used for requests to the server. (defaults to undefined)
     * If the server receives all requests through one URL, setting this once is easier than
     * entering it on every request.
     * @type String
     */
    /**
     * @property  extraParams
     * An object containing properties which are used as extra parameters to each request made
     * by this object (defaults to undefined). Session information and other data that you need
     * to pass with each request are commonly put here.
     * @type Object
     */
    /**
     * @property  defaultHeaders
     * An object containing request headers which are added to each request made by this object
     * (defaults to undefined).
     * @type Object
     */
    /**
     * @property  method
     * The default HTTP method to be used for requests. Note that this is case-sensitive and
     * should be all caps (defaults to undefined; if not set but params are present will use
     * <tt>"POST"</tt>, otherwise will use <tt>"GET"</tt>.)
     * @type String
     */
    /**
     * @property  timeout
     * The timeout in milliseconds to be used for requests. (defaults to 30000)
     * @type Number
     */

    /**
     * @property  autoAbort
     * Whether a new request should abort any pending requests. (defaults to false)
     * @type Boolean
     */
    autoAbort : false
});