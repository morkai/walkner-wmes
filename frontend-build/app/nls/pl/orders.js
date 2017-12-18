define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:browse":function(n){return"Zlecenia reszty działów"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie zleceń nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie zlecenia nie powiodło się."},"MSG:jump:404":function(n){return"Nie znaleziono zlecenia o nr <em>"+e.v(n,"rid")+"</em>."},"PAGE_ACTION:settings":function(n){return"Zmień ustawienia"},"PAGE_ACTION:print":function(n){return"Drukuj zlecenie"},"PAGE_ACTION:openOrdersPrint":function(n){return"Drukuj zlecenia"},"PAGE_ACTION:jump:title":function(n){return"Skocz do zlecenia po nr"},"PAGE_ACTION:jump:placeholder":function(n){return"Nr zlecenia"},"LIST:ACTION:print":function(n){return"Drukuj"},"openOrdersPrint:title":function(n){return"Drukowanie zleceń"},"openOrdersPrint:orders":function(n){return"Podaj numery zleceń:"},"openOrdersPrint:submit":function(n){return"Drukuj zlecenia"},"openOrdersPrint:msg:findFailure":function(n){return"Nie udało się wyszukać zleceń."},"openOrdersPrint:msg:notFound":function(n){return e.p(n,"count",0,"pl",{one:"Zlecenie "+e.v(n,"orders")+" nie istnieje.",other:"Zlecenia nie istnieją: "+e.v(n,"orders")})},"PANEL:TITLE:details":function(n){return"Szczegóły zlecenia"},"PANEL:TITLE:operations":function(n){return"Lista operacji zlecenia"},"PANEL:TITLE:documents":function(n){return"Lista dokumentów zlecenia"},"PANEL:TITLE:bom":function(n){return"Lista komponentów zlecenia"},"PANEL:TITLE:bom:paint":function(n){return"Lista komponentów zlecenia z malarni"},"PANEL:TITLE:eto":function(n){return"ETO"},"PANEL:TITLE:changes":function(n){return"Historia zmian zlecenia"},"PROPERTY:_id":function(n){return"Nr zlecenia"},"PROPERTY:sapCreatedAt":function(n){return"Czas utworzenia"},"PROPERTY:createdAt":function(n){return"Czas importu"},"PROPERTY:updatedAt":function(n){return"Czas aktualizacji"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:name":function(n){return"Nazwa wyrobu"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qtys":function(n){return"Ilość"},"PROPERTY:qty":function(n){return"Ilość do zrobienia"},"PROPERTY:qtyDone":function(n){return"Ilość zrobiona"},"PROPERTY:unit":function(n){return"Jednostka"},"PROPERTY:startDate":function(n){return"Data startu (podst.)"},"PROPERTY:finishDate":function(n){return"Data ukończenia (podst.)"},"PROPERTY:scheduledStartDate":function(n){return"Data startu (plan.)"},"PROPERTY:scheduledFinishDate":function(n){return"Data ukończenia (plan.)"},"PROPERTY:leadingOrder":function(n){return"Zlecenie nadrzędne"},"PROPERTY:salesOrder":function(n){return"Zlecenie sprzedaży"},"PROPERTY:salesOrderItem":function(n){return"Pozycja zlecenia sprzedaży"},"PROPERTY:priority":function(n){return"Priorytet"},"PROPERTY:description":function(n){return"Opis"},"PROPERTY:soldToParty":function(n){return"Zleceniodawca"},"PROPERTY:delayReason":function(n){return"Powód opóźnienia"},"PROPERTY:statuses":function(n){return"Status"},"PROPERTY:operations":function(n){return"Operacje"},"PROPERTY:operations.no":function(n){return"Nr"},"PROPERTY:operations.workCenter":function(n){return"WorkCenter"},"PROPERTY:operations.name":function(n){return"Nazwa operacji"},"PROPERTY:operations.qty":function(n){return"Ilość"},"PROPERTY:operations.qtyMax":function(n){return"Maks."},"PROPERTY:operations.unit":function(n){return"Jednostka"},"PROPERTY:operations.machineSetupTime":function(n){return"Czas <em>Machine Setup</em>"},"PROPERTY:operations.laborSetupTime":function(n){return"Czas <em>Labor Setup</em>"},"PROPERTY:operations.machineTime":function(n){return"Czas <em>Machine</em>"},"PROPERTY:operations.laborTime":function(n){return"Czas <em>Labor</em>"},"PROPERTY:documents":function(n){return"Dokumenty"},"PROPERTY:documents.item":function(n){return"Nr"},"PROPERTY:documents.nc15":function(n){return"15NC"},"PROPERTY:documents.name":function(n){return"Nazwa dokumentu"},"PROPERTY:bom":function(n){return"Komponenty"},"PROPERTY:bom.item":function(n){return"Nr"},"PROPERTY:bom.nc12":function(n){return"12NC"},"PROPERTY:bom.name":function(n){return"Nazwa"},"PROPERTY:bom.qty":function(n){return"Ilość"},"PROPERTY:bom.unit":function(n){return"Jednostka"},"PROPERTY:bom.unloadingPoint":function(n){return"Punkt rozładunku"},"OPERATIONS:NO_DATA":function(n){return"Zlecenie nie ma zdefiniowanych żadnych operacji."},"DOCUMENTS:NO_DATA":function(n){return"Zlecenie nie ma dołączonych żadnych dokumentów."},"BOM:NO_DATA":function(n){return"Zlecenie nie ma zdefiniowanych żadnych komponentów."},"ETO:NO_DATA":function(n){return"Nie ma dokumentu ETO dla 12NC zlecenia."},"CHANGES:NO_DATA":function(n){return"Zlecenie nie było modyfikowane."},"CHANGES:operations":function(n){return e.p(n,"count",0,"pl",{one:"1 operacja",few:e.n(n,"count")+" operacje",other:e.n(n,"count")+" operacji"})},"CHANGES:documents":function(n){return e.p(n,"count",0,"pl",{one:"1 dokument",few:e.n(n,"count")+" dokumenty",other:e.n(n,"count")+" dokumentów"})},"CHANGES:bom":function(n){return e.p(n,"count",0,"pl",{one:"1 komponent",few:e.n(n,"count")+" komponenty",other:e.n(n,"count")+" komponentów"})},"CHANGES:time":function(n){return"Czas"},"CHANGES:user":function(n){return"Użytkownik"},"CHANGES:property":function(n){return"Atrybut"},"CHANGES:oldValue":function(n){return"Stara wartość"},"CHANGES:newValue":function(n){return"Nowa wartość"},"CHANGES:qtyMax":function(n){return"Maks. ilość dla <em>"+e.v(n,"operationNo")+"</em>"},"filter:placeholder:_id":function(n){return"Dowolny nr"},"filter:placeholder:nc12":function(n){return"Dowolne 12NC"},"filter:submit":function(n){return"Filtruj zlecenia"},"details:showMoreLink":function(n){return"Pokaż więcej szczegołów zlecenia"},"details:opTimes:sap":function(n){return"Czas z SAP"},"details:opTimes:actual":function(n){return"Czas ze współczynnikiem"},"details:opTimes:summed":function(n){return"Czas zgrupowany"},"commentForm:delayReason":function(n){return"Nowy powód opóźnienia"},"commentForm:comment":function(n){return"Komentarz"},"commentForm:source":function(n){return"Źródło"},"commentForm:source:other":function(n){return"Inne"},"commentForm:source:ps":function(n){return"Malarnia"},"commentForm:source:wh":function(n){return"Magazyn"},"commentForm:submit:comment":function(n){return"Komentuj"},"commentForm:submit:edit":function(n){return"Zmień powód opóźnienia"},"settings:tab:operations":function(n){return"Operacje"},"settings:tab:documents":function(n){return"Dokumenty"},"settings:tab:iptChecker":function(n){return"Sprawdzanie w IPT"},"settings:operations:groups":function(n){return"Grupy operacji"},"settings:operations:groups:help":function(n){return"W każdej linii należy podać nazwy operacji, które mają należeć do tej samej grupy, rozdzielone znakiem <code>|</code>. Do każdej nazwy operacji można dodać filtr WorkCenter po znaku <code>@</code>.<br>Na przykład: <code>wykrawanie @ PIVATIC5 | zaginanie</code>"},"settings:operations:timeCoeffs":function(n){return"Współczynniki czasów operacji"},"settings:operations:timeCoeffs:help":function(n){return"W każdej linii należy podać MRP zlecenia, dla którego czasy operacji z SAP mają być zmienione, a następnie nazwy czasów i wartości współczynników.<br>Dostępne nazwy czasów to: <code>machineSetup</code>, <code>machine</code>, <code>laborSetup</code> oraz <code>labor</code>.<br>Na przykład: <code>KE3: labor=0.8 machineSetup=1.1</code>"},"settings:documents:path":function(n){return"Ścieżka do katalogu z plikami dokumentów"},"settings:documents:extra":function(n){return"Dodatkowe dokumenty"},"settings:documents:remoteServer":function(n){return"Serwer wyszukiwarki dokumentów"},"settings:documents:useCatalog":function(n){return"Używaj katalogu WMES przy serwowaniu plików dokumentów"},"settings:iptChecker:toBusinessDays":function(n){return"Ilość dni do sprawdzenia"},"settings:iptChecker:mrps":function(n){return"MRP do sprawdzenia"},"jumpList:details":function(n){return"Szczegóły"},"jumpList:operations":function(n){return"Operacje"},"jumpList:documents":function(n){return"Dokumenty"},"jumpList:bom":function(n){return"Komponenty"},"jumpList:eto":function(n){return"ETO"},"jumpList:changes":function(n){return"Zmiany"},"changeQtyMax:link":function(n){return"zmień"}}});