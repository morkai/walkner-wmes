// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(e,t,i,r,s,o){"use strict";return i.extend({className:"opinionSurveys-report-positiveAnswerPercentBySurvey",initialize:function(){this.chart=null,this.isLoading=!1;var e=this.model.report;this.listenTo(e,"request",this.onModelLoading),this.listenTo(e,"sync",this.onModelLoaded),this.listenTo(e,"error",this.onModelError),this.listenTo(e,"change:positiveAnswerCountBySurvey",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){this.chart=new r.Chart({chart:{type:"column",renderTo:this.el,height:500},exporting:{filename:t.bound("opinionSurveys","report:positiveAnswerPercentBySurvey:filename")},title:{text:t.bound("opinionSurveys","report:positiveAnswerPercentBySurvey:title")},noData:{},tooltip:{shared:!0,valueDecimals:0,valueSuffix:"%"},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories()},yAxis:{min:0,max:100,title:{enabled:!1},plotLines:this.serializePlotLines()},series:this.serializeSeries()})},serializeCategories:function(){var t=this.model.surveys,i=[];return e.forEach(this.model.report.get("positiveAnswerCountBySurvey"),function(e,r){i.push(t.get(r).getLabel())}),i},serializeSeries:function(){var i=Object.keys(this.model.report.get("usedEmployers")),r=[],s={},a=this.getRefValue(),n=[];return e.forEach(i,function(e){var t=o.employers.get(e),i={id:e,name:t.getLabel(),data:[],dataLabels:{enabled:!0},color:t.getColor()};r.push(i),s[e]=i}),e.forEach(this.model.report.get("positiveAnswerCountBySurvey"),function(t){e.forEach(r,function(e){var i=0;if(t[e.id]){var r=t[e.id].num,s=t[e.id].den+r;i=s?Math.round(r/s*100):0}e.data.push(i)}),n.push(a)}),r.push({type:"line",name:t("opinionSurveys","report:refValue"),data:n,color:"#5cb85c",showInLegend:!1,marker:{radius:0}}),r},serializePlotLines:function(){var e=[],t=this.getRefValue();return t&&e.push({id:"refValue",color:"#5cb85c",width:2,value:t,zIndex:1e3}),e},getRefValue:function(){return o.settings.getPositiveAnswersReference()},updateChart:function(){for(var t=this.chart,i=this.serializePlotLines();t.series.length;)t.series[0].remove(!1);t.xAxis[0].setCategories(this.serializeCategories(),!1),t.yAxis[0].removePlotLine("refValue"),i.length&&t.yAxis[0].addPlotLine(i[0]),e.forEach(this.serializeSeries(),function(e){t.addSeries(e,!1)}),t.redraw()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});