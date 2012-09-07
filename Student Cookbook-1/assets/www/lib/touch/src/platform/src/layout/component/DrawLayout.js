/**
 * @class Ext.layout.DrawLayout
 * @extends Ext.layout.ComponentLayout
 *
 */
Ext.layout.DrawLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'draw',

    onLayout : function(width, height) {
        this.owner.surface.setSize(width, height);
    }
});

Ext.regLayout('draw', Ext.layout.DrawLayout);
