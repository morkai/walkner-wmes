define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[i](n[t]-e),t in o?o[t]:o.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"Ładowanie..."},"MSG:LOADING_FAILURE":function(n){return"Ładowanie nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie nie powiodło się :("},"MSG:LOG_OUT:FAILURE":function(n){return"Wylogowanie nie powiodło się :("},"MSG:LOG_OUT:SUCCESS":function(n){return"Zostałeś wylogowany!"},"PAGE_ACTION:filter":function(n){return"Filtruj"},"LIST:COLUMN:actions":function(n){return"Akcje"},"LIST:NO_DATA":function(n){return"Brak danych."},"LIST:NO_DATA:cell":function(n){return"brak danych"},"LIST:ACTION:viewDetails":function(n){return"Pokaż szczegóły"},"LIST:ACTION:edit":function(n){return"Edytuj"},"LIST:ACTION:delete":function(n){return"Usuń"},"LIST:ACTION:print":function(n){return"Drukuj"},"BREADCRUMBS:edit":function(n){return"Edycja"},"BREADCRUMBS:delete":function(n){return"Usuwanie"},"BREADCRUMBS:error":function(n){return"Błąd "+r.v(n,"code")+": "+r.s(n,"codeStr",{e401:"nieautoryzowany dostęp",e404:"nie znaleziono",other:"nieprawidłowe zapytanie"})},"ERROR:400":function(n){return"Żądanie nie może być obsłużone z powodu błędnej składni zapytania :("},"ERROR:401":function(n){return"Niestety, ale nie masz wystarczających uprawnień do wykonania żądanej akcji :("},"ERROR:404":function(n){return"Wybrana strona nie istnieje :("},"PAGINATION:FIRST_PAGE":function(n){return"Pierwsza strona"},"PAGINATION:PREV_PAGE":function(n){return"Poprzednia strona"},"PAGINATION:NEXT_PAGE":function(n){return"Następna strona"},"PAGINATION:LAST_PAGE":function(n){return"Ostatnia strona"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Logowanie do systemu"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Resetowanie hasła"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Hasło"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"Nowe hasło"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Resetuj hasło"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Zaloguj się"},"LOG_IN_FORM:LINK:RESET":function(n){return"Zapomniałeś hasła?"},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"Reset hasła w systemie WMES"},"LOG_IN_FORM:RESET:TEXT":function(n){return"Otrzymaliśmy żądanie zresetowania hasła do Twojego konta w systemie WMES.\n\nAby potwierdzić zmianę hasła, kliknij poniższy odnośnik:\n"+r.v(n,"resetUrl")+"\n\nOdnośnik aktywny będzie tylko przez 24 godziny. Po tym czasie możesz wygenerować nowe żądanie wchodząc do systemu: "+r.v(n,"appUrl")+"\n\nJeżeli nie chcesz zmianiać swojego hasła, zignoruj tego e-maila.\n\nW razie jakichkolwiek problemów skonsultuj się ze swoim przełożonym lub administratorem systemu."},"LOG_IN_FORM:RESET:MSG:NOT_FOUND":function(n){return"Użytkownik o podanym loginie nie istnieje :-("},"LOG_IN_FORM:RESET:MSG:INVALID_EMAIL":function(n){return"Użytkownik nie ma ustawionego adresu e-mail :-("},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Nie udało się zresetować hasła :-("},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Sprawdź swojego e-maila!"},"BOOL:true":function(n){return"Tak"},"BOOL:false":function(n){return"Nie"},"BOOL:null":function(n){return"Nie dotyczy"},"#":function(n){return"Lp."},GUEST_USER_NAME:function(n){return"Gość"},"NAVBAR:TOGGLE":function(n){return"Pokaż menu"},"NAVBAR:DASHBOARD":function(n){return"Pulpit"},"NAVBAR:EVENTS":function(n){return"Zdarzenia"},"NAVBAR:ORDERS":function(n){return"Zlecenia"},"NAVBAR:MECH_ORDERS":function(n){return"Zlecenia działu mechanicznego"},"NAVBAR:OTHER_ORDERS":function(n){return"Zlecenia reszty działów"},"NAVBAR:EMPTY_ORDERS":function(n){return"Puste zlecenia"},"NAVBAR:LINES":function(n){return"Linie produkcyjne"},"NAVBAR:USERS":function(n){return"Użytkownicy"},"NAVBAR:MY_ACCOUNT":function(n){return"Moje konto"},"NAVBAR:UI_LOCALE":function(n){return"Lokalizacja UI"},"NAVBAR:LOCALE_PL":function(n){return"Po polsku"},"NAVBAR:LOCALE_US":function(n){return"Po angielsku"},"NAVBAR:LOG_IN":function(n){return"Zaloguj się"},"NAVBAR:LOG_OUT":function(n){return"Wyloguj się"},"NAVBAR:DICTIONARIES":function(n){return"Słowniki"},"NAVBAR:ORDER_STATUSES":function(n){return"Statusy zleceń"},"NAVBAR:DELAY_REASONS":function(n){return"Powody opóźnień"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Powody przestojów"},"NAVBAR:LOSS_REASONS":function(n){return"Powody strat materiałowych"},"NAVBAR:AORS":function(n){return"Obszary odpowiedzialności"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCentra"},"NAVBAR:COMPANIES":function(n){return"Firmy"},"NAVBAR:DIVISIONS":function(n){return"Wydziały"},"NAVBAR:SUBDIVISIONS":function(n){return"Działy"},"NAVBAR:MRP_CONTROLLERS":function(n){return"Kontrolery MRP"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Funkcje"},"NAVBAR:PROD_FLOWS":function(n){return"Przepływy"},"NAVBAR:PROD_TASKS":function(n){return"Zadania produkcyjne"},"NAVBAR:PROD_LINES":function(n){return"Linie produkcyjne"},"NAVBAR:HOURLY_PLANS":function(n){return"Plany godzinowe"},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Produkcja"},"NAVBAR:FTE:MASTER:LIST":function(n){return"Lista wpisów"},"NAVBAR:FTE:MASTER:CURRENT":function(n){return"Przydzielanie zasobów"},"NAVBAR:FTE:LEADER":function(n){return"Inne"},"NAVBAR:FTE:LEADER:LIST":function(n){return"Lista wpisów"},"NAVBAR:FTE:LEADER:CURRENT":function(n){return"Przydzielanie zasobów"},"NAVBAR:VIS":function(n){return"Wizualizacja"},"NAVBAR:VIS:STRUCTURE":function(n){return"Struktura organizacyjna"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Karty pracy"},"NAVBAR:REPORTS":function(n){return"Raporty"},"NAVBAR:REPORTS:1":function(n){return"Wskaźniki"},"NAVBAR:REPORTS:2":function(n){return"CLIP"},"NAVBAR:REPORTS:3":function(n){return"Wykorzystanie zasobów"},"NAVBAR:REPORTS:4":function(n){return"Operatorzy"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Magazyn"},"NAVBAR:REPORTS:7":function(n){return"Przestoje w obszarach"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planowane obciążenie linii"},"NAVBAR:PROD":function(n){return"Produkcja"},"NAVBAR:PROD:DATA":function(n){return"Dane produkcyjne"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Historia operacji"},"NAVBAR:PROD:SHIFTS":function(n){return"Zmiany"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Zlecenia"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Przestoje"},"NAVBAR:PROD:ALERTS":function(n){return"Alarmy"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Żądania zmian"},"NAVBAR:PROGRAMMING":function(n){return"Baza testów"},"NAVBAR:XICONF":function(n){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:PROGRAMS":function(n){return"Programy"},"NAVBAR:XICONF:ORDERS":function(n){return"Zlecenia"},"NAVBAR:XICONF:RESULTS":function(n){return"Historia wyników"},"NAVBAR:XICONF:CLIENTS":function(n){return"Klienci"},"NAVBAR:DOCUMENTS":function(n){return"Dokumentacja"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Klienci"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:VENDORS":function(n){return"Dostawcy"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Zamówienia"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Układ fabryki"},"NAVBAR:MONITORING:LIST":function(n){return"Lista linii produkcyjnych"},"NAVBAR:VENDOR_NC12S":function(n){return"Baza 12NC"},"NAVBAR:LICENSES":function(n){return"Licencje"},"NAVBAR:OPINION:main":function(n){return"Badanie Opinia"},"NAVBAR:OPINION:current":function(n){return"Aktualne badanie"},"NAVBAR:OPINION:report":function(n){return"Raport"},"NAVBAR:OPINION:actions":function(n){return"Akcje naprawcze"},"NAVBAR:OPINION:responses":function(n){return"Odpowiedzi"},"NAVBAR:OPINION:scanning":function(n){return"Skanowanie"},"NAVBAR:OPINION:scanTemplates":function(n){return"Szablony"},"NAVBAR:OPINION:omrResults":function(n){return"Wyniki"},"NAVBAR:OPINION:dictionaries":function(n){return"Słowniki"},"NAVBAR:OPINION:surveys":function(n){return"Badania"},"NAVBAR:OPINION:employers":function(n){return"Pracodawcy"},"NAVBAR:OPINION:divisions":function(n){return"Wydziały"},"NAVBAR:OPINION:questions":function(n){return"Pytania"},"NAVBAR:KAIZEN:main":function(n){return"ZPW"},"NAVBAR:KAIZEN:orders":function(n){return"Zgłoszenia"},"NAVBAR:KAIZEN:all":function(n){return"Wszystkie"},"NAVBAR:KAIZEN:open":function(n){return"Tylko otwarte"},"NAVBAR:KAIZEN:mine":function(n){return"Tylko moje"},"NAVBAR:KAIZEN:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:KAIZEN:reports":function(n){return"Raporty"},"NAVBAR:KAIZEN:reports:count":function(n){return"Ilość zgłoszeń"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Słowniki"},"NAVBAR:KAIZEN:sections":function(n){return"Działy"},"NAVBAR:KAIZEN:areas":function(n){return"Miejsca zdarzeń"},"NAVBAR:KAIZEN:categories":function(n){return"Kategorie"},"NAVBAR:KAIZEN:causes":function(n){return"Przyczyny"},"NAVBAR:KAIZEN:risks":function(n){return"Rodzaje ryzyka"},"NAVBAR:KAIZEN:help":function(n){return"Pomoc"},"NAVBAR:SUGGESTIONS:main":function(n){return"Usprawnienia"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Zgłoszenia"},"NAVBAR:SUGGESTIONS:all":function(n){return"Wszystkie"},"NAVBAR:SUGGESTIONS:open":function(n){return"Tylko otwarte"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Tylko moje"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Raporty"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Ilość zgłoszeń"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Słowniki"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Działy"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Kategorie"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Rodziny produktów"},"NAVBAR:SUGGESTIONS:help":function(n){return"Pomoc"},"ACTION_FORM:BUTTON":function(n){return"Wykonaj akcję"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń"},"ACTION_FORM:BUTTON:cancel":function(n){return"Anuluj"},"ACTION_FORM:MESSAGE":function(n){return"Czy na pewno chcesz wykonać żądaną akcję?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Wykonywanie akcji nie powiodło się :("},"ORG_UNIT:division":function(n){return"Wydział"},"ORG_UNIT:subdivision":function(n){return"Dział"},"ORG_UNIT:mrpController":function(n){return"Kontroler MRP"},"ORG_UNIT:prodFlow":function(n){return"Przepływ"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Linia montażowa"},SHIFT:function(n){return r.v(n,"date")+", "+r.v(n,"shift")},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Dowolna"},QUARTER:function(n){return r.v(n,"quarter")+" kwartał "+r.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Dowolny"},"highcharts:contextButtonTitle":function(n){return"Menu kontekstowe wykresu"},"highcharts:downloadJPEG":function(n){return"Zapisz jako JPEG"},"highcharts:downloadPDF":function(n){return"Zapisz jako PDF"},"highcharts:downloadPNG":function(n){return"Zapisz jako PNG"},"highcharts:downloadSVG":function(n){return"Zapisz jako SVG"},"highcharts:downloadCSV":function(n){return"Zapisz jako CSV"},"highcharts:printChart":function(n){return"Drukuj wykres"},"highcharts:decimalPoint":function(n){return","},"highcharts:thousandsSep":function(n){return" "},"highcharts:noData":function(n){return"Brak danych :("},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Zresetuj przybliżenie"},"highcharts:loading":function(n){return"Ładowanie..."},"highcharts:months":function(n){return"Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień"},"highcharts:shortMonths":function(n){return"Sty_Lut_Mar_Kwi_Maj_Cze_Lip_Sie_Wrz_Paź_Lis_Gru"},"highcharts:weekdays":function(n){return"Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota"},"dataTables:emptyTable":function(n){return"Brak danych."},"dataTables:loadingRecords":function(n){return"Ładowanie danych..."},"dataTables:loadingFailed":function(n){return"Ładowanie danych nie powiodło się :("},"feedback:button:text":function(n){return"Feedback"},"feedback:button:tooltip":function(n){return"Zgłoś błędy, uwagi, opinie lub pomysły!"},"colorPicker:label":function(n){return"Kolor"},"filter:date:from":function(n){return"Od"},"filter:date:from:info":function(n){return"Dane od godziny 06:00 wybranego dnia"},"filter:date:to":function(n){return"Do"},"filter:date:to:info":function(n){return"Dane do godziny 06:00 wybranego dnia"},"filter:shift":function(n){return"Zmiana"},"filter:submit":function(n){return"Filtruj"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Pokaż filtr"},"filter:hide":function(n){return"Ukryj filtr"},"placeholder:date":function(n){return"rrrr-mm-dd"},"placeholder:time":function(n){return"--:--"}}});