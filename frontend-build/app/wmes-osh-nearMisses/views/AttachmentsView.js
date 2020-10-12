define(["jquery","app/viewport","app/core/View","app/core/views/DialogView","app/core/util/fileIcons","app/planning/util/contextMenu","../NearMiss","app/wmes-osh-nearMisses/templates/attachments/panel","app/wmes-osh-nearMisses/templates/attachments/preview","app/wmes-osh-nearMisses/templates/attachments/delete"],function(e,t,i,n,s,a,h,r,d,o){"use strict";return i.extend({template:r,events:{"click .osh-attachment":function(e){const t=this.$(e.currentTarget);if(0===e.button&&!e.ctrlKey&&t.find(".osh-attachment-img").length)return this.showPreview(t[0].dataset.id),!1},"contextmenu .osh-attachment":function(e){e.preventDefault();const t=this.model.get("attachments").find(t=>t._id===e.currentTarget.dataset.id);if(!t)return;const i=[{icon:"fa-external-link",label:this.t("attachments:open"),handler:this.handleOpenAttachment.bind(this,t)}];h.can.editAttachment(this.model,t)&&i.push({icon:"fa-edit",label:this.t("attachments:edit"),handler:this.handleEditAttachment.bind(this,t),disabled:!0}),h.can.deleteAttachment(this.model,t)&&i.push({icon:"fa-trash",label:this.t("attachments:delete"),handler:this.handleDeleteAttachment.bind(this,t)}),a.show(this,e.pageY,e.pageX,i)}},initialize:function(){this.$preview=null,this.once("afterRender",()=>{this.listenTo(this.model,"change:attachments",this.render)}),e(window).on(`keydown.${this.idPrefix}`,this.onWindowKeyDown.bind(this))},destroy:function(){e(window).off(`.${this.idPrefix}`),this.$preview&&(this.$preview.remove(),this.$preview=null)},getTemplateData:function(){return{modelType:this.model.getModelType(),modelId:this.model.id,attachments:this.serializeAttachments()}},serializeAttachments:function(){return this.model.get("attachments").map(e=>({_id:e._id,time:Date.parse(e.date),name:e.name,icon:s.getByMime(e.type),image:e.type.startsWith("image/"),url:this.model.getAttachmentUrl(e)})).sort((e,t)=>e.image&&!t.image?-1:!e.image&&t.image?1:e.time-t.time)},handleOpenAttachment:function(e){window.open(this.model.getAttachmentUrl(e),"_blank")},handleEditAttachment:function(e){console.log("handleEditAttachment",e)},handleDeleteAttachment:function(e){const i=new n({template:o,nlsDomain:this.model.getNlsDomain(),model:e});t.showDialog(i,this.t("attachments:delete:title")),this.listenTo(i,"answered",t=>{"yes"===t&&this.deleteAttachment(e)})},deleteAttachment:function(e){t.msg.saving();const i=this.ajax({method:"PUT",url:this.model.url(),data:JSON.stringify({attachments:{deleted:[e._id]}})});i.fail(function(){t.msg.savingFailed()}),i.done(function(){t.msg.saved()})},showPreview:function(e){const t=this.model.get("attachments").find(t=>t._id===e);if(!t&&this.$preview)return this.hidePreview();this.$preview||(this.$preview=this.renderPartial(d).appendTo(document.body),this.$preview.find(".osh-attachment-preview-close").on("click",this.hidePreview.bind(this)),this.$preview.find(".osh-attachment-preview-prev").on("click",this.prevPreview.bind(this)),this.$preview.find(".osh-attachment-preview-next").on("click",this.nextPreview.bind(this)),this.$preview.on("wheel",()=>!1));const i=this.model.getAttachmentUrl(t),n=this.$preview.find(".osh-attachment-preview-img"),s=this.$preview.find(".osh-attachment-preview-name");n.css("background-image",`url(${i})`),s.text(t.name),this.$preview.data("attachmentId",e),this.$preview.removeClass("hidden"),s.css("margin-left",s.outerWidth()/2*-1+"px")},hidePreview:function(){this.$preview&&this.$preview.addClass("hidden")},prevPreview:function(){if(!this.$preview||this.$preview.hasClass("hidden"))return;const e=this.model.get("attachments").filter(e=>e.type.startsWith("image/"));if(!e.length)return this.hidePreview();const t=this.$preview.data("attachmentId"),i=e.findIndex(e=>e._id===t);let n=0;0===i?n=e.length-1:-1!==i&&1!==i&&(n=i-1),this.showPreview(e[n]._id)},nextPreview:function(){if(!this.$preview||this.$preview.hasClass("hidden"))return;const e=this.model.get("attachments").filter(e=>e.type.startsWith("image/"));if(!e.length)return this.hidePreview();const t=this.$preview.data("attachmentId"),i=e.findIndex(e=>e._id===t);let n=0;-1!==i&&i!==e.length-1&&(n=i+1),this.showPreview(e[n]._id)},onWindowKeyDown:function(e){"Escape"===e.key?this.hidePreview():"ArrowLeft"===e.key?this.prevPreview():"ArrowRight"===e.key&&this.nextPreview()}})});