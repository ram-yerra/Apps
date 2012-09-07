/**
 * @class Ext.chart.PieSeries
 * @extends Ext.chart.Series
 * PieSeries class for the charts widget.
 * @constructor
 */
Ext.chart.PieSeries = Ext.extend(Ext.chart.Series, {
    type: "pie",
    rad: Math.PI / 180,

    /**
     * @cfg {String} angleField
     * The store record field name to be used for the pie angles.
     * The values bound to this parameter must be positive real numbers.
     * This parameter is required.
     */
    angleField: false,

    /**
     * @cfg {String}
     * The store record field name to be used for the pie slice lengths.
     * The values must be positive real numbers.
     * This parameter is optional.
     */
    lengthField: false,
    
    /**
     * @cfg {Boolean|Number}
     * Whether to set the pie chart as donut chart.
     * Default's false. Can be set to a particular percentage to set the radius
     * of the donut chart.
     */
    donut: false,

    showInLegend: false,
    
    /**
     * @cfg {Object} highlightStyles
     * An object that contains styles for series elements when hovering.
     */
    
    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */
    
    /**
     * @cfg {Array} colorSet
     * An array of color values which will be used, in order, as the pie slice fill colors.
     */

    constructor: function(config) {
        Ext.chart.PieSeries.superclass.constructor.call(this, config);
        Ext.apply(this, config, {
            highlightStyles: {
                //opacity: 0.5,
                segment: {
                    margin: 20
                    /* rho: 130 */
                }
            },
            shadowAttributes: [{
                "stroke-width": 6,
                "stroke-opacity": 1,
                stroke: 'rgb(200, 200, 200)',
                translate: {
                    x: 1.2,
                    y: 2
                }
            }, {
                "stroke-width": 4,
                "stroke-opacity": 1,
                stroke: 'rgb(150, 150, 150)',
                translate: {
                    x: 0.9,
                    y: 1.5
                }
            }, {
                "stroke-width": 2,
                "stroke-opacity": 1,
                stroke: 'rgb(100, 100, 100)',
                translate: {
                    x: 0.6,
                    y: 1
                }
            }],
            colorSet: [
                "#354242",
                "#acebab",
                "#ffff9d",
                "#c9de55",
                "#7d9100"
            ]
        });
        var surface = this.chart.surface,
            pie = this,
            shadow = this.chart.shadow,
            i, l;
        this.group = surface.getGroup(this.seriesId);
        if (shadow) {
            for(i = 0, l = this.shadowAttributes.length; i < l; i++) {
                this.shadowGroups.push(surface.getGroup(this.seriesId + '-shadows' + i));
            }
        }
        surface.customAttributes.segment = function (opt) {
            return pie.getSegment(opt);
        };
    },
    
    spin: function(deg, ms) {
        ms = Math.max(ms, 0);
        this.firstAngle += deg;
        var firstAngle = this.firstAngle,
            i = 0,
            len = this.items.length,
            item,
            sangle,
            eangle;
        for (; i < len; i++) {
            item = this.items[i];
            sangle = item.startAngle + deg;
            eangle = item.endAngle + deg;
            if (sangle < 0 && eangle < 0) {
                sangle += 360;
                eangle += 360;
            }
            if (sangle > firstAngle || eangle > firstAngle || sangle > 360 || eangle > 360) {
                sangle -= 360;
                eangle -= 360;
            }
            if (ms) {
                (function(item, sangle, eangle) {
                    new Ext.fx2.Anim({
                        target: item.sprite,
                        easing: "ease-in-out",
                        to: {
                            segment: {
                                startAngle: item.startAngle + deg,
                                endAngle: item.endAngle + deg,
                                margin: 0,
                                rho: item.rho
                            }
                        },
                        duration: ms,
                        listeners: {
                            afteranimate: function() {
                                item.startAngle = sangle;
                                item.endAngle = eangle;
                                item.sprite.setAttributes({
                                    segment: {
                                        startAngle: sangle,
                                        endAngle: eangle,
                                        margin: 0,
                                        rho: item.rho
                                    }
                                }, true);
                            }
                        }
                    });
                    item.startAngle += deg;
                    item.endAngle += deg;
                })(item, sangle, eangle);
            } else {
                item.startAngle = sangle;
                item.endAngle = eangle;
                item.sprite.setAttributes({
                    segment: {
                        startAngle: sangle,
                        endAngle: eangle,
                        margin: 0,
                        rho: item.rho
                    }
                }, true);
            }
        }
    },

    getSegment: function(opt) {
        var rad = this.rad,
            cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            x = this.centerX,
            y = this.centerY,
            x1 = x2 = x3 = x4 = 0,
            y1 = y2 = y3 = y4 = 0,
            delta = 1e-2,
            r = opt.endRho - opt.startRho,
            startAngle = opt.startAngle,
            endAngle = opt.endAngle,
            midAngle = (startAngle + endAngle) /2 * rad,
            margin = opt.margin || 0,
            flag = abs(endAngle - startAngle) > 180,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            singleSlice = false;
        
        x += margin * cos(midAngle);
        y += margin * sin(midAngle);
        
        x1 = x + opt.startRho * cos(a1);
        y1 = y + opt.startRho * sin(a1);
        
        x2 = x + opt.endRho * cos(a1);
        y2 = y + opt.endRho * sin(a1);
        
        x3 = x + opt.startRho * cos(a2);
        y3 = y + opt.startRho * sin(a2);
        
        x4 = x + opt.endRho * cos(a2);
        y4 = y + opt.endRho * sin(a2);
        
        if (abs(x1 - x3) <= delta && abs(y1 - y3) <= delta) {
            singleSlice = true;
        }
        //Solves mysterious clipping bug with IE
        if (singleSlice) {
            return {
                path: [
                   ["M", x1, y1],
                   ["L", x2, y2],
                   ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                   ["Z"]]
            };
        } else {
            return {
                path: [
                   ["M", x1, y1],
                   ["L", x2, y2],
                   ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                   ["L", x3, y3],
                   ["A", opt.startRho, opt.startRho, 0, +flag, 0, x1, y1],
                   ["Z"]]
            };
        }
    },

    calcMiddle: function(item) {
        var rad = this.rad,
            slice = item.slice,
            x = this.centerX,
            y = this.centerY,
            startAngle = slice.startAngle,
            endAngle = slice.endAngle,
            radius = Math.max(('rho' in slice)? slice.rho : this.radius, this.label.minMargin),
            donut = +this.donut,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            midAngle = -(a1 + (a2 - a1) / 2),
            xm = x + (item.endRho + item.startRho) / 2 * Math.cos(midAngle),
            ym = y - (item.endRho + item.startRho) / 2 * Math.sin(midAngle);

        item.middle = {x: xm, y: ym};
    },

    drawSeries: function() {
        var store = this.chart.store,
            group = this.group,
            animate = this.chart.animate,
            field = this.angleField || this.field || this.xField,
            lenField = [].concat(this.lengthField),
            fieldLength,
            totalLenField = 0,
            colors = this.colorSet,
            chart = this.chart,
            surface = chart.surface,
            chartBBox = chart.chartBBox,
            rendererAttributes,
            enableShadows = chart.shadow,
            shadowGroups = this.shadowGroups,
            shadowGroup,
            shadowAttributes = this.shadowAttributes,
            shadowAttr,
            shadows,
            shadow,
            shindex,
            lnsh = shadowGroups.length,
            centerX,
            centerY,
            rad = this.rad,
            rhoAcum = 0,
            donut = +this.donut,
            deltaRho,
            slice,
            slices,
            layers = lenField.length,
            layerTotals = [],
            sprite,
            values = {},
            value,
            items = [],
            item,
            passed = false,
            lenValue,
            ln,
            record,
            i, j,
            totalField = 0,
            maxLenField = 0,
            cut = 9,
            defcut = true,
            startAngle,
            endAngle,
            middleAngle,
            sliceLength,
            angle = 0,
            path,
            p;

        this.unHighlight();
        this.cleanHighlights();
        
        centerX = this.centerX = chartBBox.x + (chartBBox.width / 2);
        centerY = this.centerY = chartBBox.y + (chartBBox.height / 2);
        this.radius = Math.min(centerX, centerY);
        slices = [];
        this.items = items = [];

        store.each(function(record, i) {
            totalField += +record.get(field);
            if(lenField[0]) {
                for(j = 0, totalLenField = 0; j < layers; j++) {
                    totalLenField += +record.get(lenField[j]);
                }
                layerTotals[i] = totalLenField;
                maxLenField = Math.max(maxLenField, totalLenField);
            }
        });

        store.each(function(record, i) {
            value = record.get(field);
            middleAngle = angle - 360 * value / totalField / 2;
            // First slice
            if (!i) {
                angle = 360 - middleAngle;
                this.firstAngle = angle;
                middleAngle = angle - 360 * value / totalField / 2;
            }
            endAngle = angle - 360 * value / totalField;
            slice = {
                series: this,
                value: value,
                startAngle: angle,
                endAngle: endAngle,
                storeItem: record
            };
            if (lenField[0]) {
                lenValue = layerTotals[i];
                slice.rho = this.radius * (lenValue / maxLenField);
            } else {
                slice.rho = this.radius;
            }
            slices.push(slice);
            angle = endAngle;
        }, this);

        
        //do all shadows first.
        if (enableShadows) {
            for (i = 0, ln = slices.length; i < ln; i++) {
                slice = slices[i];
                slice.shadowAttrs = [];
                for (j = 0, rhoAcum = 0, shadows = []; j < layers; j++) {
                    sprite = group.getAt(i * layers + j);
                    deltaRho = lenField[j]? store.getAt(i).get(lenField[j]) / layerTotals[i] * slice.rho : slice.rho;
                    //set pie slice properties
                    rendererAttributes = {
                        segment: {
                            startAngle: slice.startAngle,
                            endAngle: slice.endAngle,
                            margin: 0,
                            rho: slice.rho,
                            startRho: rhoAcum + (deltaRho * donut / 100),
                            endRho: rhoAcum + deltaRho
                        }
                    };
                    //create shadows
                    for (shindex = 0, shadows = []; shindex < lnsh; shindex++) {
                        shadowAttr = shadowAttributes[shindex];
                        shadow = shadowGroups[shindex].getAt(i);
                        if (!shadow) {
                            shadow = chart.surface.add(Ext.apply({}, {
                                type: 'path',
                                group: shadowGroups[shindex],
                                strokeLinejoin: "round"
                            }, rendererAttributes, shadowAttr));
                        }
                        if (animate) {
                            rendererAttributes = this.renderer(shadow, store.getAt(i), Ext.apply({}, rendererAttributes, shadowAttr), i, store);
                            this.onAnimate(shadow, { to: rendererAttributes });
                        } else {
                            rendererAttributes = this.renderer(shadow, store.getAt(i), Ext.apply(shadowAttr, { hidden: false }), i, store);
                            shadow.setAttributes(rendererAttributes, true);
                        }
                        shadows.push(shadow);
                    }
                    slice.shadowAttrs[j] = shadows;
                }
            }
        }
        //do pie slices after.
        for (i = 0, ln = slices.length; i < ln; i++) {
            slice = slices[i];
            for (j = 0, rhoAcum = 0; j < layers; j++) {
                sprite = group.getAt(i * layers + j);
                deltaRho = lenField[j]? store.getAt(i).get(lenField[j]) / layerTotals[i] * slice.rho : slice.rho;
                //set pie slice properties
                rendererAttributes = {
                    segment: {
                        startAngle: slice.startAngle,
                        endAngle: slice.endAngle,
                        margin: 0,
                        rho: slice.rho,
                        startRho: rhoAcum + (deltaRho * donut / 100),
                        endRho: rhoAcum + deltaRho
                    }
                };
                item = Ext.apply({}, rendererAttributes.segment, {
                    slice: slice,
                    series: this,
                    storeItem: slice.storeItem,
                    index: i
                });
                this.calcMiddle(item);
                if (enableShadows) {
                    item.shadows = slice.shadowAttrs[j];
                }
                items.push(item);
                // Create a new sprite if needed (no height)
                if (!sprite) {
                    sprite = surface.add(Ext.apply({
                        group: group,
                        middle: item.middle,
                        type: "path",
                        stroke: "#fff",
                        fill: colors[layers > 1? (j % colors.length) : (i % colors.length)],
                        strokeLinejoin: "round",
                        lineWidth: 2
                    }, rendererAttributes));
                }
                slice.sprite = slice.sprite || [];
                item.sprite = sprite;
                slice.sprite.push(sprite);
                slice.point = [item.middle.x, item.middle.y];
                if (animate) {
                    rendererAttributes = this.renderer(sprite, store.getAt(i), rendererAttributes, i, store);
                    this.animation = this.onAnimate(sprite, {
                      to: rendererAttributes
                    });
                } else {
                    rendererAttributes = this.renderer(sprite, store.getAt(i), Ext.apply(rendererAttributes, { hidden: false }), i, store);
                    sprite.setAttributes(rendererAttributes, true);
                }
                rhoAcum += deltaRho;
            }
        }
        // Hide unused bars
        ln = group.getCount();
        i = slices.length * layers;
        for (; i < ln; i++) {
            group.getAt(i).hide(true);
        }
        if (enableShadows) {
            for (shindex = 0; shindex < lnsh; shindex++) {
                shadowGroup = shadowGroups[shindex];
                ln = shadowGroup.getCount();
                for (j = i; j < ln; j++) {
                    shadowGroup.getAt(j).hide(true);
                }
            }
        }
        this.renderLabels();
        this.renderCallouts();
    },

    onCreateLabel: function(storeItem, item, i, display) {
        var group = this.labelsGroup,
            config = this.label,
            fill = config.color,
            font = config.font,
            centerX = this.centerX,
            centerY = this.centerY,
            middle = item.middle,
            opt = { x: middle.x, y: middle.y },
            x = middle.x - centerX,
            y = middle.y - centerY,
            theta = Math.atan2(y, x || 1),
            dg = theta * 180 / Math.PI;

        return this.chart.surface.add(Ext.apply({}, {
            'type': 'text',
            'text-anchor': 'middle',
            'group': group,
            'fill': fill,
            'font': font
        }, opt));
    },

    onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        var chart = this.chart,
            resizing = chart.resizing,
            config = this.label,
            format = config.renderer,
            field = [].concat(config.field),
            centerX = this.centerX,
            centerY = this.centerY,
            middle = item.middle,
            opt = { x: middle.x, y: middle.y },
            x = middle.x - centerX,
            y = middle.y - centerY,
            rho = 1,
            theta = Math.atan2(y, x || 1),
            dg = theta * 180 / Math.PI,
            prevDg;

        function fixAngle(a) {
            if (a < 0) a += 360;
            return a % 360;
        }

        label.setAttributes({
            text: format(storeItem.get(field[index])),
            hidden: true
        }, true);

        switch(display) {
            case 'outside':
                rho = Math.sqrt(x * x + y * y) * 2;
                //update positions
                opt.x = rho * Math.cos(theta) + centerX;
                opt.y = rho * Math.sin(theta) + centerY;
                break;

            case 'rotate':
                dg = fixAngle(dg);
                dg = dg > 90 && dg < 270? dg + 180 : dg;

                prevDg = label.rotation.degrees;
                if(prevDg != null && Math.abs(prevDg - dg) > 180) {
                    if(dg > prevDg) {
                        dg -= 360;
                    } else {
                        dg += 360;
                    }
                    dg = dg % 360;
                } else {
                    dg = fixAngle(dg);
                }
                //update rotation angle
                opt.rotate = {
                    degrees: dg,
                    x: opt.x,
                    y: opt.y
                };
                break;

            default: break;
        }
        if (animate && !resizing && (display != 'rotate' || prevDg != null)) {
            label.show(true);
            this.onAnimate(label, {
                to: opt
            });
        } else {
            label.setAttributes(opt, true);
            if (resizing && this.animation) {
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
            resizing = chart.resizing,
            config = this.callouts,
            centerX = this.centerX,
            centerY = this.centerY,
            middle = item.middle,
            opt = { x: middle.x, y: middle.y },
            x = middle.x - centerX,
            y = middle.y - centerY,
            rho = 1,
            rhoCenter,
            theta = Math.atan2(y, x || 1),
            bbox = callout.label.getBBox(),
            offsetFromViz = 20,
            offsetToSide = 10,
            offsetBox = 10,
            p;

        //should be able to config this.
        rho = item.endRho + offsetFromViz;
        rhoCenter = (item.endRho + item.startRho) /2 + (item.endRho - item.startRho) /3;
        //update positions
        opt.x = rho * Math.cos(theta) + centerX;
        opt.y = rho * Math.sin(theta) + centerY;
        
        x = rhoCenter * Math.cos(theta);
        y = rhoCenter * Math.sin(theta);
        
        //set the line from the middle of the pie to the box.
        callout.lines.setAttributes({
            path: ["M", x + centerX, y + centerY, "L", opt.x, opt.y, "Z", "M", opt.x, opt.y, "l", x > 0? offsetToSide : -offsetToSide, 0, "z"]
        }, true);
        //set box position
        callout.box.setAttributes({
            x: opt.x + (x > 0? offsetToSide : -(offsetToSide + bbox.width + 2 * offsetBox)),
            y: opt.y + (y > 0? (-bbox.height -offsetBox/2) : (-bbox.height -offsetBox/2)),
            width: bbox.width + 2 * offsetBox,
            height: bbox.height + 2 * offsetBox
        }, true);
        //set text position
        callout.label.setAttributes({
            x: opt.x + (x > 0? (offsetToSide + offsetBox) : -(offsetToSide + bbox.width + offsetBox)),
            y: opt.y + (y > 0? -bbox.height/4 : -bbox.height/4)
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
            duration: 500
        }, attr));
    },
    
    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     *
     * For Pie series, this is the pie slice directly under the point.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Object}
     */
    getItemForPoint: function(x, y) {
        var cx = this.centerX,
            cy = this.centerY,
            abs = Math.abs,
            dx = abs(x - cx),
            dy = abs(y - cy),
            items = this.items,
            item,
            i = items && items.length,
            angle,
            startAngle,
            endAngle,
            rho = Math.sqrt(dx * dx + dy * dy);

        // Make sure we're within the pie circle area
        if (i && rho <= this.radius) {
            angle = Math.atan2(y - cy, x - cx) / this.rad + 360;
            // normalize to the same range of angles created by drawSeries
            if (angle > this.firstAngle) {
                angle -= 360;
            }
            while (i--) {
                item = items[i];
                startAngle = item.startAngle;
                endAngle = item.endAngle;
                if (angle <= startAngle && angle > endAngle && 
                        rho >= item.startRho && rho <= item.endRho) {
                    return item;
                }
            }
        }
        return null;
    },
    
    highlightItem: function(item) {
        Ext.chart.PieSeries.superclass.highlightItem.call(this, item);
        if (!this.highlight) return;
        
        if ('segment' in this.highlightStyles) {
            var hs = this.highlightStyles.segment,
                animate = this.chart.animate;
            //animate labels
            if (this.labelsGroup) {
                var group = this.labelsGroup,
                    display = this.label.display,
                    label = group.getAt(item.index),
                    rad = this.rad,
                    middle = (item.startAngle + item.endAngle) / 2 * rad,
                    r = hs.margin || 0,
                    x = r * Math.cos(middle),
                    y = r * Math.sin(middle);
                
                
                label._anim = new Ext.fx2.Anim({
                   target: label,
                   to: Ext.apply({
                        translate: {
                            x: x,
                            y: y
                        }
                    }, display == 'rotate'? {
                        rotate: {
                            x: label.attr.x + x,
                            y: label.attr.y + y,
                            degrees: label.rotation.degrees
                        }
                    } : {}),
                    duration: 150
                });
            }
            //animate shadows
            if (this.chart.shadow && item.shadows) {
                for (var i = 0, shadows = item.shadows, l = shadows.length, shadow; i < l; i++) {
                    shadow = shadows[i];
                    var from = {}, to = {},
                        ihs = item.sprite._from.segment;
                    Ext.apply(from, ihs);
                    for (var p in ihs) {
                        if (!(p in hs)) {
                            to[p] = ihs[p];
                        }
                    }
                    shadow._anim = new Ext.fx2.Anim({
                        target: shadow,
                        from: {
                            segment: from
                        },
                        to: {
                            segment: Ext.apply(to, this.highlightStyles.segment)
                        },
                        duration: 150
                    });
                }
            }
        }
    },
    
    /**
     * Un-highlight any existing highlights
     */
    unHighlight: function() {
        if (!this.highlight) return;
        
        if (('segment' in this.highlightStyles)
           && this.items) {

            var items = this.items,
                shadowsEnabled = !!this.chart.shadow,
                group = this.labelsGroup,
                len = items.length, sprite,
                display = this.label.display,
                shadows, shadow, item;
        
            for(var i = 0; i < len; i++) {
                item = items[i];
                sprite = item.sprite;
                if(sprite && sprite._highlighted) {
                    //animate labels
                    if (group) {
                        var label = group.getAt(item.index);
                        label._anim.paused = true;
                        label._anim = new Ext.fx2.Anim({
                           target: label,
                           to: Ext.apply({
                                translate: {
                                    x: 0,
                                    y: 0
                                }
                            }, display == 'rotate'? {
                                rotate: {
                                    x: label.attr.x,
                                    y: label.attr.y,
                                    degrees: label.rotation.degrees
                                }
                            } : {}),
                            duration: 150
                        });
                    }
                    if (shadowsEnabled) {
                        shadows = item.shadows;
                        for (var j = 0, shadowLen = shadows.length; j < shadowLen; j++) {
                            var from = {}, to = {},
                                ihs = item.sprite._to.segment,
                                hs = item.sprite._from.segment;
                            Ext.apply(from, ihs);
                            Ext.apply(to, hs);
                            for (var p in ihs) {
                                if (!(p in hs)) {
                                    to[p] = ihs[p];
                                }
                            }
                            shadow = shadows[j];
                            shadow._anim.paused = true;
                            shadow._anim = new Ext.fx2.Anim({
                                target: shadow,
                                from: { segment: from },
                                to: { segment: to },
                                duration: 150
                            });
                        }
                    }
                }
            }
        }
        
        Ext.chart.PieSeries.superclass.unHighlight.call(this);
    }     
});

