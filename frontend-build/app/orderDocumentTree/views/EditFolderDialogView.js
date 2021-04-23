define(["app/viewport","app/core/views/FormView","app/core/util/idAndLabel","app/data/prodFunctions","app/orderDocumentTree/templates/editFolderDialog"],function(e,t,i,o,s){"use strict";return t.extend({template:s,serializeToForm:function(){return{name:this.folder.get("name"),funcs:(this.folder.get("funcs")||[]).join(",")}},serializeForm:function(e){return e.funcs=(e.funcs||"").split(",").filter(e=>!!e.length),e},request:function(e){return this.promised(this.model.editFolder(this.folder,e))},getFailureText:function(){return this.t("editFolder:msg:failure")},handleSuccess:function(){"function"==typeof this.closeDialog&&this.closeDialog(),e.msg.show({type:"success",time:2500,text:this.t("editFolder:msg:success")})},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e),this.$id("name").focus()},afterRender:function(){t.prototype.afterRender.apply(this,arguments),this.$id("funcs").select2({placeholder:" ",allowClear:!0,multiple:!0,data:o.map(i)})}})});