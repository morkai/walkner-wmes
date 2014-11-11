// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/time","app/i18n","app/highcharts","app/core/View","../util/formatTooltipHeader"],function(t,i,e,a,n,o,r){return o.extend({className:"reports-3-downtimeChart",initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:chartSummary",this.render),this.onResize=t.debounce(this.onResize.bind(this),100),i(window).resize(this.onResize)},destroy:function(){i(window).off("resize",this.onResize),null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.serializeChartData(),i=this.model.query;this.chart=new n.Chart({chart:{renderTo:this.el,plotBorderWidth:1,spacing:[0,0,0,0],reflow:!1},exporting:{filename:a("reports","filenames:3:downtime")},title:!1,noData:{},xAxis:{type:"datetime"},yAxis:[{title:!1,labels:{format:"{value}h"},min:0},{title:!1,opposite:!0,gridLineWidth:0,min:0,allowDecimals:!1}],tooltip:{shared:!0,headerFormatter:this.formatTooltipHeader.bind(this),valueDecimals:2},legend:{layout:"horizontal",align:"center",verticalAlign:"top",itemWidth:185,margin:14},plotOptions:{series:{events:{legendItemClick:function(t){this.trigger("seriesVisibilityChanged",t.target.options.id,!t.target.visible)}.bind(this)}},line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:this.getMarkerStyles(t.adjustingDuration.length)}},series:[{id:"adjustingDuration",name:a("reports","oee:adjusting:duration"),type:"column",yAxis:0,data:t.adjustingDuration,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("adjustingDuration")},{id:"maintenanceDuration",name:a("reports","oee:maintenance:duration"),type:"column",yAxis:0,data:t.maintenanceDuration,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("maintenanceDuration")},{id:"renovationDuration",name:a("reports","oee:renovation:duration"),type:"column",yAxis:0,data:t.renovationDuration,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("renovationDuration")},{id:"malfunctionDuration",name:a("reports","oee:malfunction:duration"),type:"line",yAxis:0,data:t.malfunctionDuration,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("malfunctionDuration")},{id:"mttr",name:a("reports","oee:mttr"),type:"line",yAxis:0,data:t.mttr,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("mttr")},{id:"mtbf",name:a("reports","oee:mtbf"),type:"line",yAxis:0,data:t.mtbf,tooltip:{valueSuffix:"h"},visible:i.isColumnVisible("mtbf")},{id:"malfunctionCount",name:a("reports","oee:malfunction:count"),type:"line",yAxis:1,data:t.malfunctionCount,tooltip:{valueSuffix:a("reports","quantitySuffix"),valueDecimals:0},visible:i.isColumnVisible("malfunctionCount")},{id:"majorMalfunctionCount",name:a("reports","oee:majorMalfunction:count"),type:"line",yAxis:1,data:t.majorMalfunctionCount,tooltip:{valueSuffix:a("reports","quantitySuffix"),valueDecimals:0},visible:i.isColumnVisible("majorMalfunctionCount")}]})},updateChart:function(){var t=this.serializeChartData(),i=this.getMarkerStyles(t.adjustingDuration.length),e=this.chart.series;e[6].update({marker:i},!1),e[7].update({marker:i},!1),e.forEach(function(i){i.setData(t[i.options.id],!1)}),this.chart.redraw(!1)},serializeChartData:function(){return this.model.get("chartSummary")},formatTooltipHeader:r,getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onResize:function(){this.chart&&this.chart.reflow()}})});