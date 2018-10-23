/**
 * @license Highcharts JS v6.2.0 (2018-10-17)
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2017 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */

/**
		 * Plugin for displaying a message when there is no data visible in chart.
		 *
		 * (c) 2010-2017 Highsoft AS
		 * Author: Oystein Moseng
		 *
		 * License: www.highcharts.com/license
		 */

!function(a){"object"==typeof module&&module.exports?module.exports=a:"function"==typeof define&&define.amd?define([],function(){return a}):a(Highcharts)}(function(a){!function(a){var t=a.seriesTypes,n=a.Chart.prototype,e=a.getOptions(),o=a.extend,i=a.each;o(e.lang,{noData:"No data to display"}),e.noData={position:{x:0,y:0,align:"center",verticalAlign:"middle"}},e.noData.style={fontWeight:"bold",fontSize:"12px",color:"#666666"},i(["bubble","gauge","heatmap","pie","sankey","treemap","waterfall"],function(a){t[a]&&(t[a].prototype.hasData=function(){return!!this.points.length})}),a.Series.prototype.hasData=function(){return this.visible&&void 0!==this.dataMax&&void 0!==this.dataMin},n.showNoData=function(a){var t=this,n=t.options,e=a||n&&n.lang.noData,i=n&&n.noData;!t.noDataLabel&&t.renderer&&(t.noDataLabel=t.renderer.label(e,0,0,null,null,null,i.useHTML,null,"no-data"),t.noDataLabel.attr(i.attr).css(i.style),t.noDataLabel.add(),t.noDataLabel.align(o(t.noDataLabel.getBBox(),i.position),!1,"plotBox"))},n.hideNoData=function(){var a=this;a.noDataLabel&&(a.noDataLabel=a.noDataLabel.destroy())},n.hasData=function(){for(var a=this,t=a.series||[],n=t.length;n--;)if(t[n].hasData()&&!t[n].options.isInternal)return!0;return a.loadingShown},a.addEvent(a.Chart,"render",function(){this.hasData()?this.hideNoData():this.showNoData()})}(a)});