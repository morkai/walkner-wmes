define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[i](n[t]-e))in u?u[t]:u.other},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMB:browse":function(n){return"Puste zlecenia"},"PAGE_ACTION:print":function(n){return"Pokaż wersję do druku"},"PRINT_PAGE:HD:LEFT:all":function(n){return"Wszystkie zlecenia bez żadnych operacji"},"PRINT_PAGE:HD:LEFT:startDate":function(n){return"Zlecenia bez żadnych operacji rozpoczynające się "+r.v(n,"date")},"PRINT_PAGE:HD:LEFT:finishDate":function(n){return"Zlecenia bez żadnych operacji kończące się "+r.v(n,"date")},"PROPERTY:_id":function(n){return"Nr zlecenia"},"PROPERTY:createdAt":function(n){return"Czas utworzenia"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:startDate":function(n){return"Data startu"},"PROPERTY:finishDate":function(n){return"Data ukończenia"},"PROPERTY:statuses":function(n){return"Status"},"filter:placeholder:_id":function(n){return"Dowolny nr"},"filter:submit":function(n){return"Filtruj"}}});