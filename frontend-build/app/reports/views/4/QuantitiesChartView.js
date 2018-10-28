define(["app/i18n","app/core/View","app/highcharts"],function(t,i,e){"use strict";return i.extend({className:"reports-4-quantities",initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:quantities",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var i=this.serializeChartData();this.chart=new e.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:t.bound("reports","filenames:4:quantities")},title:{text:t.bound("reports","operator:quantities:title")},noData:{},xAxis:[{type:"category",categories:i.lossCategories},{type:"category",opposite:!0,labels:{enabled:!1}}],yAxis:[{title:!1,min:0},{title:!1,opposite:!0,min:0}],tooltip:{formatter:function(i){var a=t("reports","quantitySuffix"),o=i.chart.series,r=[{name:o[0].name,value:o[0].data[0].y,color:o[0].color,decimals:0,suffix:a},{name:o[1].name,value:o[1].data[0].y,color:o[1].color,decimals:0,suffix:a},{name:t("reports","operator:quantities:total"),value:o[0].data[0].y+o[1].data[0].y,color:"#333",decimals:0,suffix:a}];return"string"==typeof this.key&&r.push({name:this.key,value:this.y,color:this.series.color,decimals:0,suffix:a}),e.formatTableTooltip(null,r)},followPointer:!1,positioner:function(t){return{x:this.chart.chartWidth-t-this.chart.marginRight-5,y:this.chart.plotTop+5}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{grouping:!1,dataLabels:{enabled:!0,color:"#000"}}},series:[{name:t.bound("reports","operator:quantities:bad"),color:"rgba(255,0,0,.75)",borderWidth:0,type:"column",data:i.bad,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t.bound("reports","operator:quantities:good"),color:"rgba(102,204,0,.75)",borderWidth:0,type:"column",data:i.good,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t.bound("reports","operator:quantities:loss"),color:"orange",borderWidth:0,type:"column",data:i.losses,xAxis:0,yAxis:1}]})},updateChart:function(){var t=this.serializeChartData(),i=this.chart.series;this.chart.xAxis[0].setCategories(t.lossCategories,!1),i[0].setData(t.bad,!1),i[1].setData(t.good,!1),i[2].setData(t.losses,!0)},serializeChartData:function(){return this.model.get("quantities")},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});