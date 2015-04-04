// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/core/View","../util/orderPickerHelpers","app/production/templates/newOrderPicker"],function(e,r,t,i,o){"use strict";return t.extend({template:o,dialogClassName:function(){var e="production-modal production-newOrderPickerDialog";return this.options.correctingOrder?e+=" is-correcting":this.model.hasOrder()&&(e+=" is-replacing"),e},localTopics:{"socket.connected":"render","socket.disconnected":"render"},events:{"keypress .select2-container":function(e){13===e.which&&(this.$el.submit(),e.preventDefault())},submit:function(e){e.preventDefault();var r=this.$("button[type=submit]")[0];r.disabled||(r.disabled=!0,this.socket.isConnected()?this.handleOnlinePick(r):this.handleOfflinePick(r))}},serialize:function(){return{idPrefix:this.idPrefix,offline:!this.socket.isConnected(),replacingOrder:!this.options.correctingOrder&&this.model.hasOrder(),correctingOrder:!!this.options.correctingOrder,quantityDone:this.model.prodShiftOrder.get("quantityDone")||0,workerCount:this.model.prodShiftOrder.getWorkerCountForEdit(),orderIdType:this.model.getOrderIdType(),maxQuantityDone:this.model.prodShiftOrder.getMaxQuantityDone(),maxWorkerCount:this.model.prodShiftOrder.getMaxWorkerCount()}},afterRender:function(){this.socket.isConnected()?(this.setUpOrderSelect2(),this.setUpOperationSelect2(),this.options.correctingOrder&&this.selectCurrentOrder()):this.options.correctingOrder&&(this.$id("order").val(this.model.prodShiftOrder.get("orderId")),this.$id("operation").val(this.model.prodShiftOrder.get("operationNo"))),this.focusFirstInput()},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e),this.focusFirstInput()},closeDialog:function(){},focusFirstInput:function(){!this.options.correctingOrder&&this.model.hasOrder()?this.$id("quantityDone").select():this.socket.isConnected()?this.$id("order").select2("focus"):this.$id("order").select()},setUpOrderSelect2:function(){i.setUpOrderSelect2(this.$id("order"),this.$id("operation"),this.model,{dropdownCssClass:"production-dropdown"})},setUpOperationSelect2:function(){i.setUpOperationSelect2(this.$id("operation"),[],{dropdownCssClass:"production-dropdown"})},selectCurrentOrder:function(){i.selectOrder(this.$id("order"),this.model.prodShiftOrder)},handleOnlinePick:function(t){var o=this.$id("order").select2("data"),n=this.$id("operation"),s=n.hasClass("form-control")?n.val():this.$id("operation").select2("val");return o?s?(o.sameOrder?o=this.model.prodShiftOrder.get("orderData"):i.prepareOrderInfo(this.model,o),void this.pickOrder(o,s)):(n.focus(),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:e("production","newOrderPicker:msg:emptyOperation")})):(this.$id("order").select2("focus"),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:e("production","newOrderPicker:msg:emptyOrder")}))},handleOfflinePick:function(t){var i=this.model.getOrderIdType(),o={no:null,nc12:null},n=this.$id("order").val().trim().replace(/[^a-zA-Z0-9]+/g,""),s=this.$id("operation").val().trim().replace(/[^0-9]+/g,"");if("no"===i&&/^[0-9]{9,}$/.test(n))o.no=n;else{if("nc12"!==i||!(12===n.length||n.length<9&&/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(n)))return this.$id("order").select(),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:e("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOrderId:"+i)});o.nc12=n}return/^[0-9]{1,4}$/.test(s)?void this.pickOrder(o,s):(this.$id("operation").select(),t.disabled=!1,r.msg.show({type:"error",time:2e3,text:e("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOperationNo")}))},pickOrder:function(e,r){for(;r.length<4;)r="0"+r;!this.options.correctingOrder&&this.model.hasOrder()&&(this.model.changeQuantityDone(this.parseInt("quantityDone")),this.model.changeWorkerCount(this.parseInt("workerCount"))),this.options.correctingOrder?this.model.correctOrder(e,r):this.model.changeOrder(e,r),this.closeDialog()},parseInt:function(e){var r=parseInt(this.$id(e).val(),10);return isNaN(r)||0>r?0:r}})});