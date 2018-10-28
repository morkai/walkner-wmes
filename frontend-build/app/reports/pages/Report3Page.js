define(["underscore","app/i18n","app/core/View","../Report3","../Report3Query","../views/3/FilterView","../views/3/TableSummaryView","../views/3/OeeChartView","../views/3/DowntimeChartView","app/reports/templates/3/page"],function(e,i,t,r,s,n,o,a,h,l){"use strict";return t.extend({layoutName:"page",pageId:"report3",template:l,breadcrumbs:[i.bound("reports","BREADCRUMBS:3")],actions:function(){var e=this;return[{label:i.bound("reports","PAGE_ACTION:3:exportTable"),icon:"download",callback:function(){var t=this.querySelector(".btn");t.disabled=!0;var r=e.ajax({type:"POST",url:"/reports;download?filename="+i("reports","filenames:3:table"),contentType:"text/csv",data:e.tableSummaryView.serializeToCsv()});r.done(function(e){window.location.href="/reports;download?key="+e}),r.always(function(){t.disabled=!1})}}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".reports-3-tableSummary-container",this.tableSummaryView),this.setView(".reports-3-oeeChart-container",this.oeeChartView),this.setView(".reports-3-downtimeChart-container",this.downtimeChartView),this.once("afterRender",function(){this.promised(this.report.fetch())})},defineModels:function(){this.query=s.fromRqlQuery(this.options.rql),this.report=new r(null,{query:this.query}),this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.query,"change:divisions change:subdivisionType",e.debounce(this.recalcSummaries,1)),this.listenTo(this.query,"change:prodLines",this.report.calcChartSummary.bind(this.report))},defineViews:function(){this.filterView=new n({model:this.query}),this.tableSummaryView=new o({model:this.report}),this.oeeChartView=new a({model:this.report}),this.downtimeChartView=new h({model:this.report}),this.listenTo(this.oeeChartView,"seriesVisibilityChanged",this.onSeriesVisibilityChanged),this.listenTo(this.downtimeChartView,"seriesVisibilityChanged",this.onSeriesVisibilityChanged)},onQueryChange:function(e,i){this.broker.publish("router.navigate",{url:this.report.url()+"?"+this.query.serializeToString(),replace:!0,trigger:!1}),i&&i.reset&&this.promised(this.report.fetch())},onSeriesVisibilityChanged:function(e,i){this.query.changeColumnVisibility(e,i)},recalcSummaries:function(){this.report.calcTableSummary(),this.report.calcChartSummary()}})});