/*
 * @class Ext.draw.Sprite
 * @extends Object
 *<p>Base drawing spriteitive class.  Provides bucket for all spriteitive attributes and basic methods for updating them.</p>
 */
Ext.draw.Sprite = Ext.extend(Ext.util.Observable, {
    dirty: false,
    isSprite: true,
    zIndex: 0,
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, {
            id: Ext.id(null, 'ext-sprite-'),
            translation: {
                x: null,
                y: null
            },
            rotation: {
                degrees: null,
                x: null,
                y: null
            },
            scaling: {
                x: null,
                y: null,
                cx: null,
                cy: null
            }
        });
        Ext.copyTo(this, config, 'surface,group,type');
        //attribute bucket
        this.attr = {};
        //delete not bucket attributes
        delete config.surface;
        delete config.group;
        delete config.type;
        this.setAttributes(config);
        this.addEvents(
            'render',
            'mousedown',
            'mouseup',
            'mouseover',
            'mouseout',
            'click'
        );
        Ext.draw.Sprite.superclass.constructor.call(this);
    },

    setAttributes: function(attrs, redraw) {
        var translate = attrs.translate,
            rotate = attrs.rotate,
            scale = attrs.scale,
            custom = this.surface.customAttributes;

        for (var att in custom) {
            if (attrs.hasOwnProperty(att) && typeof custom[att] == "function") {
                Ext.apply(attrs, custom[att].apply(this, [].concat(attrs[att])));
            }
        }

        Ext.apply(this.attr, attrs);
        if (translate) {
            Ext.apply(this.translation, translate, {
                x: null,
                y: null
            });
        }
        if (rotate) {
            Ext.apply(this.rotation, rotate, {
                degrees: null,
                x: null,
                y: null
            });
        }
        if (scale) {
            Ext.apply(this.scaling, scale, {
                x: null,
                y: null,
                cx: null,
                cy: null
            });
        }
        delete this.translate;
        delete this.rotate;
        delete this.scale;
        this.dirty = true;
        if ('zIndex' in attrs) {
            this.zIndexDirty = true;
        }
        if (redraw === true) {
            this.redraw();
        }
    },

    getBBox: function() {
        return this.surface.getBBox(this);
    },

    hide: function(redraw) {
        this.attr.hidden = true;
        this.dirty = true;
        if (redraw === true) {
            this.redraw();
        }
    },

    show: function(redraw) {
        this.attr.hidden = false;
        this.dirty = true;
        if (redraw === true) {
            this.redraw();
        }
    },

    redraw: function() {
        this.surface.renderItem(this);
    }
});
