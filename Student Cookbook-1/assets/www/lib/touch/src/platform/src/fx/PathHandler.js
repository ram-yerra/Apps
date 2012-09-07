Ext.ns('Ext.fx2.propHandler');

/**
 * @class Ext.fx2.propHandler.path
 * @singleton
 */
Ext.fx2.propHandler.path = {};
Ext.apply(Ext.fx2.propHandler.path, Ext.fx2.propHandler.defaultHandler);
Ext.apply(Ext.fx2.propHandler.path, {

    forcePath: function(path) {
        if (!Ext.isArray(path) && !Ext.isArray(path[0])) {
            path = Ext.draw.parsePathString(path);
        }
        return path;
    },

    get: function(start, end) {
        var i,
            j,
            k,
            path,
            startPath,
            endPath = this.forcePath(end),
            deltaPath,
            out = [],
            startLn = start.length,
            startPathLn,
            pointsLn;
        for (i = 0; i < startLn; i++) {
            startPath = this.forcePath(start[i][1]);

            deltaPath = Ext.draw.path2curve(startPath, endPath);
            startPath = deltaPath[0];
            endPath = deltaPath[1];

            startPathLn = startPath.length;
            path = [];
            for (j = 0; j < startPathLn; j++) {
                deltaPath = [startPath[j][0]];
                pointsLn = startPath[j].length;
                for (k = 1; k < pointsLn; k++) {
                    deltaPath.push(this.computeDelta(startPath[j][k], endPath[j][k]));
                }
                path.push(deltaPath);
            }    
            out.push([start[i][0], path]);
        }
        return out;
    },

    set: function(values, easing) {
        var i,
            j,
            k,
            newPath,
            calcPath,
            deltaPath,
            deltaPathLn,
            pointsLn,
            ln = values.length,
            out = [];
        for (i = 0; i < ln; i++) {
            deltaPath = values[i][1];
            newPath = [];
            deltaPathLn = deltaPath.length;
            for (j = 0; j < deltaPathLn; j++) {
                calcPath = [deltaPath[j][0]];
                pointsLn = deltaPath[j].length;
                for (k = 1; k < pointsLn; k++) {
                    calcPath.push(deltaPath[j][k].from + (deltaPath[j][k].delta * easing));
                }
                newPath.push(calcPath.join(','));
            }
            out.push([values[i][0], newPath.join(',')]);
        }
        return out;
    }
});