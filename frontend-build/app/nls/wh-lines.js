define(["app/nls/locale/en"],function(r){var e={lc:{pl:function(e){return r(e)},en:function(e){return r(e)}},c:function(r,e){if(!r)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(r,e,n){if(isNaN(r[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return r[e]-(n||0)},v:function(r,n){return e.c(r,n),r[n]},p:function(r,n,i,t,o){return e.c(r,n),r[n]in o?o[r[n]]:(n=e.lc[t](r[n]-i))in o?o[n]:o.other},s:function(r,n,i){return e.c(r,n),r[n]in i?i[r[n]]:i.other}};return{root:{"BREADCRUMB:base":function(r){return"WH (new)"},"BREADCRUMB:browse":function(r){return"Lines"},"PROPERTY:_id":function(r){return"ID"},"PROPERTY:pickup":function(r){return"Picked"},"PROPERTY:components":function(r){return"Available"},"PROPERTY:packaging":function(r){return"Packaging delivery"},"PROPERTY:sets":function(r){return"Sets"},"PROPERTY:qty":function(r){return"PCE"},"PROPERTY:time":function(r){return"Time"},"PROPERTY:redirLine":function(r){return"Redirection"},"redirLine:start":function(r){return"Start line redirection"},"redirLine:stop":function(r){return"Stop line redirection"},"redirLine:title:start":function(r){return"Starting line redirection"},"redirLine:title:stop":function(r){return"Stopping line redirection"},"redirLine:submit:start":function(r){return"Start redirection"},"redirLine:submit:stop":function(r){return"Stop redirection"},"redirLine:message:start":function(r){return"Starting a line redirection will make all orders planned on the source line move to the target line."},"redirLine:message:stop":function(r){return"Stopping a line redirection will make the previously redirected orders move back to the source line from the target line."},"redirLine:sourceLine":function(r){return"Source line"},"redirLine:targetLine":function(r){return"Target line"},"redirLine:redirDelivered":function(r){return"Redirect delivered orders"},"redirLine:error:SAME_LINES":function(r){return"Can't redirect to the same line."},"redirLine:error:LINE_REDIRECTED":function(r){return"Line is already redirected: "+e.v(r,"line")+" ➜ "+e.v(r,"redirLine")+"."},"redirLine:error:UNKNOWN_SOURCE_LINE":function(r){return"Unknown source line."},"redirLine:error:UNKNOWN_TARGET_LINE":function(r){return"Unknown target line."},"redirLine:error:INVALID_TARGET_LINE":function(r){return"Invalid target line."},"redirLine:error:LINE_NOT_REDIRECTED":function(r){return"Source line isn't redirected."}},pl:!0}});