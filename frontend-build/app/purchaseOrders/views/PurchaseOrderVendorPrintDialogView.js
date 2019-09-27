define(["underscore","js2form","form2js","app/i18n","app/viewport","app/core/View","app/core/util/parseNumber","app/purchaseOrders/templates/vendorPrintDialog","../labelConfigurations"],function(t,e,r,i,o,n,a,s,l){"use strict";return n.extend({dialogClassName:"pos-vendorPrintDialog",template:s,events:{"focus .form-control":"toggleRowFocus","blur .form-control":"toggleRowFocus","blur .pos-printDialog-qty":function(t){var e=this.parseQty(t.target.value,void 0!==t.target.dataset.integer);t.target.value=Math.min(t.target.max,e).toLocaleString()},submit:"submitForm"},initialize:function(){this.decimalSeparator=1.1.toLocaleString().substr(1,1)},getTemplateData:function(){return{printers:this.options.printers,labelTypes:l.getVendorLabelTypes(),items:this.model.items}},afterRender:function(){e(this.el,{items:this.model.items})},toggleRowFocus:function(t){t.currentTarget.parentNode.parentNode.classList.toggle("is-focused")},submitForm:function(){return this.trigger("print",this.serializeFormData()),!1},serializeFormData:function(){var e=r(this.el);return e.items=e.items.filter(function(e){return e.labelCount=this.parseQty(e.labelCount),e.value=t.isString(e.value)?e.value.trim():"",e.unit=t.isString(e.unit)?e.unit.trim():"",e.labelCount>0&&!t.isEmpty(e.value)},this),e},parseQty:function(t,e){return a(t,e)}})});