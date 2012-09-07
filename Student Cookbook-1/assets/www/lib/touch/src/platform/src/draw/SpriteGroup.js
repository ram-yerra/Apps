/**
 * @class Ext.draw.SpriteGroup
 * @extends Ext.util.MixedCollection
 *<p></p>
 */
Ext.draw.SpriteGroup = Ext.extend(Ext.util.MixedCollection, { 
    isSpriteGroup: true,
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            'mousedown',
            'mouseup',
            'mouseover',
            'mouseout',
            'click'
        );
        this.id = Ext.id(null, 'ext-sprite-group-');
        Ext.draw.SpriteGroup.superclass.constructor.call(this);
    },

    // private
    onClick: function(e) {
        this.fireEvent('click', e);
    },

    // private
    onMouseUp: function(e) {
        this.fireEvent('mouseup', e);
    },

    // private
    onMouseDown: function(e) {
        this.fireEvent('mousedown', e);
    },

    // private
    onMouseOver: function(e) {
        this.fireEvent('mouseover', e);
    },

    // private
    onMouseOut: function(e) {
        this.fireEvent('mouseout', e);
    },

    attachEvents: function(o) {
        o.on({
            scope: this,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut,
            click: this.onClick
        });
    },

    add: function(key, o) {
        var ans = Ext.draw.SpriteGroup.superclass.add.apply(this, Array.prototype.slice.call(arguments));
        this.attachEvents(ans);
        return ans;
    },

    insert: function(index, key, o) {
        return Ext.draw.SpriteGroup.superclass.insert.apply(this, Array.prototype.slice.call(arguments));
    },

    remove: function(o) {
        // clean this up for 4.x un syntax
        // o.un('mousedown', this.onMouseUp);
        // o.un('mouseup', this.onMouseDown);
        // o.un('mouseover', this.onMouseOver);
        // o.un('mouseout', this.onMouseOut);
        // o.un('click', this.onClick);
        Ext.draw.SpriteGroup.superclass.remove.apply(this, arguments);
    },
    // Returns the group bounding box.
    getBBox: function() {
        var i,
            sprite,
            bb,
            items = this.items,
            ln = this.length,
            surface = items.length? items[0].surface : false,
            minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;
        
        if (!surface) return false;
        
        for (i = 0; i < ln; i++) {
            sprite = items[i];
            if (sprite.el) {
                bb = surface.getBBox(sprite);
                minX = Math.min(minX, bb.x);
                maxX = Math.max(maxX, bb.x + bb.width);
                minY = Math.min(minY, bb.y);
                maxY = Math.max(maxY, bb.y + bb.height);
            }
        }
        return {
            x: minX,
            y: minY,
            height: maxY - minY,
            width: maxX - minX
        };
    },

    setAttributes: function(attrs, redraw) {
        var i,
            items = this.items,
            ln = this.length;
        for (i = 0; i < ln; i++) {
            items[i].setAttributes(attrs, redraw);
        }
        return this;
    },

    hide: function(attrs) {
        var i,
            items = this.items,
            ln = this.length;
        for (i = 0; i < ln; i++) {
            items[i].hide();
        }
        return this;
    },

    show: function(attrs) {
        var i,
            items = this.items,
            ln = this.length;
        for (i = 0; i < ln; i++) {
            items[i].show();
        }
        return this;
    },

    redraw: function() {
        var i,
            items = this.items,
            surface = items.length? items[0].surface : false,
            ln = this.length;
        
        if (surface) {
            for (i = 0; i < ln; i++) {
                surface.renderItem(items[i]);
            }
        }
        return this;
    }
});