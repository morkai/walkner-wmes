// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/time","app/viewport","app/core/View","app/planning/templates/orderDropZoneDialog"],function(e,i,t,r,o){"use strict";return r.extend({template:o,events:{submit:"submitForm","blur #-orders":function(){var e=this.$id("orders"),i=e.val().match(/([0-9]{9})/g);e.val(i?i.join(", "):"")},"blur #-dropZone":"toggleRequired"},serialize:function(){var e=this.order,t=this.plan.sapOrders.get(e.id),r=t.get("whDropZone")||"",o=[e.id];return r&&this.plan.sapOrders.forEach(function(e){if(e.id!==t.id){var i=e.get("whDropZone")||"";i===r&&o.push(e.id)}}),{idPrefix:this.idPrefix,status:this.plan.sapOrders.getWhStatus(t.id),dropZone:r,time:t.get("whTime")?i.utc.format(t.get("whTime"),"HH:mm"):i.format(Date.now(),"HH:mm"),orders:o.join(", ")}},afterRender:function(){this.toggleRequired()},submitForm:function(){var r=this,o=r.$id("submit").prop("disabled",!0),n=o.find(".fa-spinner").removeClass("hidden"),a=this.$('input[name="status"]:checked').val(),s=this.$id("dropZone").val().trim(),d=i.utc.getMoment("2000-01-01 "+this.$id("time").val().trim(),"YYYY-MM-DD HH:mm"),p=""!==s&&d.isValid()?d.toISOString():null,m=this.$id("comment").val().trim();p||(s="");var u=r.ajax({method:"POST",url:"/orders",data:JSON.stringify(this.$id("orders").val().match(/([0-9]{9})/g).map(function(e){return{_id:e,source:"wh",comment:m,whStatus:a,whDropZone:s,whTime:p}}))});return u.done(t.closeDialog),u.fail(function(){n.addClass("hidden"),o.prop("disabled",!1),t.msg.show({type:"error",time:3e3,text:e("planning","orders:menu:dropZone:failure")}),r.plan.settings.trigger("errored")}),!1},toggleRequired:function(){var e=this.$id("dropZone").val().trim().length>0;this.$id("time").prop("required",e)},onDialogShown:function(){this.$id("dropZone").focus()}})});