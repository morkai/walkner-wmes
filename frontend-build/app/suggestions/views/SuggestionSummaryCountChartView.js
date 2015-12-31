// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader"],function(t,e,i,r,o,s){"use strict";return o.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:count",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.model.get("count"),o=this.model.getNlsDomain();this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1,type:"column"},exporting:{filename:e.bound(o,"report:filenames:summary:count"),chartOptions:{title:{text:e.bound(o,"report:title:summary:count")}}},title:!1,noData:{},xAxis:{type:"datetime",labels:{formatter:function(){return i.getMoment(this.value).format("w")}}},yAxis:{title:!1,min:0,allowDecimals:!1},tooltip:{shared:!0,valueDecimals:0,headerFormatter:s.bind(this)},legend:{enabled:!0},plotOptions:{column:{stacking:"normal",dataLabels:{enabled:!0,formatter:function(){return this.y||""}}}},series:[{id:"cancelled",name:e.bound("suggestions","report:series:summary:cancelled"),data:t.cancelled,color:"#d9534f"},{id:"open",name:e.bound("suggestions","report:series:summary:open"),data:t.open,color:"#f0ad4e"},{id:"finished",name:e.bound("suggestions","report:series:summary:finished"),data:t.finished,color:"#5cb85c"}]})},updateChart:function(){this.chart.destroy(),this.createChart()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});