define(["app/nls/locale/pl"],function(n){var r={locale:{}};r.locale.pl=n;var t=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},e=function(n,r){return t(n),n[r]};return{"BREADCRUMBS:browse":function(){return"Użytkownicy"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie użytkowników nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie użytkownika nie powiodło się :("},"MSG:DELETED":function(n){return"Użytkownik <em>"+e(n,"label")+"</em> został usunięty."},"MSG:SYNCED":function(){return"Użytkownicy zostali zsynchronizowani :)"},"MSG:SYNC_FAILURE":function(){return"Synchronizacja użytkowników nie powiodła się :("},"PAGE_ACTION:add":function(){return"Dodaj użytkownika"},"PAGE_ACTION:edit":function(){return"Edytuj użytkownika"},"PAGE_ACTION:delete":function(){return"Usuń użytkownika"},"PAGE_ACTION:sync":function(){return"Synchronizuj z bazą KD"},"PANEL:TITLE:details":function(){return"Szczegóły użytkownika"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania użytkownika"},"PANEL:TITLE:editForm":function(){return"Formularz edycji użytkownika"},"FILTER:BUTTON":function(){return"Filtruj użytkowników"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:PLACEHOLDER:personellId":function(){return"Dowolny nr"},"FILTER:PLACEHOLDER:lastName":function(){return"Dowolne nazwisko"},"PROPERTY:login":function(){return"Login"},"PROPERTY:password":function(){return"Hasło"},"PROPERTY:password2":function(){return"Potwierdzenie hasła"},"PROPERTY:email":function(){return"Adres e-mail"},"PROPERTY:privileges":function(){return"Uprawnienia"},"PROPERTY:prodFunction":function(){return"Funkcja na produkcji"},"PROPERTY:aors":function(){return"Obszary odpowiedzialności"},"PROPERTY:company":function(){return"Firma"},"PROPERTY:kdDivision":function(){return"Wydział (KD)"},"PROPERTY:personellId":function(){return"Nr kadrowy"},"PROPERTY:card":function(){return"Nr karty"},"PROPERTY:name":function(){return"Imię i nazwisko"},"PROPERTY:firstName":function(){return"Imię"},"PROPERTY:lastName":function(){return"Nazwisko"},"PROPERTY:registerDate":function(){return"Data rejestracji"},"PROPERTY:kdPosition":function(){return"Stanowisko (KD)"},"PROPERTY:active":function(){return"Aktywny?"},"PROPERTY:orgUnit":function(){return"Jednostka organizacyjna"},"ACTIVE:true":function(){return"Tak"},"ACTIVE:false":function(){return"Nie"},"FORM:ACTION:add":function(){return"Dodaj użytkownika"},"FORM:ACTION:edit":function(){return"Edytuj użytkownika"},"FORM:ERROR:passwordMismatch":function(){return"Podane hasła nie pasują do siebie."},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać użytkownika :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować użytkownika :-("},"NO_DATA:aors":function(){return"Wszystkie"},"NO_DATA:company":function(){return"Nieokreślona"},"NO_DATA:prodFunction":function(){return"Nieokreślona"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia użytkownika"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń użytkownika"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego użytkownika?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć użytkownika <em>"+e(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć użytkownika :-("},"PRIVILEGE:ORDERS:VIEW":function(){return"Zlecenia: przeglądanie"},"PRIVILEGE:ORDERS:MANAGE":function(){return"Zlecenia: zarządzanie"},"PRIVILEGE:EVENTS:VIEW":function(){return"Zdarzenia: przeglądanie"},"PRIVILEGE:EVENTS:MANAGE":function(){return"Zdarzenia: zarządzanie"},"PRIVILEGE:USERS:VIEW":function(){return"Użytkownicy: przeglądanie"},"PRIVILEGE:USERS:MANAGE":function(){return"Użytkownicy: zarządzanie"},"PRIVILEGE:DICTIONARIES:VIEW":function(){return"Słowniki: przeglądanie"},"PRIVILEGE:DICTIONARIES:MANAGE":function(){return"Słowniki: zarządzanie"},"PRIVILEGE:FTE:MASTER:VIEW":function(){return"FTE (produkcja): przeglądanie"},"PRIVILEGE:FTE:MASTER:MANAGE":function(){return"FTE (produkcja): zarządzanie"},"PRIVILEGE:FTE:MASTER:ALL":function(){return"FTE (produkcja): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:LEADER:VIEW":function(){return"FTE (magazyn): przeglądanie"},"PRIVILEGE:FTE:LEADER:MANAGE":function(){return"FTE (magazyn): zarządzanie"},"PRIVILEGE:FTE:LEADER:ALL":function(){return"FTE (magazyn): dostęp do wszystkich wydziałów"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(){return"Plany godzinowe: przeglądanie"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(){return"Plany godzinowe: zarządzanie"},"PRIVILEGE:HOURLY_PLANS:ALL":function(){return"Plany godzinowe: dostęp do wszystkich wydziałów"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(){return"Przestoje: przeglądanie"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(){return"Przestoje: potwierdzanie"},"PRIVILEGE:PROD_DOWNTIMES:ALL":function(){return"Przestoje: dostęp do wszystkich wydziałów"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(){return"Karty pracy: przeglądanie"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(){return"Karty pracy: dodawanie"},"PRIVILEGE:PROD_DATA:VIEW":function(){return"Dane produkcyjne: przeglądanie"},"PRIVILEGE:PROD_DATA:MANAGE":function(){return"Dane produkcyjne: zarządzanie"},"PRIVILEGE:REPORTS:VIEW":function(){return"Raporty: przeglądanie"},"PRIVILEGE:REPORTS:MANAGE":function(){return"Raporty: zarządzanie"},"PRIVILEGE:XICONF:VIEW":function(){return"Xiconf: przeglądanie"},"PRIVILEGE:XICONF:MANAGE":function(){return"Xiconf: zarządzanie"},"select2:placeholder":function(){return"Szukaj po nazwisku lub nr kadrowym..."},"select2:users:system":function(){return"System"}}});