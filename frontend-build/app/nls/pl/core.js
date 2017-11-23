define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[i](n[t]-e),t in o?o[t]:o.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"Ładowanie..."},"MSG:LOADING_FAILURE":function(n){return"Ładowanie nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie nie powiodło się :("},"MSG:SAVING":function(n){return"Zapisywanie..."},"MSG:SAVING_FAILURE":function(n){return"Zapisywanie nie powiodło się :("},"MSG:LOG_OUT:FAILURE":function(n){return"Wylogowanie nie powiodło się :("},"MSG:LOG_OUT:SUCCESS":function(n){return"Zostałeś wylogowany!"},"MSG:POPUP_BLOCKED":function(n){return"Wyskakujące okienko zostało zablokowane."},"PAGE_ACTION:filter":function(n){return"Filtruj"},"PAGE_ACTION:export:csv":function(n){return"Eksportuj do CSV"},"PAGE_ACTION:export:xlsx":function(n){return"Eksportuj do XLSX"},"LIST:COLUMN:actions":function(n){return"Akcje"},"LIST:NO_DATA":function(n){return"Brak danych."},"LIST:NO_DATA:cell":function(n){return""},"LIST:ACTION:viewDetails":function(n){return"Pokaż szczegóły"},"LIST:ACTION:edit":function(n){return"Edytuj"},"LIST:ACTION:delete":function(n){return"Usuń"},"LIST:ACTION:print":function(n){return"Drukuj"},"BREADCRUMBS:edit":function(n){return"Edycja"},"BREADCRUMBS:delete":function(n){return"Usuwanie"},"ERROR:notify:message":function(n){return"Kliknij tutaj, aby poinformować administratora o błędzie."},"ERROR:notify:success":function(n){return"Administrator został powiadomiony o błędzie!"},"ERROR:notify:failure":function(n){return"Nie udało się powiadomić administratora :("},"ERROR:notify:subject":function(n){return"[WMES] Błąd "+r.v(n,"code")+" od "+r.v(n,"user")},"ERROR:0:title":function(n){return"Błąd podczas ładowania"},"ERROR:0:message":function(n){return"Nieoczekiwany błąd podczas wykonywania żądania. Sprawdź, czy masz połączenie z siecią i <a href=# data-reload>załaduj ponownie stronę</a>."},"ERROR:400:title":function(n){return"Błąd 400: nieprawidłowe zapytanie"},"ERROR:400:message":function(n){return"Żądanie nie może być obsłużone przez serwer z powodu błędnej składni zapytania."},"ERROR:401:title":function(n){return"Błąd 401: nieautoryzowany dostęp"},"ERROR:401:message":function(n){return"Żądanie wymaga uwierzytelnienia. <a href='#login'>Kliknij tutaj, aby przejść do formularza logowania</a>."},"ERROR:403:title":function(n){return"Błąd 403: zabroniony"},"ERROR:403:message":function(n){return"Nie masz uprawnień do wykonania żądanej akcji."},"ERROR:403:guest:message":function(n){return"Nie masz uprawnień do wykonania żądanej akcji. <a href='#login'>Kliknij tutaj, aby przejść do formularza logowania</a>."},"ERROR:404:title":function(n){return"Błąd 404: nie znaleziono"},"ERROR:404:message":function(n){return"Wybrana strona nigdy nie istniała lub została usunięta."},"ERROR:500:title":function(n){return"Błąd 500: wewnętrzny błąd serwera"},"ERROR:500:message":function(n){return"Serwer napotkał niespodziewane trudności, które uniemożliwiły zrealizowanie żądania."},"ERROR:503:title":function(n){return"Błąd 503: usługa niedostępna"},"ERROR:503:message":function(n){return"Serwer nie jest w stanie w danej chwili zrealizować żądania ze względu na przeciążenie lub przerwę konserwacyjną."},"ERROR:504:title":function(n){return"Błąd 504: przekroczony czas bramy"},"ERROR:504:message":function(n){return"Serwer bramy nie otrzymał w ustalonym czasie odpowiedzi od nadrzędnego serwera."},"PAGINATION:FIRST_PAGE":function(n){return"Pierwsza strona"},"PAGINATION:PREV_PAGE":function(n){return"Poprzednia strona"},"PAGINATION:NEXT_PAGE":function(n){return"Następna strona"},"PAGINATION:LAST_PAGE":function(n){return"Ostatnia strona"},"BOOL:true":function(n){return"Tak"},"BOOL:false":function(n){return"Nie"},"BOOL:null":function(n){return"Nie dotyczy"},"#":function(n){return"Lp."},GUEST_USER_NAME:function(n){return"Gość"},"NAVBAR:TOGGLE":function(n){return"Pokaż menu"},"NAVBAR:DASHBOARD":function(n){return"Pulpit"},"NAVBAR:EVENTS":function(n){return"Zdarzenia"},"NAVBAR:ORDERS":function(n){return"Zlecenia"},"NAVBAR:MECH_ORDERS":function(n){return"Zlecenia działu mechanicznego"},"NAVBAR:OTHER_ORDERS":function(n){return"Zlecenia reszty działów"},"NAVBAR:EMPTY_ORDERS":function(n){return"Puste zlecenia WMES"},"NAVBAR:INVALID_ORDERS":function(n){return"Nieprawidłowe zlecenia IPT"},"NAVBAR:LINES":function(n){return"Linie produkcyjne"},"NAVBAR:USERS":function(n){return"Użytkownicy"},"NAVBAR:MY_ACCOUNT":function(n){return"Moje konto"},"NAVBAR:UI_LOCALE":function(n){return"Lokalizacja UI"},"NAVBAR:LOCALE_PL":function(n){return"Po polsku"},"NAVBAR:LOCALE_US":function(n){return"Po angielsku"},"NAVBAR:LOG_IN":function(n){return"Zaloguj się"},"NAVBAR:LOG_OUT":function(n){return"Wyloguj się"},"NAVBAR:DICTIONARIES":function(n){return"Słowniki"},"NAVBAR:ORDER_STATUSES":function(n){return"Statusy zleceń"},"NAVBAR:DELAY_REASONS":function(n){return"Powody opóźnień"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Powody przestojów"},"NAVBAR:LOSS_REASONS":function(n){return"Powody strat materiałowych"},"NAVBAR:AORS":function(n){return"Obszary odpowiedzialności"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCentra"},"NAVBAR:COMPANIES":function(n){return"Firmy"},"NAVBAR:DIVISIONS":function(n){return"Wydziały"},"NAVBAR:SUBDIVISIONS":function(n){return"Działy"},"NAVBAR:MRP_CONTROLLERS":function(n){return"Kontrolery MRP"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Funkcje"},"NAVBAR:PROD_FLOWS":function(n){return"Przepływy"},"NAVBAR:PROD_TASKS":function(n){return"Zadania produkcyjne"},"NAVBAR:PROD_LINES":function(n){return"Linie produkcyjne"},"NAVBAR:PLANNING:main":function(n){return"Planowanie"},"NAVBAR:PLANNING:hourly":function(n){return"Plany godzinowe"},"NAVBAR:PLANNING:daily":function(n){return"Plany dzienne"},"NAVBAR:PLANNING:paintShop":function(n){return"Malarnia"},"NAVBAR:PLANNING:all":function(n){return"Wszystkie"},"NAVBAR:PLANNING:0d":function(n){return"Na dzisiaj"},"NAVBAR:PLANNING:-1d":function(n){return"Na wczoraj"},"NAVBAR:PLANNING:1d":function(n){return"Na jutro"},"NAVBAR:PLANNING:2d":function(n){return"Na pojutrze"},"NAVBAR:PLANNING:2d:help":function(n){return"Plan dostępny około godziny 17:00."},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Produkcja"},"NAVBAR:FTE:LEADER":function(n){return"Inne"},"NAVBAR:FTE:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:VIS":function(n){return"Wizualizacja"},"NAVBAR:VIS:STRUCTURE":function(n){return"Struktura organizacyjna"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Karty pracy"},"NAVBAR:REPORTS":function(n){return"Raporty"},"NAVBAR:REPORTS:1":function(n){return"Wskaźniki"},"NAVBAR:REPORTS:2":function(n){return"CLIP"},"NAVBAR:REPORTS:3":function(n){return"Wykorzystanie zasobów"},"NAVBAR:REPORTS:4":function(n){return"Operatorzy"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Magazyn"},"NAVBAR:REPORTS:7":function(n){return"Przestoje w obszarach"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planowane obciążenie linii"},"NAVBAR:PROD":function(n){return"Produkcja"},"NAVBAR:PROD:DATA":function(n){return"Dane produkcyjne"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Historia operacji"},"NAVBAR:PROD:SHIFTS":function(n){return"Zmiany"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Zlecenia"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Przestoje"},"NAVBAR:PROD:ALERTS":function(n){return"Alarmy"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Żądania zmian"},"NAVBAR:PROD:SERIAL_NUMBERS":function(n){return"Numery seryjne"},"NAVBAR:PROD:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:PROGRAMMING":function(n){return"Baza testów"},"NAVBAR:XICONF":function(n){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:CLIENTS":function(n){return"Klienci"},"NAVBAR:XICONF:RESULTS":function(n){return"Wyniki"},"NAVBAR:XICONF:HISTORY":function(n){return"Historia"},"NAVBAR:XICONF:ORDERS":function(n){return"Zlecenia"},"NAVBAR:XICONF:DICTIONARIES":function(n){return"Słowniki"},"NAVBAR:XICONF:PROGRAMS":function(n){return"Programy"},"NAVBAR:XICONF:HID_LAMPS":function(n){return"Oprawy HID"},"NAVBAR:XICONF:COMPONENT_WEIGHTS":function(n){return"Wagi komponentów"},"NAVBAR:DOCUMENTS":function(n){return"Dokumentacja"},"NAVBAR:DOCUMENTS:TREE":function(n){return"Dokumenty"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Klienci"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:VENDORS":function(n){return"Dostawcy"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Zamówienia"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Układ fabryki"},"NAVBAR:MONITORING:LIST":function(n){return"Lista linii produkcyjnych"},"NAVBAR:VENDOR_NC12S":function(n){return"Baza 12NC"},"NAVBAR:LICENSES":function(n){return"Licencje"},"NAVBAR:ISA_PALLET_KINDS":function(n){return"Rodzaje palet"},"NAVBAR:ISA":function(n){return"Pola odkładcze"},"NAVBAR:OPINION:main":function(n){return"Badanie Opinia"},"NAVBAR:OPINION:current":function(n){return"Aktualne badanie"},"NAVBAR:OPINION:report":function(n){return"Raport"},"NAVBAR:OPINION:actions":function(n){return"Akcje naprawcze"},"NAVBAR:OPINION:responses":function(n){return"Odpowiedzi"},"NAVBAR:OPINION:scanning":function(n){return"Skanowanie"},"NAVBAR:OPINION:scanTemplates":function(n){return"Szablony"},"NAVBAR:OPINION:omrResults":function(n){return"Wyniki"},"NAVBAR:OPINION:dictionaries":function(n){return"Słowniki"},"NAVBAR:OPINION:surveys":function(n){return"Badania"},"NAVBAR:OPINION:employers":function(n){return"Pracodawcy"},"NAVBAR:OPINION:divisions":function(n){return"Wydziały"},"NAVBAR:OPINION:questions":function(n){return"Pytania"},"NAVBAR:KAIZEN:main":function(n){return"ZPW"},"NAVBAR:KAIZEN:orders":function(n){return"Zgłoszenia"},"NAVBAR:KAIZEN:all":function(n){return"Wszystkie"},"NAVBAR:KAIZEN:open":function(n){return"Tylko otwarte"},"NAVBAR:KAIZEN:mine":function(n){return"Tylko moje"},"NAVBAR:KAIZEN:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:KAIZEN:reports":function(n){return"Raporty"},"NAVBAR:KAIZEN:reports:count":function(n){return"Ilość zgłoszeń"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:KAIZEN:reports:engagement":function(n){return"Zaangażowanie"},"NAVBAR:KAIZEN:reports:observations":function(n){return"Obserwacje"},"NAVBAR:KAIZEN:reports:metrics":function(n){return"Wskaźniki"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Słowniki"},"NAVBAR:KAIZEN:sections":function(n){return"Działy"},"NAVBAR:KAIZEN:areas":function(n){return"Miejsca zdarzeń"},"NAVBAR:KAIZEN:categories":function(n){return"Kategorie"},"NAVBAR:KAIZEN:causes":function(n){return"Przyczyny"},"NAVBAR:KAIZEN:risks":function(n){return"Rodzaje ryzyka"},"NAVBAR:KAIZEN:behaviours":function(n){return"Zachowania"},"NAVBAR:KAIZEN:help":function(n){return"Pomoc"},"NAVBAR:KAIZEN:observations":function(n){return"Obserwacje"},"NAVBAR:KAIZEN:minutesForSafety":function(n){return"Minuty dla Bezpieczeństwa"},"NAVBAR:SUGGESTIONS:main":function(n){return"Usprawnienia"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Zgłoszenia"},"NAVBAR:SUGGESTIONS:all":function(n){return"Wszystkie"},"NAVBAR:SUGGESTIONS:open":function(n){return"Tylko otwarte"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Tylko moje"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Raporty"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Ilość zgłoszeń"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:SUGGESTIONS:reports:engagement":function(n){return"Zaangażowanie"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Słowniki"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Działy"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Kategorie"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Rodziny produktów"},"NAVBAR:SUGGESTIONS:help":function(n){return"Pomoc"},"NAVBAR:QI:main":function(n){return"Inspekcja Jakości"},"NAVBAR:QI:results":function(n){return"Wyniki"},"NAVBAR:QI:results:all":function(n){return"Wszystkie"},"NAVBAR:QI:results:good":function(n){return"Zgodne"},"NAVBAR:QI:results:bad":function(n){return"Niezgodne"},"NAVBAR:QI:reports":function(n){return"Raporty"},"NAVBAR:QI:reports:count":function(n){return"Ilości"},"NAVBAR:QI:reports:okRatio":function(n){return"% wyrobów zgodnych"},"NAVBAR:QI:reports:nokRatio":function(n){return"Jakość wyrobu gotowego"},"NAVBAR:QI:dictionaries":function(n){return"Słowniki"},"NAVBAR:QI:kinds":function(n){return"Rodzaje inspekcji"},"NAVBAR:QI:errorCategories":function(n){return"Kategorie błędów"},"NAVBAR:QI:faults":function(n){return"Wady"},"NAVBAR:QI:actionStatuses":function(n){return"Statusy akcji"},"NAVBAR:D8:main":function(n){return"8D"},"NAVBAR:D8:entries":function(n){return"Zgłoszenia"},"NAVBAR:D8:all":function(n){return"Wszystkie"},"NAVBAR:D8:open":function(n){return"Tylko otwarte"},"NAVBAR:D8:mine":function(n){return"Tylko moje"},"NAVBAR:D8:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:D8:dictionaries":function(n){return"Słowniki"},"NAVBAR:D8:areas":function(n){return"Obszary"},"NAVBAR:D8:entrySources":function(n){return"Źródła zgłoszeń"},"NAVBAR:D8:problemSources":function(n){return"Źródła problemów"},"NAVBAR:SEARCH:help":function(n){return"Szukaj wg nr zlecenia, 12NC lub daty."},"NAVBAR:SEARCH:empty":function(n){return"Brak wyników."},"NAVBAR:SEARCH:fullOrderNo":function(n){return"Zlecenie nr "+r.v(n,"orderNo")},"NAVBAR:SEARCH:partialOrderNo":function(n){return"Zlecenia nr "+r.v(n,"orderNo")+"..."},"NAVBAR:SEARCH:fullNc12":function(n){return"12NC "+r.v(n,"nc12")},"NAVBAR:SEARCH:partialNc12":function(n){return"12NC "+r.v(n,"nc12")+"..."},"NAVBAR:SEARCH:fullNc15":function(n){return"15NC "+r.v(n,"nc15")},"NAVBAR:SEARCH:sapDetails":function(n){return"szczegóły z SAP"},"NAVBAR:SEARCH:xiconfDetails":function(n){return"szczegóły z bazy testów"},"NAVBAR:SEARCH:xiconfResults":function(n){return"wyniki testów"},"NAVBAR:SEARCH:prodShiftOrders":function(n){return"lista z linii produkcyjnych"},"NAVBAR:SEARCH:prodShiftOrdersList":function(n){return"lista zleceń z linii produkcyjnych"},"NAVBAR:SEARCH:prodDowntimes":function(n){return"lista przestojów"},"NAVBAR:SEARCH:qiResults":function(n){return"wyniki inspekcji"},"NAVBAR:SEARCH:mechOrders":function(n){return"lista zleceń mechanicznych"},"NAVBAR:SEARCH:sapOrders":function(n){return"lista zleceń z SAP"},"NAVBAR:SEARCH:sapOrdersStart":function(n){return"lista zleceń z SAP wg daty startu"},"NAVBAR:SEARCH:sapOrdersFinish":function(n){return"lista zleceń z SAP wg daty ukończenia"},"NAVBAR:SEARCH:sapList":function(n){return"lista z SAP"},"NAVBAR:SEARCH:xiconfOrders":function(n){return"lista zleceń z bazy testów"},"NAVBAR:SEARCH:xiconfList":function(n){return"lista z bazy testów"},"NAVBAR:SEARCH:worksheetOrders":function(n){return"lista zleceń z kart pracy"},"NAVBAR:SEARCH:fteMaster":function(n){return"lista FTE (produkcja)"},"NAVBAR:SEARCH:fteLeader":function(n){return"lista FTE (inne)"},"NAVBAR:SEARCH:hourlyPlans":function(n){return"lista planów godzinowych"},"NAVBAR:SEARCH:hourlyPlan":function(n){return"plan godzinowy"},"NAVBAR:SEARCH:prodShifts":function(n){return"lista zmian produkcyjnych"},"NAVBAR:SEARCH:document":function(n){return"dokument"},"NAVBAR:SEARCH:documentFile":function(n){return"plik dokumentacji"},"NAVBAR:mor":function(n){return"Matryca odpowiedzialności"},"ACTION_FORM:BUTTON":function(n){return"Wykonaj akcję"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń"},"ACTION_FORM:BUTTON:cancel":function(n){return"Anuluj"},"ACTION_FORM:MESSAGE":function(n){return"Czy na pewno chcesz wykonać żądaną akcję?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Wykonywanie akcji nie powiodło się :("},"ORG_UNIT:division":function(n){return"Wydział"},"ORG_UNIT:subdivision":function(n){return"Dział"},"ORG_UNIT:mrpController":function(n){return"Kontroler MRP"},"ORG_UNIT:mrpControllers":function(n){return"Kontroler MRP"},"ORG_UNIT:prodFlow":function(n){return"Przepływ"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Linia montażowa"},SHIFT:function(n){return r.v(n,"date")+", "+r.v(n,"shift")},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Dowolna"},QUARTER:function(n){return r.v(n,"quarter")+" kwartał "+r.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Dowolny"},"highcharts:contextButtonTitle":function(n){return"Menu kontekstowe wykresu"},"highcharts:downloadJPEG":function(n){return"Zapisz jako JPEG"},"highcharts:downloadPDF":function(n){return"Zapisz jako PDF"},"highcharts:downloadPNG":function(n){return"Zapisz jako PNG"},"highcharts:downloadSVG":function(n){return"Zapisz jako SVG"},"highcharts:downloadCSV":function(n){return"Zapisz jako CSV"},"highcharts:printChart":function(n){return"Drukuj wykres"},"highcharts:decimalPoint":function(n){return","},"highcharts:thousandsSep":function(n){return" "},"highcharts:noData":function(n){return"Brak danych :("},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Zresetuj przybliżenie"},"highcharts:loading":function(n){return"Ładowanie..."},"highcharts:months":function(n){return"Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień"},"highcharts:shortMonths":function(n){return"Sty_Lut_Mar_Kwi_Maj_Cze_Lip_Sie_Wrz_Paź_Lis_Gru"},"highcharts:weekdays":function(n){return"Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota"},"dataTables:emptyTable":function(n){return"Brak danych."},"dataTables:loadingRecords":function(n){return"Ładowanie danych..."},"dataTables:loadingFailed":function(n){return"Ładowanie danych nie powiodło się :("},"feedback:button:text":function(n){return"Feedback"},"feedback:button:tooltip":function(n){return"Zgłoś błędy, uwagi, opinie lub pomysły!"},"colorPicker:label":function(n){return"Kolor"},"filter:date:from":function(n){return"Od"},"filter:date:from:info":function(n){return"Dane od godziny 06:00 wybranego dnia"},"filter:date:to":function(n){return"Do"},"filter:date:to:info":function(n){return"Dane do godziny 06:00 wybranego dnia"},"filter:shift":function(n){return"Zmiana"},"filter:submit":function(n){return"Filtruj"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Pokaż filtr"},"filter:hide":function(n){return"Ukryj filtr"},"placeholder:date":function(n){return"rrrr-mm-dd"},"placeholder:time":function(n){return"--:--"},"placeholder:month":function(n){return"rrrr-mm"},"PRINT_PAGE:FT:PAGE_NO":function(n){return"Strona <span class=print-page-no>?</span> z <span class=print-page-count>?</span>"},"PRINT_PAGE:FT:INFO":function(n){return"Wydruk wygenerowany <span class=print-page-date>?</span> przez użytkownika <span class=print-page-user>?</span>."}}});