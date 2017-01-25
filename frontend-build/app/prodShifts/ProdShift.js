// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../i18n","../user","../time","../socket","../viewport","../core/Model","../core/util/getShiftStartInfo","../data/downtimeReasons","../data/subdivisions","../data/workCenters","../data/prodFlows","../data/prodLines","../data/prodLog","../data/localStorage","../prodLines/ProdLine","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection","../prodShiftOrders/ProdShiftOrder","../prodShiftOrders/ProdShiftOrderCollection","../isa/IsaRequestCollection","../production/settings","../production/snManager","app/core/templates/userInfo"],function(t,e,r,i,n,o,s,a,d,h,u,l,f,c,g,p,m,S,w,D,O,v,y,T,C){"use strict";var L="PRODUCTION:LINE";return a.extend({urlRoot:"/prodShifts",clientUrlRoot:"#prodShifts",topicPrefix:"prodShifts",privilegePrefix:"PROD_DATA",nlsDomain:"prodShifts",defaults:function(){return{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,date:null,shift:null,state:null,quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}},initialize:function(t,e){e&&e.production&&(this.prodLine=c.get(this.get("prodLine")),this.prodLine||(this.prodLine=new m({_id:null})),this.shiftChangeTimer=null,this.settings=y.acquire({localStorage:!0}),this.prodShiftOrder=new D(null,{settings:this.settings}),this.prodDowntimes=new w(null,{paginate:!1,rqlQuery:"sort(-startedAt)&limit(8)&prodLine="+encodeURIComponent(this.prodLine.id)}),this.isaRequests=v.activeForLine(this.prodLine.id))},serialize:function(t){var e=this.toJSON();if(e.createdAt=n.format(e.createdAt,"LL, LTS"),e.creator=C({userInfo:e.creator}),e.date=n.format(e.date,"L"),e.shift=e.shift?r("core","SHIFT:"+e.shift):"?",t.orgUnits){var i=u.get(e.subdivision),o=f.get(e.prodFlow);e.subdivision=i?i.getLabel():"?",e.prodFlow=o?o.getLabel():"?",e.mrpControllers=Array.isArray(e.mrpControllers)&&e.mrpControllers.length?e.mrpControllers.join("; "):"?"}return t.personnel&&(e.master=C({userInfo:e.master}),e.leader=C({userInfo:e.leader}),e.operator=C({userInfo:e.operator})),e},startShiftChangeMonitor:function(){this.stopShiftChangeMonitor(),this.shiftChangeTimer=setTimeout(function(t){t.shiftChangeTimer=null,t.changeShift(),t.trigger("second")},1e3,this)},stopShiftChangeMonitor:function(){null!==this.shiftChangeTimer&&(clearTimeout(this.shiftChangeTimer),this.shiftChangeTimer=null)},readLocalData:function(e){if(!this.isLocked()){var r=null;try{r=this.constructor.parse(e?e:JSON.parse(p.getItem(this.getDataStorageKey()))),this.prodShiftOrder.clear(),r.prodShiftOrder&&this.prodShiftOrder.set(D.parse(r.prodShiftOrder)),this.prodDowntimes.reset((r.prodDowntimes||[]).map(S.parse),{silent:!0}),delete r.prodShiftOrder,delete r.prodDowntimes}catch(i){}t.isEmpty(r)||(this.prodDowntimes.findFirstUnfinished()?r.state="downtime":this.prodShiftOrder.id?r.state="working":r.state="idle",this.set(r)),this.prodDowntimes.length&&this.prodDowntimes.trigger("reset"),this.changeShift()}},saveLocalData:function(){if(!this.isLocked()){var t=this.toJSON();delete t.division,delete t.subdivision,delete t.mrpControllers,delete t.prodFlow,delete t.workCenter,delete t.prodLine,t.prodShiftOrder=this.prodShiftOrder.toJSON(),t.prodDowntimes=this.prodDowntimes.toJSON(),p.setItem(this.getDataStorageKey(),JSON.stringify(t))}},changeShift:function(){var t=this.getCurrentShiftMoment().toDate(),e=this.get("date");return e&&t.getTime()<=e.getTime()?this.startShiftChangeMonitor():o.isConnected()?this.startNewShiftIfNecessary(t):void this.startNewShift(t)},startNewShiftIfNecessary:function(t){var e=this;this.findExistingShift(t,function(r){r?e.readLocalData(r):e.startNewShift(t)})},findExistingShift:function(t,r){var i=this,n=e.ajax({url:"/prodShifts?prodLine="+this.get("prodLine")+"&date="+t.getTime()});n.fail(function(){i.startNewShift(t)}),n.done(function(o){if(!o||!o.totalCount||!Array.isArray(o.collection))return i.startNewShift(t);var s=o.collection[0];s.nextOrder=null;var a=e.ajax({url:"/prodShiftOrders?prodShift="+s._id+"&finishedAt=null&sort(-startedAt)"}),d=e.ajax({url:"/prodDowntimes?prodLine="+s.prodLine+"&sort(-startedAt)&limit(8)"});n=e.when(a,d),n.fail(function(){i.startNewShift(t)}),n.done(function(t,e){var i=t[0].collection,n=e[0].collection;s.prodShiftOrder=i&&i[0]?i[0]:null,s.prodDowntimes=Array.isArray(n)?n:[],r(s)})})},startNewShift:function(t){T.clear();var e=this.id||null;this.finishDowntime(!1),this.finishOrder(),this.prodShiftOrder.onShiftChanged(),this.set({date:t,shift:this.getCurrentShift(),state:"idle",quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:i.getInfo(),createdAt:new Date,master:null,leader:null,operator:null,operators:null,nextOrder:null}),this.set("_id",g.generateId(this.get("createdAt"),this.prodLine.id)),g.record(this,"changeShift",{finishedProdShiftId:e,startedProdShift:this.toJSON()}),this.startShiftChangeMonitor()},changeMaster:function(t){this.changePersonnel("changeMaster","master",t)},changeLeader:function(t){this.changePersonnel("changeLeader","leader",t)},changeOperator:function(t){this.changePersonnel("changeOperator","operator",t)},changePersonnel:function(t,e,r){var i=this.get(e);i===r||i&&r&&i.id===r.id||(this.set(e,r),this.onPersonnelChanged(e),g.record(this,t,r))},onPersonnelChanged:function(t){var e=this.get(t);this.prodShiftOrder.id&&this.prodShiftOrder.set(t,e);var r=this.prodDowntimes.findFirstUnfinished();r&&r.set(t,e),"operator"===t&&"assembly"===this.getSubdivisionType()&&(this.set("operators",e?[e]:null),this.onPersonnelChanged("operators"))},changeCurrentQuantitiesDone:function(t){this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(),t)},changeQuantitiesDone:function(t,e,r){("number"!=typeof e||isNaN(e))&&(e=0);var i=this.get("quantitiesDone");if(!i[t])throw new Error("Invalid hour: "+t);i[t].actual!==e&&(i[t].actual=e,this.trigger("change:quantitiesDone",this,i,r||{}),r&&r.record===!1||g.record(this,"changeQuantitiesDone",{hour:t,newValue:e}))},changeOrder:function(t,e){this.finishOrder(),this.set({state:"working",nextOrder:this.getNextOrders().filter(function(e){return e.order.no!==t.no})});var r=this.prodShiftOrder.get("orderId");this.prodShiftOrder.onOrderChanged(this,t,e),g.record(this,"changeOrder",this.prodShiftOrder.toJSON()),r!==this.prodShiftOrder.get("orderId")&&this.autoStartDowntime()},correctOrder:function(t,e){if(!this.hasOrder())throw new Error("Cannot correct the order: no order is started!");var r=this.prodShiftOrder.onOrderCorrected(this,t,e);r&&(g.record(this,"correctOrder",r),this.trigger("orderCorrected"))},setNextOrder:function(e){if(!this.hasOrder())throw new Error("Cannot set the next order: no order is started!");var r=this.get("nextOrder"),i=t.isEmpty(e);if(!i||!t.isEmpty(r)){var n=r?r.map(function(t){return{orderNo:t.order.no,operationNo:t.operationNo}}):[],o=e?e.map(function(t){return{orderNo:t.order.no,operationNo:t.operationNo}}):[];t.isEqual(o,n)||(i&&(e=[],o=[]),this.set("nextOrder",e),g.record(this,"setNextOrder",{orders:o}))}},continueOrder:function(){if(this.hasOrder())throw new Error("Cannot continue the order: an order is already started!");if(!this.prodShiftOrder.hasOrderData())throw new Error("Cannot continue the order: no order data!");this.set("state","working"),this.prodShiftOrder.onOrderContinued(this),g.record(this,"changeOrder",this.prodShiftOrder.toJSON())},changeQuantityDone:function(t){if(!this.hasOrder())throw new Error("Cannot change the quantity done: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("quantityDone")&&(this.prodShiftOrder.set("quantityDone",t),g.record(this,"changeQuantityDone",{newValue:t}))},changeWorkerCount:function(t){if(!this.hasOrder())throw new Error("Cannot change the worker count: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("workerCount")&&(this.prodShiftOrder.set("workerCount",t),this.prodShiftOrder.set("sapTaktTime",this.prodShiftOrder.getSapTaktTime()),g.record(this,"changeWorkerCount",{newValue:t,sapTaktTime:this.prodShiftOrder.get("sapTaktTime")}))},endDowntime:function(){this.hasOrder()?this.set("state","working"):this.set("state","idle");var t=this.prodDowntimes.findFirstUnfinished();this.finishDowntime()?this.startNextAutoDowntime(t):this.saveLocalData()},endWork:function(){this.finishDowntime(),this.finishOrder(),this.set("state","idle"),this.prodShiftOrder.onWorkEnded(),g.record(this,"endWork",{})},startDowntime:function(t){if("working"===this.get("state")){var e=this.prodDowntimes.addFromInfo(this,t);this.set("state","downtime"),g.record(this,"startDowntime",e.toJSON())}},finishOrder:function(){var t=this.prodShiftOrder.finish();t&&g.record(this,"finishOrder",t)},finishDowntime:function(){var t=this.prodDowntimes.finish();return t&&g.record(this,"finishDowntime",t),!!t},editDowntime:function(t,e){t.set(e),e=t.changedAttributes(),e&&(e._id=t.id,g.record(this,"editDowntime",e))},isTaktTimeEnabled:function(){return!this.isLocked()&&this.settings.isTaktTimeEnabled(this.prodLine.id)},updateTaktTimeLocally:function(t){this.updateTaktTime(T.getLocalTaktTime(t.data,this.prodShiftOrder,this.getCurrentQuantityDoneHourIndex())),g.record(this,t)},updateTaktTime:function(t){T.add(t.serialNumber);var e=this.get("quantitiesDone");e[t.hourlyQuantityDone.index].actual=t.hourlyQuantityDone.value,this.trigger("change:quantitiesDone",this,e,{}),this.prodShiftOrder.set({quantityDone:t.quantityDone,lastTaktTime:t.lastTaktTime,avgTaktTime:t.avgTaktTime}),this.saveLocalData()},checkSpigot:function(t,e){var r,i=this.prodShiftOrder.get("spigot"),n=!1;if(t)r=i?i.prodDowntime:this.prodDowntimes.findFirstUnfinished().id;else{if(!i)return!0;r=i.prodDowntime,t=i.component,n=!0}var o=this.checkSpigotValidity(e,t.nc12);return o&&this.prodShiftOrder.set("spigot",{prodDowntime:r,component:t,initial:!0,"final":n}),g.record(this,"checkSpigot",{"final":n,valid:o,nc12:e,component:t,prodDowntime:r}),o},checkSpigotValidity:function(t,e){if(t===e)return!0;var r={};return(this.settings.getValue("spigotGroups")||"").split("\n").forEach(function(t){var e=t.split(":"),i=e[0].trim(),n=e[1].split(", ");n.forEach(function(t){r[t.trim()]=i})}),t===r[e]},hasOrder:function(){return!!this.prodShiftOrder.id},getLabel:function(){var t=this.get("prodLine")||"?",e=this.get("date"),i=this.get("shift");return e&&i&&(t+=": "+n.format(this.get("date"),"L"),t+=", "+r("core","SHIFT:"+this.get("shift"))),t},getCurrentTime:function(){return n.getMoment().format("L, LTS")},getCurrentShift:function(){var t=n.getMoment().hour();return t>=6&&14>t?1:t>=14&&22>t?2:3},getCurrentShiftMoment:function(){return d(Date.now()).moment},getTimeToNextShift:function(){return this.getCurrentShiftMoment().add(8,"hours").diff(n.getMoment())},getCurrentQuantityDoneHourIndex:function(){var t=n.getMoment().hours();return t>=6&&14>t?t-6:t>=14&&22>t?t-14:22===t?0:23===t?1:t+2},getCurrentQuantityDoneHourRange:function(){var t=n.getMoment().minutes(0).seconds(0),e=t.format("LTS"),r=t.minutes(59).seconds(59).format("LTS");return e+"-"+r},getQuantityDoneInCurrentHour:function(){var t=this.get("quantitiesDone");if(!Array.isArray(t))return 0;var e=this.getCurrentQuantityDoneHourIndex();return e>=t.length?0:t[e].actual},getOrderIdType:function(){return"press"===this.getSubdivisionType()?"nc12":"no"},isIdle:function(){return"idle"===this.get("state")},isDowntime:function(){return"downtime"===this.get("state")},isWorking:function(){return"working"===this.get("state")},getMaxQuantitiesDone:function(){return 150},getSubdivisionType:function(){var t=u.get(this.get("subdivision"));return t?t.get("type"):null},getDowntimeReasons:function(){return h.findBySubdivisionType(this.getSubdivisionType())},getBreakReason:function(){return h.findFirstBreakIdBySubdivisionType(this.getSubdivisionType())},getDefaultAor:function(){var t=this.prodLine.getSubdivision();return t?t.get("aor"):null},isSpigotLine:function(){return-1!==(this.settings.getValue("spigotLines")||"").split(",").indexOf(this.prodLine.id)},getSpigotComponent:function(){return this.prodShiftOrder.getSpigotComponent(this.settings.getValue("spigotPatterns"),this.settings.getValue("spigotNotPatterns"))},getNextOrders:function(){var e=this.get("nextOrder")||[];return Array.isArray(e)||t.isEmpty(e)||(e=[{order:e.orderInfo,operationNo:e.operationNo}]),e},hasEnded:function(){var t=n.getMoment(this.get("date")).valueOf(),e=d(new Date).moment.valueOf();return e>t},updatePlannedQuantities:function(t){if(Array.isArray(t)&&8===t.length&&Array.isArray(this.attributes.quantitiesDone)){for(var e=0;8>e;++e)this.attributes.quantitiesDone[e].planned=t[e];this.saveLocalData(),this.trigger("change:quantitiesDone",this,this.attributes.quantitiesDone,{})}},isLocked:function(){return!g.isEnabled()||!this.prodLine||null===this.getSecretKey()},getSecretKey:function(){var t=p.getItem(this.getSecretKeyStorageKey());return"string"==typeof t?t:null},setSecretKey:function(t,e,r){null===t?(p.removeItem(this.getSecretKeyStorageKey()),p.removeItem(this.getDataStorageKey()),p.removeItem(L),this.prodShiftOrder.clear(),this.prodDowntimes.reset(),this.stopShiftChangeMonitor(),this.set({prodLine:null,date:null,shift:null,state:null,quantitiesDone:null,creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}),this.trigger("locked")):(p.setItem(this.getSecretKeyStorageKey(e.prodLine),t),e.prodLine&&p.setItem(L,e.prodLine),r||this.trigger("unlocked"),this.readLocalData(e),r&&window.location.reload())},getSecretKeyStorageKey:function(t){return"PRODUCTION:SECRET_KEY:"+(t||this.prodLine.id)},getDataStorageKey:function(t){return"PRODUCTION:DATA:"+(t||this.prodLine.id)},autoStartDowntime:function(){var e=this.getDefaultAor();if(e){var r=u.get(this.get("subdivision"));if(r){var i=r.get("autoDowntimes");if(!t.isEmpty(i)){var n;if(this.isBetweenInitialDowntimeWindow(Date.now())&&(n=t.find(i,function(t){return"initial"===t.when})),n||(n=t.find(i,function(t){return"always"===t.when})),n){var o=h.get(n.reason);o&&this.startDowntime({aor:e,reason:o.id,reasonComment:"",auto:{}})}}}}},startNextAutoDowntime:function(e){if(e&&e.get("auto")){var r=this.getDefaultAor(),i=u.get(this.get("subdivision"));if(r&&i){var n=i.get("autoDowntimes");if(!t.isEmpty(n)){for(var o,s=0;s<n.length;++s){var a=n[s];if(a.reason===e.get("reason")){for(var d=s+1;d<n.length;++d){var h=n[d];if("time"!==h.when){o=h;break}}if(o)break}}o&&this.startDowntime({aor:r,reason:o.reason,reasonComment:"",auto:{}})}}}},isBetweenInitialDowntimeWindow:function(t){var e=parseInt(this.settings.getValue("initialDowntimeWindow"),10);if(isNaN(e)||1>e)return!1;var r=this.get("date").getTime(),i=r+60*e*1e3;return t>=r&&i>=t},shouldStartTimedAutoDowntime:function(t){return"working"===this.get("state")&&!this.prodDowntimes.some(function(e){return e.get("reason")===t&&Date.now()-Date.parse(e.get("finishedAt"))<6e5})},startTimedAutoDowntime:function(t,e){if(this.shouldStartTimedAutoDowntime(t)){var r=this.getDefaultAor();r&&(s.closeAllDialogs(),this.startDowntime({aor:r,reason:t,reasonComment:"",auto:{d:e}}))}}},{STATE:{IDLE:"idle",WORKING:"working",DOWNTIME:"downtime"},LINE_STORAGE_KEY:L,parse:function(t){return"string"==typeof t.date&&(t.date=new Date(t.date)),"string"==typeof t.createdAt&&(t.createdAt=new Date(t.createdAt)),t}})});