define(["app/i18n","app/viewport","app/core/View","app/opinionSurveyScanTemplates/templates/imageEditForm"],function(e,t,a,i){"use strict";return a.extend({template:i,events:{submit:"upload"},upload:function(a){a.preventDefault();var i=this,n=this.$("[type=submit]").attr("disabled",!0),s=n.find(".fa-spinner").removeClass("hidden"),p=new FormData(this.el),o=this.ajax({type:"POST",url:"/opinionSurveys/scanTemplates;uploadImage",data:p,processData:!1,contentType:!1});o.then(function(a){t.msg.show({type:"info",time:2500,text:e("opinionSurveyScanTemplates","imageEditForm:msg:success")}),i.trigger("success",a)}),o.fail(function(){t.msg.show({type:"error",time:5e3,text:e("opinionSurveyScanTemplates","imageEditForm:msg:failure")})}),o.always(function(){n.attr("disabled",!1),s.addClass("hidden")})}})});