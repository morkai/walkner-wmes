define(["app/core/View","app/core/util/decimalSeparator","app/orders/util/prepareReleasedBom","app/orderDocuments/templates/bomAndViewer","app/orderDocuments/templates/bomAndViewerComponent","css!app/orderDocuments/assets/bomAndViewer"],function(e,o,t,r,s){"use strict";return e.extend({template:r,dialogClassName:"orderDocuments-bomAndViewer-dialog",initialize:function(){this.once("afterRender",()=>{const e=this.$el.closest(".modal");this.timers.focus=setInterval(()=>e.focus(),100),this.loadBom()})},loadBom:function(){const e=this.ajax({url:`/orders/${this.model.order}?select(qty,bom)`});e.fail(()=>{this.$id("bom").find(".fa-spin").removeClass("fa-spin").css("color","#F00")}),e.done(e=>{e.bom.forEach(o=>{o.qty/=e.qty}),this.renderBom(t(e.bom,e.compRels).components)})},renderBom:function(e){let t="";e.forEach(e=>{t+=this.renderPartialHtml(s,{component:e,decimalSeparator:o})}),this.$id("bom").html(t)},onDialogShown:function(){this.$id("iframe").prop("src",`/orderDocuments/${this.model.document.nc15}?order=${this.model.order}`)}})});