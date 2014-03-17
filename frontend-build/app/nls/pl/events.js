define(["app/nls/locale/pl"],function(e){var n={locale:{}};n.locale.pl=e;var o=function(e){if(!e)throw new Error("MessageFormat: No data passed to function.")},d=function(e,n,o){if(isNaN(e[n]))throw new Error("MessageFormat: `"+n+"` isnt a number.");return e[n]-(o||0)},r=function(e,n){return o(e),e[n]},i=function(e,d,r,i,t){return o(e),e[d]in t?t[e[d]]:(d=n.locale[i](e[d]-r),d in t?t[d]:t.other)},t=function(e,n,d){return o(e),e[n]in d?d[e[n]]:d.other};return{"MSG:LOADING_FAILURE":function(){return"Ładowanie zdarzeń nie powiodło się :("},"MSG:LOADING_TYPES_FAILURE":function(){return"Ładowanie typów zdarzeń nie powiodło się :("},"BREADCRUMBS:browse":function(){return"Zdarzenia"},"FILTER:DATE:FROM":function(){return"Od"},"FILTER:DATE:TO":function(){return"Do"},"FILTER:PLACEHOLDER:type":function(){return"Dowolny typ"},"FILTER:PLACEHOLDER:user":function(){return"Dowolny użytkownik"},"FILTER:SYSTEM_USER":function(){return"System"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:BUTTON":function(){return"Filtruj zdarzenia"},"PROPERTY:time":function(){return"Czas wystąpienia"},"PROPERTY:user":function(){return"Użytkownik"},"PROPERTY:type":function(){return"Typ"},"PROPERTY:text":function(){return"Opis"},"PROPERTY:severity":function(){return"Poziom ważności"},"TYPE:app.started":function(){return"Start systemu"},"TEXT:app.started":function(e){return"<em>"+t(e,"id",{frontend:"Serwer aplikacji",controller:"Serwer sterownika",alarms:"Serwer alarmów",other:"Serwer "+r(e,"id")})+"</em> wystartował w środowisku <em>"+t(e,"env",{development:"rozwojowym",production:"produkcyjnym",other:"nieokreślonym"})+"</em> w ciągu <em>"+r(e,"time")+"</em> ms."},"TYPE:users.login":function(){return"Użytkownicy: zalogowanie"},"TEXT:users.login":function(){return"-"},"TYPE:users.loginFailure":function(){return"Użytkownicy: Nieudane logowanie"},"TEXT:users.loginFailure":function(e){return"Nieudane logowanie na konto: <em>"+r(e,"login")+"</em>"},"TYPE:users.logout":function(){return"Użytkownicy: wylogowanie"},"TEXT:users.logout":function(){return"-"},"TYPE:users.added":function(){return"Użytkownicy: dodanie"},"TEXT:users.added":function(e){return"Dodano użytkownika: <a href='#users/"+r(e,"model->_id")+"'>"+r(e,"model->login")+"</a>"},"TYPE:users.edited":function(){return"Użytkownicy: edycja"},"TEXT:users.edited":function(e){return"Zmodyfikowano użytkownika: <a href='#users/"+r(e,"model->_id")+"'>"+r(e,"model->login")+"</a>"},"TYPE:users.deleted":function(){return"Użytkownicy: usunięcie"},"TEXT:users.deleted":function(e){return"Usunięto użytkownika: <em>"+r(e,"model->login")+"</em>"},"TYPE:users.synced":function(){return"Użytkownicy: synchronizacja"},"TEXT:users.synced":function(e){return"Dodano "+i(e,"created",0,"pl",{one:"1 nowego użytkownika",other:d(e,"created")+" nowych użytkowników"})+" i zmodyfikowano "+i(e,"updated",0,"pl",{one:"1 istniejącego użytkownika",other:d(e,"updated")+" istniejących użytkowników"})+" podczas synchronizacji z bazą KD."},"TYPE:users.syncFailed":function(){return"Użytkownicy: błąd synchronizacji"},"TEXT:users.syncFailed":function(e){return"Nie udało się zsynchronizować użytkowników z bazą KD: <em>"+r(e,"error")+"</em>"},"TYPE:mechOrders.edited":function(){return"Zlecenia działu mechanicznego: edycja"},"TEXT:mechOrders.edited":function(e){return"Zmodyfikowano zlecenie działu mechanicznego: <a href='#mechOrders/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:mechOrders.synced":function(){return"Zlecenia działu mechanicznego: import"},"TEXT:mechOrders.synced":function(e){return"Zaimportowano "+i(e,"count",0,"pl",{one:"1 zlecenie",few:d(e,"count")+" zlecenia",other:d(e,"count")+" zleceń"})+" działu mechanicznego."},"TYPE:emptyOrders.synced":function(){return"Puste zlecenia: synchronizacja"},"TEXT:emptyOrders.synced":function(e){return"Dodano "+i(e,"count",0,"pl",{one:"1 nowe puste zlecenie",few:d(e,"count")+" nowe puste zlecenia",other:d(e,"count")+" nowych pustych zleceń"})+"."},"TYPE:orders.synced":function(){return"Zlecenia reszty działów: synchronizacja"},"TEXT:orders.synced":function(e){return"Dodano "+i(e,"created",0,"pl",{one:"1 nowe",few:d(e,"created")+" nowe",other:d(e,"created")+" nowych"})+" i zmodyfikowano "+i(e,"updated",0,"pl",{one:"1 istniejące zlecenie",few:d(e,"updated")+" istniejące zlecenia",other:d(e,"updated")+" istniejących zleceń"})+t(e,"moduleName",{currentDayOrderImporter:"&nbsp;z aktualnego dnia",nextDayOrderImporter:"&nbsp;z następnego dnia",prevDayOrderImporter:"&nbsp;z poprzedniego dnia",other:""})+"."},"TYPE:orderStatuses.added":function(){return"Statusy zleceń: dodanie"},"TEXT:orderStatuses.added":function(e){return"Dodano status zleceń: <a href='#orderStatuses/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:orderStatuses.edited":function(){return"Statusy zleceń: edycja"},"TEXT:orderStatuses.edited":function(e){return"Zmodyfikowano status zleceń: <a href='#orderStatuses/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:orderStatuses.deleted":function(){return"Statusy zleceń: usunięcie"},"TEXT:orderStatuses.deleted":function(e){return"Usunięto status zleceń: <em>"+r(e,"model->_id")+"</em>"},"TYPE:downtimeReasons.added":function(){return"Powody przestojów: dodanie"},"TEXT:downtimeReasons.added":function(e){return"Dodano powód przestojów: <a href='#downtimeReasons/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.edited":function(){return"Powody przestojów: edycja"},"TEXT:downtimeReasons.edited":function(e){return"Zmodyfikowano powód przestojów: <a href='#downtimeReasons/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:downtimeReasons.deleted":function(){return"Powody przestojów: usunięcie"},"TEXT:downtimeReasons.deleted":function(e){return"Usunięto powód przestojów: <em>"+r(e,"model->_id")+"</em>"},"TYPE:lossReasons.added":function(){return"Powody strat materiałowych: dodanie"},"TEXT:lossReasons.added":function(e){return"Dodano powód strat materiałowych: <a href='#lossReasons/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:lossReasons.edited":function(){return"Powody strat materiałowych: edycja"},"TEXT:lossReasons.edited":function(e){return"Zmodyfikowano powód strat materiałowych: <a href='#lossReasons/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:lossReasons.deleted":function(){return"Powody strat materiałowych: usunięcie"},"TEXT:lossReasons.deleted":function(e){return"Usunięto powód strat materiałowych: <em>"+r(e,"model->_id")+"</em>"},"TYPE:aors.added":function(){return"Obszary odpowiedzialności: dodanie"},"TEXT:aors.added":function(e){return"Dodano obszar odpowiedzialności: <a href='#aors/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:aors.edited":function(){return"Obszary odpowiedzialności: edycja"},"TEXT:aors.edited":function(e){return"Zmodyfikowano obszar odpowiedzialności: <a href='#aors/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:aors.deleted":function(){return"Obszary odpowiedzialności: usunięcie"},"TEXT:aors.deleted":function(e){return"Usunięto obszar odpowiedzialności: <em>"+r(e,"model->name")+"</em>"},"TYPE:workCenters.added":function(){return"WorkCentera: dodanie"},"TEXT:workCenters.added":function(e){return"Dodano WorkCenter: <a href='#workCenters/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:workCenters.edited":function(){return"WorkCentera: edycja"},"TEXT:workCenters.edited":function(e){return"Zmodyfikowano WorkCenter: <a href='#workCenters/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:workCenters.deleted":function(){return"WorkCentera: usunięcie"},"TEXT:workCenters.deleted":function(e){return"Usunięto WorkCenter: <em>"+r(e,"model->_id")+"</em>"},"TYPE:divisions.added":function(){return"Wydziały: dodanie"},"TEXT:divisions.added":function(e){return"Dodano wydział: <a href='#divisions/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:divisions.edited":function(){return"Wydziały: edycja"},"TEXT:divisions.edited":function(e){return"Zmodyfikowano wydział: <a href='#divisions/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:divisions.deleted":function(){return"Wydziały: usunięcie"},"TEXT:divisions.deleted":function(e){return"Usunięto wydział: <em>"+r(e,"model->_id")+"</em>"},"TYPE:subdivisions.added":function(){return"Działy: dodanie"},"TEXT:subdivisions.added":function(e){return"Dodano dział: <a href='#subdivisions/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:subdivisions.edited":function(){return"Działy: edycja"},"TEXT:subdivisions.edited":function(e){return"Zmodyfikowano dział: <a href='#subdivisions/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:subdivisions.deleted":function(){return"Działy: usunięcie"},"TEXT:subdivisions.deleted":function(e){return"Usunięto dział: <em>"+r(e,"model->name")+"</em>"},"TYPE:companies.added":function(){return"Firmy: dodanie"},"TEXT:companies.added":function(e){return"Dodano firmę: <a href='#companies/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:companies.edited":function(){return"Firmy: edycja"},"TEXT:companies.edited":function(e){return"Zmodyfikowano firmę: <a href='#companies/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:companies.deleted":function(){return"Firmy: usunięcie"},"TEXT:companies.deleted":function(e){return"Usunięto firmę: <em>"+r(e,"model->name")+"</em>"},"TYPE:mrpControllers.added":function(){return"Kontrolery MRP: dodanie"},"TEXT:mrpControllers.added":function(e){return"Dodano kontroler MRP: <a href='#mrpControllers/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:mrpControllers.edited":function(){return"Kontrolery MRP: edycja"},"TEXT:mrpControllers.edited":function(e){return"Zmodyfikowano kontroler MRP: <a href='#mrpControllers/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:mrpControllers.deleted":function(){return"Kontrolery MRP: usunięcie"},"TEXT:mrpControllers.deleted":function(e){return"Usunięto kontroler MRP: <em>"+r(e,"model->_id")+"</em>"},"TYPE:prodLines.added":function(){return"Linie produkcyjne: dodanie"},"TEXT:prodLines.added":function(e){return"Dodano linię produkcyjną: <a href='#prodLines/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:prodLines.edited":function(){return"Linie produkcyjne: edycja"},"TEXT:prodLines.edited":function(e){return"Zmodyfikowano linię produkcyjną: <a href='#prodLines/"+r(e,"model->_id")+"'>"+r(e,"model->_id")+"</a>"},"TYPE:prodLines.deleted":function(){return"Linie produkcyjne: usunięcie"},"TEXT:prodLines.deleted":function(e){return"Usunięto linię produkcyjną: <em>"+r(e,"model->_id")+"</em>"},"TYPE:prodTasks.added":function(){return"Zadania produkcyjne: dodanie"},"TEXT:prodTasks.added":function(e){return"Dodano zadanie produkcyjne: <a href='#prodTasks/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:prodTasks.edited":function(){return"Zadania produkcyjne: edycja"},"TEXT:prodTasks.edited":function(e){return"Zmodyfikowano zadanie produkcyjne: <a href='#prodTasks/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:prodTasks.deleted":function(){return"Zadania produkcyjne: usunięcie"},"TEXT:prodTasks.deleted":function(e){return"Usunięto zadanie produkcyjne: <em>"+r(e,"model->name")+"</em>"},"TYPE:prodFlows.added":function(){return"Przepływy: dodanie"},"TEXT:prodFlows.added":function(e){return"Dodano przepływ: <a href='#prodFlows/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:prodFlows.edited":function(){return"Przepływy: edycja"},"TEXT:prodFlows.edited":function(e){return"Zmodyfikowano przepływ: <a href='#prodFlows/"+r(e,"model->_id")+"'>"+r(e,"model->name")+"</a>"},"TYPE:prodFlows.deleted":function(){return"Przepływy: usunięcie"},"TEXT:prodFlows.deleted":function(e){return"Usunięto przepływ: <em>"+r(e,"model->name")+"</em>"},"TYPE:prodFunctions.added":function(){return"Funkcje na produkcji: dodanie"},"TEXT:prodFunctions.added":function(e){return"Dodano funkcję na produkcji: <a href='#prodFunctions/"+r(e,"model->_id")+"'>"+r(e,"model->label")+"</a>"},"TYPE:prodFunctions.edited":function(){return"Funkcje na produkcji: edycja"},"TEXT:prodFunctions.edited":function(e){return"Zmodyfikowano funkcję na produkcji: <a href='#prodFunctions/"+r(e,"model->_id")+"'>"+r(e,"model->label")+"</a>"},"TYPE:prodFunctions.deleted":function(){return"Funkcje na produkcji: usunięcie"},"TEXT:prodFunctions.deleted":function(e){return"Usunięto funkcję na produkcji: <em>"+r(e,"model->label")+"</em>"},"TYPE:fte.leader.created":function(){return"FTE (magazyn): dodanie"},"TEXT:fte.leader.created":function(e){return"Utworzono <a href='#fte/leader/"+r(e,"model->_id")+"'>nowy wpis FTE (magazyn)</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla działu <em>"+r(e,"model->subdivision")+"</em>."},"TYPE:fte.leader.locked":function(){return"FTE (magazyn): zamknięcie"},"TEXT:fte.leader.locked":function(e){return"Zamknięto <a href='#fte/leader/"+r(e,"model->_id")+"'>wpis FTE (magazyn)</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla działu <em>"+r(e,"model->subdivision")+"</em>."},"TYPE:fte.master.created":function(){return"FTE (produkcja): dodanie"},"TEXT:fte.master.created":function(e){return"Utworzono <a href='#fte/master/"+r(e,"model->_id")+"'>nowy wpis FTE (produkcja)</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla działu <em>"+r(e,"model->subdivision")+"</em>."},"TYPE:fte.master.locked":function(){return"FTE (produkcja): zamknięcie"},"TEXT:fte.master.locked":function(e){return"Zamknięto <a href='#fte/master/"+r(e,"model->_id")+"'>wpis FTE (produkcja)</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla działu <em>"+r(e,"model->subdivision")+"</em>."},"TYPE:hourlyPlans.created":function(){return"Plany godzinowe: dodanie"},"TEXT:hourlyPlans.created":function(e){return"Utworzono <a href='#hourlyPlans/"+r(e,"model->_id")+"'>nowy plan godzinowy</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla wydziału <em>"+r(e,"model->division")+"</em>."},"TYPE:hourlyPlans.locked":function(){return"Plany godzinowe: zamknięcie"},"TEXT:hourlyPlans.locked":function(e){return"Zamknięto <a href='#hourlyPlans/"+r(e,"model->_id")+"'>plan godzinowy</a> dla <em>"+r(e,"model->shift")+"</em> zmiany dnia <em>"+r(e,"model->date")+"</em> dla wydziału <em>"+r(e,"model->division")+"</em>."},"TYPE:pressWorksheets.added":function(){return"Karty pracy: dodanie"},"TEXT:pressWorksheets.added":function(e){return"Dodano nową <a href='#pressWorksheets/"+r(e,"model->_id")+"'>kartę pracy</a>."},"TYPE:feedback.added":function(){return"Feedback: dodanie"},"TEXT:feedback.added":function(){return"Dodano nowy feedback."}}});