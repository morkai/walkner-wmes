define(["underscore","app/i18n","app/time","app/core/View","app/highcharts"],function(t,e,i,r,a){"use strict";return r.extend({className:"reports-9-chart",initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"recountGroupUtilization",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){this.chart=new a.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:e.bound("reports","9:chart:filename")},title:{text:e.bound("reports","9:chart:title")},noData:{},xAxis:{type:"category",categories:t.pluck(this.model.get("months"),"label")},yAxis:{title:!1,labels:{format:"{value}%"},min:0},tooltip:{shared:!0,valueSuffix:"%",valueDecimals:0},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{borderWidth:0,dataLabels:{enabled:!0,color:"#000"}}},series:this.serializeSeries()})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeSeries:function(){var e=this.serializeChartData(),i=[];return t.forEach(this.model.get("groups"),function(r){var a=e[r._id],o=null===r._id;o&&!t.any(a,function(t){return t>0})||i.push({id:r._id,name:r.name,type:"column",data:a,color:o?"#eee":r.color,dataLabels:{enabled:!0}})}),i},serializeChartData:function(){var e=this.model.get("groups"),i={};return t.forEach(e,function(t){i[t._id]=[].concat(t.utilization)}),i},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.interval=null,this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});