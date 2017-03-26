// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../time","../socket","../core/Model","../core/Collection","../data/orgUnits","./util/shift","./DailyMrpPlan"],function(e,t,n,r,i,a,s,o,d){"use strict";return a.extend({model:d,comparator:"mrp",initialize:function(e,t){this.settings=t.settings,this.options=new i(JSON.parse(localStorage.getItem("PLANNING:OPTIONS")||"{}")),this.options.on("change",function(){localStorage.setItem("PLANNING:OPTIONS",JSON.stringify(this.toJSON()))})},subscribe:function(e){return e.subscribe("dailyMrpPlans.imported",this.handleImportedMessage.bind(this)),e.subscribe("dailyMrpPlans.updated",this.handleUpdatedMessage.bind(this)),e.subscribe("dailyMrpPlans.ordersUpdated",this.handleOrdersUpdatedMessage.bind(this)),this},getCurrentFilter:function(){var e={date:"",mrp:[]};return this.rqlQuery.selector.args.forEach(function(t){var n=t.args[0];("eq"===t.name&&"date"===n||"in"===t.name&&"mrp"===n)&&(e[n]=t.args[1])}),e},setCurrentFilter:function(t){t=e.assign(this.getCurrentFilter(),t),this.rqlQuery.selector.args=[{name:"eq",args:["date",t.date]},{name:"in",args:["mrp",t.mrp]}]},hasRequiredFilters:function(){var e=this.rqlQuery.selector.args.filter(function(e){return"eq"===e.name&&"date"===e.args[0]||"in"===e.name&&"mrp"===e.args[0]});return 2===e.length},"import":function(r){var i=this,a=t.ajax({method:"POST",url:"/dailyMrpPlans;import",data:JSON.stringify({instanceId:window.INSTANCE_ID,dailyMrpPlans:r})});return a.done(function(t){e.forEach(r,function(e){e.set("updatedAt",t[e.id],{silent:!0})}),i.trigger("import",{date:n.format(r[0].date,"YYYY-MM-DD"),mrp:r.map(function(e){return e.mrp.id})}),i.reset(r)}),a},update:function(e,n,r){return t.ajax({method:"POST",url:"/dailyMrpPlans;update",data:JSON.stringify({instanceId:window.INSTANCE_ID,action:e,planId:n,data:r})})},saveLines:function(){return t.when.apply(t,this.map(function(e){return e.saveLines()}))},setHourlyPlans:function(n){var r=this;if(!r.length)return t.when();var i={};r.forEach(function(t){(!n||n(t))&&t.lines.forEach(function(t){var n=s.getByTypeAndId("prodLine",t.id);if(n){var r=s.getAllForProdLine(n),a=r.division,d=r.prodFlow;if(a&&d){var u=i[a];u||(u=i[a]={});var l=u[d];l||(l=u[d]=o.EMPTY_HOURLY_PLAN.slice()),e.forEach(t.get("hourlyPlan"),function(e,t){l[t]+=e})}}})});var a=r.at(0).date.toISOString(),d=1,u=[];return e.forEach(i,function(e,t){u.push(r.setHourlyPlan(t,a,d,e))}),t.when.apply(t,u)},setHourlyPlan:function(e,n,i,a){var s=t.Deferred(),o={division:e,date:n,shift:i};return r.emit("hourlyPlans.findOrCreate",o,function(e,n){if(e)return s.reject(e);var i=t.ajax({url:"/hourlyPlans/"+n});i.fail(function(){s.reject(new Error("FIND_HOURLY_PLAN_FAILURE"))}),i.done(function(e){var i=[];e.flows.forEach(function(e,d){var u=a[e.id];if(u){var l=t.Deferred();o={type:"counts",socketId:r.getId(),_id:n,flowIndex:d,newValues:u},r.emit("hourlyPlans.updateCounts",o,function(e){e?l.reject(e):s.resolve()}),i.push(l.promise())}}),t.when.apply(t,i).then(function(){s.resolve()},function(e){s.reject(e)})})}),s.promise()},handleImportedMessage:function(n){if(n.instanceId!==window.INSTANCE_ID){var r=this,i=e.intersection(n.plans,r.map(function(e){return e.id}));e.forEach(i,function(e){r.get(e).importing()}),t.ajax({url:"/dailyMrpPlans?_id=in=("+i.join(",")+")"}).done(function(t){e.forEach(t.collection,function(e){var t=r.get(e._id);t&&t.imported(e)})})}},handleUpdatedMessage:function(e){var t=this.get(e.planId);t&&t.update(e)},handleOrdersUpdatedMessage:function(e){e.planIds.forEach(function(e){var t=this.get(e);t&&t.fetch().then(function(){t.orders.reset(t.get("orders"),{skipGenerate:!0})})},this)}})});