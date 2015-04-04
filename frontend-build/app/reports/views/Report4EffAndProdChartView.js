// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/highcharts","app/core/View","../util/formatTooltipHeader"],function(t,e,i,r,a){"use strict";return r.extend({className:"reports-4-effAndProd",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:effAndProd",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData(),r=[{name:e("reports","operator:productivity"),color:"#ffaa00",type:"line",data:t.productivity},{name:e("reports","operator:efficiency"),color:"#00ee00",type:"line",data:t.efficiency}];Object.keys(t.byDivision).forEach(function(i){r.push({name:e("reports","operator:efficiency:byDivision",{division:i}),type:"line",data:t.byDivision[i],id:"division-"+i,visible:!1})}),this.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:e("reports","filenames:4:effAndProd")},title:{text:e("reports","operator:effAndProd:title")},noData:{},xAxis:{type:"datetime"},yAxis:{title:!1,labels:{format:"{value}%"},min:0},tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this),valueSuffix:"%",valueDecimals:0},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{line:{lineWidth:2,states:{hover:{lineWidth:4}},marker:this.getMarkerStyles(t.efficiency.length)}},series:r})},updateChart:function(){var t=this.serializeChartData(),e=this.getMarkerStyles(t.efficiency.length),i=this.chart,r=i.series;r.forEach(function(t){t.update({marker:e},!1)}),Object.keys(t.byDivision).forEach(function(e){var r=i.get("division-"+e);r&&r.setData(t.byDivision[e],!1)}),r[0].setData(t.productivity,!1),r[1].setData(t.efficiency,!0)},serializeChartData:function(){return this.model.get("effAndProd")},formatTooltipHeader:a,getMarkerStyles:function(t){return{symbol:"circle",radius:t>1?0:4,states:{hover:{radius:t>1?4:8}}}},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()}})});