define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/production/templates/newOrderPicker"],function(e,r,t,i,o,n){return o.extend({template:n,dialogClassName:function(){var e="production-modal production-newOrderPickerDialog";return this.options.correctingOrder?e+=" is-correcting":this.model.hasOrder()&&(e+=" is-replacing"),e},localTopics:{"socket.connected":"render","socket.disconnected":"render"},events:{"keypress .select2-container":function(e){13===e.which&&(this.$el.submit(),e.preventDefault())},submit:function(e){e.preventDefault();var r=this.$("button[type=submit]")[0];r.disabled||(r.disabled=!0,this.socket.isConnected()?this.handleOnlinePick(r):this.handleOfflinePick(r))}},initialize:function(){this.idPrefix=e.uniqueId("newOrderPicker")},destroy:function(){this.$id("order").select2("destroy"),this.$id("operation").select2("destroy")},serialize:function(){return{idPrefix:this.idPrefix,offline:!this.socket.isConnected(),replacingOrder:!this.options.correctingOrder&&this.model.hasOrder(),correctingOrder:!!this.options.correctingOrder,quantityDone:this.model.prodShiftOrder.get("quantityDone")||0,workerCount:this.model.prodShiftOrder.getWorkerCountForEdit(),orderIdType:this.model.getOrderIdType(),maxQuantityDone:this.model.prodShiftOrder.getMaxQuantityDone(),maxWorkerCount:this.model.prodShiftOrder.getMaxWorkerCount()}},afterRender:function(){this.socket.isConnected()?(this.setUpOrderSelect2(),this.setUpOperationSelect2(),this.options.correctingOrder&&this.selectCurrentOrder()):this.options.correctingOrder&&(this.$id("order").val(this.model.prodShiftOrder.get("orderId")),this.$id("operation").val(this.model.prodShiftOrder.get("operationNo"))),this.focusFirstInput()},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e),this.focusFirstInput()},closeDialog:function(){},focusFirstInput:function(){!this.options.correctingOrder&&this.model.hasOrder()?this.$id("quantityDone").select():this.socket.isConnected()?this.$id("order").select2("focus"):this.$id("order").select()},setUpOrderSelect2:function(){function o(e){return-1!==e.laborTime}var n=this,d=this.$id("order").removeClass("form-control");d.select2({dropdownCssClass:"production-dropdown",openOnEnter:null,allowClear:!0,minimumInputLength:6,ajax:{cache:!0,quietMillis:500,url:this.getOrdersUrl.bind(this),results:function(e){return{results:(Array.isArray(e)?e:[]).map(function(e){return e.id=e._id,e.text=e._id+" - "+(e.name||"?"),e})}},transport:function(e){return r.ajax.apply(r,arguments).fail(function(){i.msg.show({type:"error",time:2e3,text:t("production","newOrderPicker:msg:searchFailure")}),e.success({collection:[]})})}}}),d.on("change",function(r){var t;t=Array.isArray(r.operations)?r.operations.filter(o):r.added&&Array.isArray(r.added.operations)?r.added.operations.filter(o):[];var i=n.setUpOperationSelect2(t.map(function(e){return{id:e.no,text:e.no+" - "+e.name}}));t.length?i.select2("val",r.selectedOperationNo||t[0].no).select2("focus"):e.defer(function(){d.select2("focus")})})},getOrdersUrl:function(e){var r=this.model.getOrderIdType();return this.$id("order").attr("data-type",r),"/production/orders?"+r+"="+encodeURIComponent(e)},setUpOperationSelect2:function(e){var r=this.$id("operation").attr("placeholder",null).removeClass("form-control");return r.select2({width:"100%",dropdownCssClass:"production-dropdown",placeholder:t("production","newOrderPicker:online:operation:placeholder"),openOnEnter:null,allowClear:!1,data:e||[]}),r},selectCurrentOrder:function(){var r=this.model.prodShiftOrder.get("orderId"),t=this.model.prodShiftOrder.get("orderData"),i=this.$id("order");i.select2("data",{id:r,text:r+" - "+(t.name||"?"),sameOrder:!0}),i.trigger({type:"change",operations:e.values(t.operations),selectedOperationNo:this.model.prodShiftOrder.get("operationNo")})},handleOnlinePick:function(e){var r=this.$id("order").select2("data"),o=this.$id("operation").select2("val");return r?o?(r.sameOrder?r=this.model.prodShiftOrder.get("orderData"):(delete r.__v,delete r.id,delete r.text,/^114[0-9]{6}$/.test(r._id)?r.no=r._id:(r.no=null,r.nc12=r._id),delete r._id),void this.pickOrder(r,o)):(this.$id("order").select2("focus"),e.disabled=!1,i.msg.show({type:"error",time:2e3,text:t("production","newOrderPicker:msg:emptyOperation")})):(this.$id("order").select2("focus"),e.disabled=!1,i.msg.show({type:"error",time:2e3,text:t("production","newOrderPicker:msg:emptyOrder")}))},handleOfflinePick:function(e){var r=this.model.getOrderIdType(),o={no:null,nc12:null},n=this.$id("order").val().trim().replace(/[^a-zA-Z0-9]+/g,""),d=this.$id("operation").val().trim().replace(/[^0-9]+/g,"");if("no"===r&&/^114[0-9]{6}$/.test(n))o.no=n;else{if("nc12"!==r||!(12===n.length||n.length<9&&/^[a-zA-Z]+[a-zA-Z0-9]*$/.test(n)))return this.$id("order").select(),e.disabled=!1,i.msg.show({type:"error",time:2e3,text:t("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOrderId:"+r)});o.nc12=n}if(!/^[0-9]{1,4}$/.test(d))return this.$id("operation").select(),e.disabled=!1,i.msg.show({type:"error",time:2e3,text:t("production",""===n?"newOrderPicker:msg:emptyOrder":"newOrderPicker:msg:invalidOperationNo")});for(;d.length<4;)d="0"+d;this.pickOrder(o,d)},pickOrder:function(e,r){!this.options.correctingOrder&&this.model.hasOrder()&&(this.model.changeQuantityDone(this.parseInt("quantityDone")),this.model.changeWorkerCount(this.parseInt("workerCount"))),this.options.correctingOrder?this.model.correctOrder(e,r):this.model.changeOrder(e,r),this.closeDialog()},parseInt:function(e){var r=parseInt(this.$id(e).val(),10);return isNaN(r)||0>r?0:r}})});