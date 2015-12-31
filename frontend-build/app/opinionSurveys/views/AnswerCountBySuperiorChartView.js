// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(t,e,r,i,o,a){"use strict";return r.extend({className:"opinionSurveys-report-answerCount opinionSurveys-report-answerCountBySuperior",events:{"mouseup .highcharts-title":function(t){0===t.button&&(this.stacking="normal"===this.stacking?"percent":"normal",this.chart.destroy(),this.createChart())}},initialize:function(){this.chart=null,this.isLoading=!1,this.stacking="percent";var t=this.model.report;this.listenTo(t,"request",this.onModelLoading),this.listenTo(t,"sync",this.onModelLoaded),this.listenTo(t,"error",this.onModelError),this.listenTo(t,"change:answerCountBySuperior",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},calculateChartHeight:function(){var t=Object.keys(this.model.report.get("answerCountTotal")||{}).length,e=Object.keys(this.model.report.get("answerCountBySuperior")||{}).length;return Math.max(400,60*(t+e)+100*(e-1))},createChart:function(){var r=this;this.chart=new i.Chart({chart:{type:"bar",renderTo:this.el,height:this.calculateChartHeight()},exporting:{filename:e.bound("opinionSurveys","report:answerCountBySuperior:filename")},title:{text:e.bound("opinionSurveys","report:answerCountBySuperior:title:"+this.stacking)},noData:{},tooltip:{shared:!1,valueDecimals:0,headerFormatter:function(t){return a.questions.get(t.x).get("short")},extraRowsProvider:function(e,i){i.shift();var o=r.model.report,a=o.get("superiorToSurvey"),n=o.get("answerCountBySuperior"),s=e[0].point.category,h=e[0].point.series.options.stack;t.forEach(n,function(t,e){var o=r.model.surveys.get(a[e]).cacheMaps.superiors[e],n=t[s],c=n.no,l=n.na,u=n.yes;"percent"===r.stacking&&(c=Math.round(c/n.total*100),l=Math.round(l/n.total*100),u=Math.round(u/n.total*100)),i.push({point:null,color:h===e?"blue":"black",name:o.full,value:c,valueStyle:"color: red",decimals:0,extraColumns:'<td class="highcharts-tooltip-integer" style="color: orange">'+l+'</td><td class="highcharts-tooltip-integer" style="color: green">'+u+"</td>"})}),i.reverse()},positioner:function(t,e,r){var i=r.plotY;return r.plotY+e>this.chart.chartHeight&&(i-=r.plotY+e-this.chart.chartHeight+20),{x:this.chart.plotLeft-t-20,y:i}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",reversed:!0,itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories(),labels:{formatter:function(){var t=a.questions.get(this.value);return"<b>"+t.get("short").toLocaleUpperCase()+"</b> "+t.get("full")}}},yAxis:{min:0,title:{enabled:!1},allowDecimals:!1},plotOptions:{series:{stacking:this.stacking,dataLabels:{enabled:!0,color:"#FFFFFF",formatter:function(){return("normal"===r.stacking?this.y:Math.round(this.percentage))||""}},groupPadding:.05}},series:this.serializeSeries()})},serializeCategories:function(){var e=[];return t.forEach(this.model.report.get("answerCountTotal"),function(t,r){e.push(r)}),e},serializeSeries:function(){var e=this.model,r=e.report.get("answerCountBySuperior"),i=[],o={};return t.forEach(r,function(e,r){o[r]||(o[r]={yes:[],na:[],no:[]}),t.forEach(e,function(t,e){"total"!==e&&(o[r].yes.push(t.yes),o[r].na.push(t.na),o[r].no.push(t.no))}),i.push({id:r+"_yes",stack:r,name:"yes",data:o[r].yes,color:"#5cb85c",showInLegend:!1},{id:r+"_na",stack:r,name:"na",data:o[r].na,color:"#f0ad4e",showInLegend:!1},{id:r+"_no",stack:r,name:"no",data:o[r].no,color:"#d9534f",showInLegend:!1})}),i},updateChart:function(){this.chart.destroy(),this.createChart()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});