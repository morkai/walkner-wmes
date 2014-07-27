// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/View","app/highcharts"],function(t,e,r){return e.extend({className:"reports-4-workTimes",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:workTimes",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){function e(t,e,i){return'<tr><td><span style="color: '+i+'">●</span> '+t+":</td><td>"+r.numberFormat(e)+"h</td></tr>"}var i=this.serializeChartData();this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:t("reports","filenames:4:workTimes")},title:{text:t("reports","operator:workTimes:title")},noData:{},xAxis:[{type:"category",categories:i.downtimeCategories},{type:"category",opposite:!0,labels:{enabled:!1}}],yAxis:[{title:!1,labels:{format:"{value}h"},min:0},{title:!1,opposite:!0,labels:{format:"{value}h"},min:0}],tooltip:{valueSuffix:"h",useHTML:!0,formatter:function(r){var i=r.chart.series,a="<table>"+e(i[0].name,i[0].data[0].y,i[0].color)+e(i[1].name,i[1].data[0].y,i[1].color)+e(t("reports","operator:workTimes:total"),i[0].data[0].y+i[1].data[0].y,"#333");return"string"==typeof this.key&&(a+=e(this.key,this.y,this.series.color)),a+="</table>"},followPointer:!1,positioner:function(t){return{x:this.chart.chartWidth-t-this.chart.marginRight-5,y:this.chart.plotTop+5}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{grouping:!1,dataLabels:{enabled:!0,color:"#000"}}},series:[{name:t("reports","operator:workTimes:otherWorks"),color:"rgba(0,170,255,.75)",borderWidth:0,type:"column",data:i.otherWorks,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t("reports","operator:workTimes:sap"),color:"rgba(102,204,0,.75)",borderWidth:0,type:"column",data:i.sap,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t("reports","operator:workTimes:downtime"),color:"rgba(255,0,0,.85)",borderWidth:0,type:"column",data:i.downtimes,xAxis:0,yAxis:1}]})},updateChart:function(){var t=this.serializeChartData(),e=this.chart.series;this.chart.xAxis[0].setCategories(t.downtimeCategories,!1),e[0].setData(t.otherWorks,!1),e[1].setData(t.sap,!1),e[2].setData(t.downtimes,!0)},serializeChartData:function(){return this.model.get("workTimes")},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()}})});