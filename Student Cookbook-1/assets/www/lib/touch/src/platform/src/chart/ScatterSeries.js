/**
 * @class Ext.chart.Scatter
 * @extends Object
 */
Ext.chart.ScatterSeries = Ext.extend(Ext.chart.CartesianSeries, {
    type: 'scatter',

    /**
     * @cfg {Object} markerCfg
     * The display style for the scatter series markers.
     */
    markerCfg: {
        type: 'diamond',
        size: 4
    },

    /**
     * @cfg {String} color
     * Color for the series markers. Only used if markerCfg.color is not specified.
     */
    color: '#000',


    /**
     * @cfg {Object} highlightStyles
     * An object that contains styles for series elements when hovering.
     */
    highlightStyles: {
        fill: '#fdd',
        radius: 20,
        lineWidth: 5,
        stroke: '#f55'
    },

    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */
    shadowAttributes: [{
        "stroke-width": 6,
        "stroke-opacity": 0.05,
        stroke: 'rgb(0, 0, 0)'
    }, {
        "stroke-width": 4,
        "stroke-opacity": 0.1,
        stroke: 'rgb(0, 0, 0)'
    }, {
        "stroke-width": 2,
        "stroke-opacity": 0.15,
        stroke: 'rgb(0, 0, 0)'
    }],
    
    constructor: function(config) {
        Ext.chart.ScatterSeries.superclass.constructor.call(this, config);
        var shadow = this.chart.shadow,
            surface = this.chart.surface, i, l;
        this.group = surface.getGroup(this.seriesId);
        if (shadow) {
            for(i = 0, l = this.shadowAttributes.length; i < l; i++) {
                this.shadowGroups.push(surface.getGroup(this.seriesId + '-shadows' + i));
            }
        }
    },


    drawSeries: function() {
        var chart = this.chart,
            store = chart.store,
            surface = chart.surface,
            chartBBox = chart.chartBBox,
            bbox = {},
            group = this.group,
            animationOptions = null,
            gutterX = chart.maxGutter[0],
            gutterY = chart.maxGutter[1],
            enableShadows = chart.shadow,
            shadowGroups = this.shadowGroups,
            shadowGroup,
            shadowAttribute,
            shadowAttributes = this.shadowAttributes,
            shadows,
            shadow,
            baseAttrs,
            shindex,
            lnsh = shadowGroups.length,
            rendererAttributes,
            attrs = [],
            attr,
            sprite,
            ln,
            i,
            axis,
            ends,
            marker,
            xScale,
            yScale,
            minX = 0,
            maxX,
            minY = 0,
            maxY;

        this.unHighlight();
        this.cleanHighlights();

        this.bbox = bbox;
        bbox.x = chartBBox.x + gutterX;
        bbox.y = chartBBox.y = gutterY;
        bbox.width = chartBBox.width - (gutterX * 2);
        bbox.height = chartBBox.height - (gutterY * 2);

        this.clipRect = [bbox.x, bbox.y, bbox.width, bbox.height];
        if (this.axis) {
            axis = chart.axes.get(this.axis);
            if (axis.position == 'top' || axis.position == 'bottom') {
                minX = axis.from;
                maxX = axis.to;
            }
            else {
                minY = axis.from;
                maxY = axis.to;
            }
        }
        else {
            if (this.xField) {   
                ends = new Ext.chart.Axis({
                    chart: chart,
                    fields: [this.xField]
                }).calcEnds();
                minX = ends.from;
                maxX = ends.to;
            }
            if (this.yField) {
                ends = new Ext.chart.Axis({
                    chart: chart,
                    fields: [this.yField]
                }).calcEnds();
                minY = ends.from;
                maxY = ends.to;
            }
        }
        xScale = bbox.width / (maxX - minX);
        yScale = bbox.height / (maxY - minY);

        this.items = [];

        store.each(function(record, i) {
            var xValue = record.get(this.xField),
                yValue = record.get(this.yField),
                x,
                y;

            // Ensure a value
            if (typeof xValue == 'string') {
                xValue = i;
                minX = 0;
                xScale = bbox.width / (store.getCount() - 1);
            }
            if (typeof yValue == 'string') {
                yValue = i;
                minY = 0;
                yScale = bbox.height / (store.getCount() - 1);
            }
            x = bbox.x + (xValue - minX) * xScale;
            y = bbox.y + bbox.height - (yValue - minY) * yScale;
            attrs.push({
                x: x,
                y: y
            });

            this.items.push({
                series: this,
                value: [xValue, yValue],
                point: [x, y],
                storeItem: record
            });
            
            // When resizing, reset before animating
            if (chart.animate && chart.resizing) {
                sprite = group.getAt(i);
                if (sprite) {
                    sprite.setAttributes({
                        translate: {
                            x: (bbox.x + bbox.width) / 2,
                            y: (bbox.y + bbox.height) / 2
                        }
                    }, true);
                    if (enableShadows) {
                        shadows = sprite.shadows;
                        for (shindex = 0; shindex < lnsh; shindex++) {
                            shadowAttribute = Ext.apply({}, shadowAttributes[shindex]);
                            if (shadowAttribute.translate) {
                                shadowAttribute.translate = Ext.apply({}, shadowAttribute.translate || {});
                                shadowAttribute.translate.x += (bbox.x + bbox.width) / 2;
                                shadowAttribute.translate.y += (bbox.y + bbox.height) / 2;
                            } else {
                                Ext.apply(shadowAttribute, {
                                    translate: {
                                        x: (bbox.x + bbox.width) / 2,
                                        y: (bbox.y + bbox.height) / 2
                                    }
                                });
                            }
                            shadows[shindex].setAttributes(shadowAttribute, true);
                        }
                    }
                }
            }
        }, this);

        // Create new or reuse bar sprites and animate/display
        ln = attrs.length;
        for (i = 0; i < ln; i++) {
            attr = attrs[i];
            sprite = group.getAt(i);
            // Create a new sprite if needed (no height)
            if (!sprite) {
                sprite = Ext.chart.Shapes[this.markerCfg.type](chart.surface, Ext.apply({}, {
                    x: 0, y: 0,
                    translate: {
                        x: (bbox.x + bbox.width) / 2,
                        y: (bbox.y + bbox.height) / 2
                    },
                    group: group,
                    fill: this.markerCfg.color || this.color,
                    radius: this.markerCfg.size
                }, attr));
                
                if (enableShadows) {
                    sprite.shadows = shadows = [];
                    for (shindex = 0; shindex < lnsh; shindex++) {
                        shadowAttribute = Ext.apply({}, shadowAttributes[shindex]);
                        if (shadowAttribute.translate) {
                            shadowAttribute.translate = Ext.apply({}, shadowAttribute.translate);
                            shadowAttribute.translate.x += (bbox.x + bbox.width) / 2;
                            shadowAttribute.translate.y += (bbox.y + bbox.height) / 2;
                        } else {
                            Ext.apply(shadowAttribute, {
                                translate: {
                                    x: (bbox.x + bbox.width) / 2,
                                    y: (bbox.y + bbox.height) / 2
                                }
                            });
                        }
                        shadow = Ext.chart.Shapes[this.markerCfg.type](chart.surface, Ext.apply({}, {
                            x: 0, y: 0,
                            group: shadowGroups[shindex],
                            fill: this.markerCfg.color || this.color,
                            radius: this.markerCfg.size
                        }, shadowAttribute));
                        shadows.push(shadow);
                    }
                }
            }
            shadows = sprite.shadows;
            if (chart.animate) {
                rendererAttributes = this.renderer(sprite, store.getAt(i), 
                                            { translate: attr }, i, store);
                this.animation = this.onAnimate(sprite, {
                    to: rendererAttributes
                });
                //animate shadows
                for (shindex = 0; shindex < lnsh; shindex++) {
                    shadowAttribute = Ext.apply({}, shadowAttributes[shindex]);
                    rendererAttributes = this.renderer(shadows[shindex], store.getAt(i), Ext.apply({}, { 
                        translate: {
                            x: attr.x + (shadowAttribute.translate? shadowAttribute.translate.x : 0),
                            y: attr.y + (shadowAttribute.translate? shadowAttribute.translate.y : 0)
                        } 
                    }, shadowAttribute), i, store);
                    this.onAnimate(shadows[shindex], { to: rendererAttributes });
                }
            } else {
                rendererAttributes = this.renderer(sprite, store.getAt(i), 
                            Ext.apply({ translate: attr }, { hidden: false }), i, store);
                sprite.setAttributes(rendererAttributes, true);
                //update shadows
                for (shindex = 0; shindex < lnsh; shindex++) {
                    shadowAttribute = shadowAttributes[shindex];
                    rendererAttributes = this.renderer(shadows[shindex], store.getAt(i), Ext.apply({ 
                        x: attr.x,
                        y: attr.y
                    }, shadowAttribute), i, store);
                    shadows[shindex].setAttributes(rendererAttributes, true);
                }
            }
            this.items[i].sprite = sprite;
        }
        // Hide unused sprites
        ln = group.getCount();
        for (i = attrs.length; i < ln; i++) {
            group.getAt(i).hide(true);
        }
        this.renderLabels();
        this.renderCallouts();
    },
    
    //TODO(nico): refactor these methods with the LineSeries methods.
    onCreateLabel: function(storeItem, item, i, display) {
        var group = this.labelsGroup,
            config = this.label,
            fill = config.color,
            font = config.font,
            bbox = this.bbox;
        
        return this.chart.surface.add(Ext.apply({}, {
            'type': 'text',
            'text-anchor': 'middle',
            'group': group,
            'fill': fill,
            'font': font,
            'x': item.point[0],
            'y': bbox.y + bbox.height / 2
        }));
    },
    
    onPlaceLabel: function(label, storeItem, item, i, display, animate) {
        var chart = this.chart,
            resizing = chart.resizing,
            config = this.label,
            format = config.renderer,
            field = config.field,
            bbox = this.bbox,
            x = item.point[0],
            y = item.point[1],
            radius = item.sprite.attr.radius,
            bb, width, height;
        
        label.setAttributes({
            text: format(storeItem.get(field)),
            hidden: true
        }, true);
        
        if (display == 'rotate') {
            label.setAttributes({
                'text-anchor': 'start',
                'rotation': {
                    x: x,
                    y: y,
                    degrees: -45
                }
            }, true);
            //correct label position to fit into the box
            bb = label.getBBox();
            width = bb.width;
            height = bb.height;
            x = x < bbox.x? bbox.x : x;
            x = (x + width > bbox.x + bbox.width)? (x - (x + width - bbox.x - bbox.width)) : x;
            y = (y - height < bbox.y)? bbox.y + height : y;
        
        } else if (display == 'under' || display == 'over') {
            //TODO(nicolas): find out why width/height values in circle bounding boxes are undefined.
            bb = item.sprite.getBBox();
            bb.width = bb.width || (radius * 2);
            bb.height = bb.height || (radius * 2);
            y = y + (display == 'over'? -bb.height : bb.height);
            //correct label position to fit into the box
            bb = label.getBBox();
            width = bb.width/2;
            height = bb.height/2;
            x = x - width < bbox.x? bbox.x + width : x;
            x = (x + width > bbox.x + bbox.width) ? (x - (x + width - bbox.x - bbox.width)) : x;
            y = y - height < bbox.y? bbox.y + height : y;
            y = (y + height > bbox.y + bbox.height) ? (y - (y + height - bbox.y - bbox.height)) : y;
        }
        
        if (this.chart.animate && !this.chart.resizing) {
            label.show(true);
            this.onAnimate(label, {
                to: {
                    x: x,
                    y: y
                }
            });
        } else {
            label.setAttributes({
                x: x,
                y: y
            }, true);
            if (resizing) {
                if (this.animation) {
                    this.animation.on('afteranimate', function() {
                        label.show(true);
                    });   
                } else {
                    label.show(true);
                }
            } else {
                label.show(true);
            }
        }
    },
    
    onPlaceCallout: function(callout, storeItem, item, i, display, animate, index) {
        var chart = this.chart,
            surface = chart.surface,
            resizing = chart.resizing,
            config = this.callouts,
            items = this.items,
            cur = item.point,
            normal,
            bbox = callout.label.getBBox(),
            offsetFromViz = 30,
            offsetToSide = 10,
            offsetBox = 3,
            boxx, boxy, boxw, boxh,
            p, clipRect = this.clipRect,
            x, y;
    
        //position
        normal = [Math.cos(Math.PI /4), -Math.sin(Math.PI /4)];
        x = cur[0] + normal[0] * offsetFromViz;
        y = cur[1] + normal[1] * offsetFromViz;
        
        //box position and dimensions
        boxx = x + (normal[0] > 0? 0 : -(bbox.width + 2 * offsetBox));
        boxy = y - bbox.height /2 - offsetBox;
        boxw = bbox.width + 2 * offsetBox;
        boxh = bbox.height + 2 * offsetBox;
        
        //now check if we're out of bounds and invert the normal vector correspondingly
        //this may add new overlaps between labels (but labels won't be out of bounds).
        if (boxx < clipRect[0] || (boxx + boxw) > (clipRect[0] + clipRect[2])) {
            normal[0] *= -1;
        }
        if (boxy < clipRect[1] || (boxy + boxh) > (clipRect[1] + clipRect[3])) {
            normal[1] *= -1;
        }
    
        //update positions
        x = cur[0] + normal[0] * offsetFromViz;
        y = cur[1] + normal[1] * offsetFromViz;
        
        //update box position and dimensions
        boxx = x + (normal[0] > 0? 0 : -(bbox.width + 2 * offsetBox));
        boxy = y - bbox.height /2 - offsetBox;
        boxw = bbox.width + 2 * offsetBox;
        boxh = bbox.height + 2 * offsetBox;
        
        //set the line from the middle of the pie to the box.
        callout.lines.setAttributes({
            path: ["M", cur[0], cur[1], "L", x, y, "Z"]
        }, true);
        //set box position
        callout.box.setAttributes({
            x: boxx,
            y: boxy,
            width: boxw,
            height: boxh
        }, true);
        //set text position
        callout.label.setAttributes({
            x: x + (normal[0] > 0? offsetBox : -(bbox.width + offsetBox)),
            y: y
        }, true);
        for (p in callout) {
            callout[p].show(true);
        }
    },

    onAnimate: function(sprite, attr) {
        sprite.show();
        return new Ext.fx2.Anim(Ext.apply({}, {
            target: sprite,
            easing: 'ease-in-out',
            duration: 1500
        }, attr));
    },

    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     *
     * For Scatter series, this is the closest marker to the point within a tolerance radius.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Object}
     */
    getItemForPoint: function(x, y) {
        var items = this.items,
            point,
            closestItem = null,
            tolerance = 10,
            i = items && items.length;

        function dist(point) {
            var abs = Math.abs,
                dx = abs(point[0] - x),
                dy = abs(point[1] - x);
            return Math.sqrt(dx * dx + dy * dy);
        }

        while (i--) {
            point = items[i].point;
            if (point[0] - tolerance <= x && point[0] + tolerance >= x &&
                point[1] - tolerance <= y && point[1] + tolerance >= y) {
                if (!closestItem || (dist(point) < dist(closestItem.point))) {
                    closestItem = items[i];
                }
            }
            // If we already found a match but no longer match, assume we're moving further
            // away and exit the loop
            else if (closestItem) {
                break;
            }
        }

        return closestItem;
    }
});

