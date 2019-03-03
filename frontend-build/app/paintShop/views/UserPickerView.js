define(["underscore","app/i18n","app/time","app/core/View","app/paintShop/templates/userPicker"],function(e,i,t,a,r){"use strict";return a.extend({template:r,dialogClassName:"paintShop-userPicker-dialog",events:{"click .paintShop-userPicker-user":function(e){this.$(".active").removeClass("active"),e.currentTarget.classList.add("active")},"click .btn-danger":function(){this.trigger("picked",null)},submit:function(){var e=this.$(".active")[0],i=e?{id:e.dataset.id,label:e.textContent.trim()}:null;return this.trigger("picked",i),!1}},getTemplateData:function(){return{maxHeight:this.calcHeight()}},calcHeight:function(){return window.innerHeight-62-65},afterRender:function(){this.loadUsers()},loadUsers:function(){var e=this;e.$id("users").html('<i class="fa fa-spinner fa-spin"></i>');var i=e.ajax({url:"/users?select(login,firstName,lastName,searchName)&privileges=in=(PAINT_SHOP%3APAINTER,PAINT_SHOP%3AMANAGE)"});i.fail(function(){e.$id("users").find(".fa-spinner").removeClass("fa-spin")}),i.done(function(i){e.renderUsers(i.collection||[])})},renderUsers:function(i){(i=i.map(function(e){var i=e.lastName;return e.firstName?(i&&(i+=" "),i+=e.firstName):i=e.login,{id:e._id,label:i}})).sort(function(e,i){return e.label.localeCompare(i.label,void 0,{ignorePunctuation:!0})});var t=i.map(function(i){return'<div class="paintShop-userPicker-user" data-id="'+i.id+'">'+e.escape(i.label)+"</div>"});this.$id("users").html(t),this.model.user&&this.$('.paintShop-userPicker-user[data-id="'+this.model.user.id+'"]').click()}})});