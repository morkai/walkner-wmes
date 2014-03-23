define(["app/i18n","app/core/View","app/highcharts"],function(t,e,i){return e.extend({className:"reports-4-quantities",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:quantities",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){function e(e,a,r){return'<tr><td style="color: '+r+'">'+e+":</td><td>"+i.numberFormat(a,0)+" "+t("reports","quantitySuffix")+"</td></tr>"}var a=this.serializeChartData();this.chart=new i.Chart({chart:{renderTo:this.el,zoomType:"x",plotBorderWidth:1,resetZoomButton:{relativeTo:"chart",position:{y:5}}},title:{text:t("reports","operator:quantities:title")},noData:{},xAxis:[{type:"category",categories:a.lossCategories},{type:"category",opposite:!0,labels:{enabled:!1}}],yAxis:[{title:!1,min:0},{title:!1,opposite:!0,min:0}],tooltip:{valueSuffix:t("reports","quantitySuffix"),useHTML:!0,formatter:function(i){var a=i.chart.series,r="<table>"+e(a[0].name,a[0].data[0].y,a[0].color)+e(a[1].name,a[1].data[0].y,a[1].color)+e(t("reports","operator:quantities:total"),a[0].data[0].y+a[1].data[0].y,"#333");return"string"==typeof this.key&&(r+=e(this.key,this.y,this.series.color)),r+="</table>"},followPointer:!1,positioner:function(t){return{x:this.chart.chartWidth-t-this.chart.marginRight-5,y:this.chart.plotTop+5}}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{grouping:!1,dataLabels:{enabled:!0,color:"#000"}}},series:[{name:t("reports","operator:quantities:bad"),color:"#ee0000",borderWidth:0,type:"column",data:a.bad,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t("reports","operator:quantities:good"),color:"#66cc00",borderWidth:0,type:"column",data:a.good,xAxis:1,yAxis:0,stacking:"normal",pointPadding:0,groupPadding:0},{name:t("reports","operator:quantities:loss"),color:"orange",borderWidth:0,type:"column",data:a.losses,xAxis:0,yAxis:1}]})},updateChart:function(){var t=this.serializeChartData(),e=this.chart.series;this.chart.xAxis[0].setCategories(t.lossCategories,!1),e[0].setData(t.bad,!1),e[1].setData(t.good,!1),e[2].setData(t.losses,!0)},serializeChartData:function(){return this.model.get("quantities")},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()}})});