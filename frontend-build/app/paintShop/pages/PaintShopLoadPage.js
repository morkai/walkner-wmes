// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","../PaintShopSettingCollection","../PaintShopLoadStats","../PaintShopLoadRecent","../PaintShopLoadReport","../views/PaintShopLoadFilterView","../views/PaintShopLoadReportView","../views/PaintShopLoadStatsView","../views/PaintShopLoadRecentView","app/paintShop/templates/load/page","i18n!app/nls/reports"],function(t,e,i,s,o,n,r,a,h,p,c,d,u){"use strict";var w="ps-load",l=window.parent!==window||"/"!==window.location.pathname;return i.extend({template:u,layoutName:l?"blank":"page",pageId:"paintShopLoad",breadcrumbs:function(){return[{href:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),label:e.bound("paintShop","BREADCRUMBS:base")},e.bound("paintShop","BREADCRUMBS:load")]},actions:[{href:"#paintShop;settings?tab=load",icon:"cogs",label:e.bound("paintShop","PAGE_ACTIONS:settings"),privileges:"PAINT_SHOP:MANAGE"}],events:{"mousedown #-switchApps":function(t){this.startActionTimer("switchApps",t)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(t){this.startActionTimer("reboot",t)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(t){this.startActionTimer("shutdown",t)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},localTopics:{"socket.connected":function(){this.promised(this.settings.fetch()),this.promised(this.stats.fetch()),this.promised(this.recent.fetch())}},remoteTopics:{"paintShop.load.updated":function(t){this.stats.set(t.stats),this.recent.update(t.items)}},initialize:function(){this.actionTimer={action:null,time:null},this.defineModels(),this.defineViews(),this.defineBindings(),this.report&&(this.setView("#-filter",this.filterView),this.setView("#-report",this.reportView)),this.setView("#-stats",this.statsView),this.setView("#-recent",this.recentView)},destroy:function(){t(document).off("."+this.idPrefix),t(document.body).css("overflow","").removeClass("paintShopLoad-page paintShop-is-embedded")},defineModels:function(){this.settings=s(new o(null,{pubsub:this.pubsub}),this),this.report=l?null:s(new a(this.options.query),this),this.stats=s(new n,this),this.recent=s(new r,this)},defineViews:function(){this.report&&(this.filterView=new h({model:this.report}),this.reportView=new p({settings:this.settings,model:this.report})),this.statsView=new c({settings:this.settings,stats:this.stats}),this.recentView=new d({settings:this.settings,recent:this.recent,embedded:l})},defineBindings:function(){var e=this;e.once("afterRender",function(){l&&window.parent.postMessage({type:"ready",app:w},"*")}),e.listenTo(e.stats,"change",function(){clearTimeout(e.timers.reloadStats),e.timers.reloadStats=setTimeout(e.stats.fetch.bind(e.stats,{showLoadingMessage:!1}),6e4)}),e.report&&e.listenTo(e.report,"filtered",this.onReportFiltered),t(document).on("click",e.onDocumentClick.bind(e))},load:function(t){return t(this.settings.fetch(),this.stats.fetch(),this.recent.fetch(),this.report?this.report.fetch():null)},serialize:function(){return{idPrefix:this.idPrefix,embedded:l}},beforeRender:function(){l&&(document.body.style.overflow="hidden"),document.body.classList.toggle("paintShop-is-embedded",l),document.body.classList.add("paintShopLoad-page")},afterRender:function(){this.showParentControls()},startActionTimer:function(t,e){this.actionTimer.action=t,this.actionTimer.time=Date.now(),e&&e.preventDefault()},stopActionTimer:function(t){if(this.actionTimer.action===t){var e=Date.now()-this.actionTimer.time>3e3;"switchApps"===t?e?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:w},"*"):"reboot"===t?e?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):e&&"shutdown"===t&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}},showParentControls:function(){var t=this.$id("parentControls");t.length&&(t.fadeIn("fast"),clearTimeout(this.timers.hideParentControls),this.timers.hideParentControls=setTimeout(function(){t.fadeOut("fast")},15e3))},onDocumentClick:function(){this.showParentControls()},onReportFiltered:function(){this.broker.publish("router.navigate",{url:this.report.genClientUrl(),trigger:!1,replace:!0}),this.promised(this.report.fetch())}})});