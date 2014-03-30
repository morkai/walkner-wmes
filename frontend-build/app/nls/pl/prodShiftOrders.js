define(["app/nls/locale/pl"],function(n){var r={locale:{}};r.locale.pl=n;var t=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},e=function(n,r){return t(n),n[r]};return{"BREADCRUMBS:browse":function(){return"Zlecenia"},"BREADCRUMBS:details":function(n){return e(n,"order")+"; "+e(n,"operation")},"BREADCRUMBS:editForm":function(){return"Edycja"},"MSG:LOADING_FAILURE":function(){return"Ładowanie historii zleceń nie powiodło się :("},"PAGE_ACTION:prodLogEntries":function(){return"Pokaż historię operacji"},"PAGE_ACTION:prodDowntimes":function(){return"Pokaż przestoje"},"PAGE_ACTION:export":function(){return"Eksportuj zlecenia"},"PAGE_ACTION:edit":function(){return"Edytuj zlecenie"},"PANEL:TITLE:details":function(){return"Szczegóły zlecenia produkcyjnego"},"PANEL:TITLE:orderDetails":function(){return"Szczegóły zlecenia w momencie rozpoczęcia"},"PANEL:TITLE:losses":function(){return"Straty materiałowe"},"PANEL:TITLE:downtimes":function(){return"Przestoje rozpoczęte w trakcie wykonywania zlecenia"},"PANEL:TITLE:editForm":function(){return"Formularz edycji danych zlecenia produkcyjnego"},"FILTER:orderId":function(){return"Nr/12NC zlecenia"},"FILTER:operationNo":function(){return"Nr oper."},"FILTER:DATE:FROM":function(){return"Od"},"FILTER:DATE:TO":function(){return"Do"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:BUTTON":function(){return"Filtruj historię"},"FILTER:PLACEHOLDER:type":function(){return"Dowolny typ"},"FILTER:PLACEHOLDER:prodLine":function(){return"Dowolna linia produkcyjna"},"FILTER:PLACEHOLDER:orderId":function(){return"Dowolne zlecenie"},"FILTER:PLACEHOLDER:operationNo":function(){return"0000"},"FORM:ACTION:edit":function(){return"Edytuj zlecenie"},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować zlecenia :-("},"FORM:ERROR:order":function(){return"Zlecenie jest wymagane!"},"FORM:ERROR:operation":function(){return"Operacja jest wymagana!"},"FORM:ERROR:INVALID_CHANGES":function(){return"Nie można zmodyfikować zlecenia: nie wykryto żadnych poprawnych zmian :("},"FORM:PLACEHOLDER:personnel":function(){return"Szukaj użytkownika po nr kadrowym lub nazwisku..."},"PROPERTY:mrpControllers":function(){return"Kontroler MRP"},"PROPERTY:prodFlow":function(){return"Przepływ"},"PROPERTY:prodLine":function(){return"Linia produkcyjna"},"PROPERTY:creator":function(){return"Rozpoczynający"},"PROPERTY:date":function(){return"Data"},"PROPERTY:shift":function(){return"Zmiana"},"PROPERTY:prodShift":function(){return"Zmiana"},"PROPERTY:master":function(){return"Mistrz"},"PROPERTY:leader":function(){return"Lider"},"PROPERTY:operator":function(){return"Operator"},"PROPERTY:operators":function(){return"Operatorzy"},"PROPERTY:startedAt":function(){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(){return"Czas zakończenia"},"PROPERTY:duration":function(){return"Czas trwania"},"PROPERTY:quantityDone":function(){return"Ilość wykonana"},"PROPERTY:quantityDoneSap":function(){return"Ilość wykonana / wg SAP"},"PROPERTY:workerCount":function(){return"Ilość osób"},"PROPERTY:workerCountSap":function(){return"Ilość osób / wg SAP"},"PROPERTY:taktTime":function(){return"Takt Time / wg SAP"},"PROPERTY:order":function(){return"Zlecenie"},"PROPERTY:orderId":function(){return"Zlecenie"},"PROPERTY:operation":function(){return"Operacja"},"PROPERTY:operationNo":function(){return"Operacja"},"PROPERTY:pressWorksheet":function(){return"Karta pracy"},"unit:workerCount":function(){return"osoby"},"unit:taktTime":function(){return"s"}}});