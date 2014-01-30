/**
 * @license Highcharts JS v3.0.8 (2014-01-09)
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2014 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */

!function(e){function t(){return!!this.points.length}function n(){var e=this;e.hasData()?e.hideNoData():e.showNoData()}var r=e.seriesTypes,i=e.Chart.prototype,o=e.getOptions(),a=e.extend;a(o.lang,{noData:"No data to display"}),o.noData={position:{x:0,y:0,align:"center",verticalAlign:"middle"},attr:{},style:{fontWeight:"bold",fontSize:"12px",color:"#60606a"}},r.pie.prototype.hasData=t,r.gauge&&(r.gauge.prototype.hasData=t),r.waterfall&&(r.waterfall.prototype.hasData=t),e.Series.prototype.hasData=function(){return void 0!==this.dataMax&&void 0!==this.dataMin},i.showNoData=function(e){var t=this,n=t.options,r=e||n.lang.noData,i=n.noData;t.noDataLabel||(t.noDataLabel=t.renderer.label(r,0,0,null,null,null,null,null,"no-data").attr(i.attr).css(i.style).add(),t.noDataLabel.align(a(t.noDataLabel.getBBox(),i.position),!1,"plotBox"))},i.hideNoData=function(){var e=this;e.noDataLabel&&(e.noDataLabel=e.noDataLabel.destroy())},i.hasData=function(){for(var e=this,t=e.series,n=t.length;n--;)if(t[n].hasData()&&!t[n].options.isInternal)return!0;return!1},i.callbacks.push(function(t){e.addEvent(t,"load",n),e.addEvent(t,"redraw",n)})}(Highcharts);