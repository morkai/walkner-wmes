define(["app/i18n","app/time","app/core/pages/EditFormPage","../views/ProdShiftEditFormView"],function(e,t,i,o){return i.extend({FormView:o,breadcrumbs:function(){return[{label:e.bound("prodShifts","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},this.model.get("prodLine"),{label:e.bound("prodShifts","BREADCRUMBS:details",{date:t.format(this.model.get("date"),"YYYY-MM-DD"),shift:e("core","SHIFT:"+this.model.get("shift"))}),href:this.model.genClientUrl()},e.bound("prodShifts","BREADCRUMBS:editForm")]}})});