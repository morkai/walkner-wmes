define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/orders/util/resolveProductName","../util/orderPickerHelpers","../util/limitQuantityDone","app/production/templates/newOrderPicker"],function(e,t,i,r,o,n,s,d,a){"use strict";return o.extend({template:a,dialogClassName:function(){var e="production-modal production-newOrderPickerDialog";return this.options.correctingOrder?e+=" is-correcting":this.model.hasOrder()&&(e+=" is-replacing"),e},localTopics:{"socket.connected":"render","socket.disconnected":"render"},remoteTopics:function(){var e={};return e["production.spigotCheck.scanned."+this.model.prodLine.id]="onSpigotScanned",e},events:{"focus [data-vkb]":function(e){this.options.embedded&&this.options.vkb&&this.options.vkb.show(e.target,this.onVkbValueChange)},"focus #-spigot-nc12":function(){this.options.embedded&&this.options.vkb&&this.options.vkb.hide()},"click .btn[data-operation]":function(e){e.currentTarget.classList.contains("active")||(this.$(".active[data-operation]").removeClass("active"),e.currentTarget.classList.add("active"),this.updateNewWorkerCount())},"input #-order":function(e){this.options.embedded&&this.onVkbValueChange(e.target)},'input input[type="text"][max]':"checkMinMaxValidity",'blur input[type="text"][max]':"checkMinMaxValidity","keypress .select2-container":function(e){if(13===e.which)return this.$el.submit(),!1},submit:function(e){e.preventDefault();var t=this.$id("submit")[0];if(!t.disabled){t.disabled=!0;var i=this.$id("spigot-nc12");if(i.length){var r=i.val().match(/([0-9]{12})/),o=r?r[1]:"";if(!o.length||!this.model.checkSpigot(null,o))return i[0].setCustomValidity(this.t("newOrderPicker:spigot:invalid")),void(this.timers.submit=setTimeout(function(){t.disabled=!1,t.click()},1,this))}if(this.ft&&this.ft.checkCredentials)return this.ft.checkCredentials();this.socket.isConnected()?this.options.embedded?this.handleEmbeddedPick(t):this.handleOnlinePick(t):this.handleOfflinePick(t)}}},initialize:function(){this.onVkbValueChange=this.onVkbValueChange.bind(this),this.lastKeyPressAt=0,this.lastPhrase="",this.lastOrders=[],this.searchReq=null,this.options.correctingOrder&&this.lastOrders.push(this.model.prodShiftOrder.get("orderData")),this.listenTo(this.model.prodShiftOrder,"qtyMaxChanged",this.limitQuantityDone),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){t(window).off("."+this.idPrefix),this.options.vkb&&this.options.vkb.hide(),this.$id("spigot-nc12").length&&this.pubsub.publish("production.spigotCheck.aborted."+this.model.prodLine.id,{prodLineId:this.model.prodLine.id})},getTemplateData:function(){var e=this.model,t=e.prodShiftOrder,i=e.getOrderIdType(),r=!this.options.correctingOrder&&e.hasOrder(),o=!!this.options.correctingOrder,n=r?":replacing":o?":correcting":"";return{embedded:this.options.embedded,spigot:e.settings.getValue("spigotFinish")&&!!t.get("spigot"),offline:!this.socket.isConnected(),replacingOrder:r,correctingOrder:o,quantityDone:t.get("quantityDone")||0,workerCount:t.getWorkerCountForEdit(),orderIdType:i,maxQuantityDone:t.getMaxQuantityDone(),maxWorkerCount:t.getMaxWorkerCount(),orderPlaceholder:this.options.embedded?"no"===i?"000000000":"000000000000":this.t("newOrderPicker:order:placeholder:"+i),orderMaxLength:"no"===i?9:12,operationPlaceholder:this.options.embedded?"0000":this.t("newOrderPicker:operation:placeholder"),submitLabel:this.t("newOrderPicker:submit"+n)}},afterRender:function(){this.socket.isConnected()?(this.setUpOrderSelect2(),this.setUpOperationSelect2(),this.options.correctingOrder?this.selectCurrentOrder():this.options.order?(this.selectSpecifiedOrder(),this.limitQuantityDone()):(this.selectNextOrder(),this.limitQuantityDone())):this.options.correctingOrder&&(this.$id("order").val(this.model.prodShiftOrder.get("orderId")),this.$id("operation").val(this.model.prodShiftOrder.get("operationNo"))),this.notifySpigotCheckRequest(),this.model.isTaktTimeEnabled()&&this.$id("quantityDone").prop("disabled",!0)},notifySpigotCheckRequest:function(){this.$id("spigot-nc12").length&&(clearTimeout(this.timers.notifySpigotCheckRequest),this.timers.notifySpigotCheckRequest=setTimeout(this.notifySpigotCheckRequest.bind(this),5e3),this.pubsub.publish("production.spigotCheck.requested."+this.model.prodLine.id,{prodLine:this.model.prodLine.id,component:this.model.prodShiftOrder.get("spigot").component,orderNo:this.model.prodShiftOrder.get("orderId"),source:"newOrder"}))},onSpigotScanned:function(e){var t=this.$id("spigot-nc12").val(e.nc12);if(t.length){t[0].setCustomValidity("");var i=this.model.prodLine.id,r=this.model.prodShiftOrder,o=r.get("spigot");o&&(this.model.checkSpigotValidity(e.nc12,o.component.nc12)?this.pubsub.publish("production.spigotCheck.success."+i,{prodLine:i,component:o.component,orderNo:r.get("orderId"),input:e.nc12,nc12:o.component.nc12,source:"newOrder"}):this.pubsub.publish("production.spigotCheck.failure."+i,{prodLine:i,component:o.component,orderNo:r.get("orderId"),input:e.nc12,source:"newOrder"}))}},limitQuantityDone:function(){d(this,this.model.prodShiftOrder)},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e),this.focusFirstInput()},closeDialog:function(){},focusFirstInput:function(){this.$id("spigot-nc12").length?this.$id("spigot-nc12").focus():!this.options.embedded&&this.socket.isConnected()?this.$id("order").select2("focus"):this.$id("order").select()},setUpOrderSelect2:function(){if(!this.options.embedded)return s.setUpOrderSelect2(this.$id("order"),this.$id("operation"),this.model,{dropdownCssClass:"production-dropdown"})},setUpOperationSelect2:function(){if(!this.options.embedded)return s.setUpOperationSelect2(this.$id("operation"),[],{dropdownCssClass:"production-dropdown"})},selectCurrentOrder:function(){if(this.options.embedded){var e=this.model.prodShiftOrder;this.$id("order").val(e.get("orderId")),this.$id("operationGroup").find("div").html(this.buildOrderOperationList(e.get("orderData"),e.get("operationNo")))}else s.selectOrder(this.$id("order"),this.model.prodShiftOrder)},selectNextOrder:function(){var t=this.model.get("nextOrder");if(!e.isEmpty(t)){var i=t[0],r=i.order;if(r&&r.no){var o=this.$id("order");if(this.options.embedded)return this.lastOrders=[r],o.val(r.no||r.nc12),this.$id("operationGroup").find("div").html(this.buildOrderOperationList(r,i.operationNo)),void this.updateNewWorkerCount(i.workerCount);o.select2("data",e.assign({},r,{id:r.no,text:r.no+" - "+(n(r)||"?"),sameOrder:!1})),o.trigger({type:"change",operations:e.values(r.operations),selectedOperationNo:i.operationNo})}else window.WMES_LOG_BROWSER_ERROR&&window.WMES_LOG_BROWSER_ERROR("Invalid nextOrder!?! "+JSON.stringify(t))}},selectSpecifiedOrder:function(){var e=this,t=e.options.order;t&&(e.$id("order").val(t.orderId),this.handleOrderChange(function(){e.$id("operationGroup").find('[data-operation="'+t.operationNo+'"]').click(),e.$id("newWorkerCount").val(t.workerCount)}))},handleEmbeddedPick:function(t){var i=this.$id("order").val(),o=this.lastOrders[0];if(!i||!o||i!==(o._id||o.no))return this.$id("order").select2("focus"),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:this.t("newOrderPicker:msg:emptyOrder")});var n=this.$id("operationGroup").find(".active").first().attr("data-operation")||"0000",d=e.clone(o);s.prepareOrderInfo(this.model,d),this.pickOrder(d,n)},handleOnlinePick:function(e){var t=this.$id("order").select2("data"),i=this.$id("operation"),o=i.hasClass("form-control")?i.val():this.$id("operation").select2("val");return t?o?(t.sameOrder?t=this.model.prodShiftOrder.get("orderData"):s.prepareOrderInfo(this.model,t),void this.pickOrder(t,o)):(i.focus(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:this.t("newOrderPicker:msg:emptyOperation")})):(this.$id("order").select2("focus"),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:this.t("newOrderPicker:msg:emptyOrder")}))},handleOfflinePick:function(e){var t=this.model.getOrderIdType(),i={no:null,nc12:null},o=this.$id("order").val().trim().replace(/[^a-zA-Z0-9]+/g,""),n=this.$id("operation").val().trim().replace(/[^0-9]+/g,"");if("no"===t&&/^[0-9]{9,}$/.test(o))i.no=o;else{if("nc12"!==t||!(12===o.length||o.length<9&&/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(o)))return this.$id("order").select(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:this.t(""===o?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOrderId:"+t)});i.nc12=o}if(!/^[0-9]{1,4}$/.test(n))return this.$id("operation").select(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:this.t(""===o?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOperationNo")});this.pickOrder(i,n)},pickOrder:function(t,i){for(;i.length<4;)i="0"+i;var o=t.statuses;if(Array.isArray(o)&&o.length&&"development"!==window.ENV){if(e.intersection(o,["TECO","DLT","DLFL"]).length)return this.$id("order").select(),this.$id("submit").prop("disabled",!1),r.msg.show({type:"error",time:2e3,text:this.t("newOrderPicker:msg:orderDeleted")});var n=t.qtyDone&&t.qtyDone.byOperation&&t.qtyDone.byOperation[i]||0,s=t.qtyMax&&t.qtyMax[i]||t.qty;if(s&&n>=s&&e.intersection(o,["CNF","DLV"]).length)return this.$id("order").select(),this.$id("submit").prop("disabled",!1),r.msg.show({type:"error",time:2e3,text:this.t("newOrderPicker:msg:orderCompleted")})}!this.options.correctingOrder&&this.model.hasOrder()&&(this.model.changeQuantityDone(this.parseInt("quantityDone")),this.model.changeWorkerCount(this.parseInt("workerCount"))),this.options.correctingOrder?this.model.correctOrder(t,i):this.model.changeOrder(t,i,parseInt(this.$id("newWorkerCount").val(),10)),this.closeDialog()},parseInt:function(e){var t=parseInt(this.$id(e).val(),10);return isNaN(t)||t<0?0:t},isIgnoredTarget:function(e){return"number"===e.type||-1!==e.className.indexOf("select2")||"1"===e.dataset.ignoreKey},onKeyDown:function(e){if(8===e.keyCode&&!this.isIgnoredTarget(e.target)){this.lastKeyPressAt=Date.now();var t=this.$id("spigot-nc12");return t.length&&t.val("")[0].setCustomValidity(""),!1}},onKeyPress:function(e){var t=this.$id("spigot-nc12");if(t.length){var i=e.target,r=e.keyCode;if(13===r)return t[0]!==i;if(!(r<32||r>126||this.isIgnoredTarget(i))){var o=Date.now(),n=o-this.lastKeyPressAt>333?"":t.val(),s=String.fromCharCode(r);return t.val(n+s)[0].setCustomValidity(""),t.focus(),this.lastKeyPressAt=o,!1}}},onVkbValueChange:function(e){this.socket.isConnected()&&e===this.$id("order")[0]&&this.handleOrderChange()},handleOrderChange:function(t){t||(t=e.noop);var i=this.$id("order").val().replace(/[^0-9]+/g,""),r=this.$id("operationGroup"),o=this.buildOperationList(i,t);o.length?t():o='<p><i class="fa fa-spinner fa-spin"></i></p>';var n=r.find("div").html(o).find(".active");n.length&&n[0].scrollIntoView(),this.options.vkb&&this.options.vkb.reposition()},buildOperationList:function(e,t){var i=this;return 9!==e.length?(t(),"<p>"+i.t("newOrderPicker:order:tooShort")+"</p>"):(i.searchReq&&i.searchReq.abort(),i.searchReq=i.ajax({url:"/production/orders?"+this.model.getOrderIdType()+"="+e}),i.searchReq.fail(function(){i.$(".fa-spin").removeClass("fa-spin")}),i.searchReq.done(function(e){i.lastOrders=e||[];var t="";t=i.lastOrders.length?i.buildOrderOperationList(i.lastOrders[0]):"<p>"+i.t("newOrderPicker:order:notFound")+"</p>";var r=i.$id("operationGroup").find("div").html(t).find(".active");r.length&&r[0].scrollIntoView(),i.updateNewWorkerCount(),i.options.vkb&&i.options.vkb.reposition()}),i.searchReq.always(function(){i.searchReq=null,t()}),i.lastPhrase=e,"")},buildOrderOperationList:function(t,i){var r="";return i||(i=s.getBestDefaultOperationNo(t.operations)),e.forEach(s.prepareOperations(t.operations),function(t){var o="btn btn-lg btn-default "+(t.no===i?"active":"");r+='<button type="button" class="'+o+'" data-operation="'+t.no+'"><em>'+e.escape(t.no)+"</em><span>"+e.escape(t.name||"?")+"</span></button>"}),r.length?r:"<p>"+this.t("newOrderPicker:order:notFound")+"</p>"},updateNewWorkerCount:function(t){var i=this.$id("newWorkerCount").val("");if(i.length)if(t>0)i.val(t.toString());else{var r=this.$id("order").val(),o=this.$id("operationGroup").find(".active").attr("data-operation"),n=e.findWhere(this.lastOrders,{_id:r})||e.findWhere(this.lastOrders,{no:r});if(n){var s=e.findWhere(n.operations,{no:o});!s||s.laborTime<=0||s.machineTime<=0||i.val(Math.max(Math.round(s.laborTime/s.machineTime),1))}}},checkMinMaxValidity:function(e){var t=e.target,i=parseInt(t.value,10)||0,r=parseInt(t.getAttribute("min"),10)||0,o=parseInt(t.getAttribute("max"),10),n="";i<r?n=this.t("error:min",{min:r}):i>o&&(n=this.t("error:max",{max:o})),t.setCustomValidity(n)}})});