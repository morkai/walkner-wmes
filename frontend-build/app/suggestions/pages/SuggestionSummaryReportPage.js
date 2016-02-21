// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/highcharts","app/core/View","app/kaizenOrders/dictionaries","../SuggestionSummaryReport","../views/SuggestionSummaryReportFilterView","../views/SuggestionTableAndChartView","../views/SuggestionAverageDurationChartView","../views/SuggestionSummaryCountChartView","../views/SuggestionSummaryPerUserChartView","app/suggestions/templates/summaryReportPage"],function(e,t,i,s,r,o,n,a,u,g,l){"use strict";return i.extend({layoutName:"page",pageId:"suggestionSummaryReport",template:l,breadcrumbs:[e.bound("suggestions","BREADCRUMBS:base"),e.bound("suggestions","BREADCRUMBS:reports:summary")],actions:function(){return[{label:e.bound("suggestions","PAGE_ACTION:print"),icon:"print",callback:this.togglePrintMode.bind(this)}]},initialize:function(){this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".suggestions-report-summary-averageDuration",this.averageDurationView),this.setView(".suggestions-report-summary-count",this.countView),this.setView(".suggestions-report-summary-suggestionOwners",this.perUserView),this.setView(".suggestions-report-summary-categories",this.perCategoryView),this.listenTo(this.model,"filtered",this.onFiltered),this.listenTo(this.model,"change:total",this.updateSubtitles)},defineViews:function(){this.filterView=new o({model:this.model}),this.averageDurationView=new a({model:this.model}),this.countView=new u({model:this.model}),this.perUserView=new g({metric:"suggestionOwners",model:this.model}),this.perCategoryView=new g({metric:"categories",model:this.model})},destroy:function(){document.body.classList.remove("is-print"),s.unload()},load:function(e){return s.loaded?e(this.model.fetch()):s.load().then(this.model.fetch.bind(this.model))},afterRender:function(){s.load(),this.updateSubtitles()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})},updateSubtitles:function(){var i=this.model.get("total");this.$id("averageDuration").html(e("suggestions","report:subtitle:summary:averageDuration",{averageDuration:t.numberFormat(i.averageDuration,2)})),this.$id("count").html(e("suggestions","report:subtitle:summary:count",i.count))},togglePrintMode:function(e){document.body.classList.toggle("is-print");var t=document.body.classList.contains("is-print");e.currentTarget.querySelector(".btn").classList.toggle("active",t),this.averageDurationView.chart.setSize(null,t?300:400,!1),this.averageDurationView.chart.reflow(),this.countView.updateChart(!0),this.countView.chart.setSize(null,t?300:400,!1),this.countView.chart.reflow(),this.perUserView.limit=t?10:-1,this.perUserView.updateChart(!0),this.perCategoryView.limit=t?10:-1,this.perCategoryView.updateChart(!0),t&&window.print()}})});