// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(e,t,i,r,s,o){"use strict";return i.extend({className:"opinionSurveys-report-responsePercentByDivision",initialize:function(){this.chart=null,this.isLoading=!1;var e=this.model.report;this.listenTo(e,"request",this.onModelLoading),this.listenTo(e,"sync",this.onModelLoaded),this.listenTo(e,"error",this.onModelError),this.listenTo(e,"change:responseCountTotal",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){this.chart=new r.Chart({chart:{type:"column",renderTo:this.el,height:500},exporting:{filename:t.bound("opinionSurveys","report:responsePercentByDivision:filename")},title:{text:t.bound("opinionSurveys","report:responsePercentByDivision:title")},noData:{},tooltip:{shared:!0,valueDecimals:0,valueSuffix:"%"},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories()},yAxis:{min:0,max:100,title:{enabled:!1},plotLines:this.serializePlotLines()},series:this.serializeSeries()})},serializeCategories:function(){var t=[],i=this.model.report,r=i.get("responseCountTotal");return e.forEach(i.get("usedDivisions"),function(e,i){var s=r[i];s&&t.push(o.divisions.get(i).getLabel())}),t},serializeSeries:function(){var i=this.model,r=i.report,s=r.get("usedSurveys"),n=i.surveys.filter(function(e){return s[e.id]}),a=Object.keys(r.get("usedEmployers")),h=r.get("responseCountTotal"),l=[],c={},d=this.getRefValue(),u=[];return e.forEach(a,function(e){var t=o.employers.get(e),i={id:e,name:t.getLabel(),data:[],dataLabels:{enabled:!0},color:t.get("color")};l.push(i),c[e]=i}),e.forEach(r.get("usedDivisions"),function(t,i){var r=h[i];r&&(e.forEach(l,function(t){var s=r[t.id],o=0;e.forEach(n,function(e){var r=e.cacheMaps.employeeCount;o+=r[i]&&r[i][t.id]?r[i][t.id]:0}),t.data.push(o?Math.round(s/o*100):0)}),u.push(d))}),l.push({type:"line",name:t("opinionSurveys","report:refValue"),data:u,color:"#5cb85c",showInLegend:!1,marker:{radius:0}}),l},serializePlotLines:function(){var e=[],t=this.getRefValue();return t&&e.push({id:"refValue",color:"#5cb85c",width:2,value:t,zIndex:1e3}),e},getRefValue:function(){return o.settings.getResponseReference()},updateChart:function(){for(var t=this.chart,i=this.serializePlotLines();t.series.length;)t.series[0].remove(!1);t.xAxis[0].setCategories(this.serializeCategories(),!1),t.yAxis[0].removePlotLine("refValue"),i.length&&t.yAxis[0].addPlotLine(i[0]),e.forEach(this.serializeSeries(),function(e){t.addSeries(e,!1)}),t.redraw()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});