// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/data/clipboard","app/planning/util/contextMenu","app/planning/PlanSapOrder","app/core/templates/userInfo","app/wh/templates/whList","app/wh/templates/whListRow","app/planning/templates/lineOrderComments"],function(e,t,n,i,r,s,a,o,d,l,p,h,c,u){"use strict";return a.extend({template:h,events:{"contextmenu td[data-column-id]":function(e){return this.showMenu(e),!1},"mousedown .planning-mrp-lineOrders-comment":function(e){if(0===e.button){var t=this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.order);if(t){var n=t.get("comments");n.length&&this.$(e.currentTarget).popover({trigger:"manual",placement:"left",html:!0,content:u({comments:n.map(function(e){return{user:p({noIp:!0,userInfo:e.user}),time:i.toTagData(e.time).human,text:l.formatCommentWithIcon(e)}})}),template:'<div class="popover planning-mrp-comment-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(e){this.$(e.currentTarget).popover("destroy")},'click .is-clickable[data-column-id="set"]':function(e){this.trigger("setClicked",e.currentTarget.parentNode.dataset.id)}},initialize:function(){var e=this,t=e.plan,n=t.sapOrders;e.listenTo(t,"change:loading change:updatedAt",e.scheduleRender),e.listenTo(n,"reset",e.onOrdersReset),e.listenTo(n,"change:comments",e.onCommentChange),e.listenTo(n,"change:psStatus",e.onPsStatusChanged),e.listenTo(e.whOrders,"reset",e.onOrdersReset),e.listenTo(e.whOrders,"change",e.onOrderChanged)},serialize:function(){return{idPrefix:this.idPrefix,renderRow:c,rows:this.serializeRows()}},serializeRows:function(){return this.whOrders.serialize(this.plan)},beforeRender:function(){clearTimeout(this.timers.render)},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},hideMenu:function(){d.hide(this)},showMenu:function(e){var t=e.currentTarget,i=t.parentNode,s=this.whOrders.get(i.dataset.id),a=s.get("order"),o=s.get("group"),l=s.get("line"),p=s.get("set"),h=s.get("status"),c=[d.actions.sapOrder(a)];(this.plan.shiftOrders.findOrders(a).length||this.plan.getActualOrderData(a).quantityDone)&&c.push({icon:"fa-file-text-o",label:n("wh","menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,a)}),this.plan.canCommentOrders()&&c.push(d.actions.comment(a)),c.push("-"),c.push({icon:"fa-clipboard",label:n("wh","menu:copy:all"),handler:this.handleCopyAction.bind(this,i,e.pageY,e.pageX,!1,!1)}),c.push({label:n("wh","menu:copy:lineGroup",{group:o,line:l}),handler:this.handleCopyAction.bind(this,i,e.pageY,e.pageX,!0,!1)}),c.push({label:n("wh","menu:copy:lineGroupNo",{group:o,line:l}),handler:this.handleCopyAction.bind(this,i,e.pageY,e.pageX,!0,!0)}),r.isAllowedTo("WH:MANAGE")&&(c.push("-"),"cancelled"!==h&&(c.push({icon:"fa-times",label:n("wh","menu:cancelOrder"),handler:this.handleCancelAction.bind(this,{orders:[s.id]})}),p&&c.push({label:n("wh","menu:cancelSet"),handler:this.handleCancelAction.bind(this,{set:p})})),"pending"!==h&&(c.push({icon:"fa-eraser",label:n("wh","menu:resetOrder"),handler:this.handleResetAction.bind(this,{orders:[s.id]})}),p&&c.push({label:n("wh","menu:resetSet"),handler:this.handleResetAction.bind(this,{set:p})}))),d.show(this,e.pageY,e.pageX,c)},handleShiftOrderAction:function(e){var t=this.plan.shiftOrders.findOrders(e);if(1===t.length)return window.open("/#prodShiftOrders/"+t[0].id);window.open("/#prodShiftOrders?sort(startedAt)&limit(20)&orderId="+e)},handleCopyAction:function(t,i,r,s,a){var d=this;o.copy(function(o){if(o){var l=["group","no","set","shift","mrp","order","nc12","name","qtyPlan","qtyTodo","startTime","finishTime","line","picklist","fmx","kitter","packer","comment"],p=a?[]:[l.map(function(e){return n("wh","prop:"+e)}).join("\t")],h=d.whOrders.get(t.dataset.id),c=h.get("line"),u=h.get("group");d.serializeRows().forEach(function(e){if(!s||e.line===c&&e.group===u){if(a)return void p.push(e.order);var t=[e.group,e.no,e.set,e.shift,e.mrp,e.order,e.nc12,e.name,e.qty,e.qtyTodo,e.startTime,e.finishTime,e.line,e.picklistFunc?e.picklistDone?1:0:"",n("wh","status:"+e.funcs[0].status),n("wh","status:"+e.funcs[1].status),n("wh","status:"+e.funcs[2].status),'"'+e.comments.map(function(e){return e.user.label+": "+e.text.replace(/"/g,"'")}).join("\r\n--\r\n")+'"'];p.push(t.join("\t"))}}),a&&(p=e.uniq(p)),o.setData("text/plain",p.join("\r\n"));var m=d.$(t).tooltip({container:d.el,trigger:"manual",placement:"bottom",title:n("planning","lineOrders:menu:copy:success")});m.tooltip("show").data("bs.tooltip").tip().addClass("result success").css({left:r+"px",top:i+"px"}),d.timers.hideTooltip&&clearTimeout(d.timers.hideTooltip),d.timers.hideTooltip=setTimeout(function(){m.tooltip("destroy")},1337)}})},handleResetAction:function(e){this.whOrders.trigger("act","resetOrders",e)},handleCancelAction:function(e){this.whOrders.trigger("act","cancelOrders",e)},onCommentChange:function(e){this.plan.orders.get(e.id)&&this.$('tr[data-order="'+e.id+'"] > .planning-mrp-lineOrders-comment').html(e.getCommentWithIcon())},onOrdersReset:function(e,t){t.reload||this.scheduleRender()},onPsStatusChanged:function(e){var t=this.$('tr[data-order="'+e.id+'"]');if(t.length){var i=this.plan.sapOrders.getPsStatus(e.id);t.find(".planning-mrp-list-property-psStatus").attr("title",n("planning","orders:psStatus:"+i)).attr("data-ps-status",i)}},onOrderChanged:function(e){var t=this.$('tr[data-id="'+e.id+'"]');if(t.length){var n=this.whOrders.indexOf(e);t.replaceWith(c({row:e.serialize(this.plan,n)}))}}})});