// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader"],function(e,t,i,s,n,o){"use strict";return n.extend({className:"reports-chart reports-drillingChart reports-1-coeffs",initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:coeffs",this.render),this.settings&&this.listenTo(this.settings,"add change",this.onSettingsUpdate),this.displayOptions&&(this.listenTo(this.displayOptions,"change:series change:maxQuantityDone change:maxPercentCoeff",e.debounce(this.onDisplayOptionsChange,1)),this.listenTo(this.displayOptions,"change:references",this.onDisplayReferencesChange))},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.isLoading&&this.chart.showLoading()),this.shouldRenderChart=!0},updateChart:function(){var e=this.serializeChartData(),t=this.getMarkerStyles(e.quantityDone.length),i=this.chart.series;this.updateExtremes(!1),i[0].update({marker:t},!1),i[1].update({marker:t},!1),i[2].update({marker:t},!1),i[3].update({marker:t},!1),i[4].update({marker:t},!1),i[5].update({marker:t},!1),i[0].setData(e.quantityDone,!1),i[1].setData(e.efficiency,!1),i[2].setData(e.productivity,!1),i[3].setData(e.productivityNoWh,!1),i[4].setData(e.scheduledDowntime,!1),i[5].setData(e.unscheduledDowntime,!1);var s="hour"!==this.model.query.get("interval"),n=s&&this.isSeriesVisible("productivity"),o=s&&this.isSeriesVisible("productivityNoWh");i[2].visible!==n&&i[2].setVisible(n,!1),i[3].visible!==o&&i[3].setVisible(o,!1),this.chart.redraw(!1),this.updateReferences()},updateReferences:function(){this.settings&&(this.updateReference("efficiency"),this.updateReference("productivity"),this.updateReference("productivityNoWh"),this.updateReference("scheduledDowntime"),this.updateReference("unscheduledDowntime"))},updateReference:function(e){if(this.chart){var t=this.chart.get(e);if(t&&(t.yAxis.removePlotLine(e),t.visible&&this.isReferenceVisible(e))){var i=this.getReference(e);i&&t.yAxis.addPlotLine({id:e,color:t.color,dashStyle:"dash",value:i,width:2,zIndex:4})}}},updateExtremes:function(e){if(this.displayOptions){var t=!this.model.get("isParent")||"parent"===this.model.get("extremes"),i=t?this.displayOptions.get("maxQuantityDone"):null,s=t?this.displayOptions.get("maxPercentCoeff"):null;this.chart.yAxis[0].setExtremes(null==i?null:0,i,!1,!1),this.chart.yAxis[1].setExtremes(null==s?null:0,s,e,!1)}},updateColor:function(e,t){var i=this.chart.get(e);i&&(i.update({color:t},!0),this.updateReference(e))},getReference:function(e){return this.settings.getReference(e,this.model.getReferenceOrgUnitId())},serializeChartData:function(){return this.model.get("coeffs")},isSeriesVisible:function(e){return!this.displayOptions||this.displayOptions.isSeriesVisible(e)},isReferenceVisible:function(e){return!this.displayOptions||this.displayOptions.isReferenceVisible(e)},formatTooltipHeader:o,getMarkerStyles:function(e){return{radius:e>1?0:3,states:{hover:{radius:e>1?3:6}}}},getColor:function(e,t){return this.settings?this.settings.getColor(e,t):"#000000"},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onSettingsUpdate:function(e){switch(e.getType()){case"color":return this.updateColor(e.getMetricName(),e.getValue());case"ref":return this.updateReference(e.getMetricName())}},onDisplayOptionsChange:function(){var e=this.displayOptions.get("series"),t="hour"===this.model.query.get("interval");this.chart.series.forEach(function(i){var s=!!e[i.options.id];/^productivity/.test(i.options.id)&&t&&(s=!1),i.visible!==s&&i.setVisible(s,!1)}),this.updateExtremes(!0)},onDisplayReferencesChange:function(e,t){var i=Object.keys(t);if(!i.length)return this.updateReferences();for(var s=0,n=i.length;n>s;++s)if(this.chart.get(i[s])){this.updateReferences();break}},createChart:function(){var e=this.serializeChartData(),t=this.getMarkerStyles(e.quantityDone.length);this.chart=new s.Chart({chart:{renderTo:this.el,zoomType:null},exporting:{filename:i("reports","filenames:1:coeffs")},title:{text:this.model.getOrgUnitTitle()},noData:{},xAxis:{type:"datetime"},yAxis:[{title:!1,showEmpty:!1},{title:!1,showEmpty:!1,opposite:!0,labels:{format:"{value}%"}}],tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this),valueDecimals:0},legend:{enabled:!1},plotOptions:{area:{lineWidth:0,marker:t},line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:t}},series:[{id:"quantityDone",name:i.bound("reports","coeffs:quantityDone"),color:this.getColor("quantityDone"),type:"area",yAxis:0,data:e.quantityDone,tooltip:{valueSuffix:i("reports","quantitySuffix")},visible:this.isSeriesVisible("quantityDone"),zIndex:1},{id:"efficiency",name:i.bound("reports","coeffs:efficiency"),color:this.getColor("efficiency"),type:"line",yAxis:1,data:e.efficiency,tooltip:{valueSuffix:"%"},events:{show:this.updateReference.bind(this,"efficiency"),hide:this.updateReference.bind(this,"efficiency")},visible:this.isSeriesVisible("efficiency"),zIndex:2},{id:"productivity",name:i.bound("reports","coeffs:productivity"),color:this.getColor("productivity"),type:"line",yAxis:1,data:e.productivity,tooltip:{valueSuffix:"%"},visible:"hour"!==this.model.query.get("interval")&&this.isSeriesVisible("productivity"),events:{show:this.updateReference.bind(this,"productivity"),hide:this.updateReference.bind(this,"productivity")},zIndex:3},{id:"productivityNoWh",name:i.bound("reports","coeffs:productivityNoWh"),color:this.getColor("productivityNoWh"),type:"line",yAxis:1,data:e.productivityNoWh,tooltip:{valueSuffix:"%"},visible:"hour"!==this.model.query.get("interval")&&this.isSeriesVisible("productivityNoWh"),events:{show:this.updateReference.bind(this,"productivityNoWh"),hide:this.updateReference.bind(this,"productivityNoWh")},zIndex:4},{id:"scheduledDowntime",name:i.bound("reports","coeffs:scheduledDowntime"),color:this.getColor("scheduledDowntime",.75),borderWidth:0,type:"column",yAxis:1,data:e.scheduledDowntime,tooltip:{valueSuffix:"%"},visible:this.isSeriesVisible("scheduledDowntime"),events:{show:this.updateReference.bind(this,"scheduledDowntime"),hide:this.updateReference.bind(this,"scheduledDowntime")},zIndex:5},{id:"unscheduledDowntime",name:i.bound("reports","coeffs:unscheduledDowntime"),color:this.getColor("unscheduledDowntime",.75),borderWidth:0,type:"column",yAxis:1,data:e.unscheduledDowntime,tooltip:{valueSuffix:"%"},visible:this.isSeriesVisible("unscheduledDowntime"),events:{show:this.updateReference.bind(this,"unscheduledDowntime"),hide:this.updateReference.bind(this,"unscheduledDowntime")},zIndex:6}]})}})});