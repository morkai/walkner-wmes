// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/data/clipboard","app/planning/util/shift","app/planning/util/contextMenu","app/planning/PlanSapOrder","app/core/templates/userInfo","app/wh/templates/whList","app/planning/templates/lineOrderComments","app/planning/templates/orderStatusIcons"],function(e,t,n,i,r,s,a,o,p,d,l,u,h,m,c){"use strict";return a.extend({template:h,events:{"contextmenu tbody > tr[data-id]":function(e){return this.showMenu(e),!1},"mousedown .planning-mrp-lineOrders-comment":function(e){if(0===e.button){var t=this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.id);if(t){var n=t.get("comments");n.length&&this.$(e.currentTarget).popover({trigger:"manual",placement:"left",html:!0,content:m({comments:n.map(function(e){return{user:u({noIp:!0,userInfo:e.user}),time:i.toTagData(e.time).human,text:l.formatCommentWithIcon(e)}})}),template:'<div class="popover planning-mrp-comment-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(e){this.$(e.currentTarget).popover("destroy")}},initialize:function(){var e=this,t=e.plan,n=t.sapOrders;e.listenTo(t,"change:loading change:updatedAt",e.scheduleRender),e.listenTo(n,"reset",e.onOrdersReset),e.listenTo(n,"change:comments",e.onCommentChange),e.listenTo(n,"change:psStatus",e.onPsStatusChanged),e.listenTo(e.whOrders,"reset",e.onOrdersReset)},serialize:function(){return{idPrefix:this.idPrefix,orders:this.serializeOrders()}},beforeRender:function(){clearTimeout(this.timers.render)},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},serializeOrders:function(){var e=this,t=e.plan,n=null;return e.whOrders.map(function(r,s){var a=r.get("order"),o=t.orders.get(a),d=t.sapOrders.get(a),l=Date.parse(r.get("startTime")),u=Date.parse(r.get("finishTime")),h=u-l,m=r.get("qty"),c={key:r.id,no:s+1,set:"",shift:p.getShiftNo(l),orderNo:a,mrp:o.get("mrp"),nc12:o.get("nc12"),name:o.get("name"),startTime:i.utc.format(l,"HH:mm:ss"),finishTime:i.utc.format(u,"HH:mm:ss"),group:r.get("group"),duration:h,pceTime:Math.ceil(h/m),qtyTodo:o.get("quantityTodo"),qtyPlan:m,line:r.get("line"),comment:d?d.getCommentWithIcon():"",comments:d?d.get("comments"):[],status:o.getStatus(),statuses:e.serializeOrderStatuses(o),rowClassName:d&&"done"===d.get("whStatus")?"success":"",newGroup:!1,newLine:!1};return n&&(c.newGroup=c.group!==n.group,c.newLine=c.line!==n.line),n=c,c})},serializeOrderStatuses:function(e){return c(this.plan,e.id)},hideMenu:function(){d.hide(this)},showMenu:function(e){var t=e.currentTarget,i=t.dataset.id,r=[d.actions.sapOrder(i)];(this.plan.shiftOrders.findOrders(i).length||this.plan.getActualOrderData(i).quantityDone)&&r.push({icon:"fa-file-text-o",label:n("planning","orders:menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,i)}),this.plan.canCommentOrders()&&r.push(d.actions.comment(i)),r.push({icon:"fa-clipboard",label:n("planning","lineOrders:menu:copy"),handler:this.handleCopyAction.bind(this,t,e.pageY,e.pageX,!1,!1)}),r.push({label:n("planning","wh:menu:copy:lineGroup",{group:t.dataset.group,line:t.dataset.line}),handler:this.handleCopyAction.bind(this,t,e.pageY,e.pageX,!0,!1)}),r.push({label:n("planning","wh:menu:copy:lineGroupNo",{group:t.dataset.group,line:t.dataset.line}),handler:this.handleCopyAction.bind(this,t,e.pageY,e.pageX,!0,!0)}),d.show(this,e.pageY,e.pageX,r)},handleShiftOrderAction:function(e){var t=this.plan.shiftOrders.findOrders(e);if(1===t.length)return window.open("/#prodShiftOrders/"+t[0].id);window.open("/#prodShiftOrders?sort(startedAt)&limit(20)&orderId="+e)},handleCopyAction:function(t,i,r,s,a){var p=this;o.copy(function(o){if(o){var d=["group","no","set","shift","mrp","orderNo","nc12","name","qtyPlan","qtyTodo","startTime","finishTime","line","comment"],l=a?[]:[d.map(function(e){return n("planning","lineOrders:list:"+e)}).join("\t")],u=t.dataset.line,h=+t.dataset.group;p.serializeOrders().forEach(function(e){if(!s||e.line===u&&e.group===h){if(a)return void l.push(e.orderNo);var t=[e.group,e.no,e.set,e.shift,e.mrp,e.orderNo,e.nc12,e.name,e.qtyPlan,e.qtyTodo,e.startTime,e.finishTime,e.line,'"'+e.comments.map(function(e){return e.user.label+": "+e.text.replace(/"/g,"'")}).join("\r\n--\r\n")+'"'];l.push(t.join("\t"))}}),a&&(l=e.uniq(l)),o.setData("text/plain",l.join("\r\n"));var m=p.$(t).tooltip({container:p.el,trigger:"manual",placement:"bottom",title:n("planning","lineOrders:menu:copy:success")});m.tooltip("show").data("bs.tooltip").tip().addClass("result success").css({left:r+"px",top:i+"px"}),p.timers.hideTooltip&&clearTimeout(p.timers.hideTooltip),p.timers.hideTooltip=setTimeout(function(){m.tooltip("destroy")},1337)}})},onCommentChange:function(e){this.plan.orders.get(e.id)&&this.$('tr[data-id="'+e.id+'"] > .planning-mrp-lineOrders-comment').html(e.getCommentWithIcon())},onOrdersReset:function(e,t){t.reload||this.scheduleRender()},onPsStatusChanged:function(e){var t=this.$('tr[data-id="'+e.id+'"]');if(t.length){var i=this.plan.sapOrders.getPsStatus(e.id);t.find(".planning-mrp-list-property-psStatus").attr("title",n("planning","orders:psStatus:"+i)).attr("data-ps-status",i)}}})});