define(["underscore","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader","app/reports/util/formatXAxis","app/wmes-osh-reports/templates/metrics/riskyObsTable","app/wmes-osh-reports/templates/metrics/tableAndChart"],function(t,e,i,s,r,a,o){"use strict";return i.extend({template:o,initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:riskyObs",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading()),this.updateTable()},createChart:function(){const t=this.serializeChartSeries();this.chart=new e.Chart({chart:{renderTo:this.$id("chart")[0],plotBorderWidth:1,spacing:[10,1,1,1]},exporting:{filename:this.options.filename,chartOptions:{title:{text:this.options.title},legend:{enabled:!0}},noDataLabels:!1},title:!1,noData:{},xAxis:{type:"datetime",labels:r.labels(this)},yAxis:[{title:!1,min:0,allowDecimals:!0,opposite:!1,labels:{format:"{value}%"}}],tooltip:{shared:!0,headerFormatter:s.bind(this)},legend:{enabled:!0},plotOptions:{column:{borderWidth:0}},series:t})},updateChart:function(){this.chart.destroy(),this.createChart()},updateTable:function(){const t=this.model.get("riskyObs")||{series:{}};this.$id("table").html(this.renderPartialHtml(a,{months:(t.months||[]).map(t=>r(this,{value:t})),cards:t.cards||[],behaviors:t.behaviors||[],workConditions:t.workConditions||[],risky:t.risky||[],min:t.series.min?t.series.min.data:[],max:t.series.max?t.series.max.data:[],itm:t.series.itm?t.series.itm.data:[]}))},serializeChartSeries:function(){return Object.values((this.model.get("riskyObs")||{series:{}}).series)},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});