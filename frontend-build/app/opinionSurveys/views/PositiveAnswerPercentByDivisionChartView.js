// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(e,i,t,r,s,o){"use strict";return t.extend({className:"opinionSurveys-report-positiveAnswerPercentByDivision",initialize:function(){this.chart=null,this.isLoading=!1;var e=this.model.report;this.listenTo(e,"request",this.onModelLoading),this.listenTo(e,"sync",this.onModelLoaded),this.listenTo(e,"error",this.onModelError),this.listenTo(e,"change:positiveAnswerCountByDivision",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){this.chart=new r.Chart({chart:{type:"column",renderTo:this.el,height:500},exporting:{filename:i.bound("opinionSurveys","report:positiveAnswerPercentByDivision:filename")},title:{text:i.bound("opinionSurveys","report:positiveAnswerPercentByDivision:title")},noData:{},tooltip:{shared:!0,valueDecimals:0,valueSuffix:"%"},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories()},yAxis:{min:0,max:100,title:{enabled:!1},plotLines:this.serializePlotLines()},series:this.serializeSeries()})},serializeCategories:function(){var i=this.model.report,t=i.get("positiveAnswerCountByDivision"),r=[];return e.forEach(i.get("usedDivisions"),function(e,i){t[i]&&r.push(o.divisions.get(i).getLabel())}),r},serializeSeries:function(){var t=this.model.report,r=Object.keys(this.model.report.get("usedEmployers")),s=t.get("positiveAnswerCountByDivision"),n=[],a={},h=this.getRefValue(),l=[];return e.forEach(r,function(e){var i=o.employers.get(e),t={id:e,name:i.getLabel(),data:[],dataLabels:{enabled:!0},color:i.get("color")};n.push(t),a[e]=t}),e.forEach(t.get("usedDivisions"),function(i,t){var r=s[t];r&&(e.forEach(n,function(e){var i=0;if(r[e.id]){var t=r[e.id].num,s=r[e.id].den+t;i=s?Math.round(t/s*100):0}e.data.push(i)}),l.push(h))}),n.push({type:"line",name:i("opinionSurveys","report:refValue"),data:l,color:"#5cb85c",showInLegend:!1,marker:{radius:0}}),n},serializePlotLines:function(){var e=[],i=this.getRefValue();return i&&e.push({id:"refValue",color:"#5cb85c",width:2,value:i,zIndex:1e3}),e},getRefValue:function(){return o.settings.getPositiveAnswersReference()},updateChart:function(){for(var i=this.chart,t=this.serializePlotLines();i.series.length;)i.series[0].remove(!1);i.xAxis[0].setCategories(this.serializeCategories(),!1),i.yAxis[0].removePlotLine("refValue"),t.length&&i.yAxis[0].addPlotLine(t[0]),e.forEach(this.serializeSeries(),function(e){i.addSeries(e,!1)}),i.redraw()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});