// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/user","app/data/divisions","app/data/subdivisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/View","app/core/util/getShiftStartInfo","app/fte/templates/addForm"],function(i,e,t,s,n,o,d,r,a,l){"use strict";var u=o.ORG_UNIT;return r.extend({template:l,events:{submit:"submitForm"},initialize:function(){this.readonlyDivision=!1,this.$submit=null,this.oudView=new o({orgUnit:u.SUBDIVISION,divisionFilter:this.options.divisionFilter,allowClear:!0,noGrid:!0,required:!0}),this.setView(".orgUnitDropdowns-container",this.oudView)},destroy:function(){null!==this.$submit&&(this.$submit.remove(),this.$submit=null)},serialize:function(){var i=a(new Date);return{idPrefix:this.idPrefix,date:i.moment.format("YYYY-MM-DD"),shift:i.shift}},afterRender:function(){var i=this,e=t.getDivision(),s=t.getSubdivision();this.$submit=this.$(".btn-primary").attr("disabled",!0),this.listenToOnce(this.oudView,"afterRender",function(){i.oudView.$id("subdivision").on("change",function(e){i.$submit.attr("disabled",""===e.val||null===e.val)});var n=null,o=null;null!==s?(o=u.SUBDIVISION,n=new d({subdivision:s.id})):null!==e&&(o=u.DIVISION,n=new d({division:e.id})),i.oudView.selectValue(n,o),i.readonlyDivision=!t.isAllowedTo(i.model.getPrivilegePrefix()+":ALL")&&e,i.oudView.$id("division").select2("readonly",i.readonlyDivision),i.oudView.$id(i.readonlyDivision?"subdivision":"division").select2("focus"),i.readonlyDivision&&!i.options.divisionFilter(e)&&i.oudView.$id("subdivision").select2("readonly",!0)})},submitForm:function(t){if(t.preventDefault(),!this.socket.isConnected())return e.msg.show({type:"error",time:5e3,text:i("fte","addForm:msg:offline")});var s=this,n=this.oudView.$id("division"),o=this.oudView.$id("subdivision"),d=this.$submit.find("i").removeClass("fa-edit").addClass("fa-spinner fa-spin");n.select2("readonly",!0),o.select2("readonly",!0),this.$submit.attr("disabled",!0);var r=this.model.getTopicPrefix()+".findOrCreate",a={subdivision:o.select2("val"),date:new Date(this.$id("date").val()+" 00:00:00"),shift:parseInt(this.$("input[name=shift]:checked").val(),10),copy:this.$id("copy").prop("checked")};this.socket.emit(r,a,function(t,r){return r&&s.model.set("_id",r),t?"AUTH"===t.message&&r?s.trigger("uneditable",s.model):(d.removeClass("fa-spinner fa-spin").addClass("fa-edit"),n.select2("readonly",s.readonlyDivision),o.select2("readonly",!1),s.$submit.attr("disabled",!1).focus(),e.msg.show({type:"error",time:5e3,text:i("fte","addForm:msg:failure",{error:t.message})})):void s.trigger("editable",s.model)})}})});