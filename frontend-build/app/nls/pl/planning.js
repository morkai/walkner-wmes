define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,i){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(i||0)},v:function(n,i){return e.c(n,i),n[i]},p:function(n,i,r,t,o){return e.c(n,i),n[i]in o?o[n[i]]:(i=e.lc[t](n[i]-r),i in o?o[i]:o.other)},s:function(n,i,r){return e.c(n,i),n[i]in r?r[n[i]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Planowanie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:changes":function(n){return"Historia zmian"},"MSG:LOADING_PLAN_FAILURE":function(n){return"Nie udało się załadować planu."},"MSG:LOADING_SETTINGS_FAILURE":function(n){return"Nie udało się załadować ustawień planu."},"MSG:LOADING_SAP_ORDERS_FAILURE":function(n){return"Nie udało się załadować zleceń SAP."},"PAGE_ACTION:changes":function(n){return"Pokaż historię zmian"},"PAGE_ACTION:settings":function(n){return"Zmień ustawienia"},"filter:date":function(n){return"Data planu"},"filter:mrps":function(n){return"Kontroler MRP"},"filter:mrps:placeholder":function(n){return"Wszystkie"},"filter:wrapLists":function(n){return"Przewijanie list"},"filter:useLatestOrderData":function(n){return"Najnowsze zlecenia"},"toolbar:printPlan":function(n){return"Drukuj plan linii"},"toolbar:printPlan:all":function(n){return"Wszystkie linie"},"toolbar:showTimes":function(n){return"Pokazuj czasy"},"print:workerCount":function(n){return e.v(n,"workerCount")+" "+e.p(n,"workerCount",0,"pl",{one:"osoba",few:"osoby",other:"osób"})},empty:function(n){return"Brak planu dla wybranych filtrów."},"lines:hd":function(n){return"Linie"},"lines:edit":function(n){return"Ustaw dostępne linie"},"lines:division":function(n){return"Wydział"},"lines:prodFlow":function(n){return"Przepływ"},"lines:prodLine":function(n){return"Linia"},"lines:activeFrom":function(n){return"Aktywna od"},"lines:activeTo":function(n){return"Aktywna do"},"lines:activeTime":function(n){return"Aktywność"},"lines:workerCount":function(n){return"Ilość osób"},"lines:menu:header":function(n){return"Linia "+e.v(n,"line")},"lines:menu:settings":function(n){return"Zmień ustawienia linii"},"lines:menu:remove":function(n){return"Usuń linię z MRP"},"lines:menu:remove:title":function(n){return"Usuwanie linii z MRP"},"lines:menu:remove:message":function(n){return"<p>Czy na pewno chcesz usunąć przypisanie MRP <em>"+e.v(n,"mrp")+"</em> do linii <em>"+e.v(n,"line")+"</em>?</p><p>Zmiana będzie miała wpływ tylko na plan dla dnia "+e.v(n,"plan")+".</p>"},"lines:menu:remove:yes":function(n){return"Usuń przypisanie"},"lines:menu:remove:failure":function(n){return"Usunięcie linii nie powiodło się."},"lines:menu:settings:title":function(n){return"Zmiana ustawień linii w MRP"},"lines:menu:settings:submit":function(n){return"Zapisz ustawienia"},"lines:menu:settings:line":function(n){return"Linia produkcyjna"},"lines:menu:settings:applyToAllMrps":function(n){return"Ustaw taką samą <em>Ilość osób</em> oraz <em>Priorytet zleceń</em> dla linii "+e.v(n,"line")+" we wszystkich przypisanych MRP, a nie tylko dla "+e.v(n,"mrp")+"."},"lines:menu:settings:failure":function(n){return"Zmiana ustawień nie powiodła się."},"orders:hd":function(n){return"Zlecenia"},"orders:edit":function(n){return"Ustaw kolejkę zleceń"},"orders:_id":function(n){return"Nr zlecenia"},"orders:nc12":function(n){return"12NC"},"orders:name":function(n){return"Wyrób"},"orders:operation":function(n){return"Operacja"},"orders:machineTime":function(n){return"Czas Machine"},"orders:laborTime":function(n){return"Czas Labor"},"orders:manHours":function(n){return"RBH"},"orders:qty":function(n){return"Ilość"},"orders:statuses":function(n){return"Status"},"orders:ignored":function(n){return"Ignorowane?"},"orders:incomplete":function(n){return"("+e.v(n,"qty")+" nierozplanowane)"},"orders:menu:header":function(n){return"Zlecenie "+e.v(n,"order")},"orders:menu:details":function(n){return"Otwórz szczegóły zlecenia"},"orders:menu:ignore":function(n){return"Ignoruj zlecenie"},"orders:menu:ignore:title":function(n){return"Ignorowanie zlecenia"},"orders:menu:ignore:message":function(n){return"<p>Czy na pewno chcesz zignorować zlecenie <em>"+e.v(n,"order")+"</em>?</p><p>Ignorowane zlecenia nie są brane pod uwagę podczas planowania.</p><p>Zmiana będzie miała wpływ tylko na plan dla dnia "+e.v(n,"plan")+".</p>"},"orders:menu:ignore:yes":function(n){return"Ignoruj zlecenie"},"orders:menu:ignore:failure":function(n){return"Ignorowanie zlecenia nie powiodło się."},"orders:menu:unignore":function(n){return"Przestań ignorować zlecenie"},"orders:menu:unignore:message":function(n){return"<p>Czy na pewno chcesz przestać ignorować zlecenie <em>"+e.v(n,"order")+"</em>?</p><p>Zlecenie ponownie będzie brane pod uwagę podczas planowania.</p><p>Zmiana będzie miała wpływ tylko na plan dla dnia "+e.v(n,"plan")+".</p>"},"orders:menu:unignore:yes":function(n){return"Przestań ignorować zlecenie"},"orders:menu:quantity":function(n){return"Zmień ilość"},"orders:menu:quantity:title":function(n){return"Zmiana ilości"},"orders:menu:quantity:quantityTodo":function(n){return"Ilość do zrobienia:"},"orders:menu:quantity:quantityDone":function(n){return"Ilość zrobiona:"},"orders:menu:quantity:quantityRemaining":function(n){return"Ilość pozostała do zrobienia:"},"orders:menu:quantity:quantityPlan":function(n){return"Ilość do rozplanowania:"},"orders:menu:quantity:help":function(n){return"Domyślnie, <em>Ilość do rozplanowania</em> równa jest <em>Ilości do zrobienia</em> lub <em>Ilości pozostałej do zrobienia</em>, jeżeli włączona jest opcja <em>Planuj wg ilości pozostałej do zrobienia</em>. W tym polu można nadpisać tę wartość."},"orders:menu:quantity:submit":function(n){return"Zmień ilość"},"orders:menu:quantity:failure":function(n){return"Zmiana ilości nie powiodła się."},"lineOrders:orderNo":function(n){return"Nr zlecenia"},"lineOrders:unit":function(n){return"szt."},"lineOrders:qty:planned":function(n){return"Ilość zaplanowana"},"lineOrders:qty:remaining":function(n){return"Ilość pozostała"},"lineOrders:qty:total":function(n){return"Ilość całkowita"},"lineOrders:qty:incomplete":function(n){return"Ilość brakująca"},"lineOrders:pceTime":function(n){return"Czas 1 szt."},"lineOrders:time":function(n){return"Czas rozp.-zak."},"lineOrders:duration":function(n){return"Czas trwania"},"lineOrders:incomplete":function(n){return"("+e.v(n,"qty")+" "+e.p(n,"qty",0,"pl",{one:"brakująca",few:"brakujące",other:"brakujących"})+")"},"lineOrders:downtimeReason":function(n){return"Powód przestoju"},"orderPriority:small":function(n){return"Małe"},"orderPriority:easy":function(n){return"Łatwe"},"orderPriority:hard":function(n){return"Trudne"},"settings:title":function(n){return"Formularz edycji ustawień planu"},"settings:msg:success":function(n){return"Ustawienia zostały zapisane."},"settings:msg:failure":function(n){return"Nie udało się zapisać ustawień!"},"settings:submit":function(n){return"Zapisz ustawienia"},"settings:requiredStatuses":function(n){return"Wymagane statusy"},"settings:requiredStatuses:help":function(n){return"Lista wszystkich statusów jakie zlecenie musi mieć, aby było brane pod uwagę podczas generowania planu."},"settings:ignoredStatuses":function(n){return"Ignorowane statusy"},"settings:ignoredStatuses:help":function(n){return"Lista statusów jakie zlecenie nie może mieć, aby było brane pod uwagę podczas generowania planu."},"settings:ignoreCompleted":function(n){return"Ignoruj ukończone zlecenia"},"settings:ignoreCompleted:help":function(n){return"Podczas planowania pod uwagę nie będą brane zlecenie, których <em>Całkowita ilość zrobiona</em> jest większa lub równa <em>Całkowitej ilości do zrobienia</em>."},"settings:useRemainingQuantity":function(n){return"Planuj wg ilości pozostałej do zrobienia"},"settings:useRemainingQuantity:help":function(n){return"Podczas planowania pod uwagę brana będzie <em>Ilość pozostała do zrobienia</em>, a nie <em>Całkowita ilość do zrobienia</em>. Pozostała ilość to <em>Całkowita ilość do zrobienia</em> pomniejszona o <em>Całkowitą zrobioną ilość</em>."},"settings:hardComponents":function(n){return"Trudne komponenty"},"settings:hardComponents:help":function(n){return"Jeżeli <em>Duże</em> zlecenie będzie zawierało jeden z komponentów na tej liście, to zostanie zaklasyfikowane jako <em>Trudne</em>."},"settings:line":function(n){return"Ustawienia linii"},"settings:line:placeholder":function(n){return"Linia produkcyjna..."},"settings:mrpPriority":function(n){return"Priorytet MRP"},"settings:mrpPriority:help":function(n){return"Lista MRP zleceń, które mogą być robione na danej linii. Kolejność ma znaczenie."},"settings:mrpPriority:placeholder":function(n){return"Lista kontrolerów MRP..."},"settings:activeFrom":function(n){return"Aktywna od"},"settings:activeTo":function(n){return"Aktywna do"},"settings:activeTime:help":function(n){return"Czas dostępności linii w danym dniu. Wartość dotyczy wszystkich przypisanych kontrolerów MRP."},"settings:mrp":function(n){return"Ustawienia kontrolera MRP"},"settings:mrp:help":function(n){return"Wybierz kontroler MRP, dla którego chcesz zdefiniować ustawienia."},"settings:mrp:placeholder":function(n){return"Kontroler MRP..."},"settings:extraOrderSeconds":function(n){return"Dodatkowy czas zlecenia"},"settings:extraOrderSeconds:help":function(n){return"Ilość sekund dodawana do każdego zlecenia oprócz zlecenia rozpoczętego na początku zmiany produkcyjnej."},"settings:extraShiftSeconds:1":function(n){return"Czas na rozpoczęcie I zmiany"},"settings:extraShiftSeconds:2":function(n){return"Czas na rozpoczęcie II zmiany"},"settings:extraShiftSeconds:3":function(n){return"Czas na rozpoczęcie III zmiany"},"settings:extraShiftSeconds:help":function(n){return"Ilość sekund dodawana do pierwszego zlecenia na początku zmiany produkcyjnej."},"settings:bigOrderQuantity":function(n){return"Duże zlecenie"},"settings:bigOrderQuantity:help":function(n){return"Minimalna ilość sztuk do zrobenia, po przekroczeniu której zlecenie klasyfikowane jest jako <em>Duże</em>."},"settings:hardOrderManHours":function(n){return"Trudne zlecenie"},"settings:hardOrderManHours:help":function(n){return"Minimalna ilość roboczogodzin, po przekroczeniu której <em>Duże</em> zlecenie klasyfikowane jest jako <em>Trudne</em>."},"settings:mrpLine":function(n){return"Ustawienia linii w MRP"},"settings:mrpLine:help":function(n){return"Wybierz linię produkcyjną, dla którego chcesz zdefiniować ustawienia w zakresie wybranego kontrolera MRP."},"settings:mrpLine:placeholder":function(n){return"Linia produkcyjna..."},"settings:workerCount":function(n){return"Ilość pracowników"},"settings:orderPriority":function(n){return"Priorytet zleceń"},"settings:orderPriority:help":function(n){return"Kolejność wykonywania zleceń na danej linii wg klasyfikacji: małe, łatwe, trudne. Łatwe i trudne zlecenia są jednocześnie duże."}}});