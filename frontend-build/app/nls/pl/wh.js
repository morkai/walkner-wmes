define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,i,r,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[r](n[t]-i))in o?o[t]:o.other},s:function(n,t,i){return e.c(n,t),n[t]in i?i[n[t]]:i.other}};return{"BREADCRUMB:base":function(n){return"Magazyn (nowy)"},"BREADCRUMB:pickup":function(n){return"Kompletacja"},"BREADCRUMB:delivery:components":function(n){return"Wysyłka FIFO"},"BREADCRUMB:delivery:packaging":function(n){return"Wysyłka opakowań"},"BREADCRUMB:delivery:ps":function(n){return"Wysyłka malarnii"},"BREADCRUMB:problems":function(n){return"Problemy"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generowanie planu...</span>"},"msg:genericFailure":function(n){return"<p>Wykonywanie akcji nie powiodło się.</p><p>"+e.v(n,"errorCode")+"</p>"},"msg:connectionFailure":function(n){return"<p>Podczas określania następnej akcji utracono połączenie z serwerem.</p><p>Sprawdź czy masz połączenie z siecią i spróbuj ponownie.</p>"},"msg:resolvingAction":function(n){return"<p>Określanie następnej akcji dla:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:resolveAction:403":function(n){return"<p>Brak uprawnień do wykonywania akcji.</p>"},"msg:USER_NOT_FOUND":function(n){return"<p>Nie znaleziono użytkownika:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:NO_PENDING_ORDERS":function(n){return"<p>Brak zleceń gotowych do kompletacji.</p>"},"msg:INVALID_FUNC":function(n){return"<p>Nieprawidłowa funkcja użytkownika.</p>"},"msg:FORCE_SET_ASSIGNED":function(n){return"<p>Użytkownik ma już przypisany niezakończony set.</p>"},"msg:delivered":function(n){return"<p>Dostawa zakończona pomyślnie.</p>"},"msg:nothingToDeliver":function(n){return"<p>Brak wózków oczekujących na wysyłkę.</p>"},"msg:switchingPlan":function(n){return"<p>Przełączanie planu na:</p><p>"+e.v(n,"newDate")+"</p>"},"PAGE_ACTION:dailyPlan":function(n){return"Plan dzienny"},"PAGE_ACTION:old":function(n){return"Stary moduł"},"PAGE_ACTION:legend":function(n){return"Legenda"},"PAGE_ACTION:pickup":function(n){return"Kompletacja"},"PAGE_ACTION:problems":function(n){return"Problemy"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:resolveAction:title":function(n){return"Podaj ID karty, aby rozpocząć następną akcję"},"PAGE_ACTION:resolveAction:placeholder":function(n){return"ID karty"},"filter:whStatuses":function(n){return"Etap"},"filter:psStatuses":function(n){return"Status malarnii"},"filter:distStatuses":function(n){return"Status wysyłki"},"filter:date":function(n){return"Data planu"},"filter:startTime":function(n){return"Początek"},"filter:useDarkerTheme":function(n){return"Wysoki kontrast"},empty:function(n){return"Brak planu dla wybranych filtrów."},"prop:group":function(n){return"Gr."},"prop:no":function(n){return"Lp."},"prop:shift":function(n){return"Zm."},"prop:plan":function(n){return"Plan"},"prop:date":function(n){return"Data"},"prop:set":function(n){return"Set"},"prop:mrp":function(n){return"MRP"},"prop:line":function(n){return"Linia"},"prop:order":function(n){return"Zlecenie"},"prop:product":function(n){return"Wyrób"},"prop:planStatus":function(n){return"Status"},"prop:whStatus":function(n){return"Etap"},"prop:fifoStatus":function(n){return"FIFO"},"prop:packStatus":function(n){return"Opak."},"prop:psDistStatus":function(n){return"Mal."},"prop:nc12":function(n){return"12NC"},"prop:name":function(n){return"Nazwa wyrobu"},"prop:qty":function(n){return"Ilość"},"prop:qtyPlan":function(n){return"Ilość rozplanowana"},"prop:qtyTodo":function(n){return"Ilość do zrobienia"},"prop:startTime":function(n){return"Początek"},"prop:finishTime":function(n){return"Koniec"},"prop:time":function(n){return"Czas"},"prop:comment":function(n){return"Komentarz"},"prop:problem":function(n){return"Problem"},"prop:picklist":function(n){return"LP10"},"prop:fmx":function(n){return"FMX"},"prop:kitter":function(n){return"Kitter"},"prop:platformer":function(n){return"Plat."},"prop:packer":function(n){return"Opak."},"prop:painter":function(n){return"Mal."},"prop:carts":function(n){return"Wózki"},"prop:user":function(n){return"Magazynier"},"prop:problemArea":function(n){return"Pole problemów"},"prop:status":function(n){return"Status"},"prop:pickup":function(n){return"Kompletacja"},"prop:delivery":function(n){return"Wysyłka"},"func:fmx":function(n){return"FMX"},"func:kitter":function(n){return"Kitter"},"func:platformer":function(n){return"Platformowy"},"func:packer":function(n){return"Opakowania"},"func:painter":function(n){return"Malarnia"},"func:dist-components":function(n){return"Wysyłka FIFO"},"func:dist-packaging":function(n){return"Wysyłka opakowań"},"status:picklistDone:pending":function(n){return"Transakcja niewykonana"},"status:picklistDone:progress":function(n){return"Transakcja rozpoczęta"},"status:picklistDone:success":function(n){return"Transakcja wykonana"},"status:picklistDone:failure":function(n){return"Transakcja nieudana"},"status:pending":function(n){return"Oczekiwanie"},"status:started":function(n){return"Rozpoczęte"},"status:finished":function(n){return"Zakończone"},"status:picklist":function(n){return"Picklista"},"status:pickup":function(n){return"Kompletacja"},"status:problem":function(n){return"Problem"},"status:cancelled":function(n){return"Anulowane"},"status:ignored":function(n){return"Ignorowana"},"distStatus:pending":function(n){return"Oczekiwanie"},"distStatus:started":function(n){return"Rozpoczęta"},"distStatus:finished":function(n){return"Zakończona"},"menu:shiftOrder":function(n){return"Otwórz szczegóły zlecenia z linii"},"menu:copy:all":function(n){return"Kopiuj listę zleceń"},"menu:copy:lineGroup":function(n){return"Kopiuj listę zleceń <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:copy:lineGroupNo":function(n){return"Kopiuj nry zleceń <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:cancelOrder":function(n){return"Anuluj zlecenie"},"menu:cancelSet":function(n){return"Anuluj zestaw zleceń"},"menu:restoreOrder":function(n){return"Wznów zlecenie"},"menu:restoreSet":function(n){return"Wznów zestaw zleceń"},"menu:resetOrder":function(n){return"Resetuj zlecenie"},"menu:resetSet":function(n){return"Resetuj zestaw zleceń"},"unassignSet:menu":function(n){return"Odepnij użytkownika"},"unassignSet:failure":function(n){return"Odpinanie użytkownika nie powiodło się."},"unassignSet:FINISHED":function(n){return"Set został już zakończony."},"unassignSet:DELIVERED":function(n){return"Set został już wysłany."},"settings:tab:planning":function(n){return"Planowanie"},"settings:tab:pickup":function(n){return"Kompletacja"},"settings:tab:delivery":function(n){return"Wysyłka"},"settings:tab:users":function(n){return"Użytkownicy"},"settings:wh.planning.ignorePsStatus":function(n){return"Ignorowane statusy malarnii"},"settings:wh.planning.ignorePsStatus:help":function(n){return"Zlecenie nie zostanie brane pod uwagę podczas tworzenia nowego seta, jeżeli jego status malarnii to jeden z wybranych statusów."},"settings:wh.planning.psPickupStatus":function(n){return"Statusy malarnii do rozpoczęcia kompletacji"},"settings:wh.planning.psPickupStatus:help":function(n){return"Rozpoczęty set zostanie przydzielony do kompletacji dla malarnii, jeżeli każde z malowanych zleceń w secie ma jeden z wybranych statusów malarnii."},"settings:wh.planning.psPickupReadyFuncs":function(n){return"Zakończone funkcje do rozpoczęcia kompletacji malarnii"},"settings:wh.planning.psPickupReadyFuncs:help":function(n){return"Rozpoczęty set zostanie przydzielony do kompletacji dla malarnii, jeżeli każde z malowanych zleceń w secie ma zakończoną kompletację przez każdą z wybranych funkcji."},"settings:wh.planning.groupDuration":function(n){return"Czas trwania grupy zleceń [h]"},"settings:wh.planning.groupExtraItems":function(n){return"Minimalna ilość sztuk w grupie"},"settings:wh.planning.groupExtraItems:help":function(n){return"Jeżeli ilość sztuk zlecenia w pierwszej/ostatniej grupie danej linii będzie mniejsza lub równa podanej wartości, to grupa ta zostanie scalona z następną/poprzednią grupą."},"settings:wh.planning.ignoredMrps":function(n){return"Ignorowane MRP"},"settings:wh.planning.ignoredMrps:help":function(n){return"Zlecenia z jednym z poniższych MRP nie pojawią się na liście zleceń do kompletacji."},"settings:wh.planning.enabledMrps":function(n){return"Włączone MRP"},"settings:wh.planning.enabledMrps:help":function(n){return"Tylko zlecenia z jednym z poniższych MRP będą brane pod uwagę podczas tworzenia nowych zestawów zleceń."},"settings:wh.planning.lineGroups":function(n){return"Grupy linii"},"settings:wh.planning.lineGroups:help":function(n){return"Jeżeli zlecenie jest robione na kilku liniach, to części robione na liniach zdefiniowanych w grupach zostaną połączone. Każda linia to oddzielna grupa: <code>ID_GRUPY: ID_LINII_1, ID_LINII2, ...</code> Na przykład:<br><code class='example'>CT1/2: CT1, CT2\nCT3/4: CT3, CT4\nCT5/6: CT5, CT6</code>"},"settings:wh.planning.maxSetSize":function(n){return"Maksymalna ilość zleceń w zestawie (SET)"},"settings:wh.planning.minSetDuration":function(n){return"Minimalny czas trwania zestawu zleceń [min]"},"settings:wh.planning.minSetDuration:help":function(n){return"Czas trwania zestawu zleceń nie może przekraczać podanej ilości minut, aby został rozszerzony o zlecenie, które przekracza <em>Czas trwania grupy zleceń</em>."},"settings:wh.planning.maxSetDuration":function(n){return"Maksymalny czas trwania zestawu zleceń [min]"},"settings:wh.planning.maxSetDuration:help":function(n){return"Czas trwania zestawu zleceń nie może przekraczać podanej ilości minut."},"settings:wh.planning.maxSetDifference":function(n){return"Maksymalny czas odstępu w zestawie zleceń [min]"},"settings:wh.planning.maxSetDifference:help":function(n){return"Tworzenie zestawu zleceń zostanie zakończone, jeżeli różnica czasu rozpoczęcia następnego potencjalnego zlecenia do czasu zakończenia ostatniego zlecenia dodanego do zestawu jest większa od podanej ilości minut."},"settings:wh.planning.pendingOnly":function(n){return"Tylko oczekujące zlecenia"},"settings:wh.planning.pendingOnly:help":function(n){return"Jeżeli opcja zostanie włączona, to do obliczania <em>Maksymalnego czasu odstępu w zestawie zleceń</em> brane są pod uwagę tylko zlecenia oczekujące."},"settings:wh.planning.minPickupDowntime":function(n){return"Maksymalny czas między kompletacjami [s]"},"settings:wh.planning.minPickupDowntime:help":function(n){return"Minimalny czas jaki musi upłynać między zakończeniem ostatniej kompletacji a rozpoczęciem kolejnej, aby zarejestrowany został przestój."},"settings:wh.planning.maxPickupDowntime":function(n){return"Maksymalny czas trwania przestoju [min]"},"settings:wh.planning.maxPickupDowntime:help":function(n){return"Jeżeli czas trwania przestoju byłby dłuższy niż podana wartość, to przestój nie jest zapisywany."},"settings:wh.planning.maxSetsPerLine":function(n){return"Maksymalna ilość skompletowanych zestawów na linię"},"settings:wh.planning.minTimeForDelivery":function(n){return"Czas na wysyłkę [min]"},"settings:wh.planning.minTimeForDelivery:help":function(n){return"Wózki dla linii, które mają dostępny czas komponentów mniejszy niż dana wartość zostaną oznaczone na żółto i będą mogły zostać wysłane na linię."},"settings:wh.planning.lateDeliveryTime":function(n){return"Czas opóźnionej wysyłki [min]"},"settings:wh.planning.lateDeliveryTime:help":function(n){return"Wózki dla linii, które mają dostępny czas komponentów mniejszy niż dana wartość zostaną oznaczone na czerwono."},"settings:wh.planning.minDeliveryDowntime":function(n){return"Maksymalny czas między wysyłkami [s]"},"settings:wh.planning.minDeliveryDowntime:help":function(n){return"Minimalny czas jaki musi upłynać między zakończeniem ostatniej wysyłki a rozpoczęciem kolejnej, aby zarejestrowany został przestój."},"settings:wh.planning.maxDeliveryDowntime":function(n){return"Maksymalny czas trwania przestoju [min]"},"settings:wh.planning.maxDeliveryDowntime:help":function(n){return"Jeżeli czas trwania przestoju byłby dłuższy niż podana wartość, to przestój nie jest zapisywany."},"settings:wh.planning.maxFifoCartsPerDelivery":function(n){return"Maksymalna ilość wózków FIFO"},"settings:wh.planning.maxFifoCartsPerDelivery:help":function(n){return"Maksymalna ilość wózków FIFO do wysyłki jaka może zostać przydzielona dla użytkownika za jednym razem."},"settings:wh.planning.maxPackCartsPerDelivery":function(n){return"Maksymalna ilość wózków opakowań"},"settings:wh.planning.maxPackCartsPerDelivery:help":function(n){return"Maksymalna ilość wózków opakowań do wysyłki jaka może zostać przydzielona dla użytkownika za jednym razem."},"settings:wh.planning.maxDeliveryStartTime":function(n){return"Maksymalny czas do rozpoczęcia zlecenia [min]"},"settings:wh.planning.maxDeliveryStartTime:help":function(n){return"Maksymalna ilość minut od teraz do zaplanowanego czasu rozpoczęcia zlecenia, aby wózek został przeznaczony do realizacji, jeżeli linia w danym momencie nie pracuje."},"settings:wh.planning.availableTimeThreshold":function(n){return"Próg dostępnego czasu [min]"},"settings:wh.planning.availableTimeThreshold:help":function(n){return"Przy wyborze linii do nowego seta, suma czasu skompletowanego oraz czasu dostępnego zostanie zamieniona na 0, jeżeli jest mniejsza niż podana ilość minut."},"settings:wh.planning.deliveryFuncs":function(n){return"Funkcje wysyłki"},"settings:wh.planning.unassignSetDelay":function(n){return"Opóźnienie automatycznego odpięcia od seta [min]"},"settings:wh.planning.unassignSetDelay:help":function(n){return"Po upłynięciu podanej ilości minut od rozpoczęcia nowej zmiany produkcyjnej, funkcje mające niezakończone sety stworzone na poprzednich zmianach są automatycznie odpinane."},"set:title":function(n){return"Zestaw #"+e.v(n,"set")+" dla linii "+e.v(n,"line")},"set:cartsEditor:carts":function(n){return"Numery wózków..."},"set:cartsEditor:used:error":function(n){return e.p(n,"count",0,"pl",{one:"Podany wózek jest w użyciu:",other:"Podane wózki są już w użyciu:"})},"set:cartsEditor:used:cart":function(n){return e.v(n,"cart")+" ("+e.v(n,"date")+", set "+e.v(n,"set")+")"},"set:problemEditor:problemArea":function(n){return"Nr pola problemów..."},"set:problemEditor:comment:pickup":function(n){return"Odłożone na pole problemów"+e.v(n,"problemArea")+"w związku z problemem kompletacji "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+" przez "+e.s(n,"func",{fmx:"FMX",kitter:"kittera",platformer:"platformowego",packer:"opakowań",painter:"malarnię",other:e.v(n,"func")})+"."},"set:problemEditor:comment:lp10":function(n){return"Problem LP10 podczas kompletacji "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"menu:picklistDone:success":function(n){return"Transakcja wykonana"},"menu:picklistDone:failure":function(n){return"Transakcja nieudana"},"menu:picklistDone:pending":function(n){return"Resetuj status"},"menu:picklist:require":function(n){return"Picklista wydrukowana"},"menu:picklist:ignore":function(n){return"Ignoruj kompletację"},"menu:picklist:pending":function(n){return"Resetuj status"},"menu:pickup:success":function(n){return"Kompletacja wykonana"},"menu:pickup:failure":function(n){return"Kompletacja nieudana"},"menu:pickup:pending":function(n){return"Resetuj status"},"menu:pickup:editCarts":function(n){return"Zmień wózki"},"update:failure":function(n){return"Wykonywanie akcji nie powiodło się."},"update:FIFO_IGNORED":function(n){return"Nie można zignorować kompletacji FIFO."},"update:ALL_IGNORED":function(n){return"Nie można całkowicie zignorować kompletacji."},"printLabels:failure":function(n){return"Drukowanie etykiet nie powiodło się."},"list:popover:picklist":function(n){return"LP10"},"list:popover:fmx":function(n){return"FMX"},"list:popover:kitter":function(n){return"Kitter"},"list:popover:platformer":function(n){return"Platformowy"},"list:popover:packer":function(n){return"Opakowania"},"list:popover:painter":function(n){return"Malarnia"},"list:popover:status":function(n){return"Status"},"list:popover:user":function(n){return"Magazynier"},"list:popover:fifoStatus":function(n){return"Wysyłka FIFO"},"list:popover:packStatus":function(n){return"Wysyłka opakowań"},"list:popover:psDistStatus":function(n){return"Wysyłka malarnii"},"list:popover:qty":function(n){return"Ilość"},"list:popover:line":function(n){return"Linia"},"problem:empty":function(n){return"Nie ma żadnych problemów!"},"problem:title":function(n){return"Szczegóły problemu ze zleceniem "+e.v(n,"orderNo")+" dla linii "+e.v(n,"line")},"problem:menu:solveProblem":function(n){return"Rozwiąż problem"},"problem:menu:resetOrder":function(n){return"Resetuj zlecenie"},"problem:menu:cancelOrder":function(n){return"Anuluj zlecenie"},"problem:editor:comment":function(n){return"Komentarz..."},"problem:editor:carts":function(n){return"Numery wózków..."},"problem:editor:resetOrder:yes":function(n){return"Resetuj zlecenie"},"problem:editor:resetOrder:no":function(n){return"Nie resetuj"},"problem:editor:resetOrder:message":function(n){return"Zresetowano kompletację "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"problem:editor:cancelOrder:yes":function(n){return"Anuluj zlecenie"},"problem:editor:cancelOrder:no":function(n){return"Nie anuluj"},"problem:editor:cancelOrder:message":function(n){return"Anulowano kompletację "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"problem:editor:solveProblem:yes":function(n){return"Rozwiąż problem"},"problem:editor:solveProblem:no":function(n){return"Nie rozwiązuj"},"problem:editor:solveProblem:message":function(n){return"Rozwiązano problem "+e.s(n,"func",{fmx:"FMX",kitter:"Kittera",packer:"Opakowań",painter:"Malarnii",other:"LP10"})+" z kompletacją "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"problem:msg:STATE_DLV":function(n){return"Nie można resetować wysłanych zleceń."},"downtimePicker:title":function(n){return"Przestój"},"downtimePicker:submit":function(n){return"Wybierz powód przestoju"},"downtimePicker:cancel":function(n){return"Anuluj"},"downtimePicker:reason":function(n){return"Powód przestoju"},"downtimePicker:comment":function(n){return"Komentarz"},"pickup:status:full:fmx":function(n){return"FMX"},"pickup:status:full:kitter":function(n){return"Kitter"},"pickup:status:full:platformer":function(n){return"Platformowy"},"pickup:status:full:packer":function(n){return"Opakowania"},"pickup:status:full:painter":function(n){return"Malarnia"},"pickup:status:short:fmx":function(n){return"FMX"},"pickup:status:short:kitter":function(n){return"Kitter"},"pickup:status:short:platformer":function(n){return"Plat."},"pickup:status:short:packer":function(n){return"Opak."},"pickup:status:short:painter":function(n){return"Mal."},"pickup:forceLine:action":function(n){return"Wymuś kompletację"},"pickup:forceLine:title":function(n){return"Kompletacja na linię"},"pickup:forceLine:message":function(n){return"Wybierz linię i zeskanuj się, aby wymusić kompletację na daną linię."},"pickup:forceLine:line":function(n){return"Linia"},"pickup:forceLine:card":function(n){return"ID karty"},"pickup:forceLine:submit":function(n){return"Rozpocznij kompletację"},"pickup:stats:sets":function(n){return"Sety"},"pickup:stats:orders":function(n){return"Zlecenia"},"pickup:stats:qty":function(n){return"Sztuki"},"pickup:stats:pending":function(n){return"Oczekujące"},"pickup:stats:started":function(n){return"Rozpoczęte"},"delivery:title:completed":function(n){return"Skompletowane "+e.s(n,"kind",{components:"FIFO",packaging:"opak.",ps:"mal.",other:e.v(n,"kind")})},"delivery:title:pending":function(n){return"Do realizacji"},"delivery:title:delivering":function(n){return"W realizacji"},"delivery:set":function(n){return"Set "+e.v(n,"set")},"delivery:set:title":function(n){return"Wysyłka wózków "+e.s(n,"kind",{components:"FIFO",packaging:"z opakowaniami",ps:"malarnii",other:e.v(n,"kind")})},"delivery:set:addCarts":function(n){return"Dodaj wózki"},"delivery:set:finish":function(n){return"Zakończ dostawę"},"delivery:set:cancel":function(n){return"Zamknij"},"delivery:set:msg":function(n){return"Zeskanuj się ponownie, aby zakończyć dostawę."},"delivery:set:cart":function(n){return"Wózek"},"delivery:set:line":function(n){return"Linia"},"delivery:set:date":function(n){return"Plan"},"delivery:set:set":function(n){return"Set"},"delivery:set:sapOrders":function(n){return"Zlecenia"},"delivery:set:completedSapOrders":function(n){return"Uwaga: wózki zawierają zlecenia, które zostały oznaczone w SAP jako zakończone!"},"delivery:forceLine:action":function(n){return"Wymuś wysyłkę"},"delivery:forceLine:title":function(n){return"Wysyłka na linię"},"delivery:forceLine:message":function(n){return"Wybierz linię i zeskanuj się, aby wymusić wysyłkę wózków na daną linię."},"delivery:forceLine:line":function(n){return"Linia"},"delivery:forceLine:card":function(n){return"ID karty"},"delivery:forceLine:submit":function(n){return"Rozpocznij wysyłkę"},"delivery:stats:sets":function(n){return"Sety"},"delivery:stats:orders":function(n){return"Zlecenia"},"delivery:stats:qty":function(n){return"Sztuki"},"delivery:stats:time":function(n){return"Czas produkcji"},"blockedPickup:title":function(n){return"Kompletacja zablokowana"}}});