define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/data/clipboard","app/planning/util/contextMenu","app/planning/PlanSapOrder","../WhOrder","app/core/templates/userInfo","app/wh/templates/whSet","app/wh/templates/whSetItem","app/wh/templates/cartsEditor","app/wh/templates/problemEditor","app/wh/templates/printLabels","app/planning/templates/lineOrderComments"],function(e,t,i,n,a,r,s,o,d,u,p,c,l,f,h,m,g,w){"use strict";var v={picklistDone:[{label:"true",value:!0,icon:"fa-thumbs-o-up"},{label:"false",value:!1,icon:"fa-thumbs-o-down"},{label:"null",value:null,manage:!0}],picklist:[{value:"require",icon:"fa-check"},{value:"ignore",icon:"fa-times"},{value:"pending",manage:!0}],pickup:[{value:"success",icon:"fa-thumbs-o-up"},{value:"failure",icon:"fa-thumbs-o-down"},{value:"pending",manage:!0}]};return s.extend({template:l,dialogClassName:"wh-set-dialog",events:{"mousedown .planning-mrp-lineOrders-comment":function(e){if(0===e.button){var t=this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.order);if(t){var i=t.get("comments");i.length&&this.$(e.currentTarget).popover({trigger:"manual",placement:"left",html:!0,content:w({comments:i.map(function(e){return{user:c({noIp:!0,userInfo:e.user}),time:n.toTagData(e.time).human,text:u.formatCommentWithIcon(e)}})}),template:'<div class="popover planning-mrp-comment-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(e){this.$(e.currentTarget).popover("destroy")},"click .is-clickable":function(e){var t=this.whOrders.get(this.$(e.target).closest("tbody").attr("data-id")),i=e.currentTarget.dataset.func,n=e.currentTarget.dataset.prop;this.showUpdateMenu(t,i,n,e)},"contextmenu .wh-set-action":function(){return!1},"mousedown .wh-set-action":function(e){if(!e.currentTarget.classList.contains("is-clickable")){var t=this.whOrders.get(this.$(e.target).closest("tbody").attr("data-id")),i=e.currentTarget.dataset.func,n=e.currentTarget.dataset.prop;this.timers.showFixUpdateMenu=setTimeout(this.showFixUpdateMenu.bind(this,t,i,n,e),500)}},"mouseup .wh-set-action":function(){clearTimeout(this.timers.showFixUpdateMenu),this.timers.showFixUpdateMenu=null},click:function(){this.hideEditor()},'click .btn[data-action="printLabels"]':function(e){var n=this,a=t(g());return a.on("submit",function(){var e=a.data("whOrderId"),t=+a.find("input").val();n.$('.wh-set-item[data-id="'+e+'"] .btn[data-action="printLabels"]').prop("disabled",!0).find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),n.hideEditor();var s=n.whOrders.act("printLabels",{order:e,qty:t,func:n.model.user.func});return s.fail(function(){r.msg.show({type:"error",time:2500,text:i("wh","printLabels:failure")})}),s.always(function(){n.$('.wh-set-item[data-id="'+e+'"] .btn[data-action="printLabels"]').prop("disabled",!1).find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-print")}),!1}),n.showEditor(a,n.$(e.target).closest(".wh-set-actions")[0]),a.find("input").select(),!1}},initialize:function(){var e=this;e.listenTo(e.plan.sapOrders,"reset",e.onOrdersReset),e.listenTo(e.whOrders,"reset",e.onOrdersReset),e.listenTo(e.whOrders,"change",e.onOrderChanged),t(window).on("keydown."+this.idPrefix,function(t){if("Escape"===t.key)return e.$editor?e.hideEditor():r.closeDialog(),!1})},destroy:function(){t(window).off("keydown."+this.idPrefix),this.hideEditor()},serialize:function(){return{idPrefix:this.idPrefix,renderItem:f,items:this.serializeItems()}},serializeItems:function(){var e=this;return e.whOrders.filter(function(t){return t.get("set")===e.model.set}).map(function(t,i){return t.serializeSet(e.plan,i,e.model.user)})},beforeRender:function(){clearTimeout(this.timers.render)},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},hideMenu:function(){d.hide(this)},showUpdateMenu:function(e,t,n,r){var s=this,o=a.isAllowedTo("WH:MANAGE"),u=v[n].map(function(a){return a.manage&&!o?null:{icon:a.icon,label:i("wh","menu:"+n+":"+(a.label||a.value)),handler:s.handleUpdate.bind(s,e,t,n,a.value)}}).filter(function(e){return!!e});d.show(s,r.pageY-17,r.pageX-17,u)},showFixUpdateMenu:function(e,t,i,n){var a=e.getUserFunc(this.model.user);if(a){var r=e.get("picklistDone");switch(i){case"picklistDone":if(null===r||e.get("picklistFunc")!==a._id)return;break;case"picklist":if(!r||"pending"===a.status||t!==a._id)return;break;case"pickup":if("pending"===a.picklist||"ignore"===a.pickup||t!==a._id)return}this.showUpdateMenu(e,t,i,n)}},showEditor:function(e,t){var i=this;i.hideEditor(),e.data("whOrderId",i.$(t).closest(".wh-set-item")[0].dataset.id).css({left:t.offsetLeft+"px",top:t.offsetTop+"px"}).appendTo(".modal-content"),e.on("keydown",function(e){if("Escape"===e.key)return i.hideEditor(),!1}),i.$editor=e},hideEditor:function(){this.$editor&&(this.onOrderChanged(this.whOrders.get(this.$editor.data("whOrderId"))),this.$editor.remove(),this.$editor=null)},handleUpdate:function(e,t,n,a){var s=this,o=JSON.parse(JSON.stringify(e.attributes));s.$('.wh-set-item[data-id="'+e.id+'"]').find('.wh-set-action[data-prop="'+n+'"]'+(t?'[data-func="'+t+'"]':"")).removeClass("is-clickable").find(".fa").removeClass().addClass("fa fa-spinner fa-spin"),s.updateHandlers[n].call(s,o,a,t,function(t){if(s.hideEditor(),!t)return s.onOrderChanged(e);var n=s.promised(s.whOrders.act("updateOrder",{order:t(JSON.parse(JSON.stringify(e.attributes)))}));n.fail(function(){s.onOrderChanged(e),r.msg.show({type:"error",time:2500,text:i("wh","update:failure")})}),n.done(function(t){e.set(t.order)})})},updateHandlers:{picklistDone:function(e,t,i,n){n(function(e){return e.picklistDone=t,!1===t?(e.status="problem",e.problem=""):(e.status="started",e.problem=""),e.funcs.forEach(function(t){e.picklistFunc===t._id?(t.status="picklist",t.startedAt=new Date):t.user?t.status="picklist":(t.status="pending",t.startedAt=null),t.finishedAt=null,t.picklist="pending",t.pickup="pending",t.carts=[],t.problemArea=""}),e})},picklist:function(e,t,i,n){var a=this;n(function(e){var n=e.funcs[p.FUNC_TO_INDEX[i]];switch(n.picklist=t,n.carts=[],n.problemArea="",t){case"pending":n.status="picklist",n.pickup="pending";break;case"require":n.status="pickup",n.pickup="pending";break;case"ignore":n.status="finished",n.pickup="ignore",n.carts=[],n.problemArea="",n.finishedAt=new Date,a.updateHandlers.finalizeOrder.call(a,e)}return e})},pickup:function(e,t,i,n){var a=this;switch(t){case"pending":n(function(e){var t=e.funcs[p.FUNC_TO_INDEX[i]];return t.status="pickup",t.pickup="pending",t.carts=[],t.problemArea="",t.finishedAt=null,a.updateHandlers.finalizeOrder.call(a,e),e});break;case"success":a.updateHandlers.handlePickupSuccess.call(a,e,i,n);break;case"failure":a.updateHandlers.handlePickupFailure.call(a,e,i,n)}},handlePickupSuccess:function(e,i,n){var a=this,r=a.$('.wh-set-item[data-id="'+e._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),s=t(h({carts:e.funcs[p.FUNC_TO_INDEX[i]].carts.join(" ")}));s.on("submit",function(){return n(function(e){var t=e.funcs[p.FUNC_TO_INDEX[i]];return t.status="finished",t.pickup="success",t.carts=s.find(".form-control").val().split(/[^0-9]+/).filter(function(e){return!!e.length}).map(function(e){return+e}),t.problemArea="",t.finishedAt=new Date,a.updateHandlers.finalizeOrder.call(a,e),e}),!1}),a.showEditor(s,r[0]),s.find("input").select()},handlePickupFailure:function(e,i,n){var a=this,r=e.funcs[p.FUNC_TO_INDEX[i]],s=a.$('.wh-set-item[data-id="'+e._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),o=t(m({problemArea:r.problemArea,comment:r.comment}));o.on("submit",function(){return n(function(e){var t=e.funcs[p.FUNC_TO_INDEX[i]];return t.status="problem",t.pickup="failure",t.carts=[],t.problemArea=o.find("input").val().trim(),t.comment=o.find("textarea").val().trim(),t.finishedAt=new Date,a.updateHandlers.finalizeOrder.call(a,e),e}),!1}),a.showEditor(o,s[0]),o.find("input").select()},finalizeOrder:function(e){var t=!1===e.picklistDone,i=!0;e.funcs.forEach(function(e){"problem"===e.status&&(t=!0),"finished"!==e.status&&(i=!1)}),t?(e.status="problem",e.finishedAt=new Date):i?(e.status="finished",e.finishedAt=new Date):(e.status="started",e.finishedAt=null)}},onCommentChange:function(e){this.plan.orders.get(e.id)&&this.$('tbody[data-order="'+e.id+'"] .planning-mrp-lineOrders-comment').html(e.getCommentWithIcon())},onOrdersReset:function(e,t){t.reload||this.scheduleRender()},onPsStatusChanged:function(e){var t=this.$('tbody[data-order="'+e.id+'"]');if(t.length){var n=this.plan.sapOrders.getPsStatus(e.id);t.find(".planning-mrp-list-property-psStatus").attr("title",i("planning","orders:psStatus:"+n)).attr("data-ps-status",n)}},onOrderChanged:function(e){var t=this.$('tbody[data-id="'+e.id+'"]');if(t.length)return e.get("set")!==this.model.set?t.fadeOut("fast",function(){t.remove()}):void t.replaceWith(f({item:e.serializeSet(this.plan,this.whOrders.indexOf(e),this.model.user)}))}})});