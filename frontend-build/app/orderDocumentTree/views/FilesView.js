define(["underscore","jquery","app/i18n","app/time","app/viewport","app/user","app/core/View","app/core/views/DialogView","app/orderDocumentTree/OrderDocumentTree","app/orderDocumentTree/views/EditFileDialogView","app/orderDocumentTree/templates/files","app/orderDocumentTree/templates/filesFile","app/orderDocumentTree/templates/filesFolder","app/orderDocumentTree/templates/removeFileDialog","app/orderDocumentTree/templates/recoverFileDialog"],function(e,i,t,s,l,o,r,n,d,a,h,c,f,u,g){"use strict";return r.extend({template:h,events:{"click .orderDocumentTree-files-folder":function(e){if(""!==window.getSelection().toString())return!1;this.model.setSelectedFolder(e.currentTarget.dataset.id,{scroll:!0,keepFile:!1})},"mouseup a[data-hash]":function(e){if(e.altKey)return this.addUpload(e.currentTarget.dataset.fileId,e.currentTarget.dataset.hash),e.target.blur(),!1},"click a[data-hash]":function(e){if(e.altKey)return!1},"click .orderDocumentTree-files-file":function(e){if("A"!==e.target.tagName&&""===window.getSelection().toString()){var i=this.model,t=i.files.get(e.currentTarget.dataset.id);if(e.altKey)return this.addUpload(t.id,null),!1;if(!e.ctrlKey)return this.lastClickEvent=e,i.setSelectedFile(t.id),!1;this.toggleMarkFile(t)}},"click #-closePreview":function(){this.model.setSelectedFile(null)},"dblclick #-preview":function(e){this.$(e.target).closest(".btn").length||this.model.setSelectedFile(null)},"click a[data-folder-id]":function(e){return this.model.setSelectedFolder(e.target.dataset.folderId,{scroll:!0,keepFile:!0}),!1},"click #-editFile":function(){var e=new a({model:this.model.getSelectedFile(),tree:this.model,done:function(){l.closeDialog()}});l.showDialog(e,this.t("editFile:title"))},"click #-removeFile":function(){var e=this,i=e.model,t=i.getSelectedFolder(),s=i.getSelectedFile(),o=i.isInTrash(t),r=new n({template:u,autoHide:!1,model:{nc15:s.id,multiple:s.get("folders").length>1,purge:o}});e.listenTo(r,"answered",function(o){var n="purge"===o?i.purgeFile(s):"remove"===o?i.removeFile(s):i.unlinkFile(s,t);n.fail(function(){r.enableAnswers(),l.msg.show({type:"error",time:3e3,text:e.t("removeFile:msg:failure")})}),n.done(function(){r.closeDialog(),l.msg.show({type:"success",time:3e3,text:e.t("removeFile:msg:success")})})}),l.showDialog(r,e.t("removeFile:title"))},"click #-recoverFile":function(){var e=this,i=e.model.getSelectedFile(),t=new n({template:g,autoHide:!1,model:{nc15:i.id}});e.listenTo(t,"answered",function(s){if("yes"===s){var o=this.model.recoverFile(i);o.fail(function(){t.enableAnswers(),l.msg.show({type:"error",time:3e3,text:e.t("recoverFile:msg:failure")})}),o.done(function(){t.closeDialog(),l.msg.show({type:"success",time:3e3,text:e.t("recoverFile:msg:success")})})}else t.closeDialog()}),l.showDialog(t,e.t("recoverFile:title"))},"click #-subFile":function(){var e=this,t=e.model.get("selectedFile"),s=i.ajax({method:"POST",url:"/subscriptions/orderDocumentTree/"+t});e.$id("subFile").prop("disabled",!0).attr("title","").find(".fa").attr("class","fa fa-spinner fa-spin"),s.fail(function(){l.msg.show({type:"error",time:2500,text:e.t("files:sub:failure")}),t===e.model.get("selectedFile")&&e.resolveFileSub()})}},remoteTopics:{"subscriptions.*":function(e,i){var t=e.model;"orderDocumentTree"===t.type&&t.user===o.data._id&&(/added|edited/.test(i)?this.toggleFileSub(t.target,t):/deleted/.test(i)&&this.toggleFileSub(t.target,null))}},initialize:function(){var e=this.model;this.serializeFolder=this.serializeFolder.bind(this),this.serializeFile=this.serializeFile.bind(this),this.listenTo(e,"change:displayMode",this.onDisplayModeChange),this.listenTo(e,"change:selectedFolder change:searchPhrase",this.render),this.listenTo(e,"change:selectedFile",this.onSelectedFileChange),this.listenTo(e,"change:markedFiles",this.onMarkedFilesChange),this.listenTo(e,"change:dateFilter",this.onDateFilterChange),this.listenTo(e.files,"request",this.onFilesRequest),this.listenTo(e.files,"error",this.onFilesError),this.listenTo(e.files,"reset",this.onFilesReset),this.listenTo(e.files,"remove",this.onFilesRemove),this.listenTo(e.files,"add",this.onFilesAdd),this.listenTo(e.files,"change",this.onFilesChange),this.listenTo(e.files,"focus",this.onFilesFocus),this.listenTo(e.folders,"add",this.onFoldersAdd),this.listenTo(e.folders,"remove",this.onFoldersRemove),this.listenTo(e.folders,"change:parent",this.onParentChange),i(window).on("resize."+this.idPrefix,this.positionPreview.bind(this)),i("body").on("keydown."+this.idPrefix,function(i){27===i.keyCode&&e.setSelectedFile(null)})},destroy:function(){i(window).off("."+this.idPrefix),i("body").off("."+this.idPrefix)},serialize:function(){return e.extend(r.prototype.serialize.apply(this,arguments),{displayMode:this.model.getDisplayMode(),searchPhrase:this.model.getSearchPhrase(),folders:this.serializeFolders(),files:this.serializeFiles()})},serializeMoreFiles:function(){var e=this.model.files;return e.length>0&&e.totalCount>e.length?e.totalCount-e.length:0},serializeFolders:function(){return this.model.hasSearchPhrase()?[]:this.model.getChildFolders(this.model.getSelectedFolder()).map(this.serializeFolder)},serializeFolder:function(e){return{id:e.id,label:e.getLabel().replace(/_/g," "),icon:"__TRASH__"===e.id?"fa-trash-o":"fa-folder-o"}},serializeFiles:function(){var e=this.model.getDateFilter(),i=function(){return!0};e&&(e+="T00:00:00.000Z",i=function(i){for(var t=i.get("files"),s=0;s<t.length;++s)if(t[s].date===e)return!0;return!1});var t=this.model.files.filter(i).map(this.serializeFile),s=this.serializeMoreFiles();return s&&t.push({id:null,text:"+"+s,smallText:"",selected:!1,icon:"fa-files-o"}),t},serializeFile:function(e){var i=e.getLabel();i===e.id&&(i="");var t=this.model.isMarkedFile(e);return{id:e.id,text:e.id,smallText:i.replace(/_/g," "),selected:e.id===this.model.get("selectedFile"),marked:t,icon:"fa-file-o",files:e.get("files")}},beforeRender:function(){this.lastClickEvent=null},afterRender:function(){this.showPreviewIfNeeded()},addUpload:function(e,i){var t=this.model,s=t.getSelectedFolder();if(!t.isInTrash(s)){var l=t.files.get(e),o=t.hasSearchPhrase()?t.folders.get(l.get("folders")[0]):s;this.model.uploads.addFromDocument(l,o,i)}},toggleMarkFile:function(e){this.model.hasSearchPhrase()&&1!==e.get("folders").length?l.msg.show({type:"warning",time:3e3,text:this.t("MSG:canNotMarkSearchResult")}):this.model.toggleMarkFile(e)},showPreviewIfNeeded:function(){var e=this.$(".is-selected")[0];e?(e.scrollIntoViewIfNeeded?e.scrollIntoViewIfNeeded():e.scrollIntoView(),this.showPreview()):this.hidePreview()},showPreview:function(){var i=this.$id("preview"),t=this.serializePreview();e.forEach(t,function(e,t){i.find('dd[data-prop="'+t+'"]').html(e)});var s=this.model,l=s.getSelectedFolder(),o=l&&"__TRASH__"===l.id,r=s.isInTrash(l);i.css({top:"-1000px",left:"-1000px"}).toggleClass("is-trash",o).toggleClass("is-in-trash",r).removeClass("hidden"),this.$id("subFile").prop("disabled",!0).removeClass("hidden").attr("title","").find(".fa").attr("class","fa fa-spinner fa-spin"),this.resolveFileSub(),this.positionPreview()},serializePreview:function(){var i=this.model.getSelectedFile();return{nc15:e.escape(i.id),name:e.escape(i.getLabel()),folders:this.serializePreviewFolders(),files:this.serializePreviewFiles()}},serializePreviewFolders:function(){var i=this.model,t=i.getSelectedFolder(),s=i.getSelectedFile(),l="",o=i.canSeeTrash();return e.forEach(s.get("folders"),function(r){var n=i.folders.get(r);if(n){var d=i.getPath(n),a="__TRASH__"===d[0].id;a&&!o||(d=d.map(function(e){return e.getLabel()}).join(" > "),l+='<li title="'+e.escape(d)+'">',l+=n===t?'<span style="text-decoration: '+(a?"line-through":"none")+'">'+e.escape(n.getLabel())+"</span>":'<a href="#orderDocuments/tree?folder='+n.id+"&file="+s.id+'" data-folder-id="'+n.id+'" style="text-decoration: '+(a?"line-through":"none")+'">'+e.escape(n.getLabel())+"</a>")}}),l?"<ul>"+l+"</ul>":"-"},serializePreviewFiles:function(){var i=this,t=i.model.getSelectedFile(),l="";return e.forEach(t.get("files"),function(e){l+='<li><a href="/orderDocuments/'+t.id+"?pdf=1&hash="+e.hash+'" target="_blank" data-file-id="'+t.id+'" data-hash="'+e.hash+'">'+i.t("files:files:date",{date:s.utc.format(e.date,"LL")})+"</a>"}),l?"<ul>"+l+"</ul>":"-"},positionPreview:function(){var e=this.$(".is-selected");if(e.length){var i,t,s=this.$id("preview").css({top:"-1000px",left:"-1000px"}),l=s.outerWidth(),o=s.outerHeight(),r=this.model.getDisplayMode()===d.DISPLAY_MODE.LIST;if(r&&this.lastClickEvent)i=this.lastClickEvent.pageY,(t=this.lastClickEvent.pageX)+l+15>=window.innerWidth&&(t=window.innerWidth-l-30),this.lastClickEvent.clientY+o+15>=window.innerHeight&&(i-=o);else{var n=e.offset(),a=n.left+l+15>window.innerWidth,h=n.left+200;t=a?h-l:n.left,i=n.top,r&&(i+=14,t+=14)}this.$id("preview").css({top:i+"px",left:t+"px"})}},hidePreview:function(){this.$id("preview").addClass("hidden"),this.fileSubReq&&(this.fileSubReq.abort(),this.fileSubReq=null)},resolveFileSub:function(){var e=this,i=e.model.getSelectedFile();if(i){var t=i.id,s=e.fileSubReq=e.ajax({method:"GET",url:"/subscriptions/orderDocumentTree/"+t});s.fail(function(){t===e.model.getSelectedFile().id&&e.$id("subFile").addClass("hidden")}),s.done(function(i){e.toggleFileSub(t,i.subscription)}),s.always(function(){e.fileSubReq=null})}},toggleFileSub:function(e,i){if(e===this.model.getSelectedFile().id){var t=!1;if(i){if(e!==i.target)return;t=!0}this.$id("subFile").prop("disabled",!1).removeClass("hidden").toggleClass("active",t).attr("title",this.t("files:sub:"+t)).find(".fa").attr("class","fa fa-eye")}},showEmptyIfNeeded:function(){this.$id("folders").children().length||this.$id("files").children().length||this.$id("files").html("<p>"+this.t("files:"+(this.model.hasSearchPhrase()?"noResults":"empty"))+"</p>")},addFile:function(e){this.model.hasSearchPhrase()||(this.$id("files").find("> p").remove(),this.$id("files").append(c({file:this.serializeFile(e)})))},removeFile:function(e){var i=this.$file(e.id);i.length&&(i.hasClass("is-selected")&&this.hidePreview(),i.remove(),this.showEmptyIfNeeded())},updateFile:function(e){var i=this.$file(e.id);i.length?(i.replaceWith(c({file:this.serializeFile(e)})),e===this.model.getSelectedFile()&&this.showPreview()):this.addFile(e)},$folder:function(e){return this.$id("folders").find('.orderDocumentTree-files-item[data-id="'+e+'"]')},$file:function(e){return this.$id("files").find('.orderDocumentTree-files-item[data-id="'+e+'"]')},onSelectedFileChange:function(){var e=this.model.getSelectedFile();this.$id("files").find(".is-selected").removeClass("is-selected"),e?(this.$id("files").find('.orderDocumentTree-files-item[data-id="'+e.id+'"]').addClass("is-selected"),this.showPreview()):this.hidePreview()},onMarkedFilesChange:function(e,i,t){this.$file(i.id).toggleClass("is-marked",t)},onDateFilterChange:function(){this.render()},onFilesRequest:function(){this.hidePreview(),0===this.$(".orderDocumentTree-files-folder").length&&this.$id("files").html('<p><i class="fa fa-spinner fa-spin fa-3x"></i></p>')},onFilesError:function(){this.$id("files").find(".fa").css("color","red")},onFilesReset:function(){var e="",i=this.serializeFiles();0===i.length&&0===this.$(".orderDocumentTree-files-folder").length?e="<p>"+this.t("files:"+(this.model.hasSearchPhrase()?"noResults":"empty"))+"</p>":i.forEach(function(i){e+=c({file:i})}),this.$id("files").html(e),this.showPreviewIfNeeded()},onFilesAdd:function(e){this.addFile(e)},onFilesRemove:function(e){this.removeFile(e)},onFilesChange:function(e){e.isInFolder(this.model.get("selectedFolder"))?this.updateFile(e):this.$file(e.id).length&&this.removeFile(e)},onFilesFocus:function(e,i){var t='a[data-hash="'+i+'"]';if(this.model.getSelectedFile()!==e){var s=this.$file(e.id).find(t);s.length?s.focus():(this.model.setSelectedFile(e.id),this.$id("preview").find(t).focus())}else this.$id("preview").find(t).focus()},onFoldersAdd:function(e){this.model.hasSearchPhrase()||this.$id("folders").append(f({folder:this.serializeFolder(e)}))},onFoldersRemove:function(e){this.$folder(e.id).remove(),this.showEmptyIfNeeded()},onParentChange:function(e){var i=this.$folder(e.id);i.length&&e.get("parent")!==this.model.get("selectedFolder")&&i.remove()},onDisplayModeChange:function(){this.$el.removeClass(e.values(d.DISPLAY_MODE).map(function(e){return"is-"+e}).join(" ")).addClass("is-"+this.model.getDisplayMode()),this.positionPreview()}})});