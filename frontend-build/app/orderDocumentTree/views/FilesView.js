define(["underscore","jquery","app/i18n","app/time","app/viewport","app/user","app/core/View","app/core/views/DialogView","app/planning/util/contextMenu","../OrderDocumentTree","./EditFileDialogView","./FileChangesView","app/orderDocumentTree/templates/files","app/orderDocumentTree/templates/filesFile","app/orderDocumentTree/templates/filesFolder","app/orderDocumentTree/templates/removeFileDialog","app/orderDocumentTree/templates/recoverFileDialog"],function(e,i,t,l,s,o,r,a,n,d,h,c,f,u,g,m,p){"use strict";return r.extend({template:f,events:{"click .orderDocumentTree-files-folder":function(e){if(""!==window.getSelection().toString())return!1;this.model.setSelectedFolder(e.currentTarget.dataset.id,{scroll:!0,keepFile:!1})},"mouseup a[data-hash]":function(e){if(e.altKey)return this.model.addUpload(e.currentTarget.dataset.fileId,e.currentTarget.dataset.hash),e.target.blur(),!1},"click a[data-hash]":function(e){if(e.altKey)return!1},"click .orderDocumentTree-files-file":function(e){if("A"!==e.target.tagName&&""===window.getSelection().toString()){var i=this.model,t=i.files.get(e.currentTarget.dataset.id);if(e.altKey)return i.addUpload(t.id,null),!1;if(!e.ctrlKey)return this.lastClickEvent=e,i.setSelectedFile(t.id),!1;this.toggleMarkFile(t)}},"click #-closePreview":function(){this.model.setSelectedFile(null)},"dblclick #-preview":function(e){this.$(e.target).closest(".btn").length||this.model.setSelectedFile(null)},"click a[data-folder-id]":function(e){return this.model.setSelectedFolder(e.target.dataset.folderId,{scroll:!0,keepFile:!0}),!1},"click #-editFile":function(){this.showEditFileDialog(this.model.getSelectedFile())},"click #-removeFile":function(){this.showRemoveFileDialog(this.model.getSelectedFolder(),this.model.getSelectedFile())},"click #-recoverFile":function(){this.showRecoverFileDialog(this.model.getSelectedFile())},"click #-subFile":function(){var e=this,t=e.model.get("selectedFile"),l=i.ajax({method:"POST",url:"/subscriptions/orderDocumentTree/"+t});e.$id("subFile").prop("disabled",!0).attr("title","").find(".fa").attr("class","fa fa-spinner fa-spin"),l.fail(function(){s.msg.show({type:"error",time:2500,text:e.t("files:sub:failure")}),t===e.model.get("selectedFile")&&e.resolveFileSub()})},"click #-showChanges":function(){this.showFileChangesDialog(this.model.getSelectedFile())},"contextmenu .orderDocumentTree-files-file":function(e){e.preventDefault();var i=this,t=i.model,l=t.files.get(e.currentTarget.dataset.id),s=[l.id];if(o.isAllowedTo("DOCUMENTS:VIEW")&&s.push({icon:"fa-calendar",label:i.t("files:changes"),handler:function(){i.showFileChangesDialog(l)}}),o.isAllowedTo("DOCUMENTS:MANAGE")){t.isTrash()&&s.push({icon:"fa-undo",label:i.t("files:recover"),handler:function(){i.showRecoverFileDialog(l)}}),s.push({icon:"fa-edit",label:i.t("files:edit"),handler:function(){i.showEditFileDialog(l)}});var r=l.get("files");r.length&&r[0].hash!==e.target.dataset.hash&&s.push({label:i.t("files:edit:latestFile"),handler:function(){t.addUpload(l.id,r[0].hash)}}),e.target.dataset.hash&&s.push({label:i.t("files:edit:specificFile",{date:e.target.textContent.trim()}),handler:function(){t.addUpload(l.id,e.target.dataset.hash)}}),s.push({icon:"fa-trash-o",label:i.t("files:remove"),handler:function(){i.showRemoveFileDialog(t.getSelectedFolder(),l)}})}n.show(i,e.pageY,e.pageX,s)}},remoteTopics:{"subscriptions.*":function(e,i){var t=e.model;"orderDocumentTree"===t.type&&t.user===o.data._id&&(/added|edited/.test(i)?this.toggleFileSub(t.target,t):/deleted/.test(i)&&this.toggleFileSub(t.target,null))}},initialize:function(){var e=this.model;this.serializeFolder=this.serializeFolder.bind(this),this.serializeFile=this.serializeFile.bind(this),this.listenTo(e,"change:displayMode",this.onDisplayModeChange),this.listenTo(e,"change:selectedFolder change:searchPhrase",this.render),this.listenTo(e,"change:selectedFile",this.onSelectedFileChange),this.listenTo(e,"change:markedFiles",this.onMarkedFilesChange),this.listenTo(e,"change:dateFilter",this.onDateFilterChange),this.listenTo(e.files,"request",this.onFilesRequest),this.listenTo(e.files,"error",this.onFilesError),this.listenTo(e.files,"reset",this.onFilesReset),this.listenTo(e.files,"remove",this.onFilesRemove),this.listenTo(e.files,"add",this.onFilesAdd),this.listenTo(e.files,"change",this.onFilesChange),this.listenTo(e.files,"focus",this.onFilesFocus),this.listenTo(e.folders,"add",this.onFoldersAdd),this.listenTo(e.folders,"remove",this.onFoldersRemove),this.listenTo(e.folders,"change:parent",this.onParentChange),i(window).on("resize."+this.idPrefix,this.positionPreview.bind(this)),i("body").on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){i(window).off("."+this.idPrefix),i("body").off("."+this.idPrefix)},getTemplateData:function(){return{displayMode:this.model.getDisplayMode(),searchPhrase:this.model.getSearchPhrase(),folders:this.serializeFolders(),files:this.serializeFiles()}},serializeMoreFiles:function(){var e=this.model.files;return e.length>0&&e.totalCount>e.length?e.totalCount-e.length:0},serializeFolders:function(){return this.model.hasSearchPhrase()?[]:this.model.getChildFolders(this.model.getSelectedFolder()).map(this.serializeFolder)},serializeFolder:function(e){return{id:e.id,label:e.getLabel().replace(/_/g," "),icon:"__TRASH__"===e.id?"fa-trash-o":"fa-folder-o"}},serializeFiles:function(){var e=this.model.getDateFilter(),i=function(){return!0};e&&(e+="T00:00:00.000Z",i=function(i){for(var t=i.get("files"),l=0;l<t.length;++l)if(t[l].date===e)return!0;return!1});var t=this.model.files.filter(i).map(this.serializeFile),l=this.serializeMoreFiles();return l&&t.push({id:null,text:"+"+l,smallText:"",selected:!1,icon:"fa-files-o"}),t},serializeFile:function(e){var i=e.getLabel();i===e.id&&(i="");var t=this.model.isMarkedFile(e);return{id:e.id,text:e.id,smallText:i.replace(/_/g," "),selected:e.id===this.model.get("selectedFile"),marked:t,icon:"fa-file-o",files:e.get("files").map(function(e){return{hash:e.hash,date:l.format(e.date,"L"),title:e.updatedAt&&e.updater?e.updater.label+"\n"+l.format(e.updatedAt,"LLL"):""}})}},beforeRender:function(){this.lastClickEvent=null},afterRender:function(){this.showPreviewIfNeeded()},showEditFileDialog:function(e){var i=new h({model:e,tree:this.model,done:function(){s.closeDialog()}});s.showDialog(i,this.t("editFile:title"))},showFileChangesDialog:function(e){var i=new c({nc15:e.id,model:this.model});s.showDialog(i,e.id+": "+e.getLabel())},showRecoverFileDialog:function(e){var i=this,t=new a({template:p,autoHide:!1,model:{nc15:e.id}});i.listenTo(t,"answered",function(l){if("yes"===l){var o=this.model.recoverFile(e);o.fail(function(){t.enableAnswers(),s.msg.show({type:"error",time:3e3,text:i.t("recoverFile:msg:failure")})}),o.done(function(){t.closeDialog(),s.msg.show({type:"success",time:3e3,text:i.t("recoverFile:msg:success")})})}else t.closeDialog()}),s.showDialog(t,i.t("recoverFile:title"))},showRemoveFileDialog:function(e,i){var t=this,l=t.model,o=l.isInTrash(e),r=new a({template:m,autoHide:!1,model:{nc15:i.id,multiple:i.get("folders").length>1,purge:o}});t.listenTo(r,"answered",function(o){var a="purge"===o?l.purgeFile(i):"remove"===o?l.removeFile(i):l.unlinkFile(i,e);a.fail(function(){r.enableAnswers(),s.msg.show({type:"error",time:3e3,text:t.t("removeFile:msg:failure")})}),a.done(function(){r.closeDialog(),s.msg.show({type:"success",time:3e3,text:t.t("removeFile:msg:success")})})}),s.showDialog(r,t.t("removeFile:title"))},toggleMarkFile:function(e){this.model.hasSearchPhrase()&&1!==e.get("folders").length?s.msg.show({type:"warning",time:3e3,text:this.t("MSG:canNotMarkSearchResult")}):this.model.toggleMarkFile(e)},showPreviewIfNeeded:function(){var e=this.$(".is-selected")[0];e?(e.scrollIntoViewIfNeeded?e.scrollIntoViewIfNeeded():e.scrollIntoView(),this.showPreview()):this.hidePreview()},showPreview:function(){var i=this.$id("preview"),t=this.serializePreview();e.forEach(t,function(e,t){i.find('dd[data-prop="'+t+'"]').html(e)});var l=this.model,s=l.getSelectedFolder(),o=l.isTrash(),r=l.isInTrash(s);i.css({top:"-1000px",left:"-1000px"}).toggleClass("is-trash",o).toggleClass("is-in-trash",r).removeClass("hidden"),this.$id("subFile").prop("disabled",!0).removeClass("hidden").attr("title","").find(".fa").attr("class","fa fa-spinner fa-spin"),this.resolveFileSub(),this.positionPreview()},serializePreview:function(){var i=this.model.getSelectedFile();return{nc15:e.escape(i.id),name:e.escape(i.getLabel()),folders:this.serializePreviewFolders(),files:this.serializePreviewFiles(),updatedAt:this.serializePreviewUpdatedAt()}},serializePreviewFolders:function(){var i=this.model,t=i.getSelectedFolder(),l=i.getSelectedFile(),s="",o=i.canSeeTrash();return e.forEach(l.get("folders"),function(r){var a=i.folders.get(r);if(a){var n=i.getPath(a),d="__TRASH__"===n[0].id;d&&!o||(n=n.map(function(e){return e.getLabel()}).join(" > "),s+='<li title="'+e.escape(n)+'">',s+=a===t?'<span style="text-decoration: '+(d?"line-through":"none")+'">'+e.escape(a.getLabel())+"</span>":'<a href="#orderDocuments/tree?folder='+a.id+"&file="+l.id+'" data-folder-id="'+a.id+'" style="text-decoration: '+(d?"line-through":"none")+'">'+e.escape(a.getLabel())+"</a>")}}),s?"<ul>"+s+"</ul>":"-"},serializePreviewFiles:function(){var i=this,t=i.model.getSelectedFile(),s="";return e.forEach(t.get("files"),function(o){var r="";o.updatedAt&&o.updater&&(r=e.escape(o.updater.label)+"\n"+l.format(o.updatedAt,"LLL")),s+='<li><a target="_blank" href="/orderDocuments/'+t.id+"?pdf=1&hash="+o.hash+'" data-file-id="'+t.id+'" data-hash="'+o.hash+'" title="'+r+'">'+i.t("files:files:date",{date:l.utc.format(o.date,"LL")})+"</a>"}),s?"<ul>"+s+"</ul>":"-"},serializePreviewUpdatedAt:function(){var i=this.model.getSelectedFile(),t=i.get("updatedAt"),s=i.get("updater");return this.t("files:updatedAt:value",{date:t?l.format(t,"LLL"):"?",user:s?e.escape(s.label):"?"})},positionPreview:function(){var e=this.$(".is-selected");if(e.length){var i,t,l=this.$id("preview").css({top:"-1000px",left:"-1000px"}),s=l.outerWidth(),o=l.outerHeight(),r=this.model.getDisplayMode()===d.DISPLAY_MODE.LIST;if(r&&this.lastClickEvent)i=this.lastClickEvent.pageY,(t=this.lastClickEvent.pageX)+s+15>=window.innerWidth&&(t=window.innerWidth-s-30),this.lastClickEvent.clientY+o+15>=window.innerHeight&&(i-=o);else{var a=e.offset(),n=a.left+s+15>window.innerWidth,h=a.left+200;t=n?h-s:a.left,i=a.top,r&&(i+=14,t+=14)}this.$id("preview").css({top:i+"px",left:t+"px"})}},hidePreview:function(){this.$id("preview").addClass("hidden"),this.fileSubReq&&(this.fileSubReq.abort(),this.fileSubReq=null)},resolveFileSub:function(){var e=this,i=e.model.getSelectedFile();if(i){var t=i.id,l=e.fileSubReq=e.ajax({method:"GET",url:"/subscriptions/orderDocumentTree/"+t});l.fail(function(){var i=e.model.getSelectedFile();i&&t===i.id&&e.$id("subFile").addClass("hidden")}),l.done(function(i){e.toggleFileSub(t,i.subscription)}),l.always(function(){e.fileSubReq=null})}},toggleFileSub:function(e,i){var t=this.model.getSelectedFile();if(t&&e===t.id){var l=!1;if(i){if(e!==i.target)return;l=!0}this.$id("subFile").prop("disabled",!1).removeClass("hidden").toggleClass("active",l).attr("title",this.t("files:sub:"+l)).find(".fa").attr("class","fa fa-eye")}},showEmptyIfNeeded:function(){this.$id("folders").children().length||this.$id("files").children().length||this.$id("files").html("<p>"+this.t("files:"+(this.model.hasSearchPhrase()?"noResults":"empty"))+"</p>")},addFile:function(e){this.model.hasSearchPhrase()||(this.$id("files").find("> p").remove(),this.$id("files").append(this.renderPartialHtml(u,{file:this.serializeFile(e)})))},removeFile:function(e){var i=this.$file(e.id);i.length&&(i.hasClass("is-selected")&&this.hidePreview(),i.remove(),this.showEmptyIfNeeded())},updateFile:function(e){var i=this.$file(e.id);i.length?(i.replaceWith(this.renderPartialHtml(u,{file:this.serializeFile(e)})),e===this.model.getSelectedFile()&&this.showPreview()):this.addFile(e)},$folder:function(e){return this.$id("folders").find('.orderDocumentTree-files-item[data-id="'+e+'"]')},$file:function(e){return this.$id("files").find('.orderDocumentTree-files-item[data-id="'+e+'"]')},onSelectedFileChange:function(){var e=this.model.getSelectedFile();this.$id("files").find(".is-selected").removeClass("is-selected"),e?(this.$id("files").find('.orderDocumentTree-files-item[data-id="'+e.id+'"]').addClass("is-selected"),this.showPreview()):this.hidePreview()},onMarkedFilesChange:function(e,i,t){this.$file(i.id).toggleClass("is-marked",t)},onDateFilterChange:function(){this.render()},onFilesRequest:function(){this.hidePreview(),0===this.$(".orderDocumentTree-files-folder").length&&this.$id("files").html('<p><i class="fa fa-spinner fa-spin fa-3x"></i></p>')},onFilesError:function(){this.$id("files").find(".fa").css("color","red")},onFilesReset:function(){var e=this,i="",t=e.serializeFiles();0===t.length&&0===e.$(".orderDocumentTree-files-folder").length?i="<p>"+e.t("files:"+(this.model.hasSearchPhrase()?"noResults":"empty"))+"</p>":t.forEach(function(t){i+=e.renderPartialHtml(u,{file:t})}),e.$id("files").html(i),e.showPreviewIfNeeded()},onFilesAdd:function(e){this.addFile(e)},onFilesRemove:function(e){this.removeFile(e)},onFilesChange:function(e){e.isInFolder(this.model.get("selectedFolder"))?this.updateFile(e):this.$file(e.id).length&&this.removeFile(e)},onFilesFocus:function(e,i){var t='a[data-hash="'+i+'"]';if(this.model.getSelectedFile()!==e){var l=this.$file(e.id).find(t);l.length?l.focus():(this.model.setSelectedFile(e.id),this.$id("preview").find(t).focus())}else this.$id("preview").find(t).focus()},onFoldersAdd:function(e){this.model.hasSearchPhrase()||this.$id("folders").append(this.renderPartialHtml(g,{folder:this.serializeFolder(e)}))},onFoldersRemove:function(e){this.$folder(e.id).remove(),this.showEmptyIfNeeded()},onParentChange:function(e){var i=this.$folder(e.id);i.length&&e.get("parent")!==this.model.get("selectedFolder")&&i.remove()},onDisplayModeChange:function(){this.$el.removeClass(e.values(d.DISPLAY_MODE).map(function(e){return"is-"+e}).join(" ")).addClass("is-"+this.model.getDisplayMode()),this.positionPreview()},onKeyDown:function(e){switch(e.key&&e.key.toUpperCase()){case"ESCAPE":n.isVisible(this)?n.hide(this):this.model.hasSelectedFile()?this.model.setSelectedFile(null):this.model.getMarkedFileCount()&&this.model.unmarkAllFiles();break;case"A":!e.ctrlKey||document.getSelection().toString().length||document.activeElement&&"INPUT"===document.activeElement.tagName||(this.model.markAllFiles(),e.preventDefault())}}})});