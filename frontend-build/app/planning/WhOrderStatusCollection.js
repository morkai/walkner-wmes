// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Collection","./WhOrderStatus"],function(t,e,i,n,a){"use strict";function r(t){var e=t._id;return t.orderNo=e.orderNo,t.groupNo=e.groupNo,t.line=e.line,t._id=t.orderNo+":"+t.groupNo+":"+t.line,t}function u(){return i.utc.getMoment(Date.now()).startOf("day").subtract(i.getMoment().hours()<6?1:0,"days").format("YYYY-MM-DD")}return n.extend({model:a,paginate:!1,initialize:function(e,i){i=t.assign({date:u()},i),this.date=i.date,this.timelineCache=null,this.on("reset change add",function(){this.timelineCache=null})},setCurrentDate:function(){this.date=u()},url:function(){return"/planning/whOrderStatuses?_id.date="+i.utc.getMoment(this.date,"YYYY-MM-DD").valueOf()},parse:function(t){return(t.collection||[]).map(r)},setUpPubsub:function(t){var e=this;t.subscribe("planning.whOrderStatuses.updated",function(t){e.update(t)})},update:function(t){if(i.utc.format(t._id.date,"YYYY-MM-DD")===this.date){t=r(t);var e=this.get(t._id);e?e.set(t):this.add(t)}},serialize:function(t){var i=this.get(t);return i?i.serialize():{status:0,label:e("planning","wh:status:0",{qtySent:0})}},getTimelineData:function(t,e){return this.timelineCache||this.cacheTimelineData(),(this.timelineCache[t]||{})[e.get("orderId")]||{qtySent:0,pceTime:0}},cacheTimelineData:function(){var t=this.timelineCache={};this.forEach(function(e){if(3===e.get("status")){var i=e.get("line"),n=e.get("orderNo");t[i]||(t[i]={}),t[i][n]||(t[i][n]={qtySent:0,pceTime:e.get("pceTime")}),t[i][n].qtySent+=e.get("qtySent")}})}})});