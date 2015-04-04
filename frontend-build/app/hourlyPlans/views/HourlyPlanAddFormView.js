// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time","app/viewport","app/user","app/data/divisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/View","app/core/util/getShiftStartInfo","app/hourlyPlans/templates/addForm"],function(i,e,t,s,n,o,r,a,d,l){"use strict";var u=o.ORG_UNIT;return a.extend({template:l,events:{submit:"submitForm"},initialize:function(){this.readonlyDivision=!1,this.$submit=null,this.oudView=new o({orgUnit:u.DIVISION,divisionFilter:function(i){return"prod"===i.get("type")},allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.oudView)},destroy:function(){null!==this.$submit&&(this.$submit.remove(),this.$submit=null)},serialize:function(){return{idPrefix:this.idPrefix,date:d(new Date).moment.format("YYYY-MM-DD")}},afterRender:function(){var i=this,e=s.getDivision();this.$submit=this.$(".btn-primary").attr("disabled",!0),this.listenToOnce(this.oudView,"afterRender",function(){i.oudView.$id("division").on("change",function(e){i.$submit.attr("disabled",""===e.val||null===e.val)});var t=null,n=null;null!==e&&(n=u.DIVISION,t=new r({division:e.id})),i.oudView.selectValue(t,n),i.readonlyDivision=!s.isAllowedTo("HOURLY_PLANS:ALL")&&e,i.oudView.$id("division").select2("readonly",i.readonlyDivision),i.readonlyDivision?i.$submit.focus():i.oudView.$id("division").select2("focus")})},submitForm:function(e){if(e.preventDefault(),!this.socket.isConnected())return t.msg.show({type:"error",time:5e3,text:i("hourlyPlans","addForm:msg:offline")});var s=this,n=this.oudView.$id("division"),o=this.$submit.find("i").removeClass("fa-edit").addClass("fa-spinner fa-spin");n.select2("readonly",!0),this.$submit.attr("disabled",!0);var r={division:n.select2("val"),date:new Date(this.$id("date").val()+" 00:00:00"),shift:1};this.socket.emit("hourlyPlans.findOrCreate",r,function(e,r){return r&&s.model.set("_id",r),e?"AUTH"===e.message&&r?s.trigger("uneditable",s.model):(o.removeClass("fa-spinner fa-spin").addClass("fa-edit"),n.select2("readonly",s.readonlyDivision),s.$submit.attr("disabled",!1).focus(),t.msg.show({type:"error",time:5e3,text:i("hourlyPlans","addForm:msg:failure",{error:e.message})})):void s.trigger("editable",s.model)})}})});