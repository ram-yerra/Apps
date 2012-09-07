/**
 * @class Ext.fx2.target.Element
 * @extends Object
 */
Ext.ns('Ext.fx2.target');
Ext.fx2.target.Element = Ext.extend(Object, {
    isAnimTarget: true,

    constructor: function(target) {
        this.target = target;
        Ext.fx2.target.Element.superclass.constructor.call(this, target);
    },

    type: 'element',

    getId: function() {
        return this.target.id;
    },

    getAttr: function(attr, val) {
        return [[this.target, val != undefined ? val : this.target.getStyle(attr)]];
    },

    setAttr: function(targetData) {
        var target = this.target,
            ln = targetData.length,
            attrs,
            attr,
            o,
            i,
            j,
            ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    ln2 = attrs[attr].length;
                    for (j = 0; j < ln2; j++) {
                        o = attrs[attr][j];
                        o[0].setStyle(attr, o[1]);
                    }
                }
            }
        }
    }
});

/**
 * @class Ext.fx2.target.ElementCSS
 * @extends Ext.fx2.target.Element
 */
Ext.fx2.target.ElementCSS = Ext.extend(Ext.fx2.target.Element, {
    setAttr: function(targetData, isFirstFrame) {
        var cssArr = {
                attrs: [],
                duration: [],
                easing: []
            },
            ln = targetData.length,
            attributes,
            attrs,
            attr,
            easing,
            duration,
            o,
            i,
            j,
            ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i];
            duration = attrs.duration;
            easing = attrs.easing;
            attrs = attrs.attrs;
            for (attr in attrs) {
                if (cssArr.attrs.indexOf(attr) == -1) {
                    cssArr.attrs.push(attr.replace(/[A-Z]/g, function(v) {
                        return '-' + v.toLowerCase();
                    }));
                    cssArr.duration.push(duration + 'ms');
                    cssArr.easing.push(easing);
                }
            }
        }
        attributes = cssArr.attrs.join(',');
        duration = cssArr.duration.join(',');
        easing = cssArr.easing.join(', ');
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                ln2 = attrs[attr].length;
                for (j = 0; j < ln2; j++) {
                    o = attrs[attr][j];
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionProperty', isFirstFrame ? '' : attributes);
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionDuration', isFirstFrame ? '' : duration);
                    o[0].setStyle(Ext.supports.CSS3Prefix + 'TransitionTimingFunction', isFirstFrame ? '' : easing);
                    o[0].setStyle(attr, o[1]);

                    // Must trigger reflow to make this get used as the start point for the transition that follows
                    if (isFirstFrame) {
                        o = o[0].dom.offsetWidth;
                    }
                    else {
                        // Remove transition properties when completed.
                        o[0].on(Ext.supports.CSS3TransitionEnd, function() {
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionProperty', null);
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionDuration', null);
                            this.setStyle(Ext.supports.CSS3Prefix + 'TransitionTimingFunction', null);
                        }, o[0], { single: true });
                    }
                }
            }
        }
    }
});

/**
 * @class Ext.fx2.target.CompositeElement
 * @extends Ext.fx2.target.Element
 */
Ext.fx2.target.CompositeElement = Ext.extend(Ext.fx2.target.Element, {
    isComposite: true,
    constructor: function(target) {
        target.id = target.id || Ext.id(null, 'ext-composite-');
        Ext.fx2.target.CompositeElement.superclass.constructor.call(this, target);
    },

    getAttr: function(attr, val) {
        var out = [],
            target = this.target;
        target.each(function(el) {
            out.push([el, val != undefined ? val : el.getStyle(attr)]);
        });
        return out;
    }
});

/**
 * @class Ext.fx2.target.CompositeElementCSS
 * @extends Ext.fx2.target.CompositeElement
 */
Ext.fx2.target.CompositeElementCSS = Ext.fx2.target.CompositeElement;
Ext.fx2.target.CompositeElementCSS.prototype.setAttr = Ext.fx2.target.ElementCSS.prototype.setAttr;

/**
 * @class Ext.fx2.target.Sprite
 * @extends Object
 */
Ext.fx2.target.Sprite = Ext.extend(Object, {
    isAnimTarget: true,

    constructor: function(target) {
        this.target = target;
        Ext.fx2.target.Sprite.superclass.constructor.call(this, target);
    },

    type: 'draw',

    getId: function() {
        return this.target.id;
    },

    getFromPrim: function(sprite, attr) {
        var o;
        if (attr == 'translate') {
            o = {
                x: sprite.translation.x || 0,
                y: sprite.translation.y || 0
            };
        }
        else if (attr == 'rotate') {
            o = {
                degrees: sprite.rotation.degrees || 0,
                x: sprite.rotation.x,
                y: sprite.rotation.y
            };
        }
        else {
            o = sprite.attr[attr];
        }
        return o;
    },

    getAttr: function(attr, val) {
        return [[this.target, val != undefined ? val : this.getFromPrim(this.target, attr)]];
    },

    setAttr: function(targetData) {
        var ln = targetData.length,
            attrs,
            attr,
            attrArr,
            spriteArr = [],
            attPtr,
            spritePtr,
            idx,
            value,
            i,
            j,
            x,
            y,
            ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                attrArr = attrs[attr];
                ln2 = attrArr.length;
                for (j = 0; j < ln2; j++) {
                    attPtr = attrArr[j];
                    if (attr == 'translate') {
                        spritePtr = attPtr.x[0];
                        value = {
                            x: attPtr.x[1],
                            y: attPtr.y[1]
                        };
                    }
                    else if (attr == 'rotate') {
                        spritePtr = attPtr.x[0];
                        x = attPtr.x[1];
                        if (isNaN(x)) {
                            x = null;
                        }
                        y = attPtr.y[1];
                        if (isNaN(y)) {
                            y = null;
                        }
                        value = {
                            degrees: attPtr.degrees[1],
                            x: x,
                            y: y
                        };
                    }
                    else {
                        spritePtr = attPtr[0];
                        value = attPtr[1];
                    }
                    idx = spriteArr.indexOf(spritePtr);
                    if (idx == -1) {
                        spriteArr.push([spritePtr, {}]);
                        idx = spriteArr.length - 1;
                    }
                    spriteArr[idx][1][attr] = value;
                }
            }
        }
        ln = spriteArr.length;
        for (i = 0; i < ln; i++) {
            spritePtr = spriteArr[i];
            spritePtr[0].setAttributes(spritePtr[1]);
        }
        this.target.redraw();
    }
});

/**
 * @class Ext.fx2.target.SpriteGroup
 * @extends Ext.fx2.target.Sprite
 */
Ext.fx2.target.SpriteGroup = Ext.extend(Ext.fx2.target.Sprite, {
    getAttr: function(attr, val) {
        var out = [],
            target = this.target;
        target.each(function(sprite) {
            out.push([sprite, val != undefined ? val : this.getFromPrim(sprite, attr)]);
        }, this);
        return out;
    }
});

/**
 * @class Ext.fx2.target.Component
 * @extends Object
 */
Ext.fx2.target.Component = Ext.extend(Object, {
    isAnimTarget: true,

    constructor: function(target) {
        this.target = target;
        Ext.fx2.target.Component.superclass.constructor.call(this, target);
    },

    compMethod: {
        top: 'setPosition',
        left: 'setPosition',
        x: 'setPagePosition',
        y: 'setPagePosition',
        height: 'setSize',
        width: 'setSize',
        opacity: 'setOpacity'
    },

    compProperty: {
        top: 'y',
        left: 'x',
        x: 'x',
        y: 'y',
        height: 'height',
        width: 'width',
        opacity: 'value'
    },

    type: 'component',

    getId: function() {
        return this.target.id;
    },

    getAttr: function(attr, val) {
        return [[this.target, val != undefined ? val : this.target.el.getStyle(attr)]];
    },

    setAttr: function(targetData) {
        var target = this.target,
            ln = targetData.length,
            attrs,
            attr,
            o,
            i,
            j,
            meth,
            ln2;
        for (i = 0; i < ln; i++) {
            attrs = targetData[i].attrs;
            for (attr in attrs) {
                ln2 = attrs[attr].length;
                meth = {
                    setPosition: {},
                    setPagePosition: {},
                    setSize: {},
                    setOpacity: {}
                };
                for (j = 0; j < ln2; j++) {
                    o = attrs[attr][j];
                    // We REALLY want a single function call, so push these down to merge them
                    meth[this.compMethod[attr]][this.compProperty[attr]] = o[1];
                    meth[this.compMethod[attr]].target = o[0];
                }
                if (meth.setPosition.target) {
                    o = meth.setPosition;
                    o.target.setPosition(o.x, o.y);
                }
                if (meth.setPagePosition.target) {
                    o = meth.setPagePosition;
                    o.target.setPagePosition(o.x, o.y);
                }
                if (meth.setSize.target) {
                    o = meth.setSize;
                    o.target.setSize(o.width, o.height);
                }
                if (meth.setOpacity.target) {
                    o = meth.setOpacity;
                    o.target.el.setStyle('opacity', o.value);
                }
            }
        }
    }
});