define(["underscore","jquery","app/user","app/viewport","app/core/views/FormView","app/core/util/uuid","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","../dictionaries","../Entry","app/wmes-fap-entries/templates/addForm","app/wmes-fap-entries/templates/addFormUpload","app/wmes-fap-entries/templates/notificationsPopover"],function(e,t,i,o,a,n,s,d,r,l,u,p,c,f){"use strict";return a.extend({template:p,events:e.assign({"click #-cancel":function(){this.trigger("cancel")},'click a[data-action="removeUpload"]':function(e){var t=this.$(e.target).closest(".fap-addForm-upload")[0].dataset.uploadId,i=this.model;return i.uploading&&i.uploading.upload._id===t?(i.uploading.abort(),i.uploading=null):(i.uploadQueue=i.uploadQueue.filter(function(e){return e._id!==t}),i.uploadedFiles=i.uploadedFiles.filter(function(e){return e._id!==t})),this.removeUpload(t),!1},"change #-category":function(e){var t=e.target;this.model.attributes[t.name]=t.value,this.saveInputFocus(t),this.updateNotifications("category"),this.toggleRequiredFields(),this.setUpSubCategorySelect2(),this.updateEtoCategory("category")},"change #-subCategory":function(e){var t=e.target;this.model.attributes[t.name]=t.value.length?t.value:null,this.updateNotifications("subCategory"),this.updateEtoCategory("subCategory")},"change #-lines, #-subdivisions":function(e){var t=e.target;this.model.attributes[t.name]=t.value.length?t.value.split(","):[],this.saveInputFocus(t)},"input #-orderNo, #-problem":function(e){this.model.attributes[e.target.name]=e.target.value.trim(),e.target.setCustomValidity(""),this.saveInputFocus(e.target),"orderNo"===e.target.name&&9===e.target.value.length&&this.validateOrder()},"input #-componentCode":function(e){this.model.attributes[e.target.name]=e.target.value.trim(),e.target.setCustomValidity(""),this.saveInputFocus(e.target),this.validateComponent()},"focus input, textarea":function(e){this.saveInputFocus(e.target)},"blur input, textarea":function(e){this.saveInputFocus(e.target)},'change [name="subdivisionType"]':function(){this.model.attributes.subdivisionType=this.$('[name="subdivisionType"]:checked').val(),this.toggleRequiredFields()},"change #-orderNo":function(){this.validateOrder()},"change #-componentCode":function(){this.validateComponent()},"click .fap-addForm-upload-name":function(e){this.showUploadNameEditor(this.$(e.target).closest(".fap-addForm-upload")[0].dataset.uploadId)},"click #-copy":function(){this.copyLastEntry()}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.reloadLock=i.lockReload();var e=this.model;e.uploadQueue||(e.uploadQueue=[],e.uploading=null,e.uploadedFiles=[]),this.listenTo(l.categories,"reset change",this.setUpCategorySelect2)},destroy:function(){a.prototype.destroy.apply(this,arguments),this.model.focusedInput&&this.saveInputFocus(this.$id(this.model.focusedInput.name)[0]),t(".fap-addForm-backdrop").remove(),i.unlockReload(this.reloadLock),l.unload()},afterRender:function(){var e=this;a.prototype.afterRender.apply(e,arguments),l.load();var i=t(".fap-addForm-backdrop");i.length||(i=t('<div class="fap-addForm-backdrop"></div>').appendTo("body").on("click",function(){e.trigger("cancel")})),e.$id("lines").select2({dropdownCssClass:"fap-addForm-select2",multiple:!0,allowClear:!0,placeholder:" ",data:d.getActiveByType("prodLine").map(s)}),e.renderUploads(),e.setUpCategorySelect2(),e.setUpSubCategorySelect2(),e.setUpSubdivisionsSelect2(),e.setUpOwnerSelect2(),e.setUpDnd(e.$el),e.setUpDnd(i),e.updateNotifications(),e.updateComponentName(),e.toggleRequiredFields(),e.focusInput()},toggleRequiredFields:function(){var e=!1,t=!1,i=!1;switch(this.model.get("subdivisionType")){case"assembly":e=!0;break;case"press":i=!0,t=!0;break;case"wh":i=!0}"5544b9182b5949f80d80b369"===this.model.get("category")&&(e=!1,t=!0),this.$id("orderNo").prop("required",e).closest(".form-group").find(".control-label").toggleClass("is-required",e),this.$id("lines").prop("required",t).closest(".form-group").toggleClass("has-required-select2",t).find(".control-label").toggleClass("is-required",t),this.$id("componentCode").prop("required",i).closest(".form-group").find(".control-label").toggleClass("is-required",i)},renderUploads:function(){var e=this,i=e.$id("uploads");e.model.uploadedFiles.forEach(function(t){e.renderUpload(t,!0).appendTo(i)}),e.model.uploading&&e.renderUpload(e.model.uploading.upload,!1).appendTo(i),e.model.uploadQueue.forEach(function(t){e.renderUpload(t,!1).appendTo(i)}),i[0].childElementCount>1&&i[0].firstElementChild.classList.add("hidden"),i.popover({placement:"left",trigger:"hover",container:i.parent()[0],selector:".fap-addForm-upload",html:!0,content:function(){if(!e.$el.hasClass("fap-addForm-editing")){var t=this.dataset.uploadId,i=e.findUpload(t);if(i&&i.img)return i.img}},template:function(e){return t(e).addClass("fap-addForm-upload-popover").attr("data-upload-id",this.dataset.uploadId)}})},renderUpload:function(e,t){return this.renderPartial(c,{uploaded:t,upload:e})},setUpCategorySelect2:function(){this.$id("category").select2({dropdownCssClass:"fap-addForm-select2",data:l.categories.where({active:!0}).map(s)})},setUpSubCategorySelect2:function(){var e=this.$id("category").val(),t=l.subCategories.where({active:!0,parent:e}).map(s),i=this.$id("subCategory");i.select2("val",""),1===t.length&&i.val(t[0].id),i.select2({allowClear:!1,placeholder:" ",dropdownCssClass:"fap-addForm-select2",data:t});var o=t.length>0;i.select2("enable",o).prop("required",o).closest(".form-group").toggleClass("has-required-select2",o).find(".control-label").toggleClass("is-required",o)},setUpSubdivisionsSelect2:function(){this.$id("subdivisions").select2({dropdownCssClass:"fap-addForm-select2",placeholder:" ",allowClear:!0,multiple:!0,data:d.getActiveByType("division").map(function(e){var t=e.getLabel();return{text:t,children:d.getChildren(e).filter(function(e){return!e.get("deactivatedAt")}).map(function(e){return{id:e.id,text:e.getLabel(),divisionText:t}})}}),formatSelection:function(e,t,i){return i(e.divisionText+" \\ "+e.text)}})},setUpOwnerSelect2:function(){var e=this.$id("owner");e.length&&r(e,{view:this,noPersonnelId:!0,width:"100%",dropdownCssClass:"fap-addForm-select2"})},setUpDnd:function(e){e.on("drag dragstart dragend dragover dragenter dragleave drop",function(e){e.preventDefault(),e.stopPropagation()}).on("drop",this.onDrop.bind(this))},onDrop:function(t){var i=t.originalEvent.dataTransfer;if(!i||!i.files||!i.files.length)return!1;var a=this,s=a.model,d=Array.prototype.slice.call(i.files);return(s.uploading?1:0)+s.uploadQueue.length+s.uploadedFiles.length+d.length>5?(o.msg.show({type:"warning",time:2500,text:a.t("upload:tooMany",{max:5})}),!1):(d.forEach(function(t){var i=null;0===t.type.indexOf("image/")&&((i=new Image).src=URL.createObjectURL(t)),s.uploadQueue.push({_id:n(),file:t,name:t.name,img:i});var o=a.$id("uploads");o[0].firstElementChild.classList.add("hidden"),a.renderUpload(e.last(s.uploadQueue),!1).appendTo(o)}),s.uploading||a.uploadNext(),!1)},uploadNext:function(){var e=this,t=e.model,i=t.uploadQueue.shift();if(i){e.$id("submit").prop("disabled",!0);var a=e.$id("uploads"),n=new FormData;n.append("file",i.file),t.uploading=e.ajax({type:"POST",url:"/fap/entries;upload",data:n,processData:!1,contentType:!1}),t.uploading.upload=i,t.uploading.fail(function(){e.removeUpload(i._id),"abort"!==t.uploading.statusText&&o.msg.show({type:"error",time:2500,text:e.t("upload:failure",{file:i.file.name})})}),t.uploading.done(function(e){a.find('[data-upload-id="'+i._id+'"]').find(".fa-spinner").removeClass("fa-spinner fa-spin").addClass("fa-times"),i.hash=e,t.uploadedFiles.push(i)}),t.uploading.always(function(){t.uploading=null,e.uploadNext()})}else e.$id("submit").prop("disabled",!1)},removeUpload:function(e){var t=this.$id("uploads");t.find('[data-upload-id="'+e+'"]').remove(),this.$('.popover[data-upload-id="'+e+'"]').remove(),1===t[0].childElementCount&&t[0].firstElementChild.classList.remove("hidden")},saveInputFocus:function(e){if(e){var t=this.$(e).closest(".select2-container");t.length&&(e=t.next()[0]),this.model.focusedInput={name:e.name,selectionStart:e.selectionStart,selectionEnd:e.selectionEnd}}},focusInput:function(){if(!this.model.focusedInput){var e=this.$id("owner");return e.length||(e=this.$id("orderNo")),void e.focus()}var t=this.$id(this.model.focusedInput.name)[0];if(t){if("TEXTAREA"===t.tagName){var i=t.value;t.value=i.substring(0,this.model.focusedInput.selectionEnd),t.scrollTop=t.scrollHeight,t.value=i}t.setSelectionRange&&t.setSelectionRange(this.model.focusedInput.selectionStart,this.model.focusedInput.selectionEnd);var o=this.$(t);o.prev().hasClass("select2-container")?o.select2("focus"):t.focus()}else this.$id("orderNo").focus()},updateEtoCategory:function(e){if(!e)return this.updateEtoCategory("category"),void this.updateEtoCategory("subCategory");var t=this.$id(e),i=l.forProperty(e),o=i.get(t.val()),a=this.model.validatedOrder;if(o&&null!==o.get("etoCategory")&&a){var n=o.get("etoCategory");if(""===n){if(a.eto)return void this.resolveSubdivisions();var s=i.find(function(e){return e.get("etoCategory")===o.id});return s?void t.select2("val",s.id).trigger("change"):void this.resolveSubdivisions()}if(a.eto){var d=i.get(n);d?t.select2("val",d.id).trigger("change"):this.resolveSubdivisions()}else this.resolveSubdivisions()}else this.resolveSubdivisions()},resolveSubdivisions:function(){var e=this,t=e.$id("orderNo").val(),i=l.categories.get(e.$id("category").val()),o=l.subCategories.get(e.$id("subCategory").val());e.resolveSubdivisionsReq&&(e.resolveSubdivisionsReq.abort(),e.resolveSubdivisionsReq=null),e.timers.resolveSubdivisions&&clearTimeout(e.timers.resolveSubdivisions),e.$id("subdivisions").select2("val",""),i&&(e.timers.resolveSubdivisions=setTimeout(function(){e.timers.resolveSubdivisions=null;var a=e.resolveSubdivisionsReq=e.ajax({method:"POST",url:"/fap/entries;resolve-participants",data:JSON.stringify({orderNo:t,category:i.id,subCategory:o?o.id:null})});a.done(function(t){t.subdivisions&&e.$id("subdivisions").select2("val",t.subdivisions)}),a.always(function(){a===e.resolveSubdivisionsReq&&(e.resolveSubdivisionsReq=null)})},30))},updateNotifications:function(e){if(!e)return this.updateNotifications("category"),void this.updateNotifications("subCategory");var i=l.forProperty(e).get(this.$id(e).val()),o=i&&i.get("notifications")||[],a=this.$id(e+"-notifications");o.length?a.removeClass("hidden").popover({placement:"bottom",trigger:"hover",html:!0,content:this.renderPartial(f,{notifications:i.serialize().notifications}),template:function(e){return t(e).addClass("fap-addForm-notifications-popover")}}):a.addClass("hidden")},validateOrder:function(){var e=this,t=e.$id("orderNo"),i=t.val();if(/^[0-9]{9}$/.test(i)&&"000000000"!==i&&(!e.model.validatedOrder||e.model.validatedOrder.orderNo!==i)){e.model.validatedOrder={orderNo:i};var o=e.ajax({method:"POST",url:"/fap/entries;validate-order?order="+i});o.fail(function(){404===o.status&&t[0].setCustomValidity(e.t("addForm:orderNo:notFound"))}),o.done(function(t){e.model.validatedOrder=t,e.$id("lines").select2("val",t.lines).trigger("change"),e.updateEtoCategory()})}},validateComponent:function(){var e=this,t=e.$id("componentCode"),i=t.val();if(/^[0-9]{1,12}$/.test(i)&&"000000000000"!==i&&(!e.model.validatedComponent||e.model.validatedComponent._id!==i)){e.model.validatedComponent={_id:i},e.model.attributes.componentName="";var o=e.ajax({method:"POST",url:"/fap/entries;validate-component?nc12="+i});o.fail(function(){404===o.status&&t[0].setCustomValidity(e.t("addForm:componentCode:notFound")),e.$id("componentName").text("")}),o.done(function(t){e.model.validatedComponent=t,e.model.attributes.componentCode=t._id,e.model.attributes.componentName=t.name,e.updateComponentName()})}},updateComponentName:function(){this.$id("componentName").text(this.model.get("componentName")||"-")},findUpload:function(e){var t=this.model;if(t.uploading&&t.uploading.upload._id===e)return t.uploading.upload;for(var i=0;i<t.uploadedFiles.length;++i)if(t.uploadedFiles[i]._id===e)return t.uploadedFiles[i];for(var o=0;o<t.uploadQueue.length;++o)if(t.uploadQueue[o]._id===e)return t.uploadQueue[o];return null},showUploadNameEditor:function(e){var i=this,o=i.$id("uploads").find('[data-upload-id="'+e+'"]'),a=i.findUpload(e),n=t('<input type="text" class="form-control fap-addForm-upload-input">').val(a.name);function s(){n.remove(),i.$el.removeClass("fap-addForm-editing")}i.$el.addClass("fap-addForm-editing"),n.on("blur",function(){!function(){var e=n.val().trim();if(!e.length)return;/\.[a-zA-Z0-9]{1,}$/.test(e)||(e+="."+a.name.split(".").pop());a.name=e,o.find(".fap-addForm-upload-name").text(e)}(),s()}),n.on("keydown",function(e){return"Escape"===e.key?(s(),!1):"Enter"===e.key?(e.target.blur(),!1):void 0}),n.appendTo(o).focus()},getTemplateData:function(){return{subdivisionTypes:u.SUBDIVISION_TYPES}},serializeToForm:function(){var e=this.model.toJSON();return Array.isArray(e.lines)&&(e.lines=e.lines.join(",")),Array.isArray(e.subdivisions)&&(e.subdivisions=e.subdivisions.join(",")),e},serializeForm:function(e){var t=this.$id("owner").select2("data");return t&&(e.owner={id:t.id,label:t.text}),e.lines=(e.lines||"").split(",").filter(function(e){return!!e.length}),e.subdivisions=(e.subdivisions||"").split(",").filter(function(e){return!!e.length}),e.divisions=[],e.lines.forEach(function(t){var i=d.getAllForProdLine(t).division;i&&-1===e.divisions.indexOf(i)&&e.divisions.push(i)}),e.files=this.model.uploadedFiles.map(function(e){return{_id:e.hash,name:e.name}}),e},getFailureText:function(){return this.t("core","FORM:ERROR:addFailure")},copyLastEntry:function(){var e=this,t=e.$id("copy").find(".fa");if(!t.hasClass("fa-spin")){t.removeClass("fa-copy").addClass("fa-spinner fa-spin");var a=e.ajax({url:"/fap/entries?limit(1)&sort(-createdAt)&select(category,subCategory,problem)&observers.user.id="+i.data._id+"&creator.id="+i.data._id});a.done(function(t){if(!t.totalCount)return o.msg.show({type:"warning",time:2500,text:e.t("addForm:copy:notFound")});e.$id("category").select2("val",t.collection[0].category).trigger("change"),e.$id("subCategory").select2("val",t.collection[0].subCategory).trigger("change"),e.$id("problem").val(t.collection[0].problem).trigger("input").focus()}),a.fail(function(){o.msg.show({type:"error",time:2500,text:e.t("addForm:copy:failure")})}),a.done(function(){t.removeClass("fa-spinner fa-spin").addClass("fa-copy")})}}})});