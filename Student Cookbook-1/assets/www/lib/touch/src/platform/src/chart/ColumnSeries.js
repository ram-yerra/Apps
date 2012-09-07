/**
 * @class Ext.chart.ColumnSeries
 * @extends Ext.chart.BarSeries
 * Series which displays its items as vertical bars
 * @constructor
 */
Ext.chart.ColumnSeries = Ext.extend(Ext.chart.BarSeries, {
    type: 'column',
    column: true,

    /**
     * @cfg {Number} xpadding
     * Padding between the left/right axes and the bars
     */
    xpadding: 10,

    /**
     * @cfg {Number} ypadding
     * Padding between the top/bottom axes and the bars
     */
    ypadding: 0
});