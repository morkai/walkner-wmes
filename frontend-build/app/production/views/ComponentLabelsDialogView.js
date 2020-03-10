define(["underscore","app/viewport","app/core/View","app/componentLabels/ComponentLabelCollection","app/production/templates/componentLabels"],function(e,t,o,n,i){"use strict";return o.extend({template:i,dialogClassName:"production-modal production-componentLabels-modal",events:{"focus [data-vkb]":function(e){this.options.embedded&&this.options.vkb&&this.options.vkb.show(e.target)},"click .btn-default[value]":function(e){this.$(".btn.active[value]").removeClass("active"),e.currentTarget.classList.add("active")},submit:function(){return this.submitForm(),!1}},initialize:function(){this.selected=null,this.componentLabels=new n(null,{url:"/orders/"+this.model.prodShiftOrder.get("orderId")+"/componentLabels/"+this.model.prodShiftOrder.get("operationNo")}),this.once("afterRender",function(){this.promised(this.componentLabels.fetch({reset:!0}))}),this.listenTo(this.componentLabels,"reset",this.renderComponentLabels)},destroy:function(){this.options.vkb&&this.options.vkb.hide()},getTemplateData:function(){return{orderNo:this.model.prodShiftOrder.get("orderId"),operationNo:this.model.prodShiftOrder.get("operationNo")}},renderComponentLabels:function(){var e=this.$id("componentsList"),t=this.$id("componentsMessage"),o=this.$id("submit");if(!this.componentLabels.length)return e.addClass("hidden").empty(),t.html(this.t("componentLabels:noComponents")).removeClass("hidden"),void o.prop("disabled",!0);var n="";this.componentLabels.forEach(function(e){n+='<button type="button" class="btn btn-lg btn-default" value="'+e.id+'"><em>'+e.get("componentCode")+"</em><span>"+e.get("description")+"</span></button>"}),t.addClass("hidden"),e.html(n).removeClass("hidden"),o.prop("disabled",!1)},submitForm:function(){var o=this,n=+o.$id("labelQty").val().replace(/[^0-9]+/g,""),i=o.componentLabels.get(o.$(".btn.active[value]").val());if(n)if(i){var s=o.model.prodShiftOrder.get("orderData"),r=s&&s.bom||[],d=e.find(r,function(e){return e.nc12===i.get("componentCode")}),a=d&&d.qty||50;n>a&&(n=a),o.$id("labelQty").val(n),o.$id("submit").prop("disabled",!0).find(".fa-spin").removeClass("hidden");var l=o.ajax({method:"POST",url:"/componentLabels/"+i.id+";print",data:JSON.stringify({labelQty:n,orderNo:this.model.prodShiftOrder.get("orderId"),prodLine:o.model.prodLine.id,secretKey:o.model.getSecretKey()})});l.fail(function(){var e=l.responseJSON&&l.responseJSON.error&&l.responseJSON.error.code||"";t.msg.show({type:"error",time:3e3,text:o.t.has("componentLabels:error:"+e)?o.t("componentLabels:error:"+e):o.t("componentLabels:error")}),o.$id("submit").prop("disabled",!1).find(".fa-spin").addClass("hidden")}),l.done(function(){t.closeDialog()})}else o.$id("componentsList").find(".btn").first().focus();else o.$id("labelQty").focus()}})});