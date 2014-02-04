define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","app/data/prodLog","./NewOrderPickerView","./DowntimePickerView","./EndWorkDialogView","app/production/templates/data","app/production/templates/endDowntimeDialog","app/production/templates/continueOrderDialog"],function(t,e,o,i,n,r,d,s,a,p,c,u,h){return n.extend({template:c,localTopics:{"socket.connected":"fillOrderData"},events:{"click .production-newOrder":"showNewOrderDialog","click .production-continueOrder":"continueOrder","click .production-startDowntime":"showDowntimePickerDialog","click .production-endDowntime":"endDowntime","click .production-endWork":"endWork","click .production-property-quantityDone .btn-link":"showQuantityDoneEditor","click .production-property-workerCount .btn-link":"showWorkerCountEditor"},initialize:function(){this.listenTo(this.model,"locked unlocked",function(){this.updateWorkerCount(),this.updateQuantityDone(),this.toggleActions()}),this.listenTo(this.model,"change:state",this.toggleActions);var t=this.model.prodShiftOrder;this.listenTo(t,"change:_id",this.updateOrderData),this.listenTo(t,"change:orderId",this.updateOrderInfo),this.listenTo(t,"change:quantityDone",this.updateQuantityDone),this.listenTo(t,"change:workerCount",function(){this.updateWorkerCount(),this.updateTaktTime()})},afterRender:function(){this.$actions=this.$(".production-actions"),this.updateOrderData(),this.updateOrderInfo(),this.updateQuantityDone(),this.toggleActions(),this.socket.isConnected()&&this.fillOrderData()},updateOrderInfo:function(){var t=this.model.prodShiftOrder;this.$property("orderNo").text(t.getOrderNo()),this.$property("nc12").text(t.getNc12()),this.$property("productName").text(t.getProductName()),this.$property("operationName").text(t.getOperationName())},updateOrderData:function(){this.toggleOrderDataProperties(),this.updateTaktTime(),this.updateWorkerCount(),this.$property("startedAt").text(this.model.prodShiftOrder.getStartedAt())},toggleOrderDataProperties:function(){this.$(".production-properties-orderData").toggle(this.model.hasOrder())},updateWorkerCount:function(){this.$property("workerCountSap").text(this.model.prodShiftOrder.getWorkerCountSap());var t=this.model.prodShiftOrder.getWorkerCount(),e="";if(this.model.isIdle())e="-";else if(this.model.isLocked())e="number"==typeof t?t:"-";else{var i="property:workerCount:change:noData";t>0&&(i="property:workerCount:change:data",e+=t+" "),e+='<button class="btn btn-link">'+o("production",i)+"</button>"}this.$property("workerCount").html(e)},updateTaktTime:function(){this.$property("taktTime").text(this.model.prodShiftOrder.getTaktTime())},updateQuantityDone:function(){var t;this.model.isIdle()?t="-":(t=String(this.model.prodShiftOrder.getQuantityDone()),this.model.isLocked()||(t+=' <button class="btn btn-link">'+o("production","property:quantityDone:change")+"</button>")),this.$property("quantityDone").html(t)},toggleActions:function(){this.$actions.empty(),this.model.isLocked()||(this.model.isIdle()?this.toggleIdleActions():this.model.isWorking()?this.toggleWorkingActions():this.toggleDowntimeActions())},toggleIdleActions:function(){t.defer(function(t){t.appendAction("danger","startDowntime"),t.model.prodShiftOrder.hasOrderData()&&t.appendAction("success","continueOrder"),t.appendAction("success","newOrder")},this)},toggleWorkingActions:function(){this.appendAction("danger","startDowntime"),this.appendAction("success","newOrder"),this.appendAction("warning","endWork")},toggleDowntimeActions:function(){this.model.hasOrder()?(this.appendAction("success","endDowntime"),this.appendAction("warning","endWork")):this.appendAction("warning","endDowntime")},appendAction:function(t,e){var i=["btn","btn-"+t,"production-action","production-"+e],n=o("production","action:"+e);this.$actions.append('<button class="'+i.join(" ")+'">'+n+"</button>")},$property:function(t){return this.$(".production-property-"+t+" .production-property-value")},showNewOrderDialog:function(){i.showDialog(new s({model:this.model}),o("production","newOrderPicker:title"))},continueOrder:function(){var t=new r({template:h});this.listenTo(t,"answered",function(t){"yes"===t&&this.model.continueOrder()}),i.showDialog(t,o("production","continueOrderDialog:title"))},showDowntimePickerDialog:function(){var t=new a;this.listenTo(t,"downtimePicked",function(t){i.closeDialog(),this.model.startDowntime(t)}),i.showDialog(t,o("production","downtimePicker:title"))},endDowntime:function(){var t=new r({template:u,model:{yesSeverity:this.model.hasOrder()?"success":"warning"}});this.listenTo(t,"answered",function(t){"yes"===t&&this.model.endDowntime()}),i.showDialog(t,o("production","endDowntimeDialog:title"))},endWork:function(){i.showDialog(new p({model:this.model}),o("production","endWorkDialog:title"))},showEditor:function(o,i,n,r){function d(){u.remove()}function s(){var e=parseInt(u.val(),10);d(),e!==i&&u[0].checkValidity()&&p.model[r](e),t.defer(function(){o.find(".btn-link").focus()})}var a=o.find(".production-property-value"),p=this,c=e("<form></form>").submit(function(){return s(),!1}),u=e('<input class="form-control input-lg" type="number" min="0">').val(i).attr("max",n).on("blur",s).on("keydown",function(t){27===t.which&&setTimeout(d,1)}).css({position:"absolute",width:a.width()+"px"}).appendTo(c);c.appendTo(a),u.select()},showQuantityDoneEditor:function(){this.showEditor(this.$(".production-property-quantityDone"),this.model.prodShiftOrder.getQuantityDone(),this.model.prodShiftOrder.getMaxQuantityDone(),"changeQuantityDone")},showWorkerCountEditor:function(){this.showEditor(this.$(".production-property-workerCount"),this.model.prodShiftOrder.getWorkerCount(),this.model.prodShiftOrder.getMaxWorkerCount(),"changeWorkerCount")},fillOrderData:function(){var e=this.model.prodShiftOrder.get("orderId"),o=this.model.prodShiftOrder.get("orderData");if(e&&(!o||t.isEmpty(o.operations))){if(d.isSyncing())return this.broker.subscribe("production.synced",this.fillOrderData.bind(this)).setLimit(1);this.fetchOrderData()}},fetchOrderData:function(){var t=this,o=this.model,i=o.prodShiftOrder.get("mechOrder")?"nc12":"no",n=o.prodShiftOrder.get("orderId"),r=e.ajax({type:"GET",url:"/production/orders?"+i+"="+encodeURIComponent(n)});this.promised(r).then(function(e){if(Array.isArray(e)&&e.length){var n=e[0];"no"===i?n.no=n._id:(n.nc12=n._id,n.no=null),delete n._id,o.prodShiftOrder.set("orderData",o.prodShiftOrder.prepareOperations(n)),o.saveLocalData(),t.updateOrderData(),t.updateOrderInfo()}})}})});