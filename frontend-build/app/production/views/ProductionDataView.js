define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","app/data/prodLog","./NewOrderPickerView","./DowntimePickerView","./EndWorkDialogView","app/production/templates/data","app/production/templates/endDowntimeDialog","app/production/templates/continueOrderDialog"],function(e,t,n,r,i,o,a,s,l,d,u,c,p){return i.extend({template:u,localTopics:{"socket.connected":"fillOrderData"},events:{"click .production-newOrder":"showNewOrderDialog","click .production-continueOrder":"continueOrder","click .production-startDowntime":"showDowntimePickerDialog","click .production-endDowntime":"endDowntime","click .production-endWork":"endWork","click .production-property-quantityDone .btn-link":"showQuantityDoneEditor","click .production-property-workerCount .btn-link":"showWorkerCountEditor"},initialize:function(){this.listenTo(this.model,"locked unlocked",function(){this.updateWorkerCount(),this.updateQuantityDone(),this.toggleActions()}),this.listenTo(this.model,"change:state",this.toggleActions);var e=this.model.prodShiftOrder;this.listenTo(e,"change:_id",this.updateOrderData),this.listenTo(e,"change:orderId",this.updateOrderInfo),this.listenTo(e,"change:quantityDone",this.updateQuantityDone),this.listenTo(e,"change:workerCount",function(){this.updateWorkerCount(),this.updateTaktTime()})},afterRender:function(){this.$actions=this.$(".production-actions"),this.updateOrderData(),this.updateOrderInfo(),this.updateQuantityDone(),this.toggleActions(),this.socket.isConnected()&&this.fillOrderData()},updateOrderInfo:function(){var e=this.model.prodShiftOrder;this.$property("orderNo").text(e.getOrderNo()),this.$property("nc12").text(e.getNc12()),this.$property("productName").text(e.getProductName()),this.$property("operationName").text(e.getOperationName())},updateOrderData:function(){this.toggleOrderDataProperties(),this.updateTaktTime(),this.updateWorkerCount(),this.$property("startedAt").text(this.model.prodShiftOrder.getStartedAt())},toggleOrderDataProperties:function(){this.$(".production-properties-orderData").toggle(this.model.hasOrder())},updateWorkerCount:function(){this.$property("workerCountSap").text(this.model.prodShiftOrder.getWorkerCountSap());var e=this.model.prodShiftOrder.getWorkerCount(),t="";if(this.model.isIdle())t="-";else if(this.model.isLocked())t="number"==typeof e?e:"-";else{var r="property:workerCount:change:noData";e>0&&(r="property:workerCount:change:data",t+=e+" "),t+='<button class="btn btn-link">'+n("production",r)+"</button>"}this.$property("workerCount").html(t)},updateTaktTime:function(){this.$property("taktTime").text(this.model.prodShiftOrder.getTaktTime())},updateQuantityDone:function(){var e;this.model.isIdle()?e="-":(e=String(this.model.prodShiftOrder.getQuantityDone()),this.model.isLocked()||(e+=' <button class="btn btn-link">'+n("production","property:quantityDone:change")+"</button>")),this.$property("quantityDone").html(e)},toggleActions:function(){this.$actions.empty(),this.model.isLocked()||(this.model.isIdle()?this.toggleIdleActions():this.model.isWorking()?this.toggleWorkingActions():this.toggleDowntimeActions())},toggleIdleActions:function(){e.defer(function(e){e.appendAction("danger","startDowntime"),e.model.prodShiftOrder.hasOrderData()&&e.appendAction("success","continueOrder"),e.appendAction("success","newOrder")},this)},toggleWorkingActions:function(){this.appendAction("danger","startDowntime"),this.appendAction("success","newOrder"),this.appendAction("warning","endWork")},toggleDowntimeActions:function(){this.model.hasOrder()?(this.appendAction("success","endDowntime"),this.appendAction("warning","endWork")):this.appendAction("warning","endDowntime")},appendAction:function(e,t){var r=["btn","btn-"+e,"production-action","production-"+t],i=n("production","action:"+t);this.$actions.append('<button class="'+r.join(" ")+'">'+i+"</button>")},$property:function(e){return this.$(".production-property-"+e+" .production-property-value")},showNewOrderDialog:function(){r.showDialog(new s({model:this.model}),n("production","newOrderPicker:title"))},continueOrder:function(){var e=new o({template:p});this.listenTo(e,"answered",function(e){"yes"===e&&this.model.continueOrder()}),r.showDialog(e,n("production","continueOrderDialog:title"))},showDowntimePickerDialog:function(){var e=new l;this.listenTo(e,"downtimePicked",function(e){r.closeDialog(),this.model.startDowntime(e)}),r.showDialog(e,n("production","downtimePicker:title"))},endDowntime:function(){var e=new o({template:c,model:{yesSeverity:this.model.hasOrder()?"success":"warning"}});this.listenTo(e,"answered",function(e){"yes"===e&&this.model.endDowntime()}),r.showDialog(e,n("production","endDowntimeDialog:title"))},endWork:function(){r.showDialog(new d({model:this.model}),n("production","endWorkDialog:title"))},showEditor:function(n,r,i){function o(){d.remove()}function a(){var t=parseInt(d.val(),10);o(),t!==r&&t>=0&&l.model[i](t),e.defer(function(){n.find(".btn-link").focus()})}var s=n.find(".production-property-value"),l=this,d=t('<input class="form-control input-lg" type="number" min="0">').val(r).on("blur",a).on("keydown",function(e){27===e.which?setTimeout(o,1):13===e.which&&setTimeout(a,1)}).css({position:"absolute",width:s.width()+"px"}).appendTo(s).select()},showQuantityDoneEditor:function(){this.showEditor(this.$(".production-property-quantityDone"),this.model.prodShiftOrder.getQuantityDone(),"changeQuantityDone")},showWorkerCountEditor:function(){this.showEditor(this.$(".production-property-workerCount"),this.model.prodShiftOrder.getWorkerCount(),"changeWorkerCount")},fillOrderData:function(){var t=this.model.prodShiftOrder.get("orderId"),n=this.model.prodShiftOrder.get("orderData");if(t&&(!n||e.isEmpty(n.operations))){if(a.isSyncing())return this.broker.subscribe("production.synced",this.fillOrderData.bind(this)).setLimit(1);this.fetchOrderData()}},fetchOrderData:function(){var e=this,n=this.model,r=n.prodShiftOrder.get("mechOrder")?"nc12":"no",i=n.prodShiftOrder.get("orderId"),o=t.ajax({type:"GET",url:"/production/orders?"+r+"="+encodeURIComponent(i)});this.promised(o).then(function(t){if(Array.isArray(t)&&t.length){var i=t[0];"no"===r?i.no=i._id:(i.nc12=i._id,i.no=null),delete i._id,n.prodShiftOrder.set("orderData",n.prodShiftOrder.prepareOperations(i)),n.saveLocalData(),e.updateOrderData(),e.updateOrderInfo()}})}})});