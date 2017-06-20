// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/highcharts","app/core/View","app/reports/util/formatTooltipHeader","app/kaizenOrders/dictionaries"],function(t,e,i,r,a,o,s){"use strict";return a.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:averageDuration",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.model.getNlsDomain();this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:e.bound(t,"report:filenames:summary:averageDuration"),chartOptions:{title:{text:e.bound(t,"report:title:summary:averageDuration")},subtitle:{text:this.getSubtitle()}}},title:!1,noData:{},xAxis:{type:"datetime",labels:{formatter:function(){return i.getMoment(this.value).format("w")}},tickInterval:6048e5},yAxis:{title:!1,min:0,decimals:2,plotLines:[{color:"#5cb85c",width:2,value:5,zIndex:100}]},tooltip:{shared:!0,valueDecimals:2,headerFormatter:o.bind(this)},legend:{enabled:!1},plotOptions:{column:{borderWidth:0,dataLabels:{enabled:!0,formatter:function(){return 0===this.y?"":r.numberFormat(this.y,1)}}}},series:[{id:"averageDuration",type:"column",name:e.bound("suggestions","report:series:summary:averageDuration"),data:this.model.get("averageDuration")}]})},updateChart:function(){this.chart.destroy(),this.createChart()},getSubtitle:function(){var t=this.model.get("total"),i=(this.model.get("section")||[]).map(function(t){return s.sections.get(t).getLabel()}),a=(this.model.get("productFamily")||[]).map(function(t){return s.productFamilies.get(t).getLabel()}),o=[e("suggestions","report:subtitle:summary:averageDuration:short",{averageDuration:r.numberFormat(t.averageDuration,2)})];return i.length&&o.push(e("suggestions","report:subtitle:summary:section",{section:i.join(", ")})),a.length&&o.push(e("suggestions","report:subtitle:summary:productFamily",{productFamily:a.join(", ")})),o.join(" | ")},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});