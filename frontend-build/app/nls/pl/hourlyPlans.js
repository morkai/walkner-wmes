define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,i){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(i||0)},v:function(n,i){return e.c(n,i),n[i]},p:function(n,i,r,t,o){return e.c(n,i),n[i]in o?o[n[i]]:(i=e.lc[t](n[i]-r),i in o?o[i]:o.other)},s:function(n,i,r){return e.c(n,i),n[i]in r?r[n[i]]:r.other}};return{"BREADCRUMBS:main":function(n){return"Planowanie"},"BREADCRUMBS:browse":function(n){return"Plany godzinowe"},"BREADCRUMBS:addForm":function(n){return"Wybieranie planu"},"BREADCRUMBS:editForm":function(n){return"Planowanie"},"BREADCRUMBS:heffLineStates":function(n){return"Wydajność godzinowa"},"BREADCRUMBS:dailyMrpPlans":function(n){return"Plany dzienne MRP"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie planów godzinowych nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie planu godzinowego nie powiodło się :("},"MSG:DELETED":function(n){return"Plan godzinowy <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:print":function(n){return"Pokaż wersję do druku"},"PAGE_ACTION:add":function(n){return"Planuj"},"PAGE_ACTION:edit":function(n){return"Edytuj plan"},"PAGE_ACTION:delete":function(n){return"Usuń plan"},"PAGE_ACTION:export":function(n){return"Eksportuj plany godzinowe"},"PAGE_ACTION:heff":function(n){return"Wydajność godzinowa"},"PAGE_ACTION:planning":function(n){return"Planowanie"},"PAGE_ACTION:settings":function(n){return"Zmień ustawienia"},"panel:title":function(n){return"Plan godzinowy"},"panel:title:editable":function(n){return"Formularz edycji planu godzinowego"},"panel:info":function(n){return"Wszystkie zmiany w formularzu zapisywane są na bieżąco. Planowane ilości rozdzielone zostaną dla pracujących Linii produkcyjnych minutę po ostatniej zmianie!"},"column:flow":function(n){return"Przepływ"},"column:noPlan":function(n){return"Brak<br>planu?"},"column:level":function(n){return"Poziom"},"property:shift":function(n){return"Zmiana"},"property:date":function(n){return"Data"},"print:hdLeft":function(n){return"Plan godzinowy dla "+e.v(n,"division")},"print:hdRight":function(n){return e.v(n,"date")+", "+e.v(n,"shift")+" zmiana"},"addForm:panel:title":function(n){return"Formularz wyszukiwania/tworzenia planu godzinowego"},"addForm:submit":function(n){return"Planuj"},"addForm:msg:offline":function(n){return"Nie można planować: brak połączenia z serwerem :("},"addForm:msg:failure":function(n){return"Nie udało się znaleźć/utworzyć wpisu do edycji: "+e.s(n,"error",{AUTH:"brak uprawnień!",INPUT:"nieprawidłowe dane wejściowe!",other:e.v(n,"error")})},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia planu godzinowego"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń plan godzinowy"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany plan godzinowy?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć plan godzinowy <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć planu godzinowego :-("},"heff:filter:division":function(n){return"Wydział"},"heff:filter:prodFlows":function(n){return"Przepływy"},"heff:filter:submit":function(n){return"Filtruj linie"},"planning:unit":function(n){return"szt."},"planning:msg:filesOnly":function(n){return"Upuszczać można tylko pliki z kolejką zleceń!"},"planning:msg:invalidFile":function(n){return"Upuszczono nieprawidłowy plik!"},"planning:msg:upload:failure":function(n){return"Nie udało się załadować pliku :("},"planning:msg:upload:success":function(n){return"Plik został załadowany :)"},"planning:message:overlappingLine":function(n){return"Linia <b>"+e.v(n,"line")+"</b> ("+e.v(n,"time1")+") jest aktywna w tym samym czasie na MRP <b class='dailyMrpPlan-message-mrp'>"+e.v(n,"mrp")+"</b> ("+e.v(n,"time2")+")!"},"planning:import:title":function(n){return"Importowanie kolejki zleceń"},"planning:import:date":function(n){return"Data planu"},"planning:import:mrps":function(n){return"Kontroler MRP (ilość zleceń w kolejce)"},"planning:import:submit":function(n){return"Importuj kolejkę zleceń"},"planning:import:cancel":function(n){return"Anuluj"},"planning:filter:date":function(n){return"Data planu"},"planning:filter:mrp":function(n){return"MRP"},"planning:filter:generatePlans":function(n){return"Przelicz plany"},"planning:filter:savePlans":function(n){return"Zapisz plany"},"planning:filter:setHourlyPlans":function(n){return"Ustaw ilości godzinowe"},"planning:toolbar:generatePlan":function(n){return"Przelicz plan"},"planning:toolbar:savePlan":function(n){return"Zapisz plan"},"planning:toolbar:setHourlyPlan":function(n){return"Ustaw ilości godzinowe"},"planning:toolbar:printPlan":function(n){return"Drukuj plan linii"},"planning:toolbar:printPlan:all":function(n){return"Wszystkie linie"},"planning:toolbar:showTimes":function(n){return"Pokazuj czasy"},"planning:lines:hd":function(n){return"Linie"},"planning:lines:edit":function(n){return"Ustaw dostępne linie"},"planning:lines:division":function(n){return"Wydział"},"planning:lines:prodFlow":function(n){return"Przepływ"},"planning:lines:prodLine":function(n){return"Linia"},"planning:lines:activeFrom":function(n){return"Aktywna od"},"planning:lines:activeTo":function(n){return"Aktywna do"},"planning:lines:workerCount":function(n){return"Ilość osób"},"planning:orders:hd":function(n){return"Zlecenia"},"planning:orders:edit":function(n){return"Ustaw kolejkę zleceń"},"planning:orders:_id":function(n){return"Nr zlecenia"},"planning:orders:nc12":function(n){return"12NC"},"planning:orders:name":function(n){return"Wyrób"},"planning:orders:operation":function(n){return"Operacja"},"planning:orders:machineTime":function(n){return"Czas Machine"},"planning:orders:laborTime":function(n){return"Czas Labor"},"planning:orders:qty":function(n){return"Ilość"},"planning:orders:statuses":function(n){return"Status"},"planning:orders:ignored":function(n){return"Ignorowane?"},"planning:lineOrders:orderNo":function(n){return"Nr zlecenia"},"planning:lineOrders:qty:planned":function(n){return"Ilość zaplanowana"},"planning:lineOrders:qty:remaining":function(n){return"Ilość pozostała"},"planning:lineOrders:qty:total":function(n){return"Ilość całkowita"},"planning:lineOrders:qty:incomplete":function(n){return"Ilość brakująca"},"planning:lineOrders:pceTime":function(n){return"Czas 1 szt."},"planning:lineOrders:time":function(n){return"Czas rozp.-zak."},"planning:lineOrders:duration":function(n){return"Czas trwania"},"planning:lineOrders:incomplete":function(n){return"("+e.v(n,"qty")+" "+e.p(n,"qty",0,"pl",{one:"brakująca",few:"brakujące",other:"brakujących"})+")"},"planning:print:workerCount":function(n){return e.v(n,"workerCount")+" "+e.p(n,"workerCount",0,"pl",{one:"osoba",few:"osoby",other:"osób"})},"settings:tab:dailyMrpPlans":function(n){return"Plany dzienne MRP"},"settings:perOrderOverhead":function(n){return"Czas dodawany do zlecenia"},"settings:perOrderOverhead:help":function(n){return"Ilość sekund dodawana do każdego zlecenia na zmianie oprócz pierwszego, jeżeli rozpoczyna się na początku zmiany."},"settings:shiftStartDowntime":function(n){return"Czas na rozpoczęcie "+e.v(n,"shiftNo")+" zmiany"},"settings:shiftStartDowntime:help":function(n){return"Ilość sekund dodawana do pierwszego zlecenia na początku zmiany."},"settings:qtyRemaining":function(n){return"Planuj wg ilości pozostałej do zrobienia"},"settings:qtyRemaining:help":function(n){return"Zaznaczenie tej opcji sprawi, że pod uwagę brana będzie <em>ilość pozostała do zrobienia</em>, a nie <em>całkowita ilość do zrobienia</em>. <em>Pozostała ilość</em> to <em>całkowita ilość</em> pomniejszona o <em>zrobioną ilość</em>."},"settings:ignoreCnf":function(n){return"Ignoruj zlecenia ze statusem CNF"},"settings:ignoreDlv":function(n){return"Ignoruj zlecenia ze statusem DLV"},"settings:ignoreDone":function(n){return"Ignoruj ukończone zlecenia (ilość zrobiona >= ilość do zrobienia)"},"settings:ignore:help":function(n){return"Zlecenia mające ręcznie nadpisaną ilość nie są ignorowane bez względu na powyższe ustawienia."},"settings:bigOrderQty":function(n){return"Ilość dużego zlecenia"},"settings:bigOrderQty:help":function(n){return"Ilość po przekroczeniu której zlecenie dzielone jest na mniejsze do zrobienia na kilku liniach."}}});