define(["app/i18n","app/viewport","app/user","app/data/divisions","app/data/subdivisions","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/View","app/fte/templates/currentEntry","i18n!app/nls/fte"],function(i,e,t,n,s,o,r,l,d){var a=o.ORG_UNIT;return l.extend({template:d,idPrefix:"currentEntry",events:{"click .btn-primary":"onSubmit"},initialize:function(){this.readonlyDivision=!1,this.$submit=null,this.oudView=new o({orgUnit:a.SUBDIVISION,allowClear:!0,noGrid:!0}),this.setView(".orgUnitDropdowns-container",this.oudView)},destroy:function(){null!==this.$submit&&(this.$submit.remove(),this.$submit=null)},afterRender:function(){var i=this,e=t.getDivision(),n=t.getSubdivision();this.$submit=this.$(".btn-primary").attr("disabled",!0),this.listenToOnce(this.oudView,"afterRender",function(){i.oudView.$id("subdivision").on("change",function(e){i.$submit.attr("disabled",""===e.val||null===e.val)});var s=null,o=null;null!==n?(o=a.SUBDIVISION,s=new r({subdivision:n.id})):null!==e&&(o=a.DIVISION,s=new r({division:e.id})),i.oudView.selectValue(s,o),i.readonlyDivision=!(t.isAllowedTo(i.model.getPrivilegePrefix()+":ALL")&&!e),i.oudView.$id("division").select2("readonly",i.readonlyDivision),i.oudView.$id(i.readonlyDivision?"subdivision":"division").select2("focus")})},onSubmit:function(){if(!this.socket.isConnected())return e.msg.show({type:"error",time:5e3,text:i(this.model.getNlsDomain(),"currentEntry:msg:offline")});var t=this,n=this.oudView.$id("division"),s=this.oudView.$id("subdivision"),o=this.$submit.find("i").removeClass("fa-edit").addClass("fa-spinner fa-spin");n.select2("readonly",!0),s.select2("readonly",!0),this.$submit.attr("disabled",!0),this.socket.emit(this.model.getTopicPrefix()+".getCurrentEntryId",s.select2("val"),function(r,l){return l&&t.model.set("_id",l),r?"LOCKED"===r.message?t.broker.publish("router.navigate",{url:t.model.genClientUrl(),trigger:!0}):(o.removeClass("fa-spinner fa-spin").addClass("fa-edit"),n.select2("readonly",t.readonlyDivision),s.select2("readonly",!1),t.$submit.attr("disabled",!1).focus(),console.error(r),e.msg.show({type:"error",time:5e3,text:i(t.model.getNlsDomain(),"currentEntry:msg:failure")})):(t.broker.publish("router.navigate",{url:t.model.genClientUrl("edit"),trigger:!0}),void 0)})}})});