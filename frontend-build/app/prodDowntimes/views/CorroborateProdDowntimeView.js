// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time","app/user","app/viewport","app/core/View","app/prodDowntimes/templates/corroborate"],function(e,t,i,r,o,s){"use strict";return o.extend({template:s,events:{"click .btn-success":function(){this.corroborate("confirmed")},"click .btn-danger":function(){this.corroborate("rejected")}},initialize:function(){this.listenTo(this.model,"change:finishedAt",function(){this.$(".prodDowntimes-corroborate-finishedAt").text(t.format(this.model.get("finishedAt"),"YYYY-MM-DD HH:mm:ss"))})},serialize:function(){return{idPrefix:this.idPrefix,model:this.model.serialize(),cancelUrl:this.options.cancelUrl||"#"}},corroborate:function(t){var o=this.$id("decisionComment"),s=this.$(".btn-success").attr("disabled",!0),n=this.$(".btn-danger").attr("disabled",!0),a="confirmed"===t?s:n;a.prepend('<i class="fa fa-spinner fa-spin"></i> ');var c={_id:this.model.id,corroborator:i.getInfo(),status:t,decisionComment:o.val().trim()};this.socket.emit("prodDowntimes.corroborate",c,function(t){t&&(r.msg.show({type:"error",time:5e3,text:e("prodDowntimes","corroborate:msg:failure",{error:t.message})}),s.attr("disabled",!1),n.attr("disabled",!1)),a.find(".fa-spinner").remove()})}})});