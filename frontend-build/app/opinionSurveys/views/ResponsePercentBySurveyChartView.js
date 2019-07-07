define(["underscore","app/i18n","app/core/View","app/highcharts","app/data/colorFactory","../dictionaries"],function(e,t,i,r,o,s){"use strict";return i.extend({className:"opinionSurveys-report-responsePercentBySurvey",initialize:function(){this.chart=null,this.isLoading=!1;var e=this.model.report;this.listenTo(e,"request",this.onModelLoading),this.listenTo(e,"sync",this.onModelLoaded),this.listenTo(e,"error",this.onModelError),this.listenTo(e,"change:responseCountBySurvey",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){this.chart=new r.Chart({chart:{type:"column",renderTo:this.el,height:500},exporting:{filename:t.bound("opinionSurveys","report:responsePercentBySurvey:filename")},title:{text:t.bound("opinionSurveys","report:responsePercentBySurvey:title")},noData:{},tooltip:{shared:!0,valueDecimals:0,valueSuffix:"%"},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom",itemStyle:{fontSize:"14px"}},xAxis:{categories:this.serializeCategories()},yAxis:{min:0,max:100,title:{enabled:!1},plotLines:this.serializePlotLines()},series:this.serializeSeries()})},serializeCategories:function(){var t=this.model.surveys,i=[];return e.forEach(this.model.report.get("responseCountBySurvey"),function(e,r){var o=t.get(r);i.push(o?o.getLabel():r)}),i},serializeSeries:function(){var i=this.model.surveys,r=Object.keys(this.model.report.get("usedEmployers")),o=[],a={},n=this.getRefValue(),h=[];return e.forEach(r,function(e){var t=s.employers.get(e),i={id:e,name:t.getLabel(),data:[],dataLabels:{enabled:!0},color:t.get("color")};o.push(i),a[e]=i}),e.forEach(this.model.report.get("responseCountBySurvey"),function(t,r){var s=i.get(r),a=s?s.cacheMaps.employeeCount:0;e.forEach(o,function(i){var r=0,o=0;e.forEach(t,function(e,t){r+=e[i.id]||0,o+=a[t]&&a[t][i.id]?a[t][i.id]:0}),i.data.push(o?Math.round(r/o*100):0)}),h.push(n)}),o.push({type:"line",name:t("opinionSurveys","report:refValue"),data:h,color:"#5cb85c",showInLegend:!1,marker:{radius:0}}),o},serializePlotLines:function(){var e=[],t=this.getRefValue();return t&&e.push({id:"refValue",color:"#5cb85c",width:2,value:t,zIndex:1e3}),e},getRefValue:function(){return s.settings.getResponseReference()},updateChart:function(){this.chart.destroy(),this.createChart()},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});