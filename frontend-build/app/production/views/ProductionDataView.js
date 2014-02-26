define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/views/DialogView","app/data/prodLog","./NewOrderPickerView","./DowntimePickerView","./EndWorkDialogView","app/production/templates/data","app/production/templates/endDowntimeDialog","app/production/templates/continueOrderDialog"],function(t,e,o,r,i,n,d,a,s,c,p,u,h,l){return n.extend({template:u,localTopics:{"socket.connected":"fillOrderData"},events:{"click .production-newOrder":"newOrder","click .production-continueOrder":"continueOrder","click .production-startDowntime":"startDowntime","click .production-startBreak":"startBreak","click .production-endDowntime":"endDowntime","click .production-endWork":"endWork","click .production-property-orderNo .btn-link":"correctOrder","click .production-property-nc12 .btn-link":"correctOrder","click .production-property-quantityDone .btn-link":"showQuantityDoneEditor","click .production-property-workerCount .btn-link":"showWorkerCountEditor"},initialize:function(){this.listenTo(this.model,"locked unlocked",function(){this.updateWorkerCount(),this.updateQuantityDone(),this.toggleActions()}),this.listenTo(this.model,"change:state",this.toggleActions);var e=this.model.prodShiftOrder;this.listenTo(e,"change:_id change:orderId change:operationNo",t.debounce(function(){this.updateOrderData(),this.updateOrderInfo(),this.updateWorkerCount(),this.updateTaktTime()},1)),this.listenTo(e,"change:quantityDone",this.updateQuantityDone),this.listenTo(e,"change:workerCount",t.debounce(function(){this.updateWorkerCount(),this.updateTaktTime()},1))},afterRender:function(){this.$actions=this.$(".production-actions"),this.updateOrderData(),this.updateOrderInfo(),this.updateQuantityDone(),this.toggleActions(),this.socket.isConnected()&&this.fillOrderData()},updateOrderInfo:function(){var t=this.model.prodShiftOrder;this.updateOrderNo(),this.updateNc12(),this.$property("productName").text(t.getProductName()),this.$property("operationName").text(t.getOperationName())},updateOrderData:function(){this.$el.toggleClass("has-order",this.model.hasOrder()),this.updateTaktTime(),this.updateWorkerCount(),this.$property("startedAt").text(this.model.prodShiftOrder.getStartedAt())},updateOrderNo:function(){var t=this.model.prodShiftOrder.getOrderNo();this.model.isLocked()||!this.model.hasOrder()||this.model.prodShiftOrder.isMechOrder()||(t+=' <button class="btn btn-link">'+o("production","property:orderNo:change")+"</button>"),this.$property("orderNo").html(t)},updateNc12:function(){var t=this.model.prodShiftOrder.getNc12();!this.model.isLocked()&&this.model.hasOrder()&&this.model.prodShiftOrder.isMechOrder()&&(t+=' <button class="btn btn-link">'+o("production","property:nc12:change")+"</button>"),this.$property("nc12").html(t)},updateWorkerCount:function(){this.$property("workerCountSap").text(this.model.prodShiftOrder.getWorkerCountSap());var t=this.model.prodShiftOrder.getWorkerCount(),e="";if(this.model.isIdle())e="-";else if(this.model.isLocked())e="number"==typeof t?t:"-";else{var r="property:workerCount:change:noData";t>0&&(r="property:workerCount:change:data",e+=t+" "),e+='<button class="btn btn-link">'+o("production",r)+"</button>"}this.$property("workerCount").html(e)},updateTaktTime:function(){this.$property("taktTime").text(this.model.prodShiftOrder.getTaktTime())},updateQuantityDone:function(){var t;this.model.isIdle()?t="-":(t=String(this.model.prodShiftOrder.getQuantityDone()),this.model.isLocked()||(t+=' <button class="btn btn-link">'+o("production","property:quantityDone:change")+"</button>")),this.$property("quantityDone").html(t)},toggleActions:function(){this.$actions.empty(),this.model.isLocked()||(this.model.isIdle()?this.toggleIdleActions():this.model.isWorking()?this.toggleWorkingActions():this.toggleDowntimeActions())},toggleIdleActions:function(){t.defer(function(t){t.appendAction("danger","startDowntime"),t.model.getDefaultAor()&&t.appendAction("danger","startBreak"),t.model.prodShiftOrder.hasOrderData()&&t.appendAction("success","continueOrder"),t.appendAction("success","newOrder")},this)},toggleWorkingActions:function(){this.appendAction("danger","startDowntime"),this.model.getDefaultAor()&&this.appendAction("danger","startBreak"),this.appendAction("success","newOrder"),this.appendAction("warning","endWork")},toggleDowntimeActions:function(){this.model.hasOrder()?(this.appendAction("success","endDowntime"),this.appendAction("warning","endWork")):this.appendAction("warning","endDowntime")},appendAction:function(t,e){var r=["btn","btn-"+t,"production-action","production-"+e],i=o("production","action:"+e);this.$actions.append('<button class="'+r.join(" ")+'">'+i+"</button>")},$property:function(t){return this.$(".production-property-"+t+" .production-property-value")},newOrder:function(t){t&&t.target.blur(),i.showDialog(new s({model:this.model}),o("production","newOrderPicker:title"+(this.model.hasOrder()?":replacing":"")))},continueOrder:function(t){t&&t.target.blur();var e=new d({dialogClassName:"production-modal",template:l});this.listenTo(e,"answered",function(t){"yes"===t&&this.model.continueOrder()}),i.showDialog(e,o("production","continueOrderDialog:title"))},correctOrder:function(t){t&&t.target.blur(),i.showDialog(new s({model:this.model,correctingOrder:!0}),o("production","newOrderPicker:title:correcting"))},startDowntime:function(e,n){var d=r.getMoment().toDate();e&&e.target.blur();var a=new c(t.extend({model:this.model},n));this.listenTo(a,"downtimePicked",function(t){i.closeDialog(),this.model.startDowntime(t,d)}),i.showDialog(a,o("production","downtimePicker:title"))},startBreak:function(t){this.startDowntime(t,{reason:this.model.getBreakReason(),aor:this.model.getDefaultAor()})},endDowntime:function(t){t&&t.target.blur();var e=new d({dialogClassName:"production-modal",template:h,model:{yesSeverity:this.model.hasOrder()?"success":"warning"}});this.listenTo(e,"answered",function(t){"yes"===t&&this.model.endDowntime()}),i.showDialog(e,o("production","endDowntimeDialog:title"))},endWork:function(t){t&&t.target.blur(),i.showDialog(new p({model:this.model}),o("production","endWorkDialog:title"))},showEditor:function(o,r,i,n,d){function a(){h.remove()}function s(){var e=parseInt(h.val(),10);a(),isNaN(e)||p.model[d](e),t.defer(function(){o.find(".btn-link").focus()})}var c=o.find(".production-property-value"),p=this,u=e("<form></form>").submit(function(){return s(),!1}),h=e('<input class="form-control input-lg" type="number">').val(r).attr("min",i).attr("max",n).on("blur",s).on("keydown",function(t){27===t.which&&setTimeout(a,1)}).css({position:"absolute",width:c.width()+"px"}).appendTo(u);u.appendTo(c),h.select()},showQuantityDoneEditor:function(){this.showEditor(this.$(".production-property-quantityDone"),this.model.prodShiftOrder.getQuantityDone(),0,this.model.prodShiftOrder.getMaxQuantityDone(),"changeQuantityDone")},showWorkerCountEditor:function(){this.showEditor(this.$(".production-property-workerCount"),this.model.prodShiftOrder.getWorkerCountForEdit(),1,this.model.prodShiftOrder.getMaxWorkerCount(),"changeWorkerCount")},fillOrderData:function(){var e=this.model.prodShiftOrder.get("orderId"),o=this.model.prodShiftOrder.get("orderData");if(e&&(!o||t.isEmpty(o.operations))){if(a.isSyncing())return this.broker.subscribe("production.synced",this.fillOrderData.bind(this)).setLimit(1);this.fetchOrderData()}},fetchOrderData:function(){var t=this,o=this.model,r=o.prodShiftOrder.get("mechOrder")?"nc12":"no",i=o.prodShiftOrder.get("orderId"),n=e.ajax({type:"GET",url:"/production/orders?"+r+"="+encodeURIComponent(i)});this.promised(n).then(function(e){if(Array.isArray(e)&&e.length){var i=e[0];"no"===r?i.no=i._id:(i.nc12=i._id,i.no=null),delete i._id,o.prodShiftOrder.set("orderData",o.prodShiftOrder.prepareOperations(i)),o.saveLocalData(),t.updateOrderData(),t.updateOrderInfo()}})}})});