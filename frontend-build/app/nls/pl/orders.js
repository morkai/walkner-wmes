define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:browse":function(){return"Zlecenia reszty działów"},"MSG:LOADING_FAILURE":function(){return"Ładowanie zleceń nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie zlecenia nie powiodło się :("},"PANEL:TITLE:details":function(){return"Szczegóły zlecenia"},"PANEL:TITLE:operations":function(){return"Lista operacji zlecenia"},"PANEL:TITLE:changes":function(){return"Historia zmian zlecenia"},"PROPERTY:_id":function(){return"Nr zlecenia"},"PROPERTY:createdAt":function(){return"Czas stworzenia"},"PROPERTY:updatedAt":function(){return"Czas aktualizacji"},"PROPERTY:nc12":function(){return"12NC"},"PROPERTY:name":function(){return"Nazwa wyrobu"},"PROPERTY:mrp":function(){return"MRP"},"PROPERTY:qty":function(){return"Ilość"},"PROPERTY:unit":function(){return"Jednostka"},"PROPERTY:startDate":function(){return"Data startu"},"PROPERTY:finishDate":function(){return"Data ukończenia"},"PROPERTY:delayReason":function(){return"Powód opóźnienia"},"PROPERTY:statuses":function(){return"Status"},"PROPERTY:operations":function(){return"Operacje"},"PROPERTY:operations.no":function(){return"Nr operacji"},"PROPERTY:operations.workCenter":function(){return"WorkCenter"},"PROPERTY:operations.name":function(){return"Nazwa operacji"},"PROPERTY:operations.qty":function(){return"Ilość"},"PROPERTY:operations.unit":function(){return"Jednostka"},"PROPERTY:operations.machineSetupTime":function(){return"Czas <em>Machine Setup</em>"},"PROPERTY:operations.laborSetupTime":function(){return"Czas <em>Labor Setup</em>"},"PROPERTY:operations.machineTime":function(){return"Czas <em>Machine</em>"},"PROPERTY:operations.laborTime":function(){return"Czas <em>Labor</em>"},"OPERATIONS:NO_DATA":function(){return"Zlecenie nie ma zdefiniowanych żadnych operacji."},"CHANGES:NO_DATA":function(){return"Zlecenie nie było modyfikowane."},"CHANGES:operations":function(n){return e.p(n,"count",0,"pl",{one:"1 operacja",few:e.n(n,"count")+" operacje",other:e.n(n,"count")+" operacji"})},"CHANGES:time":function(){return"Czas"},"CHANGES:user":function(){return"Użytkownik"},"CHANGES:property":function(){return"Atrybut"},"CHANGES:oldValue":function(){return"Stara wartość"},"CHANGES:newValue":function(){return"Nowa wartość"},"filter:placeholder:_id":function(){return"Dowolny nr"},"filter:placeholder:nc12":function(){return"Dowolne 12NC"},"filter:submit":function(){return"Filtruj zlecenia"},"details:showMoreLink":function(){return"Pokaż więcej szczegołów zlecenia"},"commentForm:delayReason":function(){return"Nowy powód opóźnienia"},"commentForm:comment":function(){return"Komentarz"},"commentForm:submit:comment":function(){return"Komentuj"},"commentForm:submit:edit":function(){return"Zmień powód opóźnienia"}}});