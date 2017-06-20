// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","backbone","../i18n","../time","../core/Model","../data/orgUnits","../mrpControllers/MrpController","./util/generateDailyMrpPlan","./DailyMrpPlanOrderCollection","./DailyMrpPlanLineCollection"],function(t,e,i,s,r,n,a,d,u,o){"use strict";return r.extend({urlRoot:"/dailyMrpPlans",initialize:function(t,e){this.settings=e&&e.settings||this.collection.settings,this.updateQueue=null,this.date=new Date(t.date),this.mrp=n.getByTypeAndId("mrpController",t.mrp)||new a({_id:t.mrp,description:"?"}),this.id||this.set("_id",this.constructor.generateId(this.date,this.mrp.id)),this.orders=new u(t.orders,{plan:this}),this.lines=new o(t.lines,{plan:this})},toJSON:function(){return{_id:this.id,updatedAt:this.get("updatedAt"),date:this.date.toISOString(),mrp:this.mrp.id,orders:this.orders.toJSON(),lines:this.lines.toJSON()}},isEditable:function(){return Date.now()<this.date.getTime()+216e5},importing:function(){this.updateQueue=[]},imported:function(e){e.updatedAt>this.get("updatedAt")&&(this.set("updatedAt",e.updatedAt,{silent:!0}),this.orders.reset(e.orders));var i=this.updateQueue;this.updateQueue=null,t.forEach(i,this.update,this)},update:function(t){if(this.updateQueue)return void this.updateQueue.push(t);if(!(t.updatedAt<=this.get("updatedAt"))){var e=t.instanceId===window.INSTANCE_ID;switch(this.attributes.updatedAt=t.updatedAt,t.action){case"resetLines":e||this.lines.reset(t.data.lines,{skipGenerate:!0});break;case"updateLine":var i=this.lines.get(t.data._id);i&&i.set(t.data);break;case"resetOrders":e||this.orders.reset(t.data.orders,{skipGenerate:!0});break;case"updateOrder":var s=this.orders.get(t.data._id);s&&s.set(t.data)}}},saveLines:function(){var t=this;if(!t.isEditable())return null;var e=t.collection.update("resetLines",t.id,{lines:t.lines.toJSON()});return t.trigger("request",this,e,{syncMethod:"read"}),e.fail(function(){t.trigger("error")}),e.done(function(){t.trigger("sync")}),e},generate:function(){this.isEditable()&&d(this,this.settings.getPlanGeneratorSettings(this.lines.pluck("_id")))&&this.trigger("generated")}},{generateId:function(t,e){return s.getMoment(t).format("YYMMDD")+"-"+e}})});