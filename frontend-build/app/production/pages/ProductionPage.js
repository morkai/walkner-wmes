// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/data/prodLog","app/prodShifts/ProdShift","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","app/production/templates/productionPage","app/production/templates/duplicateWarning"],function(e,i,t,o,s,n,d,r,h,l,a,c,u,m,f){return n.extend({template:m,layoutName:"blank",localTopics:{"socket.connected":function(){this.joinProduction(),this.refreshDowntimes(),this.refreshPlannedQuantities()},"socket.disconnected":function(){this.productionJoined=!1},"updater.frontendReloading":function(){this.model.saveLocalData()}},breadcrumbs:function(){return[t("production","breadcrumbs:productionPage"),this.model.getLabel()]},initialize:function(){this.delayProductionJoin=this.delayProductionJoin.bind(this),this.onBeforeUnload=this.onBeforeUnload.bind(this),this.layout=null,this.shiftEditedSub=null,this.productionJoined=!1,this.enableProdLog=!1,s.disableViews(),this.defineViews(),this.defineBindings(),e(window).on("beforeunload",this.onBeforeUnload)},setUpLayout:function(e){this.layout=e},destroy:function(){this.layout=null,this.shiftEditedSub=null,e(window).off("beforeunload",this.onBeforeUnload),this.model.stopShiftChangeMonitor(),s.enableViews(),d.disable(),this.leaveProduction()},serialize:function(){return{locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder")}},load:function(i){o.msg.loading();var t=this,s=e.Deferred(),n=e.Deferred();return s.done(function(){t.timers.readLocalData=setTimeout(function(){t.timers.readLocalData=null,t.model.readLocalData()},1)}),s.fail(function(){document.body.innerHTML=f()}),s.always(function(){o.msg.loaded(),"rejected"===s.state()?(t.enableProdLog=!1,n.reject()):(t.enableProdLog=!0,n.resolve())}),d.enable(s),i(n.promise())},defineViews:function(){this.controlsView=new h({model:this.model}),this.headerView=new l({model:this.model}),this.dataView=new a({model:this.model}),this.downtimesView=new c({model:this.model}),this.quantitiesView=new u({model:this.model}),this.setView(".production-controls-container",this.controlsView),this.setView(".production-header-container",this.headerView),this.setView(".production-data-container",this.dataView),this.setView(".production-downtimes-container",this.downtimesView),this.setView(".production-quantities-container",this.quantitiesView)},defineBindings:function(){this.listenTo(this.model,"locked",function(){this.$el.removeClass("is-unlocked").addClass("is-locked"),this.leaveProduction()}),this.listenTo(this.model,"unlocked",function(){this.$el.removeClass("is-locked").addClass("is-unlocked"),this.refreshDowntimes(),this.refreshPlannedQuantities(),this.joinProduction()}),this.listenTo(this.model,"change:state",function(){null!==this.layout&&this.layout.setBreadcrumbs(this.breadcrumbs,this);var e=this.model.previous("state"),i=this.model.get("state");e&&this.$el.removeClass("is-"+e),i&&this.$el.addClass("is-"+i)}),this.listenTo(this.model,"change:shift",function(){return o.closeAllDialogs(),this.$el.hasClass("hidden")?void this.$el.removeClass("hidden"):void(this.model.get("shift")&&o.msg.show({type:"info",time:2e3,text:t("production","msg:shiftChange")}))}),this.listenTo(this.model,"change:_id",this.subscribeForShiftChanges),this.model.id&&this.subscribeForShiftChanges(),this.listenTo(this.model.prodShiftOrder,"change:mechOrder",function(){this.$el.toggleClass("is-mechOrder",this.model.prodShiftOrder.isMechOrder())}),this.listenTo(this.downtimesView,"corroborated",function(){this.model.saveLocalData()}),this.socket.on("production.locked",this.onProductionLocked.bind(this))},beforeRender:function(){this.enableProdLog&&(d.enable(),this.enableProdLog=!1)},afterRender:function(){this.socket.isConnected()&&(this.joinProduction(),this.refreshDowntimes(),this.refreshPlannedQuantities()),this.model.isLocked()&&this.$el.removeClass("hidden")},onBeforeUnload:function(){return this.model.isLocked()||(d.disable(),this.model.isIdle()||s.isFrontendReloading())?void 0:(this.timers.enableProdLog=setTimeout(d.enable.bind(d),1e3),this.model.isDowntime()?t("production","unload:downtime"):t("production","unload:order"))},onProductionLocked:function(e){e.prodLine===this.model.prodLine.id&&e.secretKey===this.model.getSecretKey()&&(this.model.setSecretKey(null),o.msg.show({type:"warning",text:t("production","msg:locked")}))},refreshDowntimes:function(){if(d.isSyncing())return this.broker.subscribe("production.synced",this.delayDowntimesRefresh.bind(this)).setLimit(1);if(this.model.isLocked())return this.listenToOnce(this.model,"unlocked",this.delayDowntimesRefresh);if(!this.model.id)return this.listenToOnce(this.model,"change:_id",this.delayDowntimesRefresh);this.timers.refreshingDowntimes&&clearTimeout(this.timers.refreshingDowntimes);var e=this;this.timers.refreshingDowntimes=setTimeout(function(){if(delete e.timers.refreshingDowntimes,e.socket.isConnected()&&!e.model.isLocked()){var i=e.model.prodDowntimes.fetch({reset:!0});e.promised(i).done(function(){e.model.saveLocalData()})}},2500)},delayDowntimesRefresh:function(){this.timers.refreshDowntimes&&clearTimeout(this.timers.refreshDowntimes),this.timers.refreshDowntimes=setTimeout(function(e){e.timers.refreshDowntimes=null,e.refreshDowntimes()},2500,this)},refreshPlannedQuantities:function(){if(d.isSyncing())return this.broker.subscribe("production.synced",this.delayPlannedQuantitiesRefresh.bind(this)).setLimit(1);if(this.model.isLocked())return this.listenToOnce(this.model,"unlocked",this.delayPlannedQuantitiesRefresh);if(!this.model.id)return this.listenToOnce(this.model,"change:_id",this.delayPlannedQuantitiesRefresh);var e=this;this.socket.emit("production.getPlannedQuantities",this.model.id,function(i,t){return e.shiftEditedSub?i?void 0:void e.model.updatePlannedQuantities(t):void 0})},delayPlannedQuantitiesRefresh:function(){this.timers.refreshPlannedQuantities&&clearTimeout(this.timers.refreshPlannedQuantities),this.timers.refreshPlannedQuantities=setTimeout(function(e){e.timers.refreshPlannedQuantities=null,e.refreshPlannedQuantities()},5e3,this)},joinProduction:function(){if(!this.productionJoined&&!this.model.isLocked()&&this.socket.isConnected()){if(d.isSyncing())return this.broker.subscribe("production.synced",this.delayProductionJoin).setLimit(1);if(!this.model.id)return this.listenToOnce(this.model,"change:_id",this.delayProductionJoin);var e=this.model.prodDowntimes.findFirstUnfinished();this.socket.emit("production.join",{prodLineId:this.model.prodLine.id,prodShiftId:this.model.id,prodShiftOrderId:this.model.prodShiftOrder.id||null,prodDowntimeId:e?e.id:null}),this.productionJoined=!0}},delayProductionJoin:function(){this.timers.joinProduction&&clearTimeout(this.timers.joinProduction),this.timers.joinProduction=setTimeout(function(e){e.timers.joinProduction=null,e.joinProduction()},2e3,this)},leaveProduction:function(){this.productionJoined&&(this.socket.isConnected()&&this.socket.emit("production.leave",this.model.prodLine.id),this.productionJoined=!1)},subscribeForShiftChanges:function(){if(this.shiftEditedSub&&this.shiftEditedSub.cancel(),this.model.id){var e=this.model;this.shiftEditedSub=this.pubsub.subscribe("production.edited.shift."+this.model.id).on("message",function(i){e.set(i)})}}})});