define(["jquery","app/user","../View","app/core/templates/logInForm","i18n!app/nls/core"],function(s,t,i,n){return i.extend({template:n,events:{submit:"submitForm","keypress input":function(){this.$submitEl.removeClass("btn-danger").addClass("btn-primary")}},destroy:function(){this.$submitEl=null},afterRender:function(){this.$('input[name="login"]').focus(),this.$submitEl=this.$(".logInForm-submit")},submitForm:function(){if(!this.$submitEl.hasClass("btn-primary"))return!1;var i={login:this.$("[name=login]").val(),password:this.$("[name=password]").val(),socketId:this.socket.getId()};if(0===i.login.length||0===i.password.length)return!1;this.$el.addClass("logInForm-loading"),this.$submitEl.attr("disabled",!0);var n=s.ajax({type:"POST",url:this.el.action,data:JSON.stringify(i)}),e=this;return n.done(function(s){e.$submitEl.removeClass("btn-primary").addClass("btn-success"),t.reload(s)}),n.fail(function(){e.$submitEl.removeClass("btn-primary").addClass("btn-danger"),e.$submitEl.attr("disabled",!1),e.$el.removeClass("logInForm-loading"),e.$("[autofocus]").focus()}),!1}})});