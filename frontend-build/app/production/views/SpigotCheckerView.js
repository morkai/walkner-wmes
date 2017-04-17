// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/viewport","app/core/View","app/production/templates/spigotChecker"],function(i,t,e,o,s){"use strict";return o.extend({template:s,dialogClassName:"production-modal production-spigotChecker-modal",events:{submit:function(){var i=this.$id("submit").prop("disabled",!0),o=this.$id("nc12").val().match(/([0-9]{12})/),s=(o?o[1]:"").trim();return s.length&&this.model.checkSpigot(this.options.component,s)?(e.msg.show({type:"success",time:3e3,text:t("production",t("production","spigotChecker:success"))}),this.closeDialog()):(this.$id("nc12")[0].setCustomValidity(t("production","spigotChecker:nc12:invalid")),this.timers.submit=setTimeout(function(){i.prop("disabled",!1).click()},1)),!1}},initialize:function(){this.lastKeyPressAt=0,i(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){i(window).off("."+this.idPrefix)},serialize:function(){return{idPrefix:this.idPrefix,component:this.options.component,embedded:this.options.embedded}},onDialogShown:function(i){this.closeDialog=i.closeDialog.bind(i),this.$id("nc12").focus()},closeDialog:function(){},onKeyDown:function(i){return 8===i.keyCode?(this.lastKeyPressAt=Date.now(),this.$id("nc12").val("")[0].setCustomValidity(""),!1):void 0},onKeyPress:function(i){if(13===i.keyCode&&this.$id("submit").click(),!(i.keyCode<32||i.keyCode>126)){var t=Date.now(),e=t-this.lastKeyPressAt>333?"":this.$id("nc12").val(),o=String.fromCharCode(i.keyCode);return this.$id("nc12").val(e+o)[0].setCustomValidity(""),this.lastKeyPressAt=t,!1}}})});