/**
 * @class Ext.draw.Surface
 * @extends Object
 *<p></p>
 */
Ext.draw.Surface = Ext.extend(Ext.util.Observable, {
    availableAttrs: {
        blur: 0,
        "clip-rect": "0 0 1e9 1e9",
        cursor: "default",
        cx: 0,
        cy: 0,
        'dominant-baseline': 'auto',
        fill: "none",
        "fill-opacity": 1,
        font: '10px "Arial"',
        "font-family": '"Arial"',
        "font-size": "10",
        "font-style": "normal",
        "font-weight": 400,
        gradient: "",
        height: 0,
        href: "http://sencha.com/",
        opacity: 1,
        path: "M0,0",
        radius: 0,
        rx: 0,
        ry: 0,
        scale: "1 1",
        src: "",
        stroke: "#000",
        "stroke-dasharray": "",
        "stroke-linecap": "butt",
        "stroke-linejoin": "butt",
        "stroke-miterlimit": 0,
        "stroke-opacity": 1,
        "stroke-width": 1,
        target: "_blank",
        text: "",
        "text-anchor": "middle",
        title: "Ext Draw",
        width: 0,
        x: 0,
        y: 0,
        zIndex: 0
    },

 /**
  * @cfg {Number} height
  * The height of this component in pixels (defaults to auto).
  * <b>Note</b> to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
  */
 /**
  * @cfg {Number} width
  * The width of this component in pixels (defaults to auto).
  * <b>Note</b> to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
  */
    container: undefined,
    height: 352,
    width: 512,
    x: 0,
    y: 0,
    customAttributes: {},
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config);

        Ext.draw.Surface.superclass.constructor.call(this);

        this.domRef = Ext.getDoc().dom;

        this.addEvents(
            'mousedown',
            'mouseup',
            'mouseover',
            'mouseout',
            'mousemove',
            'click'
        );
        this.getId();
        this.initGradients();
        this.initItems();
        if (this.renderTo) {
            this.render(this.renderTo);
            delete this.renderTo;
        }
        return this;
    },

    initSurface: Ext.emptyFn,

    renderItem: Ext.emptyFn,

    renderItems: Ext.emptyFn,

    initGradients: function() {
        var gradients = this.gradients;
        if (gradients) {
            Ext.each(gradients, this.addGradient, this);
        }
    },

    initItems: function() {
        var items = this.items;
        this.items = new Ext.draw.SpriteGroup();
        this.groups = new Ext.draw.SpriteGroup();
        if (items) {
            this.add(items);
        }
    },

    scrubAttrs: function(sprite) {
        var i,
            attrs = {},
            exclude = {},
            sattr = sprite.attr;
        for (i in sattr) {    
            // Narrow down attributes to the main set
            if (this.translateAttrs.hasOwnProperty(i)) {
                // Translated attr
                attrs[this.translateAttrs[i]] = sattr[i];
                exclude[this.translateAttrs[i]] = true;
            }
            else if (this.availableAttrs.hasOwnProperty(i) && !exclude[i]) {
                // Passtrhough attr
                attrs[i] = sattr[i];
            }
        }
        return attrs;
    },

    /**
     * Add a gradient definition to the Surface. Note that in some surface engines, adding
     * a gradient via this method will not take effect if the surface has already been rendered.
     * Therefore, it is preferred to pass the gradients as an item to the surface config, rather
     * than calling this method, especially if the surface is rendered immediately (e.g. due to
     * 'renderTo' in its config).
     */
    addGradient: Ext.emptyFn,

    add: function() {
        var args = Array.prototype.slice.call(arguments),
            sprite,
            index;

        var hasMultipleArgs = args.length > 1;
        if (hasMultipleArgs || Ext.isArray(args[0])) {
            var items = hasMultipleArgs ? args : args[0],
                results = [],
                i, ln, item;

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                item = this.add(item);
                results.push(item);
            }

            return results;
        }
        sprite = this.prepareItems(args[0], true)[0];
        this.positionSpriteInList(sprite);
        this.onAdd(sprite);
        return sprite;
    },

    /**
     * Insert or move a given sprite into the correct position in the items
     * MixedCollection, according to its zIndex. Will be inserted at the end of
     * an existing series of sprites with the same or lower zIndex. If the sprite
     * is already positioned within an appropriate zIndex group, it will not be moved.
     * This ordering can be used by subclasses to assist in rendering the sprites in
     * the correct order for proper z-index stacking.
     * @param {Ext.draw.Sprite} sprite
     * @return {Number} the sprite's new index in the list
     */
    positionSpriteInList: function(sprite) {
        var items = this.items,
            zIndex = sprite.attr.zIndex,
            idx = items.indexOf(sprite);

        if (idx < 0 || (idx > 0 && items.getAt(idx - 1).attr.zIndex > zIndex) ||
                (idx < items.length - 1 && items.getAt(idx + 1).attr.zIndex < zIndex)) {
            items.removeAt(idx);
            idx = items.findIndexBy(function(otherSprite) {
                return otherSprite.attr.zIndex > zIndex;
            });
            if (idx < 0) {
                idx = items.length;
            }
            items.insert(idx, sprite);
        }
        return idx;
    },

    onAdd: function(sprite) {
        var group = sprite.group,
            groups, ln, i;
        if (group) {
            groups = [].concat(group);
            ln = groups.length;
            for (i = 0; i < ln; i++) {
                group = groups[i];
                this.getGroup(group).add(sprite);
            }
            delete sprite.group;
        }
    },
    
    remove: function(sprite) {
        if (sprite) {
            this.items.remove(sprite);
            this.onRemove(sprite);
            this.groups.each(function(item) {
                item.remove(sprite);
            });
        }
    },
    
    removeAll : function() {
        var items = this.items.items,
            ln = items.length,
            i;
        for (i = ln; i > -1; i--) {
            this.remove(items[i]);
        }
    },

    onRemove: Ext.emptyFn,

    createGroup: function(id) {
        var group = this.groups.get(id);
        if (!group) {
            group = new Ext.draw.SpriteGroup({
                surface: this
            });
            group.id = id || Ext.id(null, 'ext-surface-group-');
            this.groups.add(group);
        }
        return group;
    },

    // Returns the group mixed collection with the given id
    getGroup: function(id) {
        if (typeof id == "string") {
            var group = this.groups.get(id);
            if (!group) {
                group = this.createGroup(id);
            }
        } else {
            group = id;
        }
        return group;
    },

    prepareItems: function(items, applyDefaults) {
        items = [].concat(items);
        // Make sure defaults are applied and item is initialized
        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            // Temporary, just take in configs...
            item.surface = this;
            items[i] = this.createItem(item);
        }
        return items;
    },

    createItem: Ext.emptyFn,

    /**
     * Retrieves the id of this component.
     * Will autogenerate an id if one has not already been set.
     */
    getId: function() {
        return this.id || (this.id = Ext.id(null, 'ext-surface-'));
    },

    destroy: function() {
        delete this.domRef;
        this.removeAll();
    }
});


/**
 * Create and return a new concrete Surface instance appropriate for the current environment.
 * @param {Object} config Initial configuration for the Surface instance
 * @param {Array} implOrder Optional order of implementations to use; the first one that is
 *                available in the current environment will be used. Defaults to
 *                <code>['SVG', 'Canvas', 'VML]</code>.
 */
Ext.draw.Surface.newInstance = function(config, implOrder) {
    implOrder = implOrder || ['SVG', 'Canvas', 'VML'];

    var i = 0,
        len = implOrder.length,
        surfaceClass;

    for (; i < len; i++) {
        if (Ext.supports[implOrder[i]]) {
            surfaceClass = Ext.draw[implOrder[i]];
            if (surfaceClass) {
                return new surfaceClass(config);
            }
        }
    }

};
