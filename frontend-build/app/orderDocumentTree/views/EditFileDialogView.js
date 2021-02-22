define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/views/FormView","app/core/util/padString","app/core/util/fileIcons","app/mrpControllers/util/setUpMrpSelect2","app/orderDocumentTree/allowedTypes","app/orderDocumentTree/util/pasteDateEvents","app/orderDocumentTree/templates/editFileDialog"],function(t,e,i,n,s,o,r,a,c,d,l,u){"use strict";return o.extend({template:u,dialogClassName:"orderDocuments-editFile-dialog",events:t.assign({'change input[name="folders[]"]':function(){var t=this.$('input[name="folders[]"]');t.first().prop("required",0===t.filter(":checked").length)},"click #-components-addByName-toggle":function(){return this.toggleAddByName(!0),!1},"click #-components-addByName button":function(){return this.submitAddByName(),!1},"keydown #-components-addByName":function(t){return"Escape"===t.key?(this.toggleAddByName(!1),!1):"Enter"===t.key?(this.submitAddByName(),!1):void 0},"focusin #-components-addByName":function(){clearTimeout(this.timers.hideAddByName)},"focusout #-components-addByName":function(){this.timers.hideAddByName=setTimeout(this.toggleAddByName.bind(this,!1),1)},"change #-stations":function(t){t.target.value=t.target.value.split(/[^0-9]+/).filter(function(t){return t>=1&&t<=7}).sort(function(t,e){return t-e}).join(", ")},'click .btn[data-action="forceConvert"]':function(t){var e=this,i=t.currentTarget;i.classList.add("active"),i.disabled=!0;var n=e.ajax({method:"POST",url:"/orderDocuments/uploads;forceConvert",data:JSON.stringify({nc15:this.model.id,hash:i.dataset.hash})});n.fail(function(){i.disabled=!1,s.msg.show({type:"error",time:2500,text:e.t("editFile:forceConvert:failure")})}),n.always(function(){i.classList.remove("active")})}},l,o.prototype.events),initialize:function(t){if(o.prototype.initialize.apply(this,arguments),this.tree=t.tree,!this.tree)throw new Error("The `tree` option is required!")},getTemplateData:function(){var e=this.tree;return{folders:t.map(this.model.get("folders"),function(t){return{id:t,path:e.getPath(e.folders.get(t)).map(function(t){return t.getLabel()}).join(" > ")}}).filter(function(t){return t.path.length>0}),files:t.map(this.model.get("files"),function(t){var e=d[t.type];return Object.assign({ext:e,icon:a.getByExt(e)},t)})}},serializeToForm:function(){var t=this.model.toJSON();return t.mrps=t.mrps.join(","),t.components="",t.stations=t.stations.join(", "),t.files=t.files.map(function(t){return{hash:t.hash,type:t.type,date:n.utc.format(t.date,"YYYY-MM-DD")}}),t},serializeForm:function(t){return t.mrps=this.$id("mrps").select2("data").map(function(t){return t.id}),t.components=this.$id("components").select2("data").map(function(t){return{nc12:/^0{10,}/.test(t.id)?"000000000000":t.id,name:t.text,searchName:t.text.toUpperCase().replace(/[^A-Z0-9]+/g,"")}}),t.stations=(t.stations||"").split(/[^0-9]+/).filter(function(t){return t>=1&&t<=7}).sort(function(t,e){return t-e}),t},request:function(t){return this.promised(this.tree.editFile(this.model,t))},getFailureText:function(){return this.t("editFile:msg:failure")},handleSuccess:function(){t.isFunction(this.closeDialog)&&this.closeDialog(),s.msg.show({type:"success",time:2500,text:this.t("editFile:msg:success")})},onDialogShown:function(t){this.closeDialog=t.closeDialog.bind(t)},afterRender:function(){o.prototype.afterRender.apply(this,arguments),this.setUpMrpsSelect2(),this.setUpComponentsSelect2()},setUpMrpsSelect2:function(){var t=this;c(t.$id("mrps"),{view:this,width:"100%",extra:function(e){return[{id:"ANY",text:t.t("files:mrps:any")}].concat(e)}})},setUpComponentsSelect2:function(){var e=0;this.$id("components").select2({width:"100%",placeholder:"12NC...",allowClear:!0,multiple:!0,minimumInputLength:8,ajax:{cache:!0,quietMillis:300,url:function(t){var e="/orders/components?limit(100)&_id=";return/^[0-9]{12}$/.test(t)?e+="string:"+t:e+="regex="+encodeURIComponent("^"+t),e},results:function(t){return{results:(t.collection||[]).map(function(t){return{id:t._id,text:t.name.trim()}})}}},formatSelection:function(e){return t.escape(/^0{10,}/.test(e.id)?e.text:e.id)},formatResult:function(e){var i=['<span class="text-mono">',t.escape(r.start(e.id,12,"0")),"</span>"];return e.text&&e.text!==e.id&&i.push('<span class="text-small">:',t.escape(e.text)+"</span>"),i.join("")}}).select2("data",(this.model.get("components")||[]).map(function(t){var i=t.nc12;return"000000000000"===i&&(e+=1,i=r.start(e.toString(),12,"0")),{id:i,text:t.name}}))},toggleAddByName:function(t){var e=this.$id("components-addByName").toggleClass("hidden",!t);t&&e.find("input").val("").focus()},submitAddByName:function(){this.toggleAddByName(!1);var t=this.$id("components-addByName").find("input").val().trim();if(""!==t.toUpperCase().replace(/[^A-Z0-9]+/g,"")){var e=this.$id("components"),i=e.select2("data"),n=t;if(!/^[0-9]{12}$/.test(n)){var s=0;i.forEach(function(t){/^0{10,}/.test(t.id)&&(s=Math.max(+t.id,s))}),n=r.start((s+1).toString(),12,"0")}i.push({id:n,text:t}),e.select2("data",i)}}})});