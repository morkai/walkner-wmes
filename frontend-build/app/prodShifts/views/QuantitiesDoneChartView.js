// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/core/View","app/highcharts"],function(t,e,a,i,s){"use strict";return i.extend({initialize:function(){this.chart=null,this.listenTo(this.model,"change:quantitiesDone",this.updateChart)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart||setTimeout(this.createChart.bind(this),1)},createChart:function(){var t=this.serializeChartData();this.chart=new s.Chart({chart:{renderTo:this.el,height:this.options.height||350,reflow:this.options.reflow!==!1,spacingBottom:0},title:this.options.showTitle===!1?null:{text:a("prodShifts","charts:quantitiesDone:title"),style:{fontSize:"18px",color:"#333"}},noData:{},legend:{enabled:this.options.showLegend!==!1},tooltip:{shared:!0,valueDecimals:0},xAxis:{categories:t.categories},yAxis:{title:!1},plotOptions:{column:{dataLabels:{enabled:!0},tooltip:{valueSuffix:a("prodShifts","charts:quantitiesDone:unit")}}},series:[{name:a("prodShifts","charts:quantitiesDone:series:planned"),type:"column",data:t.planned},{name:a("prodShifts","charts:quantitiesDone:series:actual"),type:"column",data:t.actual}]}),this.chart.reflow()},updateChart:function(){if(this.chart){var t=this.serializeChartData();this.chart.series[0].setData(t.planned,!0),this.chart.series[1].setData(t.actual,!0)}},serializeChartData:function(){for(var t={categories:[],planned:[],actual:[]},a=Date.parse(this.model.get("date")),i=0;i<8;++i)t.categories.push(e.format(a,"HH:mm")),a+=36e5;return this.model.get("quantitiesDone").forEach(function(e){t.planned.push(e.planned),t.actual.push(e.actual)}),t}})});