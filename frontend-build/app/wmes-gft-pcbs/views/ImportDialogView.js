define(["app/viewport","app/core/View","app/wmes-gft-pcbs/templates/import"],function(t,e,s){"use strict";return e.extend({template:s,nlsDomain:"wmes-gft-pcbs",events:{submit:"upload"},onDialogShown:function(t){this.closeDialog=t.closeDialog.bind(t)},closeDialog:function(){},upload:function(e){e.preventDefault();const s=this.$("[type=submit]").attr("disabled",!0),i=this.ajax({type:"POST",url:"/gft/pcbs;import",data:new FormData(this.el),processData:!1,contentType:!1});i.done(e=>{this.closeDialog(),t.msg.show({type:"success",time:2500,text:this.t("import:success",{count:e.count})})}),i.fail(()=>{s.attr("disabled",!1),t.msg.show({type:"error",time:2500,text:this.t("import:failure")})})}})});