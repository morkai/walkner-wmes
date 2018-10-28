define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,i,r,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[r](n[t]-i))in o?o[t]:o.other},s:function(n,t,i){return e.c(n,t),n[t]in i?i[n[t]]:i.other}};return{"BREADCRUMBS:browse":function(n){return"Zmiany"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie historii zmian nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie danych zmiany nie powiodło się."},"MSG:DELETED":function(n){return"Zmiana <em>"+e.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:prodLogEntries":function(n){return"Pokaż historię operacji"},"PAGE_ACTION:export":function(n){return"Eksportuj zmiany"},"PAGE_ACTION:add":function(n){return"Dodaj zmianę"},"PAGE_ACTION:edit":function(n){return"Edytuj zmianę"},"PAGE_ACTION:delete":function(n){return"Usuń zmianę"},"PANEL:TITLE:details":function(n){return"Szczegóły zmiany"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania zmiany produkcyjnej"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji danych zmiany produkcyjnej"},"filter:submit":function(n){return"Filtruj historię"},"filter:placeholder:prodLine":function(n){return"Dowolna linia produkcyjna"},"filter:orderMrp":function(n){return"Kontroler MRP zlecenia"},"PROPERTY:mrpControllers":function(n){return"Kontroler MRP"},"PROPERTY:prodFlow":function(n){return"Przepływ"},"PROPERTY:prodLine":function(n){return"Linia produkcyjna"},"PROPERTY:type":function(n){return"Typ"},"PROPERTY:createdAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:creator":function(n){return"Rozpoczynający"},"PROPERTY:date":function(n){return"Data"},"PROPERTY:shift":function(n){return"Zmiana"},"PROPERTY:master":function(n){return"Mistrz"},"PROPERTY:leader":function(n){return"Lider"},"PROPERTY:operator":function(n){return"Operator"},"PROPERTY:operators":function(n){return"Operatorzy"},"PROPERTY:quantitiesDone":function(n){return"Wykonane ilości"},"PROPERTY:quantitiesDone:hour":function(n){return"Godz."},"PROPERTY:quantitiesDone:planned":function(n){return"Plan"},"PROPERTY:quantitiesDone:actual":function(n){return"Wykonane"},"PROPERTY:totalQuantityDone":function(n){return"Wykonana ilość"},"PROPERTY:efficiency":function(n){return"Wydajność"},"PROPERTY:orderMrp":function(n){return"MRP zleceń"},"FORM:ACTION:add":function(n){return"Dodaj zmianę"},"FORM:ACTION:edit":function(n){return"Edytuj zmianę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać zmiany."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować zmiany."},"FORM:ERROR:INVALID_CHANGES":function(n){return"Nie można zmodyfikować zmiany produkcyjnej: nie wykryto żadnych poprawnych zmian."},"FORM:ERROR:INPUT":function(n){return"Nieprawidłowe dane wejściowe!"},"FORM:ERROR:NOT_EDITABLE":function(n){return"Wybrana zmiana jeszcze się nie skończyła!"},"FORM:ERROR:EXISTING":function(n){return"Wybrana zmiana już istnieje!"},totalQuantityDone:function(n){return e.v(n,"actual")+"/"+e.v(n,"planned")},"timeline:title":function(n){return"Oś czasu"},"timeline:action:addOrder":function(n){return"Dodaj zlecenie"},"timeline:action:addDowntime":function(n){return"Dodaj przestój"},"timeline:action:editOrder":function(n){return"Edytuj zlecenie"},"timeline:action:editDowntime":function(n){return"Edytuj przestój"},"timeline:action:deleteOrder":function(n){return"Usuń zlecenie"},"timeline:action:deleteDowntime":function(n){return"Usuń przestój"},"timeline:popover:idle":function(n){return"Bezczynność"},"timeline:popover:working":function(n){return"Zlecenie"},"timeline:popover:downtime":function(n){return"Przestój"},"timeline:popover:startedAt":function(n){return"Czas rozpoczęcia"},"timeline:popover:finishedAt":function(n){return"Czas zakończenia"},"timeline:popover:duration":function(n){return"Czas trwania"},"timeline:popover:order":function(n){return"Zlecenie"},"timeline:popover:operation":function(n){return"Operacja"},"timeline:popover:reason":function(n){return"Powód"},"timeline:popover:aor":function(n){return"Obszar"},"timeline:popover:workerCount":function(n){return"Ilość osób"},"timeline:popover:quantityDone":function(n){return"Ilość wykonana"},"timeline:popover:efficiency":function(n){return"Wydajność"},"timeline:popover:sapTaktTime":function(n){return"Czas taktu"},"timeline:popover:avgTaktTime":function(n){return"Śr. czas cyklu"},"timeline:popover:wh":function(n){return"Magazyn"},"timeline:popover:wh:current":function(n){return"Aktualne zlecenie"},"timeline:popover:wh:next":function(n){return"Następne zlecenia"},"timeline:popover:wh:qtyUnit":function(n){return"szt."},"charts:quantitiesDone:title":function(n){return"Wykonane ilości w przedziałach godzinowych"},"charts:quantitiesDone:unit":function(n){return" szt."},"charts:quantitiesDone:series:planned":function(n){return"Plan"},"charts:quantitiesDone:series:actual":function(n){return"Wykonane"},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia zmiany"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń zmianę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną zmianę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć zmianę <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć zmiany."},"changeRequest:delete:messageText":function(n){return"Jesteś w trybie tworzenia żądania zmiany danych produkcyjnych. <em>Zmiana produkcyjna</em> zostanie usunięta dopiero po zaakceptowaniu operacji przez osobę odpowiedzialną.<br><br>Czy na pewno chcesz utworzyć żądanie usunięcia wybranej zmiany produkcyjnej?"},"changeRequest:delete:formActionText":function(n){return"Utwórz żądanie usunięcia"},"changeRequest:commentLabel":function(n){return"Komentarz do żądania zmiany"},"changeRequest:warning:add":function(n){return"Jesteś w trybie tworzenia żądania zmiany danych produkcyjnych. Nowa <em>zmiana produkcyjna</em> zostanie utworzona dopiero po zaakceptowaniu jej przez osobę odpowiedzialną."},"changeRequest:warning:edit":function(n){return"Jesteś w trybie tworzenia żądania zmiany danych produkcyjnych. <em>Zmiana produkcyjna</em> zostanie zaktualizowana dopiero po zaakceptowaniu dokonanych zmian przez osobę odpowiedzialną."},"changeRequest:msg:success:add":function(n){return"Żądanie dodania nowej zmiany produkcyjnej zostało utworzone."},"changeRequest:msg:success:edit":function(n){return"Żądanie edycji zmiany produkcyjnej zostało utworzone."},"changeRequest:msg:success:delete":function(n){return"Żądanie usunięcia zmiany produkcyjnej zostało utworzone."},"changeRequest:msg:failure:add":function(n){return"Nie udało się stworzyć żądania dodania nowej zmiany produkcyjnej."},"changeRequest:msg:failure:edit":function(n){return"Nie udało się stworzyć żądania edycji zmiany produkcyjnej."},"changeRequest:msg:failure:delete":function(n){return"Nie udało się stworzyć żądania usunięcia zmiany produkcyjnej."}}});