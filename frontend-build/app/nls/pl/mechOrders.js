define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,i,t,o){return r.c(n,e),n[e]in o?o[n[e]]:(e=r.lc[t](n[e]-i),e in o?o[e]:o.other)},s:function(n,e,i){return r.c(n,e),n[e]in i?i[n[e]]:i.other}};return{"BREADCRUMBS:browse":function(n){return"Zlecenia działu mechanicznego"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie zleceń nie powiodło się :("},"PAGE_ACTION:import":function(n){return"Importuj zlecenia"},"PANEL:TITLE:details":function(n){return"Szczegóły zlecenia"},"PANEL:TITLE:operations":function(n){return"Lista operacji zlecenia"},"PROPERTY:_id":function(n){return"12NC"},"PROPERTY:name":function(n){return"Nazwa wyrobu"},"PROPERTY:importTs":function(n){return"Czas zaimportowania"},"PROPERTY:mrp":function(n){return"Kontroler MRP"},"PROPERTY:materialNorm":function(n){return"Norma materiałowa [kg]"},"OPERATIONS:NO_DATA":function(n){return"Zlecenie nie ma zdefiniowanych żadnych operacji."},"filter:placeholder:_id":function(n){return"Dowolny 12NC"},"filter:submit":function(n){return"Filtruj zlecenia"},"import:title":function(n){return"Importowanie zleceń"},"import:file":function(n){return"Plik CSV ze zleceniami:"},"import:submit":function(n){return"Importuj zlecenia"},"import:cancel":function(n){return"Anuluj"},"import:msg:success":function(n){return"Importowanie zleceń przebiegło pomyślnie :)"},"import:msg:failure":function(n){return"Nie udało się zaimportować zleceń :("},"list:mrp:set":function(n){return"(wybierz kontroler MRP)"},"list:mrp:edit":function(n){return"(zmień kontroler MRP)"},"list:mrp:placeholder":function(n){return"Wybierz kontroler MRP..."},"list:mrp:failure":function(n){return"Nie udało się zmienić kontrolera MRP dla zlecenia <em>"+r.v(n,"nc12")+"</em> :("}}});