define(["underscore","jquery","app/user","app/viewport","app/core/views/FormView","app/core/util/uuid","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","../dictionaries","app/wmes-fap-entries/templates/addForm","app/wmes-fap-entries/templates/addFormUpload","app/wmes-fap-entries/templates/notificationsPopover"],function(e,t,i,a,o,n,d,s,r,l,u,p,c){"use strict";return o.extend({template:u,events:e.assign({mousedown:function(e){this.$(e.target).closest(".fap-addForm-warning").length||this.hideWarning()},"click #-submit":function(){this.showWarning()},"click #-reject":function(){this.hideWarning()},"select2-focus":function(e){this.hideWarning()},"click #-cancel":function(){this.trigger("cancel")},'click a[data-action="removeUpload"]':function(e){var t=this.$(e.target).closest(".fap-addForm-upload")[0].dataset.uploadId,i=this.model;return i.uploading&&i.uploading.upload._id===t?(i.uploading.abort(),i.uploading=null):(i.uploadQueue=i.uploadQueue.filter(function(e){return e._id!==t}),i.uploadedFiles=i.uploadedFiles.filter(function(e){return e._id!==t})),this.removeUpload(t),!1},"change #-category":function(e){var t=e.target;this.model.attributes[t.name]=t.value,this.saveInputFocus(t),this.updateNotifications(),this.resolveSubdivisions()},"change #-lines, #-subdivisions":function(e){var t=e.target;this.model.attributes[t.name]=t.value.length?t.value.split(","):[],this.saveInputFocus(t)},"input #-orderNo, #-problem":function(e){this.model.attributes[e.target.name]=e.target.value,e.target.setCustomValidity(""),this.saveInputFocus(e.target),"orderNo"===e.target.name&&9===e.target.value.length&&this.validateOrder()},"focus input, textarea":function(e){this.saveInputFocus(e.target)},"blur input, textarea":function(e){this.saveInputFocus(e.target)},"change #-orderNo":function(){this.validateOrder()},"click .fap-addForm-upload-name":function(e){this.showUploadNameEditor(this.$(e.target).closest(".fap-addForm-upload")[0].dataset.uploadId)}},o.prototype.events),initialize:function(){o.prototype.initialize.apply(this,arguments),this.reloadLock=i.lockReload();var e=this.model;e.uploadQueue||(e.uploadQueue=[],e.uploading=null,e.uploadedFiles=[]),this.listenTo(l.categories,"reset change",this.setUpCategorySelect2)},destroy:function(){o.prototype.destroy.apply(this,arguments),this.model.focusedInput&&this.saveInputFocus(this.$id(this.model.focusedInput.name)[0]),t(".fap-addForm-backdrop").remove(),i.unlockReload(this.reloadLock),l.unload()},afterRender:function(){var e=this;o.prototype.afterRender.apply(e,arguments),l.load();var i=t(".fap-addForm-backdrop");i.length||(i=t('<div class="fap-addForm-backdrop"></div>').appendTo("body").on("click",function(){e.trigger("cancel")})),e.$id("lines").select2({dropdownCssClass:"fap-addForm-select2",multiple:!0,allowClear:!0,placeholder:" ",data:s.getActiveByType("prodLine").map(d)}),e.renderUploads(),e.setUpCategorySelect2(),e.setUpSubdivisionsSelect2(),e.setUpOwnerSelect2(),e.setUpDnd(e.$el),e.setUpDnd(i),e.updateNotifications(),e.focusInput()},showWarning:function(){this.$id("warning").removeClass("hidden")},hideWarning:function(){this.$id("warning").addClass("hidden")},renderUploads:function(){var e=this,i=e.$id("uploads");e.model.uploadedFiles.forEach(function(t){e.renderUpload(t,!0).appendTo(i)}),e.model.uploading&&e.renderUpload(e.model.uploading.upload,!1).appendTo(i),e.model.uploadQueue.forEach(function(t){e.renderUpload(t,!1).appendTo(i)}),i[0].childElementCount>1&&i[0].firstElementChild.classList.add("hidden"),i.popover({placement:"left",trigger:"hover",container:i.parent()[0],selector:".fap-addForm-upload",html:!0,content:function(){if(!e.$el.hasClass("fap-addForm-editing")){var t=this.dataset.uploadId,i=e.findUpload(t);if(i&&i.img)return i.img}},template:function(e){return t(e).addClass("fap-addForm-upload-popover").attr("data-upload-id",this.dataset.uploadId)}})},renderUpload:function(e,t){return this.renderPartial(p,{uploaded:t,upload:e})},setUpCategorySelect2:function(){this.$id("category").select2({dropdownCssClass:"fap-addForm-select2",data:l.categories.where({active:!0}).map(d)})},setUpSubdivisionsSelect2:function(){this.$id("subdivisions").select2({dropdownCssClass:"fap-addForm-select2",placeholder:" ",allowClear:!0,multiple:!0,data:s.getActiveByType("division").map(function(e){var t=e.getLabel();return{text:t,children:s.getChildren(e).filter(function(e){return!e.get("deactivatedAt")}).map(function(e){return{id:e.id,text:e.getLabel(),divisionText:t}})}}),formatSelection:function(e,t,i){return i(e.divisionText+" \\ "+e.text)}})},setUpOwnerSelect2:function(){var e=this.$id("owner");e.length&&r(e,{view:this,noPersonnelId:!0,width:"100%",dropdownCssClass:"fap-addForm-select2"})},setUpDnd:function(e){e.on("drag dragstart dragend dragover dragenter dragleave drop",function(e){e.preventDefault(),e.stopPropagation()}).on("drop",this.onDrop.bind(this))},onDrop:function(t){var i=this,o=i.model,d=Array.prototype.slice.call(t.originalEvent.dataTransfer.files);return(o.uploading?1:0)+o.uploadQueue.length+o.uploadedFiles.length+d.length>5?(a.msg.show({type:"warning",time:2500,text:i.t("upload:tooMany",{max:5})}),!1):(d.forEach(function(t){var a=null;0===t.type.indexOf("image/")&&((a=new Image).src=URL.createObjectURL(t)),o.uploadQueue.push({_id:n(),file:t,name:t.name,img:a});var d=i.$id("uploads");d[0].firstElementChild.classList.add("hidden"),i.renderUpload(e.last(o.uploadQueue),!1).appendTo(d)}),o.uploading||i.uploadNext(),!1)},uploadNext:function(){var e=this,t=e.model,i=t.uploadQueue.shift();if(i){e.$id("submit").prop("disabled",!0);var o=e.$id("uploads"),n=new FormData;n.append("file",i.file),t.uploading=e.ajax({type:"POST",url:"/fap/entries;upload",data:n,processData:!1,contentType:!1}),t.uploading.upload=i,t.uploading.fail(function(){e.removeUpload(i._id),"abort"!==t.uploading.statusText&&a.msg.show({type:"error",time:2500,text:e.t("upload:failure",{file:i.file.name})})}),t.uploading.done(function(e){o.find('[data-upload-id="'+i._id+'"]').find(".fa-spinner").removeClass("fa-spinner fa-spin").addClass("fa-times"),i.hash=e,t.uploadedFiles.push(i)}),t.uploading.always(function(){t.uploading=null,e.uploadNext()})}else e.$id("submit").prop("disabled",!1)},removeUpload:function(e){var t=this.$id("uploads");t.find('[data-upload-id="'+e+'"]').remove(),this.$('.popover[data-upload-id="'+e+'"]').remove(),1===t[0].childElementCount&&t[0].firstElementChild.classList.remove("hidden")},saveInputFocus:function(e){if(e){var t=this.$(e).closest(".select2-container");t.length&&(e=t.next()[0]),this.model.focusedInput={name:e.name,selectionStart:e.selectionStart,selectionEnd:e.selectionEnd}}},focusInput:function(){if(!this.model.focusedInput){var e=this.$id("owner");return e.length||(e=this.$id("orderNo")),void e.focus()}var t=this.$id(this.model.focusedInput.name)[0];if(t){if("TEXTAREA"===t.tagName){var i=t.value;t.value=i.substring(0,this.model.focusedInput.selectionEnd),t.scrollTop=t.scrollHeight,t.value=i}t.setSelectionRange&&t.setSelectionRange(this.model.focusedInput.selectionStart,this.model.focusedInput.selectionEnd);var a=this.$(t);a.prev().hasClass("select2-container")?a.select2("focus"):t.focus()}else this.$id("orderNo").focus()},resolveSubdivisions:function(){var e=this,t=e.$id("orderNo").val(),i=l.categories.get(e.$id("category").val());if(e.resolveSubdivisionsReq&&(e.resolveSubdivisionsReq.abort(),e.resolveSubdivisionsReq=null),i){var a=e.resolveSubdivisionsReq=this.ajax({method:"POST",url:"/fap/entries;resolve-participants",data:JSON.stringify({orderNo:t,category:i})});a.done(function(t){t.subdivisions&&e.$id("subdivisions").select2("val",t.subdivisions)}),a.always(function(){a===e.resolveSubdivisionsReq&&(e.resolveSubdivisionsReq=null)})}},updateNotifications:function(){var e=l.categories.get(this.$id("category").val());(e&&e.get("notifications")||[]).length?this.$id("notifications").removeClass("hidden").popover({placement:"bottom",trigger:"hover",html:!0,content:this.renderPartial(c,{notifications:e.serialize().notifications}),template:function(e){return t(e).addClass("fap-addForm-notifications-popover")}}):this.$id("notifications").addClass("hidden")},validateOrder:function(){var e=this,t=e.$id("orderNo"),i=t.val();if(/^[0-9]{9}$/.test(i)&&"000000000"!==i&&e.model.validatedOrder!==i){e.model.validatedOrder=i;var a=e.ajax({method:"POST",url:"/fap/entries;validate-order?order="+i});a.fail(function(){404===a.status&&t[0].setCustomValidity(e.t("addForm:orderNo:notFound"))}),a.done(function(t){t.lines.length&&(e.$id("lines").select2("val",t.lines).trigger("change"),e.resolveSubdivisions())})}},findUpload:function(e){var t=this.model;if(t.uploading&&t.uploading.upload._id===e)return t.uploading.upload;for(var i=0;i<t.uploadedFiles.length;++i)if(t.uploadedFiles[i]._id===e)return t.uploadedFiles[i];for(var a=0;a<t.uploadQueue.length;++a)if(t.uploadQueue[a]._id===e)return t.uploadQueue[a];return null},showUploadNameEditor:function(e){var i=this,a=i.$id("uploads").find('[data-upload-id="'+e+'"]'),o=i.findUpload(e),n=t('<input type="text" class="form-control fap-addForm-upload-input">').val(o.name);function d(){n.remove(),i.$el.removeClass("fap-addForm-editing")}i.$el.addClass("fap-addForm-editing"),n.on("blur",function(){!function(){var e=n.val().trim();if(!e.length)return;/\.[a-zA-Z0-9]{1,}$/.test(e)||(e+="."+o.name.split(".").pop());o.name=e,a.find(".fap-addForm-upload-name").text(e)}(),d()}),n.on("keydown",function(e){return"Escape"===e.key?(d(),!1):"Enter"===e.key?(e.target.blur(),!1):void 0}),n.appendTo(a).focus()},serializeToForm:function(){var e=this.model.toJSON();return Array.isArray(e.lines)&&(e.lines=e.lines.join(",")),Array.isArray(e.subdivisions)&&(e.subdivisions=e.subdivisions.join(",")),e},serializeForm:function(e){var t=this.$id("owner").select2("data");return t&&(e.owner={id:t.id,label:t.text}),e.lines=(e.lines||"").split(",").filter(function(e){return!!e.length}),e.subdivisions=(e.subdivisions||"").split(",").filter(function(e){return!!e.length}),e.divisions=[],e.lines.forEach(function(t){var i=s.getAllForProdLine(t).division;i&&-1===e.divisions.indexOf(i)&&e.divisions.push(i)}),e.files=this.model.uploadedFiles.map(function(e){return{_id:e.hash,name:e.name}}),e},getFailureText:function(){return this.t("core","FORM:ERROR:addFailure")}})});