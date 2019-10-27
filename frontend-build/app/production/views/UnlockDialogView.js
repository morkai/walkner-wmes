define(["underscore","app/i18n","app/viewport","app/core/View","app/data/dictionaries","app/data/orgUnits","app/prodLines/ProdLineCollection","app/production/templates/unlockDialog"],function(i,t,o,e,s,n,a,r){"use strict";return e.extend({template:r,dialogClassName:"production-modal",events:{submit:function(i){i.preventDefault();var t=this.$id("list").find(".active").text().trim(),o=this.$('input[name="station"]:checked').val();if(t&&o){var e=this.$id("submit")[0];if(!e.disabled){e.disabled=!0;var s={prodLine:t,station:+o,login:this.$id("login").val(),password:this.$id("password").val()};this.socket.emit("production.unlock",s,this.handleUnlockResponse.bind(this))}}},"click #-list .btn":function(i){this.$id("list").find(".active").removeClass("active"),this.$(i.currentTarget).addClass("active")},"click .btn":function(){this.options.vkb&&this.options.vkb.hide()},"focus [data-vkb]":function(i){this.options.embedded&&this.options.vkb&&this.options.vkb.show(i.target)}},destroy:function(){this.options.vkb&&this.options.vkb.hide()},getTemplateData:function(){return{type:"unlock",prodLine:""}},afterRender:function(){this.loadLines(),this.$('input[name="station"][value="1"]').click()},selectActiveLine:function(){var i=this.$id("list").find(".active");i.length&&i[0].scrollIntoView({block:"center"})},loadLines:function(){var t=this;t.$id("submit").prop("disabled",!0);var o=t.ajax({url:"/production/getActiveLines?subdivisionType=assembly"});o.fail(function(){t.$(".fa-spin").removeClass("fa-spin")}),o.done(function(o){var e="";i.forEach(o.collection,function(t){e+='<button type="button" class="btn btn-lg btn-default">'+i.escape(t._id)+"</button>"}),t.$id("list").html(e),t.$id("submit").prop("disabled",!1),t.options.vkb&&t.options.vkb.reposition()})},onDialogShown:function(i){this.closeDialog=i.closeDialog.bind(i)},closeDialog:function(){},handleUnlockResponse:function(t,e){if(t){this.$id("password").val(""),"INVALID_PASSWORD"===t.message?this.$id("password").focus():this.$id("login").val("").focus();var a=t.code||t.message;return o.msg.show({type:"error",time:3e3,text:this.t.has("unlockDialog:error:"+a)?this.t("unlockDialog:error:"+a):this.t("unlockDialog:error:UNLOCK_FAILURE")}),this.$id("submit").prop("disabled",!1)}this.model.get("prodLine")||i.forEach(e.dictionaries,function(i,t){var o=s[t];o&&o.reset(i)}),delete e.dictionaries;var r=e.prodShift;if(r?(r.prodShiftOrder=e.prodShiftOrder,r.prodDowntimes=e.prodDowntimes):r={},!this.model.get("prodLine")){var d=n.getByTypeAndId("prodLine",e.prodLine);if(null===d)return this.closeDialog();r=i.assign(r,n.getAllForProdLine(d))}r.station=e.station>=1&&e.station<=7?e.station:0,this.model.setSecretKey(e.secretKey,r,!0),this.closeDialog()}})});