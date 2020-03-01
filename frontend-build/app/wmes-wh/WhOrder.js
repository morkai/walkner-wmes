define(["app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo","app/planning/util/shift","app/planning/templates/orderStatusIcons"],function(t,e,s,a,n,r,o){"use strict";var i={pending:"default",started:"info",finished:"success",problem:"danger",cancelled:"warning"};return a.extend({urlRoot:"/wh/orders",topicPrefix:"wh.orders",privilegePrefix:"WH",nlsDomain:"wmes-wh",serialize:function(t,s,a){var n=this.toJSON(),m=t&&t.orders.get(n.orderNo)||null,p=t&&t.sapOrders.get(n.orderNo)||null,u=Date.parse(n.startTime),d=Date.parse(n.finishTime);return n.shift=r.getShiftNo(u),n.qtyPlan=n.qtyPlan.toLocaleString(),m?(n.mrp=m.get("mrp"),n.nc12=m.get("nc12"),n.name=m.get("name"),n.qtyTodo=m.get("quantityTodo").toLocaleString(),n.planStatus=m.getStatus(),n.planStatusIcons=o(t,m.id)):(n.mrp="?",n.nc12="?",n.name="?",n.qtyTodo="0",n.planStatus="unplanned",n.planStatusIcons="?"),n.startDate=e.utc.format(u,"LL"),n.finishDate=e.utc.format(d,"LL"),n.startTimeMs=u,n.startTime=e.utc.format(u,"HH:mm:ss"),n.startTimeShort=e.utc.format(u,"H:mm"),n.finishTime=e.utc.format(d,"HH:mm:ss"),n.comment=p?p.getCommentWithIcon():"",n.comments=p?p.get("comments"):[],n.rowClassName=i[n.status],n.psStatus=t&&t.sapOrders.getPsStatus(n.order)||"unknown",n.hidden=!a||u<a.startTime.from||u>=a.startTime.to||a.whStatuses.length>0&&-1===a.whStatuses.indexOf(n.whStatus)||a.psStatuses.length>0&&-1===a.psStatuses.indexOf(n.psStatus),n.hidden&&(n.rowClassName+=" hidden"),n},update:function(t){this.set(t)}},{})});