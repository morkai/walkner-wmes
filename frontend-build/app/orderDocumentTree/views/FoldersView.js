define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/core/views/DialogView","app/core/util/uuid","../OrderDocumentFolder","./EditFolderDialogView","app/orderDocumentTree/templates/folders","app/orderDocumentTree/templates/folder","app/orderDocumentTree/templates/foldersContextMenu","app/orderDocumentTree/templates/purgeFolderDialog"],function(e,o,r,t,d,l,n,i,s,a,h,c,f,u){"use strict";return l.extend({template:h,events:{"click .orderDocumentTree-folders-toggle":function(e){return this.model.toggleFolder(this.$(e.target).closest(".orderDocumentTree-folders-folder")[0].dataset.folderId),!1},"dblclick .orderDocumentTree-folders-toggle":function(){return!1},"click .orderDocumentTree-folders-item":function(e){var o=this.$(e.target).closest(".orderDocumentTree-folders-folder");if(!o.hasClass("is-editing")){var r=o[0].dataset.folderId;e.ctrlKey?window.open("/#orderDocuments/tree?folder="+r):this.model.setSelectedFolder(r)}},"dblclick .orderDocumentTree-folders-item":function(e){this.model.toggleFolder(this.$(e.target).closest(".orderDocumentTree-folders-folder")[0].dataset.folderId)},contextmenu:function(e){var o=this.$(e.target),r=this.$(e.target).closest(".orderDocumentTree-folders-folder");if(r.hasClass("is-editing"))return!1;var t=o.hasClass("orderDocumentTree-folders-label")||o.parent().hasClass("orderDocumentTree-folders-label"),d=r.hasClass("is-selected"),l=r.length&&(t||d)?r[0].dataset.folderId:null;return l&&this.model.setSelectedFolder(l),this.showContextMenu(l,e.clientX,e.clientY),!1}},initialize:function(){var e=this,r=e.model;e.renderFolder=e.renderFolder.bind(e),e.listenTo(r,"change:selectedFolder",this.onSelectedChange),e.listenTo(r,"change:expandedFolders",this.onExpandedChange),e.listenTo(r,"change:cutFolder",this.onCutChange),e.listenTo(r.folders,"add",this.onAdd),e.listenTo(r.folders,"remove",this.onRemove),e.listenTo(r.folders,"change:parent",this.onParentChange),e.listenTo(r.folders,"change:name",this.onNameChange),e.listenTo(r.folders,"change:funcs",this.render),o(window).on("mousedown."+e.idPrefix,e.hideContextMenu.bind(e)),o("body").on("keydown."+e.idPrefix,function(o){27===o.keyCode&&(e.model.set("cutFolder",null),e.hideContextMenu())})},destroy:function(){o(window).off("."+this.idPrefix),o("body").off("."+this.idPrefix)},serialize:function(){return e.assign(l.prototype.serialize.apply(this,arguments),{rootFolders:this.model.getRootFolders(),renderFolder:this.renderFolder})},renderFolder:function(e,o){var r=this.model;return c({id:e.id,label:e.getLabel(),children:r.getChildFolders(e),expanded:r.isFolderExpanded(e.id),selected:r.isFolderSelected(e.id),cut:r.isFolderCut(e.id),isEditing:o&&o.isEditing,isNew:o&&o.isNew,renderFolder:this.renderFolder})},afterRender:function(){this.scrollIntoView()},$folder:function(e){return this.$('.orderDocumentTree-folders-folder[data-folder-id="'+e+'"]')},$children:function(e){return this.$folder(e).find("> .orderDocumentTree-folders-children")},scrollIntoView:function(){var e=this.$(".is-selected > .orderDocumentTree-folders-item")[0];e&&(e.scrollIntoViewIfNeeded?e.scrollIntoViewIfNeeded():e.scrollIntoView())},isContextMenuVisible:function(){var e=this.$id("contextMenu");return 1===e.length&&!e.hasClass("hidden")},showContextMenu:function(e,r,d){var l=this.$id("contextMenu");l.length||(l=o("<div></div>").attr("id",this.idPrefix+"-contextMenu").addClass("orderDocumentTree-contextMenu hidden").appendTo(document.body).on("mousedown",function(e){e.stopPropagation()}).on("click",".orderDocumentTree-contextMenu-item",this.onContextMenuItemClick.bind(this)));var n=this.model,i=n.folders.get(e)||null,s=!!i&&i.isRoot(),a=n.folders.get(this.model.get("cutFolder"))||null,h=n.canManageFolder(i),c=h;!c||t.isAllowedTo("DOCUMENTS:ALL")||i&&!s||(c=!1),l.html(this.renderPartialHtml(f,{canManage:h,canEdit:c,isRoot:s,isTrash:i&&"__TRASH__"===i.id,isInTrash:i&&"__TRASH__"===n.getRoot(i).id,isRecoverable:i&&i.isInTrash(),sourceFolder:i?{id:i.id,label:i.getLabel(),expanded:n.isFolderExpanded(i.id)}:null,cutFolder:a&&n.canMoveFolder(a,i)?{id:a.id,label:a.getLabel()}:null})),l.css({top:"-1000px",left:r+"px"}),l.removeClass("hidden");var u=l.outerHeight();d+u+15>window.innerHeight&&(d-=u),l.css("top",d+"px")},hideContextMenu:function(){this.$id("contextMenu").addClass("hidden")},toggleChildren:function(e){var o=this.$folder(e);if(o.length){var r=this.$children(e);o.removeClass("has-no-children has-children").addClass(r.children().length?"has-children":"has-no-children")}},$lastNonTrashFolder:function(){var e=this.$id("root").children().last();return"__TRASH__"===e.attr("data-folder-id")?e.prev():e},onSelectedChange:function(e,o,r){var t=this,d=t.model.getSelectedFolder();t.$(".is-selected").removeClass("is-selected"),d&&(t.$folder(d.id).addClass("is-selected"),r&&r.scroll&&(t.model.getPath().forEach(function(e){t.model.toggleFolder(e.id,!0)}),t.scrollIntoView()))},onExpandedChange:function(e,o){null===e?this.$(".orderDocumentTree-folders-folder").toggleClass("is-expanded",o):this.$folder(e).toggleClass("is-expanded",o)},onCutChange:function(){this.$(".is-cut").removeClass("is-cut");var e=this.model.get("cutFolder");e&&this.$folder(e).addClass("is-cut")},onAdd:function(e){if(!this.$folder(e.id).length){var r=o(this.renderFolder(e));if(e.isRoot()){var t=this.$lastNonTrashFolder();t.length?r.insertAfter(t):this.$id("root").prepend(r)}else this.$children(e.get("parent")).append(r),this.toggleChildren(e.get("parent"))}},onRemove:function(e){this.$folder(e.id).remove(),this.toggleChildren(e.get("parent"))},onParentChange:function(e,o,r){var t=this.model,d=this.$folder(e.id).detach();if(t.isInTrash(e)&&!t.canSeeTrash())return d.remove(),this.toggleChildren(e.get("parent")),void(r.oldParentId&&this.toggleChildren(r.oldParentId));if(e.isRoot()){var l=this.$lastNonTrashFolder();l.length?d.insertAfter(l):this.$id("root").prepend(d)}else this.$children(e.get("parent")).append(d),this.toggleChildren(e.get("parent"));r.oldParentId&&this.toggleChildren(r.oldParentId),e===t.getSelectedFolder()&&this.onSelectedChange(t,e.id,{scroll:!0})},onNameChange:function(e){var o=this.$folder(e.id);o.length&&o.find("> .orderDocumentTree-folders-item > .orderDocumentTree-folders-label > span").text(e.getLabel())},onContextMenuItemClick:function(e){this.hideContextMenu();var o=this.model,r=e.currentTarget.dataset;switch(r.action){case"expandFolder":o.toggleFolder(r.folderId,!0);break;case"collapseFolder":o.toggleFolder(r.folderId,!1);break;case"expandFolders":this.handleToggleFolders(r.folderId,!0);break;case"collapseFolders":this.handleToggleFolders(r.folderId,!1);break;case"newFolder":this.handleNewFolder(r.folderId);break;case"cutFolder":o.set("cutFolder",r.folderId);break;case"moveFolder":this.handleMoveFolder(r.fromFolderId,r.toFolderId);break;case"removeFolder":this.handleRemoveFolder(r.folderId);break;case"renameFolder":this.handleRenameFolder(r.folderId);break;case"editFolder":this.handleEditFolder(r.folderId);break;case"recoverFolder":this.handleRecoverFolder(r.folderId)}},handleToggleFolders:function(e,o){var r=this.model;if(e){var t=this.$folder(e);r.toggleFolder(e,o),t.find(".has-children").each(function(){r.toggleFolder(this.dataset.folderId,o)})}else r.toggleFolder(null,o)},handleNewFolder:function(e){var r=this,t=r.model,l=r.$folder(e),n=new s({_id:i(),name:"",parent:e,children:[],oldParent:null}),a=o(r.renderFolder(n,{isEditing:!0,isNew:!0}));l.length?(l.removeClass("has-no-children").addClass("has-children").children(".orderDocumentTree-folders-children").append(a),r.model.toggleFolder(e,!0)):r.$id("root").append(a);var h=a.find(".orderDocumentTree-folders-editor");function c(){a.remove()}function f(){var e=h.val().trim();c(),e.length&&(n.set("name",e),t.addFolder(n).fail(function(){d.msg.show({type:"error",time:3e3,text:r.t("folders:msg:addFolder:failure")})}))}h.select().on("blur",f).on("keyup",function(e){return 27===e.keyCode?c():13===e.keyCode?f():void 0}),h[0].scrollIntoViewIfNeeded?h[0].scrollIntoViewIfNeeded():h[0].scrollIntoView()},handleMoveFolder:function(e,o){var r=this,t=r.model,l=t.folders.get(e),n=t.folders.get(o)||null;t.moveFolder(l,n).fail(function(){d.msg.show({type:"error",time:3e3,text:r.t("folders:msg:moveFolder:failure")})})},handleRemoveFolder:function(e){var o=this,r=o.model,t=r.folders.get(e);if(t)if(r.isInTrash(t))o.handlePurgeFolder(t);else{var l=o.$folder(t.id).addClass("is-removed");this.model.removeFolder(t).fail(function(){d.msg.show({type:"error",time:3e3,text:o.t("folders:msg:removeFolder:failure")})}).always(function(){l.removeClass("is-removed")})}},handlePurgeFolder:function(e){var o=this,r=o.model,t="__TRASH__"===e.id,l=new n({template:u,autoHide:!1,model:{isTrash:t,label:e.getLabel()}});o.listenTo(l,"answered",function(){var n=r.purgeFolder(e);n.fail(function(){l.enableAnswers(),d.msg.show({type:"error",time:3e3,text:o.t("purgeFolder:msg:failure"+(t?":trash":""))})}),n.done(function(){l.closeDialog(),d.msg.show({type:"success",time:2e3,text:o.t("purgeFolder:msg:success"+(t?":trash":""))})})}),d.showDialog(l,o.t("purgeFolder:title"+(t?":trash":"")))},handleRecoverFolder:function(e){var o=this;o.tree.recoverFolder(o.tree.folders.get(e)).fail(function(){d.msg.show({type:"error",time:3e3,text:o.t("folders:msg:recoverFolder:failure")})})},handleRenameFolder:function(e){var r=this,t=r.model,l=t.folders.get(e),n=r.$folder(e),i=o(r.renderFolder(l,{isEditing:!0,isNew:!1}));n.replaceWith(i);var s=i.find(".orderDocumentTree-folders-editor");function a(){i.replaceWith(r.renderFolder(l))}function h(){a();var e=s.val().trim();e.length&&t.renameFolder(l,e).fail(function(){d.msg.show({type:"error",time:3e3,text:r.t("folders:msg:renameFolder:failure")})})}s.select().on("blur",h).on("keyup",function(e){return 27===e.keyCode?a():13===e.keyCode?h():void 0})},handleEditFolder:function(e){var o=this.model,r=o.folders.get(e);if(r){if(!r.isRoot())return this.handleRenameFolder(e);var t=new a({folder:r,model:o});d.showDialog(t,this.t("editFolder:title"))}}})});