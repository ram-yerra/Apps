/**
 * @class Ext.chart.Axis
 * Defines a CartesianChart's vertical or horizontal axis.
 * @constructor
 */
Ext.chart.Axis = Ext.extend(Object, {
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config);

        Ext.chart.Axis.superclass.constructor.call(this);
        this.labels = [];
        this.getId();
        this.labelGroup = this.chart.surface.getGroup(this.axisId + "-labels");
    },
    grid: false,
    steps: 10,
    textLabelPadding: 5,
    labelFont: '12px Helvetica, sans-serif',
    displayFont: '18px Helvetica, sans-serif',
    labelSpacing: 2,
    dashSize: 3,
    position: 0,
    x: 0,
    y: 0,
    minValue: 0,
    maxValue: 0,
    position: 'bottom',
    skipFirst: false,
    length: 0,
    width: 0,

    getId: function() {
        return this.axisId || (this.axisId = Ext.id(null, 'ext-axis-'));
    },

    applyData: Ext.emptyFn,

    labelRenderer: function(v) {
        return v;
    },

    calcEnds: function() {
        var store = this.chart.store,
            series = this.chart.series.items,
            fields = this.fields,
            ln = fields.length,
            i, l,
            value,
            out,
            min = Infinity,
            max = -Infinity,
            aggregate = false,
            total = 0;
        
        //if one series is stacked I have to aggregate the values
        //for the scale.
        for (i = 0, l = series.length; !aggregate && i < l; i++) {
            aggregate = aggregate || series[i].stacked;
        }
        
        store.each(function(record) {
            if (aggregate) {
               for (value = 0, i = 0; i < ln; i++) {
                   value += record.get(fields[i]);
               }               
               max = Math.max(max, value);
               min = Math.min(min, value);
            } else {
                for (i = 0; i < ln; i++) {
                    value = record.get(fields[i]);
                    max = Math.max(max, value);
                    min = Math.min(min, value);
                }
            }
        });
        out = Ext.draw.snapEnds(min, max, this.steps);
        if (this.hasOwnProperty("maximum") && !isNaN(this.maximum)) {
            out.to = Math.min(out.to, this.maximum);
        }
        if (this.hasOwnProperty("minimum") && !isNaN(this.minimum)) {
            out.from = Math.max(out.from, this.minimum);
        }
        if (this.hasOwnProperty("adjustMaximumByMajorUnit") && !isNaN(this.adjustMaximumByMajorUnit)) {
            out.to += this.adjustMaximumByMajorUnit;
        }
        if (this.hasOwnProperty("adjustMinimumByMajorUnit") && !isNaN(this.adjustMinimumByMajorUnit)) {
            out.from -= this.adjustMinimumByMajorUnit;
        }
        return out;
    },

    drawAxis: function (init) {
        Ext.apply(this, this.applyData());
        var x = this.x,
            y = this.y,
            gutterX = this.chart.maxGutter[0],
            gutterY = this.chart.maxGutter[1],
            dashSize = this.dashSize,
            length = this.length,
            position = this.position,
            inflections = [],
            calcLabels = false,
            trueLength,
            currentX,
            currentY,
            path,
            prev,
            delta;
        if (position == 'left' || position == 'right') {
            currentX = Math.floor(x) + 0.5;
            path = ["M", currentX, y, "l", 0, -length];
            trueLength = length - (gutterY * 2);
        }
        else {
            currentY = Math.floor(y) + 0.5;
            path = ["M", x, currentY, "l", length, 0];
            trueLength = length - (gutterX * 2);
        }
        
        delta = trueLength / this.steps;
        if (this.type == 'NumericAxis') {
            calcLabels = true;
            this.labels = [this.from];
        }
        if (position == 'right' || position == 'left') {
            currentY = y - gutterY;
            currentX = x - ((position == 'left') * dashSize * 2);
            while (currentY >= y - gutterY - trueLength) {
                path = path.concat(["M", currentX, Math.floor(currentY) + 0.5, "l", dashSize * 2 + 1, 0]);
                inflections.push([ Math.floor(x), Math.floor(currentY) ]);
                currentY -= delta;
                if (calcLabels) {
                    this.labels.push(this.labels[this.labels.length -1] + this.step);
                }
            }
            if (Math.round(currentY + delta - (y - gutterY - trueLength))) {
                path = path.concat(["M", currentX, Math.floor(y - length + gutterY) + 0.5, "l", dashSize * 2 + 1, 0]);
                inflections.push([ Math.floor(x), Math.floor(currentY) ]);
                if (calcLabels) {
                    this.labels.push(this.labels[this.labels.length -1] + this.step);
                }
            }
        } else {
            currentX = x + gutterX;
            currentY = y - (!!(position == 'top') * dashSize * 2);
            while (currentX <= x + gutterX + trueLength) {
                path = path.concat(["M", Math.floor(currentX) + 0.5, currentY, "l", 0, dashSize * 2 + 1]);
                inflections.push([ Math.floor(currentX), Math.floor(y) ]);
                currentX += delta;
                if (calcLabels) {
                    this.labels.push(this.labels[this.labels.length -1] + this.step);
                }
            }
            if (Math.round(currentX - delta - (x + gutterX + trueLength))) {
                path = path.concat(["M", Math.floor(x + length - gutterX) + 0.5, currentY, "l", 0, dashSize * 2 + 1]);
                inflections.push([ Math.floor(currentX), Math.floor(y) ]);
                if (calcLabels) {
                    this.labels.push(this.labels[this.labels.length -1] + this.step);
                }
            }
        }
        if (!this.axis) {
            this.axis = this.chart.surface.add({
                type: 'path',
                path: path,
                "stroke-width": this.lineWidth || 1,
                stroke: this.color || '#000'
            });
        }
        // if (this.chart.animate) {
        //     this.onAnimate(this.axis, path);
        // }
        // else {
            this.axis.setAttributes({
                path: path
            }, true);
        // }
        this.inflections = inflections;
        if (!init && this.grid) {
            this.drawGrid();
        }
        this.axisBBox = this.axis.getBBox();
        this.drawLabels();
    },

    drawGrid: function() {
        var inflections = this.inflections,
            ln = inflections.length - 1,
            position = this.position,
            gutter = this.chart.maxGutter,
            path = [],
            width = this.width - 2,
            vert = false,
            point,
            i = 1;
        if ((gutter[1] !== 0 && (position == 'left' || position == 'right')) ||
            (gutter[0] !== 0 && (position == 'top' || position == 'bottom'))) {
            i = 0;
            ln++;
        }
        for (; i < ln; i++) {
            point = inflections[i];
            if (position == 'left') {
                path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", width, 0]);
            } else if (position == 'right') {
                path = path.concat(["M", point[0] - 0.5, point[1] + 0.5, "l", -width, 0]);
            } else if (position == 'top') {
                path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", 0, width]);
            } else {
                path = path.concat(["M", point[0] + 0.5, point[1] - 0.5, "l", 0, -width]);
            }
        }
        if (path.length) {
            if (!this.gridLines) {
                this.gridLines = this.chart.surface.add({
                    type: 'path',
                    path: path,
                    "stroke-width": this.lineWidth || 1,
                    stroke: this.gridColor || '#ccc'
                });
            }
            this.gridLines.setAttributes({
                hidden: false,
                path: path
            }, true);
        }
        else if (this.gridLines) {
            this.gridLines.hide(true);
        }
    },

    drawLabels: function() {
        var inflections = this.inflections,
            ln = inflections.length,
            chart = this.chart,
            position = this.position,
            labels = this.labels,
            surface = chart.surface,
            labelGroup = this.labelGroup,
            maxWidth = 0,
            maxHeight = 0,
            gutterY = this.chart.maxGutter[1],
            bbox,
            point,
            prevX,
            prevY,
            prevLabel,
            textLabel,
            labelAttr,
            textRight,
            text,
            label,
            last,
            x,
            y,
            i;

        if (position == 'left' || position == 'right') {
            last = ln;
            for (i = 0; i < last; i++) {
                point = inflections[i];
                text = this.labelRenderer(labels[i]);
                // Re-use existing textLabel or create a new one
                textLabel = labelGroup.getAt(i);
                if (textLabel) {
                    if (text != textLabel.attr.text) {
                        textLabel.setAttributes({
                            text: text
                        }, true);
                        textLabel._bbox = textLabel.getBBox();
                    }
                }
                else {
                    textLabel = surface.add({
                        group: labelGroup,
                        type: 'text',
                        font: this.labelFont,
                        x: 0,
                        y: 0,
                        text: text
                    });
                    surface.renderItem(textLabel);
                    textLabel._bbox = textLabel.getBBox();
                }
                labelAttr = textLabel.attr;
                bbox = textLabel._bbox;
                maxWidth = Math.max(maxWidth, bbox.width + this.dashSize + this.textLabelPadding);

                y = point[1];
                if (gutterY < bbox.height / 2) {
                    if (i == last - 1 && chart.axes.findIndex('position', 'top') == -1) {
                        y = this.y - this.length + Math.ceil(bbox.height / 2);
                    }
                    else if (i == 0 && chart.axes.findIndex('position', 'bottom') == -1) {
                        y = this.y - Math.floor(bbox.height / 2);
                    }
                }

                if (position == 'left') {
                    x = point[0] - bbox.width - this.dashSize - this.textLabelPadding - 2;
                }
                else {
                    x = point[0] + this.dashSize + this.textLabelPadding + 2;
                }    
                if (x != labelAttr.x || y != labelAttr.y || labelAttr.hidden) {
                    textLabel.setAttributes({
                        hidden: false,
                        x: x,
                        y: y
                    }, true);
                }
            }
        }
        else {
            last = ln - 1;
            for (i = last; i >= 0; i--) {
                point = inflections[i];
                text = this.labelRenderer(labels[i]);
                // Re-use existing textLabel or create a new one
                textLabel = labelGroup.getAt(last - i);
                if (textLabel) {
                    if (text != textLabel.attr.text) {
                        textLabel.setAttributes({
                            text: text
                        }, true);
                        textLabel._bbox = textLabel.getBBox();
                    }
                }
                else {
                    textLabel = surface.add({
                        group: labelGroup,
                        type: 'text',
                        font: this.labelFont,
                        x: 0,
                        y: 0,
                        text: text
                    });
                    surface.renderItem(textLabel);
                    textLabel._bbox = textLabel.getBBox();
                }
                labelAttr = textLabel.attr;
                bbox = textLabel._bbox;
                maxHeight = Math.max(maxHeight, bbox.height + this.dashSize + this.textLabelPadding);
                x = Math.floor(point[0] - (bbox.width / 2));
                if (this.chart.maxGutter[0] == 0) {
                    if (i == 0 && chart.axes.findIndex('position', 'left') == -1) {
                        x = point[0];
                    }
                    else if (i == last && chart.axes.findIndex('position', 'right') == -1) {
                        x = point[0] - bbox.width;
                    }
                }
                textRight = x + bbox.width + this.textLabelPadding;
                if (i != 0 && (i != last) && textRight > prevX) {
                    if (!this.elipsis(textLabel, text, prevX - x, 35, point[0])) {
                        continue;
                    }
                }
                if (i == 0 && prevX < textRight) {
                    if (labelGroup.getCount() > 2) {
                        prevLabel = labelGroup.getAt((last - i) - 1);
                        this.elipsis(prevLabel, prevLabel.attr.text, labelGroup.getAt((last - i) - 2).getBBox().x - textRight, 35, inflections[i + 1][0]);
                    }
                }
                prevX = x;
                if (position == 'top') {
                    y = point[1] - this.dashSize - this.textLabelPadding - (bbox.height / 2);
                }
                else {
                    y = point[1] + this.dashSize + this.textLabelPadding + (bbox.height / 2);
                }
                if (x != labelAttr.x || y != labelAttr.y || labelAttr.hidden) {
                    textLabel.setAttributes({
                        hidden: false,
                        x: x,
                        y: y
                    }, true);
                }
            }
        }

        // Hide unused bars
        ln = labelGroup.getCount();
        i = inflections.length;
        for (; i < ln; i++) {
            labelGroup.getAt(i).hide(true);
        }

        this.bbox = {};
        Ext.apply(this.bbox, this.axisBBox);
        this.bbox.height = maxHeight;
        this.bbox.width = maxWidth;
        this.drawDisplayName(maxWidth, maxHeight);
    },

    elipsis: function(sprite, text, desiredWidth, minWidth, center) {
        var bbox,
            x;

        if (desiredWidth < minWidth) {
            sprite.hide(true);
            return false;
        }
        while (text.length > 4) {
            text = text.substr(0, text.length - 4) + "...";
            sprite.setAttributes({
                text: text
            }, true);
            bbox = sprite.getBBox();
            if (bbox.width < desiredWidth) {
                if (typeof center == 'number') {
                    sprite.setAttributes({
                        x: Math.floor(center - (bbox.width / 2))
                    }, true);
                }
                break;
            }
        }
        return true;
    },

    drawDisplayName: function(maxWidth, maxHeight) {
        var position = this.position,
            surface = this.chart.surface,
            bbox,
            pad,
            x = this.x,
            y = this.y;
        if (position == 'left' || position == 'right') {
            if (Ext.isString(this.displayName)) {
                if (this.displaySprite) {
                    surface.remove(this.displaySprite);
                }
                this.displaySprite = surface.add({
                    type: 'text',
                    font: this.displayFont,
                    opacity: 0,
                    x: x,
                    y: 0,
                    text: this.displayName
                });
                surface.renderItem(this.displaySprite);
                bbox = this.displaySprite._bbox = this.displaySprite.getBBox();
                pad = this.dashSize + this.textLabelPadding;
                y -= (this.length / 2);
                if (position == 'left') {
                    x -= (maxWidth + pad + (bbox.height * 0.5) + (bbox.width / 2));
                }
                else {
                    x += (maxWidth + pad + (bbox.height * 0.5) - (bbox.width / 2));
                }    
                this.bbox.width += (bbox.height * 2);
                surface.remove(this.displaySprite);
                this.displaySprite = surface.add({
                    type: 'text',
                    font: this.displayFont,
                    x: x,
                    y: y,
                    rotate: {
                        degrees: 270
                    },
                    text: this.displayName
                });
                surface.renderItem(this.displaySprite);
            }
        }
        else {
            if (Ext.isString(this.displayName)) {
                if (!this.displaySprite) {
                    this.displaySprite = surface.add({
                        type: 'text',
                        font: this.displayFont,
                        x: 0,
                        y: 0,
                        text: this.displayName
                    });
                    surface.renderItem(this.displaySprite);
                }
                bbox = this.displaySprite._bbox = this.displaySprite.getBBox();
                pad = this.dashSize + this.textLabelPadding;
                x += (this.length / 2) - (bbox.width / 2);
                if (position == 'top') {
                    y -= (maxHeight + pad + (bbox.height * 0.3));
                }
                else {
                    y += (maxHeight + pad + (bbox.height * 0.8));
                }
                this.bbox.height += (bbox.height * 2);
                this.displaySprite.setAttributes({
                    x: x,
                    y: y
                }, true);
            }
        }
    },

    onAnimate: function(target, path) {
        var anim = new Ext.fx2.Anim({
            target: target,
            easing: 'ease-in-out',
            to: {
                path: path
            },
            duration: 500
        });
    },

    /**
     * The type of axis.
     *
     * @property type
     * @type String
     */
    type: null,

    /**
     * The direction in which the axis is drawn. May be "horizontal" or "vertical".
     *
     * @property position
     * @type String
     */
    position: "horizontal",

    /**
     * If true, the items on the axis will be drawn in opposite direction.
     *
     * @property reverse
     * @type Boolean
     */
    reverse: false,

    /**
     * A string reference to the globally-accessible function that may be called to
     * determine each of the label values for this axis.
     *
     * @property labelFunction
     * @type String
     */
    labelFunction: null,

    /**
     * If true, labels that overlap previously drawn labels on the axis will be hidden.
     *
     * @property hideOverlappingLabels
     * @type Boolean
     */
    hideOverlappingLabels: true,

    /**
     * The space, in pixels, between labels on an axis.
     *
     * @property labelSpacing
     * @type Number
     */
    labelSpacing: 2
});

/**
 * @class Ext.chart.NumericAxis
 * @extends Ext.chart.Axis
 * A type of axis whose units are measured in numeric values.
 * @constructor
 */
Ext.chart.NumericAxis = Ext.extend(Ext.chart.Axis, {
    type: "numeric",

    /**
     * The minimum value drawn by the axis. If not set explicitly, the axis
     * minimum will be calculated automatically.
     *
     * @property minimum
     * @type Number
     */
    minimum: NaN,

    /**
     * The maximum value drawn by the axis. If not set explicitly, the axis
     * maximum will be calculated automatically.
     *
     * @property maximum
     * @type Number
     */
    maximum: NaN,

    /**
     * The spacing between major intervals on this axis.
     *
     * @property majorUnit
     * @type Number
     */
    majorUnit: NaN,

    /**
     * The spacing between minor intervals on this axis.
     *
     * @property minorUnit
     * @type Number
     */
    minorUnit: NaN,

    /**
     * If true, the labels, ticks, gridlines, and other objects will snap to the
     * nearest major or minor unit. If false, their position will be based on
     * the minimum value.
     *
     * @property snapToUnits
     * @type Boolean
     */
    snapToUnits: true,

    /**
     * If true, and the bounds are calculated automatically, either the minimum
     * or maximum will be set to zero.
     *
     * @property alwaysShowZero
     * @type Boolean
     */
    alwaysShowZero: true,

    /**
     * The scaling algorithm to use on this axis. May be "linear" or
     * "logarithmic".
     *
     * @property scale
     * @type String
     */
    scale: "linear",

    /**
     * Indicates whether to round the major unit.
     *
     * @property roundMajorUnit
     * @type Boolean
     */
    roundMajorUnit: true,

    /**
     * Indicates whether to factor in the size of the labels when calculating a
     * major unit.
     *
     * @property calculateByLabelSize
     * @type Boolean
     */
    calculateByLabelSize: true,

    /**
     * Indicates the position of the axis relative to the chart
     *
     * @property position
     * @type String
     */
    position: 'left',

    /**
     * Indicates whether to extend maximum beyond data's maximum to the nearest
     * majorUnit.
     *
     * @property adjustMaximumByMajorUnit
     * @type Boolean
     */
    adjustMaximumByMajorUnit: true,

    /**
     * Indicates whether to extend the minimum beyond data's minimum to the
     * nearest majorUnit.
     *
     * @property adjustMinimumByMajorUnit
     * @type Boolean
     */
    adjustMinimumByMajorUnit: true,

    applyData: function() {
        Ext.chart.NumericAxis.superclass.applyData.call(this);
        return this.calcEnds();
    }

});

/**
 * @class Ext.chart.TimeAxis
 * @extends Ext.chart.Axis
 * A type of axis whose units are measured in time-based values.
 * @constructor
 */
Ext.chart.TimeAxis = Ext.extend(Ext.chart.Axis, {
    /**
     * The minimum value drawn by the axis. If not set explicitly, the axis
     * minimum will be calculated automatically.
     *
     * @property minimum
     * @type Date
     */
    minimum: null,

    /**
     * The maximum value drawn by the axis. If not set explicitly, the axis
     * maximum will be calculated automatically.
     *
     * @property maximum
     * @type Number
     */
    maximum: null,

    /**
     * The spacing between major intervals on this axis.
     *
     * @property majorUnit
     * @type Number
     */
    majorUnit: NaN,

    /**
     * The time unit used by the majorUnit.
     *
     * @property majorTimeUnit
     * @type String
     */
    majorTimeUnit: null,

    /**
     * The spacing between minor intervals on this axis.
     *
     * @property majorUnit
     * @type Number
     */
    minorUnit: NaN,

    /**
     * The time unit used by the minorUnit.
     *
     * @property majorTimeUnit
     * @type String
     */
    minorTimeUnit: null,

    /**
     * If true, the labels, ticks, gridlines, and other objects will snap to the
     * nearest major or minor unit. If false, their position will be based on
     * the minimum value.
     *
     * @property snapToUnits
     * @type Boolean
     */
    snapToUnits: true,

    /**
     * Series that are stackable will only stack when this value is set to true.
     *
     * @property stackingEnabled
     * @type Boolean
     */
    stackingEnabled: false,

    /**
     * Indicates whether to factor in the size of the labels when calculating a
     * major unit.
     *
     * @property calculateByLabelSize
     * @type Boolean
     */
    calculateByLabelSize: true

});

/**
 * @class Ext.chart.CategoryAxis
 * @extends Ext.chart.Axis
 * A type of axis that displays items in categories.
 * @constructor
 */
Ext.chart.CategoryAxis = Ext.extend(Ext.chart.Axis, {
    /**
     * A list of category names to display along this axis.
     *
     * @property categoryNames
     * @type Array
     */
    categoryNames: null,

    /**
     * Indicates whether or not to calculate the number of categories (ticks and
     * labels) when there is not enough room to display all labels on the axis.
     * If set to true, the axis will determine the number of categories to plot.
     * If not, all categories will be plotted.
     *
     * @property calculateCategoryCount
     * @type Boolean
     */
    calculateCategoryCount: false,

    setLabels: function() {
        var store = this.chart.store,
            fields = this.fields,
            ln = fields.length,
            i;

        this.labels = [];
        store.each(function(record) {
            for (i = 0; i < ln; i++) {
                this.labels.push(record.get(fields[i]));
            }
        }, this);
    },

    applyData: function() {
        Ext.chart.CategoryAxis.superclass.applyData.call(this);
        this.setLabels();
        var count = this.chart.store.getCount();
        return {
            from: 0,
            to: count,
            power: 1,
            step: 1,
            steps: count - 1
        };
    }

});