// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/i18n","app/highcharts","app/core/View","app/data/companies","../util/formatTooltipHeader"],function(t,e,i,r,s,n,o){return s.extend({fteType:null,extremesChangeProperties:[],className:function(){return"reports-chart reports-5-"+this.fteType},initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change",this.render),this.listenTo(this.settings,"add change",this.onSettingsUpdate),this.listenTo(this.displayOptions,"change",t.debounce(this.onDisplayOptionsChange,1))},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.isLoading&&this.chart.showLoading()),this.shouldRenderChart=!0},updateChart:function(){var t=this.serializeChartData();this.updateExtremes(!1);var e=this.getMarkerStyles(t[this.fteType].length),i=this.chart,r=i.series;r.forEach(function(i){i.update({marker:e},!1),t[i.options.id]&&i.setData(t[i.options.id],!1,!1,!1)}),t.byCompany&&n.forEach(function(e){var r=i.get(e.id);r&&r.setData(t.byCompany[e.id]||null,!1)}),i.redraw(!1)},serializeChartData:function(){throw new Error},getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},updateExtremes:function(t){var e=this.chart;this.isFullscreen||this.model.get("isParent")&&"parent"!==this.model.get("extremes")||this.getYAxisMaxValues().forEach(function(t,i){e.yAxis[i].setExtremes(0,t,!1,!1)}),t!==!1&&e.redraw(!1)},getYAxisMaxValues:function(){return this.chart.yAxis.map(function(){return null})},updateColor:function(t,e){var i=this.chart.get(t);i&&i.update({color:e},!0)},onSettingsUpdate:function(t){switch(t.getType()){case"color":return this.updateColor(t.getMetricName(),t.getValue())}},onDisplayOptionsChange:function(){var e=this.displayOptions,i=e.changedAttributes(),r=this.toggleSeriesVisibility(i),s=t.any(this.extremesChangeProperties,function(t){return void 0!==i[t]});s&&(this.updateExtremes(!1),r=!0),r&&this.chart.redraw(!1)},toggleSeriesVisibility:function(t){var e=this.displayOptions,i=!1;return(t.series||t.companies)&&this.chart.series.forEach(function(t){var r=e.isSeriesVisible(t.options.id);t.visible!==r&&(t.setVisible(r,!1),i=!0)}),i},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},getChartTitle:function(){return i.bound("reports","hr:title:"+this.fteType)},createChart:function(){this.chart=new r.Chart(this.createChartOptions())},createChartOptions:function(){var t=this.serializeChartData(),e=this.getMarkerStyles(t[this.fteType].length);return{chart:{renderTo:this.el,zoomType:null},exporting:{filename:i.bound("reports","filenames:5:"+this.fteType),buttons:{contextButton:{menuItems:r.getDefaultMenuItems().concat({text:i("core","highcharts:downloadCSV"),onclick:this.exportChart.bind(this)})}}},title:{text:this.getChartTitle()},noData:{},tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this)},legend:{enabled:!1},plotOptions:{line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:e}},xAxis:this.createXAxis(),yAxis:this.createYAxis(),series:this.createSeries(t)}},formatTooltipHeader:function(t){return o.call(this,t)},createXAxis:function(){return{type:"datetime"}},createYAxis:function(){return[{title:!1,min:0}]},createSeries:function(){throw new Error},createFteSeries:function(t,e,r,s){return{id:t,name:r||i.bound("reports","hr:"+t),color:s||this.settings.getColor(t),type:"line",yAxis:0,data:e,visible:this.displayOptions.isSeriesVisible(t),tooltip:{valueSuffix:" FTE",valueDecimals:1}}},exportChart:function(){var t=this.ajax({type:"POST",url:"/reports;download?filename="+this.chart.options.exporting.filename,contentType:"text/csv",data:this.exportCsvLines().join("\r\n")});t.done(function(t){window.location.href="/reports;download?key="+t})},exportCsvLines:function(){var t=this,e=[i("reports","hr:"+this.fteType+":columns")];return this.chart.series.forEach(function(i,r){var s=t.quoteCsvString(i.name)+";"+t.quoteCsvString(i.options.tooltip.valueSuffix.trim());i.data.forEach(function(i){0===r&&(e[0]+=";"+t.quoteCsvString(o.call(t,i))),s+=";"+i.y.toLocaleString()}),e.push(s)}),e},quoteCsvString:function(t){return null===t||void 0===t||""===t?'""':'"'+String(t).replace(/"/g,'""')+'"'}})});