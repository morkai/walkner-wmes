define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/orders/util/resolveProductName","../util/orderPickerHelpers","../util/limitQuantityDone","app/production/templates/newOrderPicker"],function(e,t,i,r,o,n,s,d,a){"use strict";return o.extend({template:a,dialogClassName:function(){var e="production-modal production-newOrderPickerDialog";return this.options.correctingOrder?e+=" is-correcting":this.model.hasOrder()&&(e+=" is-replacing"),e},localTopics:{"socket.connected":"render","socket.disconnected":"render"},events:{"focus [data-vkb]":function(e){this.options.embedded&&this.options.vkb&&this.options.vkb.show(e.target,this.onVkbValueChange)},"focus #-spigot-nc12":function(){this.options.embedded&&this.options.vkb&&this.options.vkb.hide()},"click .btn[data-operation]":function(e){e.currentTarget.classList.contains("active")||(this.$(".active[data-operation]").removeClass("active"),e.currentTarget.classList.add("active"),this.updateNewWorkerCount())},"input #-order":function(e){this.options.embedded&&this.onVkbValueChange(e.target)},'input input[type="text"][max]':"checkMinMaxValidity",'blur input[type="text"][max]':"checkMinMaxValidity","keypress .select2-container":function(e){if(13===e.which)return this.$el.submit(),!1},submit:function(e){e.preventDefault();var t=this.$id("submit")[0];if(!t.disabled){t.disabled=!0;var r=this.$id("spigot-nc12");if(r.length){var o=r.val().match(/([0-9]{12})/),n=o?o[1]:"";if(!n.length||!this.model.checkSpigot(null,n))return r[0].setCustomValidity(i("production","newOrderPicker:spigot:invalid")),void(this.timers.submit=setTimeout(function(){t.disabled=!1,t.click()},1,this))}if(this.ft.checkCredentials)return this.ft.checkCredentials();this.socket.isConnected()?this.options.embedded?this.handleEmbeddedPick(t):this.handleOnlinePick(t):this.handleOfflinePick(t)}}},initialize:function(){this.onVkbValueChange=this.onVkbValueChange.bind(this),this.lastKeyPressAt=0,this.lastPhrase="",this.lastOrders=[],this.searchReq=null,this.options.correctingOrder&&this.lastOrders.push(this.model.prodShiftOrder.get("orderData")),this.listenTo(this.model.prodShiftOrder,"qtyMaxChanged",this.limitQuantityDone),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){t(window).off("."+this.idPrefix),this.options.vkb&&this.options.vkb.hide()},serialize:function(){var e=this.model,t=e.prodShiftOrder,r=e.getOrderIdType(),o=!this.options.correctingOrder&&e.hasOrder(),n=!!this.options.correctingOrder,s=o?":replacing":n?":correcting":"";return{idPrefix:this.idPrefix,embedded:this.options.embedded,spigot:e.settings.getValue("spigotFinish")&&!!t.get("spigot"),offline:!this.socket.isConnected(),replacingOrder:o,correctingOrder:n,quantityDone:t.get("quantityDone")||0,workerCount:t.getWorkerCountForEdit(),orderIdType:r,maxQuantityDone:t.getMaxQuantityDone(),maxWorkerCount:t.getMaxWorkerCount(),orderPlaceholder:this.options.embedded?"no"===r?"000000000":"000000000000":i("production","newOrderPicker:order:placeholder:"+r),orderMaxLength:"no"===r?9:12,operationPlaceholder:this.options.embedded?"0000":i("production","newOrderPicker:operation:placeholder"),submitLabel:i("production","newOrderPicker:submit"+s)}},afterRender:function(){this.socket.isConnected()?(this.setUpOrderSelect2(),this.setUpOperationSelect2(),this.options.correctingOrder?this.selectCurrentOrder():this.options.order?(this.selectSpecifiedOrder(),this.limitQuantityDone()):(this.selectNextOrder(),this.limitQuantityDone())):this.options.correctingOrder&&(this.$id("order").val(this.model.prodShiftOrder.get("orderId")),this.$id("operation").val(this.model.prodShiftOrder.get("operationNo"))),this.focusFirstInput()},limitQuantityDone:function(){d(this,this.model.prodShiftOrder)},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e),this.focusFirstInput()},closeDialog:function(){},focusFirstInput:function(){var e=this.$id("spigot-nc12");e.length?e.focus():!this.options.correctingOrder&&this.model.hasOrder()?this.$id("quantityDone").select():!this.options.embedded&&this.socket.isConnected()?this.$id("order").select2("focus"):this.$id("order").select()},setUpOrderSelect2:function(){if(!this.options.embedded)return s.setUpOrderSelect2(this.$id("order"),this.$id("operation"),this.model,{dropdownCssClass:"production-dropdown"})},setUpOperationSelect2:function(){if(!this.options.embedded)return s.setUpOperationSelect2(this.$id("operation"),[],{dropdownCssClass:"production-dropdown"})},selectCurrentOrder:function(){if(this.options.embedded){var e=this.model.prodShiftOrder;this.$id("order").val(e.get("orderId")),this.$id("operationGroup").find("div").html(this.buildOrderOperationList(e.get("orderData"),e.get("operationNo")))}else s.selectOrder(this.$id("order"),this.model.prodShiftOrder)},selectNextOrder:function(){var t=this.model.get("nextOrder");if(!e.isEmpty(t)){var i=t[0],r=i.order,o=this.$id("order");if(this.options.embedded)return this.lastOrders=[r],o.val(r.no||r.nc12),this.$id("operationGroup").find("div").html(this.buildOrderOperationList(r,i.operationNo)),void this.updateNewWorkerCount(i.workerCount);o.select2("data",e.assign({},r,{id:r.no,text:r.no+" - "+(n(r)||"?"),sameOrder:!1})),o.trigger({type:"change",operations:e.values(r.operations),selectedOperationNo:i.operationNo})}},selectSpecifiedOrder:function(){var e=this,t=e.options.order;t&&(e.$id("order").val(t.orderId),this.handleOrderChange(function(){e.$id("operationGroup").find('[data-operation="'+t.operationNo+'"]').click(),e.$id("newWorkerCount").val(t.workerCount)}))},handleEmbeddedPick:function(t){var o=this.$id("order").val(),n=this.lastOrders[0];if(!o||!n||o!==(n._id||n.no))return this.$id("order").select2("focus"),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:i("production","newOrderPicker:msg:emptyOrder")});var d=this.$id("operationGroup").find(".active").first().attr("data-operation")||"0000",a=e.clone(n);s.prepareOrderInfo(this.model,a),this.pickOrder(a,d)},handleOnlinePick:function(e){var t=this.$id("order").select2("data"),o=this.$id("operation"),n=o.hasClass("form-control")?o.val():this.$id("operation").select2("val");return t?n?(t.sameOrder?t=this.model.prodShiftOrder.get("orderData"):s.prepareOrderInfo(this.model,t),void this.pickOrder(t,n)):(o.focus(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:i("production","newOrderPicker:msg:emptyOperation")})):(this.$id("order").select2("focus"),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:i("production","newOrderPicker:msg:emptyOrder")}))},handleOfflinePick:function(e){var t=this.model.getOrderIdType(),o={no:null,nc12:null},n=this.$id("order").val().trim().replace(/[^a-zA-Z0-9]+/g,""),s=this.$id("operation").val().trim().replace(/[^0-9]+/g,"");if("no"===t&&/^[0-9]{9,}$/.test(n))o.no=n;else{if("nc12"!==t||!(12===n.length||n.length<9&&/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(n)))return this.$id("order").select(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:i("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOrderId:"+t)});o.nc12=n}if(!/^[0-9]{1,4}$/.test(s))return this.$id("operation").select(),e.disabled=!1,r.msg.show({type:"error",time:2e3,text:i("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOperationNo")});this.pickOrder(o,s)},pickOrder:function(e,t){for(;t.length<4;)t="0"+t;!this.options.correctingOrder&&this.model.hasOrder()&&(this.model.changeQuantityDone(this.parseInt("quantityDone")),this.model.changeWorkerCount(this.parseInt("workerCount"))),this.options.correctingOrder?this.model.correctOrder(e,t):this.model.changeOrder(e,t,parseInt(this.$id("newWorkerCount").val(),10)),this.closeDialog()},parseInt:function(e){var t=parseInt(this.$id(e).val(),10);return isNaN(t)||t<0?0:t},isIgnoredTarget:function(e){return"number"===e.type||-1!==e.className.indexOf("select2")||"1"===e.dataset.ignoreKey},onKeyDown:function(e){if(8===e.keyCode&&!this.isIgnoredTarget(e.target)){this.lastKeyPressAt=Date.now();var t=this.$id("spigot-nc12");return t.length&&t.val("")[0].setCustomValidity(""),!1}},onKeyPress:function(e){var t=this.$id("spigot-nc12");if(t.length){var i=e.target,r=e.keyCode;if(13===r)return t[0]!==i;if(!(r<32||r>126||this.isIgnoredTarget(i))){var o=Date.now(),n=o-this.lastKeyPressAt>333?"":t.val(),s=String.fromCharCode(r);return t.val(n+s)[0].setCustomValidity(""),t.focus(),this.lastKeyPressAt=o,!1}}},onVkbValueChange:function(e){this.socket.isConnected()&&e===this.$id("order")[0]&&this.handleOrderChange()},handleOrderChange:function(t){t||(t=e.noop);var i=this.$id("order").val().replace(/[^0-9]+/g,""),r=this.$id("operationGroup"),o=this.buildOperationList(i,t);o.length?t():o='<p><i class="fa fa-spinner fa-spin"></i></p>';var n=r.find("div").html(o).find(".active");n.length&&n[0].scrollIntoView(),this.options.vkb&&this.options.vkb.reposition()},buildOperationList:function(e,t){var r=this;return 9!==e.length?(t(),"<p>"+i("production","newOrderPicker:order:tooShort")+"</p>"):(r.searchReq&&r.searchReq.abort(),r.searchReq=this.ajax({url:"/production/orders?"+this.model.getOrderIdType()+"="+e}),r.searchReq.fail(function(){r.$(".fa-spin").removeClass("fa-spin")}),r.searchReq.done(function(e){r.lastOrders=e||[];var t="";t=r.lastOrders.length?r.buildOrderOperationList(r.lastOrders[0]):"<p>"+i("production","newOrderPicker:order:notFound")+"</p>";var o=r.$id("operationGroup").find("div").html(t).find(".active");o.length&&o[0].scrollIntoView(),r.updateNewWorkerCount(),r.options.vkb&&r.options.vkb.reposition()}),r.searchReq.always(function(){r.searchReq=null,t()}),r.lastPhrase=e,"")},buildOrderOperationList:function(t,r){var o="";return r||(r=s.getBestDefaultOperationNo(t.operations)),e.forEach(s.prepareOperations(t.operations),function(t){var i="btn btn-lg btn-default "+(t.no===r?"active":"");o+='<button type="button" class="'+i+'" data-operation="'+t.no+'"><em>'+e.escape(t.no)+"</em><span>"+e.escape(t.name||"?")+"</span></button>"}),o.length?o:"<p>"+i("production","newOrderPicker:order:notFound")+"</p>"},updateNewWorkerCount:function(t){var i=this.$id("newWorkerCount").val("");if(i.length)if(t>0)i.val(t.toString());else{var r=this.$id("order").val(),o=this.$id("operationGroup").find(".active").attr("data-operation"),n=e.findWhere(this.lastOrders,{_id:r})||e.findWhere(this.lastOrders,{no:r});if(n){var s=e.findWhere(n.operations,{no:o});!s||s.laborTime<=0||s.machineTime<=0||i.val(Math.max(Math.round(s.laborTime/s.machineTime),1))}}},checkMinMaxValidity:function(e){var t=e.target,r=parseInt(t.value,10)||0,o=parseInt(t.getAttribute("min"),10)||0,n=parseInt(t.getAttribute("max"),10),s="";r<o?s=i("production","error:min",{min:o}):r>n&&(s=i("production","error:max",{max:n})),t.setCustomValidity(s)}})});