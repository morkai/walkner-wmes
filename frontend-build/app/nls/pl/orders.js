define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,o,u){return t.c(n,e),n[e]in u?u[n[e]]:(e=t.lc[o](n[e]-r))in u?u[e]:u.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{"BREADCRUMB:browse":function(n){return"Zlecenia produkcyjne"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:print":function(n){return"Drukuj zlecenie"},"PAGE_ACTION:openOrdersPrint":function(n){return"Drukuj zlecenia"},"PAGE_ACTION:jump:title":function(n){return"Skocz do zlecenia po nr"},"PAGE_ACTION:jump:placeholder":function(n){return"Nr zlecenia"},"PAGE_ACTION:cycleTime":function(n){return"Czas cyklu"},"PAGE_ACTION:notes":function(n){return"Uwagi"},"PAGE_ACTION:tags":function(n){return"Tagi"},"LIST:ACTION:print":function(n){return"Drukuj"},"openOrdersPrint:title":function(n){return"Drukowanie zleceń"},"openOrdersPrint:orders":function(n){return"Podaj numery zleceń:"},"openOrdersPrint:submit":function(n){return"Drukuj zlecenia"},"openOrdersPrint:msg:findFailure":function(n){return"Nie udało się wyszukać zleceń."},"openOrdersPrint:msg:notFound":function(n){return t.p(n,"count",0,"pl",{one:"Zlecenie "+t.v(n,"orders")+" nie istnieje.",other:"Zlecenia nie istnieją: "+t.v(n,"orders")})},"PANEL:TITLE:fap":function(n){return"Lista zgłoszeń FAP"},"PANEL:TITLE:downtimes":function(n){return"Lista przestojów"},"PANEL:TITLE:childOrders":function(n){return"Lista podzleceń"},"PANEL:TITLE:operations":function(n){return"Lista operacji"},"PANEL:TITLE:documents":function(n){return"Lista dokumentów"},"PANEL:TITLE:bom":function(n){return"Lista komponentów"},"PANEL:TITLE:bom:paint":function(n){return"Lista komponentów z malarni"},"PANEL:TITLE:eto":function(n){return"ETO"},"PANEL:TITLE:changes":function(n){return"Historia zmian"},"PANEL:TITLE:notes":function(n){return"Uwagi"},"PROPERTY:_id":function(n){return"Nr zlecenia"},"PROPERTY:sapCreatedAt":function(n){return"Czas utworzenia"},"PROPERTY:createdAt":function(n){return"Czas importu"},"PROPERTY:updatedAt":function(n){return"Czas aktualizacji"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:name":function(n){return"Nazwa wyrobu"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qtys":function(n){return"Ilość"},"PROPERTY:qty":function(n){return"Ilość do zrobienia"},"PROPERTY:qtyDone":function(n){return"Ilość zrobiona"},"PROPERTY:unit":function(n){return"Jednostka"},"PROPERTY:startDate":function(n){return"Data startu (podst.)"},"PROPERTY:finishDate":function(n){return"Data ukończenia (podst.)"},"PROPERTY:scheduledStartDate":function(n){return"Data startu (plan.)"},"PROPERTY:scheduledFinishDate":function(n){return"Data ukończenia (plan.)"},"PROPERTY:leadingOrder":function(n){return"Zlecenie nadrzędne"},"PROPERTY:salesOrder":function(n){return"Zlecenie sprzedaży"},"PROPERTY:salesOrderItem":function(n){return"Pozycja zlecenia sprzedaży"},"PROPERTY:priority":function(n){return"Priorytet"},"PROPERTY:description":function(n){return"Opis"},"PROPERTY:soldToParty":function(n){return"Zleceniodawca"},"PROPERTY:delayReason":function(n){return"Powód opóźnienia"},"PROPERTY:delayComponent":function(n){return"Opóźniony komponent"},"PROPERTY:statuses":function(n){return"Status"},"PROPERTY:operations":function(n){return"Operacje"},"PROPERTY:operations.no":function(n){return"Nr"},"PROPERTY:operations.workCenter":function(n){return"WorkCenter"},"PROPERTY:operations.name":function(n){return"Nazwa operacji"},"PROPERTY:operations.qty":function(n){return"Ilość"},"PROPERTY:operations.qtyMax":function(n){return"Maks."},"PROPERTY:operations.unit":function(n){return"Jednostka"},"PROPERTY:operations.machineSetupTime":function(n){return"Czas <em>Machine Setup</em>"},"PROPERTY:operations.laborSetupTime":function(n){return"Czas <em>Labor Setup</em>"},"PROPERTY:operations.machineTime":function(n){return"Czas <em>Machine</em>"},"PROPERTY:operations.laborTime":function(n){return"Czas <em>Labor</em>"},"PROPERTY:documents":function(n){return"Dokumenty"},"PROPERTY:documents.item":function(n){return"Nr"},"PROPERTY:documents.nc15":function(n){return"15NC"},"PROPERTY:documents.name":function(n){return"Nazwa dokumentu"},"PROPERTY:bom":function(n){return"Komponenty"},"PROPERTY:bom.orderNo":function(n){return"Zlecenie"},"PROPERTY:bom.mrp":function(n){return"MRP"},"PROPERTY:bom.item":function(n){return"Nr"},"PROPERTY:bom.nc12":function(n){return"12NC"},"PROPERTY:bom.name":function(n){return"Nazwa"},"PROPERTY:bom.qty":function(n){return"Ilość"},"PROPERTY:bom.unit":function(n){return"Jednostka"},"PROPERTY:bom.unloadingPoint":function(n){return"Punkt rozładunku"},"PROPERTY:bom.supplyArea":function(n){return"Obszar zaopatrzenia"},"PROPERTY:bom.distStrategy":function(n){return"Strategia dostarczania"},"PROPERTY:whTime":function(n){return"Czas drop zone"},"PROPERTY:whDropZone":function(n){return"Grupa drop zone"},"PROPERTY:whStatus":function(n){return"Status drop zone"},"PROPERTY:psStatus":function(n){return"Status malarnii"},"PROPERTY:drillStatus":function(n){return"Status wiercenia"},"PROPERTY:enteredBy":function(n){return"Stworzone przez"},"PROPERTY:changedBy":function(n){return"Zmienione przez"},"PROPERTY:m4":function(n){return"4M"},"PROPERTY:etoCont":function(n){return"Kontynuacja pilota ETO"},"PROPERTY:notes":function(n){return"Uwagi"},"PROPERTY:tags":function(n){return"Tagi"},"m4:man":function(n){return"Człowiek"},"m4:machine":function(n){return"Maszyna"},"m4:material":function(n){return"Materiał"},"m4:method":function(n){return"Metoda"},"whStatus:unknown":function(n){return"Nieokreślony"},"whStatus:todo":function(n){return"Do zrobienia"},"whStatus:done":function(n){return"Zrobione"},"psStatus:unknown":function(n){return"Nieokreślony"},"psStatus:new":function(n){return"Oczekiwanie"},"psStatus:started":function(n){return"W trakcie"},"psStatus:startedMsp":function(n){return"W trakcie (MSP)"},"psStatus:partial":function(n){return"Niekompletne"},"psStatus:finished":function(n){return"Zakończone"},"psStatus:aside":function(n){return"Odstawione"},"psStatus:cancelled":function(n){return"Anulowane"},"drillStatus:unknown":function(n){return"Nieokreślony"},"drillStatus:new":function(n){return"Oczekiwanie"},"drillStatus:started":function(n){return"W trakcie"},"drillStatus:partial":function(n){return"Niekompletne"},"drillStatus:finished":function(n){return"Zakończone"},"drillStatus:aside":function(n){return"Odstawione"},"drillStatus:cancelled":function(n){return"Anulowane"},"OPERATIONS:NO_DATA":function(n){return"Brak operacji."},"DOCUMENTS:NO_DATA":function(n){return"Brak dokumentów."},"BOM:NO_DATA":function(n){return"Brak komponentów."},"ETO:NO_DATA":function(n){return"Brak ETO."},"NOTES:NO_DATA":function(n){return"Brak uwag."},"changes:NO_DATA":function(n){return"Zlecenie nie było modyfikowane."},"changes:operations":function(n){return t.p(n,"count",0,"pl",{one:"1 operacja",few:t.n(n,"count")+" operacje",other:t.n(n,"count")+" operacji"})},"changes:documents":function(n){return t.p(n,"count",0,"pl",{one:"1 dokument",few:t.n(n,"count")+" dokumenty",other:t.n(n,"count")+" dokumentów"})},"changes:bom":function(n){return t.p(n,"count",0,"pl",{one:"1 komponent",few:t.n(n,"count")+" komponenty",other:t.n(n,"count")+" komponentów"})},"changes:notes":function(n){return t.p(n,"count",0,"pl",{one:"1 uwaga",few:t.n(n,"count")+" uwagi",other:t.n(n,"count")+" uwag"})},"changes:change":function(n){return"Zmiana #"+t.v(n,"no")},"changes:time":function(n){return"Czas"},"changes:user":function(n){return"Użytkownik"},"changes:property":function(n){return"Atrybut"},"changes:oldValue":function(n){return"Stara wartość"},"changes:newValue":function(n){return"Nowa wartość"},"changes:qtyMax":function(n){return"Maks. ilość dla <em>"+t.v(n,"operationNo")+"</em>"},"changes:toggleSystemChanges":function(n){return"Ukryj zmiany systemowe"},"changes:timeEditor:error:format":function(n){return"Nieprawidłowy format czasu. Oczekiwano rrrr-mm-dd gg:mm:ss."},"changes:timeEditor:error:min":function(n){return"Wartość nie może być wcześniejsza niż: "+t.v(n,"time")},"changes:timeEditor:error:max":function(n){return"Wartość nie może być późniejsza od: "+t.v(n,"time")},"filter:id:_id":function(n){return"Zlecenie"},"filter:id:nc12":function(n){return"Wyrób"},"filter:id:bom.nc12":function(n){return"Komponent"},"filter:id:documents.nc15":function(n){return"Dokument"},"filter:statuses:in":function(n){return"Wymagane statusy"},"filter:statuses:nin":function(n){return"Ignorowane statusy"},"filter:submit":function(n){return"Filtruj zlecenia"},"details:showMoreLink":function(n){return"Pokaż więcej szczegołów zlecenia"},"details:opTimes:sap":function(n){return"Czas z SAP"},"details:opTimes:actual":function(n){return"Czas ze współczynnikiem"},"details:opTimes:summed":function(n){return"Czas zgrupowany"},"commentForm:delayReason":function(n){return"Nowy powód opóźnienia"},"commentForm:delayComponent":function(n){return"12NC"},"commentForm:comment":function(n){return"Komentarz"},"commentForm:source":function(n){return"Źródło"},"commentForm:source:other":function(n){return"Inne"},"commentForm:source:ps":function(n){return"Malarnia"},"commentForm:source:wh":function(n){return"Magazyn"},"commentForm:submit:comment":function(n){return"Komentuj"},"commentForm:submit:edit":function(n){return"Zmień powód opóźnienia"},"settings:tab:operations":function(n){return"Operacje"},"settings:tab:documents":function(n){return"Dokumenty"},"settings:tab:iptChecker":function(n){return"Sprawdzanie w IPT"},"settings:operations:groups":function(n){return"Grupy operacji"},"settings:operations:groups:help":function(n){return"W każdej linii należy podać nazwy operacji, które mają należeć do tej samej grupy, rozdzielone znakiem <code>|</code>. Do każdej nazwy operacji można dodać filtr WorkCenter po znaku <code>@</code>.<br>Na przykład: <code>wykrawanie @ PIVATIC5 | zaginanie</code>"},"settings:operations:timeCoeffs":function(n){return"Współczynniki czasów operacji"},"settings:operations:timeCoeffs:help":function(n){return"W każdej linii należy podać MRP zlecenia, dla którego czasy operacji z SAP mają być zmienione, a następnie nazwy czasów i wartości współczynników.<br>Dostępne nazwy czasów to: <code>machineSetup</code>, <code>machine</code>, <code>laborSetup</code> oraz <code>labor</code>.<br>Na przykład: <code>KE3: labor=0.8 machineSetup=1.1</code>"},"settings:documents:excludedMrps":function(n){return"MRP wyłączone z importu dokumentów"},"settings:documents:extra":function(n){return"Dodatkowe dokumenty"},"settings:iptChecker:toBusinessDays":function(n){return"Ilość dni do sprawdzenia"},"settings:iptChecker:mrps":function(n){return"MRP do sprawdzenia"},"jumpList:details":function(n){return"Szczegóły_1"},"jumpList:fap":function(n){return"Zgłoszenia FAP_2"},"jumpList:downtimes":function(n){return"Przestoje_3"},"jumpList:childOrders":function(n){return"Podzlecenia_4"},"jumpList:operations":function(n){return"Operacje_5"},"jumpList:documents":function(n){return"Dokumenty_Q"},"jumpList:notes":function(n){return"Uwagi_W"},"jumpList:bom":function(n){return"Komponenty_E"},"jumpList:eto":function(n){return"ETO_R"},"jumpList:changes":function(n){return"Zmiany_T"},"changeQtyMax:link":function(n){return"zmień"},"notes:edit:button":function(n){return"Zmień uwagi do zlecenia"},"notes:edit:title":function(n){return"Zmiana uwag do zlecenia"},"notes:edit:submit":function(n){return"Zapisz uwagi"},"notes:edit:text":function(n){return"Treść uwagi"},"notes:edit:priority":function(n){return"Priorytet"},"notes:edit:add":function(n){return"Dodaj uwagę"},"notes:edit:clear":function(n){return"Usuń wszystkie"},"notes:target:docs":function(n){return"Dokumentacja"},"notes:target:ps":function(n){return"Malarnia"}}});