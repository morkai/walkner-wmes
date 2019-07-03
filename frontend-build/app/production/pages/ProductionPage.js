define(["underscore","jquery","app/time","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/core/util/embedded","app/data/prodLog","app/data/aors","app/data/downtimeReasons","app/data/dictionaries","app/prodShifts/ProdShift","app/prodDowntimes/ProdDowntime","app/isa/IsaRequest","../snManager","../views/VkbView","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","../views/IsaView","../views/TaktTimeView","../views/SpigotCheckerView","../views/ExecutionView","app/production/templates/productionPage","app/production/templates/duplicateWarning"],function(e,i,t,o,n,s,d,r,a,u,c,h,l,m,p,g,f,w,b,D,v,k,C,S,T,y,V,L,P){"use strict";return r.extend({template:L,layoutName:"blank",remoteTopics:function(){var e={},i=this.model.prodLine.id;return i&&(e["production.messageRequested."+i]="onMessageRequested",e["production.autoDowntimes."+this.model.get("subdivision")]="onSubdivisionAutoDowntime",e["production.autoDowntimes."+i]="onLineAutoDowntime",e["production.taktTime.snChecked."+i]="onSnChecked",e["isaRequests.created."+i+".**"]="onIsaRequestUpdated",e["isaRequests.updated."+i+".**"]="onIsaRequestUpdated",e["orders.updated.*"]="onOrderUpdated"),e},localTopics:{"socket.connected":function(){this.joinProduction()},"socket.disconnected":function(){this.leaveProduction()},"updater.frontendReloading":function(){this.model.saveLocalData()},"router.dispatching":function(e){e.path!=="/production/"+this.model.prodLine.id&&this.leaveProduction()},"production.locked":"onProductionLocked","production.duplicateDetected":"onDuplicateDetected"},events:{"click #-currentDowntime":function(){var e=this.model.prodDowntimes.findFirstUnfinished();e&&this.downtimesView.showEditDialog(e.id)},focusin:function(){clearTimeout(this.timers.blur),this.timers.blur=setTimeout(function(){document.body.classList.contains("modal-open")||document.activeElement.classList.contains("form-control")||document.activeElement.blur()},5e3)},"click #-message":"hideMessage"},breadcrumbs:function(){return[n("production","breadcrumbs:base"),this.model.getLabel()]},initialize:function(){this.delayProductionJoin=this.delayProductionJoin.bind(this),this.onBeforeUnload=this.onBeforeUnload.bind(this),this.onWindowResize=e.debounce(this.onWindowResize.bind(this),33),this.layout=null,this.shiftEditedSub=null,this.qtyDoneSub=null,this.productionJoined=0,this.enableProdLog=!1,this.pendingIsaChanges=[],d.disableViews(),this.defineViews(),this.defineBindings(),i(window).on("resize."+this.idPrefix,this.onWindowResize).on("beforeunload."+this.idPrefix,this.onBeforeUnload),i(window).on("contextmenu."+this.idPrefix,function(e){e.preventDefault()}),f.bind(this)},setUpLayout:function(e){this.layout=e},destroy:function(){i(document.body).removeClass("is-production is-embedded"),i(".modal").addClass("fade"),this.layout=null,this.shiftEditedSub=null,i(window).off("."+this.idPrefix),this.model.stopShiftChangeMonitor(),d.enableViews(),u.disable()},serialize:function(){return{idPrefix:this.idPrefix,locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder"),showBottomControls:!0}},load:function(e){var t=this,o=i.Deferred(),n=i.Deferred();return o.done(function(){t.timers.readLocalData=setTimeout(function(){t.timers.readLocalData=null,t.model.readLocalData()},1)}),o.fail(function(){document.body.innerHTML=P()}),o.always(function(){"rejected"===o.state()?(t.enableProdLog=!1,n.reject()):(t.enableProdLog=!0,n.resolve())}),u.enable(o),e(n.promise())},defineViews:function(){var e=this.model;this.vkbView=new w,this.controlsView=new b({model:e}),this.headerView=new D({model:e,embedded:!0,vkb:this.vkbView}),this.dataView=new v({model:e,embedded:!0,vkb:this.vkbView}),this.downtimesView=new k({model:e,embedded:!0,vkb:this.vkbView}),this.taktTimeView=new T({model:e}),this.quantitiesView=new C({model:e,embedded:!0,vkb:this.vkbView}),this.isaView=new S({model:e,embedded:!0,vkb:this.vkbView}),this.executionView=new V({model:e});var i="#"+this.idPrefix+"-";this.setView(i+"controls",this.controlsView),this.setView(i+"header",this.headerView),this.setView(i+"data",this.dataView),this.setView(i+"execution",this.executionView),this.setView(i+"downtimes",this.downtimesView),this.setView(i+"taktTime",this.taktTimeView),this.setView(i+"quantities",this.quantitiesView),this.setView(i+"isa",this.isaView),this.setView(i+"vkb",this.vkbView)},defineBindings:function(){var e=this,i=e.model;e.listenTo(i,"locked",function(){e.$el.removeClass("is-unlocked").addClass("is-locked"),e.leaveProduction()}),e.listenTo(i,"unlocked",function(){e.$el.removeClass("is-locked").addClass("is-unlocked"),e.joinProduction()}),e.listenTo(i,"change:state",function(){null!==e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e);var t=i.previous("state"),o=i.get("state");t&&e.$el.removeClass("is-"+t),o&&e.$el.addClass("is-"+o),e.checkSpigot(),e.updateCurrentDowntime()}),e.listenTo(i,"change:shift",function(){s.closeAllDialogs(),e.$el.hasClass("hidden")?e.$el.removeClass("hidden"):i.get("shift")&&s.msg.show({type:"info",time:2e3,text:n("production","msg:shiftChange")})}),e.listenTo(i,"change:_id",function(){e.subscribeForShiftChanges(),e.loadOrderQueue()}),e.listenTo(i.prodShiftOrder,"change:orderId",e.subscribeForQuantityDoneChanges),i.id&&this.subscribeForShiftChanges(),i.prodShiftOrder.get("orderId")&&this.subscribeForQuantityDoneChanges(),e.listenTo(i.prodDowntimes,"change:finishedAt",function(){e.updateCurrentDowntime()}),e.listenTo(i,"second",function(){e.updateCurrentDowntime()}),e.listenTo(i,"orderCorrected",function(){e.checkSpigot()}),e.listenTo(i.prodShiftOrder,"change:mechOrder",function(){e.$el.toggleClass("is-mechOrder",i.prodShiftOrder.isMechOrder())}),this.listenTo(i.settings,"reset change",this.toggleTaktTimeView),e.listenTo(e.downtimesView,"corroborated",function(){i.saveLocalData()}),e.socket.on("production.locked",function(){e.broker.publish(e.broker,"production.locked")})},beforeRender:function(){this.enableProdLog&&(u.enable(),this.enableProdLog=!1)},afterRender:function(){i(document.body).addClass("is-production").toggleClass("is-embedded",!0),i(".modal.fade").removeClass("fade"),this.toggleTaktTimeView(),this.socket.isConnected()&&this.joinProduction(),this.updateCurrentDowntime(),(this.model.isLocked()||this.model.id)&&this.$el.removeClass("hidden"),window.parent.postMessage({type:"ready",app:"operator"},"*"),a.render(this)},onBeforeUnload:function(){this.model.isLocked()},onWindowResize:function(){this.adjustCurrentDowntimeBox()},onProductionLocked:function(e){e.prodLine===this.model.prodLine.id&&e.secretKey===this.model.getSecretKey()&&(this.model.setSecretKey(null),s.msg.show({time:5e3,type:"warning",text:n("production","msg:locked")}),this.$el.removeClass("hidden"))},onDuplicateDetected:function(){this.remove(),document.body.innerHTML=P()},onIsaRequestUpdated:function(e){this.pendingIsaChanges?this.pendingIsaChanges.push(e):this.applyIsaChange(e)},onOrderUpdated:function(e){var i=this.model.prodShiftOrder;if(e._id===i.get("orderId")){var t=e.change.newValues.qtyMax;void 0!==t&&i.trigger("qtyMaxChanged",t)}},applyIsaChange:function(e){e=g.parse(e);var i=this.model.isaRequests,t=i.get(e._id);t?t.set(e):(i.add(e),t=i.get(e._id)),t.isCompleted()&&i.remove(t)},joinProduction:function(){var i=this,t=i.model;if(i.timers.joinProduction&&(clearTimeout(i.timers.joinProduction),delete i.timers.joinProduction),!i.productionJoined&&!t.isLocked()&&i.socket.isConnected()){if(u.isSyncing())return i.broker.subscribe("production.synced",i.delayProductionJoin).setLimit(1);if(!t.id)return i.listenToOnce(t,"change:_id",i.delayProductionJoin);this.pendingIsaChanges||(this.pendingIsaChanges=[]);var o=t.prodDowntimes.findFirstUnfinished(),n={prodLineId:t.prodLine.id,prodShiftId:t.id,prodShiftOrderId:t.prodShiftOrder.id||null,prodDowntimeId:o?o.id:null,orderNo:t.prodShiftOrder.get("orderId")||null,dictionaries:{},orderQueue:!0};e.forEach(l,function(e,i){/^[A-Z0-9_]+$/.test(i)||(n.dictionaries[i]=e.updatedAt)}),this.socket.emit("production.join",n,function(o){o&&(o.totalQuantityDone&&t.prodShiftOrder.set("totalQuantityDone",o.totalQuantityDone),o.plannedQuantities&&(o.actualQuantities?t.updateQuantities(o.plannedQuantities,o.actualQuantities):t.updatePlannedQuantities(o.plannedQuantities)),o.prodDowntimes&&t.prodDowntimes.refresh(o.prodDowntimes),o.settings&&t.settings.reset(o.settings),o.isaRequests&&(t.isaRequests.reset(o.isaRequests.map(function(e){return g.parse(e)})),i.pendingIsaChanges&&(i.pendingIsaChanges.forEach(i.applyIsaChange,i),i.pendingIsaChanges=null)),e.isEmpty(o.orderQueue)||t.setNextOrder(o.orderQueue),e.isEmpty(o.execution)||t.execution.set(o.execution),e.forEach(o.dictionaries,function(e,i){l[i].reset(e)}))}),this.productionJoined=Date.now()}},leaveProduction:function(){this.productionJoined&&(this.socket.isConnected()&&this.socket.emit("production.leave",this.model.prodLine.id),this.productionJoined=0)},delayProductionJoin:function(){var e=this;e.timers.joinProduction&&clearTimeout(e.timers.joinProduction),e.timers.joinProduction=setTimeout(function(){e.timers.joinProduction=null,e.joinProduction()},333)},subscribeForShiftChanges:function(){this.shiftEditedSub&&(this.shiftEditedSub.cancel(),this.shiftEditedSub=null);var e=this.model;e.id&&(this.shiftEditedSub=this.pubsub.subscribe("production.edited.shift."+e.id,function(i){e.set(i)}))},subscribeForQuantityDoneChanges:function(){this.qtyDoneSub&&(this.qtyDoneSub.cancel(),this.qtyDoneSub=null);var e=this.model.prodShiftOrder,i=e.get("orderId");i&&(this.qtyDoneSub=this.pubsub.subscribe("orders.quantityDone."+i,function(i){e.set({totalQuantityDone:i})}),this.ajax({url:"/orders?_id="+i+"&select(qtyDone)&limit(1)"}).done(function(i){if(i.collection&&i.collection.length){var t=i.collection[0];t&&t._id===e.get("orderId")&&e.set("totalQuantityDone",t.qtyDone)}}))},loadOrderQueue:function(){var e=this;e.productionJoined&&!e.model.hasOrderQueue()&&e.model.id&&e.ajax({url:"/production/planExecution/"+e.model.id}).done(function(i){e.model.setNextOrder(i.orderQueue),e.model.execution.set(i.execution)})},checkSpigot:function(){var e=this.model,i=e.prodShiftOrder.get("spigot")||null,t=e.getSpigotComponent();if(t){var o=e.getSpigotInsertComponent();if(o&&(t=o),i&&i.forceCheck)this.showSpigotDialog(t);else if("downtime"===e.get("state")&&!i&&e.isSpigotLine()){var n=e.settings.getValue("rearmDowntimeReason");e.prodDowntimes.findFirstUnfinished().get("reason")===n&&t&&this.showSpigotDialog(t)}}},showSpigotDialog:function(e){var i=new y({model:this.model,component:e,embedded:!0});this.broker.subscribe("viewport.dialog.hidden").setLimit(1).setFilter(function(e){return e===i}).on("message",this.checkSpigot.bind(this)),s.showDialog(i,n("production","spigotChecker:title"))},adjustCurrentDowntimeBox:function(){var e=this.$id("downtimes-header"),i=e.offset();if(i){var t=this.$id("currentDowntime"),o=this.$id("currentDowntime-message").css("margin-top","");t.css({top:i.top+e.outerHeight()+1+"px",left:i.left+"px",width:e.width()+"px"}),o.css("margin-top",(t.outerHeight()-o.outerHeight())/2+"px")}},updateCurrentDowntime:function(){var e,i,o,s,d=this.$id("currentDowntime"),r=this.incomingAutoDowntime,a=this.model.prodDowntimes.findFirstUnfinished();if(a)d.removeClass("is-incoming"),e=a.getReasonLabel(),i=a.getAorLabel(),o=a.getDurationString(null,!0),s=(a.get("auto")||{d:0}).d;else{if(!r)return void d.addClass("hidden");r.remainingTime=r.startingAt-Date.now(),e=(e=h.get(r.reason))?e.getLabel():null,i=(i=c.get(this.model.getDefaultAor()))?i.getLabel():null,o=n("production","autoDowntimes:remainingTime",{time:t.toString(r.remainingTime/1e3,!1,!1)}),s=r.duration,d.addClass("is-incoming")}e&&i?(this.$id("currentDowntime-reason").text(e),this.$id("currentDowntime-aor").text(i),this.$id("currentDowntime-elapsedTime").text(o),s?this.$id("currentDowntime-duration").text(t.toString(60*s)).removeClass("hidden"):this.$id("currentDowntime-duration").addClass("hidden"),d.removeClass("hidden"),this.adjustCurrentDowntimeBox(),r&&r.remainingTime<-1e3&&(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(r.reason,r.duration))):d.addClass("hidden")},onSubdivisionAutoDowntime:function(e){this.onAutoDowntime(e,"subdivision")},onLineAutoDowntime:function(e){this.onAutoDowntime(e,"prodLine")},onAutoDowntime:function(e,i){!this.productionJoined||"subdivision"===i&&this.model.settings.getAutoDowntimes(this.model.prodLine.id).length>0||!this.model.shouldStartTimedAutoDowntime(e.reason)||(-1===e.remainingTime?(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(e.reason,e.duration)):(e.startingAt=Date.now()+e.remainingTime,this.incomingAutoDowntime=e,this.updateCurrentDowntime()))},createCheckSn:function(e,i,t){var o,n=this.model,s=n.get("state"),d=u.create(n,"checkSerialNumber",e),r=n.prodShiftOrder.getTaktTime(),a=n.prodShiftOrder.get("orderId");"000000000"===e.orderNo&&(e.orderNo=a),e.sapTaktTime="number"==typeof r?r:0,"working"!==s?o="INVALID_STATE:"+s:e.orderNo!==a?this.socket.isConnected()?d=f.createDynamicLogEntry(e):o="INVALID_ORDER":f.contains(e._id)&&(o="ALREADY_USED"),o?(d.data.error=o,u.record(n,d),f.showMessage(e,"error",o)):t(d,i)},onSnChecked:function(e){e&&"SUCCESS"===e.result&&e.instanceId!==window.INSTANCE_ID&&this.model.updateTaktTime(e)},toggleTaktTimeView:function(e){e&&e.id&&!/taktTime/.test(e.id)||this.$(".production-taktTime").toggleClass("hidden",!this.model.isTaktTimeEnabled()||!this.model.settings.showSmiley())},onMessageRequested:function(e){this.showMessage(e.message)},showMessage:function(e){var i=n.has("production","message:"+e.code)?n("production","message:"+e.code,e):e.text;i&&(this.timers.hideMessage&&clearTimeout(this.timers.hideMessage),this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),e.time||6e4),this.$id("message-inner").html(i),this.$id("message").attr("data-type",e.type||"info").css({marginTop:""}).removeClass("hidden").css({marginTop:this.$id("message-outer").outerHeight()/2*-1+"px"}),document.body.click())},hideMessage:function(){this.timers.hideMessage&&(clearTimeout(this.timers.hideMessage),this.timers.hideMessage=null),this.$id("message").addClass("hidden")}})});