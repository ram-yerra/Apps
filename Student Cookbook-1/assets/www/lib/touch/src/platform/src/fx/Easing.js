/**
 * Singleton that determines how an animation proceeds from start to end.
 * @class Ext.fx2.Easing
 * Easing is now calculated exclusively with the use of cubic-bezier curves and follows the
 * <a href="http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag">CSS3
 * specification for 'transition-timing-function'</a>.
 * <h2>Standard CSS3 Easing Values:</h2>
 * <div class="mdetail-params"><ul>
 * <li><b><tt>ease</tt></b>: The ease function is equivalent to cubic-bezier(0.25, 0.1, 0.25, 1.0).</li>
 * <li><b><tt>linear</tt></b>: The linear function is equivalent to cubic-bezier(0.0, 0.0, 1.0, 1.0).</li>
 * <li><b><tt>ease-in</tt></b>: The ease-in function is equivalent to cubic-bezier(0.42, 0, 1.0, 1.0).</li>
 * <li><b><tt>ease-out</tt></b>: The ease-out function is equivalent to cubic-bezier(0, 0, 0.58, 1.0).</li>
 * <li><b><tt>ease-in-out</tt></b>: The ease-in-out function is equivalent to cubic-bezier(0.42, 0, 0.58, 1.0)</li>
 * <li><b><tt>cubic-bezier</tt></b>: Specifies a cubic-bezier curve. The four values specify points P1 and P2 of
 * the curve as (x1, y1, x2, y2). All values must be in the range [0, 1] or the definition is invalid.</li>
 * </ul></div>
 * @singleton
 */
Ext.ns('Ext.fx2');
(function() {
    // port of webkit cubic bezier handling by http://www.netzgesta.de/dev/cubic-bezier-timing-function.html with some optimzations
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (Math.abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (Math.abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (Math.abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    Ext.fx2.cubicBezier = function(x1, y1, x2, y2) {
        var fn = function(pos) {
            return CubicBezierAtTime(pos, x1, y1, x2, y2, 1);
        };
        fn.toCSS3 = function() {
            return 'cubic-bezier(' + [x1, y1, x2, y2].join(',') + ')';
        };
        fn.reverse = function() {
            return Ext.fx2.cubicBezier(1 - x2, 1 - y2, 1 - x1, 1 - y1);
        };
        return fn;
    };
})();

Ext.fx2.Easing = {
    ease: Ext.fx2.cubicBezier(0.25, 0.1, 0.25, 1),

    linear: Ext.fx2.cubicBezier(0, 0, 1, 1),

    'ease-in': Ext.fx2.cubicBezier(0.42, 0, 1, 1),

    'ease-out': Ext.fx2.cubicBezier(0, 0.58, 1, 1),

    'ease-in-out': Ext.fx2.cubicBezier(0.42, 0, 0.58, 1)
};
/**
 * Singleton that holds configurations for PseudoEasing paths.
 * @class Ext.fx2.PseudoEasing
 * PseudoEasing combines multiple cubic-bezier curves and creates an Ext.fx.Animation to achieve more complex effects.
 * <h2>Extended Pseudo Easing Values:</h2>
 * <div class="mdetail-params"><ul>
 * <li><b><tt>back-in</tt></b></li>
 * <li><b><tt>back-out</tt></b></li>
 * <li><b><tt>bounce-in</tt></b></li>
 * <li><b><tt>bounce-out</tt></b></li>
 * <li><b><tt>elastic-in</tt></b></li>
 * <li><b><tt>elastic-out</tt></b></li>
 * </ul></div>
 * @singleton
 */
Ext.fx2.PseudoEasing = {
    'back-in': {
        isPseudoEasing: true,
        '40%': {
            easing: 'ease-in-out',
            damper: -0.1
        },
        '100%': {
            easing: 'ease-in',
            damper: 1.1
        }
    },
    'back-out': {
        isPseudoEasing: true,
        '60%': {
            easing: 'ease-out',
            damper: 1.1
        },
        '100%': {
            easing: 'ease-in-out',
            damper: -0.1
        }
    },
    'bounce-out': {
        isPseudoEasing: true,
        '36%': {
            easing: 'ease-in',
            damper: 1
        },
        '54%': {
            easing: 'ease-out',
            damper: -0.25
        },
        '72%': {
            easing: 'ease-in',
            damper: 0.25
        },
        '81%': {
            easing: 'ease-out',
            damper: -0.0625
        },
        '90%': {
            easing: 'ease-in',
            damper: 0.0625
        },
        '95%': {
            easing: 'ease-out',
            damper: -0.015
        },
        '100%': {
            easing: 'ease-in',
            damper: 0.015
        }
    },
    'bounce-in': {
        isPseudoEasing: true,
        '5%': {
            easing: 'ease-in',
            damper: 0.015
        },
        '10%': {
            easing: 'ease-out',
            damper: -0.015
        },
        '19%': {
            easing: 'ease-in',
            damper: 0.0625
        },
        '28%': {
            easing: 'ease-out',
            damper: -0.0625
        },
        '46%': {
            easing: 'ease-in',
            damper: 0.25
        },
        '64%': {
            easing: 'ease-out',
            damper: -0.25
        },
        '100%': {
            easing: 'ease-in',
            damper: 1
        }
    },
    'elastic-in': {
        isPseudoEasing: true,
        '14%': {
            easing: 'ease-in',
            damper: 0.005
        },
        '29%': {
            easing: 'ease-in-out',
            damper: -0.015
        },
        '43%': {
            easing: 'ease-in-out',
            damper: 0.025
        },
        '57%': {
            easing: 'ease-in-out',
            damper: -0.065
        },
        '71%': {
            easing: 'ease-in-out',
            damper: 0.19
        },
        '86%': {
            easing: 'ease-in-out',
            damper: -0.51
        },
        '100%': {
            easing: 'ease-out',
            damper: 1.37
        }
    },
    'elastic-out': {
        isPseudoEasing: true,
        '14%': {
            easing: 'ease-in',
            damper: 1.37
        },
        '29%': {
            easing: 'ease-in-out',
            damper: -0.51
        },
        '43%': {
            easing: 'ease-in-out',
            damper: 0.19
        },
        '57%': {
            easing: 'ease-in-out',
            damper: -0.065
        },
        '71%': {
            easing: 'ease-in-out',
            damper: 0.025
        },
        '86%': {
            easing: 'ease-in-out',
            damper: -0.015
        },
        '100%': {
            easing: 'ease-out',
            damper: 0.005
        }
    }
};