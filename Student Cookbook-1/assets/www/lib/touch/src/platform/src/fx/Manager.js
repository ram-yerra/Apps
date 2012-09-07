/**
 * @class Ext.fx2.Manager
 * Animation Manager which keeps track of all current animations and manages them on a frame by frame basis.
 * @singleton
 */
Ext.ns('Ext.fx2');

Ext.fx2.Manager = {
    /**
     * @private
     * Hash of all Anim instances
     */
    items: new Ext.util.MixedCollection(),
    
    /**
     * @cfg {Number} interval Default interval in miliseconds to calculate each frame.  Defaults to 16ms (~60fps)
     */
    interval: 16,

    /**
     * @cfg {Boolean} forceJS Turn off to not use CSS3 transitions when they are available
     */
    forceJS: false,

    createTarget: function(target) {
        var useCSS3 = !this.forceJS && Ext.supports.Transitions;
        this.useCSS3 = useCSS3;

        // dom id
        if (typeof target == 'string') {
            target = Ext.get(target);
        }
        // dom element
        else if (target.tagName) {
            target = Ext.get(target);
        }
        if (Ext.isObject(target)) {
            // Element
            if (target.dom) {
                return new Ext.fx2.target['Element' + (useCSS3 ? 'CSS' : '')](target);
            }
            // Element Composite
            else if (target.isComposite) {
                return new Ext.fx2.target['CompositeElement' + (useCSS3 ? 'CSS' : '')](target);
            }
            // Draw Sprite
            else if (target.isSprite) {
                return new Ext.fx2.target.Sprite(target);
            }
            // Draw Sprite Composite
            else if (target.isSpriteGroup) {
                return new Ext.fx2.target.SpriteGroup(target);
            }
            // Component
            else if (target.isComponent) {
                return new Ext.fx2.target.Component(target);
            }
            // Component Compositishtypethingy (When ComponentQuery is complete)
            //else if (target.isComponent) {
            //    return new Ext.fx2.target['Component' + (useCSS3 ? 'CSS' : '')](target);
            //}
            // Target
            else if (target.isAnimTarget) {
                return target;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },

    /**
     * Add an Anim to the manager. This is done automatically when an Anim instance is created.
     * @param {Ext.fx2.Anim} anim
     */
    addAnim: function(anim) {
        var items = this.items,
            task = this.task;

        items.add(anim);

        // Start the timer if not already running
        if (!task && items.length) {
            task = this.task = {
                run: this.runner,
                interval: this.interval,
                scope: this
            };
            Ext.TaskMgr.start(task);
        }
    },

    /**
     * Remove an Anim from the manager. This is done automatically when an Anim ends.
     * @param {Ext.fx2.Anim} anim
     */
    removeAnim: function(anim) {
        var items = this.items,
            task = this.task;

        items.remove(anim);

        // Stop the timer if there are no more managed Anims
        if (task && !items.length) {
            Ext.TaskMgr.stop(task);
            delete this.task;
        }
    },

    /**
     * @private
     * Filter function to determine which animations need to be started
     */
    startingFilter: function(o) {
        return o.paused === false && o.running === false && o.iterations > 0;
    },

    /**
     * @private
     * Filter function to determine which animations are still running
     */
    runningFilter: function(o) {
        return o.paused === false && o.running === true;
    },

    /**
     * @private
     * Runner function being called each frame
     */
    runner: function() {
        var items = this.items;

        this.targetData = {};
        this.targetArr = {};

        // Single timestamp for all animations this interval
        this.timestamp = new Date();

        // Start any items not current running
        items.filterBy(this.startingFilter).each(this.startAnim, this);

        // Build the new attributes to be applied for all targets in this frame
        items.filterBy(this.runningFilter).each(this.runAnim, this);

        // Apply all the pending changes to their targets
        this.applyPendingAttrs();
    },

    /**
     * @private
     * Start the individual animation (initialization)
     */
    startAnim: function(anim) {
        anim.start(this.timestamp);
    },

    /**
     * @private
     * Run the individual animation for this frame
     */
    runAnim: function(anim) {
        var targetId = anim.target.getId(),
            useCSS3 = this.useCSS3 && anim.target.type == 'element',
            timestamp = this.timestamp - anim.startTime,
            target,
            o;

        this.collectTargetData(anim, timestamp, useCSS3);

        // For CSS3 animation, we need to immediately set the first frame's attributes without any transition
        // to get a good initial state, then add the transition properties and set the final attributes.
        if (useCSS3) {
            // Flush the collected attributes, without transition
            anim.target.setAttr(this.targetData[targetId], true);

            // Add the end frame data
            this.targetData[targetId] = [];
            this.collectTargetData(anim, anim.duration, useCSS3);

            // Pause the animation so runAnim doesn't keep getting called
            anim.paused = true;

            target = anim.target.target;
            // We only want to attach an event on the last element in a composite
            if (anim.target.isComposite) {
                target = anim.target.target.last();
            }

            // Listen for the transitionend event
            o = {};
            o[Ext.supports.CSS3TransitionEnd] = anim.lastFrame;
            o.scope = anim;
            o.single = true;
            target.on(o);
        }
        // For JS animation, trigger the lastFrame handler if this is the final frame
        else if (timestamp >= anim.duration) {
            this.applyPendingAttrs();
            delete this.targetData[targetId];
            delete this.targetArr[targetId];
            anim.lastFrame();
        }
    },

    /**
     * Collect target attributes for the given Anim object at the given timestamp
     * @param {Ext.fx2.Anim} anim The Anim instance
     * @param {Number} timestamp Time after the anim's start time
     */
    collectTargetData: function(anim, timestamp, useCSS3) {
        var targetId = anim.target.getId(),
            targetData = this.targetData[targetId],
            data;
        
        if (!targetData) {
            targetData = this.targetData[targetId] = [];
            this.targetArr[targetId] = anim.target;
        }

        data = {
            duration: anim.duration,
            easing: (useCSS3 && anim.reverse) ? anim.easingFn.reverse().toCSS3() : anim.easing,
            attrs: {}
        };
        Ext.apply(data.attrs, anim.runAnim(timestamp));
        targetData.push(data);
    },

    /**
     * @private
     * Apply all pending attribute changes to their targets
     */
    applyPendingAttrs: function() {
        var targetData = this.targetData,
            targetArr = this.targetArr,
            targetId;
        for (targetId in targetData) {
            if (targetData.hasOwnProperty(targetId)) {
                targetArr[targetId].setAttr(targetData[targetId], false);
            }
        }
    }
};