Ext.ns('Ext.draw');
/*
 * @class Ext.draw.Draw
 * @extends Object
 *<p>Base Drawing class.  Provides base drawing functions.
 */

Ext.draw.cacher = function(f, scope, postprocessor) {
    function newf() {
        var arg = Array.prototype.slice.call(arguments, 0),
            // spriteitive caching as a string. Beware, doesn’t work for objects.
            args = arg.join("\u25ba"),
            cache = newf.cache = newf.cache || {},
            count = newf.count = newf.count || [];
        if (cache.hasOwnProperty(args)) {
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        count.length >= 1e3 && delete cache[count.shift()];
        count.push(args);
        cache[args] = f.apply(scope, arg);
        return postprocessor ? postprocessor(cache[args]) : cache[args];
    }
    return newf;
};

Ext.draw = Ext.apply({}, {
    pathToStringRE: /,?([achlmqrstvxz]),?/gi,
    pathCommandRE: /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
    pathValuesRE: /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
    isnanRE: /^(?:NaN|-?Infinity)$/,
    stopsRE: /^(\d+%?)$/,
    radian: Math.PI / 180,

    availableAnimAttrs: {
        along: "along",
        blur: null,
        "clip-rect": "csv",
        cx: null,
        cy: null,
        fill: "colour",
        "fill-opacity": null,
        "font-size": null,
        height: null,
        opacity: null,
        path: "path",
        r: null,
        rotation: "csv",
        rx: null,
        ry: null,
        scale: "csv",
        stroke: "colour",
        "stroke-opacity": null,
        "stroke-width": null,
        translation: "csv",
        width: null,
        x: null,
        y: null
    },

    is: function(o, type) {
        type = String(type).toLowerCase();
        return (type == "object" && o === Object(o)) ||
            (type == "undefined" && typeof o == type) ||
            (type == "null" && o == null) ||
            (type == "array" && Array.isArray && Array.isArray(o)) ||
            (Object.prototype.toString.call(o).toLowerCase().slice(8, -1)) == type;
    },

    isNumeric: function (num) {
        return !this.isnanRE.test(+num);
    },

    ellipsePath: function(sprite) {
        var attr = sprite.attr;
        return Ext.util.Format.format("M{0},{1}A{2},{3},0,1,1,{0},{4}A{2},{3},0,1,1,{0},{1}z", attr.x, attr.y - attr.radiusY, attr.radiusX, attr.radiusY, attr.y + attr.radiusY);
    },

    rectPath: function(sprite) {
        var attr = sprite.attr;
        if (attr.radius) {
            return Ext.util.Format.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", attr.x + attr.radius, attr.y, attr.width - attr.radius * 2, attr.radius, -attr.radius, attr.height - attr.radius * 2, attr.radius * 2 - attr.width, attr.radius * 2 - attr.height);
        }
        else {
            return Ext.util.Format.format("M{0},{1}l{2},0,0,{3},{4},0z", attr.x, attr.y, attr.width, attr.height, -attr.width);
        }
    },

    path2string: function () {
        return this.join(",").replace(Ext.draw.pathToStringRE, "$1");
    },

    parsePathString: Ext.draw.cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (Ext.draw.is(pathString, "array") && Ext.draw.is(pathString[0], "array")) { // rough assumption
            data = Ext.draw.pathClone(pathString);
        }
        if (!data.length) {
            String(pathString).replace(Ext.draw.pathCommandRE, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(Ext.draw.pathValuesRE, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b].concat(params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params.length >= paramCounts[name]) {
                    data.push([b].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = Ext.draw.path2string;
        return data;
    }),

    pathClone: function(pathArray) {
        var res = [],
            j,
            jj,
            i,
            ii;
        if (!this.is(pathArray, "array") || !this.is(pathArray && pathArray[0], "array")) { // rough assumption
            pathArray = this.parsePathString(pathArray);
        }
        for (i = 0, ii = pathArray.length; i < ii; i++) {
            res[i] = [];
            for (j = 0, jj = pathArray[i].length; j < jj; j++) {
                res[i][j] = pathArray[i][j];
            }
        }
        res.toString = this.path2string;
        return res;
    },

    pathToAbsolute: Ext.draw.cacher(function (pathArray) {
        if (!Ext.draw.is(pathArray, "array") || !Ext.draw.is(pathArray && pathArray[0], "array")) { // rough assumption
            pathArray = Ext.draw.parsePathString(pathArray);
        }
        var res = [],
            x = 0,
            y = 0,
            mx = 0,
            my = 0,
            start = 0,
            i,
            ii,
            r,
            pa,
            j,
            jj,
            k,
            kk;
        if (pathArray[0][0] == "M") {
            x = +pathArray[0][1];
            y = +pathArray[0][2];
            mx = x;
            my = y;
            start++;
            res[0] = ["M", x, y];
        }
        for (i = start, ii = pathArray.length; i < ii; i++) {
            r = res[i] = [];
            pa = pathArray[i];
            if (pa[0] != pa[0].toUpperCase()) {
                r[0] = pa[0].toUpperCase();
                switch (r[0]) {
                    case "A":
                        r[1] = pa[1];
                        r[2] = pa[2];
                        r[3] = pa[3];
                        r[4] = pa[4];
                        r[5] = pa[5];
                        r[6] = +(pa[6] + x);
                        r[7] = +(pa[7] + y);
                        break;
                    case "V":
                        r[1] = +pa[1] + y;
                        break;
                    case "H":
                        r[1] = +pa[1] + x;
                        break;
                    case "M":
                        mx = +pa[1] + x;
                        my = +pa[2] + y;
                    default:
                        for (j = 1, jj = pa.length; j < jj; j++) {
                            r[j] = +pa[j] + ((j % 2) ? x : y);
                        }
                }
            } else {
                for (k = 0, kk = pa.length; k < kk; k++) {
                    res[i][k] = pa[k];
                }
            }
            switch (r[0]) {
                case "Z":
                    x = mx;
                    y = my;
                    break;
                case "H":
                    x = r[1];
                    break;
                case "V":
                    y = r[1];
                    break;
                case "M":
                    mx = res[i][res[i].length - 2];
                    my = res[i][res[i].length - 1];
                default:
                    x = res[i][res[i].length - 2];
                    y = res[i][res[i].length - 1];
            }
        }
        res.toString = Ext.draw.path2string;
        return res;
    }, null, Ext.draw.pathClone),

    pathToRelative: function (pathArray) {
        if (!Ext.draw.is(pathArray, "array") || !Ext.draw.is(pathArray && pathArray[0], "array")) {
            pathArray = Ext.draw.parsePathString(pathArray);
        }
        var res = [],
            x = 0,
            y = 0,
            mx = 0,
            my = 0,
            start = 0;
        if (pathArray[0][0] == "M") {
            x = pathArray[0][1];
            y = pathArray[0][2];
            mx = x;
            my = y;
            start++;
            res.push(["M", x, y]);
        }
        for (var i = start, ii = pathArray.length; i < ii; i++) {
            var r = res[i] = [],
                pa = pathArray[i];
            if (pa[0] != pa[0].toLowerCase()) {
                r[0] = pa[0].toLowerCase();
                switch (r[0]) {
                    case "a":
                        r[1] = pa[1];
                        r[2] = pa[2];
                        r[3] = pa[3];
                        r[4] = pa[4];
                        r[5] = pa[5];
                        r[6] = +(pa[6] - x).toFixed(3);
                        r[7] = +(pa[7] - y).toFixed(3);
                        break;
                    case "v":
                        r[1] = +(pa[1] - y).toFixed(3);
                        break;
                    case "m":
                        mx = pa[1];
                        my = pa[2];
                    default:
                        for (var j = 1, jj = pa.length; j < jj; j++) {
                            r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                        }
                }
            } else {
                r = res[i] = [];
                if (pa[0] == "m") {
                    mx = pa[1] + x;
                    my = pa[2] + y;
                }
                for (var k = 0, kk = pa.length; k < kk; k++) {
                    res[i][k] = pa[k];
                }
            }
            var len = res[i].length;
            switch (res[i][0]) {
                case "z":
                    x = mx;
                    y = my;
                    break;
                case "h":
                    x += +res[i][len - 1];
                    break;
                case "v":
                    y += +res[i][len - 1];
                    break;
                default:
                    x += +res[i][len - 2];
                    y += +res[i][len - 1];
            }
        }
        res.toString = Ext.draw.path2string;
        return res;
    },

    path2curve: Ext.draw.cacher(function (path, path2) {
        var p = Ext.draw.pathToAbsolute(path),
            p2 = path2 && Ext.draw.pathToAbsolute(path2),
            attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            processPath = function (path, d) {
                var nx, ny;
                if (!path) {
                    return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                }
                !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                switch (path[0]) {
                    case "M":
                        d.X = path[1];
                        d.Y = path[2];
                        break;
                    case "A":
                        path = ["C"].concat(Ext.draw.a2c.apply(this, [d.x, d.y].concat(path.slice(1))));
                        break;
                    case "S":
                        nx = d.x + (d.x - (d.bx || d.x));
                        ny = d.y + (d.y - (d.by || d.y));
                        path = ["C", nx, ny].concat(path.slice(1));
                        break;
                    case "T":
                        d.qx = d.x + (d.x - (d.qx || d.x));
                        d.qy = d.y + (d.y - (d.qy || d.y));
                        path = ["C"].concat(Ext.draw.q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                        break;
                    case "Q":
                        d.qx = path[1];
                        d.qy = path[2];
                        path = ["C"].concat(Ext.draw.q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                        break;
                    case "L":
                        path = ["C"].concat(Ext.draw.l2c(d.x, d.y, path[1], path[2]));
                        break;
                    case "H":
                        path = ["C"].concat(Ext.draw.l2c(d.x, d.y, path[1], d.y));
                        break;
                    case "V":
                        path = ["C"].concat(Ext.draw.l2c(d.x, d.y, d.x, path[1]));
                        break;
                    case "Z":
                        path = ["C"].concat(Ext.draw.l2c(d.x, d.y, d.X, d.Y));
                        break;
                }
                return path;
            },
            fixArc = function (pp, i) {
                if (pp[i].length > 7) {
                    pp[i].shift();
                    var pi = pp[i];
                    while (pi.length) {
                        pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
                    }
                    pp.splice(i, 1);
                    ii = Math.max(p.length, p2 && p2.length || 0);
                }
            },
            fixM = function (path1, path2, a1, a2, i) {
                if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                    path2.splice(i, 0, ["M", a2.x, a2.y]);
                    a1.bx = 0;
                    a1.by = 0;
                    a1.x = path1[i][1];
                    a1.y = path1[i][2];
                    ii = Math.max(p.length, p2 && p2.length || 0);
                }
            };
        for (var i = 0, ii = Math.max(p.length, p2 && p2.length || 0); i < ii; i++) {
            p[i] = processPath(p[i], attrs);
            fixArc(p, i);
            p2 && (p2[i] = processPath(p2[i], attrs2));
            p2 && fixArc(p2, i);
            fixM(p, p2, attrs, attrs2, i);
            fixM(p2, p, attrs2, attrs, i);
            var seg = p[i],
                seg2 = p2 && p2[i],
                seglen = seg.length,
                seg2len = p2 && seg2.length;
            attrs.x = seg[seglen - 2];
            attrs.y = seg[seglen - 1];
            attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
            attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
            attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
            attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
            attrs2.x = p2 && seg2[seg2len - 2];
            attrs2.y = p2 && seg2[seg2len - 1];
        }
        return p2 ? [p, p2] : p;
    }, null, Ext.draw.pathClone),
    
    l2c: function (x1, y1, x2, y2) {
        return [x1, y1, x2, y2, x2, y2];
    },

    q2c: function (x1, y1, ax, ay, x2, y2) {
        var _13 = 1 / 3,
            _23 = 2 / 3;
        return [
                _13 * x1 + _23 * ax,
                _13 * y1 + _23 * ay,
                _13 * x2 + _23 * ax,
                _13 * y2 + _23 * ay,
                x2,
                y2
            ];
    },
    
    rotate: Ext.draw.cacher(function (x, y, rad) {
        var X = x * Math.cos(rad) - y * Math.sin(rad),
            Y = x * Math.sin(rad) + y * Math.cos(rad);
        return {x: X, y: Y};
    }),

    a2c: function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // for more information of where this Math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var PI = Math.PI,
            radian = Ext.draw.radian,
            _120 = PI * 120 / 180,
            rad = radian * (+angle || 0),
            res = [],
            xy;
        if (!recursive) {
            xy = Ext.draw.rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = Ext.draw.rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            var cos = Math.cos(radian * angle),
                sin = Math.sin(radian * angle),
                x = (x1 - x2) / 2,
                y = (y1 - y2) / 2;
            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if (h > 1) {
                h = Math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            var rx2 = rx * rx,
                ry2 = ry * ry,
                k = (large_arc_flag == sweep_flag ? -1 : 1) *
                    Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                cx = k * rx * y / ry + (x1 + x2) / 2,
                cy = k * -ry * x / rx + (y1 + y2) / 2,
                f1 = Math.asin(((y1 - cy) / ry).toFixed(7)),
                f2 = Math.asin(((y2 - cy) / ry).toFixed(7));

            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2;
            f1 < 0 && (f1 = PI * 2 + f1);
            f2 < 0 && (f2 = PI * 2 + f2);
            if (sweep_flag && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if (!sweep_flag && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        var df = f2 - f1;
        if (Math.abs(df) > _120) {
            var f2old = f2,
                x2old = x2,
                y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * Math.cos(f2);
            y2 = cy + ry * Math.sin(f2);
            res = Ext.draw.a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = Math.cos(f1),
            s1 = Math.sin(f1),
            c2 = Math.cos(f2),
            s2 = Math.sin(f2),
            t = Math.tan(df / 4),
            hx = 4 / 3 * rx * t,
            hy = 4 / 3 * ry * t,
            m1 = [x1, y1],
            m2 = [x1 + hx * s1, y1 - hy * c1],
            m3 = [x2 + hx * s2, y2 - hy * c2],
            m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [m2, m3, m4].concat(res);
        } else {
            res = [m2, m3, m4].concat(res).join().split(",");
            var newres = [];
            for (var i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? Ext.draw.rotate(res[i - 1], res[i], rad).y : Ext.draw.rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    },
    
    rotatePoint: function (x, y, alpha, cx, cy) {
        if (!alpha) {
            return {
                x: x,
                y: y
            };
        }
        cx = cx || 0;
        cy = cy || 0;
        x = x - cx;
        y = y - cy;
        alpha = alpha * Ext.draw.radian;
        var cos = Math.cos(alpha),
            sin = Math.sin(alpha);
        return {
            x: x * cos - y * sin + cx,
            y: x * sin + y * cos + cy
        };
    },

    rotateAndTranslatePath: function (sprite) {
        var alpha = sprite.rotation.degrees,
            cx = sprite.rotation.x,
            cy = sprite.rotation.y,
            dx = sprite.translation.x,
            dy = sprite.translation.y,
            path,
            i,
            p,
            xy,
            j,
            res = [];
        if (!alpha && !dx && !dy) {
            return sprite.attr.path;
        }
        dx = dx || 0;
        dy = dy || 0;
        path = this.pathToAbsolute(sprite.attr.path);
        for (i = path.length; i--;) {
            p = res[i] = path[i].slice();
            if (p[0] == "A") {
                xy = this.rotatePoint(p[6], p[7], alpha, cx, cy);
                p[6] = xy.x + dx;
                p[7] = xy.y + dy;
            } else {
                j = 1;
                while (p[j + 1] != null) {
                    xy = this.rotatePoint(p[j], p[j + 1], alpha, cx, cy);
                    p[j] = xy.x + dx;
                    p[j + 1] = xy.y + dy;
                    j += 2;
                }
            }
        }
        return res;
    },
    
    pathDimensions: Ext.draw.cacher(function (path) {
        if (!path || !(path + "")) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = Ext.draw.path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p,
            i,
            ii,
            xmin,
            ymin,
            dim;
        for (i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            }
            else {
                dim = Ext.draw.curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X.concat(dim.min.x, dim.max.x);
                Y = Y.concat(dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        xmin = Math.min.apply(0, X);
        ymin = Math.min.apply(0, Y);
        return {
            x: xmin,
            y: ymin,
            width: Math.max.apply(0, X) - xmin,
            height: Math.max.apply(0, Y) - ymin
        };
    }),
    
    curveDim: Ext.draw.cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
            b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
            c = p1x - c1x,
            t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a,
            t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a,
            y = [p1y, p2y],
            x = [p1x, p2x],
            dot;
        Math.abs(t1) > 1e12 && (t1 = 0.5);
        Math.abs(t2) > 1e12 && (t2 = 0.5);
        if (t1 > 0 && t1 < 1) {
            dot = Ext.draw.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
            x.push(dot.x);
            y.push(dot.y);
        }
        if (t2 > 0 && t2 < 1) {
            dot = Ext.draw.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
            x.push(dot.x);
            y.push(dot.y);
        }
        a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
        b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
        c = p1y - c1y;
        t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
        t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
        Math.abs(t1) > 1e12 && (t1 = 0.5);
        Math.abs(t2) > 1e12 && (t2 = 0.5);
        if (t1 > 0 && t1 < 1) {
            dot = Ext.draw.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
            x.push(dot.x);
            y.push(dot.y);
        }
        if (t2 > 0 && t2 < 1) {
            dot = Ext.draw.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
            x.push(dot.x);
            y.push(dot.y);
        }
        return {
            min: {x: Math.min.apply(0, x), y: Math.min.apply(0, y)},
            max: {x: Math.max.apply(0, x), y: Math.max.apply(0, y)}
        };
    }),

    getAnchors: function (p1x, p1y, p2x, p2y, p3x, p3y, value) {
        value = value || 4;
        var l = Math.min(Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2)) / value, Math.sqrt(Math.pow(p3x - p2x, 2) + Math.pow(p3y - p2y, 2)) / value),
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y)),
            pi = Math.PI;
        a = p1y < p2y ? pi - a : a;
        b = p3y < p2y ? pi - b : b;
        var alpha = pi / 2 - ((a + b) % (pi * 2)) / 2;
        alpha > pi / 2 && (alpha -= pi);
        var dx1 = l * Math.sin(alpha + a),
            dy1 = l * Math.cos(alpha + a),
            dx2 = l * Math.sin(alpha + b),
            dy2 = l * Math.cos(alpha + b),
            out = {
                x1: p2x - dx1,
                y1: p2y + dy1,
                x2: p2x + dx2,
                y2: p2y + dy2
            };
        return out;
    },

    smooth: function (originalPath, value) {
        var path = this.path2curve(originalPath),
            newp = [path[0]],
            x = path[0][1],
            y = path[0][2],
            j,
            points,
            i = 1,
            ii = path.length,
            beg = 1,
            mx = x,
            my = y,
            cx = 0,
            cy = 0;
        for (; i < ii; i++) {
            var pathi = path[i],
                pathil = pathi.length,
                pathim = path[i - 1],
                pathiml = pathim.length,
                pathip = path[i + 1],
                pathipl = pathip && pathip.length;
            if (pathi[0] == "M") {
                mx = pathi[1];
                my = pathi[2];
                j = i + 1;
                while (path[j][0] != "C") {
                    j++;
                }
                cx = path[j][5];
                cy = path[j][6];
                newp.push(["M", mx, my]);
                beg = newp.length;
                x = mx;
                y = my;
                continue;
            }
            if (pathi[pathil - 2] == mx && pathi[pathil - 1] == my && (!pathip || pathip[0] == "M")) {
                var begl = newp[beg].length;
                points = this.getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], mx, my, newp[beg][begl - 2], newp[beg][begl - 1], value);
                newp[beg][1] = points.x2;
                newp[beg][2] = points.y2;
            }
            else if (!pathip || pathip[0] == "M") {
                points = {
                    x1: pathi[pathil - 2],
                    y1: pathi[pathil - 1]
                };
            } else {
                points = this.getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], pathi[pathil - 2], pathi[pathil - 1], pathip[pathipl - 2], pathip[pathipl - 1], value);
            }
            newp.push(["C", x, y, points.x1, points.y1, pathi[pathil - 2], pathi[pathil - 1]]);
            x = points.x2;
            y = points.y2;
        }
        return newp;
    },

    findDotAtSegment: function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t;
        return {
            x: Math.pow(t1, 3) * p1x + Math.pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + Math.pow(t, 3) * p2x,
            y: Math.pow(t1, 3) * p1y + Math.pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + Math.pow(t, 3) * p2y
        };
    },

    snapEnds: function (from, to, stepsMax) {
        var step = (to - from) / stepsMax,
            // TODO
            level = Math.floor(Math.log(step) / Math.LN10) + 1,
            m = Math.pow(10, level),
            cur = from = Math.floor(from / m) * m,
            modulo = Math.round((step % m) * Math.pow(10, 2 - level)),
            interval = ["0:15", "20:4", "30:2", "40:4", "50:9", "60:4", "70:2", "80:4", "100:15"],
            steps = [],
            stepCount = 0,
            value,
            weight,
            i,
            ln = interval.length;
        for (i = 0; i < ln; i++) {
            value = interval[i].split(":");
            weight = value[1];
            value = value[0];
            steps[i] = {a: value, b: ((value - modulo) < 0 ? Infinity : (value - modulo) / weight)};
        }
        steps = steps.sort(
            function (a, b) {
                // IE 6/7 Don't like Infinity - Infinity...
                if (a.b == Infinity && b.b == Infinity) {
                    return false;
                }
                else {
                    return a.b - b.b;
                }
            })[0].a;
        steps = Math.floor(step * Math.pow(10, -level)) * Math.pow(10, level) + steps * Math.pow(10, level - 2);
        while (cur < to) {
            cur += steps;
            stepCount++;
        }
        to = +cur.toFixed(10);
        return {
            from: from,
            to: to,
            power: level,
            step: steps,
            steps: stepCount
        };
    },

    sorter: function (a, b) {
        return a.offset - b.offset;
    },

    parseGradient: function(gradient) {
        var draw = Ext.draw,
            type = gradient.type || 'linear',
            angle = gradient.angle || 0,
            radian = draw.radian,
            stops = gradient.stops,
            stopsArr = [],
            stop,
            vector,
            max,
            stopObj;

        if (type == 'linear') {
            vector = [0, 0, Math.cos(angle * radian), Math.sin(angle * radian)];
            max = 1 / (Math.max(Math.abs(vector[2]), Math.abs(vector[3])) || 1);
            vector[2] *= max;
            vector[3] *= max;
            if (vector[2] < 0) {
                vector[0] = -vector[2];
                vector[2] = 0;
            }
            if (vector[3] < 0) {
                vector[1] = -vector[3];
                vector[3] = 0;
            }
        }

        for (stop in stops) {
            if (stops.hasOwnProperty(stop) && draw.stopsRE.test(stop)) {
                stopObj = {
                    offset: parseInt(stop, 10),
                    color: stops[stop].color || '#fff',
                    opacity: stops[stop].opacity || 1
                };
                stopsArr.push(stopObj);
            }
        }
        // Sort by pct property
        stopsArr.sort(draw.sorter);
        if (type == 'linear') {
            return {
                id: gradient.id,
                type: type,
                vector: vector,
                stops: stopsArr
            };
        }
        else {
            return {
                id: gradient.id,
                type: type,
                centerX: gradient.centerX,
                centerY: gradient.centerY,
                focalX: gradient.focalX,
                focalY: gradient.focalY,
                radius: gradient.radius,
                vector: vector,
                stops: stopsArr
            };
        }
    }
});