define(["underscore","app/core/pages/FilteredListPage","app/prodShifts/ProdShift","app/prodShiftOrders/ProdShiftOrder","../views/ProdLogEntryFilterView","../views/ProdLogEntryListView"],function(t,i,r,e,o,h){"use strict";return i.extend({FilterView:o,ListView:h,actions:null,breadcrumbs:function(){return this.prodShift?[{href:this.prodShift.genClientUrl(),label:this.t("BREADCRUMB:browse:shift",{shift:this.prodShift.getLabel()})}]:this.prodShiftOrder?[{href:this.prodShiftOrder.genClientUrl(),label:this.t("BREADCRUMB:browse:order",{order:this.prodShiftOrder.getLabel()})}]:i.prototype.breadcrumbs.apply(this,arguments)},getFilterViewOptions:function(){return t.assign(i.prototype.getFilterViewOptions.apply(this,arguments),{prodShift:this.options.prodShift,prodShiftOrder:this.options.prodShiftOrder})},defineModels:function(){i.prototype.defineModels.apply(this,arguments),this.prodShift=this.options.prodShift?new r({_id:this.options.prodShift}):null,this.prodShiftOrder=this.options.prodShiftOrder?new e({_id:this.options.prodShiftOrder}):null},load:function(t){return t(this.collection.fetch({reset:!0}),this.prodShift?this.prodShift.fetch():null,this.prodShiftOrder?this.prodShiftOrder.fetch():null)}})});