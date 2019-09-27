define(["jquery","app/i18n","app/viewport","app/core/View","app/production/templates/spigotChecker"],function(i,t,e,o,s){"use strict";return o.extend({template:s,dialogClassName:"production-modal production-spigotChecker-modal",events:{submit:function(){return this.checkSpigot(!1),!1},"click #-endWork":function(){this.model.endWork(),this.closeDialog()}},remoteTopics:function(){var i={};return i["production.spigotCheck.scanned."+this.model.prodLine.id]="onSpigotScanned",i},initialize:function(){this.lastKeyPressAt=0,i(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){i(window).off("."+this.idPrefix)},getTemplateData:function(){return{component:this.options.component,embedded:this.options.embedded}},afterRender:function(){this.notifySpigotCheckRequest()},checkSpigot:function(i){var o=this.$id("submit").prop("disabled",!0),s=this.$id("nc12").val(),n=s.match(/([0-9]{12})/),d=(n?n[1]:"").trim();d.length&&this.model.checkSpigot(this.options.component,d)?(e.msg.show({type:"success",time:3e3,text:t("production","spigotChecker:success")}),this.pubsub.publish("production.spigotCheck.success."+this.model.prodLine.id,{prodLine:this.model.prodLine.id,component:this.options.component,orderNo:this.model.prodShiftOrder.get("orderId"),input:s,nc12:d,source:"spigotChecker"}),this.closeDialog()):(this.$id("nc12")[0].setCustomValidity(t("production","spigotChecker:nc12:invalid")),this.timers.submit=setTimeout(function(){o.prop("disabled",!1).click()},1),i&&this.pubsub.publish("production.spigotCheck.failure."+this.model.prodLine.id,{prodLine:this.model.prodLine.id,component:this.options.component,orderNo:this.model.prodShiftOrder.get("orderId"),input:s,source:"spigotChecker"}))},notifySpigotCheckRequest:function(){clearTimeout(this.timers.notifySpigotCheckRequest),this.timers.notifySpigotCheckRequest=setTimeout(this.notifySpigotCheckRequest.bind(this),5e3),this.pubsub.publish("production.spigotCheck.requested."+this.model.prodLine.id,{prodLine:this.model.prodLine.id,component:this.options.component,orderNo:this.model.prodShiftOrder.get("orderId"),source:"spigotChecker"})},onSpigotScanned:function(i){this.$id("nc12").val(i.nc12)[0].setCustomValidity(""),this.checkSpigot(!0)},onDialogShown:function(i){this.closeDialog=i.closeDialog.bind(i),this.$id("nc12").focus()},closeDialog:function(){},onKeyDown:function(i){if(8===i.keyCode)return this.lastKeyPressAt=Date.now(),this.$id("nc12").val("")[0].setCustomValidity(""),!1},onKeyPress:function(i){if(13===i.keyCode&&this.$id("submit").click(),!(i.keyCode<32||i.keyCode>126)){var t=Date.now(),e=t-this.lastKeyPressAt>333?"":this.$id("nc12").val(),o=String.fromCharCode(i.keyCode);return this.$id("nc12").val(e+o)[0].setCustomValidity(""),this.lastKeyPressAt=t,!1}}})});