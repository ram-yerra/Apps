/**
 * @class Ext.chart.BarSeries
 * @extends Ext.chart.CartesianSeries
 * Series which displays its items as horizontal bars
 * @constructor
 */
Ext.chart.BarSeries = Ext.extend(Ext.chart.CartesianSeries, {
    type: 'bar',

    column: false,
    
    /**
     * @cfg {String} color
     * Specifies the fill color for the bars
     */
    color: '#000',

    /**
     * @cfg {Number} gutter
     * The gutter space between single bars, as a percentage of the bar width
     */
    gutter: 38.2,

    /**
     * @cfg {Number} groupGutter
     * The gutter space between groups of bars, as a percentage of the bar width
     */
    groupGutter: 38.2,

    /**
     * @cfg {Number} xpadding
     * Padding between the left/right axes and the bars
     */
    xpadding: 0,

    /**
     * @cfg {Number} ypadding
     * Padding between the top/bottom axes and the bars
     */
    ypadding: 10,
    
    /**
     * @cfg {Object} highlightStyles
     * An object that contains styles for series elements when hovering.
     */

    /**
     * @cfg {Array} shadowAttributes
     * An array with shadow attributes
     */

    constructor: function(config) {
        Ext.chart.BarSeries.superclass.constructor.call(this, config);
        Ext.apply(this, config, {
            highlightStyles: {
                lineWidth: 3,
                stroke: '#55c',
                opacity: 0.8,
                color: '#f00'
            },
            
            shadowAttributes: [{
                "stroke-width": 6,
                "stroke-opacity": 0.05,
                stroke: 'rgb(200, 200, 200)',
                translate: {
                    x: 1.2,
                    y: 1.2
                }
            }, {
                "stroke-width": 4,
                "stroke-opacity": 0.1,
                stroke: 'rgb(150, 150, 150)',
                translate: {
                    x: 0.9,
                    y: 0.9
                }
            }, {
                "stroke-width": 2,
                "stroke-opacity": 0.15,
                stroke: 'rgb(100, 100, 100)',
                translate: {
                    x: 0.6,
                    y: 0.6
                }
            }]
        });
        var surface = this.chart.surface,
            shadow = this.chart.shadow,
            i, l;
        this.group = surface.getGroup(this.seriesId + '-bars');
        if (shadow) {
            for(i = 0, l = this.shadowAttributes.length; i < l; i++) {
                this.shadowGroups.push(surface.getGroup(this.seriesId + '-shadows' + i));
            }
        }
    },

    getBarGirth: function() {
        var store = this.chart.store,
            column = this.column,
            ln = store.getCount(),
            gutter = this.gutter / 100;
        return (this.chart.chartBBox[column ? 'width' : 'height'] - this[column ? 'xpadding' : 'ypadding'] * 2) / (ln * (gutter + 1) - gutter);
    },

    getGutters: function() {
        var column = this.column,
            gutter = Math.ceil(this[column ? 'xpadding' : 'ypadding'] + this.getBarGirth() / 2);
        return this.column ? [gutter, 0] : [0, gutter];
    },

    drawSeries: function() {
        var barAttr,
            shadowBarAttr,
            axis,
            axisPos = {left: 1, right: 1},
            Bar = this,
            bars = [].concat(this.yField),
            group = this.group,
            chart = this.chart,
            enableShadows = chart.shadow,
            shadowGroups = this.shadowGroups,
            shadowGroup,
            shadowAttributes = this.shadowAttributes,
            shadows,
            shadow,
            shindex,
            lnsh = shadowGroups.length,
            barsLen = bars.length,
            barWidth,
            animate = chart.animate,
            chartBBox = chart.chartBBox,
            colors = [].concat(this.color),
            column = this.column,
            ends,
            groupBarWidth,
            groupGutter = this.groupGutter / 100,
            gutter = this.gutter / 100,
            height,
            i, j, pos,
            ln,
            tmp,
            maxY, minY,
            path = [],
            scale,
            sprite,
            stacked = this.stacked,
            store = chart.store,
            undef,
            xpadding = this.xpadding,
            ypadding = this.ypadding,
            rendererAttributes,
            zero, plus, minus,
            items,
            opt,
            total;

        this.unHighlight();
        this.cleanHighlights();
        
        this.items = [];
        this.opt = {};
        
        items = this.items;
        opt = this.opt;

        //TODO(nico): should these calculations always be performed or
        //just when the window is resized?
        if (this.yField) {
            ends = new Ext.chart.Axis({
                chart: chart,
                fields: [this.yField]
            }).calcEnds();
            minY = Math.min(ends.from, 0);
            maxY = Math.max(ends.to, 0);
        }
        if (!column) {
            axisPos = {top: 1, bottom: 1};
        }
        if (this.axis) {
            axis = chart.axes.get(this.axis);
            if (axis && axisPos.hasOwnProperty(axis.position)) {
                minY = Math.min(axis.from, 0);
                maxY = Math.max(axis.to, 0);
            }
        }
        
        barWidth = this.getBarGirth();
        scale = (column ? chartBBox.height - ypadding * 2 : chartBBox.width - xpadding * 2) / (maxY - minY);
        groupBarWidth = barWidth / ((stacked ? 1 : barsLen) * (groupGutter + 1) - groupGutter);
        zero = column ?
            chartBBox.y + chartBBox.height - ypadding :
            chartBBox.x + xpadding;
        
        if (stacked) {
            total = [[], []];
            store.each(function(record, i) {
                total[0][i] = total[0][i] || 0;
                total[1][i] = total[1][i] || 0;
                for (j = 0; j < barsLen; j++) {
                    var rec = record.get(bars[j]);
                    total[+(rec > 0)][i] += Math.abs(rec);
                }
            });
            plus = Math.max.apply(Math, total[0]);
            minus = Math.max.apply(Math, total[1]);
            scale = (column ? chartBBox.height - ypadding * 2 : chartBBox.width - xpadding * 2) / (plus + minus);
            zero = zero + plus * scale * (column ? -1 : 1);
        } else if (minY / maxY < 0) {
            zero = zero - minY * scale * (column ? -1 : 1);
        }
        
        //adding as chart configuration values
        Ext.apply(opt, {
            minY: minY,
            maxY: maxY,
            scale: scale,
            barWidth: barWidth,
            groupBarWidth: groupBarWidth,
            zero: zero,
            column: column
        });

        // Calc bar attributes
        store.each(function(record, i) {
            var bottom = zero,
                top = zero,
                width,
                height,
                labelPos,
                yValue,
                value1, value2,
                props,
                totalDim = 0,
                passed = false; //we only need to pass once for all stacks
            for (j = 0; j < barsLen; j++) {
                yValue = record.get(bars[j]);
                height = (yValue * scale) >> 0;
                barAttr = {
                    fill: colors[j]
                };
                if (column) {
                    Ext.apply(barAttr, {
                        height: height,
                        width: groupBarWidth >> 0,
                        x: (chartBBox.x + xpadding + i * barWidth * (1 + gutter) + j * groupBarWidth * (1 + groupGutter) * !stacked) >> 0,
                        y: bottom - height
                    });
                } else {
                    Ext.apply(barAttr, {
                        width: height,
                        height: groupBarWidth >> 0,
                        x: bottom + 1,
                        y: (chartBBox.y + ypadding + i * barWidth * (1 + gutter) + j * groupBarWidth * (1 + groupGutter) * !stacked + 1) >> 0
                    });
                }
                if (height < 0) {
                    if (column) {
                        barAttr.y = top;
                        barAttr.height = Math.abs(height);
                    } else {
                        barAttr.x = top + height;
                        barAttr.width = Math.abs(height);
                    }
                }
                if (stacked) {
                    if (height < 0) {
                        top += height * (column ? -1 : 1);
                    } else {
                        bottom += height * (column ? -1 : 1);
                    }
                    totalDim += height;
                }
                items.push({
                    series: this,
                    storeItem: record,
                    value: [record.get(this.xField), yValue],
                    attr: barAttr,
                    point: column ? [barAttr.x + barAttr.width / 2, yValue >= 0 ? barAttr.y : barAttr.y + barAttr.height] :
                                    [yValue >= 0 ? barAttr.x + barAttr.width : barAttr.x, barAttr.y + barAttr.height / 2]
                });
                // When resizing, reset before animating
                if (animate && chart.resizing) {
                    props = column ? {
                        x: barAttr.x,
                        y: zero,
                        width: barAttr.width,
                        height: 0
                    } : {
                        x: zero,
                        y: barAttr.y,
                        width: 0,
                        height: barAttr.height
                    };
                    if (enableShadows && (stacked && !passed || !stacked)) {
                        passed = true;
                        //update shadows
                        for (shindex = 0; shindex < lnsh; shindex++) {
                            shadow = shadowGroups[shindex].getAt(stacked? i : (i * barsLen + j));
                            if (shadow) {
                                shadow.setAttributes(props, true);
                            }
                        }
                    }
                    //update sprite position and width/height
                    sprite = group.getAt(i * barsLen + j);
                    if (sprite) {
                        sprite.setAttributes(props, true);
                    }
                }
            }
            if (stacked) {
                items[i * barsLen].totalDim = totalDim;
            }
        }, this);

        // Create new or reuse sprites and animate/display
        ln = items.length;
        for (i = 0; i < ln; i++) {
            sprite = group.getAt(i);
            barAttr = items[i].attr;
            pos = column ? {
                y: zero,
                height: 0
            } : {
                x: zero,
                width: 0
            };
            //create the sprite shadow
            if (((stacked && (i % barsLen === 0)) || !stacked) && enableShadows) {
                j = i / barsLen;
                //create shadows
                for (shindex = 0, shadows = []; shindex < lnsh; shindex++) {
                    shadowBarAttr = shadowAttributes[shindex];
                    shadowBarAttr = Ext.apply({}, shadowBarAttr, pos, barAttr);
                    shadow = shadowGroups[shindex].getAt(stacked? j : i);
                    if (!shadow) {
                        Ext.copyTo(shadowBarAttr, barAttr, 'x,y,width,height');
                        tmp = Ext.apply({}, pos, shadowBarAttr);
                        shadow = chart.surface.add(Ext.apply({}, {
                            type: 'rect',
                            group: shadowGroups[shindex]
                        }, tmp));
                    }
                    Ext.copyTo(shadowBarAttr, barAttr, 'x,y,width,height');
                    if (stacked) {
                        if (column) {
                            shadowBarAttr.height = items[i].totalDim;
                        } else {
                            shadowBarAttr.width = items[i].totalDim;
                        }
                    } else  {
                        
                    }
                    delete shadowBarAttr.translate;
                    if (animate) {
                        rendererAttributes = this.renderer(shadow, store.getAt(j), shadowBarAttr, i, store);
                        this.onAnimate(shadow, rendererAttributes);
                    } else {
                        rendererAttributes = this.renderer(shadow, store.getAt(j), Ext.apply(shadowBarAttr, { hidden: false }), i, store);
                        shadow.setAttributes(rendererAttributes, true);
                    }
                    shadows.push(shadow);
                }
            }
            if (enableShadows) {
                items[i].shadows = shadows;
            }
            // Create a new sprite if needed (no height)
            if (!sprite) {
                tmp = Ext.apply({}, pos, barAttr);
                sprite = chart.surface.add(Ext.apply({}, {
                    type: 'rect',
                    group: group
                }, tmp));
            }
            if (animate) {
                rendererAttributes = this.renderer(sprite, store.getAt(i), barAttr, i, store);
                this.onAnimate(sprite, rendererAttributes);
            } else {
                rendererAttributes = this.renderer(sprite, store.getAt(i), Ext.apply(barAttr, { hidden: false }), i, store);
                sprite.setAttributes(rendererAttributes, true);
            }
            items[i].sprite = sprite;
        }
        // Hide unused sprites
        ln = group.getCount();
        for (j = i; j < ln; j++) {
            group.getAt(j).hide(true);
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
    },
    
    onCreateLabel: function(storeItem, item, i, display) {
        var surface = this.chart.surface,
            group = this.labelsGroup,
            config = this.label,
            color = config.color,
            font = config.font,
            sprite;
            
        return surface.add({
            type: 'text',
            'text-anchor': 'middle',
            group: group,
            fill: color,
            font: font
        });
    },
    
    onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        // Determine the label's final position. Starts with the configured preferred value but
        // may get flipped from inside to outside or vice-versa depending on space.
        var opt = this.opt,
            groupBarWidth = opt.groupBarWidth,
            column = opt.column,
            chart = this.chart,
            chartBBox = chart.chartBBox,
            resizing = chart.resizing,
            xValue = item.value[0],
            yValue = item.value[1],
            attr = item.attr,
            finalAttr,
            config = this.label,
            rotate = config.orientation == 'vertical',
            size = this.getLabelSize(yValue),
            width = size.width,
            height = size.height,
            zero = opt.zero,
            outside = 'outside',
            insideStart = 'insideStart',
            insideEnd = 'insideEnd',
            offsetX = 10,
            offsetY = 6,
            format = config.renderer,
            field = [].concat(config.field),
            text = format(storeItem.get(field[index])),
            x, y;
        
        label.setAttributes({
            text: text
        });
        
        if (column) {
            if (display == outside) {
                if (height + offsetY + attr.height > (yValue >= 0 ? zero - chartBBox.y : chartBBox.y + chartBBox.height - zero)) {
                    display = insideEnd;
                }
            } else {
                if (height + offsetY > attr.height) {
                    display = outside;
                }
            }
            x = attr.x + groupBarWidth / 2;
            y = display == insideStart ?
                    (zero + ((height / 2 + 3) * (yValue >= 0 ? -1 : 1))) :
                    (yValue >= 0 ? (attr.y + ((height / 2 + 3) * (display == outside ? -1 : 1))) :
                                   (attr.y + attr.height + ((height / 2 + 3) * (display === outside ? 1 : -1))));
        } else {
            if (display == outside) {
                if (width + offsetX + attr.width > (yValue >= 0 ? chartBBox.x + chartBBox.width - zero : zero - chartBBox.x)) {
                    display = insideEnd;
                }
            } else {
                if (width + offsetX > attr.width) {
                    display = outside;
                }
            }
            x = display == insideStart ?
                (zero + ((width / 2 + 5) * (yValue >= 0 ? 1 : -1))) :
                (yValue >= 0 ? (attr.x + attr.width + ((width / 2 + 5) * (display === outside ? 1 : -1))) :
                (attr.x + ((width / 2 + 5) * (display === outside ? -1 : 1))));
            y = attr.y + groupBarWidth / 2;
        }
        //set position
        finalAttr = {
            x: x,
            y: y
        };
        //rotate
        if (rotate) {
            finalAttr.rotate = {
                x: x,
                y: y,
                degrees: 270
            };
        }
        //check for resizing
        if (animate && resizing) {
            if (column) {
                x = attr.x + attr.width / 2;
                y = zero;
            } else {
                x = zero;
                y = attr.y + attr.height / 2;
            }
            label.setAttributes({
                x: x,
                y: y
            }, true);
            if (rotate) {
                label.setAttributes({
                    rotate: {
                        x: x,
                        y: y,
                        degrees: 270
                    }
                }, true);
            }
        }
        //handle animation
        if (animate) {
            this.onAnimate(label, finalAttr);
        } else {
            label.setAttributes(Ext.apply(finalAttr, {
                hidden: false
            }), true);
        }
    },

    /**
     * Gets the dimensions of a given bar label. Uses a single hidden sprite to avoid
     * changing visible sprites.
     * @param value
     */
    getLabelSize: function(value) {
        var tester = this.testerLabel,
            config = this.label,
            rotated = config.orientation === 'vertical',
            bbox, w, h,
            undef;
        if (!tester) {
            tester = this.testerLabel = this.chart.surface.add({
                type: 'text',
                font: config.font,
                opacity: 0,
                rotate: rotated ? {degrees: 270} : undef
            });
        }
        tester.setAttributes({
            text: config.renderer(value)
        }, true);

        // Flip the width/height if rotated, as getBBox returns the pre-rotated dimensions
        bbox = tester.getBBox();
        w = bbox.width;
        h = bbox.height;
        return {
            width: rotated ? h : w,
            height: rotated ? w : h
        };
    },

    onAnimate: function(sprite, attr) {
        sprite.show();
        var anim = new Ext.fx2.Anim({
            target: sprite,
            easing: 'ease-in-out',
            to: attr,
            duration: 500
        });
        return anim;
    },

    /**
     * For a given x/y point relative to the Surface, find a corresponding item from this
     * series, if any.
     *
     * For Bar/Column series, this is the bar directly under the point.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Object}
     */
    getItemForPoint: function(x, y) {
        var items = this.items,
            bbox,
            i = items && items.length;

        while (i--) {
            bbox = items[i].sprite.getBBox();
            if (bbox.x <= x && bbox.y <= y && bbox.x + bbox.width >= x && bbox.y + bbox.height >= y) {
                return items[i];
            }
        }

        return null;
    }
});