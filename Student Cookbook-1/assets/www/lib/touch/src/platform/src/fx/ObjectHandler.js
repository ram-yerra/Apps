 /**
 * @class Ext.fx2.propHandler.color
 * @singleton
 */

Ext.ns('Ext.fx2.propHandler');
Ext.fx2.propHandler.object = {

    interpolate: function(prop, damper) {
        damper = (typeof damper == 'number') ? damper : 1;
        var out = {};
        for(var p in prop) {
            out[p] = parseInt(prop[p], 10) * damper;
        }
        return out;
    },

    computeDelta: function(from, end, damper, initial) {
        from = this.interpolate(from);
        end = this.interpolate(end, damper);
        var start = initial ? initial : from,
            delta = {};
        
        for(var p in end) {
            delta[p] = end[p] - start[p];
        }
        return {
            from:  from,
            delta: delta
        };
    },

    get: function(start, end, damper, initialFrom) {
        var i,
            initial,
            ln = start.length,
            out = [];
        for (i = 0; i < ln; i++) {
            if (initialFrom) {
                initial = initialFrom[i][1].from;
            }
            out.push([start[i][0], this.computeDelta(start[i][1], end, damper, initial)]);
        }
        return out;
    },

    set: function(values, easing) {
        var i,
            ln = values.length,
            out = [],
            outObject = {},
            from, delta, val;
        for (i = 0; i < ln; i++) {
            val  = values[i][1];
            from = val.from;
            delta = val.delta;
            for(var p in from) {
                outObject[p] = from[p] + parseInt(delta[p] * easing, 10);
            }
            out.push([
                values[i][0],
                outObject
            ]);
        }
        return out;
    }
};
