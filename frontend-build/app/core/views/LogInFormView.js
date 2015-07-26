// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/i18n","app/viewport","../View","app/core/templates/logInForm"],function(t,i,s,e,n){"use strict";return e.extend({template:n,events:{submit:"submitForm","keypress input":function(){this.$submit.removeClass("btn-danger").addClass("btn-primary")},"click #-loginLink":function(){this.$el.attr("action","/login"),this.$id("loginLink").hide(),this.$id("resetLink").show(),this.$id("login").select(),this.$id("password").attr("placeholder",i("core","LOG_IN_FORM:LABEL:PASSWORD")),this.$(".logInForm-submit-label").text(i("core","LOG_IN_FORM:SUBMIT:LOG_IN")),this.resetting=!1,this.onModeSwitch()},"click #-resetLink":function(){this.$el.attr("action","/resetPassword/request"),this.$id("resetLink").hide(),this.$id("loginLink").show(),this.$id("login").select(),this.$id("password").val("").attr("placeholder",i("core","LOG_IN_FORM:LABEL:NEW_PASSWORD")),this.$(".logInForm-submit-label").text(i("core","LOG_IN_FORM:SUBMIT:RESET")),this.resetting=!0,this.onModeSwitch()}},initialize:function(){this.resetting=!1,this.originalTitle=null,this.$title=null,this.$submit=null},destroy:function(){this.$title=null,this.$submit=null},afterRender:function(){this.$id("login").focus(),this.$id("loginLink").hide(),this.$title=this.getTitleEl(),this.$submit=this.$(".logInForm-submit"),this.originalTitle=this.$title.text()},submitForm:function(){if(!this.$submit.hasClass("btn-primary"))return!1;var e={login:this.$id("login").val(),password:this.$id("password").val(),socketId:this.socket.getId()};if(!e.login.length||!e.password.length)return!1;this.resetting&&(e.subject=i("core","LOG_IN_FORM:RESET:SUBJECT"),e.text=i("core","LOG_IN_FORM:RESET:TEXT",{appUrl:window.location.origin,resetUrl:window.location.origin+"/resetPassword/{REQUEST_ID}"})),this.$el.addClass("logInForm-loading"),this.$submit.prop("disabled",!0),this.$(".btn-link").prop("disabled",!0);var n=this.ajax({type:"POST",url:this.el.action,data:JSON.stringify(e)}),o=this;return n.done(function(e){o.resetting?s.msg.show({type:"info",time:5e3,text:i("core","LOG_IN_FORM:RESET:MSG:SUCCESS")}):(o.$submit.removeClass("btn-primary").addClass("btn-success"),t.reload(e))}),n.fail(function(t){if(o.$submit.removeClass("btn-primary").addClass("btn-danger"),o.resetting){var e=t.responseJSON&&t.responseJSON.error?t.responseJSON.error:{};s.msg.show({type:"error",time:5e3,text:i.has("core","LOG_IN_FORM:RESET:MSG:"+e.message)?i("core","LOG_IN_FORM:RESET:MSG:"+e.message):i("core","LOG_IN_FORM:RESET:MSG:FAILURE")})}}),n.always(function(){o.$submit&&(o.$submit.attr("disabled",!1),o.$(".btn-link").prop("disabled",!1),o.$el.removeClass("logInForm-loading"),o.$("[autofocus]").focus()),o.resetting&&o.$id("loginLink").click()}),!1},getTitleEl:function(){var t=this.$el.closest(".modal-content");return t.length?t.find(".modal-title"):this.$el.closest(".page").find(".page-breadcrumbs > :last-child")},onModeSwitch:function(){this.$title.text(this.resetting?i("core","LOG_IN_FORM:TITLE:RESET"):this.originalTitle),this.$submit.removeClass("btn-danger").addClass("btn-primary")}})});