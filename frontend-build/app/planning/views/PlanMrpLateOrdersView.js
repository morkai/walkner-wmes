define(["underscore","jquery","app/i18n","app/viewport","app/user","app/time","app/core/View","app/core/views/DialogView","app/orderStatuses/util/renderOrderStatusLabel","../util/scrollIntoView","../util/contextMenu","./PlanOrderAddDialogView","./PlanLateOrderAddDialogView","app/planning/templates/orders","app/planning/templates/orderPopover"],function(e,t,n,i,r,s,a,o,d,l,p,u,c,h,g){"use strict";return a.extend({template:h,events:{"click .is-order":function(e){if(0===e.button){var t=e.currentTarget.dataset.id;e.ctrlKey&&window.open("/#orders/"+t)}},"contextmenu .is-order":function(e){return this.showMenu(e),!1},"click #-add":function(){return this.$id("add").blur(),this.showAddDialog(),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":function(){this.hideMenu()}},initialize:function(){var e=this.mrp,t=this.plan;this.listenTo(e.orders,"added removed reset",this.render),this.listenTo(t.lateOrders,"reset",this.render),this.listenTo(t.settings,"changed",this.onSettingsChanged)},destroy:function(){this.hideMenu(),this.$el.popover("destroy")},getTemplateData:function(){return{showEditButton:this.isEditable(),actionLabel:n("planning","lateOrders:action"),hdLabel:n("planning","lateOrders:hd"),orders:this.serializeOrders(),icons:!1}},serializeOrders:function(){var e=this.plan,t=this.mrp;return e.lateOrders.filter(function(e){return e.get("mrp")===t.id&&!t.orders.get(e.id)}).map(function(e){return{_id:e.id,kind:null,incomplete:"",completed:"",started:"",surplus:"",invalid:"",added:!1,ignored:"",confirmed:"",delivered:"",customQuantity:!1,urgent:!1,late:!1,pinned:!1,psStatus:"unknown",whStatus:"unknown"}})},afterRender:function(){var e=this;e.$el.popover({container:e.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,hasContent:!0,content:function(){return e.serializePopover(this.dataset.id)},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}),e.$id("list").on("scroll",function(t){e.$id("scrollIndicator").toggleClass("hidden",t.target.scrollLeft<=40)}),e.resize()},resize:function(){var e=this.$(".planning-mrp-list-action").first(),t=this.$id("scrollIndicator"),n=e.position();t.css({top:n.top+1+"px",left:e.outerWidth()+n.left+"px"}),p.hide(this)},$item:function(e){return e?this.$('.planning-mrp-list-item[data-id="'+e+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(e){var t=this.plan.lateOrders.get(e);if(!t)return"?";var n=this.delayReasons.get(t.get("delayReason")),i=t.get("operation");return g({order:{_id:t.id,nc12:t.get("nc12"),name:t.get("name"),date:s.format(t.get("date"),"LL"),quantityTodo:t.get("quantityTodo"),quantityDone:t.get("quantityDone"),statuses:t.get("statuses").map(d),delayReason:n?n.getLabel():null,manHours:t.get("manHours"),laborTime:i&&i.laborTime?i.laborTime:0,lines:[]}})},showAddDialog:function(){var e=new c({plan:this.plan,mrp:this.mrp});i.showDialog(e,n("planning","lateOrders:add:title"))},isEditable:function(){return!("development"!==window.ENV||!r.isAllowedTo("SUPER"))||this.plan.canAddLateOrders()&&!this.plan.settings.isMrpLocked(this.mrp.id)},hideMenu:function(){p.hide(this)},showMenu:function(e){var t=this.plan.lateOrders.get(this.$(e.currentTarget).attr("data-id")),i=[p.actions.sapOrder(t.id)];this.plan.canCommentOrders()&&i.push(p.actions.comment(t.id)),this.isEditable()&&i.push({icon:"fa-plus",label:n("planning","orders:menu:add"),handler:this.handleAddAction.bind(this,t)}),p.show(this,e.pageY,e.pageX,i)},handleAddAction:function(e){var t=new u({plan:this.plan,mrp:this.mrp,model:{orderNo:e.id,urgent:!0}});i.showDialog(t,n("planning","orders:add:title"))},onSettingsChanged:function(e){e.locked&&this.render()}})});