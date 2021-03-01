define(["app/user","app/viewport","app/core/View","./OrderPickerDialogView","app/wmes-gft-tester/templates/order"],function(e,t,r,i,o){"use strict";return r.extend({template:o,events:{"click #-setOrder":function(){this.showOrderPicker()},"click a[data-order]":function(e){this.showOrderPicker(e.currentTarget.dataset.order)}},initialize:function(){this.listenTo(this.model.order,"change",this.render),this.listenTo(this.model,"change:orderQueue",this.render)},getTemplateData:function(){return{order:this.model.order.toJSON(),orderQueue:this.model.get("orderQueue")||[],canManage:!!this.model.get("line")&&e.isAllowedTo("EMBEDDED","GFT:MANAGE")}},showOrderPicker:function(e){const r=new i({vkb:this.options.vkb,orderNo:e,model:this.model});t.showDialog(r,this.t("orderPicker:title"))}})});