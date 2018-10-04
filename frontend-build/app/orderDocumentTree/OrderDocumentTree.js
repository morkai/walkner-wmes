// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../user","../time","../core/Model","./OrderDocumentFolder","./OrderDocumentFolderCollection","./OrderDocumentFileCollection","./OrderDocumentUploadCollection"],function(e,t,r,i,l,d,s,n,o){"use strict";var a={TILES:"tiles",LIST:"list"};return l.extend({defaults:function(){return{cutFolder:null,selectedFile:null,selectedFolder:null,markedFiles:{},expandedFolders:{},searchPhrase:"",dateFilter:null,displayMode:localStorage.DOCS_DISPLAY_MODE||a.TILES}},initialize:function(e,t){this.folders=new s(null,{paginate:!1}),this.files=new n(null,{paginate:!1,parentFolderId:this.get("selectedFolder"),searchPhrase:this.get("searchPhrase")}),this.uploads=t.uploads||new o(null,{paginate:!1}),this.folders.once("sync",this.onFoldersSync.bind(this))},subscribe:function(e){e.subscribe("orderDocuments.tree.**",this.onMessage.bind(this))},getDisplayMode:function(){return this.get("displayMode")},setDisplayMode:function(e){this.set("displayMode",localStorage.DOCS_DISPLAY_MODE=e)},hasDateFilter:function(){return null!==this.get("dateFilter")},getDateFilter:function(){return this.get("dateFilter")},setDateFilter:function(e){var t=i.utc.getMoment(e,"YYYY-MM-DD");(!t.isValid()||t.diff("2000-01-01T00:00:00Z")<0)&&(e=null),e!==this.get("dateFilter")&&(this.unmarkAllFiles(),this.set("dateFilter",e))},hasSearchPhrase:function(){return this.get("searchPhrase").length>=4},getSearchPhrase:function(){return this.hasSearchPhrase()?this.get("searchPhrase"):""},setSearchPhrase:function(t,r){r=e.defaults({},r,{reset:!1}),t=t.trim().replace(/\*{2,}/g,"*").replace(/[^0-9#*]+/g,""),(t.length<4||-1===t.indexOf("*")&&15!==t.length)&&(t=""),this.unmarkAllFiles(),t!==this.get("searchPhrase")&&(this.files.setSearchPhrase(t),!1!==r.reset&&this.files.reset([]),this.set("searchPhrase",t,r))},hasSelectedFolder:function(){return!!this.get("selectedFolder")},getSelectedFolder:function(){return this.folders.get(this.get("selectedFolder"))||null},setSelectedFolder:function(t,r){r=e.defaults({},r,{scroll:!1,keepFile:!1,updateUrl:!0}),this.get("selectedFolder")!==t&&(this.setSearchPhrase("",{reset:!1,silent:!0}),this.files.setParentFolderId(t),this.files.reset([]),r.keepFile||this.set("selectedFile",null),this.set("selectedFolder",t,r))},hasSelectedFile:function(){return!!this.get("selectedFile")},getSelectedFile:function(){return this.files.get(this.get("selectedFile"))||null},setSelectedFile:function(e,t){this.get("selectedFile")!==e&&this.set("selectedFile",e,{scroll:t})},getMarkedFiles:function(){return e.values(this.attributes.markedFiles)},getMarkedFileCount:function(){return Object.keys(this.attributes.markedFiles).length},isMarkedFile:function(e){return!!this.attributes.markedFiles[e.id||e]},toggleMarkFile:function(e){this.isMarkedFile(e)?this.unmarkFile(e):this.markFile(e)},markFile:function(e){this.attributes.markedFiles[e.id]=e,this.trigger("change:markedFiles",this,e,!0)},unmarkFile:function(e){(e=this.attributes.markedFiles[e.id||e])&&(delete this.attributes.markedFiles[e.id],this.trigger("change:markedFiles",this,e,!1))},unmarkAllFiles:function(){var t=this;e.forEach(t.attributes.markedFiles,function(e){t.unmarkFile(e)})},getRootFolders:function(){var e=this.folders.filter(function(e){return e.isRoot()&&"__TRASH__"!==e.id});return this.canSeeTrash()&&this.folders.get("__TRASH__")&&e.push(this.folders.get("__TRASH__")),e},getChildFolders:function(e){var t=this;return e?e.get("children").map(function(e){return t.folders.get(e)}).filter(function(e){return!!e}).sort(function(e,t){return e.getLabel().localeCompare(t.getLabel())}):this.getRootFolders()},isFolderCut:function(e){return this.attributes.cutFolder===e},isFolderSelected:function(e){return this.attributes.selectedFolder===e},isFolderExpanded:function(e){return this.attributes.expandedFolders[e]},toggleFolder:function(e,t){var r=this.attributes.expandedFolders;if(null===e)return this.folders.forEach(function(e){r[e.id]=t}),void this.trigger("change:expandedFolders",e,t);var i=!!r[e],l=void 0===t?!i:t;l!==i&&(r[e]=l,this.trigger("change:expandedFolders",e,l))},getRoot:function(e){return this.getPath(e)[0]},getPath:function(e){var t=[];if(e||(e=this.getSelectedFolder()),!e)return t;for(;e;)t.unshift(e),e=this.folders.get(e.get("parent"));return t},isInTrash:function(e){return!!e&&"__TRASH__"===this.getRoot(e).id},canSeeTrash:function(){return r.isAllowedTo("DOCUMENTS:MANAGE")},canMoveFolder:function(e,t){if(t&&t.id===e.id)return!1;if(t===(this.folders.get(e.get("parent"))||null))return!1;for(var r=this.getPath(t),i=0;i<r.length;++i)if(r[i]===e)return!1;return!0},removeFolder:function(e){return this.setSelectedFolder(e.get("parent"),{scroll:!0}),this.act("removeFolder",{folderId:e.id})},moveFolder:function(e,t){var r=this,i=r.getSelectedFolder(),l=e.get("parent"),d=r.get("cutFolder");r.set("cutFolder",null),r.folders.handleFolderMoved(e.id,t?t.id:null),r.setSelectedFolder(e.id,{scroll:!0});var s=r.act("moveFolder",{folderId:e.id,parentId:t?t.id:null});return s.fail(function(){r.folders.handleFolderMoved(e.id,l),r.setSelectedFolder(i?i.id:null,{scroll:!0}),r.set("cutFolder",d)}),s},addFolder:function(e){var t=this,r=t.getSelectedFolder();t.folders.handleFolderAdded(e),t.setSelectedFolder(e.id,{scroll:!0});var i=t.act("addFolder",{folder:e.toJSON()});return i.fail(function(){t.folders.handleFolderPurged(e.id),t.setSelectedFolder(r?r.id:null,{scroll:!0})}),i},renameFolder:function(e,t){var r=this,i=e.get("name");r.folders.handleFolderRenamed(e.id,t);var l=r.act("renameFolder",{folderId:e.id,name:t});return l.fail(function(){r.folders.handleFolderRenamed(e.id,i)}),l},recoverFolder:function(e){var t=this;t.folders.handleFolderRecovered(e.id);var r=this.act("recoverFolder",{folderId:e.id});return r.fail(function(){t.folders.handleFolderRemoved(e.id)}),r},purgeFolder:function(e){return this.act("purgeFolder",{folderId:e.id})},addFiles:function(){return this.act("addFiles",{files:this.uploads.serializeFiles()})},editFile:function(e,t){return this.act("editFile",{fileId:e.id,changes:t})},unlinkFile:function(e,t){return this.act("unlinkFile",{fileId:e.id,folderId:t.id})},unlinkFiles:function(e,t,r){return this.act("unlinkFiles",{fileIds:e.map(function(e){return e.id}),folderId:t.id,remove:!!r})},recoverFile:function(e){return this.act("recoverFile",{fileId:e.id})},recoverFiles:function(e,t){return this.act("recoverFiles",{fileIds:e.map(function(e){return e.id}),remove:!!t})},removeFile:function(e){return this.act("removeFile",{fileId:e.id})},removeFiles:function(e){return this.act("removeFiles",{fileIds:e.map(function(e){return e.id})})},purgeFile:function(e){return this.act("purgeFile",{fileId:e.id})},purgeFiles:function(e,t){return this.act("purgeFiles",{fileIds:e.map(function(e){return e.id}),folderId:t.id})},act:function(e,r){return t.ajax({type:"POST",url:"/orderDocuments/tree",data:JSON.stringify({action:e,params:r})})},onFoldersSync:function(){this.expandSelectedFolder(),this.get("selectedFolder")&&!this.getSelectedFolder()&&this.setSelectedFolder(null)},expandSelectedFolder:function(){var e=this.getSelectedFolder();if(e){var t=this.attributes.expandedFolders,r=e.get("parent");for(t[e.id]=!0;r;){t[r]=!0;var i=this.folders.get(r);if(!i)break;r=i.get("parent")}}},onMessage:function(e,t){switch(t.split(".")[2]){case"fileAdded":this.files.handleFileAdded(e.file),this.uploads.remove(e.uploadId);break;case"fileEdited":this.files.handleFileEdited(e.file,this.get("selectedFolder")),this.uploads.remove(e.uploadId);break;case"fileUnlinked":this.files.handleFileUnlinked(e.file._id,e.folderId),this.unmarkFile(e.file._id);break;case"fileRemoved":this.files.handleFileRemoved(e.file._id),this.unmarkFile(e.file._id);break;case"fileRecovered":this.files.handleFileRecovered(e.file._id);break;case"filePurged":this.files.handleFilePurged(e.file._id),this.get("selectedFile")===e.file._id&&this.setSelectedFile(null);break;case"folderAdded":this.folders.handleFolderAdded(new d(e.folder));break;case"folderRenamed":this.folders.handleFolderRenamed(e.folder._id,e.folder.name);break;case"folderMoved":this.folders.handleFolderMoved(e.folder._id,e.folder.parent);break;case"folderRemoved":this.folders.handleFolderRemoved(e.folder._id);break;case"folderRecovered":this.folders.handleFolderRecovered(e.folder._id);break;case"folderPurged":this.folders.handleFolderPurged(e.folder._id),this.get("selectedFolder")===e.folder._id&&this.setSelectedFolder(this.folders.get(e.folder.parent)?e.folder.parent:null,{scroll:!0,updateUrl:!1})}}},{DISPLAY_MODE:a})});