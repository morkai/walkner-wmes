define(["underscore","jquery","app/i18n","app/viewport","app/user","app/core/View","app/paintShop/PaintShopEventCollection","app/paintShop/templates/orderDetails","app/paintShop/templates/orderChanges","app/paintShop/templates/orderChange","app/paintShop/templates/queueOrder","app/paintShop/templates/whOrders"],function(e,i,t,s,n,r,o,h,a,d,l,c){"use strict";return r.extend({template:h,dialogClassName:"paintShop-orderDetails-dialog",events:{"keydown .form-control":function(e){if("Enter"===e.key)return this.$(e.currentTarget).next().click(),!1},"focus [data-vkb]":function(e){this.vkb&&(clearTimeout(this.timers.hideVkb),this.vkb.show(e.currentTarget)&&(this.vkb.$el.css({top:"auto",bottom:"30px"}),this.resizeChanges()))},"blur [data-vkb]":"scheduleHideVkb","click .btn[data-action]":function(e){this.handleAction(e.currentTarget.dataset)}},initialize:function(){this.vkb=this.options.vkb,this.psEvents=o.forOrder(this.model.id),this.listenTo(this.orders,"change",this.onChange),this.orders.whOrders&&(this.listenTo(this.orders.whOrders,"reset",this.onWhOrdersReset),this.listenTo(this.orders.whOrders,"change",this.onWhOrdersChange)),this.vkb&&this.listenTo(this.vkb,"keyFocused",this.onVkbFocused),i(window).on("resize."+this.idPrefix,this.onWindowResize.bind(this))},destroy:function(){i(window).off("."+this.idPrefix),this.vkb&&this.vkb.hide(),this.$changes&&(this.$changes.remove(),this.$changes=null)},closeDialog:function(){},getTemplateData:function(){var e=this.model.serialize();return{order:e,fillerHeight:this.calcFillerHeight(),renderQueueOrder:l,renderWhOrders:c,canAct:this.canAct(),mrpDropped:this.dropZones.getState(e.mrp),getChildOrderDropZoneClass:this.orders.getChildOrderDropZoneClass.bind(this.orders)}},canAct:function(){var e=this.options.embedded,i=n.isAllowedTo("LOCAL"),t=!!this.orders.user,s=n.isAllowedTo("PAINT_SHOP:PAINTER"),r=n.isAllowedTo("PAINT_SHOP:MANAGE");return e&&i&&t||s||r},beforeRender:function(){this.$changes&&(this.$changes.remove(),this.$changes=null)},afterRender:function(){0===this.options.height&&(this.options.height=this.$("tbody")[0].clientHeight,this.resizeFiller()),this.renderChanges(),this.reloadChanges(),this.toggleActions()},renderChanges:function(){var e=this,t=i(a({canAct:e.canAct()}));t.find(".paintShop-orderChanges-comment").on("focus",function(){e.options.vkb&&(clearTimeout(e.timers.hideVkb),e.options.vkb.show(this),e.resizeChanges())}).on("blur",function(){e.options.vkb&&e.scheduleHideVkb()}),t.find(".btn-primary").on("click",function(){e.handleAction({action:"comment"})}),t.appendTo(this.$el.parent()),this.$changes=t,this.resizeChanges()},reloadChanges:function(){var e=this;e.promised(e.psEvents.fetch({reset:!0})).done(function(){var i=e.psEvents.map(function(e){return d({change:e.serialize()})});e.$changes.find(".paintShop-orderChanges-changes").html(i).prop("scrollTop",99999)})},toggleActions:function(){var i=e.some(this.model.serialize().childOrders,function(e){return e.drilling&&"finished"!==e.drilling});this.$('.btn[data-action="start"]').prop("disabled",i)},scheduleHideVkb:function(){clearTimeout(this.timers.hideVkb),this.timers.hideVkb=setTimeout(this.hideVkb.bind(this),250)},hideVkb:function(){clearTimeout(this.timers.hideVkb),this.vkb&&(this.vkb.hide(),this.resizeChanges())},resizeChanges:function(){this.$changes.css("height",this.calcChangesHeight()+"px").find(".paintShop-orderChanges-changes").prop("scrollTop",99999)},resizeFiller:function(){this.$id("filler").css("height",this.calcFillerHeight()+"px")},calcFillerHeight:function(){var e=window.innerHeight-60-25-75-this.options.height-24-25*this.model.serialize().whOrders.length;return Math.max(e,0)},calcChangesHeight:function(){var e=this.vkb?this.vkb.$el.outerHeight():0;return e||(e=-30),Math.max(window.innerHeight-2-60-30-e,0)},handleAction:function(e){var i=this,t=e.action,n=i.$changes.find(".paintShop-orderChanges-comment"),r=n.val().trim(),o={qtyDone:parseInt(i.$id("qtyDone").val(),10),qtyDlv:parseInt(i.$id("qtyDlv").val(),10),cabin:parseInt(e.cabin,10)||void 0};if("comment"!==t||r){var h=i.$(".btn").prop("disabled",!0);i.act(t,r,o).fail(function(){h.prop("disabled",!1)}).done(function(){"comment"===t?(n.val(""),h.prop("disabled",!1)):i.closeDialog()})}else s.closeDialog()},act:function(i,n,r){var o=e.assign({action:i,orderId:this.model.id,comment:n},r);return this.orders.act(o,function(e){if(e)return s.msg.show({type:"error",time:3e3,text:t("paintShop","MSG:"+i+":failure")})})},onChange:function(e,i){if(e===this.model){var t=this.renderPartialHtml(l,{order:e.serialize(),visible:!0,first:!1,last:!1,commentVisible:!1,rowSpan:"rowSpanDetails",mrpDropped:this.dropZones.getState(e.get("mrp")),getChildOrderDropZoneClass:this.orders.getChildOrderDropZoneClass.bind(this.orders),details:!0});this.$(".paintShop-order").replaceWith(t),i.drilling||i.wh||this.reloadChanges(),this.toggleActions()}},onVkbFocused:function(){clearTimeout(this.timers.hideVkb)},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e)},onWindowResize:function(){this.resizeFiller(),this.resizeChanges()},onWhOrdersReset:function(){this.renderWhOrders(),this.resizeFiller()},onWhOrdersChange:function(e){e.get("order")===this.model.get("order")&&this.renderWhOrders()},renderWhOrders:function(){var e=this.renderPartialHtml(c,{order:this.model.serialize()});this.$id("whOrders").html(e)}})});