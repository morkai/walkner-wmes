// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","Sortable","app/i18n","app/viewport","app/core/View","app/core/util/idAndLabel","app/core/util/uuid","app/data/prodFunctions","app/mor/templates/sectionForm"],function(e,i,t,o,n,s,l,c,r){"use strict";return n.extend({template:r,events:{submit:function(){var e=this,i=e.$id("submit").prop("disabled",!0),n={_id:this.model.section?this.model.section._id:l(),name:e.$id("name").val().trim(),watchEnabled:e.$id("watchEnabled").prop("checked"),mrpsEnabled:e.$id("mrpsEnabled").prop("checked"),prodFunctions:e.$id("prodFunctions").val().split(",").filter(function(e){return""!==e})};return e.model.mor[e.model.section?"editSection":"addSection"](n).fail(function(){o.msg.show({type:"error",time:3e3,text:t("mor","sectionForm:failure:"+e.model.nlsSuffix)}),i.prop("disabled",!1)}).done(function(){e.closeDialog()}),!1}},initialize:function(){this.sortable=null},destroy:function(){this.sortable.destroy(),this.sortable=null},serialize:function(){return{idPrefix:this.idPrefix,nlsSuffix:this.model.nlsSuffix,section:this.model.section}},afterRender:function(){var e=this.$id("prodFunctions").select2({allowClear:!0,multiple:!0,data:c.map(s)});this.sortable=new i(e.select2("container").find(".select2-choices")[0],{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:function(){e.select2("onSortStart")},onEnd:function(){e.select2("onSortEnd").select2("focus")}})},onDialogShown:function(){this.closeDialog=o.closeDialog.bind(o),this.$id("name").focus()},closeDialog:function(){}})});