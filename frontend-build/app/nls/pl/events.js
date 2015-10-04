define(["app/nls/locale/pl"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,o){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(o||0)},v:function(e,o){return n.c(e,o),e[o]},p:function(e,o,i,d,r){return n.c(e,o),e[o]in r?r[e[o]]:(o=n.lc[d](e[o]-i),o in r?r[o]:r.other)},s:function(e,o,i){return n.c(e,o),e[o]in i?i[e[o]]:i.other}};return{"MSG:LOADING_FAILURE":function(){return"Ładowanie zdarzeń nie powiodło się :("},"MSG:LOADING_TYPES_FAILURE":function(){return"Ładowanie typów zdarzeń nie powiodło się :("},"BREADCRUMBS:browse":function(){return"Zdarzenia"},"filter:placeholder:type":function(){return"Dowolny typ"},"filter:submit":function(){return"Filtruj zdarzenia"},"PROPERTY:time":function(){return"Czas wystąpienia"},"PROPERTY:user":function(){return"Użytkownik"},"PROPERTY:type":function(){return"Typ"},"PROPERTY:text":function(){return"Opis"},"PROPERTY:severity":function(){return"Poziom ważności"},"TYPE:app.started":function(){return"Start systemu"},"TEXT:app.started":function(e){return"Serwer <em>"+n.v(e,"id")+"</em> wystartował w środowisku <em>"+n.s(e,"env",{development:"rozwojowym",testing:"testowym",production:"produkcyjnym",other:n.v(e,"env")})+"</em> w ciągu <em>"+n.v(e,"time")+"</em> ms."},"TYPE:users.login":function(){return"Użytkownicy: zalogowanie"},"TEXT:users.login":function(){return"-"},"TYPE:users.loginFailure":function(){return"Użytkownicy: nieudane logowanie"},"TEXT:users.loginFailure":function(e){return"Nieudane logowanie na konto: <em>"+n.v(e,"login")+"</em>"},"TYPE:users.logout":function(){return"Użytkownicy: wylogowanie"},"TEXT:users.logout":function(){return"-"},"TYPE:users.added":function(){return"Użytkownicy: dodanie"},"TEXT:users.added":function(e){return"Dodano użytkownika: <a href='#users/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->login")+"</a>"},"TYPE:users.edited":function(){return"Użytkownicy: edycja"},"TEXT:users.edited":function(e){return"Zmodyfikowano użytkownika: <a href='#users/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->login")+"</a>"},"TYPE:users.deleted":function(){return"Użytkownicy: usunięcie"},"TEXT:users.deleted":function(e){return"Usunięto użytkownika: <em>"+n.v(e,"model->login")+"</em>"},"TYPE:users.synced":function(){return"Użytkownicy: synchronizacja"},"TEXT:users.synced":function(e){return"Dodano "+n.p(e,"created",0,"pl",{one:"1 nowego użytkownika",other:n.n(e,"created")+" nowych użytkowników"})+" i zmodyfikowano "+n.p(e,"updated",0,"pl",{one:"1 istniejącego użytkownika",other:n.n(e,"updated")+" istniejących użytkowników"})+" podczas synchronizacji z bazą KD."},"TYPE:users.syncFailed":function(){return"Użytkownicy: błąd synchronizacji"},"TEXT:users.syncFailed":function(e){return"Nie udało się zsynchronizować użytkowników z bazą KD: <em>"+n.v(e,"error")+"</em>"},"TYPE:mechOrders.edited":function(){return"Zlecenia działu mechanicznego: edycja"},"TEXT:mechOrders.edited":function(e){return"Zmodyfikowano zlecenie działu mechanicznego: <a href='#mechOrders/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:mechOrders.synced":function(){return"Zlecenia działu mechanicznego: import"},"TEXT:mechOrders.synced":function(e){return"Zaimportowano "+n.p(e,"count",0,"pl",{one:"1 zlecenie",few:n.n(e,"count")+" zlecenia",other:n.n(e,"count")+" zleceń"})+" działu mechanicznego."},"TYPE:emptyOrders.synced":function(){return"Puste zlecenia: synchronizacja"},"TEXT:emptyOrders.synced":function(e){return"Dodano "+n.p(e,"count",0,"pl",{one:"1 nowe puste zlecenie",few:n.n(e,"count")+" nowe puste zlecenia",other:n.n(e,"count")+" nowych pustych zleceń"})+"."},"TYPE:orders.synced":function(){return"Zlecenia reszty działów: synchronizacja"},"TEXT:orders.synced":function(e){return"Dodano "+n.p(e,"created",0,"pl",{one:"1 nowe",few:n.n(e,"created")+" nowe",other:n.n(e,"created")+" nowych"})+" i zmodyfikowano "+n.p(e,"updated",0,"pl",{one:"1 istniejące zlecenie",few:n.n(e,"updated")+" istniejące zlecenia",other:n.n(e,"updated")+" istniejących zleceń"})+n.s(e,"moduleName",{currentDayOrderImporter:"&nbsp;z aktualnego dnia",nextDayOrderImporter:"&nbsp;z następnego dnia",prevDayOrderImporter:"&nbsp;z poprzedniego dnia",other:""})+"."},"TYPE:purchaseOrders.synced":function(){return"Zamówienia: synchronizacja"},"TEXT:purchaseOrders.synced":function(e){return"Dodano "+n.p(e,"created",0,"pl",{one:"1 nowe zamówienie",few:n.n(e,"created")+" nowe zamówienia",other:n.n(e,"created")+" nowych zamówień"})+", zmodyfikowano "+n.p(e,"updated",0,"pl",{one:"1 istniejące zamówienie",few:n.n(e,"updated")+" istniejące zamówienia",other:n.n(e,"updated")+" istniejących zamówień"})+" i zamknięto "+n.p(e,"closed",0,"pl",{one:"1 zamówienie",few:n.n(e,"closed")+" zamówienia",other:n.n(e,"closed")+" zamówień"})+" z danych otrzymanych "+n.v(e,"importedAt")+"."},"TYPE:orderStatuses.added":function(){return"Statusy zleceń: dodanie"},"TEXT:orderStatuses.added":function(e){return"Dodano status zleceń: <a href='#orderStatuses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:orderStatuses.edited":function(){return"Statusy zleceń: edycja"},"TEXT:orderStatuses.edited":function(e){return"Zmodyfikowano status zleceń: <a href='#orderStatuses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:orderStatuses.deleted":function(){return"Statusy zleceń: usunięcie"},"TEXT:orderStatuses.deleted":function(e){return"Usunięto status zleceń: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:delayReasons.added":function(){return"Powody opóźnień: dodanie"},"TEXT:delayReasons.added":function(e){return"Dodano powód opóźnień: <a href='#delayReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:delayReasons.edited":function(){return"Powody opóźnień: edycja"},"TEXT:delayReasons.edited":function(e){return"Zmodyfikowano powód opóźnień: <a href='#delayReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:delayReasons.deleted":function(){return"Powody opóźnień: usunięcie"},"TEXT:delayReasons.deleted":function(e){return"Usunięto powód opóźnień: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:downtimeReasons.added":function(){return"Powody przestojów: dodanie"},"TEXT:downtimeReasons.added":function(e){return"Dodano powód przestojów: <a href='#downtimeReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.edited":function(){return"Powody przestojów: edycja"},"TEXT:downtimeReasons.edited":function(e){return"Zmodyfikowano powód przestojów: <a href='#downtimeReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.deleted":function(){return"Powody przestojów: usunięcie"},"TEXT:downtimeReasons.deleted":function(e){return"Usunięto powód przestojów: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:lossReasons.added":function(){return"Powody strat materiałowych: dodanie"},"TEXT:lossReasons.added":function(e){return"Dodano powód strat materiałowych: <a href='#lossReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:lossReasons.edited":function(){return"Powody strat materiałowych: edycja"},"TEXT:lossReasons.edited":function(e){return"Zmodyfikowano powód strat materiałowych: <a href='#lossReasons/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:lossReasons.deleted":function(){return"Powody strat materiałowych: usunięcie"},"TEXT:lossReasons.deleted":function(e){return"Usunięto powód strat materiałowych: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:aors.added":function(){return"Obszary odpowiedzialności: dodanie"},"TEXT:aors.added":function(e){return"Dodano obszar odpowiedzialności: <a href='#aors/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:aors.edited":function(){return"Obszary odpowiedzialności: edycja"},"TEXT:aors.edited":function(e){return"Zmodyfikowano obszar odpowiedzialności: <a href='#aors/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:aors.deleted":function(){return"Obszary odpowiedzialności: usunięcie"},"TEXT:aors.deleted":function(e){return"Usunięto obszar odpowiedzialności: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:vendors.added":function(){return"Dostawcy: dodanie"},"TEXT:vendors.added":function(e){return"Dodano dostawcę: <a href='#vendors/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:vendors.edited":function(){return"Dostawcy: edycja"},"TEXT:vendors.edited":function(e){return"Zmodyfikowano dostawcę: <a href='#vendors/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:vendors.deleted":function(){return"Dostawcy: usunięcie"},"TEXT:vendors.deleted":function(e){return"Usunięto dostawcę: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:vendorNc12s.added":function(){return"Baza 12NC: dodanie"},"TEXT:vendorNc12s.added":function(e){return"Dodano 12NC: <a href='#vendorNc12s/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->nc12")+"</a>"},"TYPE:vendorNc12s.edited":function(){return"Baza 12NC: edycja"},"TEXT:vendorNc12s.edited":function(e){return"Zmodyfikowano 12NC: <a href='#vendorNc12s/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->nc12")+"</a>"},"TYPE:vendorNc12s.deleted":function(){return"Baza 12NC: usunięcie"},"TEXT:vendorNc12s.deleted":function(e){return"Usunięto 12NC: <em>"+n.v(e,"model->nc12")+"</em>"},"TYPE:workCenters.added":function(){return"WorkCentera: dodanie"},"TEXT:workCenters.added":function(e){return"Dodano WorkCenter: <a href='#workCenters/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:workCenters.edited":function(){return"WorkCentera: edycja"},"TEXT:workCenters.edited":function(e){return"Zmodyfikowano WorkCenter: <a href='#workCenters/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:workCenters.deleted":function(){return"WorkCentera: usunięcie"},"TEXT:workCenters.deleted":function(e){return"Usunięto WorkCenter: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:divisions.added":function(){return"Wydziały: dodanie"},"TEXT:divisions.added":function(e){return"Dodano wydział: <a href='#divisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:divisions.edited":function(){return"Wydziały: edycja"},"TEXT:divisions.edited":function(e){return"Zmodyfikowano wydział: <a href='#divisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:divisions.deleted":function(){return"Wydziały: usunięcie"},"TEXT:divisions.deleted":function(e){return"Usunięto wydział: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:subdivisions.added":function(){return"Działy: dodanie"},"TEXT:subdivisions.added":function(e){return"Dodano dział: <a href='#subdivisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:subdivisions.edited":function(){return"Działy: edycja"},"TEXT:subdivisions.edited":function(e){return"Zmodyfikowano dział: <a href='#subdivisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:subdivisions.deleted":function(){return"Działy: usunięcie"},"TEXT:subdivisions.deleted":function(e){return"Usunięto dział: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:companies.added":function(){return"Firmy: dodanie"},"TEXT:companies.added":function(e){return"Dodano firmę: <a href='#companies/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:companies.edited":function(){return"Firmy: edycja"},"TEXT:companies.edited":function(e){return"Zmodyfikowano firmę: <a href='#companies/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:companies.deleted":function(){return"Firmy: usunięcie"},"TEXT:companies.deleted":function(e){return"Usunięto firmę: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:mrpControllers.added":function(){return"Kontrolery MRP: dodanie"},"TEXT:mrpControllers.added":function(e){return"Dodano kontroler MRP: <a href='#mrpControllers/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:mrpControllers.edited":function(){return"Kontrolery MRP: edycja"},"TEXT:mrpControllers.edited":function(e){return"Zmodyfikowano kontroler MRP: <a href='#mrpControllers/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:mrpControllers.deleted":function(){return"Kontrolery MRP: usunięcie"},"TEXT:mrpControllers.deleted":function(e){return"Usunięto kontroler MRP: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:prodLines.added":function(){return"Linie produkcyjne: dodanie"},"TEXT:prodLines.added":function(e){return"Dodano linię produkcyjną: <a href='#prodLines/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:prodLines.edited":function(){return"Linie produkcyjne: edycja"},"TEXT:prodLines.edited":function(e){return"Zmodyfikowano linię produkcyjną: <a href='#prodLines/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:prodLines.deleted":function(){return"Linie produkcyjne: usunięcie"},"TEXT:prodLines.deleted":function(e){return"Usunięto linię produkcyjną: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:prodTasks.added":function(){return"Zadania produkcyjne: dodanie"},"TEXT:prodTasks.added":function(e){return"Dodano zadanie produkcyjne: <a href='#prodTasks/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:prodTasks.edited":function(){return"Zadania produkcyjne: edycja"},"TEXT:prodTasks.edited":function(e){return"Zmodyfikowano zadanie produkcyjne: <a href='#prodTasks/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:prodTasks.deleted":function(){return"Zadania produkcyjne: usunięcie"},"TEXT:prodTasks.deleted":function(e){return"Usunięto zadanie produkcyjne: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:prodFlows.added":function(){return"Przepływy: dodanie"},"TEXT:prodFlows.added":function(e){return"Dodano przepływ: <a href='#prodFlows/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:prodFlows.edited":function(){return"Przepływy: edycja"},"TEXT:prodFlows.edited":function(e){return"Zmodyfikowano przepływ: <a href='#prodFlows/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:prodFlows.deleted":function(){return"Przepływy: usunięcie"},"TEXT:prodFlows.deleted":function(e){return"Usunięto przepływ: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:prodFunctions.added":function(){return"Funkcje na produkcji: dodanie"},"TEXT:prodFunctions.added":function(e){return"Dodano funkcję na produkcji: <a href='#prodFunctions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->label")+"</a>"},"TYPE:prodFunctions.edited":function(){return"Funkcje na produkcji: edycja"},"TEXT:prodFunctions.edited":function(e){return"Zmodyfikowano funkcję na produkcji: <a href='#prodFunctions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->label")+"</a>"},"TYPE:prodFunctions.deleted":function(){return"Funkcje na produkcji: usunięcie"},"TEXT:prodFunctions.deleted":function(e){return"Usunięto funkcję na produkcji: <em>"+n.v(e,"model->label")+"</em>"},"TYPE:fte.leader.created":function(){return"FTE (magazyn): dodanie"},"TEXT:fte.leader.created":function(e){return"Utworzono <a href='#fte/leader/"+n.v(e,"model->_id")+"'>nowy wpis FTE (magazyn)</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:fte.leader.locked":function(){return"FTE (magazyn): zamknięcie"},"TEXT:fte.leader.locked":function(e){return"Zamknięto <a href='#fte/leader/"+n.v(e,"model->_id")+"'>wpis FTE (magazyn)</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:fte.leader.deleted":function(){return"FTE (magazyn): usunięcie"},"TEXT:fte.leader.deleted":function(e){return"Usunięto wpis FTE (magazyn) dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:fte.master.created":function(){return"FTE (produkcja): dodanie"},"TEXT:fte.master.created":function(e){return"Utworzono <a href='#fte/master/"+n.v(e,"model->_id")+"'>nowy wpis FTE (produkcja)</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:fte.master.locked":function(){return"FTE (produkcja): zamknięcie"},"TEXT:fte.master.locked":function(e){return"Zamknięto <a href='#fte/master/"+n.v(e,"model->_id")+"'>wpis FTE (produkcja)</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:fte.master.deleted":function(){return"FTE (produkcja): usunięcie"},"TEXT:fte.master.deleted":function(e){return"Usunięto wpis FTE (produkcja) dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla działu <em>"+n.v(e,"model->subdivision")+"</em>."},"TYPE:hourlyPlans.created":function(){return"Plany godzinowe: dodanie"},"TEXT:hourlyPlans.created":function(e){return"Utworzono <a href='#hourlyPlans/"+n.v(e,"model->_id")+"'>nowy plan godzinowy</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla wydziału <em>"+n.v(e,"model->division")+"</em>."},"TYPE:hourlyPlans.locked":function(){return"Plany godzinowe: zamknięcie"},"TEXT:hourlyPlans.locked":function(e){return"Zamknięto <a href='#hourlyPlans/"+n.v(e,"model->_id")+"'>plan godzinowy</a> dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla wydziału <em>"+n.v(e,"model->division")+"</em>."},"TYPE:hourlyPlans.deleted":function(){return"Plany godzinowe: usunięcie"},"TEXT:hourlyPlans.deleted":function(e){return"Usunięto plan godzinowy dla <em>"+n.v(e,"model->shift")+"</em> zmiany dnia <em>"+n.v(e,"model->date")+"</em> dla wydziału <em>"+n.v(e,"model->division")+"</em>."},"TYPE:pressWorksheets.added":function(){return"Karty pracy: dodanie"},"TEXT:pressWorksheets.added":function(e){return"Dodano nową <a href='#pressWorksheets/"+n.v(e,"model->_id")+"'>kartę pracy</a>."},"TYPE:pressWorksheets.edited":function(){return"Karty pracy: edycja"},"TEXT:pressWorksheets.edited":function(e){return"Zmodyfikowano kartę pracy: <a href='#pressWorksheets/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->rid")+"</a>"},"TYPE:pressWorksheets.deleted":function(){return"Karty pracy: usunięcie"},"TEXT:pressWorksheets.deleted":function(e){return"Usunięto kartę pracy: <em>"+n.v(e,"model->rid")+"</em>"},"TYPE:feedback.added":function(){return"Feedback: dodanie"},"TEXT:feedback.added":function(){return"Dodano nowy feedback."},"TYPE:clipOrderCount.created":function(){return"CLIP: utworzenie"},"TEXT:clipOrderCount.created":function(e){return"Obliczono CLIP z dnia "+n.v(e,"date")+" ("+n.v(e,"total")+" MRP)."},"TYPE:production.unlocked":function(){return"Produkcja: aktywacja linii"},"TEXT:production.unlocked":function(e){return"Aktywowano linię produkcyjną: <em>"+n.v(e,"prodLine")+"</em>"},"TYPE:production.locked":function(){return"Produkcja: dezaktywacja linii"},"TEXT:production.locked":function(e){return"Dezaktywowano linię produkcyjną: <em>"+n.v(e,"prodLine")+"</em>"},"TYPE:warehouse.controlCycles.synced":function(){return"Magazyn: synchronizacja cykli kontrolnych"},"TEXT:warehouse.controlCycles.synced":function(e){return"Zaimportowano <em>"+n.v(e,"count")+"</em> "+n.p(e,"count",0,"pl",{one:"cykl kontrolny",few:"cykle kontrolne",other:"cylki kontrolnych"})+" z danych pobranych <em>"+n.v(e,"timestamp")+"</em>."},"TYPE:warehouse.controlCycles.syncFailed":function(){return"Magazyn: nieudana synchronizacja cykli kontrolnych"},"TEXT:warehouse.controlCycles.syncFailed":function(e){return"Nie udało się zaimportować cykli kontrolnych z danych pobranych <em>"+n.v(e,"timestamp")+"</em>: <em>"+n.v(e,"error")+"</em>"},"TYPE:warehouse.transferOrders.synced":function(){return"Magazyn: synchronizacja zamówień przeniesienia"},"TEXT:warehouse.transferOrders.synced":function(e){return"Zaimportowano <em>"+n.v(e,"count")+"</em> "+n.p(e,"count",0,"pl",{one:"zamówienie przeniesienia",few:"zamówienia przeniesienia",other:"zamówień przeniesienia"})+" z danych pobranych <em>"+n.v(e,"timestamp")+"</em>."},"TYPE:warehouse.transferOrders.syncFailed":function(){return"Magazyn: nieudana synchronizacja zamówień przeniesienia"},"TEXT:warehouse.transferOrders.syncFailed":function(e){return"Nie udało się zaimportować zamówień przeniesienia z danych pobranych <em>"+n.v(e,"timestamp")+"</em>: <em>"+n.v(e,"error")+"</em>"},"TYPE:warehouse.shiftMetrics.synced":function(){return"Magazyn: obliczenie wskaźników"},"TEXT:warehouse.shiftMetrics.synced":function(e){return"Obliczono wskaźniki magazynu dla dnia <em>"+n.v(e,"date")+"</em>."},"TYPE:warehouse.shiftMetrics.syncFailed":function(){return"Magazyn: nieudane obliczenie wskaźników"},"TEXT:warehouse.shiftMetrics.syncFailed":function(e){return"Nie udało się obliczyć wskaźników magazynu dla dnia <em>"+n.v(e,"date")+"</em>: <em>"+n.v(e,"error")+"</em>"},"TYPE:xiconfPrograms.added":function(){return"Programy Xiconf: dodanie"},"TEXT:xiconfPrograms.added":function(e){return"Dodano program: <a href='#xiconf/programs/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:xiconfPrograms.edited":function(){return"Programy Xiconf: edycja"},"TEXT:xiconfPrograms.edited":function(e){return"Zmodyfikowano program: <a href='#xiconf/programs/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:xiconfPrograms.deleted":function(){return"Programy Xiconf: usunięcie"},"TEXT:xiconfPrograms.deleted":function(e){return"Usunięto program: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:xiconf.orders.synced":function(){return"Xiconf: synchronizacja zleceń"},"TEXT:xiconf.orders.synced":function(e){return"Dodano <em>"+n.v(e,"insertCount")+"</em> i zmodyfikowano <em>"+n.v(e,"updateCount")+"</em> "+n.p(e,"updateCount",0,"pl",{one:"zlecenie",few:"zlecenia",other:"zleceń"})+" z danych pobranych <em>"+n.v(e,"timestamp")+"</em>."},"TYPE:xiconf.orders.syncFailed":function(){return"Xiconf: nieudana synchronizacja zleceń"},"TEXT:xiconf.orders.syncFailed":function(e){return"Nie udało się zaimportować danych z <em>"+n.v(e,"timestamp")+"</em>: "+n.v(e,"error")},"TYPE:licenses.added":function(){return"Licencje: dodanie"},"TEXT:licenses.added":function(e){return"Dodano licencję: <a href='#licenses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:licenses.edited":function(){return"Licencje: edycja"},"TEXT:licenses.edited":function(e){return"Zmodyfikowano licencję: <a href='#licenses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:licenses.deleted":function(){return"Licencje: usunięcie"},"TEXT:licenses.deleted":function(e){return"Usunięto licencję: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:prodDowntimes.confirmedEdited":function(){return"Przestoje: edycja potwierdzonego"},"TEXT:prodDowntimes.confirmedEdited":function(e){return"Zmodyfikowano potwierdzony przestój: <a href='#prodDowntimes/"+n.v(e,"_id")+"'>"+n.v(e,"rid")+"</a>"},"TYPE:orderDocuments.synced":function(){return"Zlecenia reszty działów: synchronizacja dokumentów"},"TEXT:orderDocuments.synced":function(e){return"Zmodyfikowano <em>"+n.v(e,"updateCount")+"</em> "+n.p(e,"updateCount",0,"pl",{one:"zlecenie",few:"zlecenia",other:"zleceń"})+" z danych pobranych <em>"+n.v(e,"timestamp")+"</em>."},"TYPE:orderDocuments.syncFailed":function(){return"Zlecenia reszty działów: nieudana synchronizacja dokumentów"},"TEXT:orderDocuments.syncFailed":function(e){return"Nie udało się zaimportować danych z <em>"+n.v(e,"timestamp")+"</em>: "+n.v(e,"error")},"TYPE:kaizen.orders.deleted":function(){return"Usprawnienia > Zgłoszenia: usunięcie"},"TEXT:kaizen.orders.deleted":function(e){return"Usunięto zgłoszenie usprawnień: <em>"+n.v(e,"model->subject")+"</em>"},"TYPE:kaizen.sections.added":function(){return"Usprawnienia > Działy: dodanie"},"TEXT:kaizen.sections.added":function(e){return"Dodano dział usprawnień: <a href='#kaizenSections/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.sections.edited":function(){return"Usprawnienia > Działy: edycja"},"TEXT:kaizen.sections.edited":function(e){return"Zmodyfikowano dział usprawnień: <a href='#kaizenSections/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.sections.deleted":function(){return"Usprawnienia > Działy: usunięcie"},"TEXT:kaizen.sections.deleted":function(e){return"Usunięto dział usprawnień: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:kaizen.areas.added":function(){return"Usprawnienia > Miejsca zdarzeń: dodanie"},"TEXT:kaizen.areas.added":function(e){return"Dodano miejsce zdarzeń: <a href='#kaizenAreas/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.areas.edited":function(){return"Usprawnienia > Miejsca zdarzeń: edycja"},"TEXT:kaizen.areas.edited":function(e){return"Zmodyfikowano miejsce zdarzeń: <a href='#kaizenAreas/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.areas.deleted":function(){return"Usprawnienia > Miejsca zdarzeń: usunięcie"},"TEXT:kaizen.areas.deleted":function(e){return"Usunięto miejsce zdarzeń: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:kaizen.categories.added":function(){return"Usprawnienia > Kategorie: dodanie"},"TEXT:kaizen.categories.added":function(e){return"Dodano kategorię usprawnień: <a href='#kaizenCategories/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.categories.edited":function(){return"Usprawnienia > Kategorie: edycja"},"TEXT:kaizen.categories.edited":function(e){return"Zmodyfikowano kategorię usprawnień: <a href='#kaizenCategories/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.categories.deleted":function(){return"Usprawnienia > Kategorie: usunięcie"},"TEXT:kaizen.categories.deleted":function(e){return"Usunięto kategorię usprawnień: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:kaizen.causes.added":function(){return"Usprawnienia > Przyczyny: dodanie"},"TEXT:kaizen.causes.added":function(e){return"Dodano przyczynę: <a href='#kaizenCauses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.causes.edited":function(){return"Usprawnienia > Przyczyny: edycja"},"TEXT:kaizen.causes.edited":function(e){return"Zmodyfikowano przyczynę: <a href='#kaizenCauses/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.causes.deleted":function(){return"Usprawnienia > Przyczyny: usunięcie"},"TEXT:kaizen.causes.deleted":function(e){return"Usunięto przyczynę: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:kaizen.risks.added":function(){return"Usprawnienia > Rodzaje ryzyka: dodanie"},"TEXT:kaizen.risks.added":function(e){return"Dodano rodzaj ryzyka: <a href='#kaizenRisks/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.risks.edited":function(){return"Usprawnienia > Rodzaje ryzyka: edycja"},"TEXT:kaizen.risks.edited":function(e){return"Zmodyfikowano rodzaj ryzyka: <a href='#kaizenRisks/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:kaizen.risks.deleted":function(){return"Usprawnienia > Rodzaje ryzyka: usunięcie"},"TEXT:kaizen.risks.deleted":function(e){return"Usunięto rodzaj ryzyka: <em>"+n.v(e,"model->name")+"</em>"},"TYPE:opinionSurveys.surveys.added":function(){return"Badanie Opinia > Badania: dodanie"},"TEXT:opinionSurveys.surveys.added":function(e){return"Dodano badanie: <a href='#opinionSurveys/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->label")+"</a>"},"TYPE:opinionSurveys.surveys.edited":function(){return"Badanie Opinia > Badania: edycja"},"TEXT:opinionSurveys.surveys.edited":function(e){return"Zmodyfikowano badanie: <a href='#opinionSurveys/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->label")+"</a>"},"TYPE:opinionSurveys.surveys.deleted":function(){return"Badanie Opinia > Badania: usunięcie"},"TEXT:opinionSurveys.surveys.deleted":function(e){return"Usunięto badanie: <em>"+n.v(e,"model->label")+"</em>"},"TYPE:opinionSurveys.employers.added":function(){return"Badanie Opinia > Pracodawcy: dodanie"},"TEXT:opinionSurveys.employers.added":function(e){return"Dodano pracodawcę: <a href='#opinionSurveyEmployers/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->full")+"</a>"},"TYPE:opinionSurveys.employers.edited":function(){return"Badanie Opinia > Pracodawcy: edycja"},"TEXT:opinionSurveys.employers.edited":function(e){return"Zmodyfikowano pracodawcę: <a href='#opinionSurveyEmployers/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->full")+"</a>"},"TYPE:opinionSurveys.employers.deleted":function(){return"Badanie Opinia > Pracodawcy: usunięcie"},"TEXT:opinionSurveys.employers.deleted":function(e){return"Usunięto pracodawcę: <em>"+n.v(e,"model->full")+"</em>"},"TYPE:opinionSurveys.divisions.added":function(){return"Badanie Opinia > Wydziały: dodanie"},"TEXT:opinionSurveys.divisions.added":function(e){return"Dodano wydział: <a href='#opinionSurveyDivisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->full")+"</a>"},"TYPE:opinionSurveys.divisions.edited":function(){return"Badanie Opinia > Wydziały: edycja"},"TEXT:opinionSurveys.divisions.edited":function(e){return"Zmodyfikowano wydział: <a href='#opinionSurveyDivisions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->full")+"</a>"},"TYPE:opinionSurveys.divisions.deleted":function(){return"Badanie Opinia > Wydziały: usunięcie"},"TEXT:opinionSurveys.divisions.deleted":function(e){return"Usunięto wydział: <em>"+n.v(e,"model->full")+"</em>"},"TYPE:opinionSurveys.questions.added":function(){return"Badanie Opinia > Pytania: dodanie"},"TEXT:opinionSurveys.questions.added":function(e){return"Dodano pytanie: <a href='#opinionSurveyQuestions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->short")+"</a>"},"TYPE:opinionSurveys.questions.edited":function(){return"Badanie Opinia > Pytania: edycja"},"TEXT:opinionSurveys.questions.edited":function(e){return"Zmodyfikowano pytanie: <a href='#opinionSurveyQuestions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->short")+"</a>"},"TYPE:opinionSurveys.questions.deleted":function(){return"Badanie Opinia > Pytania: usunięcie"},"TEXT:opinionSurveys.questions.deleted":function(e){return"Usunięto pytanie: <em>"+n.v(e,"model->full")+"</em>"},"TYPE:opinionSurveys.responses.edited":function(){return"Badanie Opinia > Odpowiedzi: edycja"},"TEXT:opinionSurveys.responses.edited":function(e){return"Zmodyfikowano odpowiedź: <a href='#opinionSurveyQuestions/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->_id")+"</a>"},"TYPE:opinionSurveys.responses.deleted":function(){return"Badanie Opinia > Odpowiedzi: usunięcie"},"TEXT:opinionSurveys.responses.deleted":function(e){return"Usunięto odpowiedź: <em>"+n.v(e,"model->_id")+"</em>"},"TYPE:opinionSurveys.actions.deleted":function(){return"Badanie Opinia > Akcje naprawcze: usunięcie"},"TEXT:opinionSurveys.actions.deleted":function(e){return"Usunięto akcję naprawczą: <em>"+n.v(e,"model->rid")+"</em>"},"TYPE:opinionSurveys.scanTemplates.added":function(){return"Badanie Opinia > Szablony: dodanie"},"TEXT:opinionSurveys.scanTemplates.added":function(e){return"Dodano szablon skanowania: <a href='#opinionSurveyScanTemplates/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:opinionSurveys.scanTemplates.edited":function(){return"Badanie Opinia > Szablony: edycja"},"TEXT:opinionSurveys.scanTemplates.edited":function(e){return"Zmodyfikowano szablon skanowania: <a href='#opinionSurveyScanTemplates/"+n.v(e,"model->_id")+"'>"+n.v(e,"model->name")+"</a>"},"TYPE:opinionSurveys.scanTemplates.deleted":function(){return"Badanie Opinia > Szablony: usunięcie"},"TEXT:opinionSurveys.scanTemplates.deleted":function(e){return"Usunięto szablon skanowania: <em>"+n.v(e,"model->name")+"</em>"}}});