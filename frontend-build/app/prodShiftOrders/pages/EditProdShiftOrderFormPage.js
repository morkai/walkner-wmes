define(["app/i18n","app/time","app/core/pages/EditFormPage","../views/ProdShiftOrderEditFormView"],function(e,r,o,d){return o.extend({FormView:d,breadcrumbs:function(){return[{label:e.bound("prodShiftOrders","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},{label:e.bound("prodShiftOrders","BREADCRUMBS:details",{prodLine:this.model.get("prodLine"),order:this.model.get("orderId"),operation:this.model.get("operationNo")}),href:this.model.genClientUrl()},e.bound("prodShiftOrders","BREADCRUMBS:editForm")]}})});