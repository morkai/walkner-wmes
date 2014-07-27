define(["app/nls/locale/pl"],function(n){var e={locale:{}};e.locale.pl=n;var r=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},t=function(n,e){return r(n),n[e]};return{"BREADCRUMBS:browse":function(){return"Zlecenia"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie historii zleceń nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie danych zlecenia nie powiodło się :("},"MSG:DELETED":function(n){return"Zlecenie <em>"+t(n,"label")+"</em> zostało usunięte."},"PAGE_ACTION:prodLogEntries":function(){return"Pokaż historię operacji"},"PAGE_ACTION:prodDowntimes":function(){return"Pokaż przestoje"},"PAGE_ACTION:export":function(){return"Eksportuj zlecenia"},"PAGE_ACTION:edit":function(){return"Edytuj zlecenie"},"PAGE_ACTION:delete":function(){return"Usuń zlecenie"},"PANEL:TITLE:details":function(){return"Szczegóły zlecenia produkcyjnego"},"PANEL:TITLE:orderDetails":function(){return"Szczegóły zlecenia w momencie rozpoczęcia"},"PANEL:TITLE:losses":function(){return"Straty materiałowe"},"PANEL:TITLE:downtimes":function(){return"Przestoje rozpoczęte w trakcie wykonywania zlecenia"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania zlecenia produkcyjnego"},"PANEL:TITLE:editForm":function(){return"Formularz edycji danych zlecenia produkcyjnego"},"filter:orderId":function(){return"Nr/12NC zlecenia"},"filter:operationNo":function(){return"Nr oper."},"filter:submit":function(){return"Filtruj historię"},"filter:placeholder:type":function(){return"Dowolny typ"},"filter:placeholder:prodLine":function(){return"Dowolna linia produkcyjna"},"filter:placeholder:orderId":function(){return"Dowolne zlecenie"},"filter:placeholder:operationNo":function(){return"0000"},"FORM:ACTION:add":function(){return"Dodaj zlecenie"},"FORM:ACTION:edit":function(){return"Edytuj zlecenie"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać zlecenia :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować zlecenia :-("},"FORM:ERROR:order":function(){return"Zlecenie jest wymagane!"},"FORM:ERROR:operation":function(){return"Operacja jest wymagana!"},"FORM:ERROR:startedAt":function(){return"Czas rozpoczęcia musi mieścić się w ramach Zmiany produkcyjnej!"},"FORM:ERROR:finishedAt":function(){return"Czas zakończenia musi mieścić się w ramach Zmiany produkcyjnej!"},"FORM:ERROR:times":function(){return"Czas zakończenia musi być po Czasie rozpoczęcia!"},"FORM:ERROR:INVALID_CHANGES":function(){return"Nie można zmodyfikować zlecenia: nie wykryto żadnych poprawnych zmian :("},"FORM:ERROR:INPUT":function(){return"Nieprawidłowe dane wejściowe!"},"PROPERTY:mrpControllers":function(){return"Kontroler MRP"},"PROPERTY:prodFlow":function(){return"Przepływ"},"PROPERTY:prodLine":function(){return"Linia produkcyjna"},"PROPERTY:creator":function(){return"Rozpoczynający"},"PROPERTY:date":function(){return"Data"},"PROPERTY:shift":function(){return"Zmiana"},"PROPERTY:prodShift":function(){return"Zmiana"},"PROPERTY:master":function(){return"Mistrz"},"PROPERTY:leader":function(){return"Lider"},"PROPERTY:operator":function(){return"Operator"},"PROPERTY:operators":function(){return"Operatorzy"},"PROPERTY:startedAt":function(){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(){return"Czas zakończenia"},"PROPERTY:duration":function(){return"Czas trwania"},"PROPERTY:quantityDone":function(){return"Ilość wykonana"},"PROPERTY:quantityDoneSap":function(){return"Ilość wykonana / wg SAP"},"PROPERTY:workerCount":function(){return"Ilość osób"},"PROPERTY:workerCountSap":function(){return"Ilość osób / wg SAP"},"PROPERTY:taktTime":function(){return"Takt Time / wg SAP"},"PROPERTY:order":function(){return"Zlecenie"},"PROPERTY:orderId":function(){return"Zlecenie"},"PROPERTY:operation":function(){return"Operacja"},"PROPERTY:operationNo":function(){return"Operacja"},"PROPERTY:pressWorksheet":function(){return"Karta pracy"},"unit:workerCount":function(){return"osoby"},"unit:taktTime":function(){return"s"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia zlecenia"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń zlecenie"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane zlecenie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć zlecenie <em>"+t(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć zlecenia :-("}}});