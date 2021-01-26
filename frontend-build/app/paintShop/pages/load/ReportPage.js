define(["jquery","app/core/View","app/core/util/bindLoadingMessage","app/paintShop/PaintShopSettingCollection","app/paintShop/PaintShopLoadReport","app/paintShop/views/load/ReportFilterView","app/paintShop/views/load/DurationChartView","app/paintShop/views/load/TableAndChartView","app/paintShop/templates/load/report","i18n!app/nls/reports"],function(t,e,i,s,o,n,r,h,a){"use strict";return e.extend({template:a,layoutName:"page",breadcrumbs:function(){return[{href:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),label:this.t("BREADCRUMB:base")},{href:"#paintShop/load/monitoring",label:this.t("BREADCRUMB:load")},this.t("load:report:breadcrumb")]},actions:function(){return[{href:"#paintShop/load/history",icon:"list",label:this.t("load:history:pageAction")},{href:"#paintShop;settings?tab=load",icon:"cogs",label:this.t("PAGE_ACTION:settings"),privileges:"PAINT_SHOP:MANAGE"}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-filter",this.filterView),this.setView("#-duration1",this.durationView1),this.setView("#-duration2",this.durationView2),this.setView("#-duration3",this.durationView3),this.setView("#-reasons2",this.reasonsView2),this.setView("#-reasons3",this.reasonsView3),this.setView("#-losses2",this.lossesView2),this.setView("#-losses3",this.lossesView3)},defineModels:function(){this.settings=i(new s(null,{pubsub:this.pubsub}),this),this.report=i(this.model,this)},defineViews:function(){this.filterView=new n({model:this.report}),this.durationView1=new r({counter:1,model:this.report,settings:this.settings}),this.durationView2=new r({counter:2,model:this.report,settings:this.settings}),this.durationView3=new r({counter:3,model:this.report,settings:this.settings}),this.reasonsView2=new h({counter:2,metric:"reasons",model:this.report}),this.reasonsView3=new h({counter:3,metric:"reasons",model:this.report}),this.lossesView2=new h({counter:2,metric:"losses",model:this.report}),this.lossesView3=new h({counter:3,metric:"losses",model:this.report})},defineBindings:function(){this.listenTo(this.report,"filtered",this.onReportFiltered)},load:function(t){return t(this.settings.fetch(),this.report.fetch())},onReportFiltered:function(){this.broker.publish("router.navigate",{url:this.report.genClientUrl(),trigger:!1,replace:!0}),this.promised(this.report.fetch())}})});