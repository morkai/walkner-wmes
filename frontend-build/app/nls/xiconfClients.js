define(["app/nls/locale/en"],function(t){var e={lc:{pl:function(e){return t(e)},en:function(e){return t(e)}},c:function(t,e){if(!t)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(t,e,n){if(isNaN(t[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return t[e]-(n||0)},v:function(t,n){return e.c(t,n),t[n]},p:function(t,n,r,i,o){return e.c(t,n),t[n]in o?o[t[n]]:(n=e.lc[i](t[n]-r),n in o?o[n]:o.other)},s:function(t,n,r){return e.c(t,n),t[n]in r?r[t[n]]:r.other}};return{root:{"BREADCRUMBS:base":function(){return"Xiconf"},"BREADCRUMBS:browse":function(){return"Clients"},"MSG:LOADING_FAILURE":function(){return"Failed to load the clients :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the client :("},"MSG:NO_APPS_TO_UPDATE":function(){return"No apps to update :("},"PROPERTY:_id":function(){return"ID"},"PROPERTY:prodLine":function(){return"Line"},"PROPERTY:license":function(){return"License"},"PROPERTY:features":function(){return"Features"},"PROPERTY:appVersion":function(){return"App version"},"PROPERTY:mowVersion":function(){return"MultiOne version"},"PROPERTY:coreScannerDriver":function(){return"CoreScanner"},"PROPERTY:order":function(){return"Order"},"PROPERTY:lastSeenAt":function(){return"Last seen at"},"PROPERTY:status":function(){return"Status"},"status:online":function(){return"Online"},"status:offline":function(){return"Offline"},"coreScannerDriver:true":function(){return"Exists"},"coreScannerDriver:false":function(){return"Doesn't exist"},"page:update":function(){return"Update apps"},"page:settings":function(){return"Change settings"},"list:goToDashboard":function(){return"Go to dashboard"},"list:goToSettings":function(){return"Go to settings"},"list:downloadVNC":function(){return"Download TightVNC config"},"list:restart":function(){return"Restart application"},"list:update":function(){return"Update application"},"filter:submit":function(){return"Filter clients"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Client deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete client"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen client?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Are you sure you want to delete the <em>"+e.v(t,"label")+"</em> client?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the client :-("},"restartDialog:title":function(){return"Application restart"},"restartDialog:message":function(t){return"Are you sure you want to restart the <em>"+e.v(t,"client")+"</em> application?<br><br>The application will be restarted right after the current programming finishes."},"restartDialog:yes":function(){return"Restart application"},"restartDialog:no":function(){return"Cancel"},"updateDialog:title":function(){return"Application update"},"updateDialog:message":function(t){return"Are you sure you want to update the <em>"+e.v(t,"client")+"</em> application?<br><br>The application will be updated right after the current programming finishes."},"updateDialog:yes":function(){return"Update application"},"updateDialog:no":function(){return"Cancel"},"updateAllDialog:title":function(){return"Applications update"},"updateAllDialog:message":function(){return"Are you sure you want to update all applications?<br><br>The applications will be updated right after the current programming finishes."},"updateAllDialog:yes":function(){return"Update applications"},"updateAllDialog:no":function(){return"Cancel"}},pl:!0}});