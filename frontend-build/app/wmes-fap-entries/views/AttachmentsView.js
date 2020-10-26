define(["underscore","jquery","app/user","app/viewport","app/core/View","app/core/util/uuid","app/planning/util/contextMenu","app/wmes-fap-entries/templates/attachments","app/wmes-fap-entries/templates/attachment"],function(e,t,a,i,n,d,o,l,s){"use strict";return n.extend({template:l,events:{'mouseenter .fap-attachment[data-preview="1"]':function(e){this.showPreview(e.currentTarget.dataset.attachmentId)},"mouseleave .fap-attachment":function(){this.hidePreview()},mouseleave:function(){this.hidePreview()},'click [data-action="removeUpload"]':function(e){var t=this.$(e.target).closest(".fap-attachment")[0].dataset.attachmentId,a=this.model;return a.uploading&&a.uploading.upload._id===t?(a.uploading.abort(),a.uploading=null):(a.uploadQueue=a.uploadQueue.filter(function(e){return e._id!==t}),a.uploadedFiles=a.uploadedFiles.filter(function(e){return e._id!==t})),this.removeAttachment(t),!1},'click [data-action="showMenu"]':function(e){var t=this.$(e.target).closest(".fap-attachment"),i=this.findAttachment(t[0].dataset.attachmentId),n=[{icon:"fa-edit",label:this.t("attachments:menu:rename"),handler:this.handleRenameAttachment.bind(this,i._id)}];return(a.isAllowedTo("FAP:MANAGE")||i.user&&i.user.id===a.data._id)&&n.push({icon:"fa-times",label:this.t("attachments:menu:remove"),handler:this.handleRemoveAttachment.bind(this,i._id)}),o.show(this,e.pageY,e.pageX,n),!1},"click #-upload":function(){this.$id("files").click()},"change #-files":function(e){e.target.files.length&&this.upload(e.target.files)}},initialize:function(){var a=this.model;a.uploadQueue||(a.uploadQueue=[],a.uploading=null,a.uploadedFiles=[]),this.listenTo(a,"focusAttachment",this.focusAttachment),this.listenTo(a,"change:attachments",e.debounce(this.renderAttachments.bind(this),1)),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("paste."+this.idPrefix,this.onPaste.bind(this))},destroy:function(){t(document.body).off("."+this.idPrefix),t(window).off("."+this.idPrefix)},afterRender:function(){this.$(".fap-details-panel-bd").on("scroll",this.hideEditor.bind(this)),this.$id("upload").toggleClass("hidden",!this.model.serializeDetails().auth.attachments),this.setUpDnd(),this.renderAttachments()},setUpDnd:function(){var e=this,a="drag dragstart dragend dragover dragenter dragleave drop".split(" ").map(function(t){return t+"."+e.idPrefix}).join(" ");t(document.body).on(a,e.onDrag.bind(e)).on("drop."+e.idPrefix,e.onDrop.bind(e))},renderAttachments:function(){var e=this,t=e.$id("attachments"),a=t.children().last();t.find(".fap-attachment").remove(),e.model.serializeDetails().attachments.forEach(function(t){e.renderAttachment(t,!0).insertBefore(a)}),e.model.uploadedFiles.forEach(function(t){e.renderAttachment(t,!0).insertBefore(a)}),e.model.uploading&&e.renderAttachment(e.model.uploading.upload,!1).insertBefore(a),e.model.uploadQueue.forEach(function(t){e.renderAttachment(t,!1).insertBefore(a)}),e.attachmentToRename&&(e.handleRenameAttachment(e.attachmentToRename),e.attachmentToRename=null)},renderAttachment:function(e,t){return this.renderPartial(s,{entryId:this.model.id,uploaded:t,attachment:e})},findAttachment:function(t){var a=this.model,i=e.findWhere(a.get("attachments"),{_id:t});if(i)return i;if(a.uploading&&a.uploading.upload._id===t)return a.uploading.upload;for(var n=0;n<a.uploadedFiles.length;++n)if(a.uploadedFiles[n]._id===t)return a.uploadedFiles[n];for(var d=0;d<a.uploadQueue.length;++d)if(a.uploadQueue[d]._id===t)return a.uploadQueue[d];return null},showPreview:function(e){var t=this.findAttachment(e);if(t){var a=this.$id("preview").removeClass("hidden").attr("data-attachment-id",e);a.find("span").text(t.name),a.find("img").prop("src",t.src||"/fap/entries/"+this.model.id+"/attachments/"+e)}},hidePreview:function(e){e&&this.$id("preview").attr("data-attachment-id")!==e||this.$id("preview").addClass("hidden")},focusAttachment:function(e){var t=this.$('.fap-attachment[data-attachment-id="'+e+'"]');t.length&&(t[0].scrollIntoViewIfNeeded?t[0].scrollIntoViewIfNeeded():t[0].scrollIntoView(),this.$(".highlight").removeClass("highlight"),clearTimeout(this.timers.highlight),t.addClass("highlight"),this.timers.highlight=setTimeout(function(){t.removeClass("highlight")},1100),"1"===t[0].dataset.preview&&this.showPreview(e))},onKeyDown:function(e){"Escape"===e.originalEvent.key&&this.hidePreview()},onPaste:function(e){var t=e.originalEvent.clipboardData;t&&t.files&&t.files.length&&t.items.length===t.files.length&&this.upload(t.files,!0)},onDrag:function(e){e.preventDefault(),e.stopPropagation()},onDrop:function(e){var t=e.originalEvent.dataTransfer;return t&&t.files&&t.files.length&&this.upload(t.files,!1),!1},upload:function(t,a){var n=this;if(n.model.serializeDetails().auth.attachments){var o=n.model,l={};(o.get("attachments")||[]).forEach(function(e){l[e.name+e.size]=!0}),o.uploading&&(l[o.uploading.upload.name+o.uploading.upload.file.size]=!0),o.uploadQueue.forEach(function(e){l[e.name+e.file.size]=!0}),o.uploadedFiles.forEach(function(e){l[e.name+e.file.size]=!0});var s=Array.prototype.slice.call(t).filter(function(e){return!l[e.name+e.size]&&(l[e.name+e.size]=!0,!0)});if(s.length){if((o.uploading?1:0)+o.uploadQueue.length+o.uploadedFiles.length+s.length>5)return i.msg.show({type:"warning",time:2500,text:n.t("upload:tooMany",{max:5})}),!1;var r=n.$id("attachments").children().last();s.forEach(function(t){o.uploadQueue.push({_id:d(),type:t.type,name:t.name,file:t,src:0===t.type.indexOf("image/")?URL.createObjectURL(t):null,rename:a&&1===s.length&&0===t.type.indexOf("image/")}),n.renderAttachment(n.model.serializeAttachment(e.last(o.uploadQueue)),!1).insertBefore(r)}),o.uploading||n.uploadNext()}}else i.msg.show({type:"warning",time:2500,text:n.t("upload:auth")})},uploadNext:function(){var e=this,t=e.model,a=t.uploadQueue.shift();if(!a)return e.saveUploads();e.$id("submit").prop("disabled",!0);var n=e.$id("attachments"),d=new FormData;d.append("file",a.file),t.uploading=e.ajax({type:"POST",url:"/fap/entries;upload",data:d,processData:!1,contentType:!1}),t.uploading.upload=a,t.uploading.fail(function(){e.removeAttachment(a._id),"abort"!==t.uploading.statusText&&i.msg.show({type:"error",time:2500,text:e.t("upload:failure",{file:a.file.name})})}),t.uploading.done(function(e){n.find('[data-attachment-id="'+a._id+'"]').find(".fa-spin").removeClass("fa-spin"),a.hash=e,t.uploadedFiles.push(a)}),t.uploading.always(function(){t.uploading=null,e.uploadNext()})},removeAttachment:function(e){this.hidePreview(e),this.$id("attachments").find('[data-attachment-id="'+e+'"]').remove()},saveUploads:function(){var e=this;if(e.model.uploadedFiles.length){var t=(new Date).toISOString(),i=a.getInfo(),n=e.model.uploadedFiles.map(function(a){return a.rename&&(e.attachmentToRename=a.hash),{_id:a.hash,date:t,user:i,type:a.file.type,size:a.file.size,name:a.name}});e.model.uploadedFiles=[],e.model.change("attachments",n,null)}},hideEditor:function(){this.$(".fap-editor").length&&this.model.trigger("editor:hide")},handleRenameAttachment:function(e){this.model.trigger("editor:show",this.$('[data-attachment-id="'+e+'"]'),"attachment")},handleRemoveAttachment:function(e){var t=[this.findAttachment(e)];this.model.handleChange({date:new Date,user:a.getInfo(),data:{attachments:[t,null]},comment:""}),this.model.update({attachments:t})}})});