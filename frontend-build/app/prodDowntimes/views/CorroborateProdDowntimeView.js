define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/View","./decorateProdDowntime","app/prodDowntimes/templates/corroborate","i18n!app/nls/prodDowntimes"],function(e,t,n,r,i,o,a,s){return o.extend({template:s,events:{"click .btn-success":function(){this.corroborate("confirmed")},"click .btn-danger":function(){this.corroborate("rejected")}},initialize:function(){this.idPrefix=e.uniqueId("cpdv"),this.listenTo(this.model,"change:finishedAt",function(){this.$(".prodDowntimes-corroborate-finishedAt").text(n.format(this.model.get("finishedAt"),"YYYY-MM-DD HH:mm:ss"))})},serialize:function(){return{idPrefix:this.idPrefix,model:a(this.model),cancelUrl:this.options.cancelUrl||"#"}},corroborate:function(e){var n=this.$id("decisionComment"),o=this.$(".btn-success").attr("disabled",!0),a=this.$(".btn-danger").attr("disabled",!0),s="confirmed"===e?o:a;s.prepend('<i class="fa fa-spinner fa-spin"></i> ');var l={_id:this.model.id,corroborator:r.getInfo(),status:e,decisionComment:n.val().trim()};this.socket.emit("prodDowntimes.corroborate",l,function(e){e&&(i.msg.show({type:"error",time:5e3,text:t("prodDowntimes","corroborate:msg:failure")}),o.attr("disabled",!1),a.attr("disabled",!1)),s.find(".fa-spinner").remove()})}})});