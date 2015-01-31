// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/highcharts","app/core/View","../util/formatTooltipHeader"],function(t,e,i,s,r){return s.extend({className:"reports-6-effAndFte",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:effAndFte",this.render),this.settings&&this.listenTo(this.settings,"add change",this.onSettingsUpdate)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData();this.chart=new i.Chart({chart:{renderTo:this.el},exporting:{filename:e("reports","filenames:6:effAndFte:"+this.options.type)},title:{text:e("reports","wh:effAndFte:"+this.options.type)},noData:{},xAxis:{type:"datetime"},yAxis:[{id:"fteAxis",title:!1,min:0},{id:"effAxis",title:!1,opposite:!0,showEmpty:!0,min:0,gridLineWidth:0}],tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this),valueDecimals:1},legend:!1,plotOptions:{line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:this.getMarkerStyles(t.fte.length)}},series:[{id:"fte",name:e("reports","wh:fte"),color:this.settings&&this.settings.getColor("warehouse")||"#eeee00",borderWidth:0,type:"column",data:t.fte,yAxis:0},{id:"eff",name:e("reports","wh:eff"),color:this.settings&&this.settings.getColor("efficiency")||"#eeee00",type:"line",data:t.eff,yAxis:1,tooltip:{valueSuffix:"TO/FTE"},visible:"sm"!==this.options.type}]})},updateChart:function(){var t=this.serializeChartData(),e=this.getMarkerStyles(t.fte.length),i=this.chart,s=i.series;s.forEach(function(i){i.update({marker:e},!1),i.setData(t[i.options.id],!1)}),this.chart.redraw(!1)},serializeChartData:function(){var t=this.model.get("effAndFte")[this.options.type];return{fte:t?t.fte:[],eff:t?t.eff:[]}},formatTooltipHeader:r,getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onSettingsUpdate:function(t){if(this.chart)switch(t.getType()){case"color":return this.updateColor(t.getMetricName(),t.getValue())}},updateColor:function(t,e){"efficiency"===t&&(t="eff");var i=this.chart.get(t);i&&i.update({color:e},!0)}})});