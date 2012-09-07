/**
 * @class Ext.chart.Legend
 * Defines a legend for a chart's series.
 * The 'chart' member must be set prior to rendering.
 * @constructor
 */
Ext.chart.Legend = Ext.extend(Object, {

    /**
     * @cfg {Boolean} visible
     * Whether or not the legend should be displayed.
     */
    visible: true,

    /**
     * @cfg {String} position
     * The position of the legend in relation to the chart. One of: "top",
     * "bottom", "left", "right", or "float". If set to "float", then the legend
     * box will be positioned at the point denoted by the x and y parameters.
     */
    position: 'bottom',

    /**
     * @cfg {Number} x
     * X-position of the legend box. Used directly if position is set to "float", otherwise 
     * it will be calculated dynamically.
     */
    x: 0,

    /**
     * @cfg {Number} y
     * Y-position of the legend box. Used directly if position is set to "float", otherwise
     * it will be calculated dynamically.
     */
    y: 0,

    /**
     * @cfg {String} labelFont
     * Font to be used for the legend labels.
     */
    labelFont: '12px Helvetica, sans-serif',

    /**
     * @cfg {String} boxStroke
     * Style of the stroke for the legend box
     */
    boxStroke: '#000',

    /**
     * @cfg {String} boxStrokeWidth
     * Width of the stroke for the legend box
     */
    boxStrokeWidth: 1,

    /**
     * @cfg {String} boxFill
     * Fill style for the legend box
     */
    boxFill: '#FFF',

    /**
     * @cfg {Number} itemSpacing
     * Amount of space between legend items
     */
    itemSpacing: 10,

    /**
     * @cfg {Number} padding
     * Amount of padding between the legend box's border and its items
     */
    padding: 6,


    // private
    width: 0,
    height: 0,
    boxZIndex: 100,


    constructor: function(config) {
        if (config) {
            Ext.apply(this, config);
        }

        this.items = [];

        /**
         * Whether the legend box is oriented vertically, i.e. if it is on the left or right side or floating.
         * @type {Boolean}
         */
        this.isVertical = ("left|right|float".indexOf(this.position) !== -1);
    },


    /**
     * Create all the sprites for the legend
     */
    create: function() {
        if (!this.created && this.isDisplayed()) {
            this.createItems();
            this.createBox();
            this.created = true;
        }
    },


    /**
     * Determine whether the legend should be displayed. Looks at the legend's 'visible' config,
     * and also the 'showInLegend' config for each of the series.
     */
    isDisplayed: function() {
        return this.visible && this.chart.series.findIndex('showInLegend', true) !== -1;
    },


    /**
     * Create the series markers and labels
     */
    createItems: function() {
        var chart = this.chart,
            floor = Math.floor,
            ceil = Math.ceil,
            x,
            y,
            padding = this.padding,
            maxWidth = 0,
            maxHeight = 0,
            totalWidth = 0,
            totalHeight = 0,
            vertical = this.isVertical;

        // Create all the item labels, collecting their dimensions and positioning each one
        // properly in relation to the previous item
        chart.series.each(function(series, i) {
            if (series.showInLegend) {
                Ext.each([].concat(series.yField), function(field, j) {
                    var item = new Ext.chart.Legend.Item({
                            legend: this,
                            series: series,
                            surface: chart.surface,
                            yFieldIndex: j
                        }),
                        itemSpacing = (i + j === 0 ? 0 : this.itemSpacing),
                        bbox = item.getBBox(),
                        width = ceil(bbox.width + bbox.x), //always measure from x=0, since not all markers go all the way to the left
                        height = ceil(bbox.height);
                    // Set the item's position relative to the legend box
                    item.x = floor(vertical ? padding : totalWidth + itemSpacing + padding);
                    item.y = floor((vertical ? totalHeight + itemSpacing + padding : padding) + height / 2);

                    // Collect cumulative dimensions
                    totalWidth += width + itemSpacing;
                    totalHeight += height + itemSpacing;
                    maxWidth = Math.max(maxWidth, width);
                    maxHeight = Math.max(maxHeight, height);

                    this.items.push(item);
                }, this);
            }
        }, this);

        // Store the collected dimensions for later
        this.width = (vertical ? maxWidth : totalWidth) + padding * 2;
        this.height = (vertical ? totalHeight : maxHeight) + padding * 2;
        this.itemHeight = maxHeight;
    },


    /**
     * Get the bounds for the legend's outer box
     */
    getBBox: function() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    },


    /**
     * Create the box around the legend items
     */
    createBox: function() {
        var box = this.boxSprite = this.chart.surface.add(Ext.apply({
            type: 'rect',
            stroke: this.boxStroke,
            "stroke-width": this.boxStrokeWidth,
            fill: this.boxFill,
            zIndex: this.boxZIndex
        }, this.getBBox()));
        box.redraw();
    },


    /**
     * Update the position of all the legend's sprites to match its current x/y values
     */
    updatePosition: function() {
        if (this.isDisplayed()) {
            var x, y,
                legendWidth = this.width,
                legendHeight = this.height,
                padding = this.padding,
                chart = this.chart,
                zoom = chart.zoom,
                chartBBox = chart.chartBBox,
                chartWidth = chartBBox.width,
                chartHeight = chartBBox.height,
                surface = chart.surface,
                floor = Math.floor;

            // Find the position based on the dimensions
            switch(this.position) {
                case "left":
                    x = 0.5;
                    y = floor(chartBBox.y + chartHeight / 2 - legendHeight / 2) + 0.5;
                    break;
                case "right":
                    x = floor(surface.width - legendWidth) - 0.5;
                    y = floor(chartBBox.y + chartHeight / 2 - legendHeight / 2) + 0.5;
                    break;
                case "top":
                    x = floor(chartBBox.x + chartWidth / 2 - legendWidth / 2) + 0.5;
                    y = 0.5;
                    break;
                case "bottom":
                    x = floor(chartBBox.x + chartWidth / 2 - legendWidth / 2) + 0.5;
                    y = floor(surface.height - legendHeight) - 0.5;
                    break;
                default:
                    x = floor(this.x) + 0.5;
                    y = floor(this.y) + 0.5;
            }
            this.x = x;
            this.y = y;

            // Update the position of each item
            Ext.each(this.items, function(item) {
                item.updatePosition();
            });
            // Update the position of the outer box
            this.boxSprite.setAttributes(this.getBBox(), true);
        }
    }

});


/**
 * @class Ext.chart.Legend.Item
 * @extends Ext.draw.SpriteGroup
 * A single item of a legend (marker plus label)
 * @constructor
 */
Ext.chart.Legend.Item = Ext.extend(Ext.draw.SpriteGroup, {

    // Position of the item, relative to the upper-left corner of the legend box
    x: 0,
    y: 0,
    zIndex: 101,

    constructor: function(config) {
        Ext.chart.Legend.Item.superclass.constructor.call(this, config);
        this.createSprites();
    },


    /**
     * Create all the individual sprites for this legend item
     */
    createSprites: function() {
        var series = this.series,
            seriesType = series.type,
            idx = this.yFieldIndex,
            legend = this.legend,
            surface = this.surface,
            refX = legend.x + this.x,
            refY = legend.y + this.y,
            z = this.zIndex,
            markerCfg,
            radius;

        function getSeriesProp(name) {
            var val = series[name];
            return (Ext.isArray(val) ? val[idx] : val);
        }

        this.add('label', surface.add({
            type: 'text',
            x: 20,
            y: 0,
            zIndex: z,
            font: legend.labelFont,
            text: getSeriesProp('displayName') || getSeriesProp('yField')
        }));

        // Line series - display as short line with optional marker in the middle
        if (seriesType === 'line' || seriesType === 'scatter') {
            if(seriesType === 'line') {
                this.add('line', surface.add({
                    type: 'path',
                    path: 'M0.5,0.5L16.5,0.5',
                    zIndex: z,
                    "stroke-width": series.lineWidth,
                    "stroke-linejoin": "round",
                    "stroke-dasharray": series.dash,
                    stroke: series.color
                }));
            }
            if (series.showMarkers || seriesType === 'scatter') {
                markerCfg = series.markerCfg;
                radius = markerCfg.size;
                this.add('marker', Ext.chart.Shapes[markerCfg.type](surface, {
                    fill: markerCfg.color || series.color,
                    x: 8.5,
                    y: 0.5,
                    zIndex: z,
                    radius: radius
                }));
            }
        }
        // All other series types - display as filled box
        else {
            this.add('box', surface.add({
                type: 'rect',
                zIndex: z,
                x: 0.5,
                y: 0.5,
                width: 12,
                height: 12,
                fill: getSeriesProp('color')
            }));
        }

        this.updatePosition({x:0, y:0}); //Relative to 0,0 at first so that the bbox is calculated correctly
    },


    /**
     * Update the positions of all this item's sprites to match the root position
     * of the legend box.
     * @param {Object} relativeTo (optional) If specified, this object's 'x' and 'y' values will be used
     *                 as the reference point for the relative positioning. Defaults to the Legend.
     */
    updatePosition: function(relativeTo) {
        if(!relativeTo) {
            relativeTo = this.legend;
        }
        for (var i = 0, its = this.items, it, l = its.length; i < l; i++) {
            it = its[i];
            //TODO(nico) setting x, y values to a path
            //has no meaning because it's set as absolute
            //(i.e M) should we be using m instead?
            switch (it.type) {
                case 'text':
                    it.setAttributes({
                        x: 20 + relativeTo.x + this.x,
                        y: relativeTo.y + this.y
                    }, true);
                    break;
                case 'rect':
                    it.setAttributes({
                        translate: {
                            x: relativeTo.x + this.x,
                            y: relativeTo.y + this.y - 6
                        }
                    }, true);
                    break;
                default:
                    it.setAttributes({
                        translate: {
                            x: relativeTo.x + this.x,
                            y: relativeTo.y + this.y
                        }
                    }, true);
            }
        }
    }
});
