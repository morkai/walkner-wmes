define(["app/i18n","app/core/View","app/highcharts"],function(t,e,i){"use strict";return e.extend({className:"reports-4-workTimes",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:workTimes",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){var e=this.serializeChartData();this.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:t.bound("reports","filenames:4:workTimes")},title:{text:t.bound("reports","operator:workTimes:title")},noData:{},xAxis:[{type:"category",categories:e.downtimeCategories},{type:"category",opposite:!0,labels:{enabled:!1}}],yAxis:[{title:!1,labels:{format:"{value}h"},min:0},{title:!1,opposite:!0,labels:{format:"{value}h"},min:0}],tooltip:{useHTML:!0,formatter:function(e){var r=e.chart.series,a=[{name:r[0].name,value:r[0].data[0].y,color:r[0].color,decimals:2,suffix:"h"},{name:r[1].name,value:r[1].data[0].y,color:r[1].color,decimals:2,suffix:"h"},{name:t("reports","operator:workTimes:total"),value:r[0].data[0].y+r[1].data[0].y,color:"#333",decimals:2,suffix:"h"}];return"string"==typeof this.key&&a.push({name:this.key,value:this.y,color:this.series.color,decimals:2,suffix:"h"}),i.formatTableTooltip(null,a)},followPointer:!1,positioner:function(t){return{x:this.chart.chartWidth-t-this.chart.marginRight-5,y:this.chart.plotTop+5}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{grouping:!1,dataLabels:{enabled:!0,color:"#000"}}},series:[{name:t.bound("reports","operator:workTimes:otherWorks"),color:"rgba(0,170,255,.75)",borderWidth:0,type:"column",data:e.otherWorks,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t.bound("reports","operator:workTimes:sap"),color:"rgba(102,204,0,.75)",borderWidth:0,type:"column",data:e.sap,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t.bound("reports","operator:workTimes:downtime"),color:"rgba(255,0,0,.85)",borderWidth:0,type:"column",data:e.downtimes,xAxis:0,yAxis:1}]})},updateChart:function(){var t=this.serializeChartData(),e=this.chart,i=e.series;this.chart.xAxis[0].setCategories(t.downtimeCategories,!1),i[0].setData(t.otherWorks,!1),i[1].setData(t.sap,!1),i[2].setData(t.downtimes,!1),e.redraw(!1)},serializeChartData:function(){return this.model.get("workTimes")},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()}})});