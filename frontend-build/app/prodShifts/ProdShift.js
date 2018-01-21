// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../i18n","../user","../time","../socket","../viewport","../core/Model","../core/util/getShiftStartInfo","../data/downtimeReasons","../data/subdivisions","../data/workCenters","../data/prodFlows","../data/prodLines","../data/prodLog","../data/localStorage","../prodLines/ProdLine","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection","../prodShiftOrders/ProdShiftOrder","../prodShiftOrders/ProdShiftOrderCollection","../isa/IsaRequestCollection","../production/settings","../production/snManager","app/core/templates/userInfo"],function(t,e,i,r,n,o,s,a,d,h,u,l,f,c,g,p,m,S,D,w,O,v,y,T,C){"use strict";var L="PRODUCTION:LINE";return a.extend({urlRoot:"/prodShifts",clientUrlRoot:"#prodShifts",topicPrefix:"prodShifts",privilegePrefix:"PROD_DATA",nlsDomain:"prodShifts",defaults:function(){return{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,date:null,shift:null,state:null,quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}},initialize:function(t,e){e&&e.production&&(this.prodLine=c.get(this.get("prodLine")),this.prodLine||(this.prodLine=new m({_id:null})),this.shiftChangeTimer=null,this.settings=y.acquire({localStorage:!0}),this.prodShiftOrder=new w(null,{settings:this.settings}),this.prodDowntimes=new D(null,{paginate:!1,rqlQuery:"sort(-startedAt)&limit(8)&prodLine="+encodeURIComponent(this.prodLine.id)}),this.isaRequests=v.activeForLine(this.prodLine.id))},serialize:function(e){var r=this.toJSON();if(r.createdAt=n.format(r.createdAt,"LL, LTS"),r.creator=C({userInfo:r.creator}),r.date=n.format(r.date,"L"),r.shift=r.shift?i("core","SHIFT:"+r.shift):"?",e.orgUnits){var o=u.get(r.subdivision),s=f.get(r.prodFlow),a={};t.forEach(r.orderMrp,function(t){a[t]=1}),t.forEach(r.mrpControllers,function(t){a[t]=1}),r.subdivision=o?o.getLabel():"?",r.prodFlow=s?s.getLabel():"?",r.mrpControllers=t.map(a,function(e,i){return!r.orderMrp||t.includes(r.orderMrp,i)?i:'<span style="text-decoration: line-through">'+i+"</span>"}).join("; ")}if(e.personnel&&(r.master=C({userInfo:r.master}),r.leader=C({userInfo:r.leader}),r.operator=C({userInfo:r.operator})),e.totalQuantityDone){var d={planned:0,actual:0};t.forEach(r.quantitiesDone,function(t){d.planned+=t.planned,d.actual+=t.actual}),r.totalQuantityDone=i("prodShifts","totalQuantityDone",d)}return r.efficiency=Math.round(100*r.efficiency)+"%",r.orderMrp=Array.isArray(r.orderMrp)?r.orderMrp.join("; "):"",r},startShiftChangeMonitor:function(){this.stopShiftChangeMonitor(),this.shiftChangeTimer=setTimeout(function(t){t.shiftChangeTimer=null,t.changeShift(),t.trigger("second")},1e3,this)},stopShiftChangeMonitor:function(){null!==this.shiftChangeTimer&&(clearTimeout(this.shiftChangeTimer),this.shiftChangeTimer=null)},readLocalData:function(e){if(!this.isLocked()){var i=null;try{i=this.constructor.parse(e?e:JSON.parse(p.getItem(this.getDataStorageKey()))),this.prodShiftOrder.clear(),i.prodShiftOrder&&this.prodShiftOrder.set(w.parse(i.prodShiftOrder)),this.prodDowntimes.reset((i.prodDowntimes||[]).map(S.parse),{silent:!0}),delete i.prodShiftOrder,delete i.prodDowntimes}catch(t){}t.isEmpty(i)||(this.prodDowntimes.findFirstUnfinished()?i.state="downtime":this.prodShiftOrder.id?i.state="working":i.state="idle",this.set(i)),this.prodDowntimes.length&&this.prodDowntimes.trigger("reset"),this.changeShift()}},saveLocalData:function(){if(!this.isLocked()){var t=this.toJSON();delete t.division,delete t.subdivision,delete t.mrpControllers,delete t.prodFlow,delete t.workCenter,delete t.prodLine,t.prodShiftOrder=this.prodShiftOrder.toJSON(),t.prodDowntimes=this.prodDowntimes.toJSON(),p.setItem(this.getDataStorageKey(),JSON.stringify(t))}},changeShift:function(){var t=this.getCurrentShiftMoment().toDate(),e=this.get("date");return e&&t.getTime()<=e.getTime()?this.startShiftChangeMonitor():o.isConnected()?this.startNewShiftIfNecessary(t):void this.startNewShift(t)},startNewShiftIfNecessary:function(t){var e=this;this.findExistingShift(t,function(i){i?e.readLocalData(i):e.startNewShift(t)})},findExistingShift:function(t,i){var r=e.ajax({url:"/prodShifts?prodLine="+this.get("prodLine")+"&date="+t.getTime()});r.fail(function(){i(null)}),r.done(function(t){if(!t||!t.totalCount||!Array.isArray(t.collection))return i(null);var n=t.collection[0];n.nextOrder=null;var o=e.ajax({url:"/prodShiftOrders?prodShift="+n._id+"&finishedAt=null&sort(-startedAt)"}),s=e.ajax({url:"/prodDowntimes?prodLine="+n.prodLine+"&sort(-startedAt)&limit(8)"});r=e.when(o,s),r.fail(function(){i(null)}),r.done(function(t,e){var r=t[0].collection,o=e[0].collection;n.prodShiftOrder=r&&r[0]?r[0]:null,n.prodDowntimes=Array.isArray(o)?o:[],i(n)})})},startNewShift:function(t){T.clear();var e=this.id||null;this.finishDowntime(!1),this.finishOrder(),this.prodShiftOrder.onShiftChanged(),this.set({date:t,shift:this.getCurrentShift(),state:"idle",quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:r.getInfo(),createdAt:new Date,master:null,leader:null,operator:null,operators:null,nextOrder:null}),this.set("_id",g.generateId(this.get("createdAt"),this.prodLine.id)),g.record(this,"changeShift",{finishedProdShiftId:e,startedProdShift:this.toJSON()}),this.startShiftChangeMonitor()},changeMaster:function(t){this.changePersonnel("changeMaster","master",t)},changeLeader:function(t){this.changePersonnel("changeLeader","leader",t)},changeOperator:function(t){this.changePersonnel("changeOperator","operator",t)},changePersonnel:function(t,e,i){var r=this.get(e);r===i||r&&i&&r.id===i.id||(this.set(e,i),this.onPersonnelChanged(e),g.record(this,t,i))},onPersonnelChanged:function(t){var e=this.get(t);this.prodShiftOrder.id&&this.prodShiftOrder.set(t,e);var i=this.prodDowntimes.findFirstUnfinished();i&&i.set(t,e),"operator"===t&&"assembly"===this.getSubdivisionType()&&(this.set("operators",e?[e]:null),this.onPersonnelChanged("operators"))},changeCurrentQuantitiesDone:function(t){this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(),t)},changeQuantitiesDone:function(t,e,i){("number"!=typeof e||isNaN(e))&&(e=0);var r=this.get("quantitiesDone");if(!r[t])throw new Error("Invalid hour: "+t);r[t].actual!==e&&(r[t].actual=e,this.trigger("change:quantitiesDone",this,r,i||{}),i&&i.record===!1||g.record(this,"changeQuantitiesDone",{hour:t,newValue:e}))},changeOrder:function(t,e,i){var r=Date.now();this.finishOrder(new Date(r-1)),this.set({state:"working",nextOrder:this.getNextOrders().filter(function(e){return e.order.no!==t.no})});var n=this.prodShiftOrder.get("orderId");this.prodShiftOrder.onOrderChanged(this,t,e,i>0?i:0),g.record(this,"changeOrder",this.prodShiftOrder.toJSON(),new Date(r)),n!==this.prodShiftOrder.get("orderId")&&this.autoStartDowntime()},correctOrder:function(t,e){if(!this.hasOrder())throw new Error("Cannot correct the order: no order is started!");var i=this.prodShiftOrder.onOrderCorrected(this,t,e);i&&(g.record(this,"correctOrder",i),this.trigger("orderCorrected"))},setNextOrder:function(e){function i(t){return{orderNo:t.order.no,operationNo:t.operationNo,workerCount:t.workerCount||0}}var r=this.get("nextOrder"),n=t.isEmpty(e);if(!n||!t.isEmpty(r)){var o=r?r.map(i):[],s=e?e.map(i):[];t.isEqual(s,o)||(n&&(e=[],s=[]),this.set("nextOrder",e),g.record(this,"setNextOrder",{orders:s}))}},continueOrder:function(){if(this.hasOrder())throw new Error("Cannot continue the order: an order is already started!");if(!this.prodShiftOrder.hasOrderData())throw new Error("Cannot continue the order: no order data!");this.set("state","working"),this.prodShiftOrder.onOrderContinued(this),g.record(this,"changeOrder",this.prodShiftOrder.toJSON())},changeQuantityDone:function(t){if(!this.hasOrder())throw new Error("Cannot change the quantity done: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("quantityDone")&&(this.prodShiftOrder.set("quantityDone",t),g.record(this,"changeQuantityDone",{newValue:t}))},changeWorkerCount:function(t){if(!this.hasOrder())throw new Error("Cannot change the worker count: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("workerCount")&&(this.prodShiftOrder.set("workerCount",t),this.prodShiftOrder.set("sapTaktTime",this.prodShiftOrder.getSapTaktTime()),g.record(this,"changeWorkerCount",{newValue:t,sapTaktTime:this.prodShiftOrder.get("sapTaktTime")}))},endDowntime:function(){this.hasOrder()?this.set("state","working"):this.set("state","idle");var t=this.prodDowntimes.findFirstUnfinished();this.finishDowntime()?this.startNextAutoDowntime(t):this.saveLocalData()},endWork:function(){this.finishDowntime(),this.finishOrder(),this.set("state","idle"),this.prodShiftOrder.onWorkEnded(),g.record(this,"endWork",{})},startDowntime:function(t){if("working"===this.get("state")){var e=this.prodDowntimes.addFromInfo(this,t);this.set("state","downtime"),g.record(this,"startDowntime",e.toJSON())}},finishOrder:function(t){var e=this.prodShiftOrder.finish();return!!e&&(g.record(this,"finishOrder",e,t),!0)},finishDowntime:function(){var t=this.prodDowntimes.finish();return t&&g.record(this,"finishDowntime",t),!!t},editDowntime:function(t,e){t.set(e),e=t.changedAttributes(),e&&(e._id=t.id,g.record(this,"editDowntime",e))},isTaktTimeEnabled:function(){return!this.isLocked()&&this.settings.isTaktTimeEnabled(this.prodLine.id)},updateTaktTimeLocally:function(t){this.updateTaktTime(T.getLocalTaktTime(t.data,this.prodShiftOrder,this.getCurrentQuantityDoneHourIndex())),g.record(this,t)},updateTaktTime:function(t){T.add(t.serialNumber);var e=this.get("quantitiesDone");e[t.hourlyQuantityDone.index].actual=t.hourlyQuantityDone.value,this.trigger("change:quantitiesDone",this,e,{}),t.serialNumber.prodShiftOrder&&t.serialNumber.prodShiftOrder!==this.prodShiftOrder.id||this.prodShiftOrder.set({quantityDone:t.quantityDone,lastTaktTime:t.lastTaktTime,avgTaktTime:t.avgTaktTime}),this.saveLocalData()},checkSpigot:function(t,e){var i,r=this.prodShiftOrder.get("spigot"),n=!1;if(t)i=r?r.prodDowntime:this.prodDowntimes.findFirstUnfinished().id;else{if(!r)return!0;i=r.prodDowntime,t=r.component,n=!0}var o=this.checkSpigotValidity(e,t.nc12);return o&&this.prodShiftOrder.set("spigot",{prodDowntime:i,component:t,initial:!0,final:n}),g.record(this,"checkSpigot",{final:n,valid:o,nc12:e,component:t,prodDowntime:i}),o},checkSpigotValidity:function(t,e){if(t===e)return!0;var i={};return(this.settings.getValue("spigotGroups")||"").split("\n").forEach(function(t){var e=t.split(":"),r=e[0].trim(),n=e[1].split(", ");n.forEach(function(t){i[t.trim()]=r})}),t===i[e]},hasOrder:function(){return!!this.prodShiftOrder.id},getLabel:function(){var t=this.get("prodLine")||"?",e=this.get("date"),r=this.get("shift");return e&&r&&(t+=": "+n.format(this.get("date"),"L"),t+=", "+i("core","SHIFT:"+this.get("shift"))),t},getCurrentTime:function(){return n.getMoment().format("L, LTS")},getCurrentShift:function(){var t=n.getMoment().hour();return t>=6&&t<14?1:t>=14&&t<22?2:3},getCurrentShiftMoment:function(){return d(Date.now()).moment},getTimeToNextShift:function(){return this.getCurrentShiftMoment().add(8,"hours").diff(n.getMoment())},getCurrentQuantityDoneHourIndex:function(){var t=n.getMoment().hours();return t>=6&&t<14?t-6:t>=14&&t<22?t-14:22===t?0:23===t?1:t+2},getCurrentQuantityDoneHourRange:function(){var t=n.getMoment().minutes(0).seconds(0),e=t.format("LTS"),i=t.minutes(59).seconds(59).format("LTS");return e+"-"+i},getQuantityDoneInCurrentHour:function(){var t=this.get("quantitiesDone");if(!Array.isArray(t))return 0;var e=this.getCurrentQuantityDoneHourIndex();return e>=t.length?0:t[e].actual},getOrderIdType:function(){return"press"===this.getSubdivisionType()?"nc12":"no"},isIdle:function(){return"idle"===this.get("state")},isDowntime:function(){return"downtime"===this.get("state")},isWorking:function(){return"working"===this.get("state")},getMaxQuantitiesDone:function(){return 150},getSubdivisionType:function(){var t=u.get(this.get("subdivision"));return t?t.get("type"):null},getDowntimeReasons:function(){return h.findBySubdivisionType(this.getSubdivisionType())},getBreakReason:function(){return h.findFirstBreakIdBySubdivisionType(this.getSubdivisionType())},getDefaultAor:function(){var t=this.prodLine.getSubdivision();return t?t.get("aor"):null},isSpigotLine:function(){return(this.settings.getValue("spigotLines")||"").split(",").indexOf(this.prodLine.id)!==-1},getSpigotComponent:function(){return this.prodShiftOrder.getSpigotComponent(this.settings.getValue("spigotPatterns"),this.settings.getValue("spigotNotPatterns"))},getNextOrders:function(){var e=this.get("nextOrder")||[];return Array.isArray(e)||t.isEmpty(e)||(e=[{order:e.orderInfo,operationNo:e.operationNo}]),e},hasOrderQueue:function(){return!t.isEmpty(this.get("nextOrder"))},hasEnded:function(){var t=n.getMoment(this.get("date")).valueOf(),e=d(new Date).moment.valueOf();return t<e},updateQuantities:function(t,e){var i=this.attributes.quantitiesDone;if(Array.isArray(t)&&8===t.length&&Array.isArray(i)){for(var r=0;r<8;++r)i[r].planned=t[r],i[r].actual=e[r];this.saveLocalData(),this.trigger("change:quantitiesDone",this,this.attributes.quantitiesDone,{})}},updatePlannedQuantities:function(t){if(Array.isArray(t)&&8===t.length&&Array.isArray(this.attributes.quantitiesDone)){for(var e=0;e<8;++e)this.attributes.quantitiesDone[e].planned=t[e];this.saveLocalData(),this.trigger("change:quantitiesDone",this,this.attributes.quantitiesDone,{})}},isLocked:function(){return!g.isEnabled()||!this.prodLine||null===this.getSecretKey()},getSecretKey:function(){var t=p.getItem(this.getSecretKeyStorageKey());return"string"==typeof t?t:null},setSecretKey:function(t,e,i){null===t?(p.removeItem(this.getSecretKeyStorageKey()),p.removeItem(this.getDataStorageKey()),p.removeItem(L),this.prodShiftOrder.clear(),this.prodDowntimes.reset(),this.stopShiftChangeMonitor(),this.set({prodLine:null,date:null,shift:null,state:null,quantitiesDone:null,creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}),this.trigger("locked")):(p.setItem(this.getSecretKeyStorageKey(e.prodLine),t),e.prodLine&&p.setItem(L,e.prodLine),i||this.trigger("unlocked"),this.readLocalData(e),i&&window.location.reload())},getSecretKeyStorageKey:function(t){return"PRODUCTION:SECRET_KEY:"+(t||this.prodLine.id)},getDataStorageKey:function(t){return"PRODUCTION:DATA:"+(t||this.prodLine.id)},autoStartDowntime:function(){var e=this.getDefaultAor(),i=u.get(this.get("subdivision"));if(e&&i){var r=this.settings.getAutoDowntimes(this.prodLine.id);if(t.isEmpty(r)&&(r=i.get("autoDowntimes")),!t.isEmpty(r)){var n;if(this.isBetweenInitialDowntimeWindow(Date.now())&&(n=t.find(r,function(t){return"initial"===t.when})),n||(n=t.find(r,function(t){return"always"===t.when})),n){var o=h.get(n.reason);o&&this.startDowntime({aor:e,reason:o.id,reasonComment:"",auto:{}})}}}},startNextAutoDowntime:function(e){if(e&&e.get("auto")){var i=this.getDefaultAor(),r=u.get(this.get("subdivision"));if(i&&r){var n=this.settings.getAutoDowntimes(this.prodLine.id);if(t.isEmpty(n)&&(n=r.get("autoDowntimes")),!t.isEmpty(n)){for(var o,s=0;s<n.length;++s){var a=n[s];if(a.reason===e.get("reason")){for(var d=s+1;d<n.length;++d){var h=n[d];if("time"!==h.when){o=h;break}}if(o)break}}o&&this.startDowntime({aor:i,reason:o.reason,reasonComment:"",auto:{}})}}}},isBetweenInitialDowntimeWindow:function(t){var e=parseInt(this.settings.getValue("initialDowntimeWindow"),10);if(isNaN(e)||e<1)return!1;var i=this.get("date").getTime(),r=i+60*e*1e3;return t>=i&&t<=r},shouldStartTimedAutoDowntime:function(t){return"working"===this.get("state")&&!this.prodDowntimes.some(function(e){return e.get("reason")===t&&Date.now()-Date.parse(e.get("finishedAt"))<6e5})},startTimedAutoDowntime:function(t,e){if(this.shouldStartTimedAutoDowntime(t)){var i=this.getDefaultAor();i&&(s.closeAllDialogs(),this.startDowntime({aor:i,reason:t,reasonComment:"",auto:{d:e}}))}}},{STATE:{IDLE:"idle",WORKING:"working",DOWNTIME:"downtime"},LINE_STORAGE_KEY:L,parse:function(t){return"string"==typeof t.date&&(t.date=new Date(t.date)),"string"==typeof t.createdAt&&(t.createdAt=new Date(t.createdAt)),t}})});