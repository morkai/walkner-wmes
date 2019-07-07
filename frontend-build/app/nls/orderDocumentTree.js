define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,r){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(r||0)},v:function(e,r){return n.c(e,r),e[r]},p:function(e,r,t,o,u){return n.c(e,r),e[r]in u?u[e[r]]:(r=n.lc[o](e[r]-t))in u?u[r]:u.other},s:function(e,r,t){return n.c(e,r),e[r]in t?t[e[r]]:t.other}};return{root:{"BREADCRUMBS:base":function(e){return"Documentation"},"BREADCRUMBS:root":function(e){return"Documents"},"MSG:LOADING_FAILURE:folders":function(e){return"Failed to load folders."},"MSG:LOADING_FAILURE:files":function(e){return"Failed to load files."},"MSG:fileNotFound":function(e){return"Document "+n.v(e,"nc15")+" doesn't exist."},"MSG:canNotMarkSearchResult":function(e){return"Cannot mark a found document that resides in multiple folders."},"PAGE_ACTION:settings":function(e){return"Settings"},"toolbar:displayMode:tiles":function(e){return"Tiles"},"toolbar:displayMode:list":function(e){return"List"},"toolbar:copyToClipboard":function(e){return"Copy to clipboard"},"toolbar:copyToClipboard:success":function(e){return"Copied to clipboard!"},"toolbar:folderCount":function(e){return"Number of subfolders in the current folder"},"toolbar:fileCount":function(e){return"Number of files in the current folder"},"toolbar:markedFileCount":function(e){return"Number of marked files"},"toolbar:removeMarkedFiles":function(e){return"Move marked files to the trash"},"toolbar:unlinkMarkedFiles":function(e){return"Remove marked files from the current folder"},"toolbar:search:title":function(e){return"Search documents by 15NC"},"toolbar:search:placeholder":function(e){return"15NC..."},"toolbar:editMarkedFiles":function(e){return"Edit latest files"},"path:searchResults":function(e){return"Search results for <code>"+n.v(e,"searchPhrase")+"</code>"},"folders:newFolder:placeholder":function(e){return"New folder..."},"folders:msg:addFolder:failure":function(e){return"Failed to add the new folder."},"folders:msg:moveFolder:failure":function(e){return"Failed to move the folder."},"folders:msg:removeFolder:failure":function(e){return"Failed to remove the folder."},"folders:msg:recoverFolder:failure":function(e){return"Failed to recover the folder."},"folders:msg:renameFolder:failure":function(e){return"Failed to rename the folder."},"files:empty":function(e){return"Folder is empty."},"files:noResults":function(e){return"No matching documents found."},"files:nc15":function(e){return"15NC"},"files:name":function(e){return"Name"},"files:folders":function(e){return"Folders"},"files:files":function(e){return"Files"},"files:files:date":function(e){return"from "+n.v(e,"date")},"files:date":function(e){return"Availability date"},"files:preview":function(e){return"Preview document"},"files:changes":function(e){return"Show changes"},"files:recover":function(e){return"Recover document"},"files:edit":function(e){return"Edit document"},"files:edit:specificFile":function(e){return"Edit file "+n.v(e,"date")},"files:edit:latestFile":function(e){return"Edit latest file"},"files:remove":function(e){return"Remove document"},"files:close":function(e){return"Close"},"files:sub:true":function(e){return"Stop observing"},"files:sub:false":function(e){return"Observe document"},"files:sub:failure":function(e){return"Failed to change the subscription state."},"files:updatedAt":function(e){return"Last change"},"files:updatedAt:value":function(e){return n.v(e,"user")+"<br>"+n.v(e,"date")},"unlinkFiles:title":function(e){return"Unlinking files"},"unlinkFiles:submit":function(e){return"Unlink files"},"unlinkFiles:message":function(e){return"<p>Are you sure you want to remove the marked documents from the current folder?</p>"},"unlinkFiles:remove":function(e){return"<p>Some of the marked documents reside only in the current folder:</p>"},"unlinkFiles:remove:0":function(e){return"ignore documents residing in a single folder."},"unlinkFiles:remove:1":function(e){return"move documents residing in a single folder to Trash."},"unlinkFiles:msg:success":function(e){return"Files unlinked successfully"},"unlinkFiles:msg:failure":function(e){return"Failed to unlink files."},"removeFiles:title":function(e){return"Removing documents"},"removeFiles:submit":function(e){return"Remove documents"},"removeFiles:message:remove":function(e){return"<p>Are you sure you want to remove the marked documents?</p><p>Removed documents will be moved to Trash.</p>"},"removeFiles:message:purge":function(e){return"<p>Are you sure you want to purge the marked documents?</p><p>Documents that reside in other folders than Trash will be removed only from Trash.</p><p>Documents residing only in Trash will be purged completely and irreversibly.</p>"},"removeFiles:msg:success":function(e){return"Documents removed successfully."},"removeFiles:msg:failure":function(e){return"Failed to remove documents."},"removeFile:title":function(e){return"Removing document"},"removeFile:purge":function(e){return"Remove document"},"removeFile:remove":function(e){return"Move to trash"},"removeFile:unlink":function(e){return"Unlink"},"removeFile:cancel":function(e){return"Cancel"},"removeFile:message:single":function(e){return"<p>Are you sure you want to remove the "+n.v(e,"nc15")+" document?</p><p>Removed document will be moved to Trash.</p>"},"removeFile:message:multiple":function(e){return"<p>Document "+n.v(e,"nc15")+" resides in multiple folders.</p><p>You can unlink it from the current folder or move it to Trash.</p>"},"removeFile:message:single:purge":function(e){return"<p>Are you sure you want to purge the "+n.v(e,"nc15")+" document?</p>"},"removeFile:message:multiple:purge":function(e){return"<p>Document "+n.v(e,"nc15")+" resides in multiple folders.</p><p>You can unlink it from the current folder or purge it completely and irreversibly.</p>"},"removeFile:msg:success":function(e){return"Document removed successfully."},"removeFile:msg:failure":function(e){return"Failed to remove the document."},"recoverFiles:title":function(e){return"Recovering documents"},"recoverFiles:submit":function(e){return"Recover documents"},"recoverFiles:message":function(e){return"<p>Are you sure you want to recover the marked documents?</p>"},"recoverFiles:remove":function(e){return"<p>Some of the documents resided in folders that no longer exist:</p>"},"recoverFiles:remove:0":function(e){return"ignore documents, that cannot be recovered to the old folders."},"recoverFiles:remove:1":function(e){return"remove documents."},"recoverFiles:msg:success":function(e){return"Documents recovered successfully."},"recoverFiles:msg:failure":function(e){return"Failed to recover documents."},"recoverFile:title":function(e){return"Recovering document"},"recoverFile:yes":function(e){return"Recover document"},"recoverFile:cancel":function(e){return"Cancel"},"recoverFile:message":function(e){return"<p>Are you sure you want to recover the "+n.v(e,"nc15")+" document?</p>"},"recoverFile:msg:success":function(e){return"Document recovered successfully."},"recoverFile:msg:failure":function(e){return"Failed to recover the document."},"editFile:title":function(e){return"Editing document"},"editFile:submit":function(e){return"Edit document"},"editFile:cancel":function(e){return"Cancel"},"editFile:openFile":function(e){return"Open file"},"editFile:msg:success":function(e){return"Document edited successfully"},"editFile:msg:failure":function(e){return"Failed to edit the document"},"purgeFolder:title":function(e){return"Purging folder"},"purgeFolder:title:trash":function(e){return"Cleaning Trash"},"purgeFolder:submit":function(e){return"Purge folder"},"purgeFolder:submit:trash":function(e){return"Clean Trash"},"purgeFolder:message":function(e){return"<p>Are you sure you want to completely and irreversibly remove the <em>"+n.v(e,"folder")+"</em> folder?</p>"},"purgeFolder:message:trash":function(e){return"<p>Are you sure you want to completely and irreversibly clean the Trash?</p>"},"purgeFolder:msg:success":function(e){return"Folder was purged successfully."},"purgeFolder:msg:success:trash":function(e){return"Trash folder was cleaned successfully."},"purgeFolder:msg:failure":function(e){return"Failed to purge the folder."},"purgeFolder:msg:failure:trash":function(e){return"Failed to purge the Trash."},"contextMenu:expandFolder":function(e){return"Expand"},"contextMenu:expandFolders":function(e){return"Expand everything"},"contextMenu:expandFolders:all":function(e){return"Expand everything"},"contextMenu:collapseFolder":function(e){return"Collapse"},"contextMenu:collapseFolders":function(e){return"Collapse everything"},"contextMenu:collapseFolders:all":function(e){return"Collapse everything"},"contextMenu:newFolder":function(e){return"New folder"},"contextMenu:newSubFolder":function(e){return"New subfolder"},"contextMenu:renameFolder":function(e){return"Rename"},"contextMenu:removeFolder":function(e){return"Remove"},"contextMenu:cutFolder":function(e){return"Cut"},"contextMenu:moveFolder":function(e){return"Move <em>"+n.v(e,"folder")+"</em>"},"contextMenu:recoverFolder":function(e){return"Recover"},"upload:nc15:placeholder":function(e){return"15NC..."},"upload:name:placeholder":function(e){return"Document name"},"uploads:setDate":function(e){return"Set availability dates"},"uploads:submit":function(e){return"Save documents"},"uploads:clear":function(e){return"Clear the list"},"uploads:msg:notAllowed":function(e){return"You don't have permissions to add files."},"uploads:msg:noFolder":function(e){return"Files cannot be added to the root folder."},"uploads:msg:folderIsTrash":function(e){return"Files cannot be added to the Trash."},"uploads:error:INVALID_TYPE":function(e){return"Invalid file type. Expected a PDF document."},"uploads:error:INVALID_RESPONSE":function(e){return"Invalid server response."},"uploads:error:UNKNOWN_ERROR":function(e){return"Unexpected error during file loading."},"fileChanges:time":function(e){return"Time"},"fileChanges:user":function(e){return"User"},"fileChanges:type":function(e){return"Action"},"fileChanges:type:fileAdded":function(e){return"Added"},"fileChanges:type:fileEdited":function(e){return"Edited"},"fileChanges:type:fileRemoved":function(e){return"Trashed"},"fileChanges:type:fileRecovered":function(e){return"Recovered"},"fileChanges:type:filePurged":function(e){return"Purged"}},pl:!0}});