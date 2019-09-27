define(["underscore","app/highcharts","app/core/View"],function(t,e,i){"use strict";return i.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:totals",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData(),i=this.model.get("printable");this.chart=new e.Chart({chart:{renderTo:this.el,plotBorderWidth:1,height:i?200:400,zoomType:void 0},exporting:{filename:this.t("report:oql:filename:"+this.options.property),chartOptions:{title:{text:this.t("report:oql:title:"+this.options.property)},legend:{enabled:!1}},buttons:{contextButton:{enabled:!i}}},title:!1,noData:{},xAxis:{categories:t.categories,showEmpty:!1},yAxis:[{title:!1,allowDecimals:!1},{title:!1,allowDecimals:!1,opposite:!0,labels:{format:"{value}%"},min:0,max:100,plotLines:[{value:80,color:"#E00",width:1,zIndex:1}]}],tooltip:{shared:!0,valueDecimals:0,headerFormatter:function(t){return t.points[0].point.name}},legend:{enabled:!1},plotOptions:{column:{tooltip:{valueSuffix:"PCE"},dataLabels:{enabled:!i,y:15,style:{color:"#000",fontSize:"14px",fontWeight:"bold",textShadow:"0 0 6px #fff, 0 0 3px #fff"},formatter:function(){return this.y||""}}},line:{tooltip:{valueSuffix:"%"}}},series:t.series})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeChartData:function(){for(var t=this.options.property,e=[],i=[{id:"value",type:"column",name:this.t("report:oql:qtyNok"),data:[],color:"#337ab7"},{id:"pareto",type:"line",name:this.t("report:oql:pareto"),data:[],color:"#f0ad4e",yAxis:1}],o=this.model,a=o.get("printable"),r=o.getTopCount(),s=o.get("top")||{},n=s[t]||[],h=0,l=0;l<r;++l){var d=n[l];if(!d)break;var c=d[0];!a&&this.options.resolveTitle&&(c+=": "+this.options.resolveTitle(c,!0)),h+=d[1],e.push(c),i[0].data.push({name:d[0],y:d[1]}),i[1].data.push(h/s.qtyNok*100)}return{categories:e,series:i}},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});