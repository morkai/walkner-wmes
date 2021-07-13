define(["underscore","jquery","app/time","app/user","app/i18n","app/viewport","app/updater/index","app/core/View","app/core/util/embedded","app/data/prodLog","app/data/aors","app/data/downtimeReasons","app/data/dictionaries","app/prodShifts/ProdShift","app/prodDowntimes/ProdDowntime","app/isa/IsaRequest","../snManager","../views/VkbView","../views/ProductionControlsView","../views/ProductionHeaderView","../views/ProductionDataView","../views/ProdDowntimeListView","../views/ProductionQuantitiesView","../views/IsaView","../views/TaktTimeView","../views/SpigotCheckerView","../views/ExecutionView","../views/SequenceView","app/production/templates/productionPage","app/production/templates/duplicateWarning"],function(e,i,t,o,n,s,d,r,a,u,c,l,h,m,p,g,w,f,b,D,v,k,C,S,T,y,V,L,P,x){"use strict";var E=a.isEnabled();return r.extend({template:P,layoutName:"blank",remoteTopics:function(){var e={},i=this.model.prodLine.id;return i&&(e["production.messageRequested."+i]="onMessageRequested",e["production.autoDowntimes."+this.model.get("subdivision")]="onSubdivisionAutoDowntime",e["production.autoDowntimes."+i]="onLineAutoDowntime",e["production.taktTime.snChecked."+i]="onSnChecked",e["isa.requests.created."+i+".**"]="onIsaRequestUpdated",e["isa.requests.updated."+i+".**"]="onIsaRequestUpdated",e["orders.updated.*"]="onOrderUpdated"),e},localTopics:{"socket.connected":function(){this.joinProduction()},"socket.disconnected":function(){this.leaveProduction()},"updater.frontendReloading":function(){this.model.saveLocalData()},"router.dispatching":function(e){e.path!=="/production/"+this.model.prodLine.id&&this.leaveProduction()},"production.locked":"onProductionLocked","production.duplicateDetected":"onDuplicateDetected"},events:{"click #-currentDowntime":function(){var e=this.model.prodDowntimes.findFirstUnfinished();e&&this.downtimesView.showEditDialog(e.id)},focusin:function(){clearTimeout(this.timers.blur),this.timers.blur=setTimeout(function(){document.body.classList.contains("modal-open")||document.activeElement.classList.contains("form-control")||document.activeElement.blur()},5e3)},"click #-message":"hideMessage"},breadcrumbs:function(){return[this.t("breadcrumbs:base"),this.model.getLabel()]},initialize:function(){o.getLabel=n.bound("production","userLabel"),this.delayProductionJoin=this.delayProductionJoin.bind(this),this.onBeforeUnload=this.onBeforeUnload.bind(this),this.onWindowResize=e.debounce(this.onWindowResize.bind(this),33),this.layout=null,this.shiftEditedSub=null,this.qtyDoneSub=null,this.productionJoined=0,this.enableProdLog=!1,this.pendingIsaChanges=[],d.disableViews(),this.defineViews(),this.defineBindings(),i(window).on("resize."+this.idPrefix,this.onWindowResize).on("beforeunload."+this.idPrefix,this.onBeforeUnload),E&&i(window).on("contextmenu."+this.idPrefix,function(e){e.preventDefault()}),w.bind(this)},setUpLayout:function(e){this.layout=e},destroy:function(){i(document.body).removeClass("is-production is-embedded"),i(".modal").addClass("fade"),this.layout=null,this.shiftEditedSub=null,i(window).off("."+this.idPrefix),this.model.stopShiftChangeMonitor(),d.enableViews(),u.disable()},getTemplateData:function(){return{locked:this.model.isLocked(),state:this.model.get("state"),mechOrder:!!this.model.prodShiftOrder.get("mechOrder"),showBottomControls:E}},load:function(e){var t=this,o=i.Deferred(),n=i.Deferred();return o.done(function(){t.timers.readLocalData=setTimeout(function(){t.timers.readLocalData=null,t.model.readLocalData()},1)}),o.fail(function(){document.body.innerHTML=x()}),o.always(function(){"rejected"===o.state()?(t.enableProdLog=!1,n.reject()):(t.enableProdLog=!0,n.resolve())}),u.enable(o),e(n.promise())},defineViews:function(){var e=this.model;this.vkbView=new f,this.controlsView=new b({model:e,embedded:E,vkb:this.vkbView}),this.headerView=new D({model:e,embedded:E,vkb:this.vkbView}),this.dataView=new v({model:e,embedded:E,vkb:this.vkbView}),this.downtimesView=new k({model:e,embedded:E,vkb:this.vkbView}),this.taktTimeView=new T({model:e}),this.quantitiesView=new C({model:e,embedded:E,vkb:this.vkbView}),this.isaView=new S({model:e,embedded:E,vkb:this.vkbView}),this.sequenceView=new L({model:e}),this.executionView=new V({model:e}),this.setView("#-controls",this.controlsView),this.setView("#-header",this.headerView),this.setView("#-data",this.dataView),this.setView("#-execution",this.executionView),this.setView("#-sequence",this.sequenceView),this.setView("#-downtimes",this.downtimesView),this.setView("#-taktTime",this.taktTimeView),this.setView("#-quantities",this.quantitiesView),this.setView("#-isa",this.isaView),E&&this.setView("#-vkb",this.vkbView)},defineBindings:function(){var i=this,t=i.model;i.listenTo(t,"locked",function(){i.$el.removeClass("is-unlocked").addClass("is-locked"),i.leaveProduction()}),i.listenTo(t,"unlocked",function(){i.$el.removeClass("is-locked").addClass("is-unlocked"),i.joinProduction()}),i.listenTo(t,"change:state",function(){null!==i.layout&&i.layout.setBreadcrumbs(i.breadcrumbs,i),i.$el.removeClass("is-idle is-working is-downtime").addClass("is-"+t.get("state")),i.checkSpigot(),i.updateCurrentDowntime()}),i.listenTo(t,"change:shift",function(){s.closeAllDialogs(),i.$el.hasClass("hidden")?i.$el.removeClass("hidden"):t.get("shift")&&s.msg.show({type:"info",time:2e3,text:n("production","msg:shiftChange")})}),i.listenTo(t,"change:_id",function(){i.subscribeForShiftChanges(),i.productionJoined&&(t.execution.clear(),i.timers.loadOrderQueue=setTimeout(i.loadOrderQueue.bind(i),e.random(666,6666)))}),i.listenTo(t.prodShiftOrder,"change:orderId",function(){i.subscribeForQuantityDoneChanges(0===i.productionJoined)}),i.listenTo(t.prodDowntimes,"change:finishedAt",function(){i.updateCurrentDowntime()}),i.listenTo(t,"second",function(){i.updateCurrentDowntime()}),i.listenTo(t,"orderCorrected",function(){i.checkSpigot()}),i.listenTo(t,"message:show",function(e){i.onMessageRequested({message:e})}),i.listenTo(t.prodShiftOrder,"change:mechOrder",function(){i.$el.toggleClass("is-mechOrder",t.prodShiftOrder.isMechOrder())}),i.listenTo(t.settings,"reset change",this.toggleTaktTimeView),i.listenTo(i.downtimesView,"corroborated",function(){t.saveLocalData()}),i.socket.on("production.locked",function(){i.broker.publish(i.broker,"production.locked")})},beforeRender:function(){this.enableProdLog&&(u.enable(),this.enableProdLog=!1)},afterRender:function(){i(document.body).addClass("is-production").toggleClass("is-embedded",E),i(".modal.fade").removeClass("fade"),this.toggleTaktTimeView(),this.socket.isConnected()&&this.joinProduction(),this.updateCurrentDowntime(),(this.model.isLocked()||this.model.id)&&this.$el.removeClass("hidden"),E&&window.parent.postMessage({type:"ready",app:"operator"},"*"),a.render(this),this.model.isLocked()&&this.controlsView.unlock()},onBeforeUnload:function(){if(!(this.model.isLocked()||E||(u.disable(),this.model.isIdle()||d.isFrontendReloading())))return this.timers.enableProdLog=setTimeout(u.enable.bind(u),1e3),this.model.isDowntime()?n("production","unload:downtime"):n("production","unload:order")},onWindowResize:function(){this.adjustCurrentDowntimeBox()},onProductionLocked:function(e){e.prodLine===this.model.prodLine.id&&e.secretKey===this.model.getSecretKey()&&(this.model.setSecretKey(null),s.msg.show({time:5e3,type:"warning",text:n("production","msg:locked")}),this.$el.removeClass("hidden"))},onDuplicateDetected:function(){this.remove(),document.body.innerHTML=x()},onIsaRequestUpdated:function(e){this.pendingIsaChanges?this.pendingIsaChanges.push(e):this.applyIsaChange(e)},onOrderUpdated:function(e){var i=this.model.prodShiftOrder;if(e._id===i.get("orderId")){var t=e.change.newValues.qtyMax;void 0!==t&&i.trigger("qtyMaxChanged",t)}},applyIsaChange:function(e){e=g.parse(e);var i=this.model.isaRequests,t=i.get(e._id);t?t.set(e):(i.add(e),t=i.get(e._id)),t.isCompleted()&&i.remove(t)},joinProduction:function(){var i=this,t=i.model;if(i.timers.joinProduction&&(clearTimeout(i.timers.joinProduction),delete i.timers.joinProduction),!i.productionJoined&&!t.isLocked()&&i.socket.isConnected()){if(u.isSyncing())return i.broker.subscribe("production.synced",i.delayProductionJoin).setLimit(1);if(!t.id)return i.listenToOnce(t,"change:_id",i.delayProductionJoin);var o=window.WMES_CLIENT&&window.WMES_CLIENT.config||{};if(!o.line||!o.station||t.prodLine.id===o.line&&t.prodLine.station===o.station){this.pendingIsaChanges||(this.pendingIsaChanges=[]);var n=t.prodDowntimes.findFirstUnfinished(),s={prodLineId:t.prodLine.id,prodShiftId:t.id,prodShiftOrderId:t.prodShiftOrder.id||null,prodDowntimeId:n?n.id:null,orderNo:t.prodShiftOrder.get("orderId")||null,operationNo:t.prodShiftOrder.get("operationNo")||null,dictionaries:{},orderQueue:!0};e.forEach(h,function(e,i){/^[A-Z0-9_]+$/.test(i)||(s.dictionaries[i]=e.updatedAt)}),this.socket.emit("production.join",s,function(o){o&&(o.totalQuantityDone&&t.prodShiftOrder.set("totalQuantityDone",o.totalQuantityDone),o.plannedQuantities&&(o.actualQuantities?t.updateQuantities(o.plannedQuantities,o.actualQuantities):t.updatePlannedQuantities(o.plannedQuantities)),o.prodDowntimes&&t.prodDowntimes.refresh(o.prodDowntimes),o.settings&&t.settings.reset(o.settings),o.isaRequests&&(t.isaRequests.reset(o.isaRequests.map(function(e){return g.parse(e)})),i.pendingIsaChanges&&(i.pendingIsaChanges.forEach(i.applyIsaChange,i),i.pendingIsaChanges=null)),e.isEmpty(o.orderQueue)||t.setNextOrder(o.orderQueue),t.execution.set("whProblems",o.whProblems||[]),e.isEmpty(o.execution)||t.execution.set(o.execution),e.forEach(o.dictionaries,function(e,i){h[i].reset(e)}))}),this.productionJoined=Date.now()}else i.lock()}},leaveProduction:function(){this.productionJoined&&(this.socket.isConnected()&&this.socket.emit("production.leave",this.model.prodLine.id),this.productionJoined=0)},delayProductionJoin:function(){var e=this;e.timers.joinProduction&&clearTimeout(e.timers.joinProduction),e.timers.joinProduction=setTimeout(function(){e.timers.joinProduction=null,e.joinProduction()},333)},lock:function(){this.model.setSecretKey(null),window.location.reload()},subscribeForShiftChanges:function(){this.shiftEditedSub&&(this.shiftEditedSub.cancel(),this.shiftEditedSub=null);var e=this.model;e.id&&(this.shiftEditedSub=this.pubsub.subscribe("production.edited.shift."+e.id,function(i){e.set(i)}))},subscribeForQuantityDoneChanges:function(e){this.qtyDoneSub&&(this.qtyDoneSub.cancel(),this.qtyDoneSub=null);var i=this.model.prodShiftOrder,t=i.get("orderId");t&&(this.qtyDoneSub=this.pubsub.subscribe("orders.quantityDone."+t,function(e){i.set("totalQuantityDone",e.qtyDone)}),e||this.ajax({url:"/orders?_id="+t+"&select(qtyDone)&limit(1)"}).done(function(e){if(e.collection&&e.collection.length){var t=e.collection[0];t&&t._id===i.get("orderId")&&i.set("totalQuantityDone",t.qtyDone)}}))},loadOrderQueue:function(){var e=this;e.productionJoined&&e.model.id&&e.ajax({url:"/production/planExecution/"+e.model.id}).done(function(i){e.model.setNextOrder(i.orderQueue),e.model.execution.set(i.execution)})},checkSpigot:function(){var e=this.model,i=e.prodShiftOrder.get("spigot")||null,t=e.getSpigotComponent();if(t){var o=e.getSpigotInsertComponent();if(o&&(t=o),i&&i.forceCheck)this.showSpigotDialog(t);else if("downtime"===e.get("state")&&!i&&e.isSpigotLine()){var n=e.prodDowntimes.findFirstUnfinished();if(n){var s=e.settings.getValue("rearmDowntimeReason");n.get("reason")===s&&t&&this.showSpigotDialog(t)}else window.WMES_LOG_BROWSER_ERROR&&window.WMES_LOG_BROWSER_ERROR("Spigot downtime without downtime?!? "+localStorage.getItem(e.getDataStorageKey()))}}},showSpigotDialog:function(e){var i=new y({model:this.model,component:e,embedded:E});this.broker.subscribe("viewport.dialog.hidden").setLimit(1).setFilter(function(e){return e===i}).on("message",this.checkSpigot.bind(this)),s.showDialog(i,n("production","spigotChecker:title"))},adjustCurrentDowntimeBox:function(){var e=this.$id("sequence-header"),i=e.offset();if(i){var t=this.$id("currentDowntime"),o=this.$id("currentDowntime-message").css("margin-top","");t.css({top:i.top+e.outerHeight()+1+"px",left:i.left+"px",width:e.width()+"px"}),o.css("margin-top",(t.outerHeight()-o.outerHeight())/2+"px")}},updateCurrentDowntime:function(){var e,i,o,s,d=this.$id("currentDowntime"),r=this.incomingAutoDowntime,a=this.model.prodDowntimes.findFirstUnfinished();if(a)d.removeClass("is-incoming"),e=a.getReasonLabel(),i=a.getAorLabel(),o=a.getDurationString(null,!0),s=(a.get("auto")||{d:0}).d;else{if(!r)return void d.addClass("hidden");r.remainingTime=r.startingAt-Date.now(),e=(e=l.get(r.reason))?e.getLabel():null,i=(i=c.get(this.model.getDefaultAor()))?i.getLabel():null,o=n("production","autoDowntimes:remainingTime",{time:t.toString(r.remainingTime/1e3,!1,!1)}),s=r.duration,d.addClass("is-incoming")}e&&i?(this.$id("currentDowntime-reason").text(e),this.$id("currentDowntime-aor").text(i),this.$id("currentDowntime-elapsedTime").text(o),s>0?this.$id("currentDowntime-duration").text(t.toString(60*s)).removeClass("hidden"):this.$id("currentDowntime-duration").addClass("hidden"),d.removeClass("hidden"),this.adjustCurrentDowntimeBox(),r&&r.remainingTime<-1e3&&(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(r.reason,r.duration)),s>0&&a&&a.get("auto")&&a.getDuration()>=60*s*1e3&&this.model.endDowntime()):d.addClass("hidden")},onSubdivisionAutoDowntime:function(e){this.onAutoDowntime(e,"subdivision")},onLineAutoDowntime:function(e){this.onAutoDowntime(e,"prodLine")},onAutoDowntime:function(e,i){!this.productionJoined||"subdivision"===i&&this.model.settings.getAutoDowntimes(this.model.prodLine.id).length>0||!this.model.shouldStartTimedAutoDowntime(e.reason)||(-1===e.remainingTime?(this.incomingAutoDowntime=null,this.model.startTimedAutoDowntime(e.reason,e.duration)):(e.startingAt=Date.now()+e.remainingTime,this.incomingAutoDowntime=e,this.updateCurrentDowntime()))},createCheckSn:function(e,i,t){var o,n=this.model,s=n.get("state"),d=u.create(n,"checkSerialNumber",e),r=n.prodShiftOrder.getTaktTime(),a=n.prodShiftOrder.get("orderId");"000000000"===e.orderNo&&(e.orderNo=a),e.sapTaktTime="number"==typeof r?r:0,w.contains(e._id)?o="ALREADY_USED":w.isExtraPsnEnabled()?d=w.createDynamicLogEntry(e):"working"!==s?o="INVALID_STATE:"+s:e.orderNo!==a&&(this.socket.isConnected()?d=w.createDynamicLogEntry(e):o="INVALID_ORDER"),o?(d.data.error=o,u.record(n,d),w.showMessage(e,"error",o),t(o)):t(null,d,i)},onSnChecked:function(e){e&&"SUCCESS"===e.result&&e.instanceId!==window.INSTANCE_ID&&this.model.updateTaktTime(e)},toggleTaktTimeView:function(e){e&&e.id&&!/taktTime/.test(e.id)||this.$(".production-taktTime").toggleClass("hidden",!this.model.isTaktTimeEnabled()||!this.model.settings.showSmiley())},onMessageRequested:function(e){this.showMessage(e.message)},showMessage:function(e){var i=n.has("production","message:"+e.code)?n("production","message:"+e.code,e):e.text;if(i){this.timers.hideMessage&&(clearTimeout(this.timers.hideMessage),this.timers.hideMessage=null),e.time>=0&&(this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),e.time||6e4));var t=this.$id("message");t.data("message")&&this.model.trigger("message:hidden",t.data("message"));var o=this.$id("message-outer");o.css("marginTop",""),this.$id("message-inner").html(i),t.data("message",e).attr("data-type",e.type||"info").removeClass("hidden"),o.css("marginTop",o.outerHeight()/2*-1+"px"),document.body.click(),this.model.trigger("message:shown",e)}},hideMessage:function(){this.timers.hideMessage&&(clearTimeout(this.timers.hideMessage),this.timers.hideMessage=null);var e=this.$id("message"),i=e.data("message");e.removeData("message").addClass("hidden"),i&&this.model.trigger("message:hidden",i)}})});