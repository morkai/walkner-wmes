// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/highcharts","app/i18n","app/core/View","app/data/companies","app/reports/util/formatTooltipHeader","highcharts.grouped-categories"],function(t,e,s,i,a,r){"use strict";return i.extend({className:function(){return"reports-chart reports-5-attendance"},initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.isFullscreen=!1,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:attendance ",t.debounce(this.render,1)),this.listenTo(this.displayOptions,"change",t.debounce(this.onDisplayOptionsChange,1))},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.isLoading&&this.chart.showLoading()),this.shouldRenderChart=!0},updateChart:function(t,e){var s=this.chart,i=this.serializeChartData();s.xAxis[0].setCategories(i.categories,!1),e&&this.updateExtremes(!1),i.series.forEach(function(t,e){s.series[e].setData(t,!1,!1,!1)}),t!==!1&&s.redraw(!1)},updateExtremes:function(t){var e=null;this.isFullscreen||this.model.get("isParent")&&"parent"!==this.displayOptions.get("extremes")||(e=this.displayOptions.get("maxAttendance")),this.chart.yAxis[0].setExtremes(null,e,t,!1)},onDisplayOptionsChange:function(){var t=this.displayOptions.changedAttributes(),e=!1;void 0!==t.maxAttendance&&(this.updateExtremes(!1),e=!0),t.companies&&(this.updateChart(!0,!1),e=!1),e&&this.chart.redraw(!1)},onFullscreen:function(t){this.isFullscreen=t,this.chart.series.forEach(function(e){e.update({dataLabels:{enabled:t}},!1)}),this.updateChart(!1)},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},createChart:function(){this.chart=new e.Chart({chart:{renderTo:this.el,zoomType:null},exporting:{filename:s("reports","hr:attendance:filename"),chartOptions:{legend:{enabled:!0}}},title:{text:s("reports","hr:attendance:title")},noData:{},xAxis:{labels:{rotation:0},categories:[]},yAxis:{title:!1},tooltip:{shared:!0,valueDecimals:1},legend:{enabled:!1},plotOptions:{column:{stacking:"normal"}},series:[{name:s("reports","hr:attendance:series:present"),type:"column",color:"#0000EE",data:[]},{name:s("reports","hr:attendance:series:absent"),type:"column",color:"#EE0000",data:[]}]})},serializeChartData:function(){if(this.isFullscreen)return this.serializeFullscreenChartData();var e=this.model,s=e.get("totalAttendance"),i={categories:[],series:[[],[]]};if(t.isEmpty(s))return i;var r=this.displayOptions;return t.forEach(s,function(t,e){if(r.isCompanyVisible(e)){var s=a.get(e);s?i.categories.push(s.get("shortName")||s.get("name")):i.categories.push(e);var n=Math.max(0,t.absence);i.series[0].push({y:t.demand-n,color:"#0000EE"}),i.series[1].push({y:n})}}),i},serializeFullscreenChartData:function(){var e=this,s=e.model,i=s.get("attendance"),n={categories:[],series:[[],[]]};if(t.isEmpty(i))return n;var o=e.displayOptions;return i.forEach(function(s){var i={name:r.call(e,s.x,!0),categories:[]};t.forEach(s.y,function(t,e){if(o.isCompanyVisible(e)){var s=a.get(e);i.categories.push(s?s.get("shortName")||s.get("name"):e);var r=Math.max(0,t.absence);n.series[0].push({y:t.demand-r,color:"#0000EE"}),n.series[1].push({y:r})}}),n.categories.push(i)}),n}})});