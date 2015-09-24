// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(t,e,i,r,s,o){"use strict";return i.extend({className:"opinionSurveys-report-responseCountByDivision",initialize:function(){this.chart=null,this.isLoading=!1;var t=this.model.report;this.listenTo(t,"request",this.onModelLoading),this.listenTo(t,"sync",this.onModelLoaded),this.listenTo(t,"error",this.onModelError),this.listenTo(t,"change:responseCountTotal",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData();this.chart=new r.Chart({chart:{type:"pie",renderTo:this.el,height:500},exporting:{filename:e.bound("opinionSurveys","report:responseCountByDivision:filename")},title:{text:e.bound("opinionSurveys","report:responseCountByDivision:title")},noData:{},tooltip:{valueDecimals:0},legend:{layout:"vertical",align:"left",verticalAlign:"top",y:34,itemStyle:{fontSize:"14px"}},plotOptions:{pie:{shadow:!1,center:["50%","50%"]},series:{point:{events:{legendItemClick:function(){var t=this.id;this.series.chart.series[1].data.forEach(function(e){e.parentId===t&&e.setVisible(!e.visible)})}}}}},series:[{name:e.bound("opinionSurveys","report:responseCountByDivision:series"),data:t.divisions,size:"60%",showInLegend:!0,dataLabels:{enabled:!1}},{name:e.bound("opinionSurveys","report:responseCountByDivision:series"),data:t.employers,size:"80%",innerSize:"60%",dataLabels:{formatter:function(){return this.y>0?this.point.name+": "+this.y:null}}}]})},updateChart:function(){var t=this.serializeChartData(),e=this.chart.series;e[0].setData(t.divisions,!1,!1,!0),e[1].setData(t.employers,!1,!1,!0),this.chart.redraw()},serializeChartData:function(){var e=this.model.report.get("responseCountTotal"),i=[],r=[];return t.forEach(e,function(e,n){var a=o.divisions.get(n),h=0;t.forEach(e,function(t,e){var i=o.employers.get(e);r.push({parentId:a.id,name:a.getLabel()+" \\ "+i.getLabel(),y:t,color:i.getColor()}),h+=t}),i.push({id:a.id,name:a.getLabel(),y:h,color:s.getColor("opinionSurveys:divisions",a.id)})}),{divisions:i,employers:r}},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});