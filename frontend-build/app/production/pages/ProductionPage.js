// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/data/prodLog","app/prodShifts/ProdShift","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","app/production/templates/productionPage"],function(e,i,t,s,o,n,d,r,h,l,a,c,m,u){return n.extend({template:u,layoutName:"blank",localTopics:{"socket.connected":function(){this.setUpTimeLog(),this.refreshDowntimes(),this.refreshPlannedQuantities()},"socket.disconnected":function(){this.timers.diagTimeLog&&(clearTimeout(this.timers.diagTimeLog),this.timers.diagTimeLog=null)},"updater.frontendReloading":function(){this.model.saveLocalData()}},breadcrumbs:function(){return[t("production","breadcrumbs:productionPage"),this.model.getLabel()]},initialize:function(){this.shiftEditedSub=null,o.disableViews(),d.enable(),this.defineModels(),this.defineViews(),this.defineBindings(),this.onBeforeUnload=this.onBeforeUnload.bind(this),e(window).on("beforeunload",this.onBeforeUnload)},destroy:function(){this.shiftEditedSub=null,e(window).off("beforeunload",this.onBeforeUnload),this.model.stopShiftChangeMonitor(),o.enableViews(),d.disable()},serialize:function(){return{locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder")}},defineModels:function(){this.model.readLocalData()},defineViews:function(){this.controlsView=new h({model:this.model}),this.headerView=new l({model:this.model}),this.dataView=new a({model:this.model}),this.downtimesView=new c({model:this.model}),this.quantitiesView=new m({model:this.model}),this.setView(".production-controls-container",this.controlsView),this.setView(".production-header-container",this.headerView),this.setView(".production-data-container",this.dataView),this.setView(".production-downtimes-container",this.downtimesView),this.setView(".production-quantities-container",this.quantitiesView)},defineBindings:function(){this.listenTo(this.model,"locked",function(){this.$el.removeClass("is-unlocked").addClass("is-locked")}),this.listenTo(this.model,"unlocked",function(){this.$el.removeClass("is-locked").addClass("is-unlocked"),this.refreshDowntimes(),this.refreshPlannedQuantities()}),this.listenTo(this.model,"change:state",function(){var e=this.model.previous("state");null!==e&&this.$el.removeClass("is-"+e),this.$el.addClass("is-"+this.model.get("state"))}),this.listenTo(this.model,"change:shift",function(){s.closeAllDialogs(),this.model.get("shift")&&s.msg.show({type:"info",time:2e3,text:t("production","msg:shiftChange")})}),this.listenTo(this.model,"change:_id",this.subscribeForShiftChanges),this.model.id&&this.subscribeForShiftChanges(),this.listenTo(this.model.prodShiftOrder,"change:mechOrder",function(){this.$el.toggleClass("is-mechOrder",this.model.prodShiftOrder.isMechOrder())}),this.listenTo(this.downtimesView,"corroborated",function(){this.model.saveLocalData()})},afterRender:function(){this.socket.isConnected()&&(this.setUpTimeLog(),this.refreshDowntimes(),this.refreshPlannedQuantities())},refreshDowntimes:function(){if(d.isSyncing())return this.broker.subscribe("production.synced",this.delayDowntimesRefresh.bind(this)).setLimit(1);if(this.model.isLocked())return this.listenToOnce(this.model,"unlocked",this.delayDowntimesRefresh.bind(this));this.timers.refreshingDowntimes&&clearTimeout(this.timers.refreshingDowntimes);var e=this;this.timers.refreshingDowntimes=setTimeout(function(){if(delete e.timers.refreshingDowntimes,e.socket.isConnected()&&!e.model.isLocked()){var i=e.model.prodDowntimes.fetch({reset:!0});e.promised(i).done(function(){e.model.saveLocalData()})}},3e3)},delayDowntimesRefresh:function(){this.timers.refreshDowntimes&&clearTimeout(this.timers.refreshDowntimes),this.timers.refreshDowntimes=setTimeout(function(e){e.timers.refreshDowntimes=null,e.refreshDowntimes()},2500,this)},refreshPlannedQuantities:function(){if(this.model.isLocked())return this.listenToOnce(this.model,"unlocked",this.refreshPlannedQuantities.bind(this));var e=this;this.socket.emit("production.getPlannedQuantities",this.model.id,function(i,t){!i&&e.shiftEditedSub&&e.model.updatePlannedQuantities(t)})},onBeforeUnload:function(){return this.model.isLocked()||(d.disable(),this.model.isIdle()||o.isFrontendReloading())?void 0:(this.timers.enableProdLog=setTimeout(d.enable.bind(d),1e3),this.model.isDowntime()?t("production","unload:downtime"):t("production","unload:order"))},setUpTimeLog:function(){},logTime:function(){this.socket.emit("diag.log",{createdAt:new Date,creator:i.getInfo(),prodLine:this.model.prodLine.id,type:"ping",data:null})},subscribeForShiftChanges:function(){if(this.shiftEditedSub&&this.shiftEditedSub.cancel(),this.model.id){var e=this.model;this.shiftEditedSub=this.pubsub.subscribe("production.edited.shift."+this.model.id).on("message",function(i){e.set(i)})}}})});