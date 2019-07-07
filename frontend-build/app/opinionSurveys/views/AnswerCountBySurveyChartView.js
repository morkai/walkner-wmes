define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(t,e,r,a,i,n){"use strict";return r.extend({className:"opinionSurveys-report-answerCount opinionSurveys-report-answerCountBySurvey",events:{"mouseup .highcharts-title":function(t){0===t.button&&(this.stacking="normal"===this.stacking?"percent":"normal",this.chart.destroy(),this.createChart())}},initialize:function(){this.chart=null,this.isLoading=!1,this.stacking="percent";var t=this.model.report;this.listenTo(t,"request",this.onModelLoading),this.listenTo(t,"sync",this.onModelLoaded),this.listenTo(t,"error",this.onModelError),this.listenTo(t,"change:answerCountBySurvey",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},calculateChartHeight:function(){var t=Object.keys(this.model.report.get("answerCountTotal")||{}).length,e=Object.keys(this.model.report.get("answerCountBySurvey")||{}).length;return Math.max(400,60*(t+e)+100*(e-1))},createChart:function(){var r=this;this.chart=new a.Chart({chart:{type:"bar",renderTo:this.el,height:this.calculateChartHeight()},exporting:{filename:e.bound("opinionSurveys","report:answerCountBySurvey:filename")},title:{text:e.bound("opinionSurveys","report:answerCountBySurvey:title:"+this.stacking)},noData:{},tooltip:{shared:!1,valueDecimals:0,headerFormatter:function(t){return n.questions.get(t.x).get("short")},extraRowsProvider:function(e,a){a.shift();var i=r.model.report.get("answerCountBySurvey"),n=e[0].point.category,o=e[0].point.series.options.stack;t.forEach(i,function(t,e){var i=r.model.surveys.get(e),s=t[n]||{no:0,na:0,yes:0},h=s.no,c=s.na,l=s.yes;"percent"===r.stacking&&(h=h?Math.round(h/s.total*100):0,c=c?Math.round(c/s.total*100):0,l=l?Math.round(l/s.total*100):0),a.push({point:null,color:o===e?"blue":"black",name:i?i.getLabel():e,value:h,valueStyle:"color: red",decimals:0,extraColumns:'<td class="highcharts-tooltip-integer" style="color: orange">'+c+'</td><td class="highcharts-tooltip-integer" style="color: green">'+l+"</td>"})}),a.reverse()},positioner:function(t,e,r){var a=r.plotY;return r.plotY+e>this.chart.chartHeight&&(a-=r.plotY+e-this.chart.chartHeight+20),{x:this.chart.plotLeft-t-20,y:a}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",reversed:!0,itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories(),labels:{formatter:function(){var t=n.questions.get(this.value);return"<b>"+t.get("short").toLocaleUpperCase()+"</b> "+t.get("full")}}},yAxis:{min:0,title:{enabled:!1},allowDecimals:!1},plotOptions:{series:{stacking:this.stacking,dataLabels:{enabled:!0,color:"#FFFFFF",formatter:function(){return("normal"===r.stacking?this.y:Math.round(this.percentage))||""}},groupPadding:.05}},series:this.serializeSeries()})},serializeCategories:function(){var e=[];return t.forEach(this.model.report.get("answerCountTotal"),function(t,r){e.push(r)}),e},serializeSeries:function(){var e=this.model.report.get("answerCountBySurvey"),r=[],a={};return t.forEach(e,function(e,i){a[i]||(a[i]={yes:[],na:[],no:[]}),t.forEach(e,function(t,e){"total"!==e&&(a[i].yes.push(t.yes),a[i].na.push(t.na),a[i].no.push(t.no))}),r.push({id:i+"_yes",stack:i,name:"yes",data:a[i].yes,color:"#5cb85c",showInLegend:!1},{id:i+"_na",stack:i,name:"na",data:a[i].na,color:"#f0ad4e",showInLegend:!1},{id:i+"_no",stack:i,name:"no",data:a[i].no,color:"#d9534f",showInLegend:!1})}),r},updateChart:function(){this.chart.destroy(),this.createChart()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});