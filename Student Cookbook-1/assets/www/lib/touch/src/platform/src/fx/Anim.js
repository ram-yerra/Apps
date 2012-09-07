/**
 * @class Ext.fx2.Anim
 * @extends Ext.util.Observable
 * Animation instance...
 */
Ext.ns('Ext.fx2');
Ext.fx2.Anim = Ext.extend(Ext.util.Observable, {
    isAnimation: true,
    /**
     * @cfg {Number} duration
     * Time in milliseconds for the animation to last. Defaults to 250.
     */
    duration: 250,

    /**
     * @cfg {Number} delay
     * Time to delay before starting the animation. Defaults to 0.
     */
    delay: 0,

    /**
     * @cfg {String} easing
     * <p>A valid Ext.fx.Easing or Ext.fx.EasingPseudo value for the effect.
     * Easing is now calculated exclusively with the use of cubic-bezier curves and follows the
     * <a href="http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag">CSS3
     * specification for 'transition-timing-function'</a>. Defaults to ease</p>
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
     */
    easing: 'ease',

    /**
     * @private
     */
    damper: 1,

    /**
     * @private
     */
    bezierRE: /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,

    /**
     * @cfg {Boolean} reverse
     * Run the animation from the end to the beginning
     * Defaults to false.
     */
    reverse: false,

    /**
     * Flag to determine if the animation has started
     * @property running
     * @type boolean
     */
    running: false,

    /**
     * Flag to determine if the animation is paused. Only set this to true if you need to
     * keep the Anim instance around to be unpaused later; otherwise call {@link #end}.
     * @property paused
     * @type boolean
     */
    paused: false,

    /**
     * @cfg {int} iterations
     * Number of times to execute the animation. Defaults to 1.
     */
    iterations: 1,

    alternate: false,

    /**
     * Current iteration the animation is running.
     * @property currentIteration
     * @type int
     */
    currentIteration: 0,

    /**
     * Starting time of the animation.
     * @property startTime
     * @type Date
     */
    startTime: 0,

    /**
     * Elapsed time of the animation.
     * @property elapsedTime
     * @type Date
     */
    elapsedTime: 0,
    
    /**
     * Contains a cache of the interpolators to be used.
     * @property propHandlers
     * @type Object
     */
    propHandlers: {},

    /**
     * @cfg {string/object} target
     * The Ext.fx2.target to apply the animation to.
     */

    /**
     * @cfg {Object} from
     * An object containing property/value pairs for the beginning of the animation.  If not specified, the current state of the
     * Ext.fx.target will be used. For example:
<pre><code>
from : {
    opactiy: 0,       // Transparent
    color: '#ffffff', // White
    left: 0
}
</code></pre>
     */

    /**
     * @cfg {Object} to
     * An object containing property/value pairs for the end of the animation. For example:
 <pre><code>
 to : {
     opactiy: 1,       // Opaque
     color: '#00ff00', // Green
     left: 500
 }
 </code></pre>
     */

    // @private
    constructor: function(config) {
        // If keyframes are passed, they really want an Animator instead.
        if (config.keyframes) {
            return new Ext.fx2.Animator(config);
        }
        // Create a PseudoEasing Animation if the easing property matches
        if (Ext.fx2.PseudoEasing[config.easing]) {
            // OOgly, clean me up.
            return new Ext.fx2.Animator(Ext.apply(config, {
                keyframes: Ext.decode(Ext.encode(Ext.fx2.PseudoEasing[config.easing]))
            }));
        }
        config = Ext.apply(this, config);
        if (this.from == undefined) {
            this.from = {};
        }
        this.config = config;
        this.target = Ext.fx2.Manager.createTarget(this.target);
        this.easingFn = Ext.fx2.Easing[this.easing];

        // If not a pre-defined curve, try a cubic-bezier
        if (!this.easingFn) {
            this.easingFn = String(this.easing).match(this.bezierRE);
            if (this.easingFn && this.easingFn.length == 5) {
                var curve = this.easingFn;
                this.easingFn = Ext.fx2.cubicBezier(+curve[1], +curve[2], +curve[3], +curve[4]);
            }
        }
        this.id = Ext.id(null, 'ext-anim-');
        Ext.fx2.Manager.addAnim(this);
        this.addEvents(
            /**
             * @event beforeanimate
             * Fires before the animation starts. A handler can return false to cancel the animation.
             * @param {Ext.fx2.Anim} this
             */
            'beforeanimate',
             /**
              * @event afteranimate
              * Fires when the animation is complete.
              * @param {Ext.fx2.Anim} this
              * @param {Date} startTime
              * @param {Date} ellapsedTime
              */
            'afteranimate'
        );
        Ext.fx2.Anim.superclass.constructor.call(this);
        return this;
    },

    /**
     * @private
     * Helper to the target
     */
    setAttr: function(attr, value) {
        return Ext.fx2.Manager.items.get(this.id).setAttr(this.target, attr, value);
    },

    /*
     * @private
     * Set up the initial currentAttrs hash.
     */
    initAttrs: function() {
        var from = this.from,
            to = this.to,
            initialFrom = this.initialFrom || {},
            out = {},
            start,
            end,
            propHandler,
            attr;

        for (attr in to) {
            if (to.hasOwnProperty(attr)) {
                start = this.target.getAttr(attr, from[attr]);
                end = to[attr];
                // Use default (numeric) property handler
                if (!Ext.fx2.propHandler[attr]) {
                    if (Ext.isObject(end)) {
                        propHandler = this.propHandlers[attr] = Ext.fx2.propHandler.object;
                    } else {
                        propHandler = this.propHandlers[attr] = Ext.fx2.propHandler.defaultHandler;
                    }
                }
                // Use custom handler
                else {
                    propHandler = this.propHandlers[attr] = Ext.fx2.propHandler[attr];
                }
                out[attr] = propHandler.get(start, end, this.damper, initialFrom[attr]);
            }
        }
        this.currentAttrs = out;
    },

    /*
     * @private
     * Fires beforeanimate and sets the running flag.
     */
    start: function(startTime) {
        if (this.fireEvent('beforeanimate', this) !== false) {
            this.startTime = startTime - this.elapsedTime;
            if (!this.paused && !this.currentAttrs) {
                this.initAttrs();
            }
            this.running = true;
        }
    },

    /*
     * @private
     * Calculate attribute value at the passed timestamp.
     * @returns a hash of the new attributes.
     */
    runAnim: function(timestamp) {
        var attrs = this.currentAttrs,
            duration = this.duration,
            easingFn = this.easingFn,
            propHandlers = this.propHandlers,
            ret = {},
            easing,
            values,
            attr;

        if (timestamp >= duration) {
            timestamp = duration;
        }
        if (this.reverse) {
            timestamp = duration - timestamp;
        }

        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                values = attrs[attr];
                easing = easingFn(timestamp / duration);
                ret[attr] = propHandlers[attr].set(values, easing);
            }
        }
        return ret;
    },

    /*
     * @private
     * Perform lastFrame cleanup and handle iterations
     * @returns a hash of the new attributes.
     */
    lastFrame: function() {
        var iter = this.iterations,
            iterCount = this.currentIteration;

        iterCount++;
        if (iterCount < iter) {
            if (this.alternate) {
                this.reverse = !this.reverse;
            }
        }
        else {
            iterCount = 0;
            this.end();
        }

        this.startTime = new Date();
        this.currentIteration = iterCount;
        // Turn off paused for CSS3 Transitions
        this.paused = false;
    },

    /*
     * Fire afteranimate event and end the animation. Usually called automatically when the
     * animation reaches its final frame, but can also be called manually to pre-emptively
     * stop and destroy the running animation.
     */
    end: function() {
        this.fireEvent('afteranimate', this, this.startTime, this.elapsedTime);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.paused = false;
        this.running = false;
        Ext.fx2.Manager.removeAnim(this);
    }
});
