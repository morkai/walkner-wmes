define(["underscore","jquery","../time","../core/Collection","./WhOrder"],function(t,e,r,i,n){"use strict";function s(){return r.utc.getMoment(Date.now()).startOf("day").subtract(r.getMoment().hours()<6?1:0,"days").format("YYYY-MM-DD")}return i.extend({model:n,paginate:!1,initialize:function(e,r){r=t.assign({date:s()},r),this.date=r.date,this.byOrderNo={},r.groupByOrderNo&&(this.on("reset",this.groupByOrderNo),this.length&&this.groupByOrderNo())},setCurrentDate:function(){this.setDateFilter(s())},getDateFilter:function(){return this.date},setDateFilter:function(t){this.date=t},url:function(){return this.date?"/old/wh/orders?sort(group,line,startTime)&date="+r.utc.getMoment(this.date,"YYYY-MM-DD").valueOf():"/old/wh/orders"},getFilters:function(t){return{whStatuses:t.displayOptions.get("whStatuses")||[],psStatuses:t.displayOptions.get("psStatuses")||[],startTime:t.displayOptions.getStartTimeRange(t.id)}},serialize:function(t){var e=null,r=this.getFilters(t);return this.map(function(i,n){var s=i.serialize(t,n,r);return e&&(s.newGroup=s.group!==e.group,s.newLine=s.line!==e.line),e=s,s})},update:function(t){for(var e=0;e<t.length;++e){var r=t[e],i=this.get(r._id);i&&i.update(r)}},act:function(t,e){return this.constructor.act(e.date||this.date,t,e)},groupByOrderNo:function(){var t={};this.forEach(function(e){var r=e.get("order");t[r]||(t[r]=[]),t[r].push(e)}),this.byOrderNo=t},serializeSet:function(t,e,r){var i=this.getOrdersBySet(t),n=this.isSetDelivered(i.map(function(t){return t.order}));return i.map(function(t){return t.order.serializeSet({i:t.i,delivered:n},e,r)})},getOrdersBySet:function(t){var e=[];return this.forEach(function(r,i){r.get("set")===t&&e.push({i:i,order:r})}),e},isSetDelivered:function(t){return"number"==typeof t?t=this.getOrdersBySet(t).map(function(t){return t.order}):t||(t=[]),t.some(function(t){return t.isDelivered()})}},{act:function(t,i,n){return/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)||(t=r.utc.format(t,"YYYY-MM-DD")),n.date=t,e.ajax({method:"POST",url:"/old/wh;act",data:JSON.stringify({action:i,data:n})})}})});