/**
* @class Ext.fx2.propHandler.transform
* @singleton
*/

Ext.ns('Ext.fx2.propHandler');

Ext.fx2.propHandler.rotate = {};
Ext.apply(Ext.fx2.propHandler.rotate, Ext.fx2.propHandler.defaultHandler);
Ext.apply(Ext.fx2.propHandler.rotate, {
    get: function(start, end, damper) {
        var i,
            ln = start.length,
            prop,
            val,
            o,
            out = [];
        for (i = 0; i < ln; i++) {    
            o = {};
            val = start[i];
            for (prop in val[1]) {
                o[prop] = [ val[0], this.computeDelta(val[1][prop], end[prop], damper) ];
            }
            out.push(o);
        }
        return out;
    },

    set: function(values, easing) {
        var ln = values.length,
            i,
            val,
            prop,
            o,
            out = [];
        for (i = 0; i < ln; i++) {    
            o = {};
            val  = values[i];
            for (prop in val) {
                o[prop] = [ val[prop][0], val[prop][1].from + (val[prop][1].delta * easing) ];
            }
            out.push(o);
        }
        return out;
    }
});

Ext.fx2.propHandler.translate = Ext.fx2.propHandler.rotate;