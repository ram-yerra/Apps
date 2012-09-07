/**
 * @class Ext.chart.Line
 * @extends Ext.chart.CartesianSeries
 * Series which displays data points connected by a line.
 * @constructor
 */
Ext.chart.LineSeries = Ext.extend(Ext.chart.CartesianSeries, {
    type: 'line',

    /**
     * @cfg {Boolean} showMarkers
     * Whether markers should be displayed at the date points along the line. If true,
     * then the {@link #markerCfg} config item will determine the markers' styling.
     */
    showMarkers: true,

    /**
     * @cfg {Object} markerCfg
     * The display style for the markers. Only used if {@link #showMarkers} is true.
     */
    markerCfg: {
        type: 'diamond',
        size: 4
    },

    /**
     * @cfg {Number} lineWidth
     * The width of the line
     */
    lineWidth: 2,

    /**
     * @cfg {String} color
     * The color of the line
     */
    color: '#000',

    /**
     * @cfg {String} dash
     * Optional dash array for the line.
     */
    dash: '',

    /**
     * @cfg {Boolean} smooth
     * If true, the line will be smoothed/rounded around its points, otherwise straight line
     * segments will be drawn. Defaults to false.
     */
    smooth: false,

    /**
     * @cfg {Boolean} fill
     * If true, the area below the line will be filled in using the {@link #fillColor} and
     * {@link #fillOpacity} config properties. Defaults to false.
     */
    fill: false,

    /**
     * @cfg {String} fillColor
     * Color of the line fill. Only used if {@link #fill} is true.
     */
    fillColor: null,

    /**
     * @cfg {Number} fillOpacity
     * Opacity of the line fill. Only used if {@link #fill} is true.
     */
    fillOpacity: 0.3,

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
    
    constructor: function(config) {
        Ext.chart.LineSeries.superclass.constructor.call(this, config);
        var surface = this.chart.surface,
            shadow = this.chart.shadow,
            i, l;
        this.group = surface.getGroup(this.seriesId);
        if (this.showMarkers) {
            this.markerGroup = surface.getGroup(this.seriesId + '-markers');
        }
        if (shadow) {
            for(i = 0, l = this.shadowAttributes.length; i < l; i++) {
                this.shadowGroups.push(surface.getGroup(this.seriesId + '-shadows' + i));
            }
        }
    },

    shrink: function(values, dim) {
        var k = values.length / dim,
            j = 0,
            l = k,
            sum = 0,
            res = [];
        while (j < values.length) {
            l--;
            if (l < 0) {
                sum += values[j] * (1 + l);
                res.push(sum / k);
                sum = values[j++] * -l;
                l += k;
            } else {
                sum += values[j++];
            }
        }
        return res;
    },

    drawSeries: function() {
        var that = this,
            chart = this.chart,
            store = chart.store,
            surface = chart.surface,
            chartBBox = chart.chartBBox,
            bbox = {},
            group = this.group,
            gutterX = chart.maxGutter[0],
            gutterY = chart.maxGutter[1],
            showMarkers = this.showMarkers,
            markerGroup = this.markerGroup,
            enableShadows = chart.shadow,
            shadowGroups = this.shadowGroups,
            shadowGroup,
            shadowAttributes = this.shadowAttributes,
            shadowBarAttr,
            shadows,
            shadow,
            shindex,
            lnsh = shadowGroups.length,
            dummyPath = ["M"],
            path = ["M"],
            fill,
            fillPath,
            rendererAttributes,
            x,
            y,
            firstY,
            markerCount,
            i, j,
            ln,
            axis,
            ends,
            marker,
            item,
            xValue,
            yValue,
            xValues = [],
            yValues = [],
            xScale,
            yScale,
            minX,
            maxX,
            minY,
            maxY,
            line, animation;

        this.unHighlight();
        this.cleanHighlights();
        //get box dimensions
        this.bbox = bbox;
        bbox.x = chartBBox.x + gutterX;
        bbox.y = chartBBox.y + gutterY;
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

        if (isNaN(minX)) {
            minX = 0;
            xScale = bbox.width / (store.getCount() - 1);
        }
        else {
            xScale = bbox.width / (maxX - minX);
        }

        if (isNaN(minY)) {
            minY = 0;
            yScale = bbox.height / (store.getCount() - 1);
        } 
        else {
            yScale = bbox.height / (maxY - minY);
        }

        store.each(function(record, i) {
            xValue = record.get(this.xField);
            yValue = record.get(this.yField);
            // Ensure a value
            if (typeof xValue == 'string') {
                xValue = i;
            }
            if (typeof yValue == 'string') {
                yValue = i;
            }
            xValues.push(xValue);
            yValues.push(yValue);
        }, this);

        ln = xValues.length;
        if (ln > bbox.width) {
            xValues = this.shrink(xValues, bbox.width);
            yValues = this.shrink(yValues, bbox.width);
        }

        this.items = [];

        ln = xValues.length;
        for (i = 0; i < ln; i++) {
            xValue = xValues[i];
            yValue = yValues[i];
            x = bbox.x + (xValue - minX) * xScale;
            y = bbox.y + bbox.height - (yValue - minY) * yScale;
            if (!i) {
                firstY = y;
            }
            path = path.concat([x, y]);
            // If this is the first line, create a dummypath to animate in from.
            if (!this.line || chart.resizing) {
                dummyPath = dummyPath.concat([x, bbox.y + bbox.height / 2]);
            }

            // When resizing, reset before animating
            if (chart.animate && chart.resizing && this.line) {
                this.line.setAttributes({
                    path: dummyPath
                }, true);
                if (this.fillPath) {
                    this.fillPath.setAttributes({
                        path: dummyPath
                    }, true);
                }
                if(this.line.shadows) {
                    shadows = this.line.shadows;
                    for(j = 0, lnsh = shadows.length; j < lnsh; j++) {
                        shadow = shadows[j];
                        shadow.setAttributes({
                            path: dummyPath
                        }, true);
                    }
                }
            }
            if (showMarkers) {
                marker = markerGroup.getAt(i);
                if (!marker) {
                    marker = Ext.chart.Shapes[this.markerCfg.type](surface, {
                        group: [group, markerGroup],
                        x: 0, y: 0,
                        translate: {
                            x: x, y: bbox.y + bbox.height / 2
                        },
                        value: '"' + xValue + ', ' + yValue + '"',
                        fill: this.markerCfg.color || this.color,
                        radius: this.markerCfg.size
                    });
                    marker._to = {
                        translate: {
                            x: x,
                            y: y
                        }
                    };
                } else {
                    marker.setAttributes({
                        value: '"' + xValue + ', ' + yValue + '"',
                        x: 0, y: 0,
                        fill: this.markerCfg.color || this.color,
                        radius: this.markerCfg.size,
                        hidden: false
                    }, true);
                    marker._to = {
                        translate: {
                            x: x, y: y
                        }
                    };
                }
            }
            this.items.push({
                series: this,
                value: [xValue, yValue],
                point: [x, y],
                sprite: marker,
                storeItem: store.getAt(i)
            });
        }

        if (this.smooth) {
            path = Ext.draw.smooth(path);
        }

        // Only create a line if one doesn't exist.
        if (!this.line) {
            this.line = surface.add({
                group: group,
                type: 'path',
                path: dummyPath,
                "stroke-width": this.lineWidth,
                "stroke-linejoin": "round",
                "stroke-dasharray": this.dash,
                stroke: this.color
            });
            if (enableShadows) {
                //create shadows
                shadows = this.line.shadows = [];                
                for (shindex = 0; shindex < lnsh; shindex++) {
                    shadowBarAttr = shadowAttributes[shindex];
                    shadowBarAttr = Ext.apply({}, shadowBarAttr, { path: dummyPath });
                    shadow = chart.surface.add(Ext.apply({}, {
                        type: 'path',
                        group: shadowGroups[shindex]
                    }, shadowBarAttr));
                    shadows.push(shadow);
                }
            }
        }

        if (this.fill) {
            fillPath = path.concat([
                ["L", x, bbox.y + bbox.height],
                ["L", bbox.x, bbox.y + bbox.height],
                ["L", bbox.x, firstY]
            ]);
            if (!this.fillPath) {
                this.fillPath = surface.add({
                    group: group,
                    type: 'path',
                    opacity: this.fillOpacity,
                    fill: this.fillColor || this.color,
                    path: dummyPath
                });
            }
        }
        markerCount = showMarkers && markerGroup.getCount();
        if (chart.animate) {
            fill = this.fill;
            line = this.line;
            //Add renderer to line. There is not unique record associated with this.
            rendererAttributes = this.renderer(line, false, { path: path }, i, store);
            this.animation = animation = this.onAnimate(line, {
                to: rendererAttributes
            });
            //animate shadows
            if (enableShadows) {
                shadows = line.shadows;
                for(j = 0; j < lnsh; j++) {
                    this.onAnimate(shadows[j], {
                        to: { path: path }
                    });
                }
            }
            //animate fill path
            if (fill) {
                this.onAnimate(this.fillPath, {
                    to: {
                        path: fillPath
                    }
                });
            }
            //animate markers
            if (showMarkers) {
                for(i = 0; i < ln; i++) {
                    item = markerGroup.getAt(i);
                    rendererAttributes = this.renderer(item, store.getAt(i), item._to, i, store);
                    this.onAnimate(item, {
                        to: rendererAttributes
                    });
                }
                for(; i < markerCount; i++) {
                    item = markerGroup.getAt(i);
                    item.hide(true);
                }
            }
        } else {
            rendererAttributes = this.renderer(this.line, false, { path: path, hidden: false }, i, store);
            this.line.setAttributes(rendererAttributes, true);
            //set path for shadows
            if (enableShadows) {
                shadows = this.line.shadows;
                for(j = 0; j < lnsh; j++) {
                    shadows[j].setAttributes({
                        path: path
                    });
                }
            }
            if (this.fill) {
                this.fillPath.setAttributes({
                    path: fillPath
                }, true);
            }
            if (showMarkers) {
                for(i = 0; i < ln; i++) {
                    item = markerGroup.getAt(i);
                    rendererAttributes = this.renderer(item, store.getAt(i), item._to, i, store);
                    this.onAnimate(item, {
                        to: rendererAttributes
                    });
                }
                for(; i < markerCount; i++) {
                    item = markerGroup.getAt(i);
                    item.hide(true);
                }
            }
        }
        this.renderLabels();
        this.renderCallouts();
    },

    onAnimate: function(elem, opt) {
        return new Ext.fx2.Anim(Ext.apply({}, opt, {
            target: elem,
            easing: 'ease-in-out',
            duration: 500
        }));
    },
    
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
                this.animation.on('afteranimate', function() {
                    label.show(true);
                });
            } else {
                label.show(true);
            }
        }
    },
    
    onPlaceCallout : function(callout, storeItem, item, i, display, animate, index) {
        var chart = this.chart,
            surface = chart.surface,
            resizing = chart.resizing,
            config = this.callouts,
            items = this.items,
            prev = i == 0? false : items[i -1].point,
            next = (i == items.length -1)? false : items[i +1].point,
            cur = item.point,
            dir, norm, normal, a, aprev, anext,
            bbox = callout.label.getBBox(),
            offsetFromViz = 30,
            offsetToSide = 10,
            offsetBox = 3,
            boxx, boxy, boxw, boxh,
            p, clipRect = this.clipRect,
            x, y;

        //get the right two points
        if (!prev) {
            prev = cur;
        }
        if (!next) {
            next = cur;
        }
        a = (next[1] - prev[1]) / (next[0] - prev[0]);
        aprev = (cur[1] - prev[1]) / (cur[0] - prev[0]);
        anext = (next[1] - cur[1]) / (next[0] - cur[0]);
        
        norm = Math.sqrt(1 + a * a);
        dir = [1 / norm, a / norm];
        normal = [-dir[1], dir[0]];
        
        //keep the label always on the outer part of the "elbow"
        if (aprev > 0 && anext < 0 && normal[1] < 0 || aprev < 0 && anext > 0 && normal[1] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        } else if (Math.abs(aprev) < Math.abs(anext) && normal[0] < 0 || Math.abs(aprev) > Math.abs(anext) && normal[0] > 0) {
            normal[0] *= -1;
            normal[1] *= -1;
        }

        //position
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
    
    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     *
     * For Line series, this snaps to the nearest vertex if the target point is within a
     * certain vertical distance from the line.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Object}
     */
    getItemForPoint: function(x, y) {
        var items = this.items,
            prevItem,
            nextItem,
            prevPoint,
            nextPoint,
            tolerance = 20,
            i,
            ln,
            x1,
            y1,
            x2,
            y2,
            yIntersect,
            result = null;

        if (items && items.length) {
            // Find coordinates for the vertices before and after the target point
            for (i = 0, ln = items.length; i < ln; i++) {
                if (items[i].point[0] >= x) {
                    nextItem = items[i];
                    prevItem = i && items[i - 1];
                    break;
                }
            }
            if (i >= ln) {
                prevItem = items[ln - 1];
            }

            prevPoint = prevItem && prevItem.point;
            nextPoint = nextItem && nextItem.point;
            x1 = prevItem ? prevPoint[0] : nextPoint[0] - tolerance;
            y1 = prevItem ? prevPoint[1] : nextPoint[1];
            x2 = nextItem ? nextPoint[0] : prevPoint[0] + tolerance;
            y2 = nextItem ? nextPoint[1] : prevPoint[1];

            // Determine whether the point is within the vertical tolerance distance from a straight
            // line between the two vertices (TODO make this accurate for curved lines)
            if (x >= x1 && x <= x2) {
                yIntersect = (y2 - y1) / (x2 - x1) * (x - x1) + y1;
                if (Math.abs(yIntersect - y) <= tolerance) {
                    result = (x2 - x < x - x1) ? nextItem : prevItem;
                }
            }
        }
        return result;
    }
});