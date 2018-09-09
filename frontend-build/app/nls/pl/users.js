define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,i,t,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[t](n[r]-i),r in o?o[r]:o.other)},s:function(n,r,i){return e.c(n,r),n[r]in i?i[n[r]]:i.other}};return{"BREADCRUMBS:browse":function(n){return"Użytkownicy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:myAccount":function(n){return"Moje konto"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"breadcrumbs:logIn":function(n){return"Logowanie do systemu"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie użytkowników nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie użytkownika nie powiodło się."},"MSG:DELETED":function(n){return"Użytkownik <em>"+e.v(n,"label")+"</em> został usunięty."},"MSG:SYNCED":function(n){return"Użytkownicy zostali zsynchronizowani :)"},"MSG:SYNC_FAILURE":function(n){return"Synchronizacja użytkowników nie powiodła się."},"PAGE_ACTION:add":function(n){return"Dodaj użytkownika"},"PAGE_ACTION:edit":function(n){return"Edytuj użytkownika"},"PAGE_ACTION:editAccount":function(n){return"Edytuj konto"},"PAGE_ACTION:delete":function(n){return"Usuń użytkownika"},"PAGE_ACTION:sync":function(n){return"Synchronizuj z bazą KD"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:anonymize":function(n){return"Anonimizuj"},"PANEL:TITLE:details:basic":function(n){return"Podstawowe informacje"},"PANEL:TITLE:details:contact":function(n){return"Dane kontaktowe"},"PANEL:TITLE:details:extra":function(n){return"Dodatkowe informacje"},"PANEL:TITLE:details:privileges":function(n){return"Uprawnienia"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania użytkownika"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji użytkownika"},"filter:submit":function(n){return"Filtruj użytkowników"},"PROPERTY:login":function(n){return"Login"},"PROPERTY:password":function(n){return"Hasło"},"PROPERTY:newPassword":function(n){return"Nowe hasło"},"PROPERTY:password2":function(n){return"Potwierdzenie hasła"},"PROPERTY:email":function(n){return"Adres e-mail"},"PROPERTY:privileges":function(n){return"Uprawnienia"},"PROPERTY:prodFunction":function(n){return"Funkcja na produkcji"},"PROPERTY:aors":function(n){return"Obszary odpowiedzialności"},"PROPERTY:company":function(n){return"Firma"},"PROPERTY:kdId":function(n){return"ID (KD)"},"PROPERTY:kdDivision":function(n){return"Wydział (KD)"},"PROPERTY:personellId":function(n){return"Nr kadrowy"},"PROPERTY:card":function(n){return"Nr karty (KD)"},"PROPERTY:cardUid":function(n){return"ID karty"},"PROPERTY:name":function(n){return"Imię i nazwisko"},"PROPERTY:firstName":function(n){return"Imię"},"PROPERTY:lastName":function(n){return"Nazwisko"},"PROPERTY:registerDate":function(n){return"Data rejestracji"},"PROPERTY:kdPosition":function(n){return"Stanowisko (KD)"},"PROPERTY:active":function(n){return"Konto aktywne?"},"PROPERTY:orgUnit":function(n){return"Jednostka organizacyjna"},"PROPERTY:vendor":function(n){return"Dostawca"},"PROPERTY:gender":function(n){return"Płeć"},"PROPERTY:mobile":function(n){return"Telefony komórkowe"},"PROPERTY:mrps":function(n){return"Moje MRP"},"active:true":function(n){return"Tak"},"active:false":function(n){return"Nie"},"gender:female":function(n){return"Żeńska"},"gender:male":function(n){return"Męska"},"FORM:ACTION:add":function(n){return"Dodaj użytkownika"},"FORM:ACTION:edit":function(n){return"Edytuj użytkownika"},"FORM:ERROR:passwordMismatch":function(n){return"Podane hasła nie pasują do siebie."},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać użytkownika."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować użytkownika."},"FORM:ERROR:LOGIN_USED":function(n){return"Podany login jest już wykorzystany w innym aktywnym koncie."},"FORM:HELP:password":function(n){return"Podaj hasła tylko wtedy, gdy chcesz je zmienić."},"FORM:mobile:from":function(n){return"dostępny od"},"FORM:mobile:to":function(n){return"do"},"FORM:mobile:empty":function(n){return"Brak zdefiniowanych telefonów."},"FORM:mobile:item":function(n){return e.v(n,"number")+" od "+e.v(n,"fromTime")+" do "+e.v(n,"toTime")},"FORM:copyPrivileges:success":function(n){return"Uprawnienia skopiowane :)"},"NO_DATA:aors":function(n){return"Wszystkie"},"NO_DATA:company":function(n){return"Nieokreślona"},"NO_DATA:prodFunction":function(n){return"Nieokreślona"},"NO_DATA:vendor":function(n){return"Wszyscy"},"DETAILS:mobile:item":function(n){return e.v(n,"number")+" od "+e.v(n,"fromTime")+" do "+e.v(n,"toTime")},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia użytkownika"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń użytkownika"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego użytkownika?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć użytkownika <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć użytkownika."},"PRIVILEGE:SUPER":function(n){return"Super administrator"},"PRIVILEGE:ORDERS:VIEW":function(n){return"Zlecenia: przeglądanie"},"PRIVILEGE:ORDERS:MANAGE":function(n){return"Zlecenia: zarządzanie"},"PRIVILEGE:EVENTS:VIEW":function(n){return"Zdarzenia: przeglądanie"},"PRIVILEGE:EVENTS:MANAGE":function(n){return"Zdarzenia: zarządzanie"},"PRIVILEGE:USERS:VIEW":function(n){return"Użytkownicy: przeglądanie"},"PRIVILEGE:USERS:MANAGE":function(n){return"Użytkownicy: zarządzanie"},"PRIVILEGE:DICTIONARIES:VIEW":function(n){return"Słowniki: przeglądanie"},"PRIVILEGE:DICTIONARIES:MANAGE":function(n){return"Słowniki: zarządzanie"},"PRIVILEGE:FTE:MASTER:VIEW":function(n){return"FTE (produkcja): przeglądanie"},"PRIVILEGE:FTE:MASTER:MANAGE":function(n){return"FTE (produkcja): zarządzanie"},"PRIVILEGE:FTE:MASTER:ALL":function(n){return"FTE (produkcja): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:LEADER:VIEW":function(n){return"FTE (inne): przeglądanie"},"PRIVILEGE:FTE:LEADER:MANAGE":function(n){return"FTE (inne): zarządzanie"},"PRIVILEGE:FTE:LEADER:ALL":function(n){return"FTE (inne): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:WH:VIEW":function(n){return"FTE (magazyn): przeglądanie"},"PRIVILEGE:FTE:WH:MANAGE":function(n){return"FTE (magazyn): zarządzanie"},"PRIVILEGE:FTE:WH:ALL":function(n){return"FTE (magazyn): dostęp do wszystkich wydziałów"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(n){return"Plany godzinowe: przeglądanie"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(n){return"Plany godzinowe: zarządzanie"},"PRIVILEGE:HOURLY_PLANS:ALL":function(n){return"Plany godzinowe: dostęp do wszystkich wydziałów"},"PRIVILEGE:PLANNING:VIEW":function(n){return"Plany dzienne: przeglądanie"},"PRIVILEGE:PLANNING:MANAGE":function(n){return"Plany dzienne: zarządzanie"},"PRIVILEGE:PLANNING:PLANNER":function(n){return"Plany dzienne: planista"},"PRIVILEGE:PLANNING:WHMAN":function(n){return"Plany dzienne: magazynier"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(n){return"Przestoje: przeglądanie"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(n){return"Przestoje: potwierdzanie"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:VIEW":function(n){return"Alarmy: przeglądanie"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:MANAGE":function(n){return"Alarmy: zarządzanie"},"PRIVILEGE:PROD_DOWNTIMES:ALL":function(n){return"Przestoje: dostęp do wszystkich wydziałów"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(n){return"Karty pracy: przeglądanie"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(n){return"Karty pracy: dodawanie"},"PRIVILEGE:PROD_DATA:VIEW":function(n){return"Dane produkcyjne: przeglądanie"},"PRIVILEGE:PROD_DATA:VIEW:EFF":function(n){return"Dane produkcyjne: wydajność"},"PRIVILEGE:PROD_DATA:MANAGE":function(n){return"Dane produkcyjne: zarządzanie"},"PRIVILEGE:PROD_DATA:MANAGE:SPIGOT_ONLY":function(n){return"Tylko zmiana linii ze spigotem"},"PRIVILEGE:PROD_DATA:CHANGES:REQUEST":function(n){return"Dane produkcyjne: żądanie zmian"},"PRIVILEGE:PROD_DATA:CHANGES:MANAGE":function(n){return"Dane produkcyjne: zatwierdzanie zmian"},"PRIVILEGE:REPORTS:VIEW":function(n){return"Raporty: przeglądanie wszystkich"},"PRIVILEGE:REPORTS:MANAGE":function(n){return"Raporty: zarządzanie"},"PRIVILEGE:REPORTS:1:VIEW":function(n){return"Raporty: Wskaźniki"},"PRIVILEGE:REPORTS:2:VIEW":function(n){return"Raporty: CLIP"},"PRIVILEGE:REPORTS:3:VIEW":function(n){return"Raporty: Wykorzystanie zasobów"},"PRIVILEGE:REPORTS:4:VIEW":function(n){return"Raporty: Operatorzy"},"PRIVILEGE:REPORTS:5:VIEW":function(n){return"Raporty: HR"},"PRIVILEGE:REPORTS:6:VIEW":function(n){return"Raporty: Magazyn"},"PRIVILEGE:REPORTS:7:VIEW":function(n){return"Raporty: Przestoje w obszarach"},"PRIVILEGE:REPORTS:8:VIEW":function(n){return"Raporty: Lean"},"PRIVILEGE:REPORTS:9:VIEW":function(n){return"Raporty: Planowane obciążenie linii"},"PRIVILEGE:XICONF:VIEW":function(n){return"Xiconf: przeglądanie"},"PRIVILEGE:XICONF:MANAGE":function(n){return"Xiconf: zarządzanie"},"PRIVILEGE:XICONF:NOTIFY":function(n){return"Xiconf: powiadamianie"},"PRIVILEGE:ICPO:VIEW":function(n){return"ICPO: przeglądanie"},"PRIVILEGE:ICPO:MANAGE":function(n){return"ICPO: zarządzanie"},"PRIVILEGE:PURCHASE_ORDERS:VIEW":function(n){return"Zamówienia: przeglądanie"},"PRIVILEGE:PURCHASE_ORDERS:MANAGE":function(n){return"Zamówienia: zarządzanie"},"PRIVILEGE:FACTORY_LAYOUT:MANAGE":function(n){return"Monitoring: zarządzanie"},"PRIVILEGE:VENDOR_NC12S:VIEW":function(n){return"Baza 12NC: przeglądanie"},"PRIVILEGE:VENDOR_NC12S:MANAGE":function(n){return"Baza 12NC: zarządzanie"},"PRIVILEGE:KAIZEN:MANAGE":function(n){return"ZPW: zarządzanie zgłoszeniami"},"PRIVILEGE:KAIZEN:DICTIONARIES:VIEW":function(n){return"ZPW/Usprawnienia: przeglądanie słowników"},"PRIVILEGE:KAIZEN:DICTIONARIES:MANAGE":function(n){return"ZPW/Usprawnienia: zarządzanie słownikami"},"PRIVILEGE:SUGGESTIONS:MANAGE":function(n){return"Usprawnienia: zarządzanie zgłoszeniami"},"PRIVILEGE:OPERATOR:ACTIVATE":function(n){return"Operator WMES: aktywacja klientów"},"PRIVILEGE:DOCUMENTS:VIEW":function(n){return"Dokumenty WMES: przeglądanie"},"PRIVILEGE:DOCUMENTS:MANAGE":function(n){return"Dokumenty WMES: zarządzanie"},"PRIVILEGE:DOCUMENTS:ACTIVATE":function(n){return"Dokumenty WMES: aktywacja klientów"},"PRIVILEGE:OPINION_SURVEYS:MANAGE":function(n){return"Badanie Opinia: zarządzanie"},"PRIVILEGE:ISA:VIEW":function(n){return"Pola odkładcze: przeglądanie"},"PRIVILEGE:ISA:MANAGE":function(n){return"Pola odkładcze: zarządzanie"},"PRIVILEGE:ISA:WHMAN":function(n){return"Pola odkładcze: magazynier"},"PRIVILEGE:QI:INSPECTOR":function(n){return"Inspekcja Jakości: inspektor"},"PRIVILEGE:QI:SPECIALIST":function(n){return"Inspekcja Jakości: specjalista"},"PRIVILEGE:QI:RESULTS:VIEW":function(n){return"Inspekcja Jakości: przeglądanie wyników"},"PRIVILEGE:QI:RESULTS:MANAGE":function(n){return"Inspekcja Jakości: zarządzanie wynikami"},"PRIVILEGE:QI:DICTIONARIES:VIEW":function(n){return"Inspekcja Jakości: przeglądanie słowników"},"PRIVILEGE:QI:DICTIONARIES:MANAGE":function(n){return"Inspekcja Jakości: zarządzanie słownikami"},"PRIVILEGE:PSCS:VIEW":function(n){return"PSCS: przeglądanie"},"PRIVILEGE:PSCS:MANAGE":function(n){return"PSCS: zarządzanie"},"PRIVILEGE:D8:VIEW":function(n){return"8D: przeglądanie zgłoszeń"},"PRIVILEGE:D8:MANAGE":function(n){return"8D: zarządzanie zgłoszeniami"},"PRIVILEGE:D8:LEADER":function(n){return"8D: lider"},"PRIVILEGE:D8:DICTIONARIES:VIEW":function(n){return"8D: przeglądanie słowników"},"PRIVILEGE:D8:DICTIONARIES:MANAGE":function(n){return"8D: zarządzanie słownikami"},"PRIVILEGE:MOR:MANAGE":function(n){return"Matryca odpowiedzialności: zarządzanie"},"PRIVILEGE:MOR:MANAGE:USERS":function(n){return"Matryca odpowiedzialności: edycja osób"},"PRIVILEGE:PAINT_SHOP:VIEW":function(n){return"Malarnia: przeglądanie"},"PRIVILEGE:PAINT_SHOP:MANAGE":function(n){return"Malarnia: zarządzanie"},"PRIVILEGE:PAINT_SHOP:PAINTER":function(n){return"Malarnia: malarz"},"PRIVILEGE:PAINT_SHOP:DROP_ZONES":function(n){return"Malarnia: zmiana drop zone"},"PRIVILEGE:KANBAN:VIEW":function(n){return"Baza Kanban: przeglądanie"},"PRIVILEGE:KANBAN:MANAGE":function(n){return"Baza Kanban: zarządzanie"},"PRIVILEGE:KANBAN:PRINT":function(n){return"Baza Kanban: drukowanie"},"PRIVILEGE:PFEP:VIEW":function(n){return"Baza PFEP: przeglądanie"},"PRIVILEGE:PFEP:MANAGE":function(n){return"Baza PFEP: zarządzanie"},"select2:placeholder":function(n){return"Szukaj po nazwisku lub nr kadrowym..."},"select2:users:system":function(n){return"System"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Logowanie do systemu"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Resetowanie hasła"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"Nowe hasło"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Resetuj hasło"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:LINK:RESET":function(n){return"Zapomniałeś hasła?"},"LOG_IN_FORM:LINK:OFFICE365":function(n){return"Zaloguj się za pomocą konta "+e.v(n,"OFFICE365_TENANT")},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"["+e.v(n,"APP_NAME")+"] Reset hasła"},"LOG_IN_FORM:RESET:TEXT":function(n){return"Otrzymaliśmy żądanie zresetowania hasła do Twojego konta w systemie "+e.v(n,"APP_NAME")+".\n\nAby potwierdzić zmianę hasła, kliknij poniższy odnośnik:\n"+e.v(n,"resetUrl")+"\n\nOdnośnik aktywny będzie tylko przez 24 godziny. Po tym czasie możesz wygenerować nowe żądanie wchodząc do systemu: "+e.v(n,"appUrl")+"\n\nJeżeli nie chcesz zmianiać swojego hasła, zignoruj tego e-maila.\n\nW razie jakichkolwiek problemów skonsultuj się ze swoim przełożonym lub administratorem systemu."},"LOG_IN_FORM:RESET:MSG:NOT_FOUND":function(n){return"Użytkownik o podanym loginie nie istnieje."},"LOG_IN_FORM:RESET:MSG:INVALID_EMAIL":function(n){return"Użytkownik nie ma ustawionego adresu e-mail."},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Nie udało się zresetować hasła."},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Sprawdź swojego e-maila!"},"LOG_IN_FORM:UNKNOWN":function(n){return"Nierozpoznany login!"},"settings:tab:presence":function(n){return"Kontrola dostępu"},"settings:presence:hardware":function(n){return"Sprzęt"},"anonymize:title":function(n){return"Anonimizacja użytkownika"},"anonymize:message":function(n){return"<p>Czy na pewno chcesz zanonimizować wybranego użytkownika?</p><p>Konto użytkownika zostanie dezaktywowane, a dane identyfikacyjne usunięte z całej bazy danych.</p><p><strong>Ta operacja jest nieodwracalna!</strong></p>"},"anonymize:yes":function(n){return"Anonimizuj użytkownika"},"anonymize:no":function(n){return"Anuluj"},"anonymize:started":function(n){return"Proces anonimizacji rozpoczęty..."}}});