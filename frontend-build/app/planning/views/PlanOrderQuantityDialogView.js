define(["app/i18n","app/viewport","app/core/View","app/planning/templates/orderQuantityDialog"],function(t,i,n,e){"use strict";return n.extend({template:e,events:{submit:function(){return this.submitForm(),!1}},serialize:function(){var t=this.order;return{idPrefix:this.idPrefix,orderNo:t.id,quantity:{todo:t.get("quantityTodo"),done:t.get("quantityDone"),plan:t.get("quantityPlan"),remaining:t.get("quantityTodo")-t.get("quantityDone"),incomplete:t.get("incomplete")}}},submitForm:function(){var n=this,e=n.$id("submit").prop("disabled",!0),a=e.find(".fa-spinner").removeClass("hidden"),r=n.ajax({method:"PATCH",url:"/planning/plans/"+n.plan.id+"/orders/"+n.order.id,data:JSON.stringify({quantityPlan:Math.max(0,parseInt(n.$id("quantityPlan").val(),10)||0)})});r.done(i.closeDialog),r.fail(function(){a.addClass("hidden"),e.prop("disabled",!1),i.msg.show({type:"error",time:3e3,text:t("planning","orders:menu:quantity:failure")}),n.plan.settings.trigger("errored")})},onDialogShown:function(){this.$id("quantityPlan").focus()}})});