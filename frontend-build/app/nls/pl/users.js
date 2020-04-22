define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,i,t,o){return r.c(n,e),n[e]in o?o[n[e]]:(e=r.lc[t](n[e]-i))in o?o[e]:o.other},s:function(n,e,i){return r.c(n,e),n[e]in i?i[n[e]]:i.other}};return{"BREADCRUMB:browse":function(n){return"Użytkownicy"},"BREADCRUMB:myAccount":function(n){return"Moje konto"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"breadcrumbs:logIn":function(n){return"Logowanie do systemu"},"MSG:SYNCED":function(n){return"Użytkownicy zostali zsynchronizowani."},"MSG:SYNC_FAILURE":function(n){return"Synchronizacja użytkowników nie powiodła się."},"PAGE_ACTION:editAccount":function(n){return"Edytuj konto"},"PAGE_ACTION:sync":function(n){return"Synchronizuj z bazą KD"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:anonymize":function(n){return"Anonimizuj"},"PANEL:TITLE:details:basic":function(n){return"Podstawowe informacje"},"PANEL:TITLE:details:contact":function(n){return"Dane kontaktowe"},"PANEL:TITLE:details:extra":function(n){return"Dodatkowe informacje"},"PANEL:TITLE:details:privileges":function(n){return"Uprawnienia"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania użytkownika"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji użytkownika"},"filter:submit":function(n){return"Filtruj"},"PROPERTY:login":function(n){return"Login"},"PROPERTY:password":function(n){return"Hasło"},"PROPERTY:newPassword":function(n){return"Nowe hasło"},"PROPERTY:password2":function(n){return"Potwierdzenie hasła"},"PROPERTY:email":function(n){return"Adres e-mail"},"PROPERTY:privileges":function(n){return"Uprawnienia"},"PROPERTY:prodFunction":function(n){return"Funkcja na produkcji"},"PROPERTY:aors":function(n){return"Obszary odpowiedzialności"},"PROPERTY:company":function(n){return"Firma"},"PROPERTY:kdId":function(n){return"ID (KD)"},"PROPERTY:kdDivision":function(n){return"Wydział (KD)"},"PROPERTY:personellId":function(n){return"Nr kadrowy"},"PROPERTY:card":function(n){return"Nr karty (KD)"},"PROPERTY:cardUid":function(n){return"ID karty"},"PROPERTY:name":function(n){return"Imię i nazwisko"},"PROPERTY:firstName":function(n){return"Imię"},"PROPERTY:lastName":function(n){return"Nazwisko"},"PROPERTY:registerDate":function(n){return"Data rejestracji"},"PROPERTY:kdPosition":function(n){return"Stanowisko (KD)"},"PROPERTY:active":function(n){return"Konto aktywne?"},"PROPERTY:orgUnit":function(n){return"Jednostka organizacyjna"},"PROPERTY:vendor":function(n){return"Dostawca"},"PROPERTY:gender":function(n){return"Płeć"},"PROPERTY:mobile":function(n){return"Telefony komórkowe"},"PROPERTY:mrps":function(n){return"Moje MRP"},"PROPERTY:notifications":function(n){return"Powiadomienia"},"PROPERTY:apiKey":function(n){return"Klucz API"},"active:true":function(n){return"Tak"},"active:false":function(n){return"Nie"},"gender:female":function(n){return"Żeńska"},"gender:male":function(n){return"Męska"},"FORM:ERROR:passwordMismatch":function(n){return"Podane hasła nie pasują do siebie."},"FORM:ERROR:LOGIN_USED":function(n){return"Podany login jest już wykorzystany w innym aktywnym koncie."},"FORM:HELP:password":function(n){return"Podaj hasła tylko wtedy, gdy chcesz je zmienić."},"FORM:mobile:from":function(n){return"dostępny od"},"FORM:mobile:to":function(n){return"do"},"FORM:mobile:empty":function(n){return"Brak zdefiniowanych telefonów."},"FORM:mobile:item":function(n){return r.v(n,"number")+" od "+r.v(n,"fromTime")+" do "+r.v(n,"toTime")},"FORM:copyPrivileges:success":function(n){return"Uprawnienia skopiowane."},"NO_DATA:aors":function(n){return"Wszystkie"},"NO_DATA:company":function(n){return"Nieokreślona"},"NO_DATA:prodFunction":function(n){return"Nieokreślona"},"NO_DATA:vendor":function(n){return"Wszyscy"},"DETAILS:mobile:item":function(n){return r.v(n,"number")+" od "+r.v(n,"fromTime")+" do "+r.v(n,"toTime")},"PRIVILEGE:SUPER":function(n){return"Super administrator"},"PRIVILEGE:ORDERS:VIEW":function(n){return"Zlecenia: przeglądanie"},"PRIVILEGE:ORDERS:MANAGE":function(n){return"Zlecenia: zarządzanie"},"PRIVILEGE:ORDERS:COMMENT":function(n){return"Zlecenia: komentowanie"},"PRIVILEGE:EVENTS:VIEW":function(n){return"Zdarzenia: przeglądanie"},"PRIVILEGE:EVENTS:MANAGE":function(n){return"Zdarzenia: zarządzanie"},"PRIVILEGE:USERS:VIEW":function(n){return"Użytkownicy: przeglądanie"},"PRIVILEGE:USERS:MANAGE":function(n){return"Użytkownicy: zarządzanie"},"PRIVILEGE:DICTIONARIES:VIEW":function(n){return"Słowniki: przeglądanie"},"PRIVILEGE:DICTIONARIES:MANAGE":function(n){return"Słowniki: zarządzanie"},"PRIVILEGE:FTE:MASTER:VIEW":function(n){return"FTE (produkcja): przeglądanie"},"PRIVILEGE:FTE:MASTER:MANAGE":function(n){return"FTE (produkcja): zarządzanie"},"PRIVILEGE:FTE:MASTER:ALL":function(n){return"FTE (produkcja): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:LEADER:VIEW":function(n){return"FTE (inne): przeglądanie"},"PRIVILEGE:FTE:LEADER:MANAGE":function(n){return"FTE (inne): zarządzanie"},"PRIVILEGE:FTE:LEADER:ALL":function(n){return"FTE (inne): dostęp do wszystkich wydziałów"},"PRIVILEGE:FTE:WH:VIEW":function(n){return"FTE (magazyn): przeglądanie"},"PRIVILEGE:FTE:WH:MANAGE":function(n){return"FTE (magazyn): zarządzanie"},"PRIVILEGE:FTE:WH:ALL":function(n){return"FTE (magazyn): dostęp do wszystkich wydziałów"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(n){return"Plany godzinowe: przeglądanie"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(n){return"Plany godzinowe: zarządzanie"},"PRIVILEGE:HOURLY_PLANS:ALL":function(n){return"Plany godzinowe: dostęp do wszystkich wydziałów"},"PRIVILEGE:PLANNING:VIEW":function(n){return"Plany dzienne: przeglądanie"},"PRIVILEGE:PLANNING:MANAGE":function(n){return"Plany dzienne: zarządzanie"},"PRIVILEGE:PLANNING:PLANNER":function(n){return"Plany dzienne: planista"},"PRIVILEGE:PLANNING:WHMAN":function(n){return"Plany dzienne: magazynier"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(n){return"Przestoje: przeglądanie"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(n){return"Przestoje: potwierdzanie"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:VIEW":function(n){return"Alarmy: przeglądanie"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:MANAGE":function(n){return"Alarmy: zarządzanie"},"PRIVILEGE:PROD_DOWNTIMES:ALL":function(n){return"Przestoje: dostęp do wszystkich wydziałów"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(n){return"Karty pracy: przeglądanie"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(n){return"Karty pracy: dodawanie"},"PRIVILEGE:PROD_DATA:VIEW":function(n){return"Dane produkcyjne: przeglądanie"},"PRIVILEGE:PROD_DATA:VIEW:EFF":function(n){return"Dane produkcyjne: wydajność"},"PRIVILEGE:PROD_DATA:MANAGE":function(n){return"Dane produkcyjne: zarządzanie"},"PRIVILEGE:PROD_DATA:MANAGE:SPIGOT_ONLY":function(n){return"Tylko zmiana linii ze spigotem"},"PRIVILEGE:PROD_DATA:CHANGES:REQUEST":function(n){return"Dane produkcyjne: żądanie zmian"},"PRIVILEGE:PROD_DATA:CHANGES:MANAGE":function(n){return"Dane produkcyjne: zatwierdzanie zmian"},"PRIVILEGE:REPORTS:VIEW":function(n){return"Raporty: przeglądanie wszystkich"},"PRIVILEGE:REPORTS:MANAGE":function(n){return"Raporty: zarządzanie"},"PRIVILEGE:REPORTS:1:VIEW":function(n){return"Raporty: Wskaźniki"},"PRIVILEGE:REPORTS:2:VIEW":function(n){return"Raporty: CLIP"},"PRIVILEGE:REPORTS:3:VIEW":function(n){return"Raporty: Wykorzystanie zasobów"},"PRIVILEGE:REPORTS:4:VIEW":function(n){return"Raporty: Operatorzy"},"PRIVILEGE:REPORTS:5:VIEW":function(n){return"Raporty: HR"},"PRIVILEGE:REPORTS:6:VIEW":function(n){return"Raporty: Magazyn"},"PRIVILEGE:REPORTS:7:VIEW":function(n){return"Raporty: Przestoje w obszarach"},"PRIVILEGE:REPORTS:8:VIEW":function(n){return"Raporty: Lean"},"PRIVILEGE:REPORTS:9:VIEW":function(n){return"Raporty: Planowane obciążenie linii"},"PRIVILEGE:XICONF:VIEW":function(n){return"Xiconf: przeglądanie"},"PRIVILEGE:XICONF:MANAGE":function(n){return"Xiconf: zarządzanie"},"PRIVILEGE:XICONF:MANAGE:HID_LAMPS":function(n){return"Xiconf: Oprawy HID: zarządzanie"},"PRIVILEGE:XICONF:NOTIFY":function(n){return"Xiconf: powiadamianie"},"PRIVILEGE:ICPO:VIEW":function(n){return"ICPO: przeglądanie"},"PRIVILEGE:ICPO:MANAGE":function(n){return"ICPO: zarządzanie"},"PRIVILEGE:PURCHASE_ORDERS:VIEW":function(n){return"Zamówienia: przeglądanie"},"PRIVILEGE:PURCHASE_ORDERS:MANAGE":function(n){return"Zamówienia: zarządzanie"},"PRIVILEGE:FACTORY_LAYOUT:MANAGE":function(n){return"Monitoring: zarządzanie"},"PRIVILEGE:VENDOR_NC12S:VIEW":function(n){return"Baza 12NC: przeglądanie"},"PRIVILEGE:VENDOR_NC12S:MANAGE":function(n){return"Baza 12NC: zarządzanie"},"PRIVILEGE:KAIZEN:MANAGE":function(n){return"ZPW: zarządzanie zgłoszeniami"},"PRIVILEGE:KAIZEN:DICTIONARIES:VIEW":function(n){return"ZPW/Usprawnienia: przeglądanie słowników"},"PRIVILEGE:KAIZEN:DICTIONARIES:MANAGE":function(n){return"ZPW/Usprawnienia: zarządzanie słownikami"},"PRIVILEGE:SUGGESTIONS:MANAGE":function(n){return"Usprawnienia: zarządzanie zgłoszeniami"},"PRIVILEGE:OPERATOR:ACTIVATE":function(n){return"Aktywacja klientów"},"PRIVILEGE:OPERATOR:ORDER_UNLOCK":function(n){return"Operator WMES: odblokowywanie zlecenia"},"PRIVILEGE:DOCUMENTS:VIEW":function(n){return"Dokumenty WMES: przeglądanie"},"PRIVILEGE:DOCUMENTS:MANAGE":function(n){return"Dokumenty WMES: zarządzanie"},"PRIVILEGE:OPINION_SURVEYS:MANAGE":function(n){return"Badanie Opinia: zarządzanie"},"PRIVILEGE:ISA:VIEW":function(n){return"Pola odkładcze: przeglądanie"},"PRIVILEGE:ISA:MANAGE":function(n){return"Pola odkładcze: zarządzanie"},"PRIVILEGE:ISA:WHMAN":function(n){return"Pola odkładcze: magazynier"},"PRIVILEGE:QI:INSPECTOR":function(n){return"Inspekcja Jakości: inspektor"},"PRIVILEGE:QI:SPECIALIST":function(n){return"Inspekcja Jakości: specjalista"},"PRIVILEGE:QI:RESULTS:VIEW":function(n){return"Inspekcja Jakości: przeglądanie wyników"},"PRIVILEGE:QI:RESULTS:MANAGE":function(n){return"Inspekcja Jakości: zarządzanie wynikami"},"PRIVILEGE:QI:DICTIONARIES:VIEW":function(n){return"Inspekcja Jakości: przeglądanie słowników"},"PRIVILEGE:QI:DICTIONARIES:MANAGE":function(n){return"Inspekcja Jakości: zarządzanie słownikami"},"PRIVILEGE:PSCS:VIEW":function(n){return"PSCS: przeglądanie"},"PRIVILEGE:PSCS:MANAGE":function(n){return"PSCS: zarządzanie"},"PRIVILEGE:D8:VIEW":function(n){return"8D: przeglądanie zgłoszeń"},"PRIVILEGE:D8:MANAGE":function(n){return"8D: zarządzanie zgłoszeniami"},"PRIVILEGE:D8:LEADER":function(n){return"8D: lider"},"PRIVILEGE:D8:DICTIONARIES:VIEW":function(n){return"8D: przeglądanie słowników"},"PRIVILEGE:D8:DICTIONARIES:MANAGE":function(n){return"8D: zarządzanie słownikami"},"PRIVILEGE:MOR:MANAGE":function(n){return"Matryca odpowiedzialności: zarządzanie"},"PRIVILEGE:MOR:MANAGE:USERS":function(n){return"Matryca odpowiedzialności: edycja osób"},"PRIVILEGE:PAINT_SHOP:VIEW":function(n){return"Malarnia: przeglądanie"},"PRIVILEGE:PAINT_SHOP:MANAGE":function(n){return"Malarnia: zarządzanie"},"PRIVILEGE:PAINT_SHOP:PAINTER":function(n){return"Malarnia: operator"},"PRIVILEGE:PAINT_SHOP:DROP_ZONES":function(n){return"Malarnia: zmiana drop zone"},"PRIVILEGE:DRILLING:VIEW":function(n){return"Wiercenie: przeglądanie"},"PRIVILEGE:DRILLING:MANAGE":function(n){return"Wiercenie: zarządzanie"},"PRIVILEGE:DRILLING:DRILLER":function(n){return"Wiercenie: operator"},"PRIVILEGE:WIRING:VIEW":function(n){return"Przewody: przeglądanie"},"PRIVILEGE:WIRING:MANAGE":function(n){return"Przewody: zarządzanie"},"PRIVILEGE:WIRING:WIRER":function(n){return"Przewody: operator"},"PRIVILEGE:KANBAN:VIEW":function(n){return"Baza Kanban: przeglądanie"},"PRIVILEGE:KANBAN:MANAGE":function(n){return"Baza Kanban: zarządzanie"},"PRIVILEGE:KANBAN:PRINT":function(n){return"Baza Kanban: drukowanie"},"PRIVILEGE:PFEP:VIEW":function(n){return"Baza PFEP: przeglądanie"},"PRIVILEGE:PFEP:MANAGE":function(n){return"Baza PFEP: zarządzanie"},"PRIVILEGE:TOOLCAL:VIEW":function(n){return"Narzędzia pomiarowe: przeglądanie"},"PRIVILEGE:TOOLCAL:MANAGE":function(n){return"Narzędzia pomiarowe: zarządzanie"},"PRIVILEGE:TOOLCAL:DICTIONARIES:VIEW":function(n){return"Narzędzia pomiarowe: przeglądanie słowników"},"PRIVILEGE:TOOLCAL:DICTIONARIES:MANAGE":function(n){return"Narzędzia pomiarowe: zarządzanie słownikami"},"PRIVILEGE:FAP:MANAGE":function(n){return"FAP: zarządzanie"},"PRIVILEGE:WH:VIEW":function(n){return"Magazyn: przeglądanie"},"PRIVILEGE:WH:MANAGE":function(n){return"Magazyn: zarządzanie"},"PRIVILEGE:WH:MANAGE:USERS":function(n){return"Magazyn: zarządzanie użytkownikami"},"PRIVILEGE:WH:MANAGE:CARTS":function(n){return"Magazyn: zarządzanie wózkami"},"PRIVILEGE:WH:SOLVER":function(n){return"Magazyn: rozwiązywanie problemów"},"PRIVILEGE:LUMA2:VIEW":function(n){return"Luma2: przeglądanie"},"PRIVILEGE:LUMA2:MANAGE":function(n){return"Luma2: zarządzanie"},"PRIVILEGE:SNF:VIEW":function(n){return"SNF: przeglądanie"},"PRIVILEGE:SNF:MANAGE":function(n){return"SNF: zarządzanie"},"PRIVILEGE:TRW:VIEW":function(n){return"TRW: przeglądanie"},"PRIVILEGE:TRW:MANAGE":function(n){return"TRW: zarządzanie"},"PRIVILEGE:TRW:PROGRAM":function(n){return"TRW: programowanie"},"PRIVILEGE:LUCA:VIEW":function(n){return"Luca: przeglądanie"},"PRIVILEGE:LUCA:MANAGE":function(n){return"Luca: zarządzanie"},"PRIVILEGE:WMES:CLIENTS:VIEW":function(n){return"Klienci WMES: przeglądanie"},"PRIVILEGE:WMES:CLIENTS:MANAGE":function(n){return"Klienci WMES: zarządzanie"},"PRIVILEGE:CT:MANAGE:ORDER_GROUPS":function(n){return"Czas cyklu: zarządzanie grupami wyrobów"},"select2:placeholder":function(n){return"Szukaj po nazwisku lub nr kadrowym..."},"select2:users:system":function(n){return"System"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Logowanie do systemu"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Resetowanie hasła"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"Nowe hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD2":function(n){return"Potwierdź nowe hasło"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Resetuj hasło"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:LINK:RESET":function(n){return"Zapomniałeś hasła?"},"LOG_IN_FORM:LINK:OFFICE365":function(n){return"Zaloguj się za pomocą konta "+r.v(n,"OFFICE365_TENANT")},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"["+r.v(n,"APP_NAME")+"] Reset hasła"},"LOG_IN_FORM:RESET:TEXT":function(n){return"Otrzymaliśmy żądanie zresetowania hasła do Twojego konta w systemie "+r.v(n,"APP_NAME")+".\n\nAby potwierdzić zmianę hasła, kliknij poniższy odnośnik:\n"+r.v(n,"resetUrl")+"\n\nOdnośnik aktywny będzie tylko przez 24 godziny. Po tym czasie możesz wygenerować nowe żądanie wchodząc do systemu: "+r.v(n,"appUrl")+"\n\nJeżeli nie chcesz zmianiać swojego hasła, zignoruj tego e-maila.\n\nW razie jakichkolwiek problemów skonsultuj się ze swoim przełożonym lub administratorem systemu."},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Nie udało się zresetować hasła."},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Sprawdź swojego e-maila!"},"LOG_IN_FORM:MSG:NOT_FOUND":function(n){return"Użytkownik o podanym loginie nie istnieje."},"LOG_IN_FORM:MSG:INVALID_EMAIL":function(n){return"Użytkownik nie ma ustawionego adresu e-mail."},"LOG_IN_FORM:MSG:MANY_MATCHES":function(n){return"Znaleziono wielu użytkowników pasujących do podanego loginu!"},"LOG_IN_FORM:UNKNOWN":function(n){return"Nierozpoznany login!"},"LOG_IN_FORM:UNSAFE_PASSWORD":function(n){return"<p>Nie możesz się zalogować, ponieważ Twoje hasło jest takie samo jak login lub numer kadrowy.</p><p>Skorzystaj z poniższego formularza, aby ustawić nowe hasło dla Twojego konta. Przed użyciem nowego hasła musisz je aktywować klikając na odnośnik wysłany na adres e-mail przypisany do Twojego konta.</p><p>W razie problemów poinformuj swojego przełożonego.</p>"},"LOG_IN_FORM:PASSWORD_MISMATCH":function(n){return"Podane hasła nie pasują do siebie."},"settings:tab:presence":function(n){return"Kontrola dostępu"},"settings:presence:hardware":function(n){return"Sprzęt"},"anonymize:title":function(n){return"Anonimizacja użytkownika"},"anonymize:message":function(n){return"<p>Czy na pewno chcesz zanonimizować wybranego użytkownika?</p><p>Konto użytkownika zostanie dezaktywowane, a dane identyfikacyjne usunięte z całej bazy danych.</p><p><strong>Ta operacja jest nieodwracalna!</strong></p>"},"anonymize:yes":function(n){return"Anonimizuj użytkownika"},"anonymize:no":function(n){return"Anuluj"},"anonymize:started":function(n){return"Proces anonimizacji rozpoczęty..."},"preferences:fap_sms":function(n){return"Zawsze wysyłaj SMS o nowym zgłoszeniu FAP."},"preferences:fm24_sms":function(n){return"Wysyłaj SMS o nowym zgłoszeniu FM-24."},"preferences:fm24_email":function(n){return"Wysyłaj e-mail o nowym zgłoszeniu FM-24."}}});