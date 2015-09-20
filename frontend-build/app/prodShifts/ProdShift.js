// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","../i18n","../user","../time","../socket","../core/Model","../core/util/getShiftStartInfo","../data/downtimeReasons","../data/subdivisions","../data/workCenters","../data/prodFlows","../data/prodLines","../data/prodLog","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection","../prodShiftOrders/ProdShiftOrder","../prodShiftOrders/ProdShiftOrderCollection","app/core/templates/userInfo"],function(t,e,r,i,n,o,s,a,d,h,u,l,f,c,g,p,m,S,D){"use strict";return s.extend({urlRoot:"/prodShifts",clientUrlRoot:"#prodShifts",topicPrefix:"prodShifts",privilegePrefix:"PROD_DATA",nlsDomain:"prodShifts",defaults:function(){return{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,date:null,shift:null,state:null,quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}},initialize:function(t,e){e&&e.production&&(this.shiftChangeTimer=null,this.prodLine=f.get(this.get("prodLine")),this.prodShiftOrder=new m,this.prodDowntimes=new p(null,{paginate:!1,rqlQuery:"sort(-startedAt)&limit(8)&prodLine="+encodeURIComponent(this.prodLine.id)}))},serialize:function(t){var e=this.toJSON();if(e.createdAt=n.format(e.createdAt,"YYYY-MM-DD HH:mm:ss"),e.creator=D({userInfo:e.creator}),e.date=n.format(e.date,"YYYY-MM-DD"),e.shift=e.shift?r("core","SHIFT:"+e.shift):"?",t.orgUnits){var i=h.get(e.subdivision),o=l.get(e.prodFlow);e.subdivision=i?i.getLabel():"?",e.prodFlow=o?o.getLabel():"?",e.mrpControllers=Array.isArray(e.mrpControllers)&&e.mrpControllers.length?e.mrpControllers.join("; "):"?"}return t.personnel&&(e.master=D({userInfo:e.master}),e.leader=D({userInfo:e.leader}),e.operator=D({userInfo:e.operator})),e},startShiftChangeMonitor:function(){this.stopShiftChangeMonitor(),this.shiftChangeTimer=setTimeout(function(t){t.shiftChangeTimer=null,t.changeShift()},1e3,this)},stopShiftChangeMonitor:function(){null!==this.shiftChangeTimer&&(clearTimeout(this.shiftChangeTimer),this.shiftChangeTimer=null)},readLocalData:function(e){if(!this.isLocked()){var r=null;try{r=this.constructor.parse(e?e:JSON.parse(localStorage.getItem(this.getDataStorageKey()))),this.prodShiftOrder.clear(),r.prodShiftOrder&&this.prodShiftOrder.set(m.parse(r.prodShiftOrder)),this.prodDowntimes.reset((r.prodDowntimes||[]).map(g.parse)),delete r.prodShiftOrder,delete r.prodDowntimes}catch(i){}t.isEmpty(r)||(r.state=this.prodDowntimes.findFirstUnfinished()?"downtime":this.prodShiftOrder.id?"working":"idle",this.set(r)),this.changeShift()}},saveLocalData:function(){if(!this.isLocked()){var t=this.toJSON();delete t.division,delete t.subdivision,delete t.mrpControllers,delete t.prodFlow,delete t.workCenter,delete t.prodLine,t.prodShiftOrder=this.prodShiftOrder.toJSON(),t.prodDowntimes=this.prodDowntimes.toJSON(),localStorage.setItem(this.getDataStorageKey(),JSON.stringify(t))}},changeShift:function(){var t=this.getCurrentShiftMoment().toDate(),e=this.get("date");return e&&t.getTime()<=e.getTime()?this.startShiftChangeMonitor():o.isConnected()?this.startNewShiftIfNecessary(t):void this.startNewShift(t)},startNewShiftIfNecessary:function(t){var e=this;this.findExistingShift(t,function(r){r?e.readLocalData(r):e.startNewShift(t)})},findExistingShift:function(t,r){var i=this,n=e.ajax({url:"/prodShifts?prodLine="+this.get("prodLine")+"&date="+t.getTime()});n.fail(function(){i.startNewShift(t)}),n.done(function(o){if(!o||!o.totalCount||!Array.isArray(o.collection))return i.startNewShift(t);var s=o.collection[0],a=e.ajax({url:"/prodShiftOrders?prodShift="+s._id+"&finishedAt=null&sort(-startedAt)"}),d=e.ajax({url:"/prodDowntimes?prodLine="+s.prodLine+"&sort(-startedAt)&limit(8)"});n=e.when(a,d),n.fail(function(){i.startNewShift(t)}),n.done(function(t,e){var i=t[0].collection,n=e[0].collection;s.prodShiftOrder=i&&i[0]?i[0]:null,s.prodDowntimes=Array.isArray(n)?n:[],r(s)})})},startNewShift:function(t){var e=this.id||null;this.finishDowntime(),this.finishOrder(),this.prodShiftOrder.onShiftChanged(),this.set({date:t,shift:this.getCurrentShift(),state:"idle",quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:i.getInfo(),createdAt:new Date,master:null,leader:null,operator:null,operators:null}),this.set("_id",c.generateId(this.get("createdAt"),this.prodLine.id)),c.record(this,"changeShift",{finishedProdShiftId:e,startedProdShift:this.toJSON()}),this.startShiftChangeMonitor()},changeMaster:function(t){this.set("master",t),this.onPersonnelChanged("master"),c.record(this,"changeMaster",t)},changeLeader:function(t){this.set("leader",t),this.onPersonnelChanged("leader"),c.record(this,"changeLeader",t)},changeOperator:function(t){this.set("operator",t),this.onPersonnelChanged("operator"),c.record(this,"changeOperator",t)},onPersonnelChanged:function(t){var e=this.get(t);this.prodShiftOrder.id&&this.prodShiftOrder.set(t,e);var r=this.prodDowntimes.findFirstUnfinished();r&&r.set(t,e),"operator"===t&&"assembly"===this.getSubdivisionType()&&(this.set("operators",e?[e]:null),this.onPersonnelChanged("operators"))},changeCurrentQuantitiesDone:function(t){this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(),t)},changeQuantitiesDone:function(t,e,r){("number"!=typeof e||isNaN(e))&&(e=0);var i=this.get("quantitiesDone");if(!i[t])throw new Error("Invalid hour: "+t);i[t].actual!==e&&(i[t].actual=e,this.trigger("change:quantitiesDone",this,i,r||{}),c.record(this,"changeQuantitiesDone",{hour:t,newValue:e}))},changeOrder:function(t,e){this.finishOrder(),this.set("state","working");var r=this.prodShiftOrder.get("orderId");this.prodShiftOrder.onOrderChanged(this,t,e),c.record(this,"changeOrder",this.prodShiftOrder.toJSON()),r!==this.prodShiftOrder.get("orderId")&&this.autoStartDowntime()},correctOrder:function(t,e){if(!this.hasOrder())throw new Error("Cannot correct the order: no order is started!");var r=this.prodShiftOrder.onOrderCorrected(this,t,e);r&&c.record(this,"correctOrder",r)},continueOrder:function(){if(this.hasOrder())throw new Error("Cannot continue the order: an order is already started!");if(!this.prodShiftOrder.hasOrderData())throw new Error("Cannot continue the order: no order data!");this.set("state","working"),this.prodShiftOrder.onOrderContinued(this),c.record(this,"changeOrder",this.prodShiftOrder.toJSON())},changeQuantityDone:function(t){if(!this.hasOrder())throw new Error("Cannot change the quantity done: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("quantityDone")&&(this.prodShiftOrder.set("quantityDone",t),c.record(this,"changeQuantityDone",{newValue:t}))},changeWorkerCount:function(t){if(!this.hasOrder())throw new Error("Cannot change the worker count: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("workerCount")&&(this.prodShiftOrder.set("workerCount",t),c.record(this,"changeWorkerCount",{newValue:t}))},endDowntime:function(){this.hasOrder()?this.set("state","working"):this.set("state","idle"),this.finishDowntime()||this.saveLocalData()},endWork:function(){this.finishDowntime(),this.finishOrder(),this.set("state","idle"),this.prodShiftOrder.onWorkEnded(),c.record(this,"endWork",{})},startDowntime:function(t){var e=this.prodDowntimes.addFromInfo(this,t);this.set("state","downtime"),c.record(this,"startDowntime",e.toJSON())},finishOrder:function(){var t=this.prodShiftOrder.finish();t&&c.record(this,"finishOrder",t)},finishDowntime:function(){var t=this.prodDowntimes.finish();return t&&c.record(this,"finishDowntime",t),!!t},editDowntime:function(t,e){t.set(e),e=t.changedAttributes(),e&&(e._id=t.id,c.record(this,"editDowntime",e))},hasOrder:function(){return!!this.prodShiftOrder.id},getLabel:function(){var t=this.get("prodLine"),e=this.get("date"),i=this.get("shift");return e&&i&&(t+=": "+n.format(this.get("date"),"YYYY-MM-DD"),t+=", "+r("core","SHIFT:"+this.get("shift"))),t},getCurrentTime:function(){return n.getMoment().format("YYYY-MM-DD HH:mm:ss")},getCurrentShift:function(){var t=n.getMoment().hour();return t>=6&&14>t?1:t>=14&&22>t?2:3},getCurrentShiftMoment:function(){return a(Date.now()).moment},getTimeToNextShift:function(){return this.getCurrentShiftMoment().add(8,"hours").diff(n.getMoment())},getCurrentQuantityDoneHourIndex:function(){var t=n.getMoment().hours();return t>=6&&14>t?t-6:t>=14&&22>t?t-14:22===t?0:23===t?1:t+2},getCurrentQuantityDoneHourRange:function(){var t=n.getMoment().minutes(0).seconds(0),e=t.format("HH:mm:ss"),r=t.minutes(59).seconds(59).format("HH:mm:ss");return e+"-"+r},getQuantityDoneInCurrentHour:function(){var t=this.get("quantitiesDone");if(!Array.isArray(t))return 0;var e=this.getCurrentQuantityDoneHourIndex();return e>=t.length?0:t[e].actual},getOrderIdType:function(){return"press"===this.getSubdivisionType()?"nc12":"no"},isIdle:function(){return"idle"===this.get("state")},isDowntime:function(){return"downtime"===this.get("state")},isWorking:function(){return"working"===this.get("state")},getMaxQuantitiesDone:function(){return 150},getSubdivisionType:function(){var t=h.get(this.get("subdivision"));return t?t.get("type"):null},getDowntimeReasons:function(){return d.findBySubdivisionType(this.getSubdivisionType())},getBreakReason:function(){return d.findFirstBreakIdBySubdivisionType(this.getSubdivisionType())},getDefaultAor:function(){var t=this.prodLine.getSubdivision();return t?t.get("aor"):null},hasEnded:function(){var t=n.getMoment(this.get("date")).valueOf(),e=a(new Date).moment.valueOf();return e>t},updatePlannedQuantities:function(t){if(Array.isArray(t)&&8===t.length&&Array.isArray(this.attributes.quantitiesDone)){for(var e=0;8>e;++e)this.attributes.quantitiesDone[e].planned=t[e];this.saveLocalData(),this.trigger("change:quantitiesDone",this,this.attributes.quantitiesDone,{})}},isLocked:function(){return!c.isEnabled()||null===this.getSecretKey()},getSecretKey:function(){var t=localStorage.getItem(this.getSecretKeyStorageKey());return"string"==typeof t?t:null},setSecretKey:function(t,e){null===t?(localStorage.removeItem(this.getSecretKeyStorageKey()),localStorage.removeItem(this.getDataStorageKey()),this.prodShiftOrder.clear(),this.prodDowntimes.reset(),this.stopShiftChangeMonitor(),this.set({date:null,shift:null,state:null,quantitiesDone:null,creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null}),this.trigger("locked")):(localStorage.setItem(this.getSecretKeyStorageKey(),t),this.trigger("unlocked"),this.readLocalData(e))},getSecretKeyStorageKey:function(){return"PRODUCTION:SECRET_KEY:"+this.prodLine.id},getDataStorageKey:function(){return"PRODUCTION:DATA:"+this.prodLine.id},autoStartDowntime:function(){var t=this.getDefaultAor();if(t){var e=h.get(this.get("subdivision"));if(e){var r=d.get(e.get("autoDowntime"));r&&this.startDowntime({aor:t,reason:r.id,reasonComment:""})}}}},{STATE:{IDLE:"idle",WORKING:"working",DOWNTIME:"downtime"},parse:function(t){return"string"==typeof t.date&&(t.date=new Date(t.date)),t}})});