define(["underscore","../time","../core/Collection","./PlanShiftOrder"],function(t,e,i,r){"use strict";var n=["_id","prodLine","shift","orderId","operationNo","quantityDone","startedAt","finishedAt"];return i.extend({model:r,initialize:function(t,e){var i=this;i.plan=e.plan,i.shiftStartTime=0,i.shiftEndTime=0,i.cache={byLine:{},byOrder:{}},i.plan.on("change:_id",i.updateShiftTime.bind(i)),i.on("reset",function(){i.cache={byLine:{},byOrder:{}},i.forEach(i.cacheOrder,i)}),i.on("add",i.cacheOrder,i),i.forEach(i.cacheOrder,i),i.updateShiftTime()},url:function(){return"/prodShiftOrders?select("+n.join(",")+")&limit(0)&mechOrder=false&startedAt=ge="+this.shiftStartTime+"&startedAt=lt="+this.shiftEndTime},findOrders:function(t,e,i){var r=this.cache.byOrder[t]||[];return e&&(r=r.filter(function(t){return t.get("prodLine")===e})),i&&(r=r.filter(function(t){return t.get("shift")===i})),r},getTotalQuantityDone:function(t,e,i,r){var n=this.cache.byLine,a=n[t]&&n[t][e]&&n[t][e][i],d=0;return a?(a.forEach(function(t){var e=t.get("operationNo");r&&e&&r!==e||(d+=t.get("quantityDone")||0)}),d):d},updateShiftTime:function(){var t=e.getMoment(this.plan.id,"YYYY-MM-DD").hours(6);this.shiftStartTime=t.valueOf(),this.shiftEndTime=t.add(24,"hours").valueOf()},update:function(e){if(e=e.prodShiftOrders){var i=this;if(Array.isArray(e))e.forEach(function(t){i.addOrder(t)});else{var r=i.get(e._id);r?r.set(t.pick(e,n)):e._id&&i.addOrder(e)}}},addOrder:function(e){var i=Date.parse(e.startedAt);i<this.shiftStartTime||i>=this.shiftEndTime||this.add(t.pick(e,n))},cacheOrder:function(t){var e=this.cache.byLine,i=this.cache.byOrder,r=t.get("prodLine"),n=t.get("shift"),a=t.get("orderId");e[r]||(e[r]={}),e[r][n]||(e[r][n]={}),e[r][n][a]||(e[r][n][a]=[]),e[r][n][a].push(t),i[a]||(i[a]=[]),i[a].push(t)}})});