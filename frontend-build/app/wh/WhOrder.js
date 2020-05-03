define(["app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo","app/planning/util/shift","app/planning/templates/orderStatusIcons"],function(t,s,e,i,n,r,a){"use strict";var o={pending:"default",started:"info",finished:"success",problem:"danger",cancelled:"warning"},u={pending:"fa-question",picklist:"fa-file-text-o",pickup:"fa-shopping-cart",problem:"fa-thumbs-down",finished:"fa-thumbs-up",ignored:"fa-times"},c={pending:"wh-problems-pending",progress:"wh-problems-progress",picklist:"wh-problems-progress",pickup:"wh-problems-progress",problem:"wh-problems-failure",failure:"wh-problems-failure",success:"wh-problems-success",finished:"wh-problems-success"},l={pending:"fa-question",started:"fa-truck",finished:"fa-thumbs-up",ignored:"fa-times"},p={pending:"fa-question",progress:"fa-spinner",success:"fa-thumbs-up",failure:"fa-thumbs-down"},m={fmx:0,kitter:1,platformer:2,packer:3};return i.extend({urlRoot:"/old/wh/orders",topicPrefix:"old.wh.orders",privilegePrefix:"WH",nlsDomain:"wh",serialize:function(t,e,i){var n=this.toJSON(),c=t&&t.orders.get(n.order)||null,m=t&&t.sapOrders.get(n.order)||null,f=Date.parse(n.startTime),d=Date.parse(n.finishTime);return n.no=e+1,n.shift=r.getShiftNo(f),n.qty=n.qty.toLocaleString(),c?(n.mrp=c.get("mrp"),n.nc12=c.get("nc12"),n.name=c.get("name"),n.qtyTodo=c.get("quantityTodo").toLocaleString(),n.planStatus=c.getStatus(),n.planStatusIcons=a(t,c.id)):(n.mrp="?",n.nc12="?",n.name="?",n.qtyTodo="0",n.planStatus="unplanned",n.planStatusIcons="?"),n.startDate=s.utc.format(f,"LL"),n.finishDate=s.utc.format(d,"LL"),n.startTimeMs=f,n.startTime=s.utc.format(f,"HH:mm:ss"),n.startTimeShort=s.utc.format(f,"H:mm"),n.finishTime=s.utc.format(d,"HH:mm:ss"),n.comment=m?m.getCommentWithIcon():"",n.comments=m?m.get("comments"):[],n.rowClassName=o[n.status],n.funcIcons={},n.funcs.forEach(function(t){n.funcIcons[t._id]="ignore"===t.picklist?u.ignored:u[t.status]}),n.distIcons={dist:l[n.distStatus],fifo:l[n.fifoStatus],pack:l[n.packStatus]},n.picklistDoneIcon=p[n.picklistDone],n.psStatus=t&&t.sapOrders.getPsStatus(n.order)||"unknown",n.hidden=!i||f<i.startTime.from||f>=i.startTime.to||i.whStatuses.length>0&&-1===i.whStatuses.indexOf(n.status)||i.psStatuses.length>0&&-1===i.psStatuses.indexOf(n.psStatus),n.hidden&&(n.rowClassName+=" hidden"),n},serializeSet:function(t,s,i){var n=this.serialize(s,t.i,this.collection?this.collection.getFilters(s):{startTime:{},whStatuses:[],psStatuses:[]}),r=e.isAllowedTo("WH:MANAGE"),a=e.isAllowedTo("WH:MANAGE:CARTS"),o=this.getUserFunc(i),u=!!o,c="success"===n.picklistDone,l="pending"===t.distStatus;return n.clickable={picklistDone:l&&(r||u&&o._id===n.picklistFunc&&!c)},n.funcs.forEach(function(t){n.clickable[t._id]={picklist:l&&(r&&c||c&&u&&o._id===t._id&&"picklist"===t.status),pickup:l&&(r&&"require"===t.picklist||a&&"success"===t.pickup||c&&u&&o._id===t._id&&"pickup"===t.status)}}),n.clickable.printLabels=r||u,n},serializeProblemFunc:function(s){var i,r;return"lp10"===s?(r=this.getFunc(this.get("picklistFunc")),i={label:t("wh","prop:picklist"),className:c[this.get("picklistDone")],status:t("wh","status:picklistDone:"+this.get("picklistDone")),user:r&&r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:"",problemArea:"",problem:this.get("problem")}):(r=this.getFunc(s),i={label:t("wh","func:"+s),className:c[r.status],status:t("wh","status:"+r.status),user:r.user?n({userInfo:r.user,noIp:!0,clickable:!1}):"",carts:r.carts.join(", "),problemArea:r.problemArea,problem:r.comment}),i.solvable="problem"===this.get("status")&&"wh-problems-failure"===i.className&&e.isAllowedTo("WH:SOLVER","WH:MANAGE"),i},update:function(t){this.set(t)},getFunc:function(t){return this.attributes.funcs[m[t]]||null},getUserFunc:function(t){if(!t)return null;var s=this.attributes.funcs[m[t.func]];return s.user&&s.user.id===t._id?s:null}},{FUNC_TO_INDEX:m})});