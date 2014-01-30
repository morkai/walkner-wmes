define(["app/nls/locale/pl"],function(e){var t={locale:{}};return t.locale.pl=e,{"BREADCRUMBS:browse":function(){var e="";return e+="Użytkownicy"},"BREADCRUMBS:addForm":function(){var e="";return e+="Dodawanie"},"BREADCRUMBS:editForm":function(){var e="";return e+="Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){var e="";return e+="Usuwanie"},"MSG:LOADING_FAILURE":function(){var e="";return e+="Ładowanie użytkowników nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){var e="";return e+="Ładowanie użytkownika nie powiodło się :("},"MSG:DELETED":function(e){var t="";if(t+="Użytkownik <em>",!e)throw new Error("MessageFormat: No data passed to function.");return t+=e.label,t+="</em> został usunięty."},"MSG:SYNCED":function(){var e="";return e+="Użytkownicy zostali zsynchronizowani :)"},"MSG:SYNC_FAILURE":function(){var e="";return e+="Synchronizacja użytkowników nie powiodła się :("},"PAGE_ACTION:add":function(){var e="";return e+="Dodaj użytkownika"},"PAGE_ACTION:edit":function(){var e="";return e+="Edytuj użytkownika"},"PAGE_ACTION:delete":function(){var e="";return e+="Usuń użytkownika"},"PAGE_ACTION:sync":function(){var e="";return e+="Synchronizuj z bazą KD"},"PANEL:TITLE:details":function(){var e="";return e+="Szczegóły użytkownika"},"PANEL:TITLE:addForm":function(){var e="";return e+="Formularz dodawania użytkownika"},"PANEL:TITLE:editForm":function(){var e="";return e+="Formularz edycji użytkownika"},"FILTER:BUTTON":function(){var e="";return e+="Filtruj użytkowników"},"FILTER:LIMIT":function(){var e="";return e+="Limit"},"FILTER:PLACEHOLDER:personellId":function(){var e="";return e+="Dowolny nr"},"FILTER:PLACEHOLDER:lastName":function(){var e="";return e+="Dowolne nazwisko"},"PROPERTY:login":function(){var e="";return e+="Login"},"PROPERTY:password":function(){var e="";return e+="Hasło"},"PROPERTY:password2":function(){var e="";return e+="Potwierdzenie hasła"},"PROPERTY:email":function(){var e="";return e+="Adres e-mail"},"PROPERTY:privileges":function(){var e="";return e+="Uprawnienia"},"PROPERTY:prodFunction":function(){var e="";return e+="Funkcja na produkcji"},"PROPERTY:aors":function(){var e="";return e+="Obszary odpowiedzialności"},"PROPERTY:company":function(){var e="";return e+="Firma"},"PROPERTY:kdDivision":function(){var e="";return e+="Wydział (KD)"},"PROPERTY:personellId":function(){var e="";return e+="Nr kadrowy"},"PROPERTY:card":function(){var e="";return e+="Nr karty"},"PROPERTY:name":function(){var e="";return e+="Imię i nazwisko"},"PROPERTY:firstName":function(){var e="";return e+="Imię"},"PROPERTY:lastName":function(){var e="";return e+="Nazwisko"},"PROPERTY:registerDate":function(){var e="";return e+="Data rejestracji"},"PROPERTY:kdPosition":function(){var e="";return e+="Stanowisko (KD)"},"PROPERTY:active":function(){var e="";return e+="Aktywny?"},"PROPERTY:orgUnit":function(){var e="";return e+="Jednostka organizacyjna"},"PROD_FUNCTION:master":function(){var e="";return e+="Mistrz"},"PROD_FUNCTION:leader":function(){var e="";return e+="Lider"},"PROD_FUNCTION:mizusumashi":function(){var e="";return e+="Mizusumashi"},"PROD_FUNCTION:adjuster":function(){var e="";return e+="Ustawiacz"},"PROD_FUNCTION:operator":function(){var e="";return e+="Operator"},"PROD_FUNCTION:unspecified":function(){var e="";return e+="Nieokreślona"},"ACTIVE:true":function(){var e="";return e+="Tak"},"ACTIVE:false":function(){var e="";return e+="Nie"},"FORM:ACTION:add":function(){var e="";return e+="Dodaj użytkownika"},"FORM:ACTION:edit":function(){var e="";return e+="Edytuj użytkownika"},"FORM:ERROR:passwordMismatch":function(){var e="";return e+="Podane hasła nie pasują do siebie."},"FORM:ERROR:addFailure":function(){var e="";return e+="Nie udało się dodać użytkownika :-("},"FORM:ERROR:editFailure":function(){var e="";return e+="Nie udało się zmodyfikować użytkownika :-("},"NO_DATA:aors":function(){var e="";return e+="Nieokreślone"},"NO_DATA:company":function(){var e="";return e+="Nieokreślona"},"ACTION_FORM:DIALOG_TITLE:delete":function(){var e="";return e+="Potwierdzenie usunięcia użytkownika"},"ACTION_FORM:BUTTON:delete":function(){var e="";return e+="Usuń użytkownika"},"ACTION_FORM:MESSAGE:delete":function(){var e="";return e+="Czy na pewno chcesz bezpowrotnie usunąć wybranego użytkownika?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){var t="";if(t+="Czy na pewno chcesz bezpowrotnie usunąć użytkownika <em>",!e)throw new Error("MessageFormat: No data passed to function.");return t+=e.label,t+="</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){var e="";return e+="Nie udało się usunąć użytkownika :-("},"PRIVILEGE:ORDERS:VIEW":function(){var e="";return e+="Przeglądanie zleceń"},"PRIVILEGE:ORDERS:MANAGE":function(){var e="";return e+="Zarządzanie zleceniami"},"PRIVILEGE:LINES:VIEW":function(){var e="";return e+="Przeglądanie linii produkcyjnych"},"PRIVILEGE:LINES:MANAGE":function(){var e="";return e+="Zarządzanie liniami produkcyjnymi"},"PRIVILEGE:EVENTS:VIEW":function(){var e="";return e+="Przeglądanie zdarzeń"},"PRIVILEGE:EVENTS:MANAGE":function(){var e="";return e+="Zarządzanie zdarzeniami"},"PRIVILEGE:USERS:VIEW":function(){var e="";return e+="Przeglądanie użytkowników"},"PRIVILEGE:USERS:MANAGE":function(){var e="";return e+="Zarządzanie użytkownikami"},"PRIVILEGE:DICTIONARIES:VIEW":function(){var e="";return e+="Przeglądanie słowników"},"PRIVILEGE:DICTIONARIES:MANAGE":function(){var e="";return e+="Zarządzanie słownikami"},"PRIVILEGE:FTE:MASTER:VIEW":function(){var e="";return e+="FTE (produkcja): przeglądanie"},"PRIVILEGE:FTE:MASTER:MANAGE":function(){var e="";return e+="FTE (produkcja): zarządzanie"},"PRIVILEGE:FTE:MASTER:ALL":function(){var e="";return e+="FTE (produkcja): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:LEADER:VIEW":function(){var e="";return e+="FTE (magazyn): przeglądanie"},"PRIVILEGE:FTE:LEADER:MANAGE":function(){var e="";return e+="FTE (magazyn): zarządzanie"},"PRIVILEGE:FTE:LEADER:ALL":function(){var e="";return e+="FTE (magazyn): dostęp do wszystkich wydziałów"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(){var e="";return e+="Plany godzinowe: przeglądanie"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(){var e="";return e+="Plany godzinowe: zarządzanie"},"PRIVILEGE:HOURLY_PLANS:ALL":function(){var e="";return e+="Plany godzinowe: dostęp do wszystkich wydziałów"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(){var e="";return e+="Przestoje: przeglądanie"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(){var e="";return e+="Przestoje: potwierdzanie"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(){var e="";return e+="Karty pracy: przeglądanie"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(){var e="";return e+="Karty pracy: dodawanie"},"PRIVILEGE:PROD_DATA:VIEW":function(){var e="";return e+="Dane produkcyjne: przeglądanie"},"PRIVILEGE:REPORTS:VIEW":function(){var e="";return e+="Raporty: przeglądanie"}}});