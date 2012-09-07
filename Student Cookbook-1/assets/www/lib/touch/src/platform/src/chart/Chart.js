/**
 * @class Ext.chart.Chart
 * @extends Ext.Component
 * The Ext.chart package provides the capability to visualize data with flash based charting.
 * Each chart binds directly to an Ext.data.Store enabling automatic updates of the chart.
 * @constructor
 * @xtype chart
 */

Ext.chart.Chart = Ext.extend(Ext.draw.DrawComponent, {
    animate: false,
    legend: false,
    x: 0,
    y: 0,
    implOrder: ['SVG', 'VML', 'Canvas'],


    initComponent: function() {
        Ext.chart.Chart.superclass.initComponent.call(this);
        this.addEvents(
            'itemmouseover',
            'itemmouseout',
            'itemclick',
            'itemdoubleclick',
            'itemdragstart',
            'itemdrag',
            'itemdragend',
            /**
                 * @event beforerefresh
                 * Fires before a refresh to the chart data is called.  If the beforerefresh handler returns
                 * <tt>false</tt> the {@link #refresh} action will be cancelled.
                 * @param {Chart} this
                 */
            'beforerefresh',
            /**
                 * @event refresh
                 * Fires after the chart data has been refreshed.
                 * @param {Chart} this
                 */
            'refresh'
        );
        Ext.applyIf(this, {
            zoom: {
                x: 1,
                y: 1
            }
        });
        this.maxGutter = [0, 0];
        this.store = Ext.StoreMgr.lookup(this.store);
        var axes = this.axes;
        this.axes = new Ext.util.MixedCollection(false, function(a) { return a.position; });
        if (axes) {
            this.axes.addAll(axes);
        }
        var series = this.series;
        this.series = new Ext.util.MixedCollection(false, function(a) { return a.seriesId || (a.seriesId = Ext.id(null, 'ext-chart-series-')); });
        if (series) {
            this.series.addAll(series);
        }

        if (this.legend !== false) {
            this.legend = new Ext.chart.Legend(Ext.applyIf({chart:this}, this.legend));
        }

        this.on('mousemove', this.onMouseMove, this);
        this.on('mouseleave', this.onMouseLeave, this);
    },

    doComponentLayout: function(w, h) {
        // curWidth/curHeight will go away when this.el returns in the new platform component renderer
        if (this.curWidth !== w || this.curHeight !== h) {
            this.curWidth = w;
            this.curHeight = h;
            this.redraw(true);
        }
    },

    redraw: function(resize) {
        var chartBBox = this.chartBBox = {
                x: this.x,
                y: this.y,
                height: (this.curHeight * this.zoom.y),
                width: (this.curWidth * this.zoom.x)
            },
            legend = this.legend;
        this.surface.setSize(chartBBox.width, chartBBox.height);

        // Instantiate Series and Axes
        this.series.each(this.initializeSeries, this);
        this.axes.each(this.initializeAxis, this);

        // Create legend if not already created
        if (legend !== false) {
            legend.create();
        }

        // Place axes properly, including influence from each other
        this.alignAxes();

        // Reposition legend based on new axis alignment
        if (this.legend !== false) {
            legend.updatePosition();
        }

        // Find the max gutter
        this.getMaxGutter();

        // Draw axes and series
        this.resizing = !!resize;
        this.axes.each(this.drawAxis, this);
        this.series.each(this.drawCharts, this);
        this.resizing = false;
    },

    afterRender: function() {
        Ext.chart.Chart.superclass.afterRender.call(this);
        var ref,
            me = this;

        if (this.categoryNames) {
            this.setCategoryNames(this.categoryNames);
        }

        if (this.tipRenderer) {
            ref = this.getFunctionRef(this.tipRenderer);
            this.setTipRenderer(ref.fn, ref.scope);
        }

        this.bindStore(this.store, true);

        // breakout
        this.refresh();
    },

    onMouseMove: function(e) {
        var box = this.surface.getRegion(),
            pageXY = e.getXY(),
            localX = pageXY[0] - box.left,
            localY = pageXY[1] - box.top;

        // Ask each series if it has an item corresponding to (not necessarily exactly
        // on top of) the current mouse coords. Fire itemmouseover/out events.
        this.series.each(function(series) {
            if (series.getItemForPoint) {
                var item = series.getItemForPoint(localX, localY),
                    last = series._lastItemForPoint;

                if (item !== last) {
                    if (last) {
                        this.fireEvent('itemmouseout', last);
                        delete series._lastItemForPoint;
                    }
                    if (item) {
                        this.fireEvent('itemmouseover', item);
                        series._lastItemForPoint = item;
                    }
                }
            }
        }, this);
    },

    onMouseLeave: function(e) {
        this.series.each(function(series) {
            delete series._lastItemForPoint;
        });
    },

    /**
     * Sets a single style value on the Chart instance.
     *
     * @param name {String} Name of the Chart style value to change.
     * @param value {Object} New value to pass to the Chart style.
     */
    setStyle: function(name, value) {
    },

    /**
     * Resets all styles on the Chart instance.
     *
     * @param styles {Object} Initializer for all Chart styles.
     */
    setStyles: function(styles) {
        this.styles = styles;
    },

    /**
     * Sets the styles on all series in the Chart.
     *
     * @param styles {Array} Initializer for all Chart series styles.
     */
    setSeriesStyles: function(styles) {
    },

    setCategoryNames: function(names) {
    },

    setTipRenderer: function(fn, scope) {
    },

    setSeries: function(series) {
    },

    delayRefresh: function() {
        if (!this.refreshTask) {
            this.refreshTask = new Ext.util.DelayedTask(this.refresh, this);
        }
        this.refreshTask.delay(this.refreshBuffer);
    },

    refresh: function() {
        if (this.rendered && this.curWidth != undefined && this.curHeight != undefined) {
            if (this.fireEvent('beforerefresh', this) !== false) {
                this.redraw();
                this.fireEvent('refresh', this);
            }
        }
    },

    /**
     * Changes the data store bound to this chart and refreshes it.
     * @param {Store} store The store to bind to this chart
     */
    bindStore: function(store, initial) {
        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroy();
            } else {
                this.store.un('datachanged', this.refresh, this);
                this.store.un('add', this.delayRefresh, this);
                this.store.un('remove', this.delayRefresh, this);
                this.store.un('update', this.delayRefresh, this);
                this.store.un('clear', this.refresh, this);
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                datachanged: this.refresh,
                add: this.delayRefresh,
                remove: this.delayRefresh,
                update: this.delayRefresh,
                clear: this.refresh
            });
        }
        this.store = store;
        if (store && !initial) {
            this.refresh();
        }
    },


    // Create Axis
    initializeAxis: function(axis) {
        var chartBBox = this.chartBBox,
            w = chartBBox.width,
            h = chartBBox.height,
            x = chartBBox.x,
            y = chartBBox.y,
            config = {
                chart: this
            };
        switch (axis.position) {
            case 'top':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    x: x,
                    y: y
                });
            break;
            case 'bottom':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    x: x,
                    y: h
                });
            break;
            case 'left':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    x: x,
                    y: h
                });
            break;
            case 'right':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    x: w,
                    y: h
                });
            break;
        }
        if (!axis.chart) {
            Ext.apply(config, axis);
            axis = this.axes.replace(new Ext.chart[axis.type](config));
        }
        else {
            Ext.apply(axis, config);
        }
        axis.drawAxis(true);
    },


    /**
     * Adjust the dimensions and positions of each axis and the chart body area after accounting
     * for the space taken up on each side by the axes and legend.
     */
    alignAxes: function() {
        var axes = this.axes,
            legend = this.legend,
            edges = ['top', 'right', 'bottom', 'left'],
            chartBBox,
            insets = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };

        function getAxis(edge) {
            var i = axes.findIndex('position', edge);
            return (i < 0) ? null : axes.getAt(i);
        }

        // Find the space needed by axes and legend as a positive inset from each edge
        Ext.each(edges, function(edge) {
            var isVertical = (edge === 'left' || edge === 'right'),
                axis = getAxis(edge),
                bbox;

            // Add legend size if it's on this edge
            if (legend !== false) {
                if (legend.position === edge) {
                    bbox = legend.getBBox();
                    insets[edge] += (isVertical ? bbox.width : bbox.height);
                }
            }

            // Add axis size if there's one on this edge
            if (axis) {
                bbox = axis.bbox;
                insets[edge] += (isVertical ? bbox.width : bbox.height);
            }
        });

        // Build the chart bbox based on the collected inset values
        chartBBox = {
            x: this.x + insets.left,
            y: this.y + insets.top,
            width: (this.curWidth * this.zoom.y) - insets.left - insets.right,
            height: (this.curHeight * this.zoom.x) - insets.top - insets.bottom
        };
        this.chartBBox = chartBBox;

        // Go back through each axis and set its length and position based on the
        // corresponding edge of the chartBBox
        axes.each(function(axis) {
            var pos = axis.position,
                isVertical = (pos === 'left' || pos === 'right');

            axis.x = (pos === 'right' ? chartBBox.x + chartBBox.width : chartBBox.x);
            axis.y = (pos === 'top' ? chartBBox.y : chartBBox.y + chartBBox.height);
            axis.width = (isVertical ? chartBBox.width : chartBBox.height);
            axis.length = (isVertical ? chartBBox.height : chartBBox.width);
        });
    },


    initializeSeries: function(series) {
        var config = {
            chart: this,
            seriesId: series.seriesId
        };
        if (!series.chart) {
            Ext.applyIf(config, series);
            series = this.series.replace(new Ext.chart[Ext.util.Format.capitalize(series.type) + 'Series'](config));
        }
        else {
            Ext.apply(series, config);
        }
    },

    getMaxGutter: function() {
        var maxGutter = [0, 0];
        this.series.each(function() {
            var gutter = this.getGutters();
            maxGutter[0] = Math.max(maxGutter[0], gutter[0]);
            maxGutter[1] = Math.max(maxGutter[1], gutter[1]);
        });
        this.maxGutter = maxGutter;
    },

    drawAxis: function(axis) {
        axis.drawAxis();
    },

    drawCharts: function(series) {
        series.drawSeries();
    },

    destroy: function() {
        this.surface.destroy();
        Ext.chart.Chart.superclass.onRender.apply(this, arguments);
    }
});

Ext.reg('chart', Ext.chart.Chart);