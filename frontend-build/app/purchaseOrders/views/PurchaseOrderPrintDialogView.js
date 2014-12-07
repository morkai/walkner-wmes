// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["js2form","form2js","app/i18n","app/viewport","app/core/View","app/purchaseOrders/templates/printDialog","../labelConfigurations"],function(t,e,r,i,a,s,o){return a.extend({dialogClassName:"pos-printDialog",template:s,events:{"focus .form-control":"toggleRowFocus","blur .form-control":"toggleRowFocus","change .pos-printDialog-qty":"recountTotals","keyup .pos-printDialog-qty":"recountTotals","blur .pos-printDialog-qty":function(t){var e=this.parseQty(t.target.value,void 0!==t.target.dataset.integer);t.target.value=Math.min(t.target.max,e).toLocaleString()},submit:"submitForm"},initialize:function(){this.decimalSeparator=1.1.toLocaleString().substr(1,1),this.$msg=null},destroy:function(){this.hideMessage()},serialize:function(){return{idPrefix:this.idPrefix,action:"/purchaseOrders/"+this.model.get("orderId")+"/prints",printers:this.options.printers,barcodes:o.getBarcodes(),paperGroups:o.getPaperGroups(),items:this.model.get("items").map(function(t){return{_id:t._id,nc12:t.nc12}})}},afterRender:function(){t(this.el,this.model.toJSON()),this.recountTotals()},hideMessage:function(){null!==this.$msg&&(i.msg.hide(this.$msg),this.$msg=null)},toggleRowFocus:function(t){t.currentTarget.parentNode.parentNode.classList.toggle("is-focused")},recountTotals:function(){var t=0,e=0,r=0,i=0,a=0,s=this;this.$(".pos-printDialog-items-item").each(function(){var o=this,n=o.querySelectorAll(".pos-printDialog-qty"),l=s.parseQty(n[0].value),p=s.parseQty(n[1].value),g=s.parseQty(n[2].value);0===l&&(p=0),0===p&&(l=0);var c=l+(g>0?1:0),u=l*p+g;t+=l,e+=p,r+=g,i+=c,a+=u,o.querySelector(".pos-printDialog-items-totalPackageQty").innerText=c.toLocaleString(),o.querySelector(".pos-printDialog-items-totalQty").innerText=u.toLocaleString()}),this.$id("overallPackageQty").text(t.toLocaleString()),this.$id("overallComponentQty").text(e.toLocaleString()),this.$id("overallRemainingQty").text(r.toLocaleString()),this.$id("overallTotalPackageQty").text(i.toLocaleString()),this.$id("overallTotalQty").text(a.toLocaleString())},submitForm:function(){this.hideMessage();var t=this.serializeFormData(),e=this.ajax({type:"POST",url:this.el.action,data:JSON.stringify(t)}),a=this.$("input, button, select").attr("disabled",!0),s=a.filter(".btn-primary").find(".fa").removeClass("fa-print").addClass("fa-spin fa-spinner"),o=this;return e.fail(function(t,e){if("abort"!==e){var a=t.responseJSON.error.message;o.$msg=i.msg.show({type:"error",time:8e3,text:r.has("purchaseOrders","printDialog:msg:"+a)?r("purchaseOrders","printDialog:msg:"+a):r("purchaseOrders","printDialog:msg:failure")})}}),e.done(function(e){o.model.set({_id:e.printKey,shippingNo:t.shippingNo,printer:t.printer,paper:t.paper,barcode:t.barcode}),localStorage.setItem("POS:PAPER",t.paper),localStorage.setItem("POS:BARCODE",t.barcode),o.trigger("print",e.prints)}),e.always(function(){s.removeClass("fa-spin fa-spinner").addClass("fa-print"),a.attr("disabled",!1)}),!1},serializeFormData:function(){var t=e(this.el);return t.items=t.items.map(function(t){t.packageQty=this.parseQty(t.packageQty),t.componentQty=this.parseQty(t.componentQty),t.remainingQty=this.parseQty(t.remainingQty);var e=t.packageQty*t.componentQty+t.remainingQty;return 0===e?null:t},this).filter(function(t){return null!==t}),t},parseQty:function(t,e){var r=String(t).split(this.decimalSeparator),i=parseInt(r[0].replace(/[^0-9]+/g,""),10),a=r.length>1?parseInt(r[1].replace(/[^0-9]+/g,""),10):0;return i=isNaN(i)?"0":i.toString(),a=isNaN(a)?"0":a.toString(),e||"0"===a?"0"===i?0:parseInt(i,10):parseFloat(i+"."+a.substr(0,3))}})});