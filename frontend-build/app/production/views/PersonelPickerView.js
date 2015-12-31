// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/View","app/users/util/setUpUserSelect2","app/production/templates/personelPicker"],function(e,t,i,s,l){"use strict";return i.extend({template:l,dialogClassName:"production-modal",localTopics:{"socket.connected":"render","socket.disconnected":"render"},events:{"keypress .select2-container":function(e){13===e.which&&(this.$el.submit(),e.preventDefault())},submit:function(e){e.preventDefault();var t=this.$(".btn-primary")[0];if(!t.disabled){t.disabled=!0;var i={id:null,label:null};if(this.socket.isConnected()){var s=this.$id("user").select2("data");s&&(i.id=s.id,i.label=s.text)}else i.label=this.$id("user").val().trim().replace(/[^0-9]+/g,"");this.trigger("userPicked",null!==i.label&&i.label.length?i:null)}}},serialize:function(){var t=!this.socket.isConnected();return{idPrefix:this.idPrefix,offline:t,label:e("production","personelPicker:"+(t?"offline":"online")+":label")}},afterRender:function(){var t=this.$id("user");this.socket.isConnected()?(s(t.removeClass("form-control"),{dropdownCssClass:"production-dropdown"}),t.select2("focus")):t.attr("placeholder",e("production","personelPicker:offline:placeholder")).focus()},onDialogShown:function(){this.$id("user").focus().select2("focus")}})});