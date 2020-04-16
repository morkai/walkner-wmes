define(["app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo","app/planning/util/shift","app/planning/templates/orderStatusIcons"],function(t,s,e,i,n,r,a){"use strict";var o={pending:"default",started:"info",finished:"success",problem:"danger",cancelled:"warning"},u={pending:"fa-question",picklist:"fa-file-text-o",pickup:"fa-shopping-cart",problem:"fa-thumbs-down",finished:"fa-thumbs-up",ignored:"fa-times"},c={pending:"wh-problems-pending",progress:"wh-problems-progress",picklist:"wh-problems-progress",pickup:"wh-problems-progress",problem:"wh-problems-failure",failure:"wh-problems-failure",success:"wh-problems-success",finished:"wh-problems-success"},p={pending:"fa-question",started:"fa-truck",finished:"fa-thumbs-up",ignored:"fa-times"},l={pending:"fa-question",progress:"fa-spinner",success:"fa-thumbs-up",failure:"fa-thumbs-down"},f={fmx:0,kitter:1,packer:2};return i.extend({urlRoot:"/old/wh/orders",topicPrefix:"old.wh.orders",privilegePrefix:"WH",nlsDomain:"wh",serialize:function(t,e,i){var n=this.toJSON(),c=t&&t.orders.get(n.order)||null,f=t&&t.sapOrders.get(n.order)||null,m=Date.parse(n.startTime),d=Date.parse(n.finishTime);return n.no=e+1,n.shift=r.getShiftNo(m),n.qty=n.qty.toLocaleString(),c?(n.mrp=c.get("mrp"),n.nc12=c.get("nc12"),n.name=c.get("name"),n.qtyTodo=c.get("quantityTodo").toLocaleString(),n.planStatus=c.getStatus(),n.planStatusIcons=a(t,c.id)):(n.mrp="?",n.nc12="?",n.name="?",n.qtyTodo="0",n.planStatus="unplanned",n.planStatusIcons="?"),n.startDate=s.utc.format(m,"LL"),n.finishDate=s.utc.format(d,"LL"),n.startTimeMs=m,n.startTime=s.utc.format(m,"HH:mm:ss"),n.startTimeShort=s.utc.format(m,"H:mm"),n.finishTime=s.utc.format(d,"HH:mm:ss"),n.comment=f?f.getCommentWithIcon():"",n.comments=f?f.get("comments"):[],n.rowClassName=o[n.status],n.funcIcons={},n.funcs.forEach(function(t){n.funcIcons[t._id]="ignore"===t.picklist?u.ignored:u[t.status]}),n.distIcons={dist:p[n.distStatus],fifo:p[n.fifoStatus],pack:p[n.packStatus]},n.picklistDoneIcon=l[n.picklistDone],n.psStatus=t&&t.sapOrders.getPsStatus(n.order)||"unknown",n.hidden=!i||m<i.startTime.from||m>=i.startTime.to||i.whStatuses.length>0&&-1===i.whStatuses.indexOf(n.status)||i.psStatuses.length>0&&-1===i.psStatuses.indexOf(n.psStatus),n.hidden&&(n.rowClassName+=" hidden"),n},serializeSet:function(t,s,i){var n=this.serialize(t,s,this.collection?this.collection.getFilters(t):{startTime:{},whStatuses:[],psStatuses:[]}),r=e.isAllowedTo("WH:MANAGE"),a=this.getUserFunc(i),o=!!a,u="success"===n.picklistDone,c="pending"===this.get("fifoStatus")||"ignore"===n.funcs[0].pickup&&"ignore"===n.funcs[1].pickup,p="pending"===this.get("packStatus")||"ignore"===n.funcs[2].pickup,l=c&&p;return n.clickable={picklistDone:l&&(r||o&&a._id===n.picklistFunc&&!u)},n.funcs.forEach(function(t){n.clickable[t._id]={picklist:l&&(r&&u||u&&o&&a._id===t._id&&"picklist"===t.status),pickup:l&&(r&&"require"===t.picklist||u&&o&&a._id===t._id&&"pickup"===t.status)}}),n.clickable.printLabels=r||o,n},serializeProblemFunc:function(s){var i,r;return"lp10"===s?(r=this.getFunc(this.get("picklistFunc")),i={label:t("wh","prop:picklist"),className:c[this.get("picklistDone")],status:t("wh","status:picklistDone:"+this.get("picklistDone")),user:r&&r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:"",problemArea:"",problem:this.get("problem")}):(r=this.getFunc(s),i={label:t("wh","func:"+s),className:c[r.status],status:t("wh","status:"+r.status),user:r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:r.carts.join(", "),problemArea:r.problemArea,problem:r.comment}),i.solvable="problem"===this.get("status")&&"wh-problems-failure"===i.className&&e.isAllowedTo("WH:SOLVER","WH:MANAGE"),i},update:function(t){this.set(t)},getFunc:function(t){return this.attributes.funcs[f[t]]||null},getUserFunc:function(t){if(!t)return null;var s=this.attributes.funcs[f[t.func]];return s.user&&s.user.id===t._id?s:null}},{FUNC_TO_INDEX:f})});