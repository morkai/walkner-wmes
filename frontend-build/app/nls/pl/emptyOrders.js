define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,a,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[a](n[r]-e),r in i?i[r]:i.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMBS:browse":function(){return"Puste zlecenia"},"MSG:LOADING_FAILURE":function(){return"Ładowanie pustych zleceń nie powiodło się :("},"PAGE_ACTION:print":function(){return"Pokaż wersję do druku"},"PRINT_PAGE:HD:LEFT:all":function(){return"Wszystkie zlecenia bez żadnych operacji"},"PRINT_PAGE:HD:LEFT:startDate":function(n){return"Zlecenia bez żadnych operacji rozpoczynające się "+t.v(n,"date")},"PRINT_PAGE:HD:LEFT:finishDate":function(n){return"Zlecenia bez żadnych operacji kończące się "+t.v(n,"date")},"PRINT_PAGE:FT:PAGE_NO":function(){return"Strona <span class=print-page-no>?</span> z <span class=print-page-count>?</span>"},"PRINT_PAGE:FT:INFO":function(){return"Wydruk wygenerowany <span class=print-page-date>?</span> przez użytkownika <span class=print-page-user>?</span>."},"PROPERTY:_id":function(){return"Nr zlecenia"},"PROPERTY:createdAt":function(){return"Czas stworzenia"},"PROPERTY:nc12":function(){return"12NC"},"PROPERTY:mrp":function(){return"MRP"},"PROPERTY:startDate":function(){return"Data startu"},"PROPERTY:finishDate":function(){return"Data ukończenia"},"PROPERTY:statuses":function(){return"Status"},"filter:placeholder:_id":function(){return"Dowolny nr"},"filter:submit":function(){return"Filtruj puste zlecenia"}}});