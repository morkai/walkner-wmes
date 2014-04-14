define(["app/i18n","app/time","app/viewport","app/user","app/data/divisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/View","app/core/util/getShiftStartInfo","app/hourlyPlans/templates/addForm"],function(i,e,t,s,n,o,r,a,d,l){var u=o.ORG_UNIT;return a.extend({template:l,idPrefix:"hourlyPlanAddForm",events:{"click .btn-primary":"onSubmit"},initialize:function(){this.readonlyDivision=!1,this.$submit=null,this.oudView=new o({orgUnit:u.DIVISION,divisionFilter:function(i){return"prod"===i.get("type")},allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.oudView)},destroy:function(){null!==this.$submit&&(this.$submit.remove(),this.$submit=null)},serialize:function(){return{idPrefix:this.idPrefix,date:d(new Date).moment.format("YYYY-MM-DD")}},afterRender:function(){var i=this,e=s.getDivision();this.$submit=this.$(".btn-primary").attr("disabled",!0),this.listenToOnce(this.oudView,"afterRender",function(){i.oudView.$id("division").on("change",function(e){i.$submit.attr("disabled",""===e.val||null===e.val)});var t=null,n=null;null!==e&&(n=u.DIVISION,t=new r({division:e.id})),i.oudView.selectValue(t,n),i.readonlyDivision=!s.isAllowedTo("HOURLY_PLANS:ALL")&&e,i.oudView.$id("division").select2("readonly",i.readonlyDivision),i.readonlyDivision?i.$submit.focus():i.oudView.$id("division").select2("focus")})},onSubmit:function(){if(!this.socket.isConnected())return t.msg.show({type:"error",time:5e3,text:i("hourlyPlans","addForm:msg:offline")});var e=this,s=this.oudView.$id("division"),n=this.$submit.find("i").removeClass("fa-edit").addClass("fa-spinner fa-spin");s.select2("readonly",!0),this.$submit.attr("disabled",!0);var o={division:s.select2("val"),date:new Date(this.$id("date").val()+" 00:00:00"),shift:1};this.socket.emit("hourlyPlans.findOrCreate",o,function(o,r){return r&&e.model.set("_id",r),o?"AUTH"===o.message&&r?e.trigger("uneditable",e.model):(n.removeClass("fa-spinner fa-spin").addClass("fa-edit"),s.select2("readonly",e.readonlyDivision),e.$submit.attr("disabled",!1).focus(),t.msg.show({type:"error",time:5e3,text:i("hourlyPlans","addForm:msg:failure",{error:o.message})})):void e.trigger("editable",e.model)})}})});