// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/data/prodLog","app/data/aors","app/data/downtimeReasons","app/data/dictionaries","app/prodShifts/ProdShift","app/prodDowntimes/ProdDowntime","app/isa/IsaRequest","../snManager","../views/VkbView","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","../views/IsaView","../views/TaktTimeView","../views/SpigotCheckerView","app/production/templates/productionPage","app/production/templates/duplicateWarning"],function(e,t,i,o,n,s,d,r,a,u,c,h,l,m,p,w,g,f,b,D,S,T,v,C,k,y,A){"use strict";return r.extend({template:y,layoutName:"blank",remoteTopics:function(){var e={},t=this.model.prodLine.id;return t&&(e["production.autoDowntimes."+this.model.get("subdivision")]="onSubdivisionAutoDowntime",e["production.autoDowntimes."+t]="onLineAutoDowntime",e["production.taktTime.snChecked."+t]="onSnChecked",e["isaRequests.created."+t+".**"]="onIsaRequestUpdated",e["isaRequests.updated."+t+".**"]="onIsaRequestUpdated",e["orders.updated.*"]="onOrderUpdated"),e},localTopics:{"socket.connected":function(){this.joinProduction()},"socket.disconnected":function(){this.leaveProduction()},"updater.frontendReloading":function(){this.model.saveLocalData()},"router.dispatching":function(e){e.path!=="/production/"+this.model.prodLine.id&&this.leaveProduction()},"production.locked":"onProductionLocked","production.duplicateDetected":"onDuplicateDetected","production.taktTime.snScanned":"onSnScanned"},events:{"click #-currentDowntime":function(){var e=this.model.prodDowntimes.findFirstUnfinished();e&&this.downtimesView.showEditDialog(e.id)},focusin:function(){clearTimeout(this.timers.blur),this.timers.blur=setTimeout(function(){document.body.classList.contains("modal-open")||document.activeElement.classList.contains("form-control")||document.activeElement.blur()},5e3)},"click #-snMessage":"hideSnMessage","mousedown #-switchApps":function(e){this.startActionTimer("switchApps",e)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(e){this.startActionTimer("reboot",e)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(e){this.startActionTimer("shutdown",e)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},breadcrumbs:function(){return[n("production","breadcrumbs:base"),this.model.getLabel()]},initialize:function(){this.delayProductionJoin=this.delayProductionJoin.bind(this),this.onBeforeUnload=this.onBeforeUnload.bind(this),this.onWindowResize=e.debounce(this.onWindowResize.bind(this),33),this.layout=null,this.shiftEditedSub=null,this.qtyDoneSub=null,this.productionJoined=0,this.enableProdLog=!1,this.pendingIsaChanges=[],this.actionTimer={action:null,time:null},d.disableViews(),this.defineViews(),this.defineBindings(),t(window).on("resize."+this.idPrefix,this.onWindowResize).on("beforeunload."+this.idPrefix,this.onBeforeUnload).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)),t(window).on("contextmenu."+this.idPrefix,function(e){e.preventDefault()})},setUpLayout:function(e){this.layout=e},destroy:function(){t(document.body).removeClass("is-production is-embedded"),t(".modal").addClass("fade"),this.layout=null,this.shiftEditedSub=null,t(window).off("."+this.idPrefix),this.model.stopShiftChangeMonitor(),d.enableViews(),a.disable()},serialize:function(){return{idPrefix:this.idPrefix,locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder"),showBottomControls:!0}},load:function(e){s.msg.loading();var i=this,o=t.Deferred(),n=t.Deferred();return o.done(function(){i.timers.readLocalData=setTimeout(function(){i.timers.readLocalData=null,i.model.readLocalData()},1)}),o.fail(function(){document.body.innerHTML=A()}),o.always(function(){s.msg.loaded(),"rejected"===o.state()?(i.enableProdLog=!1,n.reject()):(i.enableProdLog=!0,n.resolve())}),a.enable(o),e(n.promise())},defineViews:function(){var e=this,t=e.model;e.vkbView=new g,e.controlsView=new f({model:t}),e.headerView=new b({model:t,embedded:!0,vkb:e.vkbView}),e.dataView=new D({model:t,embedded:!0,vkb:e.vkbView}),e.downtimesView=new S({model:t,embedded:!0,vkb:e.vkbView}),e.taktTimeView=new C({model:t}),e.quantitiesView=new T({model:t,embedded:!0,vkb:e.vkbView}),e.isaView=new v({model:t,embedded:!0,vkb:e.vkbView});var i="#"+e.idPrefix+"-";e.setView(i+"controls",e.controlsView),e.setView(i+"header",e.headerView),e.setView(i+"data",e.dataView),e.setView(i+"downtimes",e.downtimesView),e.setView(i+"taktTime",e.taktTimeView),e.setView(i+"quantities",e.quantitiesView),e.setView(i+"isa",e.isaView),e.setView(i+"vkb",e.vkbView)},defineBindings:function(){var e=this,t=e.model;e.listenTo(t,"locked",function(){e.$el.removeClass("is-unlocked").addClass("is-locked"),e.leaveProduction()}),e.listenTo(t,"unlocked",function(){e.$el.removeClass("is-locked").addClass("is-unlocked"),e.joinProduction()}),e.listenTo(t,"change:state",function(){null!==e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e);var i=t.previous("state"),o=t.get("state");i&&e.$el.removeClass("is-"+i),o&&e.$el.addClass("is-"+o),e.checkSpigot(),e.updateCurrentDowntime()}),e.listenTo(t,"change:shift",function(){if(s.closeAllDialogs(),e.$el.hasClass("hidden"))return void e.$el.removeClass("hidden");t.get("shift")&&s.msg.show({type:"info",time:2e3,text:n("production","msg:shiftChange")})}),e.listenTo(t,"change:_id",function(){e.subscribeForShiftChanges(),e.loadOrderQueue()}),e.listenTo(t.prodShiftOrder,"change:orderId",e.subscribeForQuantityDoneChanges),t.id&&this.subscribeForShiftChanges(),t.prodShiftOrder.get("orderId")&&this.subscribeForQuantityDoneChanges(),e.listenTo(t.prodDowntimes,"change:finishedAt",function(){e.updateCurrentDowntime()}),e.listenTo(t,"second",function(){e.updateCurrentDowntime()}),e.listenTo(t,"orderCorrected",function(){e.checkSpigot()}),e.listenTo(t.prodShiftOrder,"change:mechOrder",function(){e.$el.toggleClass("is-mechOrder",t.prodShiftOrder.isMechOrder())}),this.listenTo(t.settings,"reset change",this.toggleTaktTimeView),e.listenTo(e.downtimesView,"corroborated",function(){t.saveLocalData()}),e.socket.on("production.locked",function(){e.broker.publish(e.broker,"production.locked")})},beforeRender:function(){this.enableProdLog&&(a.enable(),this.enableProdLog=!1)},afterRender:function(){t(document.body).addClass("is-production").toggleClass("is-embedded",!0),t(".modal.fade").removeClass("fade"),this.toggleTaktTimeView(),this.socket.isConnected()&&this.joinProduction(),this.updateCurrentDowntime(),(this.model.isLocked()||this.model.id)&&this.$el.removeClass("hidden"),window.parent.postMessage({type:"ready",app:"operator"},"*")},onKeyDown:function(e){var t=e.target.tagName,i="INPUT"===t&&"BUTTON"!==e.target.type||"SELECT"===t||"TEXTAREA"===t;8!==e.keyCode||i&&!e.target.readOnly&&!e.target.disabled||e.preventDefault(),this.model.isTaktTimeEnabled()&&w.handleKeyboardEvent(e)},onBeforeUnload:function(){if(this.model.isLocked(),0)return this.timers.enableProdLog=setTimeout(a.enable.bind(a),1e3),this.model.isDowntime()?n("production","unload:downtime"):n("production","unload:order")},onWindowResize:function(){this.adjustCurrentDowntimeBox()},onProductionLocked:function(e){e.prodLine===this.model.prodLine.id&&e.secretKey===this.model.getSecretKey()&&(this.model.setSecretKey(null),s.msg.show({time:5e3,type:"warning",text:n("production","msg:locked")}))},onDuplicateDetected:function(){this.remove(),document.body.innerHTML=A()},onIsaRequestUpdated:function(e){this.pendingIsaChanges?this.pendingIsaChanges.push(e):this.applyIsaChange(e)},onOrderUpdated:function(e){var t=this.model.prodShiftOrder;if(e._id===t.get("orderId")){var i=e.change.newValues.qtyMax;void 0!==i&&t.trigger("qtyMaxChanged",i)}},applyIsaChange:function(e){e=p.parse(e);var t=this.model.isaRequests,i=t.get(e._id);i?i.set(e):(t.add(e),i=t.get(e._id)),i.isCompleted()&&t.remove(i)},joinProduction:function(){var t=this,i=t.model;if(t.timers.joinProduction&&(clearTimeout(t.timers.joinProduction),delete t.timers.joinProduction),!t.productionJoined&&!i.isLocked()&&t.socket.isConnected()){if(a.isSyncing())return t.broker.subscribe("production.synced",t.delayProductionJoin).setLimit(1);if(!i.id)return t.listenToOnce(i,"change:_id",t.delayProductionJoin);this.pendingIsaChanges||(this.pendingIsaChanges=[]);var o=i.prodDowntimes.findFirstUnfinished(),n={prodLineId:i.prodLine.id,prodShiftId:i.id,prodShiftOrderId:i.prodShiftOrder.id||null,prodDowntimeId:o?o.id:null,orderNo:i.prodShiftOrder.get("orderId")||null,dictionaries:{},orderQueue:!i.hasOrderQueue()};e.forEach(h,function(e,t){/^[A-Z0-9_]+$/.test(t)||(n.dictionaries[t]=e.updatedAt)}),this.socket.emit("production.join",n,function(o){o&&(o.totalQuantityDone&&i.prodShiftOrder.set("totalQuantityDone",o.totalQuantityDone),o.plannedQuantities&&(o.actualQuantities?i.updateQuantities(o.plannedQuantities,o.actualQuantities):i.updatePlannedQuantities(o.plannedQuantities)),o.prodDowntimes&&i.prodDowntimes.refresh(o.prodDowntimes),o.settings&&i.settings.reset(o.settings),o.isaRequests&&(i.isaRequests.reset(o.isaRequests.map(function(e){return p.parse(e)})),t.pendingIsaChanges&&(t.pendingIsaChanges.forEach(t.applyIsaChange,t),t.pendingIsaChanges=null)),e.isEmpty(o.orderQueue)||i.setNextOrder(o.orderQueue),e.forEach(o.dictionaries,function(e,t){h[t].reset(e)}))}),this.productionJoined=Date.now()}},leaveProduction:function(){this.productionJoined&&(this.socket.isConnected()&&this.socket.emit("production.leave",this.model.prodLine.id),this.productionJoined=0)},delayProductionJoin:function(){var e=this;e.timers.joinProduction&&clearTimeout(e.timers.joinProduction),e.timers.joinProduction=setTimeout(function(){e.timers.joinProduction=null,e.joinProduction()},333)},subscribeForShiftChanges:function(){this.shiftEditedSub&&(this.shiftEditedSub.cancel(),this.shiftEditedSub=null);var e=this.model;e.id&&(this.shiftEditedSub=this.pubsub.subscribe("production.edited.shift."+e.id,function(t){e.set(t)}))},subscribeForQuantityDoneChanges:function(){this.qtyDoneSub&&(this.qtyDoneSub.cancel(),this.qtyDoneSub=null);var e=this.model.prodShiftOrder,t=e.get("orderId");t&&(this.qtyDoneSub=this.pubsub.subscribe("orders.quantityDone."+t,function(t){e.set({totalQuantityDone:t})}),this.ajax({url:"/orders?_id="+t+"&select(qtyDone)&limit(1)"}).done(function(t){if(t.collection&&t.collection.length){var i=t.collection[0];i&&i._id===e.get("orderId")&&e.set("totalQuantityDone",i.qtyDone)}}))},loadOrderQueue:function(){var t=this;t.productionJoined&&!t.model.hasOrderQueue()&&t.model.id&&t.ajax({url:"/production/orderQueue/"+t.model.id}).done(function(i){e.isEmpty(i)||t.model.setNextOrder(i)})},checkSpigot:function(){var e=this.model,t=e.prodShiftOrder.get("spigot")||null,i=e.getSpigotComponent();if(i){if(t&&t.forceCheck&&i)return void this.showSpigotDialog(i);if("downtime"===e.get("state")&&!t&&e.isSpigotLine()){var o=e.settings,n=o.getValue("rearmDowntimeReason");e.prodDowntimes.findFirstUnfinished().get("reason")===n&&i&&this.showSpigotDialog(i)}}},showSpigotDialog:function(e){var t=new k({model:this.model,component:e,embedded:!0});this.broker.subscribe("viewport.dialog.hidden").setLimit(1).setFilter(function(e){return e===t}).on("message",this.checkSpigot.bind(this)),s.showDialog(t,n("production","spigotChecker:title"))},adjustCurrentDowntimeBox:function(){var e=this.$id("downtimes-header"),t=e.offset();if(t){var i=this.$id("currentDowntime"),o=this.$id("currentDowntime-message").css("margin-top","");i.css({top:t.top+e.outerHeight()+1+"px",left:t.left+"px",width:e.width()+"px"}),o.css("margin-top",(i.outerHeight()-o.outerHeight())/2+"px")}},updateCurrentDowntime:function(){var e,t,o,s,d=this.$id("currentDowntime"),r=this.incomingAutoDowntime,a=this.model.prodDowntimes.findFirstUnfinished();if(a)d.removeClass("is-incoming"),e=a.getReasonLabel(),t=a.getAorLabel(),o=a.getDurationString(null,!0),s=(a.get("auto")||{d:0}).d;else{if(!r)return void d.addClass("hidden");r.remainingTime=r.startingAt-Date.now(),e=c.get(r.reason),e=e?e.getLabel():null,t=u.get(this.model.getDefaultAor()),t=t?t.getLabel():null,o=n("production","autoDowntimes:remainingTime",{time:i.toString(r.remainingTime/1e3,!1,!1)}),s=r.duration,d.addClass("is-incoming")}if(!e||!t)return void d.addClass("hidden");this.$id("currentDowntime-reason").text(e),this.$id("currentDowntime-aor").text(t),this.$id("currentDowntime-elapsedTime").text(o),s?this.$id("currentDowntime-duration").text(i.toString(60*s)).removeClass("hidden"):this.$id("currentDowntime-duration").addClass("hidden"),d.removeClass("hidden"),this.adjustCurrentDowntimeBox(),r&&r.remainingTime<-1e3&&(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(r.reason,r.duration))},onSubdivisionAutoDowntime:function(e){this.onAutoDowntime(e,"subdivision")},onLineAutoDowntime:function(e){this.onAutoDowntime(e,"prodLine")},onAutoDowntime:function(e,t){!this.productionJoined||"subdivision"===t&&this.model.settings.getAutoDowntimes(this.model.prodLine.id).length>0||!this.model.shouldStartTimedAutoDowntime(e.reason)||(-1===e.remainingTime?(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(e.reason,e.duration)):(e.startingAt=Date.now()+e.remainingTime,this.incomingAutoDowntime=e,this.updateCurrentDowntime()))},onSnScanned:function(e){if(!s.currentDialog){if(!e.orderNo)return this.showSnMessage(e,"error","UNKNOWN_CODE");var t,i=this,o=i.model,n=o.get("state"),d=a.create(o,"checkSerialNumber",e),r=o.prodShiftOrder.getTaktTime(),u=o.prodShiftOrder.get("orderId");if("000000000"===e.orderNo&&(e.orderNo=u),e.sapTaktTime="number"==typeof r?r:0,"working"!==n?t="INVALID_STATE:"+n:e.orderNo!==u?t="INVALID_ORDER":w.contains(e._id)&&(t="ALREADY_USED"),t)return d.data.error=t,a.record(o,d),this.showSnMessage(e,"error",t);i.showSnMessage(e,"warning","CHECKING");var c=this.ajax({method:"POST",url:"/production/checkSerialNumber",data:JSON.stringify(d),timeout:6e3});c.fail(function(t){if(t.status<200)return o.updateTaktTimeLocally(d),void i.showSnMessage(e,"success","SUCCESS");d.data.error="SERVER_FAILURE",a.record(o,d),i.showSnMessage(e,"error","SERVER_FAILURE")}),c.done(function(t){"SUCCESS"===t.result?(o.updateTaktTime(t),i.showSnMessage(t.serialNumber,"success","SUCCESS")):("ALREADY_USED"===t.result&&w.add(t.serialNumber),d.data.error=t.result,a.record(o,d),i.showSnMessage(e,"error",t.result))})}},onSnChecked:function(e){e&&"SUCCESS"===e.result&&e.instanceId!==window.INSTANCE_ID&&this.model.updateTaktTime(e)},showSnMessage:function(e,t,i){var o=this.$id("snMessage"),s=this.$(".production-actions");this.$id("snMessage-text").html(n("production","snMessage:"+i)),this.$id("snMessage-scannedValue").text(e._id.length>19?e._id.substring(0,16)+"...":e._id),this.$id("snMessage-orderNo").text(e.orderNo||"-"),this.$id("snMessage-serialNo").text(e.serialNo||"-"),o.css({top:s.position().top+parseInt(s.css("marginTop"),10)+"px"}).removeClass("hidden is-success is-error is-warning").addClass("is-"+t),this.timers.hideSnMessage&&clearTimeout(this.timers.hideSnMessage),this.timers.hideSnMessage=setTimeout(this.hideSnMessage.bind(this),6e3)},hideSnMessage:function(){this.timers.hideSnMessage=null,this.$id("snMessage").addClass("hidden")},startActionTimer:function(e,t){this.actionTimer.action=e,this.actionTimer.time=Date.now(),t&&t.preventDefault()},stopActionTimer:function(e){if(this.actionTimer.action===e){var t=Date.now()-this.actionTimer.time>3e3;"switchApps"===e?t?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"operator"},"*"):"reboot"===e?t?window.parent.postMessage({type:"reboot"},"*"):window.location.reload():t&&"shutdown"===e&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}},toggleTaktTimeView:function(e){e&&e.id&&!/taktTime/.test(e.id)||this.$(".production-taktTime").toggleClass("hidden",!this.model.isTaktTimeEnabled()||!this.model.settings.showSmiley())}})});