/**
 * The Draw Component is a surface in which sprites can be rendered.
 */
Ext.draw.DrawComponent = Ext.extend(Ext.Component, {

    /**
     * @cfg {Array} implOrder
     * Defines the priority order for which Surface implementation to use. The first
     * one supported by the current environment will be used.
     */
    implOrder: ['SVG', 'Canvas', 'VML'],

    baseCls: 'x-surface',

    componentLayout: 'draw',

    autoSize: true,

    initComponent: function() {
        Ext.draw.DrawComponent.superclass.initComponent.call(this);

        this.addEvents(
            'mousemove',
            'mouseenter',
            'mouseleave'
        );
    },

    /**
     * Create the Surface on initial render
     */
    onRender: function() {
        var me = this,
            bbox;
        Ext.draw.DrawComponent.superclass.onRender.apply(me, arguments);

        me.width = me.surfaceWidth;
        me.height = me.surfaceHeight;

        me.createSurface();

        if (me.autoSize) {
            bbox = me.surface.items.getBBox();
            me.surface.setViewBox(bbox.x, bbox.y, bbox.width, bbox.height);
        }
    },

    /**
     * Create the Surface instance. Resolves the correct Surface implementation to
     * instantiate based on the 'implOrder' config.
     */
    createSurface: function() {
        var surface = Ext.draw.Surface.newInstance(Ext.apply({}, {
                width: this.width,
                height: this.height,
                renderTo: this.el
            }, this.initialConfig));
        this.surface = surface;

        function refire(eventName) {
            return function(e) {
                this.fireEvent(eventName, e);
            };
        }

        surface.on({
            scope: this,
            mousemove: refire('mousemove'),
            mouseenter: refire('mouseenter'),
            mouseleave: refire('mouseleave')
        });
    },


    /**
     * Clean up the Surface instance on component destruction
     */
    destroy: function() {
        var surface = this.surface;
        if (surface) {
            surface.destroy();
        }
        Ext.draw.DrawComponent.superclass.onRender.apply(this, arguments);
    }

});

Ext.reg('draw', Ext.draw.DrawComponent);
