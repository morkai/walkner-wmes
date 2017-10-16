// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/user","app/time","app/core/View","app/core/views/DialogView","app/orderStatuses/util/renderOrderStatusLabel","../util/scrollIntoView","../util/contextMenu","./PlanOrderAddDialogView","app/planning/templates/orders","app/planning/templates/orderPopover"],function(e,t,i,n,r,a,s,o,d,l,p,u,c,h){"use strict";return s.extend({template:c,events:{"click .is-order":function(e){if(0===e.button){var t=e.currentTarget.dataset.id;e.ctrlKey&&window.open("#orders/"+t)}},"contextmenu .is-order":function(e){return this.showMenu(e),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":function(){this.hideMenu()}},initialize:function(){var e=this,t=e.mrp,i=e.plan;e.listenTo(t.orders,"added removed reset",e.render),e.listenTo(i.lateOrders,"reset",e.render)},destroy:function(){this.hideMenu(),this.$el.popover("destroy")},serialize:function(){return{idPrefix:this.idPrefix,showEditButton:!1,hdLabel:i("planning","lateOrders:hd"),orders:this.serializeOrders()}},serializeOrders:function(){var e=this.plan,t=this.mrp;return e.lateOrders.filter(function(e){return e.get("mrp")===t.id&&!t.orders.get(e.id)}).map(function(e){return{_id:e.id,kind:null,incomplete:!1,completed:!1,surplus:!1,invalid:!1,ignored:!1,confirmed:!1,delivered:!1,customQuantity:!1,urgent:!1,late:!1}})},afterRender:function(){var e=this;e.$el.popover({container:e.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,content:function(){return e.serializePopover(this.dataset.id)},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}),e.$id("list").on("scroll",function(t){e.$id("scrollIndicator").toggleClass("hidden",t.target.scrollLeft<=40)}),e.resize()},resize:function(){var e=this.$(".planning-mrp-list-action").first(),t=this.$id("scrollIndicator"),i=e.position();t.css({top:i.top+1+"px",left:e.outerWidth()+i.left+"px"}),p.hide(this)},$item:function(e){return e?this.$('.planning-mrp-list-item[data-id="'+e+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(e){var t=this.plan.lateOrders.get(e);if(!t)return null;var i=this.delayReasons.get(t.get("delayReason"));return h({order:{_id:t.id,nc12:t.get("nc12"),name:t.get("name"),date:a.format(t.get("date"),"LL"),quantityTodo:t.get("quantityTodo"),quantityDone:t.get("quantityDone"),statuses:t.get("statuses").map(d),delayReason:i?i.getLabel():null}})},hideMenu:function(){p.hide(this)},showMenu:function(e){var t=this.plan.lateOrders.get(this.$(e.currentTarget).attr("data-id")),n=[{label:i("planning","orders:menu:details"),handler:this.handleDetailsAction.bind(this,t)}];this.plan.isEditable()&&r.isAllowedTo("PLANNING:PLANNER","PLANNING:MANAGE")&&n.push({label:i("planning","orders:menu:add"),handler:this.handleAddAction.bind(this,t)}),p.show(this,e.pageY,e.pageX,n)},handleDetailsAction:function(e){window.open("#orders/"+e.id)},handleAddAction:function(e){var t=new u({plan:this.plan,mrp:this.mrp,model:{orderNo:e.id}});n.showDialog(t,i("planning","orders:add:title"))}})});