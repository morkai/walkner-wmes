// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/time","app/i18n","app/core/View","app/highcharts"],function(t,e,i,a,o,r){return o.extend({className:"reports-3-oeeChart",initialize:function(){this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:chartSummary",this.render),this.onResize=t.debounce(this.onResize.bind(this),100),e(window).resize(this.onResize)},destroy:function(){e(window).off("resize",this.onResize),null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.loading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData();this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1,spacing:[0,0,0,0],reflow:!1},exporting:{filename:a("reports","filenames:3:oee")},title:!1,noData:{},xAxis:{type:"datetime"},yAxis:[{title:!1,labels:{format:"{value}h"},min:0},{title:!1,opposite:!0,gridLineWidth:0,labels:{format:"{value}%"},min:0}],tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this),valueDecimals:2},legend:{layout:"horizontal",align:"center",verticalAlign:"top",itemWidth:175,margin:14},plotOptions:{line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:this.getMarkerStyles(t.totalAvailabilityH.length)}},series:[{name:a("reports","oee:totalAvailability"),type:"column",yAxis:0,data:t.totalAvailabilityH,tooltip:{valueSuffix:"h"}},{name:a("reports","oee:operationalAvailability:h"),type:"column",yAxis:0,data:t.operationalAvailabilityH,tooltip:{valueSuffix:"h"}},{name:a("reports","oee:exploitation:h"),type:"column",yAxis:0,data:t.exploitationH,tooltip:{valueSuffix:"h"}},{name:a("reports","oee:oee"),type:"line",yAxis:1,data:t.oee,tooltip:{valueSuffix:"%"}},{name:a("reports","oee:operationalAvailability:%"),type:"line",yAxis:1,data:t.operationalAvailabilityP,tooltip:{valueSuffix:"%"}},{name:a("reports","oee:exploitation:%"),type:"line",yAxis:1,data:t.exploitationP,tooltip:{valueSuffix:"%"}}]})},updateChart:function(){var t=this.serializeChartData(),e=this.getMarkerStyles(t.totalAvailabilityH.length),i=this.chart.series;i[3].update({marker:e},!1),i[4].update({marker:e},!1),i[5].update({marker:e},!1),i[0].setData(t.totalAvailabilityH,!1),i[1].setData(t.operationalAvailabilityH,!1),i[2].setData(t.exploitationH,!1),i[3].setData(t.oee,!1),i[4].setData(t.operationalAvailabilityP,!1),i[5].setData(t.exploitationP,!0)},serializeChartData:function(){return this.model.get("chartSummary")},formatTooltipHeader:function(t){var e=i.getMoment(t.x),o=this.model.query.get("interval")||"day";return e.format(a("reports","tooltipHeaderFormat:"+o,{}))},getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onResize:function(){this.chart&&this.chart.reflow()}})});