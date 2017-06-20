// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(t,e,a,r,i,o){"use strict";return a.extend({className:"opinionSurveys-report-answerCountTotal",initialize:function(){this.chart=null,this.isLoading=!1;var t=this.model.report;this.listenTo(t,"request",this.onModelLoading),this.listenTo(t,"sync",this.onModelLoaded),this.listenTo(t,"error",this.onModelError),this.listenTo(t,"change:answerCountTotal",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var a=this.serializeChartData();this.chart=new r.Chart({chart:{type:"bar",renderTo:this.el,height:60*o.questions.length},exporting:{filename:e.bound("opinionSurveys","report:answerCountTotal:filename")},title:{text:e.bound("opinionSurveys","report:answerCountTotal:title")},noData:{},tooltip:{shared:!0,valueDecimals:0,headerFormatter:function(t){return o.questions.get(t.x).get("short")},extraRowsProvider:function(e,a){t.forEach(a,function(t,a){t.extraColumns='<td class="highcharts-tooltip-integer">'+Math.round(e[a].percentage)+'</td><td class="highcharts-tooltip-suffix">%</td>'})}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",reversed:!0,itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories(),labels:{formatter:function(){var t=o.questions.get(this.value);return"<b>"+t.get("short").toLocaleUpperCase()+"</b> "+t.get("full")}}},yAxis:{min:0,title:{enabled:!1}},plotOptions:{series:{stacking:"normal"}},series:[{id:"yes",name:e.bound("opinionSurveys","report:answer:yes"),data:a.yes,dataLabels:{enabled:!0,color:"#FFFFFF"},color:"#5cb85c"},{id:"na",name:e.bound("opinionSurveys","report:answer:na"),data:a.na,dataLabels:{enabled:!0,color:"#FFFFFF"},color:"#f0ad4e"},{id:"no",name:e.bound("opinionSurveys","report:answer:no"),data:a.no,dataLabels:{enabled:!0,color:"#FFFFFF"},color:"#d9534f"}]})},serializeCategories:function(){var e=[];return t.forEach(this.model.report.get("answerCountTotal"),function(t,a){e.push(a)}),e},serializeChartData:function(){var e={yes:[],na:[],no:[]};return t.forEach(this.model.report.get("answerCountTotal"),function(t){e.yes.push(t.yes),e.na.push(t.na),e.no.push(t.no)}),e},updateChart:function(){var e=this.chart,a=e.series,r=this.serializeChartData();e.xAxis[0].setCategories(this.serializeCategories(),!1),t.forEach(a,function(t){t.setData(r[t.options.id],!1)}),e.redraw()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});