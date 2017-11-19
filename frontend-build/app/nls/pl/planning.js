define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,i,t,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[t](n[r]-i),r in o?o[r]:o.other)},s:function(n,r,i){return e.c(n,r),n[r]in i?i[n[r]]:i.other}};return{"BREADCRUMBS:base":function(n){return"Planowanie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:changes":function(n){return"Historia zmian"},"MSG:LOADING_FAILURE:plan":function(n){return"Nie udało się załadować planu."},"MSG:LOADING_FAILURE:settings":function(n){return"Nie udało się załadować ustawień planu."},"MSG:LOADING_FAILURE:sapOrders":function(n){return"Nie udało się załadować zleceń SAP."},"MSG:LOADING_FAILURE:shifts":function(n){return"Nie udało się załadować zmian produkcyjnych."},"MSG:LOADING_FAILURE:lateOrders":function(n){return"Nie udało się załadować opóźnionych zleceń."},"MSG:LOADING_FAILURE:shiftOrders":function(n){return"Nie udało się załadować zleceń z linii."},"MSG:LOADING_FAILURE:delayReasons":function(n){return"Nie udało się załadować powodów opóźnień."},"MSG:LOADING_FAILURE:productionState":function(n){return"Nie udało się załadować danych produkcyjnych."},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generowanie planu...</span>"},"PAGE_ACTION:legend":function(n){return"Pokaż legendę"},"PAGE_ACTION:changes":function(n){return"Pokaż historię zmian"},"PAGE_ACTION:settings":function(n){return"Zmień ustawienia"},"filter:date":function(n){return"Data planu"},"filter:mrps":function(n){return"Kontroler MRP"},"filter:mrps:placeholder":function(n){return"Wszystkie"},"filter:wrapLists":function(n){return"Przewijanie list"},"filter:lineOrdersList":function(n){return"Lista <u>z</u>leceń"},"filter:useLatestOrderData":function(n){return"Najnowsze zlecenia"},"filter:copyOrderList":function(n){return"Kopiuj listę zleceń"},"filter:stats:quantity":function(n){return"Sztuki:"},"filter:stats:manHours":function(n){return"RBH:"},"filter:stats:tooltip:todo":function(n){return"Suma wszystkich zleceń\nw wybranych MRP"},"filter:stats:tooltip:late":function(n){return"Suma wszystkich\nopóźnionych zleceń\nw wybranych MRP"},"filter:stats:tooltip:done":function(n){return"Suma wszystkich zleceń\nrozplanowanych na liniach\nw wybranych MRP"},"toolbar:printPlan":function(n){return"Drukuj plan linii"},"toolbar:printPlan:all":function(n){return"Wszystkie linie"},"toolbar:showTimes":function(n){return"Pokazuj czasy"},"toolbar:setHourlyPlan":function(n){return"Ustaw ilości godzinowe"},"toolbar:setHourlyPlan:cancel":function(n){return"Anuluj"},"toolbar:copyOrderList":function(n){return"Kopiuj listę zaplanowanych\nzleceń do schowka"},"toolbar:copyOrderList:0":function(n){return"Wszystkie zmiany"},"toolbar:copyOrderList:1":function(n){return"I zmiana"},"toolbar:copyOrderList:2":function(n){return"II zmiana"},"toolbar:copyOrderList:3":function(n){return"III zmiana"},"toolbar:copyOrderList:success":function(n){return"Lista skopiowana do schowka."},"toolbar:stats:quantity":function(n){return"Sztuki:"},"toolbar:stats:manHours":function(n){return"RBH:"},"toolbar:stats:todo":function(n){return"Zlecenia:"},"toolbar:stats:done":function(n){return"Linie:"},"toolbar:stats:late":function(n){return"Opóźnione:"},"toolbar:stats:tooltip:todo":function(n){return"Suma wszystkich zleceń\nw MRP"},"toolbar:stats:tooltip:late":function(n){return"Suma wszystkich\nopóźnionych zleceń\nw MRP"},"toolbar:stats:tooltip:done":function(n){return"Suma wszystkich zleceń\nrozplanowanych na liniach\nw MRP"},"print:workerCount":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"osoba",few:"osoby",other:"osób"})},"print:workerCounts":function(n){return e.v(n,"from")+"-"+e.v(n,"to")+" "+e.p(n,"to",0,"pl",{one:"osoba",few:"osoby",other:"osób"})},empty:function(n){return"Brak planu dla wybranych filtrów."},"lines:hd":function(n){return"Linie"},"lines:division":function(n){return"Wydział"},"lines:prodFlow":function(n){return"Przepływ"},"lines:prodLine":function(n){return"Linia"},"lines:activeFrom":function(n){return"Aktywna od"},"lines:activeTo":function(n){return"Aktywna do"},"lines:activeTime":function(n){return"Aktywność"},"lines:workerCount":function(n){return"Ilość osób"},"lines:orderPriority":function(n){return"Priorytet zleceń"},"lines:mrpPriority":function(n){return"Priorytet MRP"},"lines:menu:header":function(n){return"Linia "+e.v(n,"line")},"lines:menu:settings":function(n){return"Zmień ustawienia linii"},"lines:menu:remove":function(n){return"Usuń linię z MRP"},"lines:menu:remove:title":function(n){return"Usuwanie linii z MRP"},"lines:menu:remove:message":function(n){return"<p>Czy na pewno chcesz usunąć przypisanie MRP <em>"+e.v(n,"mrp")+"</em> do linii <em>"+e.v(n,"line")+"</em>?</p><p>Zmiana będzie miała wpływ tylko na plan dla dnia "+e.v(n,"plan")+".</p>"},"lines:menu:remove:yes":function(n){return"Usuń przypisanie"},"lines:menu:remove:failure":function(n){return"Usunięcie linii nie powiodło się."},"lines:menu:settings:title":function(n){return"Zmiana ustawień linii w MRP"},"lines:menu:settings:submit":function(n){return"Zapisz ustawienia"},"lines:menu:settings:line":function(n){return"Linia produkcyjna"},"lines:menu:settings:applyToAllMrps":function(n){return"Ustaw taką samą <em>Ilość pracowników</em> oraz <em>Priorytet zleceń</em> dla linii "+e.v(n,"line")+" we wszystkich przypisanych MRP, a nie tylko dla "+e.v(n,"mrp")+"."},"lines:menu:settings:failure":function(n){return"Zmiana ustawień nie powiodła się."},"lines:menu:mrpPriority":function(n){return"Ustaw dostępne linie"},"lines:menu:mrpPriority:title":function(n){return"Ustawianie dostępnych linii"},"lines:menu:mrpPriority:submit":function(n){return"Ustaw priorytety MRP"},"lines:menu:mrpPriority:failure":function(n){return"Ustawianie linii nie powiodło się."},"lines:menu:mrpPriority:line":function(n){return"Nowa linia"},"lines:menu:mrpPriority:line:placeholder":function(n){return"Wybierz linię produkcyjną..."},"lines:menu:workerCount":function(n){return"Ustaw ilość pracowników"},"lines:menu:workerCount:title":function(n){return"Ustawianie ilości pracowników"},"lines:menu:workerCount:submit":function(n){return"Ustaw ilości pracowników"},"lines:menu:workerCount:failure":function(n){return"Ustawianie ilości pracowników nie powiodło się."},"lines:menu:orderPriority":function(n){return"Ustaw priorytety zleceń"},"lines:menu:orderPriority:title":function(n){return"Ustawianie priorytetów zleceń"},"lines:menu:orderPriority:submit":function(n){return"Ustaw priorytety zleceń"},"lines:menu:orderPriority:failure":function(n){return"Ustawianie priorytetów zleceń nie powiodło się."},"orders:hd":function(n){return"Zlecenia"},"orders:edit":function(n){return"Ustaw kolejkę zleceń"},"orders:_id":function(n){return"Nr zlecenia"},"orders:date":function(n){return"Data"},"orders:delayReason":function(n){return"Powód"},"orders:kind":function(n){return"Klasyfikacja"},"orders:quantityDone":function(n){return"Ilość zrobiona"},"orders:quantityTodo":function(n){return"Ilość do zrobienia"},"orders:quantityPlan":function(n){return"Ilość do rozplanowania"},"orders:incomplete":function(n){return"Ilość nierozplanowana"},"orders:hardComponent":function(n){return"Trudny komponent"},"orders:nc12":function(n){return"12NC"},"orders:name":function(n){return"Wyrób"},"orders:operation":function(n){return"Operacja"},"orders:machineTime":function(n){return"Czas Machine"},"orders:laborTime":function(n){return"Czas Labor"},"orders:manHours":function(n){return"RBH"},"orders:qty":function(n){return"Ilość"},"orders:statuses":function(n){return"Status"},"orders:ignored":function(n){return"Ignorowane"},"orders:urgent":function(n){return"Pilne"},"orders:source:plan":function(n){return"Zaplanowane"},"orders:source:added":function(n){return"Dodane"},"orders:source:incomplete":function(n){return"Niekompletne"},"orders:source:late":function(n){return"Opóźnione"},"orders:qty:incomplete":function(n){return"("+e.v(n,"qty")+" "+e.p(n,"qty",0,"pl",{one:"nierozplanowana",few:"nierozplanowane",other:"nierozplanowanych"})+")"},"orders:late":function(n){return"Opóźnione"},"orders:customQuantity":function(n){return"Zmieniona ilość"},"orders:menu:header":function(n){return"Zlecenie "+e.v(n,"order")},"orders:menu:sapOrder":function(n){return"Otwórz szczegóły zlecenia SAP"},"orders:menu:shiftOrder":function(n){return"Otwórz szczegóły zlecenia z linii"},"orders:menu:comment":function(n){return"Komentuj zlecenie"},"orders:menu:urgent":function(n){return"Oznacz zlecenie jako pilne"},"orders:menu:urgent:title":function(n){return"Pilne zlecenie"},"orders:menu:urgent:message":function(n){return"<p>Czy na pewno chcesz oznaczyć zlecenie <em>"+e.v(n,"order")+"</em> jako pilne?</p><p>Pilne zlecenia planowane są na początku pracy linii, poza kolejnością priorytetów zleceń.</p>"},"orders:menu:urgent:yes":function(n){return"Oznacz jako pilne"},"orders:menu:urgent:failure":function(n){return"Nie udało się oznaczyć zlecenia jako pilne."},"orders:menu:unurgent":function(n){return"Oznacz zlecenie jako niepilne"},"orders:menu:unurgent:message":function(n){return"<p>Czy na pewno chcesz oznaczyć zlecenie  <em>"+e.v(n,"order")+"</em> jako niepilne?</p><p>Niepilne zlecenia planowane są w kolejności priorytetów zleceń.</p>"},"orders:menu:unurgent:yes":function(n){return"Oznacz jako niepilne"},"orders:menu:ignore":function(n){return"Ignoruj zlecenie"},"orders:menu:ignore:title":function(n){return"Ignorowane zlecenie"},"orders:menu:ignore:message":function(n){return"<p>Czy na pewno chcesz zignorować zlecenie <em>"+e.v(n,"order")+"</em>?</p><p>Ignorowane zlecenia nie są brane pod uwagę podczas planowania.</p>"},"orders:menu:ignore:yes":function(n){return"Ignoruj zlecenie"},"orders:menu:ignore:failure":function(n){return"Ignorowanie zlecenia nie powiodło się."},"orders:menu:unignore":function(n){return"Przestań ignorować zlecenie"},"orders:menu:unignore:message":function(n){return"<p>Czy na pewno chcesz przestać ignorować zlecenie <em>"+e.v(n,"order")+"</em>?</p><p>Zlecenie ponownie będzie brane pod uwagę podczas planowania.</p>"},"orders:menu:unignore:yes":function(n){return"Przestań ignorować zlecenie"},"orders:menu:quantity":function(n){return"Zmień ilość w zleceniu"},"orders:menu:quantity:title":function(n){return"Zmiana ilości"},"orders:menu:quantity:quantityTodo":function(n){return"Ilość do zrobienia:"},"orders:menu:quantity:quantityDone":function(n){return"Ilość zrobiona:"},"orders:menu:quantity:quantityRemaining":function(n){return"Ilość pozostała do zrobienia:"},"orders:menu:quantity:quantityPlan":function(n){return"Ilość do rozplanowania:"},"orders:menu:quantity:help":function(n){return"Domyślnie, <em>Ilość do rozplanowania</em> równa jest <em>Ilości do zrobienia</em> lub <em>Ilości pozostałej do zrobienia</em>, jeżeli włączona jest opcja <em>Planuj wg ilości pozostałej do zrobienia</em>. W tym polu można nadpisać tę wartość."},"orders:menu:quantity:submit":function(n){return"Zmień ilość"},"orders:menu:quantity:failure":function(n){return"Zmiana ilości nie powiodła się."},"orders:menu:add":function(n){return"Dodaj zlecenie"},"orders:menu:remove":function(n){return"Usuń zlecenie"},"orders:menu:remove:title":function(n){return"Usuwanie zlecenia"},"orders:menu:remove:message":function(n){return"<p>Czy na pewno chcesz usunąć zlecenie <em>"+e.v(n,"order")+"</em> z kolejki aktualnego planu?</p>"},"orders:menu:remove:yes":function(n){return"Usuń zlecenie"},"orders:menu:remove:failure":function(n){return"Usuwanie zlecenia nie powiodło się."},"orders:add":function(n){return"Dodaj zlecenie"},"orders:add:title":function(n){return"Dodawanie zlecenia"},"orders:add:submit":function(n){return"Dodaj zlecenie"},"orders:add:failure":function(n){return"Dodawanie zlecenia nie powiodło się."},"orders:add:invalidOrderNo":function(n){return"Podaj prawidłowy, 9-cyfrowy nr zlecenia."},"orders:add:searching":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Wyszukiwanie zlecenia...</span>"},"orders:add:searchFailed":function(n){return"<i class='fa fa-spinner'></i><span>Wyszukiwanie zlecenia nie powiodło się.</span>"},"orders:add:ORDER_NOT_FOUND":function(n){return"Podane zlecenie nie istnieje."},"orders:add:alreadyExists":function(n){return"Zlecenie jest już w aktualnym planie."},"orders:add:future":function(n){return"Zlecenie jest zaplanowane na przyszłość."},"orders:add:undefinedMrp":function(n){return"MRP zlecenia nie jest zdefiniowane w tym planie."},"orders:add:requiredStatus":function(n){return"Zlecenie nie ma wymaganego statusu."},"orders:add:ignoredStatus":function(n){return"Zlecenie ma ignorowany status."},"orders:add:orderNo":function(n){return"Nr zlecenia"},"orders:add:urgent":function(n){return"Pilne"},"orders:add:plans":function(n){return"Zaplanowane w dniach"},"lateOrders:hd":function(n){return"Opóźnione"},"lineOrders:orderNo":function(n){return"Nr zlecenia"},"lineOrders:unit":function(n){return"szt."},"lineOrders:qty:planned":function(n){return"Ilość zaplanowana"},"lineOrders:qty:done":function(n){return"Ilość zrobiona"},"lineOrders:qty:remaining":function(n){return"Ilość pozostała"},"lineOrders:qty:total":function(n){return"Ilość całkowita"},"lineOrders:qty:incomplete":function(n){return"Ilość brakująca"},"lineOrders:pceTime":function(n){return"Czas 1 szt."},"lineOrders:manHours":function(n){return"RBH"},"lineOrders:time":function(n){return"Czas rozp.-zak."},"lineOrders:duration":function(n){return"Czas trwania"},"lineOrders:incomplete":function(n){return"("+e.v(n,"qty")+" "+e.p(n,"qty",0,"pl",{one:"brakująca",few:"brakujące",other:"brakujących"})+")"},"lineOrders:downtimeReason":function(n){return"Powód przestoju"},"lineOrders:list:no":function(n){return"Lp."},"lineOrders:list:shift":function(n){return"Zmiana"},"lineOrders:list:orderNo":function(n){return"Nr zlecenia"},"lineOrders:list:nc12":function(n){return"12NC"},"lineOrders:list:name":function(n){return"Nazwa wyrobu"},"lineOrders:list:qtyPlan":function(n){return"Ilość zaplanowana"},"lineOrders:list:qtyTodo":function(n){return"Ilość do zrobienia"},"lineOrders:list:qty:header":function(n){return"Ilość zaplanowana"},"lineOrders:list:qty:value":function(n){return e.v(n,"plan")+" z "+e.v(n,"todo")},"lineOrders:list:startTime":function(n){return"Początek montażu"},"lineOrders:list:finishTime":function(n){return"Koniec montażu"},"lineOrders:list:lines":function(n){return"Linie"},"lineOrders:list:comment":function(n){return"Komentarz"},"lineOrders:menu:copy":function(n){return"Kopiuj listę zleceń"},"lineOrders:menu:copy:success":function(n){return"Lista zleceń została skopiowana do schowka."},"stats:orderCount":function(n){return"Ilość zleceń"},"stats:quantity":function(n){return"Ilość sztuk"},"stats:manHours":function(n){return"RBH"},"stats:hourlyPlan":function(n){return"Plan godzinowy"},"orderPriority:small":function(n){return"Małe"},"orderPriority:easy":function(n){return"Łatwe"},"orderPriority:hard":function(n){return"Trudne"},"settings:title":function(n){return"Formularz edycji ustawień planu"},"settings:msg:success":function(n){return"Ustawienia zostały zapisane."},"settings:msg:failure":function(n){return"Nie udało się zapisać ustawień!"},"settings:submit":function(n){return"Zapisz ustawienia"},"settings:requiredStatuses":function(n){return"Wymagane statusy"},"settings:requiredStatuses:help":function(n){return"Lista wszystkich statusów jakie zlecenie musi mieć, aby było brane pod uwagę podczas generowania planu."},"settings:ignoredStatuses":function(n){return"Ignorowane statusy"},"settings:ignoredStatuses:help":function(n){return"Lista statusów jakie zlecenie nie może mieć, aby było brane pod uwagę podczas generowania planu."},"settings:ignoreCompleted":function(n){return"Ignoruj ukończone zlecenia"},"settings:ignoreCompleted:help":function(n){return"Podczas planowania pod uwagę nie będą brane zlecenie, których <em>Całkowita ilość zrobiona</em> jest większa lub równa <em>Całkowitej ilości do zrobienia</em>."},"settings:useRemainingQuantity":function(n){return"Planuj wg ilości pozostałej do zrobienia"},"settings:useRemainingQuantity:help":function(n){return"Podczas planowania pod uwagę brana będzie <em>Ilość pozostała do zrobienia</em>, a nie <em>Całkowita ilość do zrobienia</em>. Pozostała ilość to <em>Całkowita ilość do zrobienia</em> pomniejszona o <em>Całkowitą zrobioną ilość</em>."},"settings:hardComponents":function(n){return"Trudne komponenty"},"settings:hardComponents:help":function(n){return"Jeżeli <em>Duże</em> zlecenie będzie zawierało jeden z komponentów na tej liście, to zostanie zaklasyfikowane jako <em>Trudne</em>."},"settings:line":function(n){return"Ustawienia linii"},"settings:line:placeholder":function(n){return"Linia produkcyjna..."},"settings:mrpPriority":function(n){return"Priorytet MRP"},"settings:mrpPriority:help":function(n){return"Lista MRP zleceń, które mogą być robione na danej linii. Kolejność ma znaczenie."},"settings:mrpPriority:placeholder":function(n){return"Lista kontrolerów MRP..."},"settings:activeFrom":function(n){return"Aktywna od"},"settings:activeTo":function(n){return"Aktywna do"},"settings:activeTime:help":function(n){return"Czas dostępności linii w danym dniu. Wartość dotyczy wszystkich przypisanych kontrolerów MRP."},"settings:mrp":function(n){return"Ustawienia kontrolera MRP"},"settings:mrp:help":function(n){return"Wybierz kontroler MRP, dla którego chcesz zdefiniować ustawienia."},"settings:mrp:placeholder":function(n){return"Kontroler MRP..."},"settings:extraOrderSeconds":function(n){return"Dodatkowy czas zlecenia"},"settings:extraOrderSeconds:help":function(n){return"Ilość sekund dodawana do każdego zlecenia oprócz zlecenia rozpoczętego na początku zmiany produkcyjnej."},"settings:extraShiftSeconds:1":function(n){return"Czas na rozpoczęcie I zmiany"},"settings:extraShiftSeconds:2":function(n){return"Czas na rozpoczęcie II zmiany"},"settings:extraShiftSeconds:3":function(n){return"Czas na rozpoczęcie III zmiany"},"settings:extraShiftSeconds:help":function(n){return"Ilość sekund dodawana do pierwszego zlecenia na początku zmiany produkcyjnej."},"settings:bigOrderQuantity":function(n){return"Duże zlecenie"},"settings:bigOrderQuantity:help":function(n){return"Minimalna ilość sztuk do zrobienia, po przekroczeniu której zlecenie klasyfikowane jest jako <em>Duże</em>. Duże zlecenia dzielą się na <em>Łatwe</em> i <em>Trudne</em>."},"settings:hardOrderManHours":function(n){return"Trudne zlecenie"},"settings:hardOrderManHours:help":function(n){return"Minimalna ilość roboczogodzin, po przekroczeniu której <em>Duże</em> zlecenie klasyfikowane jest jako <em>Trudne</em>."},"settings:splitOrderQuantity":function(n){return"Dzielenie zlecenia"},"settings:splitOrderQuantity:help":function(n){return"Minimalna ilość sztuk do zrobienia, po przekroczeniu której <em>Duże</em> zlecenie jest dzielone na części."},"settings:maxSplitLineCount":function(n){return"Ilość części zlecenia"},"settings:maxSplitLineCount:help":function(n){return"Maksymalna ilość linii na jaką <em>Duże</em> zlecenie może być podzielone. Zero - maksymalna dostępna ilość linii."},"settings:mrpLine":function(n){return"Ustawienia linii w MRP"},"settings:mrpLine:help":function(n){return"Wybierz linię produkcyjną, dla którego chcesz zdefiniować ustawienia w zakresie wybranego kontrolera MRP."},"settings:mrpLine:placeholder":function(n){return"Linia produkcyjna..."},"settings:workerCount":function(n){return"Ilość pracowników"},"settings:orderPriority":function(n){return"Priorytet zleceń"},"settings:orderPriority:help":function(n){return"Kolejność wykonywania zleceń na danej linii wg klasyfikacji: małe, łatwe, trudne. Łatwe i trudne zlecenia są jednocześnie duże."},"changes:hd":function(n){return"<span class='planning-change-when'>"+e.v(n,"when")+"</span> przez <span class='planning-change-who'>"+e.v(n,"who")+"</span>: <span class='planning-change-what'>"+e.v(n,"what")+"</span>"},"changes:what:settings":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"zmiana",few:"zmiany",other:"zmian"})+" ustawień"},"changes:what:addedOrders":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"dodane zlecenie",few:"dodane zlecenia",other:"dodanych zleceń"})},"changes:what:changedOrders":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"zmienione zlecenie",few:"zmienione zlecenia",other:"zmienionych zleceń"})},"changes:what:removedOrders":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"usunięte zlecenie",few:"usunięte zlecenia",other:"usuniętych zleceń"})},"changes:what:changedLines":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"pl",{one:"zmieniony plan linii",few:"zmienione plany linii",other:"zmienionych planów linii"})},"changes:removedOrders:REQUIRED_STATUS":function(n){return"Brak wymaganego statusu: "+e.v(n,"requiredStatus")+"."},"changes:removedOrders:IGNORED_STATUS":function(n){return"Ignorowany status: "+e.v(n,"ignoredStatus")+"."},"changes:removedOrders:MISSING_ORDER":function(n){return"Brak zlecenia SAP dla danego dnia."},"changes:settings:lines:remove":function(n){return"Usunięto linię <em>"+e.v(n,"line")+"</em>"},"changes:settings:mrps:remove":function(n){return"Usunięto MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:mrpLines:remove":function(n){return"Usunięto linię <em>"+e.v(n,"line")+"</em> z MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:lines:change":function(n){return"Zmieniono linię <em>"+e.v(n,"line")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:mrps:change":function(n){return"Zmieniono MRP <em>"+e.v(n,"mrp")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:mrpLines:change":function(n){return"Zmieniono linię <em>"+e.v(n,"line")+"</em> w MRP <em>"+e.v(n,"mrp")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:lines:add":function(n){return"Dodano linię <em>"+e.v(n,"line")+"</em>"},"changes:settings:mrps:add":function(n){return"Dodano MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:mrpLines:add":function(n){return"Dodano linię <em>"+e.v(n,"line")+"</em> do MRP <em>"+e.v(n,"mrp")+"</em>"}}});