 /**
 * @class Ext.fx2.propHandler.color
 * @singleton
 */

Ext.ns('Ext.fx2.propHandler');
Ext.fx2.propHandler.color = {
    rgbRE: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    hexRE: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
    hex3RE: /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i,

    parseColor : function(color, damper) {
        damper = (typeof damper == 'number') ? damper : 1;
        var base,
            out = false,
            match;

        Ext.each([this.hexRE, this.rgbRE, this.hex3RE], function(re, idx) {
            base = (idx % 2 == 0) ? 16 : 10;
            match = re.exec(color);
            if(match && match.length == 4){
                if (idx == 2) {
                    match[1] += match[1];
                    match[2] += match[2];
                    match[3] += match[3];
                }
                out = {
                    red: parseInt(parseInt(match[1], base) * damper, 10),
                    green: parseInt(parseInt(match[2], base) * damper, 10),
                    blue: parseInt(parseInt(match[3], base) * damper, 10)
                };
                return false;
            }
        });
        return out || color;
    },

    computeDelta: function(from, end, damper, initial) {
        from = this.parseColor(from);
        end = this.parseColor(end, damper);
        var start = initial ? initial : from,
            tfrom = typeof start,
            tend = typeof end;
        //Extra check for when the color string is not recognized.
        if (tfrom == 'string' ||  tfrom == 'undefined' 
          || tend == 'string' || tend == 'undefined') {
            return end || start;
        }
        return {
            from:  from,
            delta: {
                red: end.red - start.red,
                green: end.green - start.green,
                blue: end.blue - start.blue
            }
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
            val,
            parsedString;
        for (i = 0; i < ln; i++) {
            val = values[i][1];
            //multiple checks to reformat the color if it can't recognized by computeDelta.
            val = (typeof val == 'object' && 'red' in val)? 
                    'rgb(' + val.red + ', ' + val.green + ', ' + val.blue + ')' : val;
            val = (typeof val == 'object' && val.length)? val[0] : val;
            if(typeof val == 'undefined') {
                return [];
            }
            parsedString = typeof val == 'string'? val :
                'rgb(' + [
                      val.from.red + parseInt(val.delta.red * easing, 10),
                      val.from.green + parseInt(val.delta.green * easing, 10),
                      val.from.blue + parseInt(val.delta.blue * easing, 10)
                  ].join(',') + ')';
            out.push([
                values[i][0],
                parsedString
            ]);
        }
        return out;
    }
};

// Color properties as defined by the CSS3 transition spec
Ext.each([
    'outlineColor',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor', 
    'borderBottomColor', 
    'borderLeftColor',
    'fill',
    'stroke'
], function(prop) {
    Ext.fx2.propHandler[prop] = Ext.fx2.propHandler.color;
});