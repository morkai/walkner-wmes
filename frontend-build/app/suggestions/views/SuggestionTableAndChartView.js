// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader","app/kaizenOrders/dictionaries","app/suggestions/templates/reportTable","app/suggestions/templates/tableAndChart"],function(t,e,i,s,r,a,o,n){"use strict";return s.extend({template:n,events:{},initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:"+this.options.metric,this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading()),this.updateTable()},createChart:function(){var t=this.options.metric,s=this.serializeChartSeries();this.chart=new i.Chart({chart:{renderTo:this.$id("chart")[0],plotBorderWidth:1,spacing:[10,1,1,0]},exporting:{filename:e.bound("suggestions","report:filenames:"+t),chartOptions:{title:{text:e.bound("suggestions","report:title:"+t)},legend:{enabled:!0}},buttons:{contextButton:{align:"left"}},noDataLabels:s.length*s[0].data.length>30},title:!1,noData:{},xAxis:{type:"datetime"},yAxis:{title:!1,min:0,allowDecimals:!1,opposite:!0},tooltip:{shared:!0,valueDecimals:0,headerFormatter:r.bind(this)},legend:{enabled:!1},plotOptions:{column:{borderWidth:0}},series:s})},updateChart:function(){this.chart.destroy(),this.createChart()},updateTable:function(){this.$id("table").html(o({rows:this.model.get(this.options.metric).rows}))},serializeChartSeries:function(){var i=this.model.get(this.options.metric).series;return Object.keys(i).map(function(s){var r=i[s];return t.defaults(r,{id:s,type:"column",name:r.name||e.bound("suggestions","report:series:"+s),data:[]})})},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});