define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,i,o){return n.c(t,e),t[e]in o?o[t[e]]:(e=n.lc[i](t[e]-r))in o?o[e]:o.other},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{root:{"BREADCRUMBS:base":function(t){return"Tests"},"BREADCRUMBS:browse":function(t){return"Clients"},"MSG:NO_APPS_TO_UPDATE":function(t){return"No apps to update."},"PROPERTY:_id":function(t){return"ID"},"PROPERTY:prodLine":function(t){return"Line"},"PROPERTY:license":function(t){return"License"},"PROPERTY:features":function(t){return"Features"},"PROPERTY:appVersion":function(t){return"App version"},"PROPERTY:mowVersion":function(t){return"MultiOne version"},"PROPERTY:coreScannerDriver":function(t){return"CoreScanner"},"PROPERTY:order":function(t){return"Order"},"PROPERTY:lastSeenAt":function(t){return"Last seen at"},"PROPERTY:status":function(t){return"Status"},"PROPERTY:remoteAddress":function(t){return"IP address"},"status:online":function(t){return"Online"},"status:offline":function(t){return"Offline"},"coreScannerDriver:true":function(t){return"Exists"},"coreScannerDriver:false":function(t){return"Doesn't exist"},"page:update":function(t){return"Update apps"},"page:settings":function(t){return"Change settings"},"list:goToDashboard":function(t){return"Go to dashboard"},"list:goToSettings":function(t){return"Go to settings"},"list:downloadVNC":function(t){return"Download TightVNC config"},"list:restart":function(t){return"Restart application"},"list:update":function(t){return"Update application"},"filter:submit":function(t){return"Filter clients"},"restartDialog:title":function(t){return"Application restart"},"restartDialog:message":function(t){return"Are you sure you want to restart the <em>"+n.v(t,"client")+"</em> application?<br><br>The application will be restarted right after the current programming finishes."},"restartDialog:yes":function(t){return"Restart application"},"restartDialog:no":function(t){return"Cancel"},"updateDialog:title":function(t){return"Application update"},"updateDialog:message":function(t){return"Are you sure you want to update the <em>"+n.v(t,"client")+"</em> application?<br><br>The application will be updated right after the current programming finishes."},"updateDialog:yes":function(t){return"Update application"},"updateDialog:no":function(t){return"Cancel"},"updateAllDialog:title":function(t){return"Applications update"},"updateAllDialog:message":function(t){return"Are you sure you want to update all applications?<br><br>The applications will be updated right after the current programming finishes."},"updateAllDialog:yes":function(t){return"Update applications"},"updateAllDialog:no":function(t){return"Cancel"},"licensePicker:title":function(t){return"Client license selection"}},pl:!0}});