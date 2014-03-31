define(["underscore","../user","../time","../socket","../core/Model","../core/util/getShiftStartInfo","../data/downtimeReasons","../data/subdivisions","../data/workCenters","../data/prodLines","../data/prodLog","../prodDowntimes/ProdDowntime","../prodDowntimes/ProdDowntimeCollection","../prodShiftOrders/ProdShiftOrder"],function(t,e,r,i,n,o,s,a,h,d,u,l,f,c){return n.extend({urlRoot:"/prodShifts",clientUrlRoot:"#prodShifts",topicPrefix:"prodShifts",privilegePrefix:"PROD_DATA",nlsDomain:"prodShifts",defaults:{division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null,date:null,shift:null,state:null,quantitiesDone:null,creator:null,createdAt:null,master:null,leader:null,operator:null,operators:null},initialize:function(t,e){e&&e.production&&(this.shiftChangeTimer=null,this.prodLine=d.get(this.get("prodLine")),this.prodShiftOrder=new c,this.prodDowntimes=new f(null,{paginate:!1,rqlQuery:"sort(-startedAt)&limit(8)&prodLine="+encodeURIComponent(this.prodLine.id)}))},startShiftChangeMonitor:function(){this.stopShiftChangeMonitor(),this.shiftChangeTimer=setTimeout(function(t){t.shiftChangeTimer=null,t.changeShift(),t.startShiftChangeMonitor()},1e3,this)},stopShiftChangeMonitor:function(){null!==this.shiftChangeTimer&&(clearTimeout(this.shiftChangeTimer),this.shiftChangeTimer=null)},readLocalData:function(){if(!this.isLocked()){var e=null;try{e=JSON.parse(localStorage.getItem(this.getDataStorageKey())),e.date&&(e.date=new Date(e.date)),this.prodShiftOrder.clear(),e.prodShiftOrder&&this.prodShiftOrder.set(e.prodShiftOrder),this.prodDowntimes.reset(e.prodDowntimes||[]),delete e.prodShiftOrder,delete e.prodDowntimes}catch(r){}t.isEmpty(e)||this.set(e),this.changeShift()}},saveLocalData:function(){if(!this.isLocked()){var t=this.toJSON();delete t.division,delete t.subdivision,delete t.mrpControllers,delete t.prodFlow,delete t.workCenter,delete t.prodLine,t.prodShiftOrder=this.prodShiftOrder.toJSON(),t.prodDowntimes=this.prodDowntimes.toJSON(),localStorage.setItem(this.getDataStorageKey(),JSON.stringify(t))}},changeShift:function(){var t=this.getCurrentShiftMoment().toDate(),r=this.get("date");if(r&&t.getTime()===r.getTime())return this.startShiftChangeMonitor();var i=this.id||null;this.finishDowntime(),this.finishOrder(),this.prodShiftOrder.onShiftChanged(),this.set({date:t,shift:this.getCurrentShift(),state:"idle",quantitiesDone:[{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0},{planned:0,actual:0}],creator:e.getInfo(),createdAt:new Date,master:null,leader:null,operator:null,operators:null}),this.set("_id",u.generateId(this.get("createdAt"),this.prodLine.id)),u.record(this,"changeShift",{finishedProdShiftId:i,startedProdShift:this.toJSON()}),this.startShiftChangeMonitor()},changeMaster:function(t){this.set("master",t),this.onPersonnelChanged("master"),u.record(this,"changeMaster",t)},changeLeader:function(t){this.set("leader",t),this.onPersonnelChanged("leader"),u.record(this,"changeLeader",t)},changeOperator:function(t){this.set("operator",t),this.onPersonnelChanged("operator"),u.record(this,"changeOperator",t)},onPersonnelChanged:function(t){var e=this.get(t);this.prodShiftOrder.id&&this.prodShiftOrder.set(t,e);var r=this.prodDowntimes.findFirstUnfinished();r&&r.set(t,e),"operator"===t&&"assembly"===this.getSubdivisionType()&&(this.set("operators",e?[e]:null),this.onPersonnelChanged("operators"))},changeCurrentQuantitiesDone:function(t){this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(),t)},changeQuantitiesDone:function(t,e){("number"!=typeof e||isNaN(e))&&(e=0);var r=this.get("quantitiesDone");if(!r[t])throw new Error("Invalid hour: "+t);r[t].actual!==e&&(r[t].actual=e,this.trigger("change:quantitiesDone",this,{}),u.record(this,"changeQuantitiesDone",{hour:t,newValue:e}))},changeOrder:function(t,e){this.finishOrder(),this.set("state","working"),this.prodShiftOrder.onOrderChanged(this,t,e),u.record(this,"changeOrder",this.prodShiftOrder.toJSON())},correctOrder:function(t,e){if(!this.hasOrder())throw new Error("Cannot correct the order: no order is started!");var r=this.prodShiftOrder.onOrderCorrected(this,t,e);r&&u.record(this,"correctOrder",r)},continueOrder:function(){if(this.hasOrder())throw new Error("Cannot continue the order: an order is already started!");if(!this.prodShiftOrder.hasOrderData())throw new Error("Cannot continue the order: no order data!");this.set("state","working"),this.prodShiftOrder.onOrderContinued(this),u.record(this,"changeOrder",this.prodShiftOrder.toJSON())},changeQuantityDone:function(t){if(!this.hasOrder())throw new Error("Cannot change the quantity done: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("quantityDone")&&(this.prodShiftOrder.set("quantityDone",t),u.record(this,"changeQuantityDone",{newValue:t}))},changeWorkerCount:function(t){if(!this.hasOrder())throw new Error("Cannot change the worker count: no prod shift order!");("number"!=typeof t||isNaN(t))&&(t=0),t!==this.prodShiftOrder.get("workerCount")&&(this.prodShiftOrder.set("workerCount",t),u.record(this,"changeWorkerCount",{newValue:t}))},endDowntime:function(){this.hasOrder()?this.set("state","working"):this.set("state","idle"),this.finishDowntime()||this.saveLocalData()},endWork:function(){this.finishDowntime(),this.finishOrder(),this.set("state","idle"),this.prodShiftOrder.onWorkEnded(),u.record(this,"endWork",{})},startDowntime:function(t,e){var r=this.prodDowntimes.addFromInfo(this,t,e);this.set("state","downtime"),u.record(this,"startDowntime",r.toJSON())},finishOrder:function(){var t=this.prodShiftOrder.finish();t&&u.record(this,"finishOrder",t)},finishDowntime:function(){var t=this.prodDowntimes.finish();return t&&u.record(this,"finishDowntime",t),!!t},hasOrder:function(){return!!this.prodShiftOrder.id},getLabel:function(){if(!this.prodLine)return this.get("prodLine");var e=this.prodLine.get("description");return t.isString(e)&&e.length?e:this.prodLine.id},getCurrentTime:function(){return r.getMoment().format("YYYY-MM-DD HH:mm:ss")},getCurrentShift:function(){var t=r.getMoment().hour();return t>=6&&14>t?1:t>=14&&22>t?2:3},getCurrentShiftMoment:function(){return o(Date.now()).moment},getTimeToNextShift:function(){return this.getCurrentShiftMoment().add("hours",8).diff(r.getMoment())},getCurrentQuantityDoneHourIndex:function(){var t=r.getMoment().hours();return t>=6&&14>t?t-6:t>=14&&22>t?t-14:22===t?0:23===t?1:t+2},getCurrentQuantityDoneHourRange:function(){var t=r.getMoment().minutes(0).seconds(0),e=t.format("HH:mm:ss"),i=t.minutes(59).seconds(59).format("HH:mm:ss");return e+"-"+i},getQuantityDoneInCurrentHour:function(){var t=this.get("quantitiesDone");if(!Array.isArray(t))return 0;var e=this.getCurrentQuantityDoneHourIndex();return e>=t.length?0:t[e].actual},getOrderIdType:function(){return"press"===this.getSubdivisionType()?"nc12":"no"},isIdle:function(){return"idle"===this.get("state")},isDowntime:function(){return"downtime"===this.get("state")},isWorking:function(){return"working"===this.get("state")},getMaxQuantitiesDone:function(){return 150},getSubdivisionType:function(){var t=a.get(this.get("subdivision"));return t?t.get("type"):null},getDowntimeReasons:function(){return s.findBySubdivisionType(this.getSubdivisionType())},getBreakReason:function(){return s.findFirstBreakIdBySubdivisionType(this.getSubdivisionType())},getDefaultAor:function(){var t=this.prodLine.getSubdivision();return t?t.get("aor"):null},hasEnded:function(){var t=r.getMoment(this.get("date")).valueOf(),e=o(new Date).moment.valueOf();return e>t},updatePlannedQuantities:function(t){if(Array.isArray(t)&&8===t.length&&Array.isArray(this.attributes.quantitiesDone)){for(var e=0;8>e;++e)this.attributes.quantitiesDone[e].planned=t[e];this.saveLocalData(),this.trigger("change:quantitiesDone",this,{})}},isLocked:function(){return!u.isEnabled()||null===this.getSecretKey()},getSecretKey:function(){var t=localStorage.getItem(this.getSecretKeyStorageKey());return"string"==typeof t?t:null},setSecretKey:function(t){null===t?(localStorage.removeItem(this.getSecretKeyStorageKey()),localStorage.removeItem(this.getDataStorageKey()),this.prodShiftOrder.clear(),this.prodDowntimes.reset(),this.stopShiftChangeMonitor(),this.clear(),this.trigger("locked")):(localStorage.setItem(this.getSecretKeyStorageKey(),t),this.trigger("unlocked"),this.readLocalData())},getSecretKeyStorageKey:function(){return"PRODUCTION:SECRET_KEY:"+this.prodLine.id},getDataStorageKey:function(){return"PRODUCTION:DATA:"+this.prodLine.id}},{STATE:{IDLE:"idle",WORKING:"working",DOWNTIME:"downtime"}})});