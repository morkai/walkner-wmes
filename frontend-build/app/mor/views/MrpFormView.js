// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/View","app/core/util/formatResultWithDescription","app/data/orgUnits","app/users/util/setUpUserSelect2","app/mor/templates/mrpForm"],function(e,i,t,o,r,p,d){"use strict";return t.extend({template:d,events:{"change #-mrp":function(){var e=r.getByTypeAndId("mrpController",this.$id("mrp").val());e&&this.$id("description").val(e.get("description"))},submit:function(){var t=this,o=t.$id("submit").prop("disabled",!0),r={section:t.model.section._id,mrp:t.model.mrp?t.model.mrp._id:t.$id("mrp").val(),iptCheck:t.$id("iptCheck").prop("checked"),iptCheckRecipients:(t.$id("iptCheckRecipients").select2("data")||[]).map(function(e){return e.user}),description:t.$id("description").val()};return t.model.mor[t.model.mrp?"editMrp":"addMrp"](r).fail(function(){i.msg.show({type:"error",time:3e3,text:e("mor","mrpForm:failure:"+t.model.mode)}),o.prop("disabled",!1)}).done(function(){t.closeDialog()}),!1}},serialize:function(){return{idPrefix:this.idPrefix,mode:this.model.mode,section:this.model.section.name,mrp:this.model.mrp}},afterRender:function(){"edit"===this.model.mode&&this.$id("mrp").prop("disabled",!0),p(this.$id("iptCheckRecipients"),{view:this,multiple:!0})},onDialogShown:function(){this.closeDialog=i.closeDialog.bind(i),this.$id("edit"===this.model.mode?"description":"mrp").focus()},closeDialog:function(){}})});