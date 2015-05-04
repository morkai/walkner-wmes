define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[i](n[t]-e),t in u?u[t]:u.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{TITLE:function(){return"Wannabe MES"},"MSG:LOADING":function(){return"Ładowanie..."},"MSG:LOADING_FAILURE":function(){return"Ładowanie nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie nie powiodło się :("},"MSG:LOG_OUT:FAILURE":function(){return"Wylogowanie nie powiodło się :("},"MSG:LOG_OUT:SUCCESS":function(){return"Zostałeś wylogowany!"},"PAGE_ACTION:filter":function(){return"Filtruj"},"LIST:COLUMN:actions":function(){return"Akcje"},"LIST:NO_DATA":function(){return"Brak danych."},"LIST:NO_DATA:cell":function(){return"brak danych"},"LIST:ACTION:viewDetails":function(){return"Pokaż szczegóły"},"LIST:ACTION:edit":function(){return"Edytuj"},"LIST:ACTION:delete":function(){return"Usuń"},"LIST:ACTION:print":function(){return"Drukuj"},"BREADCRUMBS:edit":function(){return"Edycja"},"BREADCRUMBS:delete":function(){return"Usuwanie"},"BREADCRUMBS:error":function(n){return"Błąd "+r.v(n,"code")+": "+r.s(n,"codeStr",{e401:"nieautoryzowany dostęp",e404:"nie znaleziono",other:"nieprawidłowe zapytanie"})},"ERROR:400":function(){return"Żądanie nie może być obsłużone z powodu błędnej składni zapytania :("},"ERROR:401":function(){return"Niestety, ale nie masz wystarczających uprawnień do wykonania żądanej akcji :("},"ERROR:404":function(){return"Wybrana strona nie istnieje :("},"PAGINATION:FIRST_PAGE":function(){return"Pierwsza strona"},"PAGINATION:PREV_PAGE":function(){return"Poprzednia strona"},"PAGINATION:NEXT_PAGE":function(){return"Następna strona"},"PAGINATION:LAST_PAGE":function(){return"Ostatnia strona"},"LOG_IN_FORM:DIALOG_TITLE":function(){return"Logowanie do systemu"},"LOG_IN_FORM:LABEL:LOGIN":function(){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(){return"Hasło"},"LOG_IN_FORM:LABEL:SUBMIT":function(){return"Zaloguj się"},"BOOL:true":function(){return"Tak"},"BOOL:false":function(){return"Nie"},"BOOL:null":function(){return"Nie dotyczy"},"#":function(){return"Lp."},GUEST_USER_NAME:function(){return"Gość"},"NAVBAR:TOGGLE":function(){return"Pokaż menu"},"NAVBAR:DASHBOARD":function(){return"Pulpit"},"NAVBAR:EVENTS":function(){return"Zdarzenia"},"NAVBAR:ORDERS":function(){return"Zlecenia"},"NAVBAR:MECH_ORDERS":function(){return"Zlecenia działu mechanicznego"},"NAVBAR:OTHER_ORDERS":function(){return"Zlecenia reszty działów"},"NAVBAR:EMPTY_ORDERS":function(){return"Puste zlecenia"},"NAVBAR:LINES":function(){return"Linie produkcyjne"},"NAVBAR:USERS":function(){return"Użytkownicy"},"NAVBAR:MY_ACCOUNT":function(){return"Moje konto"},"NAVBAR:UI_LOCALE":function(){return"Lokalizacja UI"},"NAVBAR:LOCALE_PL":function(){return"Po polsku"},"NAVBAR:LOCALE_US":function(){return"Po angielsku"},"NAVBAR:LOG_IN":function(){return"Zaloguj się"},"NAVBAR:LOG_OUT":function(){return"Wyloguj się"},"NAVBAR:DICTIONARIES":function(){return"Słowniki"},"NAVBAR:ORDER_STATUSES":function(){return"Statusy zleceń"},"NAVBAR:DELAY_REASONS":function(){return"Powody opóźnień"},"NAVBAR:DOWNTIME_REASONS":function(){return"Powody przestojów"},"NAVBAR:LOSS_REASONS":function(){return"Powody strat materiałowych"},"NAVBAR:AORS":function(){return"Obszary odpowiedzialności"},"NAVBAR:WORK_CENTERS":function(){return"WorkCentra"},"NAVBAR:COMPANIES":function(){return"Firmy"},"NAVBAR:DIVISIONS":function(){return"Wydziały"},"NAVBAR:SUBDIVISIONS":function(){return"Działy"},"NAVBAR:MRP_CONTROLLERS":function(){return"Kontrolery MRP"},"NAVBAR:PROD_FUNCTIONS":function(){return"Funkcje na produkcji"},"NAVBAR:PROD_FLOWS":function(){return"Przepływy"},"NAVBAR:PROD_TASKS":function(){return"Zadania produkcyjne"},"NAVBAR:PROD_LINES":function(){return"Linie produkcyjne"},"NAVBAR:HOURLY_PLANS":function(){return"Plany godzinowe"},"NAVBAR:FTE":function(){return"FTE"},"NAVBAR:FTE:MASTER":function(){return"Produkcja"},"NAVBAR:FTE:MASTER:LIST":function(){return"Lista wpisów"},"NAVBAR:FTE:MASTER:CURRENT":function(){return"Przydzielanie zasobów"},"NAVBAR:FTE:LEADER":function(){return"Magazyn"},"NAVBAR:FTE:LEADER:LIST":function(){return"Lista wpisów"},"NAVBAR:FTE:LEADER:CURRENT":function(){return"Przydzielanie zasobów"},"NAVBAR:VIS":function(){return"Wizualizacja"},"NAVBAR:VIS:STRUCTURE":function(){return"Struktura organizacyjna"},"NAVBAR:PRESS_WORKSHEETS":function(){return"Karty pracy"},"NAVBAR:REPORTS":function(){return"Raporty"},"NAVBAR:REPORTS:1":function(){return"Wskaźniki"},"NAVBAR:REPORTS:2":function(){return"CLIP"},"NAVBAR:REPORTS:3":function(){return"Wykorzystanie zasobów"},"NAVBAR:REPORTS:4":function(){return"Operatorzy"},"NAVBAR:REPORTS:5":function(){return"HR"},"NAVBAR:REPORTS:6":function(){return"Magazyn"},"NAVBAR:PROD":function(){return"Produkcja"},"NAVBAR:PROD:DATA":function(){return"Dane produkcyjne"},"NAVBAR:PROD:LOG_ENTRIES":function(){return"Historia operacji"},"NAVBAR:PROD:SHIFTS":function(){return"Zmiany"},"NAVBAR:PROD:SHIFT_ORDERS":function(){return"Zlecenia"},"NAVBAR:PROD:DOWNTIMES":function(){return"Przestoje"},"NAVBAR:PROGRAMMING":function(){return"Programowanie"},"NAVBAR:XICONF":function(){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:PROGRAMS":function(){return"Programy"},"NAVBAR:XICONF:ORDERS":function(){return"Zlecenia"},"NAVBAR:XICONF:RESULTS":function(){return"Historia wyników"},"NAVBAR:XICONF:CLIENTS":function(){return"Klienci"},"NAVBAR:ICPO":function(){return"ICPO <em>(GPRS)</em>"},"NAVBAR:ICPO:RESULTS":function(){return"Historia wyników"},"NAVBAR:VENDORS":function(){return"Dostawcy"},"NAVBAR:PURCHASE_ORDERS":function(){return"Zamówienia"},"NAVBAR:MONITORING":function(){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(){return"Układ fabryki"},"NAVBAR:MONITORING:LIST":function(){return"Lista linii produkcyjnych"},"NAVBAR:VENDOR_NC12S":function(){return"Baza 12NC"},"NAVBAR:LICENSES":function(){return"Licencje"},"NAVBAR:KAIZEN":function(){return"Usprawnienia"},"NAVBAR:KAIZEN:ORDERS":function(){return"Zlecenia"},"NAVBAR:KAIZEN:NEAR_MISSES":function(){return"ZPW"},"NAVBAR:KAIZEN:NEAR_MISSES:TITLE":function(){return"Zdarzenia potencjalnie wypadkowe"},"NAVBAR:KAIZEN:SUGGESTIONS":function(){return"Sugestie"},"NAVBAR:KAIZEN:KAIZENS":function(){return"Kaizeny"},"NAVBAR:KAIZEN:DICTIONARIES":function(){return"Słowniki"},"NAVBAR:KAIZEN:SECTIONS":function(){return"Działy"},"NAVBAR:KAIZEN:AREAS":function(){return"Obszary"},"NAVBAR:KAIZEN:CATEGORIES":function(){return"Kategorie"},"NAVBAR:KAIZEN:CAUSES":function(){return"Przyczyny"},"NAVBAR:KAIZEN:RISKS":function(){return"Rodzaje ryzyka"},"ACTION_FORM:BUTTON":function(){return"Wykonaj akcję"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń"},"ACTION_FORM:BUTTON:cancel":function(){return"Anuluj"},"ACTION_FORM:MESSAGE":function(){return"Czy na pewno chcesz wykonać żądaną akcję?"},"ACTION_FORM:MESSAGE:failure":function(){return"Wykonywanie akcji nie powiodło się :("},"ORG_UNIT:division":function(){return"Wydział"},"ORG_UNIT:subdivision":function(){return"Dział"},"ORG_UNIT:mrpController":function(){return"Kontroler MRP"},"ORG_UNIT:prodFlow":function(){return"Przepływ"},"ORG_UNIT:workCenter":function(){return"WorkCenter"},"ORG_UNIT:prodLine":function(){return"Linia montażowa"},SHIFT:function(n){return r.v(n,"date")+", "+r.v(n,"shift")},"SHIFT:1":function(){return"I"},"SHIFT:2":function(){return"II"},"SHIFT:3":function(){return"III"},"SHIFT:0":function(){return"Dowolna"},QUARTER:function(n){return r.v(n,"quarter")+" kwartał "+r.v(n,"year")},"QUARTER:1":function(){return"I"},"QUARTER:2":function(){return"II"},"QUARTER:3":function(){return"III"},"QUARTER:4":function(){return"IV"},"QUARTER:0":function(){return"Dowolny"},"highcharts:contextButtonTitle":function(){return"Menu kontekstowe wykresu"},"highcharts:downloadJPEG":function(){return"Zapisz jako JPEG"},"highcharts:downloadPDF":function(){return"Zapisz jako PDF"},"highcharts:downloadPNG":function(){return"Zapisz jako PNG"},"highcharts:downloadSVG":function(){return"Zapisz jako SVG"},"highcharts:downloadCSV":function(){return"Zapisz jako CSV"},"highcharts:printChart":function(){return"Drukuj wykres"},"highcharts:decimalPoint":function(){return","},"highcharts:thousandsSep":function(){return" "},"highcharts:noData":function(){return"Brak danych :("},"highcharts:resetZoom":function(){return"1:1"},"highcharts:resetZoomTitle":function(){return"Zresetuj przybliżenie"},"highcharts:loading":function(){return"Ładowanie..."},"highcharts:months":function(){return"Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień"},"highcharts:shortMonths":function(){return"Sty_Lut_Mar_Kwi_Maj_Cze_Lip_Sie_Wrz_Paź_Lis_Gru"},"highcharts:weekdays":function(){return"Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota"},"dataTables:emptyTable":function(){return"Brak danych."},"dataTables:loadingRecords":function(){return"Ładowanie danych..."},"dataTables:loadingFailed":function(){return"Ładowanie danych nie powiodło się :("},"feedback:button:text":function(){return"Feedback"},"feedback:button:tooltip":function(){return"Zgłoś błędy, uwagi, opinie lub pomysły!"},"colorPicker:label":function(){return"Kolor"},"filter:date:from":function(){return"Od"},"filter:date:from:info":function(){return"Dane od godziny 06:00 wybranego dnia"},"filter:date:to":function(){return"Do"},"filter:date:to:info":function(){return"Dane do godziny 06:00 wybranego dnia"},"filter:submit":function(){return"Filtruj"},"filter:limit":function(){return"Limit"},"filter:show":function(){return"Pokaż filtr"},"filter:hide":function(){return"Ukryj filtr"},"placeholder:date":function(){return"rrrr-mm-dd"},"placeholder:time":function(){return"--:--"}}});