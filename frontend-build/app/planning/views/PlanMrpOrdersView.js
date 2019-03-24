define(["underscore","jquery","app/i18n","app/viewport","app/user","app/time","app/core/View","app/core/views/DialogView","app/orderStatuses/util/renderOrderStatusLabel","../util/scrollIntoView","../util/contextMenu","../PlanOrderCollection","./PlanOrderQuantityDialogView","./PlanOrderLinesDialogView","./PlanOrderAddDialogView","./PlanOrderDropZoneDialogView","app/planning/templates/orders","app/planning/templates/orderPopover","app/planning/templates/orderIgnoreDialog","app/planning/templates/orderRemoveDialog","app/planning/templates/orderStatusIcons"],function(e,t,i,n,r,o,s,a,d,l,p,h,g,u,c,m,v,w,f,b,O){"use strict";return s.extend({template:v,events:{"mouseenter .is-order":function(e){this.mrp.orders.trigger("highlight",{source:"orders",state:!0,orderNo:e.currentTarget.dataset.id})},"mouseleave .is-order":function(e){this.mrp.orders.trigger("highlight",{source:"orders",state:!1,orderNo:e.currentTarget.dataset.id})},"click .is-order":function(e){if(0===e.button){var t=e.currentTarget.dataset.id;if(e.ctrlKey)return void window.open("#orders/"+t);""===window.getSelection().toString()&&this.mrp.orders.trigger("preview",{orderNo:t,source:"orders"})}},"contextmenu .is-order":function(e){return this.showMenu(e),!1},"click #-add":function(){return this.$id("add").blur(),this.hidePreview(),this.showAddDialog(),!1}},localTopics:{"planning.windowResized":"resize","planning.escapePressed":function(){this.hidePreview(),this.hideMenu()},"planning.contextMenu.shown":"hidePreview"},initialize:function(){var e=this.mrp,t=this.plan;this.$preview=null,this.listenTo(e.orders,"added changed",this.onOrdersChanged),this.listenTo(e.orders,"removed",this.onOrdersRemoved),this.listenTo(e.orders,"highlight",this.onOrderHighlight),this.listenTo(e.orders,"preview",this.onOrderPreview),this.listenTo(t.displayOptions,"change:useLatestOrderData",this.render),this.listenTo(t.sapOrders,"reset",this.onSapOrdersReset),this.listenTo(t.sapOrders,"change:psStatus",this.onPsStatusChanged),this.listenTo(t.sapOrders,"change:whStatus",this.onWhStatusChanged),this.listenTo(t.settings,"changed",this.onSettingsChanged)},destroy:function(){this.hideMenu(),this.$preview&&(this.$preview.popover("destroy"),this.$preview=null),this.$el.popover("destroy")},getTemplateData:function(){return{showEditButton:this.isEditable(),actionLabel:i("planning","orders:add"),hdLabel:i("planning","orders:hd"),orders:this.serializeOrders(),icons:!0}},serializeOrders:function(){var e=this.plan;return this.mrp.orders.map(function(t){var i=e.getActualOrderData(t.id),n=t.mapSapStatuses(i.statuses);return{_id:t.id,mrp:t.get("mrp"),incomplete:t.get("incomplete")>0?"is-incomplete":"",completed:i.quantityDone>=i.quantityTodo?"is-completed":"",started:i.quantityDone>0?"is-started":"",surplus:i.quantityDone>i.quantityTodo?"is-surplus":"",unplanned:t.get("incomplete")===t.getQuantityTodo()?"is-unplanned":"",confirmed:n.CNF?"is-cnf":"",delivered:n.DLV?"is-dlv":"",deleted:n.deleted?"is-teco":"",ignored:t.get("ignored")?"is-ignored":"",invalid:t.get("operation").laborTime?"":"is-invalid",statusIcons:O(e,t.id,{sapStatuses:!1})}}).sort(h.compare)},beforeRender:function(){this.$preview&&(this.$preview.popover("destroy"),this.$preview=null)},afterRender:function(){var e=this;if(e.$el.popover({container:e.el,selector:".planning-mrp-list-item",trigger:"hover",placement:"top",html:!0,content:function(){if(!e.$preview||e.$preview.data("orderNo")!==this.dataset.id)return e.serializePopover(this.dataset.id,!0)},template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}),e.$preview){var t=e.$preview.data("orderNo");e.hidePreview(),e.showPreview(t)}e.$id("list").on("scroll",function(t){e.$id("scrollIndicator").toggleClass("hidden",t.target.scrollLeft<=40),e.hidePreview()}),e.resize()},resize:function(){var e=this.$(".planning-mrp-list-action"),t=this.$id("scrollIndicator"),i=e.position();t.css({top:i.top+1+"px",left:e.outerWidth()+i.left+"px"}),this.$preview&&this.$preview.popover("show"),p.hide(this)},$item:function(e){return e?this.$('.planning-mrp-list-item[data-id="'+e+'"]'):this.$(".planning-mrp-list-item")},serializePopover:function(e,t){var i=this.plan.orders.get(e);if(!i)return null;var n=this.plan.sapOrders.get(i.id),r=this.plan.getActualOrderData(i.id),s=i.get("operation");return w({order:{_id:i.id,date:i.get("date")===this.plan.id?null:o.utc.format(i.get("date"),"LL"),nc12:i.get("nc12"),name:i.get("name"),kind:i.get("kind"),incomplete:i.get("incomplete"),completed:r.quantityDone>=r.quantityTodo,surplus:r.quantityDone>r.quantityTodo,quantityTodo:r.quantityTodo,quantityDone:r.quantityDone,quantityPlan:i.get("quantityPlan"),ignored:i.get("ignored"),statuses:r.statuses.map(d),manHours:i.get("manHours"),laborTime:s&&s.laborTime?s.laborTime:0,lines:i.get("lines")||[],comment:t&&n?n.getCommentWithIcon():""}})},hidePreview:function(){this.$preview&&(this.$preview.popover("hide"),this.$preview=null)},showPreview:function(e,t){var i=this;i.mrp.orders.get(e.id)&&(i.$preview=i.$item(e.id).find(".planning-mrp-list-item-inner").data("orderNo",e.id).popover({container:i.el,trigger:"manual",placement:"top",html:!0,hasContent:!0,content:i.serializePopover(e.id,!1!==t),template:'<div class="popover planning-mrp-popover planning-mrp-popover-preview"><div class="arrow"></div><div class="popover-content"></div></div>'}),i.$preview.one("hidden.bs.popover",function(){i.$preview&&i.$preview.data("orderNo")===e.id&&(i.$preview.popover("destroy"),i.$preview=null)}),i.$preview.data("bs.popover").tip().on("click",function(){""===window.getSelection().toString()&&i.hidePreview()}),i.$preview.popover("show"))},showAddDialog:function(){var e=new c({plan:this.plan,mrp:this.mrp,model:{orderNo:""}});n.showDialog(e,i("planning","orders:add:title"))},isEditable:function(){return!("development"!==window.ENV||!r.isAllowedTo("SUPER"))||this.plan.canEditSettings()&&!this.plan.settings.isMrpLocked(this.mrp.id)},hideMenu:function(){p.hide(this)},showMenu:function(e){var t=this.mrp.orders.get(this.$(e.currentTarget).attr("data-id")),n=[p.actions.sapOrder(t.id)];r.isAllowedTo("PROD_DATA:VIEW")&&(this.plan.shiftOrders.findOrders(t.id).length||this.plan.getActualOrderData(t.id).quantityDone)&&n.push({icon:"fa-file-text-o",label:i("planning","orders:menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,t)}),this.plan.canCommentOrders()&&n.push(p.actions.comment(t.id)),this.isEditable()&&!t.isAutoAdded()&&(n.push({icon:"fa-sort-numeric-desc",label:i("planning","orders:menu:quantity"),handler:this.handleQuantityAction.bind(this,t)},{icon:"fa-thumb-tack",label:i("planning","orders:menu:lines"),handler:this.handleLinesAction.bind(this,t)},{icon:"fa-exclamation",label:i("planning","orders:menu:"+(t.get("urgent")?"unurgent":"urgent")),handler:this.handleUrgentAction.bind(this,t)},{icon:"fa-ban",label:i("planning","orders:menu:"+(t.get("ignored")?"unignore":"ignore")),handler:this.handleIgnoreAction.bind(this,t)}),"added"===t.get("source")&&n.push({icon:"fa-times",label:i("planning","orders:menu:remove"),handler:this.handleRemoveAction.bind(this,t)})),this.plan.canChangeDropZone()&&n.push({icon:"fa-level-down",label:i("planning","orders:menu:dropZone"),handler:this.handleDropZoneAction.bind(this,t)}),p.show(this,e.pageY,e.pageX,n)},handleShiftOrderAction:function(e){var t=this.plan.shiftOrders.findOrders(e.id),i="/#prodShiftOrders";1===t.length?i+="/"+t[0].id:i+="?sort(startedAt)&limit(-1337)&orderId="+e.id,window.open(i)},handleQuantityAction:function(e){var t=new g({plan:this.plan,mrp:this.mrp,order:e});n.showDialog(t,i("planning","orders:menu:quantity:title"))},handleLinesAction:function(e){var t=new u({plan:this.plan,mrp:this.mrp,order:e});n.showDialog(t,i("planning","orders:menu:lines:title"))},handleUrgentAction:function(e){var t=this,r=e.get("urgent"),o=new a({autoHide:!1,template:f,model:{action:r?"unurgent":"urgent",plan:t.plan.getLabel(),mrp:t.mrp.getLabel(),order:e.getLabel()}});t.listenTo(o,"answered",function(){var s=t.ajax({method:"PATCH",url:"/planning/plans/"+t.plan.id+"/orders/"+e.id,data:JSON.stringify({urgent:!r})});s.done(o.closeDialog),s.fail(function(){n.msg.show({type:"error",time:3e3,text:i("planning","orders:menu:urgent:failure")}),t.plan.settings.trigger("errored"),o.enableAnswers()})}),n.showDialog(o,i("planning","orders:menu:urgent:title"))},handleIgnoreAction:function(e){var t=this,r=new a({autoHide:!1,template:f,model:{action:e.get("ignored")?"unignore":"ignore",plan:t.plan.getLabel(),mrp:t.mrp.getLabel(),order:e.getLabel()}});t.listenTo(r,"answered",function(){var o=t.ajax({method:"PATCH",url:"/planning/plans/"+t.plan.id+"/orders/"+e.id,data:JSON.stringify({ignored:!e.get("ignored")})});o.done(r.closeDialog),o.fail(function(){n.msg.show({type:"error",time:3e3,text:i("planning","orders:menu:ignore:failure")}),t.plan.settings.trigger("errored"),r.enableAnswers()})}),n.showDialog(r,i("planning","orders:menu:ignore:title"))},handleRemoveAction:function(e){var t=this,r=new a({autoHide:!1,template:b,model:{plan:t.plan.getLabel(),mrp:t.mrp.getLabel(),order:e.getLabel()}});t.listenTo(r,"answered",function(){var o=t.ajax({method:"DELETE",url:"/planning/plans/"+t.plan.id+"/orders/"+e.id});o.done(r.closeDialog),o.fail(function(){n.msg.show({type:"error",time:3e3,text:i("planning","orders:menu:remove:failure")}),t.plan.settings.trigger("errored"),r.enableAnswers()})}),n.showDialog(r,i("planning","orders:menu:remove:title"))},handleDropZoneAction:function(e){var t=new m({plan:this.plan,mrp:this.mrp,order:e});n.showDialog(t,i("planning","orders:menu:dropZone:title"))},onOrdersChanged:function(){this.plan.isAnythingLoading()||this.render()},onOrdersRemoved:function(e){var t=this;e.forEach(function(e){t.$item(e.id).remove()})},onOrderHighlight:function(e){this.$(".is-highlighted").removeClass("is-highlighted");var t=this.$('.is-order[data-id="'+e.orderNo+'"]').toggleClass("is-highlighted",e.state);"orders"===e.source||this.plan.displayOptions.isListWrappingEnabled()||(this.hidePreview(),l(t[0]))},onOrderPreview:function(e){var i=this.mrp.orders.get(e.orderNo);if(i){if(this.$preview){var n=this.$preview.data("orderNo");if(this.hidePreview(),i.id===n)return}if(e.scrollIntoView){var r=this.$el.position().top-180;t("html, body").animate({scrollTop:r},"fast","swing",this.showPreview.bind(this,i))}else this.showPreview(i,"lineOrders"!==e.source)}},onSapOrdersReset:function(e,t){t.reload||!this.plan.displayOptions.isLatestOrderDataUsed()||this.plan.isAnythingLoading()||this.render()},onPsStatusChanged:function(e){var t=this.$item(e.id);if(t.length){var n=this.plan.sapOrders.getPsStatus(e.id);t.find(".planning-mrp-list-property-psStatus").attr("title",i("planning","orders:psStatus:"+n)).attr("data-ps-status",n)}},onWhStatusChanged:function(e){var t=this.$item(e.id);if(t.length){var n=this.plan.sapOrders.getWhStatus(e.id);t.find(".planning-mrp-list-property-whStatus").attr("title",i("planning","orders:whStatus:"+n)).attr("data-wh-status",n)}},onSettingsChanged:function(e){e.locked&&this.render()}})});