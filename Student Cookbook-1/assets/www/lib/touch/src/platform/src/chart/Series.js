/**
 * @class Ext.chart.Series
 * Common base class for chart series implementations.
 * @constructor
 */
Ext.chart.Series = Ext.extend(Object, {
    /**
     * The type of series. Set in subclasses.
     */
    type: null,

    /**
     * @cfg {String} displayName
     * The human-readable name of the series.
     */
    displayName: null,

    /**
     * @cfg {Boolean} showInLegend
     * Whether to show this series in the legend.
     */
    showInLegend: true,

    /**
     * @cfg {Function} renderer
     * A function that can be overridden to set custom styling properties to each rendered element.
     */
    renderer: function(sprite, record, attributes, index, store) { return attributes; },
    
    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */
    shadowAttributes: [{
        "stroke-width": 6,
        "stroke-opacity": 0.05,
        stroke: 'rgb(0, 0, 0)',
        translate: {
            x: 1,
            y: 1
        }
    }, {
        "stroke-width": 4,
        "stroke-opacity": 0.1,
        stroke: 'rgb(0, 0, 0)',
        translate: {
            x: 1,
            y: 1
        }
    }, {
        "stroke-width": 2,
        "stroke-opacity": 0.15,
        stroke: 'rgb(0, 0, 0)',
        translate: {
            x: 1,
            y: 1
        }
    }],
    
    /**
     * @cfg {Array} shadowGroups
     * An array with shadow sprite groups
     */
    
    constructor: function(config) {
        if (config) {
            Ext.apply(this, config);
        }
        this.shadowGroups = [];

        Ext.chart.Series.superclass.constructor.call(this);
        
        LabelMgr.constructor.call(this, config);
        HighlightMgr.constructor.call(this, config);
        Tips.constructor.call(this, config);
        Callouts.constructor.call(this, config);

        this.chart.on({
            scope: this,
            itemmouseover: this.onItemMouseOver,
            itemmouseout: this.onItemMouseOut,
            mouseleave: this.onMouseLeave
        });
    },

    getGutters: function () {
        return [0, 0];
    },
    
    onItemMouseOver: function(item) {
        if (item.series === this) {
            if (this.highlight) {
                this.highlightItem(item);
            }
            if (this.tooltip) {
                this.showTip(item);
            }
        }
    },

    onItemMouseOut: function(item) {
        if (item.series === this) {
            this.unHighlight();
            if (this.tooltip) {
                this.hideTip(item);
            }
        }
    },

    onMouseLeave: function() {
        this.unHighlight();
        if (this.tooltip) {
            this.hideTip();
        }
    },

    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     * @param {Number} x
     * @param {Number} y
     * @return {Object} An object describing the item, or null if there is no matching item. The exact contents of
     *                  this object will vary by series type, but should always contain at least the following:
     *                  <ul>
     *                    <li>{Ext.chart.Series} series - the Series object to which the item belongs</li>
     *                    <li>{Object} value - the value(s) of the item's data point</li>
     *                    <li>{Array} point - the x/y coordinates relative to the chart box of a single point
     *                        for this data item, which can be used as e.g. a tooltip anchor point.</li>
     *                    <li>{Ext.draw.Sprite} sprite - the item's rendering Sprite.
     *                  </ul>
     */
    getItemForPoint: function(x, y) {
        return null;
    }

});

var LabelMgr = {
    
    /**
     * @cfg {String} labelDisplay
     * Specifies the presence and position of labels for each pie slice. Either "rotate", "middle", "insideStart",
     * "insideEnd", "outside", "over", "under", or "none" to prevent label rendering.
     */

    /**
     * @cfg {String} labelColor
     * The color of the label text
     */
    
    /**
     * @cfg {String} labelField
     * The name of the field to be displayed in the label
     */
    
    /**
     * @cfg {Number} labelMinMargin
     * Specifies the minimum distance from a label to the origin of the visualization.
     * This parameter is useful when using PieSeries width variable pie slice lengths.
     * Default value is 50.
     */
    
    /**
     * @cfg {String} labelFont
     * The font used for the labels
     */
    
    /**
     * @cfg {String} labelOrientation
     * Either "horizontal" or "vertical"
     */

    /**
     * @cfg {Function} labelRenderer
     * Optional function for formatting the label into a displayable value
     * @param v
     */
    
    constructor: function(config) {
        this.label = Ext.applyIf(this.label || {}, {
            display: "none",
            color: "#000",
            field: "name",
            minMargin: 50,
            font: "11px Helvetica, sans-serif",
            orientation: "horizontal",
            renderer: function(v) {
                return v; 
            }
        });
        
        if(this.label.display !== 'none') {
            this.labelsGroup = this.chart.surface.getGroup(this.seriesId + '-labels');
        }
    },
    
    renderLabels: function() {
        var items = this.items,
            animate = this.chart.animate,
            config = this.label,
            display = config.display,
            color = config.color,
            field = [].concat(config.field),
            group = this.labelsGroup,
            store = this.chart.store,
            len = store.getCount(),
            ratio = items.length / len,
            i, count, j;
        
        if (display == 'none') {
            return;
        }
            
        for (i = 0, count = 0; i < len; i++) {
            for (j = 0; j < ratio; j++) {
                var item = items[count],
                    label = group.getAt(count),
                    storeItem = store.getAt(i);
                if (field[j]) {
                    if (!label) {
                        label = this.onCreateLabel(storeItem, item, i, display, j, count);
                    }
                    this.onPlaceLabel(label, storeItem, item, i, display, animate, j, count);
                    count++;
                }
            }
        }
        this.hideLabels(count);
    },
    
    hideLabels: function(index) {
        var labelsGroup = this.labelsGroup,
            len = labelsGroup.getCount();
        while(len-- > index) {
            labelsGroup.getAt(len).hide(true);
        }
    }
};


var HighlightMgr = {
    
    /**
     * Highlight the given series item.
     * @param {Boolean|Object} Default's false. Can also be an object width style properties (i.e fill, stroke, radius) 
     * or just use default styles per series by setting highlight = true.
     */
    highlight: false,
    
    //Styles for highlighting an element.
    highlightStyles: {
        fill: '#fdd',
        radius: 20,
        lineWidth: 5,
        stroke: '#f55'
    },
    
    constructor: function(config) {
        if (config.highlight) {
            if (config.highlight !== true) { //is an object
                config.highlightStyles = Ext.apply({}, config.highlight);
            }
        }
    },
    
    /**
     * Highlight the given series item.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightItem: function(item) {
        var sprite = item.sprite,
            opts = this.highlightStyles,
            surface = this.chart.surface,
            animate = this.chart.animate;
        
        if (!this.highlight || !sprite || sprite._highlighted) {
            return;
        }
        if (sprite._anim) {
            sprite._anim.paused = true;
        }
        sprite._highlighted = true;
        if (!sprite._defaults) {
            sprite._defaults = Ext.apply(sprite._defaults || {}, sprite.attr);
            var from = {}, to = {};
            for(var p in opts) {
                if (!(p in sprite._defaults)) {
                    sprite._defaults[p] = surface.availableAttrs[p];
                }
                from[p] = sprite._defaults[p];
                to[p] = opts[p];
                if (Ext.isObject(opts[p])) {
                    from[p] = {};
                    to[p] = {};
                    Ext.apply(sprite._defaults[p], sprite.attr[p]);
                    Ext.apply(from[p], sprite._defaults[p]);
                    for(var pi in sprite._defaults[p]) {
                        if (!(pi in opts[p])) {
                            to[p][pi] = from[p][pi];
                        } else {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                    for(pi in opts[p]) {
                        if (!(pi in to[p])) {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                }
            }
            sprite._from = from;
            sprite._to = to;
        } 
        if (animate) {
            sprite._anim = new Ext.fx2.Anim({
                target: sprite,
                from: sprite._from,
                to: sprite._to,
                duration: 150
            });
        } else {
            sprite.setAttributes(sprite._to, true);
        }
    },
    
    /**
     * Un-highlight any existing highlights
     */
    unHighlight: function() {
        if (!this.highlight || !this.items) {
            return;
        }
        
        var items = this.items,
            len = items.length, sprite,
            opts = this.highlightStyles,
            animate = this.chart.animate;
        
        for(var i = 0; i < len; i++) {
            sprite = items[i].sprite;
            if(sprite && sprite._highlighted) {
                if (sprite._anim) {
                    sprite._anim.paused = true;
                }
                var obj = {};
                for(var p in opts) {
                    if (Ext.isObject(sprite._defaults[p])) {
                        obj[p] = {};
                        Ext.apply(obj[p], sprite._defaults[p]);
                    } else {
                        obj[p] = sprite._defaults[p];
                    }
                }
                if (animate) {
                    sprite._anim = new Ext.fx2.Anim({
                        target: sprite,
                        to: obj,
                        duration: 150
                    });
                } else {
                    sprite.setAttributes(obj, true);
                }
                delete sprite._highlighted;
                //delete sprite._defaults;
            }
        }
    },
    
    cleanHighlights: function() {
        if (!this.highlight) {
            return;
        }
        
        var group = this.group,
            markerGroup = this.markerGroup,
            i = 0, l;
        for (l = group.getCount(); i < l; i++) {
            delete group.getAt(i)._defaults;
        }
        if (markerGroup) {
            for (l = markerGroup.getCount(); i < l; i++) {
                delete markerGroup.getAt(i)._defaults;
            }
        }
    }
};

var Tips = {
    constructor: function(config) {
        if (config.tips) {
            this.tipConfig = Ext.apply({}, config.tips, {
                renderer: Ext.emptyFn
            });
            this.tooltip = new Ext.ToolTip(this.tipConfig);
            Ext.getBody().on('mousemove', this.tooltip.onMouseMove, this.tooltip);
        }
    },
    
    showTip: function(item) {
        if (!this.tooltip) {
            return;
        }
        var tooltip = this.tooltip,
            tipConfig = this.tipConfig;
        if (!tooltip.trackMouse) {
            var sprite = item.sprite,
                surface = sprite.surface,
                surfaceExt = Ext.get(surface.getId()),
                pos = surfaceExt.getXY(),
                x = pos[0] + (sprite.attr.x || 0) + (sprite.translation && sprite.translation.x || 0),
                y = pos[1] + (sprite.attr.y || 0) + (sprite.translation && sprite.translation.y || 0);
            tooltip.targetXY = [x, y];
        }
        tipConfig.renderer.call(tooltip, item.storeItem, item);
        tooltip.show();
    },
    
    hideTip: function(item) {
        var tooltip = this.tooltip;
        if (!tooltip) {
            return;
        }
        tooltip.hide();
    }
};

var Callouts = {
    constructor: function(config) {
        if (config.callouts) {
            this.callouts = Ext.apply(this.callouts || {}, config.callouts, {
                styles: {
                    color: "#000",
                    //fill: '#fff',
                    //stroke: '#000',
                    font: "11px Helvetica, sans-serif"
                    //lineWidth: 3
                }
            });
            this.calloutsArray = [];
        }
    },
    
    renderCallouts: function() {
        if (!this.callouts) {
            return;
        }
        
        var items = this.items,
            animate = this.chart.animate,
            config = this.callouts,
            styles = config.styles,
            group = this.calloutsArray,
            store = this.chart.store,
            len = store.getCount(),
            ratio = items.length / len,
            previouslyPlacedCallouts = [],
            i, count, j, p;
        
        for (i = 0, count = 0; i < len; i++) {
            for (j = 0; j < ratio; j++) {
                var item = items[count],
                    label = group[count],
                    storeItem = store.getAt(i),
                    display = config.renderer(label, storeItem);
                if (display) {
                    if (!label) {
                        group[count] = label = this.onCreateCallout(storeItem, item, i, display, j, count);
                    }
                    for (p in label) {
                        label[p].setAttributes(styles, true);
                    }
                    this.onPlaceCallout(label, storeItem, item, i, display, animate, j, count, previouslyPlacedCallouts);
                    previouslyPlacedCallouts.push(label);
                    count++;
                }
            }
        }
        this.hideCallouts(count);
    },
    
    onCreateCallout: function(storeItem, item, i, display) {
        var group = this.calloutsGroup,
            config = this.callouts,
            styles = config.styles,
            surface = this.chart.surface,
            calloutObj = {
                label: false,
                box: false,
                lines: false
            };

        calloutObj.lines = surface.add(Ext.apply({}, {
            type: 'path',
            path: 'M0,0',
            stroke: '#555'
        }, styles));
        
        calloutObj.box = surface.add(Ext.apply({}, {
            type: 'rect',
            stroke: '#555',
            fill: '#fff'
        }, styles));
        
        calloutObj.label = surface.add(Ext.apply({}, {
            type: 'text',
            text: display
        }, styles));
        
        return calloutObj;
    },
    
    hideCallouts: function(index) {
        var calloutsArray = this.calloutsArray,
            len = calloutsArray.length,
            co, p;
        while(len-- > index) {
            co = calloutsArray[len];
            for (p in co) {
                co[p].hide(true);
            }
        }
    }
};

Ext.applyIf(Ext.chart.Series.prototype, LabelMgr);
Ext.applyIf(Ext.chart.Series.prototype, HighlightMgr);
Ext.applyIf(Ext.chart.Series.prototype, Tips);
Ext.applyIf(Ext.chart.Series.prototype, Callouts);
