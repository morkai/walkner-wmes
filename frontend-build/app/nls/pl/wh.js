define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[i](n[t]-r))in o?o[t]:o.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMB:base":function(n){return"Magazyn (nowy)"},"BREADCRUMB:pickup":function(n){return"Kompletacja"},"BREADCRUMB:problems":function(n){return"Problemy"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generowanie planu...</span>"},"msg:genericFailure":function(n){return"<p>Wykonywanie akcji nie powiodło się.</p><p>"+e.v(n,"errorCode")+"</p>"},"msg:connectionFailure":function(n){return"<p>Podczas określania następnej akcji utracono połączenie z serwerem.</p><p>Sprawdź czy masz połączenie z siecią i spróbuj ponownie.</p>"},"msg:resolvingAction":function(n){return"<p>Określanie następnej akcji dla:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:resolveAction:403":function(n){return"<p>Brak uprawnień do wykonywania akcji.</p>"},"msg:USER_NOT_FOUND":function(n){return"<p>Nie znaleziono użytkownika:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:NO_PENDING_ORDERS":function(n){return"<p>Brak zleceń gotowych do realizacji.</p>"},"PAGE_ACTION:dailyPlan":function(n){return"Plan dzienny"},"PAGE_ACTION:old":function(n){return"Stary moduł"},"PAGE_ACTION:legend":function(n){return"Legenda"},"PAGE_ACTION:pickup":function(n){return"Kompletacja"},"PAGE_ACTION:problems":function(n){return"Problemy"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:resolveAction:title":function(n){return"Podaj ID karty, aby rozpocząć następną akcję"},"PAGE_ACTION:resolveAction:placeholder":function(n){return"ID karty"},"filter:whStatuses":function(n){return"Etap"},"filter:psStatuses":function(n){return"Status malarnii"},"filter:date":function(n){return"Data planu"},"filter:startTime":function(n){return"Początek"},"filter:useDarkerTheme":function(n){return"Wysoki kontrast"},empty:function(n){return"Brak planu dla wybranych filtrów."},"prop:group":function(n){return"Gr."},"prop:no":function(n){return"Lp."},"prop:shift":function(n){return"Zm."},"prop:date":function(n){return"Data"},"prop:set":function(n){return"Set"},"prop:mrp":function(n){return"MRP"},"prop:line":function(n){return"Linia"},"prop:order":function(n){return"Zlecenie"},"prop:product":function(n){return"Wyrób"},"prop:planStatus":function(n){return"Status"},"prop:whStatus":function(n){return"Etap"},"prop:fifoStatus":function(n){return"FIFO"},"prop:packStatus":function(n){return"Opak."},"prop:nc12":function(n){return"12NC"},"prop:name":function(n){return"Nazwa wyrobu"},"prop:qty":function(n){return"Ilość"},"prop:qtyPlan":function(n){return"Ilość rozplanowana"},"prop:qtyTodo":function(n){return"Ilość do zrobienia"},"prop:startTime":function(n){return"Początek"},"prop:finishTime":function(n){return"Koniec"},"prop:time":function(n){return"Czas"},"prop:comment":function(n){return"Komentarz"},"prop:problem":function(n){return"Problem"},"prop:picklist":function(n){return"LP10"},"prop:fmx":function(n){return"FMX"},"prop:kitter":function(n){return"Kitter"},"prop:packer":function(n){return"Opak."},"prop:carts":function(n){return"Wózki"},"prop:user":function(n){return"Magazynier"},"prop:problemArea":function(n){return"Pole problemów"},"prop:status":function(n){return"Status"},"prop:pickup":function(n){return"Kompletacja"},"prop:delivery":function(n){return"Wysyłka"},"func:fmx":function(n){return"FMX"},"func:kitter":function(n){return"Kitter"},"func:packer":function(n){return"Opakowania"},"status:picklistDone:null":function(n){return"Transakcja niewykonana"},"status:picklistDone:true":function(n){return"Transakcja wykonana"},"status:picklistDone:false":function(n){return"Transakcja nieudana"},"status:pending":function(n){return"Oczekiwanie"},"status:started":function(n){return"Rozpoczęte"},"status:finished":function(n){return"Zakończone"},"status:picklist":function(n){return"Picklista"},"status:pickup":function(n){return"Kompletacja"},"status:problem":function(n){return"Problem"},"status:cancelled":function(n){return"Anulowane"},"menu:shiftOrder":function(n){return"Otwórz szczegóły zlecenia z linii"},"menu:copy:all":function(n){return"Kopiuj listę zleceń"},"menu:copy:lineGroup":function(n){return"Kopiuj listę zleceń <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:copy:lineGroupNo":function(n){return"Kopiuj nry zleceń <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:cancelOrder":function(n){return"Anuluj zlecenie"},"menu:cancelSet":function(n){return"Anuluj zestaw zleceń"},"menu:restoreOrder":function(n){return"Wznów zlecenie"},"menu:restoreSet":function(n){return"Wznów zestaw zleceń"},"menu:resetOrder":function(n){return"Resetuj zlecenie"},"menu:resetSet":function(n){return"Resetuj zestaw zleceń"},"settings:tab:planning":function(n){return"Planowanie"},"settings:planning:ignorePsStatus":function(n){return"Ignoruj status malarnii podczas kompletacji"},"settings:planning:groupDuration":function(n){return"Czas trwania grupy zleceń [h]"},"settings:planning:groupExtraItems":function(n){return"Minimalna ilość sztuk w grupie"},"settings:planning:groupExtraItems:help":function(n){return"Jeżeli ilość sztuk zlecenia w pierwszej/ostatniej grupie danej linii będzie mniejsza lub równa podanej wartości, to grupa ta zostanie scalona z następną/poprzednią grupą."},"settings:planning:ignoredMrps":function(n){return"Ignorowane MRP"},"settings:planning:ignoredMrps:help":function(n){return"Zlecenia z jednym z poniższych MRP nie pojawią się na liście zleceń do kompletacji."},"settings:planning:enabledMrps":function(n){return"Włączone MRP"},"settings:planning:enabledMrps:help":function(n){return"Tylko zlecenia z jednym z poniższych MRP będą brane pod uwagę podczas tworzenia nowych zestawów zleceń."},"settings:planning:lineGroups":function(n){return"Grupy linii"},"settings:planning:lineGroups:help":function(n){return"Jeżeli zlecenie jest robione na kilku liniach, to części robione na liniach zdefiniowanych w grupach zostaną połączone. Każda linia to oddzielna grupa: <code>ID_GRUPY: ID_LINII_1, ID_LINII2, ...</code> Na przykład:<br><code class='example'>CT1/2: CT1, CT2\nCT3/4: CT3, CT4\nCT5/6: CT5, CT6</code>"},"settings:planning:maxSetSize":function(n){return"Maksymalna ilość zleceń w zestawie (SET)"},"settings:planning:minSetDuration":function(n){return"Minimalny czas trwania zestawu zleceń [min]"},"settings:planning:minSetDuration:help":function(n){return"Czas trwania zestawu zleceń nie może przekraczać podanej ilości minut, aby został rozszerzony o zlecenie, które przekracza <em>Czas trwania grupy zleceń</em>."},"settings:planning:maxSetDuration":function(n){return"Maksymalny czas trwania zestawu zleceń [min]"},"settings:planning:maxSetDuration:help":function(n){return"Czas trwania zestawu zleceń nie może przekraczać podanej ilości minut."},"settings:planning:maxSetDifference":function(n){return"Maksymalny czas odstępu w zestawie zleceń [min]"},"settings:planning:maxSetDifference:help":function(n){return"Tworzenie zestawu zleceń zostanie zakończone, jeżeli różnica czasu rozpoczęcia następnego potencjalnego zlecenia do czasu zakończenia ostatniego zlecenia dodanego do zestawu jest większa od podanej ilości minut."},"settings:planning:minPickupDowntime":function(n){return"Maksymalny czas między kompletacjami [s]"},"settings:planning:minPickupDowntime:help":function(n){return"Minimalny czas jaki musi upłynać między zakończeniem ostatniej kompletacji a rozpoczęciem kolejnej, aby zarejestrowany został przestój."},"settings:tab:users":function(n){return"Użytkownicy"},"settings:users:fmx":function(n){return"FMX"},"settings:users:kitter":function(n){return"Kitter"},"settings:users:packer":function(n){return"Opakowania"},"set:title":function(n){return"Zestaw zleceń nr "+e.v(n,"set")+" dla linii "+e.v(n,"line")},"set:cartsEditor:carts":function(n){return"Numery wózków..."},"set:problemEditor:problemArea":function(n){return"Nr pola problemów..."},"set:problemEditor:comment":function(n){return"Komentarz..."},"menu:picklistDone:true":function(n){return"Transakcja wykonana"},"menu:picklistDone:false":function(n){return"Transakcja nieudana"},"menu:picklistDone:null":function(n){return"Resetuj status"},"menu:picklist:require":function(n){return"Picklista wydrukowana"},"menu:picklist:ignore":function(n){return"Ignoruj kompletację"},"menu:picklist:pending":function(n){return"Resetuj status"},"menu:pickup:success":function(n){return"Kompletacja wykonana"},"menu:pickup:failure":function(n){return"Kompletacja nieudana"},"menu:pickup:pending":function(n){return"Resetuj status"},"update:failure":function(n){return"Wykonywanie akcji nie powiodło się."},"printLabels:failure":function(n){return"Drukowanie etykiet nie powiodło się."},"list:popover:picklist":function(n){return"LP10"},"list:popover:fmx":function(n){return"FMX"},"list:popover:kitter":function(n){return"Kitter"},"list:popover:packer":function(n){return"Opakowania"},"list:popover:status":function(n){return"Status"},"list:popover:user":function(n){return"Magazynier"},"list:popover:fifoStatus":function(n){return"Wysyłka FIFO"},"list:popover:packStatus":function(n){return"Wysyłka opakowań"},"problem:empty":function(n){return"Nie ma żadnych problemów!"},"problem:title":function(n){return"Szczegóły problemu ze zleceniem "+e.v(n,"orderNo")+" dla linii "+e.v(n,"line")},"problem:menu:solveProblem":function(n){return"Rozwiąż problem"},"problem:menu:cancelOrder":function(n){return"Anuluj zlecenie"},"problem:editor:comment":function(n){return"Komentarz..."},"problem:editor:carts":function(n){return"Numery wózków..."},"problem:editor:cancelOrder:yes":function(n){return"Anuluj zlecenie"},"problem:editor:cancelOrder:no":function(n){return"Nie anuluj"},"problem:editor:cancelOrder:message":function(n){return"Anulowano kompletację "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"problem:editor:solveProblem:yes":function(n){return"Rozwiąż problem"},"problem:editor:solveProblem:no":function(n){return"Nie rozwiązuj"},"problem:editor:solveProblem:message":function(n){return"Rozwiązano problem "+e.s(n,"func",{fmx:"FMX",kitter:"Kittera",packer:"Opakowań",other:"LP10"})+" z kompletacją "+e.v(n,"qty")+" szt. na linię "+e.v(n,"line")+"."},"downtimePicker:title":function(n){return"Przestój"},"downtimePicker:submit":function(n){return"Wybierz powód przestoju"},"downtimePicker:cancel":function(n){return"Anuluj"},"downtimePicker:reason":function(n){return"Powód przestoju"},"downtimePicker:comment":function(n){return"Komentarz"}}});