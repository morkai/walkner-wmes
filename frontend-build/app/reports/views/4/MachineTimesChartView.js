// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/View","app/highcharts"],function(t,e,i){"use strict";return e.extend({className:"reports-4-machineTimes",initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:workTimes",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var e=this.serializeChartData();this.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:t.bound("reports","filenames:4:machineTimes")},title:{text:t.bound("reports","operator:machineTimes:title")},noData:{},xAxis:{type:"category",categories:e.categories},yAxis:{title:!1,labels:{format:"{value}h"},min:0},tooltip:{shared:!0,valueSuffix:"h",valueDecimals:2},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{borderWidth:0}},series:[{name:t.bound("reports","operator:machineTimes:machineMedian"),type:"column",data:e.machineMedian},{name:t.bound("reports","operator:machineTimes:work"),type:"column",data:e.work},{name:t.bound("reports","operator:machineTimes:operatorMedian"),type:"column",data:e.operatorMedian}]})},updateChart:function(){var t=this.serializeChartData(),e=this.chart.series;this.chart.xAxis[0].setCategories(t.categories,!1),e[0].setData(t.machineMedian,!1),e[1].setData(t.work,!1),e[2].setData(t.operatorMedian,!0)},serializeChartData:function(){return this.model.get("machineTimes")},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});