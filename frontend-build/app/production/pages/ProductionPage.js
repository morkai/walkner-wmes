define(["jquery","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/data/prodLog","app/prodShifts/ProdShift","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","app/production/templates/productionPage"],function(e,i,t,o,s,n,d,r,h,a,l,c,m,u){return n.extend({template:u,layoutName:"blank",localTopics:{"socket.connected":function(){this.setUpTimeLog(),this.refreshDowntimes()},"socket.disconnected":function(){this.timers.diagTimeLog&&(clearTimeout(this.timers.diagTimeLog),this.timers.diagTimeLog=null)},"updater.frontendReloading":function(){this.model.saveLocalData()}},breadcrumbs:function(){return[t("production","breadcrumbs:productionPage"),this.model.getLabel()]},initialize:function(){s.disableViews(),d.enable(),this.defineModels(),this.defineViews(),this.defineBindings(),this.onBeforeUnload=this.onBeforeUnload.bind(this),e(window).on("beforeunload",this.onBeforeUnload)},destroy:function(){e(window).off("beforeunload",this.onBeforeUnload),this.model.stopShiftChangeMonitor(),s.enableViews(),d.disable()},serialize:function(){return{locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder")}},defineModels:function(){this.model.readLocalData(),this.model.startShiftChangeMonitor()},defineViews:function(){this.controlsView=new h({model:this.model}),this.headerView=new a({model:this.model}),this.dataView=new l({model:this.model}),this.downtimesView=new c({collection:this.model.prodDowntimes,prodLine:this.model.prodLine.id}),this.quantitiesView=new m({model:this.model}),this.setView(".production-controls-container",this.controlsView),this.setView(".production-header-container",this.headerView),this.setView(".production-data-container",this.dataView),this.setView(".production-downtimes-container",this.downtimesView),this.setView(".production-quantities-container",this.quantitiesView)},defineBindings:function(){this.listenTo(this.model,"locked",function(){this.$el.removeClass("is-unlocked").addClass("is-locked")}),this.listenTo(this.model,"unlocked",function(){this.$el.removeClass("is-locked").addClass("is-unlocked"),this.refreshDowntimes()}),this.listenTo(this.model,"change:state",function(){var e=this.model.previous("state");null!==e&&this.$el.removeClass("is-"+e),this.$el.addClass("is-"+this.model.get("state"))}),this.listenTo(this.model,"change:shift",function(){o.closeAllDialogs(),this.model.get("shift")&&o.msg.show({type:"info",time:2e3,text:t("production","msg:shiftChange")})}),this.listenTo(this.model.prodShiftOrder,"change:mechOrder",function(){this.$el.toggleClass("is-mechOrder",this.model.prodShiftOrder.isMechOrder())}),this.listenTo(this.downtimesView,"corroborated",function(){this.model.saveLocalData()})},afterRender:function(){this.socket.isConnected()&&(this.setUpTimeLog(),this.refreshDowntimes())},refreshDowntimes:function(){var e=this.model;return d.isSyncing()?this.broker.subscribe("production.synced",this.delayDowntimesRefresh.bind(this)).setLimit(1):this.model.isLocked()?this.listenToOnce(this.model,"unlocked",this.delayDowntimesRefresh.bind(this)):void this.promised(e.prodDowntimes.fetch({reset:!0})).then(function(){e.saveLocalData()})},delayDowntimesRefresh:function(){this.timers.refreshDowntimes&&clearTimeout(this.timers.refreshDowntimes),this.timers.refreshDowntimes=setTimeout(function(e){e.timers.refreshDowntimes=null,e.refreshDowntimes()},2500,this)},onBeforeUnload:function(){return this.model.isLocked()||(d.disable(),this.model.isIdle()||s.isFrontendReloading())?void 0:(this.timers.enableProdLog=setTimeout(d.enable.bind(d),1e3),this.model.isDowntime()?t("production","unload:downtime"):t("production","unload:order"))},setUpTimeLog:function(){null==this.timers.diagTimeLog&&(this.socket.emit("diag.log",{createdAt:new Date,creator:i.getInfo(),prodLine:this.model.prodLine.id,type:"connected",data:{versions:s.versions}}),this.timers.diagTimeLog=setInterval(this.logTime.bind(this),6e4))},logTime:function(){this.socket.emit("diag.log",{createdAt:new Date,creator:i.getInfo(),prodLine:this.model.prodLine.id,type:"ping",data:null})}})});