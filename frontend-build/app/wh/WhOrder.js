define(["app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo","app/planning/util/shift","app/planning/templates/orderStatusIcons"],function(t,e,s,i,n,r,a){"use strict";var l={pending:"default",started:"info",finished:"success",problem:"danger",cancelled:"warning"},u={pending:"fa-question",picklist:"fa-file-text-o",pickup:"fa-shopping-cart",problem:"fa-thumbs-down",finished:"fa-thumbs-up"},o={null:"wh-problems-pending",true:"wh-problems-success",false:"wh-problems-failure",pending:"wh-problems-pending",picklist:"wh-problems-progress",pickup:"wh-problems-progress",problem:"wh-problems-failure",finished:"wh-problems-success"},c={fmx:0,kitter:1,packer:2};return i.extend({urlRoot:"/old/wh/orders",topicPrefix:"old.wh.orders",privilegePrefix:"WH",nlsDomain:"wh",serialize:function(t,s,i){var n=this.toJSON(),o=t&&t.orders.get(n.order)||null,c=t&&t.sapOrders.get(n.order)||null,p=Date.parse(n.startTime),m=Date.parse(n.finishTime);return n.no=s+1,n.shift=r.getShiftNo(p),n.qty=n.qty.toLocaleString(),o?(n.mrp=o.get("mrp"),n.nc12=o.get("nc12"),n.name=o.get("name"),n.qtyTodo=o.get("quantityTodo").toLocaleString(),n.planStatus=o.getStatus(),n.planStatusIcons=a(t,o.id)):(n.mrp="?",n.nc12="?",n.name="?",n.qtyTodo="0",n.planStatus="unplanned",n.planStatusIcons="?"),n.startDate=e.utc.format(p,"LL"),n.finishDate=e.utc.format(m,"LL"),n.startTimeMs=p,n.startTime=e.utc.format(p,"HH:mm:ss"),n.startTimeShort=e.utc.format(p,"H:mm"),n.finishTime=e.utc.format(m,"HH:mm:ss"),n.comment=c?c.getCommentWithIcon():"",n.comments=c?c.get("comments"):[],n.rowClassName=l[n.status],n.funcIcons={fmx:u[n.funcs[0].status],kitter:u[n.funcs[1].status],packer:u[n.funcs[2].status]},n.psStatus=t&&t.sapOrders.getPsStatus(n.order)||"unknown",n.hidden=!i||p<i.startTime.from||p>=i.startTime.to||i.whStatuses.length>0&&-1===i.whStatuses.indexOf(n.status)||i.psStatuses.length>0&&-1===i.psStatuses.indexOf(n.psStatus),n.hidden&&(n.rowClassName+=" hidden"),n},serializeSet:function(t,e,i){var n=this.serialize(t,e,this.collection?this.collection.getFilters(t):{startTime:{},whStatuses:[],psStatuses:[]}),r=s.isAllowedTo("WH:MANAGE"),a=this.getUserFunc(i),l=!!a;return n.clickable={picklistDone:r||l&&a._id===n.picklistFunc&&null===n.picklistDone},n.funcs.forEach(function(t){n.clickable[t._id]={picklist:r&&n.picklistDone||n.picklistDone&&l&&a._id===t._id&&"picklist"===t.status,pickup:r&&null!==n.picklistDone&&"require"===t.picklist||n.picklistDone&&l&&a._id===t._id&&"pickup"===t.status}}),n.clickable.printLabels=r||l,n},serializeProblemFunc:function(e){var i,r;return"lp10"===e?(r=this.getFunc(this.get("picklistFunc")),i={label:t("wh","prop:picklist"),className:o[this.get("picklistDone")],status:t("wh","status:picklistDone:"+this.get("picklistDone")),user:r&&r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:"",problemArea:"",problem:this.get("problem")}):(r=this.getFunc(e),i={label:t("wh","func:"+e),className:o[r.status],status:t("wh","status:"+r.status),user:r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:r.carts.join(", "),problemArea:r.problemArea,problem:r.comment}),i.solvable="problem"===this.get("status")&&"wh-problems-failure"===i.className&&s.isAllowedTo("WH:SOLVER","WH:MANAGE"),i},update:function(t){this.set(t)},getFunc:function(t){return this.attributes.funcs[c[t]]||null},getUserFunc:function(t){if(!t)return null;var e=this.attributes.funcs[c[t.func]];return e.user&&e.user.id===t._id?e:null}},{FUNC_TO_INDEX:c,finalizeOrder:function(t){var e=!1===t.picklistDone,s=!0;return t.funcs.forEach(function(t){"problem"===t.status&&(e=!0),"finished"!==t.status&&(s=!1)}),e?(t.status="problem",t.finishedAt=new Date):s?(t.status="finished",t.finishedAt=new Date):(t.status="started",t.finishedAt=null),t}})});