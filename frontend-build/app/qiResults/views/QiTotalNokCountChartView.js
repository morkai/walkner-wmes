// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader","../dictionaries"],function(t,e,i,o,r,n){"use strict";return o.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:groups",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this,o=t.serializeChartData(),n=t.model;t.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1,height:300,events:{click:function(e){n.selectNearestGroup(t.mouseOverX||e.xAxis[0].value)}}},exporting:{filename:e.bound("qiResults","report:filenames:totalNokCount"),chartOptions:{title:{text:e.bound("qiResults","report:title:totalNokCount")},legend:{enabled:!1}}},title:!1,noData:{},xAxis:{type:"datetime"},yAxis:{title:!1,min:0,allowDecimals:!1},tooltip:{shared:!0,valueDecimals:0,headerFormatter:function(e){return t.mouseOverX=e.x,r.apply(t,arguments)}},legend:{enabled:!0},plotOptions:{series:{cursor:"pointer",events:{click:function(t){n.set("selectedGroupKey",t.point.x)}}},column:{dataLabels:{enabled:!0,style:{color:"#000",fontSize:"12px",fontWeight:"bold",textShadow:"0 0 6px #fff, 0 0 3px #fff"},formatter:function(){return this.y||""}}},line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:t.getMarkerStyles(o.nokCount.length)}},series:[{type:"column",name:e.bound("qiResults","report:series:nokCount"),data:o.nokCount,color:"#d9534f"},{type:"line",name:e.bound("qiResults","report:series:maxNokCount"),data:o.maxNokCount,color:"#5cb85c"}]})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeChartData:function(){var e={nokCount:[],maxNokCount:[]},i=n.settings.getMaxNokPerDay();return t.forEach(this.model.get("groups"),function(t){e.nokCount.push({x:t.key,y:t.totalNokCount}),e.maxNokCount.push({x:t.key,y:t.workingDayCount*i})}),e},getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});