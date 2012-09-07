 /**
 * @class Ext.fx2.propHandler.defaultHandler
 * @singleton
 */

Ext.ns('Ext.fx2.propHandler');
Ext.fx2.propHandler.defaultHandler = {
    unitRE: /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/,

    computeDelta: function(from, end, damper, initial) {
        damper = (typeof damper == 'number') ? damper : 1;
        var match = this.unitRE.exec(from),
            start,
            units;
        if (match) {
            from = match[1];
            units = match[2];
        }
        from = +from || 0;

        match = this.unitRE.exec(end);
        if (match) {
            end = match[1];
            units = match[2] || units;
        }
        end = +end || 0;
        start = (initial != null) ? initial : from;
        return {
            from: from,
            delta: (end - start) * damper,
            units: units
        };
    },

    get: function(from, end, damper, initialFrom) {
        var i,
            initial,
            ln = from.length,
            out = [];
        for (i = 0; i < ln; i++) {
            if (initialFrom) {
                initial = initialFrom[i][1].from;
            }
            if (Ext.isArray(from[i][1]) && Ext.isArray(end)) {
                var res = [];
                for (var j = 0, len = from[i][1].length; j < len; j++) {
                    res.push(this.computeDelta(from[i][1][j], end[j], damper, initial));
                }
                out.push([from[i][0], res]);
            } else {
                out.push([from[i][0], this.computeDelta(from[i][1], end, damper, initial)]);
            }
        }
        return out;
    },

   set: function(values, easing) {
        var i,
            ln = values.length,
            out = [],
            val;
        for (i = 0; i < ln; i++) {
            val  = values[i][1];
            if (Ext.isArray(val)) {
                var res = [];
                for (var j = 0, len = val.length; j < len; j++) {
                    res.push(val[j].from + (val[j].delta * easing) + (val[j].units || 0));
                }
                out.push([values[i][0], res]);
            } else {
                out.push([values[i][0], val.from + (val.delta * easing) + (val.units || 0)]);
            }
        }
        return out;
    }
};
