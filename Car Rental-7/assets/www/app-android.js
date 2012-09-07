if (typeof Ext === "undefined") {
    Ext = {}
}
Ext.apply = (function () {
    for (var a in {
        valueOf: 1
    }) {
        return function (c, b, e) {
            if (e) {
                Ext.apply(c, e)
            }
            if (c && b && typeof b === "object") {
                for (var d in b) {
                    c[d] = b[d]
                }
            }
            return c
        }
    }
    return function (c, b, e) {
        if (e) {
            Ext.apply(c, e)
        }
        if (c && b && typeof b === "object") {
            for (var d in b) {
                c[d] = b[d]
            }
            if (b.toString !== Object.prototype.toString) {
                c.toString = b.toString
            }
            if (b.valueOf !== Object.prototype.valueOf) {
                c.valueOf = b.valueOf
            }
        }
        return c
    }
})();
Ext.apply(Ext, {
    platformVersion: "1.0",
    platformVersionDetail: {
        major: 1,
        minor: 0,
        patch: 3
    },
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    BLANK_IMAGE_URL: "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    isStrict: document.compatMode == "CSS1Compat",
    windowId: "ext-window",
    documentId: "ext-document",
    emptyFn: function () {},
    isSecure: /^https/i.test(window.location.protocol),
    isReady: false,
    enableGarbageCollector: true,
    enableListenerCollection: true,
    applyIf: function (b, a) {
        var c, d;
        if (b) {
            for (c in a) {
                if (b[c] === d) {
                    b[c] = a[c]
                }
            }
        }
        return b
    },
    repaint: function () {
        var a = Ext.getBody().createChild({
            cls: "x-mask x-mask-transparent"
        });
        setTimeout(function () {
            a.remove()
        }, 0)
    },
    id: function (a, b) {
        a = Ext.getDom(a) || {};
        if (a === document) {
            a.id = this.documentId
        } else {
            if (a === window) {
                a.id = this.windowId
            }
        }
        a.id = a.id || ((b || "ext-gen") + (++Ext.idSeed));
        return a.id
    },
    extend: function () {
        var b = function (d) {
                for (var c in d) {
                    if (!d.hasOwnProperty(c)) {
                        continue
                    }
                    this[c] = d[c]
                }
            };
        var a = Object.prototype.constructor;
        return function (c, h, f) {
            if (Ext.isObject(h)) {
                f = h;
                h = c;
                c = f.constructor != a ? f.constructor : function () {
                    h.apply(this, arguments)
                }
            }
            if (!h) {
                throw "Attempting to extend from a class which has not been loaded on the page."
            }
            var e = function () {},
                d, g = h.prototype;
            e.prototype = g;
            d = c.prototype = new e();
            d.constructor = c;
            c.superclass = g;
            if (g.constructor == a) {
                g.constructor = h
            }
            c.override = function (i) {
                Ext.override(c, i)
            };
            d.superclass = d.supr = (function () {
                return g
            });
            d.override = b;
            d.proto = d;
            c.override(f);
            c.extend = function (i) {
                return Ext.extend(c, i)
            };
            return c
        }
    }(),
    override: function (a, b) {
        Ext.apply(a.prototype, b)
    },
    namespace: function () {
        var e = arguments.length,
            d, f, c, a, h, g, b;
        for (d = 0; d < e; d++) {
            f = arguments[d];
            g = f.split(".");
            if (window.Ext) {
                b = window[g[0]] = Object(window[g[0]])
            } else {
                b = arguments.callee.caller.arguments[0]
            }
            for (a = 1, h = g.length; a < h; a++) {
                b = b[g[a]] = Object(b[g[a]])
            }
        }
        return b
    },
    urlEncode: function (f, d) {
        var b, a = [],
            c = encodeURIComponent;
        Ext.iterate(f, function (e, g) {
            b = Ext.isEmpty(g);
            Ext.each(b ? e : g, function (h) {
                a.push("&", c(e), "=", (!Ext.isEmpty(h) && (h != e || !b)) ? (Ext.isDate(h) ? Ext.encode(h).replace(/"/g, "") : c(h)) : "")
            })
        });
        if (!d) {
            a.shift();
            d = ""
        }
        return d + a.join("")
    },
    urlDecode: function (c, b) {
        if (Ext.isEmpty(c)) {
            return {}
        }
        var g = {},
            f = c.split("&"),
            h = decodeURIComponent,
            a, e;
        Ext.each(f, function (d) {
            d = d.split("=");
            a = h(d[0]);
            e = h(d[1]);
            g[a] = b || !g[a] ? e : [].concat(g[a]).concat(e)
        });
        return g
    },
    htmlEncode: function (a) {
        return Ext.util.Format.htmlEncode(a)
    },
    htmlDecode: function (a) {
        return Ext.util.Format.htmlDecode(a)
    },
    urlAppend: function (a, b) {
        if (!Ext.isEmpty(b)) {
            return a + (a.indexOf("?") === -1 ? "?" : "&") + b
        }
        return a
    },
    toArray: function (c, b, a) {
        return Array.prototype.slice.call(c, b || 0, a || c.length)
    },
    each: function (e, d, c) {
        if (Ext.isEmpty(e, true)) {
            return 0
        }
        if (!Ext.isIterable(e) || Ext.isPrimitive(e)) {
            e = [e]
        }
        for (var b = 0, a = e.length; b < a; b++) {
            if (d.call(c || e[b], e[b], b, e) === false) {
                return b
            }
        }
        return true
    },
    iterate: function (c, b, a) {
        if (Ext.isEmpty(c)) {
            return
        }
        if (Ext.isIterable(c)) {
            Ext.each(c, b, a);
            return
        } else {
            if (Ext.isObject(c)) {
                for (var d in c) {
                    if (c.hasOwnProperty(d)) {
                        if (b.call(a || c, d, c[d], c) === false) {
                            return
                        }
                    }
                }
            }
        }
    },
    pluck: function (a, c) {
        var b = [];
        Ext.each(a, function (d) {
            b.push(d[c])
        });
        return b
    },
    getBody: function () {
        return Ext.get(document.body || false)
    },
    getHead: function () {
        var a;
        return function () {
            if (a == undefined) {
                a = Ext.get(DOC.getElementsByTagName("head")[0])
            }
            return a
        }
    }(),
    getDoc: function () {
        return Ext.get(document)
    },
    getCmp: function (a) {
        return Ext.ComponentMgr.get(a)
    },
    getOrientation: function () {
        return window.innerHeight > window.innerWidth ? "portrait" : "landscape"
    },
    isIterable: function (a) {
        if (!a) {
            return false
        }
        if (Ext.isArray(a) || a.callee) {
            return true
        }
        if (/NodeList|HTMLCollection/.test(Object.prototype.toString.call(a))) {
            return true
        }
        return ((typeof a.nextNode != "undefined" || a.item) && Ext.isNumber(a.length)) || false
    },
    num: function (b, a) {
        b = Number(Ext.isEmpty(b) || Ext.isArray(b) || typeof b == "boolean" || (typeof b == "string" && Ext.util.Format.trim(b).length == 0) ? NaN : b);
        return isNaN(b) ? a : b
    },
    isEmpty: function (d, a) {
        var b = d == null,
            c = (Ext.isArray(d) && !d.length),
            e = !a ? d === "" : false;
        return b || c || e
    },
    isArray: function (a) {
        return Object.prototype.toString.apply(a) === "[object Array]"
    },
    isDate: function (a) {
        return Object.prototype.toString.apply(a) === "[object Date]"
    },
    isObject: function (a) {
        return !!a && !a.tagName && Object.prototype.toString.call(a) === "[object Object]"
    },
    isPrimitive: function (a) {
        return Ext.isString(a) || Ext.isNumber(a) || Ext.isBoolean(a)
    },
    isFunction: function (a) {
        return Object.prototype.toString.apply(a) === "[object Function]"
    },
    isNumber: function (a) {
        return Object.prototype.toString.apply(a) === "[object Number]" && isFinite(a)
    },
    isString: function (a) {
        return typeof a === "string"
    },
    isBoolean: function (a) {
        return Object.prototype.toString.apply(a) === "[object Boolean]"
    },
    isElement: function (a) {
        return a ? !! a.tagName : false
    },
    isDefined: function (a) {
        return typeof a !== "undefined"
    },
    destroy: function () {
        var c = arguments.length,
            b, a;
        for (b = 0; b < c; b++) {
            a = arguments[b];
            if (a) {
                if (Ext.isArray(a)) {
                    this.destroy.apply(this, a)
                } else {
                    if (Ext.isFunction(a.destroy)) {
                        a.destroy()
                    } else {
                        if (a.dom) {
                            a.remove()
                        }
                    }
                }
            }
        }
    }
});
Ext.SSL_SECURE_URL = Ext.isSecure && "about:blank";
Ext.ns = Ext.namespace;
Ext.ns("Ext.util", "Ext.data", "Ext.list", "Ext.form", "Ext.menu", "Ext.state", "Ext.layout", "Ext.app", "Ext.ux", "Ext.plugins", "Ext.direct", "Ext.lib", "Ext.gesture");
Ext.util.Observable = Ext.extend(Object, {
    isObservable: true,
    constructor: function (a) {
        var b = this;
        Ext.apply(b, a);
        if (b.listeners) {
            b.on(b.listeners);
            delete b.listeners
        }
        b.events = b.events || {};
        if (this.bubbleEvents) {
            this.enableBubble(this.bubbleEvents)
        }
    },
    eventOptionsRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|element|vertical|horizontal)$/,
    addManagedListener: function (h, d, f, e, c) {
        var g = this,
            a = g.managedListeners = g.managedListeners || [],
            b;
        if (Ext.isObject(d)) {
            c = d;
            for (d in c) {
                if (!c.hasOwnProperty(d)) {
                    continue
                }
                b = c[d];
                if (!g.eventOptionsRe.test(d)) {
                    g.addManagedListener(h, d, b.fn || b, b.scope || c.scope, b.fn ? b : c)
                }
            }
        } else {
            a.push({
                item: h,
                ename: d,
                fn: f,
                scope: e,
                options: c
            });
            h.on(d, f, e, c)
        }
    },
    removeManagedListener: function (k, e, h, l) {
        var g = this,
            b, d, j, c, a, f;
        if (Ext.isObject(e)) {
            b = e;
            for (e in b) {
                if (!b.hasOwnProperty(e)) {
                    continue
                }
                d = b[e];
                if (!g.eventOptionsRe.test(e)) {
                    g.removeManagedListener(k, e, d.fn || d, d.scope || b.scope)
                }
            }
        }
        j = this.managedListeners ? this.managedListeners.slice() : [];
        a = j.length;
        for (f = 0; f < a; f++) {
            c = j[f];
            if (c.item === k && c.ename === e && (!h || c.fn === h) && (!l || c.scope === l)) {
                this.managedListeners.remove(c);
                k.un(c.ename, c.fn, c.scope)
            }
        }
    },
    fireEvent: function () {
        var h = this,
            c = Ext.toArray(arguments),
            e = c[0].toLowerCase(),
            d = true,
            g = h.events[e],
            b = h.eventQueue,
            f;
        if (h.eventsSuspended === true) {
            if (b) {
                b.push(c)
            }
            return false
        } else {
            if (g && Ext.isObject(g) && g.bubble) {
                if (g.fire.apply(g, c.slice(1)) === false) {
                    return false
                }
                f = h.getBubbleTarget && h.getBubbleTarget();
                if (f && f.isObservable) {
                    if (!f.events[e] || !Ext.isObject(f.events[e]) || !f.events[e].bubble) {
                        f.enableBubble(e)
                    }
                    return f.fireEvent.apply(f, c)
                }
            } else {
                if (g && Ext.isObject(g)) {
                    c.shift();
                    d = g.fire.apply(g, c)
                }
            }
        }
        return d
    },
    addListener: function (b, d, c, g) {
        var f = this,
            a, e;
        if (Ext.isObject(b)) {
            g = b;
            for (b in g) {
                if (!g.hasOwnProperty(b)) {
                    continue
                }
                a = g[b];
                if (!f.eventOptionsRe.test(b)) {
                    f.addListener(b, a.fn || a, a.scope || g.scope, a.fn ? a : g)
                }
            }
        } else {
            b = b.toLowerCase();
            f.events[b] = f.events[b] || true;
            e = f.events[b] || true;
            if (Ext.isBoolean(e)) {
                f.events[b] = e = new Ext.util.Event(f, b)
            }
            e.addListener(d, c, Ext.isObject(g) ? g : {})
        }
    },
    removeListener: function (b, d, c) {
        var f = this,
            a, e;
        if (Ext.isObject(b)) {
            var g = b;
            for (b in g) {
                if (!g.hasOwnProperty(b)) {
                    continue
                }
                a = g[b];
                if (!f.eventOptionsRe.test(b)) {
                    f.removeListener(b, a.fn || a, a.scope || g.scope)
                }
            }
        } else {
            b = b.toLowerCase();
            e = f.events[b];
            if (e.isEvent) {
                e.removeListener(d, c)
            }
        }
    },
    clearListeners: function () {
        var b = this.events,
            c, a;
        for (a in b) {
            if (!b.hasOwnProperty(a)) {
                continue
            }
            c = b[a];
            if (c.isEvent) {
                c.clearListeners()
            }
        }
        this.clearManagedListeners()
    },
    purgeListeners: function () {
        console.warn("MixedCollection: purgeListeners has been deprecated. Please use clearListeners.");
        return this.clearListeners.apply(this, arguments)
    },
    clearManagedListeners: function () {
        var b = this.managedListeners || [],
            d = b.length,
            c, a;
        for (c = 0; c < d; c++) {
            a = b[c];
            a.item.un(a.ename, a.fn, a.scope)
        }
        this.managedListener = []
    },
    purgeManagedListeners: function () {
        console.warn("MixedCollection: purgeManagedListeners has been deprecated. Please use clearManagedListeners.");
        return this.clearManagedListeners.apply(this, arguments)
    },
    addEvents: function (e) {
        var d = this;
        d.events = d.events || {};
        if (Ext.isString(e)) {
            var b = arguments,
                c = b.length;
            while (c--) {
                d.events[b[c]] = d.events[b[c]] || true
            }
        } else {
            Ext.applyIf(d.events, e)
        }
    },
    hasListener: function (a) {
        var b = this.events[a];
        return b.isEvent === true && b.listeners.length > 0
    },
    suspendEvents: function (a) {
        this.eventsSuspended = true;
        if (a && !this.eventQueue) {
            this.eventQueue = []
        }
    },
    resumeEvents: function () {
        var a = this,
            b = a.eventQueue || [];
        a.eventsSuspended = false;
        delete a.eventQueue;
        Ext.each(b, function (c) {
            a.fireEvent.apply(a, c)
        })
    },
    relayEvents: function (b, e, h) {
        h = h || "";
        var g = this,
            a = e.length,
            d, c;

        function f(i) {
            return function () {
                return g.fireEvent.apply(g, [h + i].concat(Array.prototype.slice.call(arguments, 0, -1)))
            }
        }
        for (d = 0, a = e.length; d < a; d++) {
            c = e[d].substr(h.length);
            g.events[c] = g.events[c] || true;
            b.on(c, f(c), g)
        }
    },
    enableBubble: function (a) {
        var b = this;
        if (!Ext.isEmpty(a)) {
            a = Ext.isArray(a) ? a : Ext.toArray(arguments);
            Ext.each(a, function (c) {
                c = c.toLowerCase();
                var d = b.events[c] || true;
                if (Ext.isBoolean(d)) {
                    d = new Ext.util.Event(b, c);
                    b.events[c] = d
                }
                d.bubble = true
            })
        }
    }
});
Ext.override(Ext.util.Observable, {
    on: Ext.util.Observable.prototype.addListener,
    un: Ext.util.Observable.prototype.removeListener,
    mon: Ext.util.Observable.prototype.addManagedListener,
    mun: Ext.util.Observable.prototype.removeManagedListener
});
Ext.util.Observable.releaseCapture = function (a) {
    a.fireEvent = Ext.util.Observable.prototype.fireEvent
};
Ext.util.Observable.capture = function (c, b, a) {
    c.fireEvent = Ext.createInterceptor(c.fireEvent, b, a)
};
Ext.util.Observable.observe = function (a, b) {
    if (a) {
        if (!a.isObservable) {
            Ext.applyIf(a, new Ext.util.Observable());
            Ext.util.Observable.capture(a.prototype, a.fireEvent, a)
        }
        if (typeof b == "object") {
            a.on(b)
        }
        return a
    }
};
Ext.util.Observable.observeClass = Ext.util.Observable.observe;
Ext.util.Event = Ext.extend(Object, (function () {
    function b(e, f, g, d) {
        f.task = new Ext.util.DelayedTask();
        return function () {
            f.task.delay(g.buffer, e, d, Ext.toArray(arguments))
        }
    }
    function a(e, f, g, d) {
        return function () {
            var h = new Ext.util.DelayedTask();
            if (!f.tasks) {
                f.tasks = []
            }
            f.tasks.push(h);
            h.delay(g.delay || 10, e, d, Ext.toArray(arguments))
        }
    }
    function c(e, f, g, d) {
        return function () {
            f.ev.removeListener(f.fn, d);
            return e.apply(d, arguments)
        }
    }
    return {
        isEvent: true,
        constructor: function (e, d) {
            this.name = d;
            this.observable = e;
            this.listeners = []
        },
        addListener: function (f, e, d) {
            var g = this,
                h;
            e = e || g.observable;
            if (!g.isListening(f, e)) {
                h = g.createListener(f, e, d);
                if (g.firing) {
                    g.listeners = g.listeners.slice(0)
                }
                g.listeners.push(h)
            }
        },
        createListener: function (f, e, h) {
            h = h || {};
            e = e || this.observable;
            var g = {
                fn: f,
                scope: e,
                o: h,
                ev: this
            },
                d = f;
            if (h.delay) {
                d = a(d, g, h, e)
            }
            if (h.buffer) {
                d = b(d, g, h, e)
            }
            if (h.single) {
                d = c(d, g, h, e)
            }
            g.fireFn = d;
            return g
        },
        findListener: function (h, g) {
            var f = this.listeners,
                d = f.length,
                j, e;
            while (d--) {
                j = f[d];
                if (j) {
                    e = j.scope;
                    if (j.fn == h && (e == g || e == this.observable)) {
                        return d
                    }
                }
            }
            return -1
        },
        isListening: function (e, d) {
            return this.findListener(e, d) !== -1
        },
        removeListener: function (g, f) {
            var h = this,
                e, i, d;
            e = h.findListener(g, f);
            if (e != -1) {
                i = h.listeners[e];
                if (h.firing) {
                    h.listeners = h.listeners.slice(0)
                }
                if (i.task) {
                    i.task.cancel();
                    delete i.task
                }
                d = i.tasks && i.tasks.length;
                if (d) {
                    while (d--) {
                        i.tasks[d].cancel()
                    }
                    delete i.tasks
                }
                h.listeners.splice(e, 1);
                return true
            }
            return false
        },
        clearListeners: function () {
            var e = this.listeners,
                d = e.length;
            while (d--) {
                this.removeListener(e[d].fn, e[d].scope)
            }
        },
        fire: function () {
            var h = this,
                f = h.listeners,
                g = f.length,
                e, d, j;
            if (g > 0) {
                h.firing = true;
                for (e = 0; e < g; e++) {
                    j = f[e];
                    d = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                    if (j.o) {
                        d.push(j.o)
                    }
                    if (j && j.fireFn.apply(j.scope || h.observable, d) === false) {
                        return (h.firing = false)
                    }
                }
            }
            h.firing = false;
            return true
        }
    }
})());
Ext.util.Stateful = Ext.extend(Ext.util.Observable, {
    editing: false,
    dirty: false,
    persistanceProperty: "data",
    constructor: function (a) {
        Ext.applyIf(this, {
            data: {}
        });
        this.modified = {};
        this[this.persistanceProperty] = {};
        Ext.util.Stateful.superclass.constructor.call(this, a)
    },
    get: function (a) {
        return this[this.persistanceProperty][a]
    },
    set: function (j, f) {
        var d = this,
            c = d.fields,
            h = d.modified,
            b = [],
            e, g, a;
        if (arguments.length == 1 && Ext.isObject(j)) {
            for (g in j) {
                if (!j.hasOwnProperty(g)) {
                    continue
                }
                e = c.get(g);
                if (e && e.convert !== e.type.convert) {
                    b.push(g);
                    continue
                }
                d.set(g, j[g])
            }
            for (a = 0; a < b.length; a++) {
                e = b[a];
                d.set(e, j[e])
            }
        } else {
            if (c) {
                e = c.get(j);
                if (e && e.convert) {
                    f = e.convert(f, d)
                }
            }
            d[d.persistanceProperty][j] = f;
            if (e && e.persist && !d.isEqual(currentValue, f)) {
                if (d.isModified(j)) {
                    if (d.isEqual(h[j], f)) {
                        delete h[j];
                        d.dirty = false;
                        for (g in h) {
                            if (h.hasOwnProperty(g)) {
                                d.dirty = true;
                                break
                            }
                        }
                    }
                } else {
                    d.dirty = true;
                    h[j] = currentValue
                }
            }
            if (!d.editing) {
                d.afterEdit()
            }
        }
    },
    getChanges: function () {
        var a = this.modified,
            b = {},
            c;
        for (c in a) {
            if (a.hasOwnProperty(c)) {
                b[c] = this[this.persistanceProperty][c]
            }
        }
        return b
    },
    isModified: function (a) {
        return !!(this.modified && this.modified.hasOwnProperty(a))
    },
    setDirty: function () {
        this.dirty = true;
        if (!this.modified) {
            this.modified = {}
        }
        this.fields.each(function (a) {
            this.modified[a.name] = this[this.persistanceProperty][a.name]
        }, this)
    },
    markDirty: function () {
        throw new Error("Stateful: markDirty has been deprecated. Please use setDirty.")
    },
    reject: function (a) {
        var b = this.modified,
            c;
        for (c in b) {
            if (!b.hasOwnProperty(c)) {
                continue
            }
            if (typeof b[c] != "function") {
                this[this.persistanceProperty][c] = b[c]
            }
        }
        this.dirty = false;
        this.editing = false;
        delete this.modified;
        if (a !== true) {
            this.afterReject()
        }
    },
    commit: function (a) {
        this.dirty = false;
        this.editing = false;
        delete this.modified;
        if (a !== true) {
            this.afterCommit()
        }
    },
    copy: function (a) {
        return new this.constructor(Ext.apply({}, this[this.persistanceProperty]), a || this.internalId)
    }
});
Ext.util.HashMap = Ext.extend(Ext.util.Observable, {
    constructor: function (a) {
        this.addEvents("add", "clear", "remove", "replace");
        Ext.util.HashMap.superclass.constructor.call(this, a);
        this.clear(true)
    },
    getCount: function () {
        return this.length
    },
    getData: function (a, b) {
        if (b === undefined) {
            b = a;
            a = this.getKey(b)
        }
        return [a, b]
    },
    getKey: function (a) {
        return a.id
    },
    add: function (a, d) {
        var b = this,
            c;
        if (b.containsKey(a)) {
            throw new Error("This key already exists in the HashMap")
        }
        c = this.getData(a, d);
        a = c[0];
        d = c[1];
        b.map[a] = d;
        ++b.length;
        b.fireEvent("add", b, a, d);
        return d
    },
    replace: function (b, d) {
        var c = this,
            e = c.map,
            a;
        if (!c.containsKey(b)) {
            c.add(b, d)
        }
        a = e[b];
        e[b] = d;
        c.fireEvent("replace", c, b, d, a);
        return d
    },
    remove: function (b) {
        var a = this.findKey(b);
        if (a !== undefined) {
            return this.removeByKey(a)
        }
        return false
    },
    removeByKey: function (a) {
        var b = this,
            c;
        if (b.containsKey(a)) {
            c = b.map[a];
            delete b.map[a];
            --b.length;
            b.fireEvent("remove", b, a, c);
            return true
        }
        return false
    },
    get: function (a) {
        return this.map[a]
    },
    clear: function (a) {
        var b = this;
        b.map = {};
        b.length = 0;
        if (a !== true) {
            b.fireEvent("clear", b)
        }
        return b
    },
    containsKey: function (a) {
        return this.map[a] !== undefined
    },
    contains: function (a) {
        return this.containsKey(this.findKey(a))
    },
    getKeys: function () {
        return this.getArray(true)
    },
    getValues: function () {
        return this.getArray(false)
    },
    getArray: function (d) {
        var a = [],
            b, c = this.map;
        for (b in c) {
            if (c.hasOwnProperty(b)) {
                a.push(d ? b : c[b])
            }
        }
        return a
    },
    each: function (d, c) {
        var a = Ext.apply({}, this.map),
            b, e = this.length;
        c = c || this;
        for (b in a) {
            if (a.hasOwnProperty(b)) {
                if (d.call(c, b, a[b], e) === false) {
                    break
                }
            }
        }
        return this
    },
    clone: function () {
        var c = new Ext.util.HashMap(),
            b = this.map,
            a;
        c.suspendEvents();
        for (a in b) {
            if (b.hasOwnProperty(a)) {
                c.add(a, b[a])
            }
        }
        c.resumeEvents();
        return c
    },
    findKey: function (b) {
        var a, c = this.map;
        for (a in c) {
            if (c.hasOwnProperty(a) && c[a] === b) {
                return a
            }
        }
        return undefined
    }
});
Ext.util.MixedCollection = function (b, a) {
    this.items = [];
    this.map = {};
    this.keys = [];
    this.length = 0;
    this.addEvents("clear", "add", "replace", "remove", "sort");
    this.allowFunctions = b === true;
    if (a) {
        this.getKey = a
    }
    Ext.util.MixedCollection.superclass.constructor.call(this)
};
Ext.extend(Ext.util.MixedCollection, Ext.util.Observable, {
    allowFunctions: false,
    add: function (b, d) {
        var e = d,
            c = b;
        if (arguments.length == 1) {
            e = c;
            c = this.getKey(e)
        }
        if (typeof c != "undefined" && c !== null) {
            var a = this.map[c];
            if (typeof a != "undefined") {
                return this.replace(c, e)
            }
            this.map[c] = e
        }
        this.length++;
        this.items.push(e);
        this.keys.push(c);
        this.fireEvent("add", this.length - 1, e, c);
        return e
    },
    getKey: function (a) {
        return a.id
    },
    replace: function (c, d) {
        if (arguments.length == 1) {
            d = arguments[0];
            c = this.getKey(d)
        }
        var a = this.map[c];
        if (typeof c == "undefined" || c === null || typeof a == "undefined") {
            return this.add(c, d)
        }
        var b = this.indexOfKey(c);
        this.items[b] = d;
        this.map[c] = d;
        this.fireEvent("replace", c, a, d);
        return d
    },
    addAll: function (e) {
        if (arguments.length > 1 || Ext.isArray(e)) {
            var b = arguments.length > 1 ? arguments : e;
            for (var d = 0, a = b.length; d < a; d++) {
                this.add(b[d])
            }
        } else {
            for (var c in e) {
                if (!e.hasOwnProperty(c)) {
                    continue
                }
                if (this.allowFunctions || typeof e[c] != "function") {
                    this.add(c, e[c])
                }
            }
        }
    },
    each: function (e, d) {
        var b = [].concat(this.items);
        for (var c = 0, a = b.length; c < a; c++) {
            if (e.call(d || b[c], b[c], c, a) === false) {
                break
            }
        }
    },
    eachKey: function (d, c) {
        for (var b = 0, a = this.keys.length; b < a; b++) {
            d.call(c || window, this.keys[b], this.items[b], b, a)
        }
    },
    findBy: function (d, c) {
        for (var b = 0, a = this.items.length; b < a; b++) {
            if (d.call(c || window, this.items[b], this.keys[b])) {
                return this.items[b]
            }
        }
        return null
    },
    find: function () {
        throw new Error("[Ext.util.MixedCollection] Stateful: find has been deprecated. Please use findBy.")
    },
    insert: function (a, b, d) {
        var c = b,
            e = d;
        if (arguments.length == 2) {
            e = c;
            c = this.getKey(e)
        }
        if (this.containsKey(c)) {
            this.suspendEvents();
            this.removeByKey(c);
            this.resumeEvents()
        }
        if (a >= this.length) {
            return this.add(c, e)
        }
        this.length++;
        this.items.splice(a, 0, e);
        if (typeof c != "undefined" && c !== null) {
            this.map[c] = e
        }
        this.keys.splice(a, 0, c);
        this.fireEvent("add", a, e, c);
        return e
    },
    remove: function (a) {
        return this.removeAt(this.indexOf(a))
    },
    removeAll: function (a) {
        Ext.each(a || [], function (b) {
            this.remove(b)
        }, this);
        return this
    },
    removeAt: function (a) {
        if (a < this.length && a >= 0) {
            this.length--;
            var c = this.items[a];
            this.items.splice(a, 1);
            var b = this.keys[a];
            if (typeof b != "undefined") {
                delete this.map[b]
            }
            this.keys.splice(a, 1);
            this.fireEvent("remove", c, b);
            return c
        }
        return false
    },
    removeByKey: function (a) {
        return this.removeAt(this.indexOfKey(a))
    },
    removeKey: function () {
        console.warn("MixedCollection: removeKey has been deprecated. Please use removeByKey.");
        return this.removeByKey.apply(this, arguments)
    },
    getCount: function () {
        return this.length
    },
    indexOf: function (a) {
        return this.items.indexOf(a)
    },
    indexOfKey: function (a) {
        return this.keys.indexOf(a)
    },
    get: function (b) {
        var a = this.map[b],
            c = a !== undefined ? a : (typeof b == "number") ? this.items[b] : undefined;
        return typeof c != "function" || this.allowFunctions ? c : null
    },
    item: function () {
        console.warn("MixedCollection: item has been deprecated. Please use get.");
        return this.get.apply(this, arguments)
    },
    getAt: function (a) {
        return this.items[a]
    },
    itemAt: function () {
        console.warn("MixedCollection: itemAt has been deprecated. Please use getAt.");
        return this.getAt.apply(this, arguments)
    },
    getByKey: function (a) {
        return this.map[a]
    },
    key: function () {
        console.warn("MixedCollection: key has been deprecated. Please use getByKey.");
        return this.getByKey.apply(this, arguments)
    },
    contains: function (a) {
        return this.indexOf(a) != -1
    },
    containsKey: function (a) {
        return typeof this.map[a] != "undefined"
    },
    clear: function () {
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.fireEvent("clear")
    },
    first: function () {
        return this.items[0]
    },
    last: function () {
        return this.items[this.length - 1]
    },
    _sort: function (j, a, h) {
        var d, e, b = String(a).toUpperCase() == "DESC" ? -1 : 1,
            g = [],
            k = this.keys,
            f = this.items;
        h = h ||
        function (i, c) {
            return i - c
        };
        for (d = 0, e = f.length; d < e; d++) {
            g[g.length] = {
                key: k[d],
                value: f[d],
                index: d
            }
        }
        g.sort(function (i, c) {
            var l = h(i[j], c[j]) * b;
            if (l === 0) {
                l = (i.index < c.index ? -1 : 1)
            }
            return l
        });
        for (d = 0, e = g.length; d < e; d++) {
            f[d] = g[d].value;
            k[d] = g[d].key
        }
        this.fireEvent("sort", this)
    },
    sort: function (c, e) {
        var d = c;
        if (Ext.isString(c)) {
            d = [new Ext.util.Sorter({
                property: c,
                direction: e || "ASC"
            })]
        } else {
            if (c instanceof Ext.util.Sorter) {
                d = [c]
            } else {
                if (Ext.isObject(c)) {
                    d = [new Ext.util.Sorter(c)]
                }
            }
        }
        var b = d.length;
        if (b == 0) {
            return
        }
        var a = function (h, g) {
                var f = d[0].sort(h, g),
                    k = d.length,
                    j;
                for (j = 1; j < k; j++) {
                    f = f || d[j].sort.call(this, h, g)
                }
                return f
            };
        this.sortBy(a)
    },
    sortBy: function (c) {
        var b = this.items,
            f = this.keys,
            e = b.length,
            a = [],
            d;
        for (d = 0; d < e; d++) {
            a[d] = {
                key: f[d],
                value: b[d],
                index: d
            }
        }
        a.sort(function (h, g) {
            var i = c(h.value, g.value);
            if (i === 0) {
                i = (h.index < g.index ? -1 : 1)
            }
            return i
        });
        for (d = 0; d < e; d++) {
            b[d] = a[d].value;
            f[d] = a[d].key
        }
        this.fireEvent("sort", this)
    },
    reorder: function (d) {
        this.suspendEvents();
        var b = this.items,
            c = 0,
            f = b.length,
            a = [],
            e = [],
            g;
        for (g in d) {
            a[d[g]] = b[g]
        }
        for (c = 0; c < f; c++) {
            if (d[c] == undefined) {
                e.push(b[c])
            }
        }
        for (c = 0; c < f; c++) {
            if (a[c] == undefined) {
                a[c] = e.shift()
            }
        }
        this.clear();
        this.addAll(a);
        this.resumeEvents();
        this.fireEvent("sort", this)
    },
    sortByKey: function (a, b) {
        this._sort("key", a, b ||
        function (d, c) {
            var f = String(d).toUpperCase(),
                e = String(c).toUpperCase();
            return f > e ? 1 : (f < e ? -1 : 0)
        })
    },
    keySort: function () {
        console.warn("MixedCollection: keySort has been deprecated. Please use sortByKey.");
        return this.sortByKey.apply(this, arguments)
    },
    getRange: function (e, a) {
        var b = this.items;
        if (b.length < 1) {
            return []
        }
        e = e || 0;
        a = Math.min(typeof a == "undefined" ? this.length - 1 : a, this.length - 1);
        var c, d = [];
        if (e <= a) {
            for (c = e; c <= a; c++) {
                d[d.length] = b[c]
            }
        } else {
            for (c = e; c >= a; c--) {
                d[d.length] = b[c]
            }
        }
        return d
    },
    filter: function (d, c, f, a) {
        var b = [];
        if (Ext.isString(d)) {
            b.push(new Ext.util.Filter({
                property: d,
                value: c,
                anyMatch: f,
                caseSensitive: a
            }))
        } else {
            if (Ext.isArray(d) || d instanceof Ext.util.Filter) {
                b = b.concat(d)
            }
        }
        var e = function (g) {
                var m = true,
                    n = b.length,
                    h;
                for (h = 0; h < n; h++) {
                    var l = b[h],
                        k = l.filterFn,
                        j = l.scope;
                    m = m && k.call(j, g)
                }
                return m
            };
        return this.filterBy(e)
    },
    filterBy: function (e, d) {
        var a = new Ext.util.MixedCollection(),
            g = this.keys,
            b = this.items,
            f = b.length,
            c;
        a.getKey = this.getKey;
        for (c = 0; c < f; c++) {
            if (e.call(d || this, b[c], g[c])) {
                a.add(g[c], b[c])
            }
        }
        return a
    },
    findIndex: function (c, b, e, d, a) {
        if (Ext.isEmpty(b, false)) {
            return -1
        }
        b = this.createValueMatcher(b, d, a);
        return this.findIndexBy(function (f) {
            return f && b.test(f[c])
        }, null, e)
    },
    findIndexBy: function (f, e, g) {
        var b = this.keys,
            d = this.items;
        for (var c = (g || 0), a = d.length; c < a; c++) {
            if (f.call(e || this, d[c], b[c])) {
                return c
            }
        }
        return -1
    },
    createValueMatcher: function (c, e, a, b) {
        if (!c.exec) {
            var d = Ext.util.Format.escapeRegex;
            c = String(c);
            if (e === true) {
                c = d(c)
            } else {
                c = "^" + d(c);
                if (b === true) {
                    c += "$"
                }
            }
            c = new RegExp(c, a ? "" : "i")
        }
        return c
    },
    clone: function () {
        var e = new Ext.util.MixedCollection();
        var b = this.keys,
            d = this.items;
        for (var c = 0, a = d.length; c < a; c++) {
            e.add(b[c], d[c])
        }
        e.getKey = this.getKey;
        return e
    }
});
Ext.AbstractManager = Ext.extend(Object, {
    typeName: "type",
    constructor: function (a) {
        Ext.apply(this, a || {});
        this.all = new Ext.util.HashMap();
        this.types = {}
    },
    get: function (a) {
        return this.all.get(a)
    },
    register: function (a) {
        this.all.add(a)
    },
    unregister: function (a) {
        this.all.remove(a)
    },
    registerType: function (b, a) {
        this.types[b] = a;
        a[this.typeName] = b
    },
    isRegistered: function (a) {
        return this.types[a] !== undefined
    },
    create: function (a, d) {
        var b = a[this.typeName] || a.type || d,
            c = this.types[b];
        if (c == undefined) {
            throw new Error(Ext.util.Format.format("The '{0}' type has not been registered with this manager", b))
        }
        return new c(a)
    },
    onAvailable: function (d, c, b) {
        var a = this.all;
        a.on("add", function (e, f) {
            if (f.id == d) {
                c.call(b || f, f);
                a.un("add", c, b)
            }
        })
    },
    each: function (b, a) {
        this.all.each(b, a || this)
    },
    getCount: function () {
        return this.all.getCount()
    }
});
Ext.util.DelayedTask = function (d, c, a) {
    var e = this,
        f, b = function () {
            clearInterval(f);
            f = null;
            d.apply(c, a || [])
        };
    this.delay = function (h, j, i, g) {
        e.cancel();
        d = j || d;
        c = i || c;
        a = g || a;
        f = setInterval(b, h)
    };
    this.cancel = function () {
        if (f) {
            clearInterval(f);
            f = null
        }
    }
};
Ext.util.GeoLocation = Ext.extend(Ext.util.Observable, {
    autoUpdate: true,
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    allowHighAccuracy: false,
    timeout: Infinity,
    maximumAge: 0,
    setMaximumAge: function (a) {
        this.maximumAge = a;
        this.setAutoUpdate(this.autoUpdate)
    },
    setTimeout: function (a) {
        this.timeout = a;
        this.setAutoUpdate(this.autoUpdate)
    },
    setAllowHighAccuracy: function (a) {
        this.allowHighAccuracy = a;
        this.setAutoUpdate(this.autoUpdate)
    },
    setEnableHighAccuracy: function () {
        console.warn("GeoLocation: setEnableHighAccuracy has been deprecated. Please use setAllowHighAccuracy.");
        return this.setAllowHighAccuracy.apply(this, arguments)
    },
    provider: null,
    watchOperation: null,
    constructor: function (a) {
        Ext.apply(this, a);
        if (Ext.isDefined(this.enableHighAccuracy)) {
            console.warn("GeoLocation: enableHighAccuracy has been removed. Please use allowHighAccuracy.");
            this.allowHighAccuracy = this.enableHighAccuracy
        }
        this.coords = this;
        if (Ext.supports.GeoLocation) {
            this.provider = this.provider || (navigator.geolocation ? navigator.geolocation : (window.google || {}).gears ? google.gears.factory.create("beta.geolocation") : null)
        }
        this.addEvents("update", "locationerror", "locationupdate");
        Ext.util.GeoLocation.superclass.constructor.call(this);
        if (this.autoUpdate) {
            var b = this;
            setTimeout(function () {
                b.setAutoUpdate(b.autoUpdate)
            }, 0)
        }
    },
    setAutoUpdate: function (a) {
        if (this.watchOperation !== null) {
            this.provider.clearWatch(this.watchOperation);
            this.watchOperation = null
        }
        if (!a) {
            return true
        }
        if (!Ext.supports.GeoLocation) {
            this.fireEvent("locationerror", this, false, false, true, null);
            return false
        }
        try {
            this.watchOperation = this.provider.watchPosition(Ext.createDelegate(this.fireUpdate, this), Ext.createDelegate(this.fireError, this), this.parseOptions())
        } catch (b) {
            this.autoUpdate = false;
            this.fireEvent("locationerror", this, false, false, true, b.message);
            return false
        }
        return true
    },
    updateLocation: function (g, a, c) {
        var b = this;
        var f = function (h, e) {
                if (e) {
                    b.fireError(e)
                } else {
                    b.fireEvent("locationerror", b, false, false, true, h)
                }
                if (g) {
                    g.call(a || b, null, b)
                }
                b.fireEvent("update", false, b)
            };
        if (!Ext.supports.GeoLocation) {
            setTimeout(function () {
                f(null)
            }, 0);
            return
        }
        try {
            this.provider.getCurrentPosition(function (e) {
                b.fireUpdate(e);
                if (g) {
                    g.call(a || b, b, b)
                }
                b.fireEvent("update", b, b)
            }, function (e) {
                f(null, e)
            }, c ? c : this.parseOptions())
        } catch (d) {
            setTimeout(function () {
                f(d.message)
            }, 0)
        }
    },
    fireUpdate: function (a) {
        this.timestamp = a.timestamp;
        this.latitude = a.coords.latitude;
        this.longitude = a.coords.longitude;
        this.accuracy = a.coords.accuracy;
        this.altitude = a.coords.altitude;
        this.altitudeAccuracy = a.coords.altitudeAccuracy;
        this.heading = typeof a.coords.heading == "undefined" ? null : a.coords.heading;
        this.speed = typeof a.coords.speed == "undefined" ? null : a.coords.speed;
        this.fireEvent("locationupdate", this)
    },
    fireError: function (a) {
        this.fireEvent("locationerror", this, a.code == a.TIMEOUT, a.code == a.PERMISSION_DENIED, a.code == a.POSITION_UNAVAILABLE, a.message == undefined ? null : a.message)
    },
    parseOptions: function () {
        var a = {
            maximumAge: this.maximumAge,
            allowHighAccuracy: this.allowHighAccuracy
        };
        if (this.timeout !== Infinity) {
            a.timeout = this.timeout
        }
        return a
    },
    getLocation: function (c, a) {
        var b = this;
        if (this.latitude !== null) {
            c.call(a || b, b, b)
        } else {
            b.updateLocation(c, a)
        }
    }
});
Ext.util.Region = Ext.extend(Object, {
    constructor: function (d, f, a, c) {
        var e = this;
        e.top = d;
        e[1] = d;
        e.right = f;
        e.bottom = a;
        e.left = c;
        e[0] = c
    },
    contains: function (b) {
        var a = this;
        return (b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom)
    },
    intersect: function (g) {
        var f = this,
            d = Math.max(f.top, g.top),
            e = Math.min(f.right, g.right),
            a = Math.min(f.bottom, g.bottom),
            c = Math.max(f.left, g.left);
        if (a > d && e > c) {
            return new Ext.util.Region(d, e, a, c)
        } else {
            return false
        }
    },
    union: function (g) {
        var f = this,
            d = Math.min(f.top, g.top),
            e = Math.max(f.right, g.right),
            a = Math.max(f.bottom, g.bottom),
            c = Math.min(f.left, g.left);
        return new Ext.util.Region(d, e, a, c)
    },
    constrainTo: function (b) {
        var a = this,
            c = Ext.util.Numbers.constrain;
        a.top = c(a.top, b.top, b.bottom);
        a.bottom = c(a.bottom, b.top, b.bottom);
        a.left = c(a.left, b.left, b.right);
        a.right = c(a.right, b.left, b.right);
        return a
    },
    adjust: function (d, f, a, c) {
        var e = this;
        e.top += d;
        e.left += c;
        e.right += f;
        e.bottom += a;
        return e
    },
    getOutOfBoundOffset: function (a, b) {
        if (!Ext.isObject(a)) {
            if (a == "x") {
                return this.getOutOfBoundOffsetX(b)
            } else {
                return this.getOutOfBoundOffsetY(b)
            }
        } else {
            b = a;
            var c = new Ext.util.Offset();
            c.x = this.getOutOfBoundOffsetX(b.x);
            c.y = this.getOutOfBoundOffsetY(b.y);
            return c
        }
    },
    getOutOfBoundOffsetX: function (a) {
        if (a <= this.left) {
            return this.left - a
        } else {
            if (a >= this.right) {
                return this.right - a
            }
        }
        return 0
    },
    getOutOfBoundOffsetY: function (a) {
        if (a <= this.top) {
            return this.top - a
        } else {
            if (a >= this.bottom) {
                return this.bottom - a
            }
        }
        return 0
    },
    isOutOfBound: function (a, b) {
        if (!Ext.isObject(a)) {
            if (a == "x") {
                return this.isOutOfBoundX(b)
            } else {
                return this.isOutOfBoundY(b)
            }
        } else {
            b = a;
            return (this.isOutOfBoundX(b.x) || this.isOutOfBoundY(b.y))
        }
    },
    isOutOfBoundX: function (a) {
        return (a < this.left || a > this.right)
    },
    isOutOfBoundY: function (a) {
        return (a < this.top || a > this.bottom)
    },
    restrict: function (b, d, a) {
        if (Ext.isObject(b)) {
            var c;
            a = d;
            d = b;
            if (d.copy) {
                c = d.copy()
            } else {
                c = {
                    x: d.x,
                    y: d.y
                }
            }
            c.x = this.restrictX(d.x, a);
            c.y = this.restrictY(d.y, a);
            return c
        } else {
            if (b == "x") {
                return this.restrictX(d, a)
            } else {
                return this.restrictY(d, a)
            }
        }
    },
    restrictX: function (b, a) {
        if (!a) {
            a = 1
        }
        if (b <= this.left) {
            b -= (b - this.left) * a
        } else {
            if (b >= this.right) {
                b -= (b - this.right) * a
            }
        }
        return b
    },
    restrictY: function (b, a) {
        if (!a) {
            a = 1
        }
        if (b <= this.top) {
            b -= (b - this.top) * a
        } else {
            if (b >= this.bottom) {
                b -= (b - this.bottom) * a
            }
        }
        return b
    },
    getSize: function () {
        return {
            width: this.right - this.left,
            height: this.bottom - this.top
        }
    },
    copy: function () {
        return new Ext.util.Region(this.top, this.right, this.bottom, this.left)
    },
    toString: function () {
        return "Region[" + this.top + "," + this.right + "," + this.bottom + "," + this.left + "]"
    },
    translateBy: function (a) {
        this.left += a.x;
        this.right += a.x;
        this.top += a.y;
        this.bottom += a.y;
        return this
    },
    round: function () {
        this.top = Math.round(this.top);
        this.right = Math.round(this.right);
        this.bottom = Math.round(this.bottom);
        this.left = Math.round(this.left);
        return this
    },
    equals: function (a) {
        return (this.top == a.top && this.right == a.right && this.bottom == a.bottom && this.left == a.left)
    }
});
Ext.util.Region.getRegion = function (a) {
    return Ext.fly(a).getPageBox(true)
};
Ext.util.Region.from = function (a) {
    return new Ext.util.Region(a.top, a.right, a.bottom, a.left)
};
Ext.util.Point = Ext.extend(Object, {
    constructor: function (a, b) {
        this.x = (a != null && !isNaN(a)) ? a : 0;
        this.y = (b != null && !isNaN(b)) ? b : 0;
        return this
    },
    copy: function () {
        return new Ext.util.Point(this.x, this.y)
    },
    copyFrom: function (a) {
        this.x = a.x;
        this.y = a.y;
        return this
    },
    toString: function () {
        return "Point[" + this.x + "," + this.y + "]"
    },
    equals: function (a) {
        return (this.x == a.x && this.y == a.y)
    },
    isWithin: function (b, a) {
        if (!Ext.isObject(a)) {
            a = {
                x: a
            };
            a.y = a.x
        }
        return (this.x <= b.x + a.x && this.x >= b.x - a.x && this.y <= b.y + a.y && this.y >= b.y - a.y)
    },
    translate: function (a, b) {
        if (a != null && !isNaN(a)) {
            this.x += a
        }
        if (b != null && !isNaN(b)) {
            this.y += b
        }
    },
    roundedEquals: function (a) {
        return (Math.round(this.x) == Math.round(a.x) && Math.round(this.y) == Math.round(a.y))
    }
});
Ext.util.Point.fromEvent = function (c) {
    var b = (c.changedTouches && c.changedTouches.length > 0) ? c.changedTouches[0] : c;
    return new Ext.util.Point(b.pageX, b.pageY)
};
Ext.util.Offset = Ext.extend(Object, {
    constructor: function (a, b) {
        this.x = (a != null && !isNaN(a)) ? a : 0;
        this.y = (b != null && !isNaN(b)) ? b : 0;
        return this
    },
    copy: function () {
        return new Ext.util.Offset(this.x, this.y)
    },
    copyFrom: function (a) {
        this.x = a.x;
        this.y = a.y
    },
    toString: function () {
        return "Offset[" + this.x + "," + this.y + "]"
    },
    equals: function (a) {
        if (!(a instanceof Ext.util.Offset)) {
            throw new Error("offset must be an instance of Ext.util.Offset")
        }
        return (this.x == a.x && this.y == a.y)
    },
    round: function (b) {
        if (!isNaN(b)) {
            var a = Math.pow(10, b);
            this.x = Math.round(this.x * a) / a;
            this.y = Math.round(this.y * a) / a
        } else {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y)
        }
    },
    isZero: function () {
        return this.x == 0 && this.y == 0
    }
});
Ext.util.Offset.fromObject = function (a) {
    return new Ext.util.Offset(a.x, a.y)
};
Ext.Template = Ext.extend(Object, {
    constructor: function (d) {
        var f = this,
            b = arguments,
            a = [],
            g, c, e;
        f.initialConfig = {};
        if (Ext.isArray(d)) {
            d = d.join("")
        } else {
            if (b.length > 1) {
                for (c = 0, e = b.length; c < e; c++) {
                    g = b[c];
                    if (typeof g == "object") {
                        Ext.apply(f.initialConfig, g);
                        Ext.apply(f, g)
                    } else {
                        a.push(g)
                    }
                }
                d = a.join("")
            }
        }
        f.html = d;
        if (f.compiled) {
            f.compile()
        }
    },
    isTemplate: true,
    disableFormats: false,
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    applyTemplate: function (a) {
        var f = this,
            c = f.disableFormats !== true,
            e = Ext.util.Format,
            b = f;
        if (f.compiled) {
            return f.compiled(a)
        }
        function d(g, i, j, h) {
            if (j && c) {
                if (h) {
                    h = [a[i]].concat(new Function("return [" + h + "];")())
                } else {
                    h = [a[i]]
                }
                if (j.substr(0, 5) == "this.") {
                    return b[j.substr(5)].apply(b, h)
                } else {
                    return e[j].apply(e, h)
                }
            } else {
                return a[i] !== undefined ? a[i] : ""
            }
        }
        return f.html.replace(f.re, d)
    },
    set: function (a, c) {
        var b = this;
        b.html = a;
        b.compiled = null;
        return c ? b.compile() : b
    },
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    compile: function () {
        var me = this,
            fm = Ext.util.Format,
            useFormat = me.disableFormats !== true,
            body, bodyReturn;

        function fn(m, name, format, args) {
            if (format && useFormat) {
                args = args ? "," + args : "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + "("
                } else {
                    format = "this." + format.substr(5) + "("
                }
            } else {
                args = "";
                format = "(values['" + name + "'] == undefined ? '' : "
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'"
        }
        bodyReturn = me.html.replace(me.compileARe, "\\\\").replace(me.compileBRe, "\\n").replace(me.compileCRe, "\\'").replace(me.re, fn);
        body = "this.compiled = function(values){ return ['" + bodyReturn + "'].join('');};";
        eval(body);
        return me
    },
    insertFirst: function (b, a, c) {
        return this.doInsert("afterBegin", b, a, c)
    },
    insertBefore: function (b, a, c) {
        return this.doInsert("beforeBegin", b, a, c)
    },
    insertAfter: function (b, a, c) {
        return this.doInsert("afterEnd", b, a, c)
    },
    append: function (b, a, c) {
        return this.doInsert("beforeEnd", b, a, c)
    },
    doInsert: function (c, e, b, a) {
        e = Ext.getDom(e);
        var d = Ext.DomHelper.insertHtml(c, e, this.applyTemplate(b));
        return a ? Ext.get(d, true) : d
    },
    overwrite: function (b, a, c) {
        b = Ext.getDom(b);
        b.innerHTML = this.applyTemplate(a);
        return c ? Ext.get(b.firstChild, true) : b.firstChild
    }
});
Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;
Ext.Template.from = function (b, a) {
    b = Ext.getDom(b);
    return new Ext.Template(b.value || b.innerHTML, a || "")
};
Ext.XTemplate = Ext.extend(Ext.Template, {
    argsRe: /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/,
    nameRe: /^<tpl\b[^>]*?for="(.*?)"/,
    ifRe: /^<tpl\b[^>]*?if="(.*?)"/,
    execRe: /^<tpl\b[^>]*?exec="(.*?)"/,
    constructor: function () {
        Ext.XTemplate.superclass.constructor.apply(this, argume