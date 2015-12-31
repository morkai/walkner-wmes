// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(e,t,r,i,s,o){"use strict";return r.extend({className:"opinionSurveys-report-responseCountBySuperior",initialize:function(){this.chart=null,this.isLoading=!1;var e=this.model.report;this.listenTo(e,"request",this.onModelLoading),this.listenTo(e,"sync",this.onModelLoaded),this.listenTo(e,"error",this.onModelError),this.listenTo(e,"change:responseCountBySuperior",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var e=this.serializeChartData();this.chart=new i.Chart({chart:{type:"pie",renderTo:this.el,height:500},exporting:{filename:t.bound("opinionSurveys","report:responseCountBySuperior:filename")},title:{text:t.bound("opinionSurveys","report:responseCountBySuperior:title")},noData:{},tooltip:{valueDecimals:0},legend:{layout:"vertical",align:"left",verticalAlign:"top",y:34,itemStyle:{fontSize:"14px"}},plotOptions:{pie:{shadow:!1,center:["50%","50%"]},series:{point:{events:{legendItemClick:function(){var e=this.id;this.series.chart.series[1].data.forEach(function(t){t.parentId===e&&t.setVisible(!t.visible)})}}}}},series:[{name:t.bound("opinionSurveys","report:responseCountBySuperior:series"),data:e.superiors,size:"60%",showInLegend:!0,dataLabels:{enabled:!1}},{name:t.bound("opinionSurveys","report:responseCountBySuperior:series"),data:e.employers,size:"80%",innerSize:"60%",dataLabels:{formatter:function(){return this.y>0?this.point.name+": "+this.y:null}}}]})},updateChart:function(){var e=this.serializeChartData(),t=this.chart.series;t[0].setData(e.superiors,!1,!1,!0),t[1].setData(e.employers,!1,!1,!0),this.chart.redraw(!1)},serializeChartData:function(){var t=this.model,r=t.report.get("responseCountBySuperior"),i=t.report.get("superiorToSurvey"),a=t.surveys,n=[],h=[],p=Object.keys(i).sort(function(e,t){return e=a.get(i[e]).cacheMaps.superiors[e],t=a.get(i[t]).cacheMaps.superiors[t],e["short"].localeCompare(t["short"])});return e.forEach(p,function(t){var p=r[t],c=a.get(i[t]).cacheMaps.superiors[t],u=0;e.forEach(p,function(e,t){var r=o.employers.get(t);h.push({parentId:c._id,name:c["short"]+" \\ "+r.getLabel(),y:e,color:r.get("color")}),u+=e}),n.push({id:c._id,name:c.full,y:u,color:s.getColor("opinionSurveys:superiors",c._id)})}),{superiors:n,employers:h}},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});