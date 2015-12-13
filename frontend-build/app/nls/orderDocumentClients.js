define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,u,o){return n.c(e,t),e[t]in o?o[e[t]]:(t=n.lc[u](e[t]-r),t in o?o[t]:o.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"Documentation"},"BREADCRUMBS:browse":function(e){return"Clients"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the clients :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the client :("},"page:settings":function(e){return"Change settings"},"PROPERTY:_id":function(e){return"ID"},"PROPERTY:status":function(e){return"Status"},"PROPERTY:prodLine":function(e){return"Line"},"PROPERTY:lastSeenAt":function(e){return"Last seen at"},"PROPERTY:fileSource":function(e){return"File source"},"PROPERTY:orderNo":function(e){return"Order no"},"PROPERTY:orderNc12":function(e){return"Order 12NC"},"PROPERTY:orderName":function(e){return"Order name"},"PROPERTY:documentNc15":function(e){return"Document 15NC"},"PROPERTY:documentName":function(e){return"Document name"},"status:online":function(e){return"Online"},"status:offline":function(e){return"Offline"},"fileSource:local":function(e){return"Local file"},"fileSource:remote":function(e){return"Remote file"},"fileSource:search":function(e){return"TPD Search"},"filter:submit":function(e){return"Filter clients"},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Client deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete client"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen client?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> client?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the client :-("},licensingMessage:function(e){return"The current number of clients ("+n.v(e,"clientCount")+") is greater than the number of purchased licenses ("+n.v(e,"licenseCount")+")!"}},pl:!0}});