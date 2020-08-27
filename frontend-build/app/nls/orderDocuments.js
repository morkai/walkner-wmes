define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,o,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[o](n[r]-t))in i?i[r]:i.other},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{TITLE:function(n){return"Documents < Wannabe MES"},"controls:emptyOrderNo":function(n){return"No order"},"controls:emptyOrderName":function(n){return"No order is selected."},"controls:emptyDocumentNc15":function(n){return"No document"},"controls:emptyDocumentName":function(n){return"No document is selected."},"controls:localDocumentNc15":function(n){return"Local document"},"controls:localDocumentName":function(n){return"Selected a local document."},"controls:externalDocumentName":function(n){return"Selected an external document."},"controls:openLocalFileDialog":function(n){return"Select a file from the local disk"},"controls:openSettingsDialog":function(n){return"Change settings"},"controls:openLocalOrderDialog":function(n){return"Find order/document"},"controls:reloadDocument":function(n){return"Reload the current document"},"controls:openDocumentWindow":function(n){return"Open the current document in a new window"},"controls:toggleAddImprovementButtons":function(n){return"Add near miss/suggestion"},"controls:openAddNearMissWindow":function(n){return"Submit a new near miss"},"controls:openAddSuggestionWindow":function(n){return"Submit a new suggestion"},"controls:openAddObservationWindow":function(n){return"Submit a new observation"},"controls:switchApps":function(n){return"Switch apps/Configure after 3s"},"controls:reboot":function(n){return"Refresh page/Restart after 3s"},"controls:shutdown":function(n){return"Shutdown after 3s"},"controls:filter:ph":function(n){return"Filter documents"},"controls:lockUi":function(n){return"Lock UI"},"controls:confirm":function(n){return"I confirm that I have<br>read the document."},"controls:confirm:noStation":function(n){return"Please set the workstation number."},"controls:balancing":function(n){return"Balancing"},uiLocked:function(n){return"UI locked.<br>Touch here to unlock."},"popup:document":function(n){return"Failed to open the document in a new window.<br>Check if the popups are allowed in the browser!"},"popup:suggestion":function(n){return"Failed to open the suggestion form in a new window.<br>Check if the popups are allowed in the browser!"},"settings:title":function(n){return"Settings"},"settings:prodLineId":function(n){return"Production line ID"},"settings:prodLineId:help":function(n){return"Production line the application should connect to in order to get the current production order."},"settings:prodLineName":function(n){return"Production line name"},"settings:prodLineName:help":function(n){return"Name displayed in an upper left corner of the application."},"settings:station":function(n){return"Workstation"},"settings:prefixFilter:inclusive":function(n){return"Only documents with 15NC starting with:"},"settings:prefixFilter:exclusive":function(n){return"Only documents with 15NC not starting with:"},"settings:spigotCheck":function(n){return"Spigot checking"},"settings:login":function(n){return"Login"},"settings:password":function(n){return"Password"},"settings:submit":function(n){return"Save settings"},"settings:error:failure":function(n){return"Failed to save the settings."},"settings:error:INVALID_PROD_LINE":function(n){return"Production line does not exist!"},"settings:error:INVALID_CREDENTIALS":function(n){return"Invalid credentials!"},"settings:error:INVALID_LOGIN":function(n){return"Invalid login!"},"settings:error:INVALID_PASSWORD":function(n){return"Invalid password!"},"settings:error:NO_PRIVILEGES":function(n){return"User doesn't have the <em>WMES Documents client activation</em> privilege!"},"settings:msg:localServer:checking":function(n){return"Checking the availability of the local HTTP server..."},"settings:msg:localServer:success":function(n){return"Local HTTP server is available :)"},"settings:msg:localServer:failure":function(n){return"Local HTTP server is not available."},"preview:msg:loading:localFile":function(n){return"Loading a document from the local disk..."},"preview:msg:loading:remoteServer":function(n){return"Loading a document from the remote server..."},"preview:msg:loading:localServer":function(n){return"Loading a document from the local server..."},"preview:msg:loading:failure":function(n){return"Failed to load the document."},"localOrderPicker:title":function(n){return"Order/document search"},"localOrderPicker:plannedOrders":function(n){return"Planned orders"},"localOrderPicker:lastOrders":function(n){return"Last orders"},"localOrderPicker:orderNo":function(n){return"Order/document number"},"localOrderPicker:submit":function(n){return"Find order/document"},"localOrderPicker:submit:order":function(n){return"Find order"},"localOrderPicker:submit:document":function(n){return"Find document"},"localOrderPicker:error:failure":function(n){return"Failed to find the order/document."},"localOrderPicker:error:failure:order":function(n){return"Failed to find the order."},"localOrderPicker:error:failure:document":function(n){return"Failed to find the document."},"localOrderPicker:error:NOT_FOUND:order":function(n){return"Order does not exist."},"localOrderPicker:error:NOT_FOUND:document":function(n){return"Document does not exist."},"localOrderPicker:error:DOCUMENT_NOT_FOUND:document":function(n){return"Document does not exist in the catalog."},"localOrderPicker:error:DOCUMENT_NO_FILES:document":function(n){return"Document does not have any files."},"localOrderPicker:error:DATE_NOT_FOUND:document":function(n){return"Document does not have any matching file.<br>Required availability date: "+e.v(n,"required")+"<br>Files available from: "+e.v(n,"actual")},order:function(n){return"Order card"},bom:function(n){return"Bill of materials"},eto:function(n){return"Engineering To Order"},"bom:filter:ps":function(n){return"Filter components"},"spigot:request":function(n){return"Scan a valid Spigot:<br>"+e.v(n,"component")},"spigot:checking":function(n){return"<i class='fa fa-spinner fa-spin'></i> Checking the Spigot..."},"spigot:failure":function(n){return"Scanned an invalid Spigot."},"spigot:success":function(n){return"Scanned a valid Spigot."},"notes:hd":function(n){return"Order notes"},"notes:ft":function(n){return"Touch anywhere to close this message."},"compRels:hd":function(n){return"Component release"}},pl:!0}});