define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[i](n[t]-e))in u?u[t]:u.other},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{APP_NAME:function(n){return"WMES"},TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Ładowanie...</span>"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie nie powiodło się."},"MSG:SAVING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Zapisywanie...</span>"},"MSG:SAVING_FAILURE":function(n){return"Zapisywanie nie powiodło się."},"MSG:EXPORTING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Eksportowanie...</span>"},"MSG:EXPORTING_FAILURE":function(n){return"Eksportowanie nie powiodło się."},"MSG:LOG_OUT:FAILURE":function(n){return"Wylogowanie nie powiodło się."},"MSG:LOG_OUT:SUCCESS":function(n){return"Zostałeś wylogowany!"},"MSG:POPUP_BLOCKED":function(n){return"Wyskakujące okienko zostało zablokowane."},"MSG:DELETED":function(n){return"Usunięto: <em>"+r.v(n,"label")+"</em>."},"MSG:jump:404":function(n){return"Nie znaleziono: "+r.v(n,"rid")},"PAGE_ACTION:add":function(n){return"Dodaj"},"PAGE_ACTION:edit":function(n){return"Edytuj"},"PAGE_ACTION:delete":function(n){return"Usuń"},"PAGE_ACTION:filter":function(n){return"Filtruj"},"PAGE_ACTION:export":function(n){return"Eksportuj"},"PAGE_ACTION:export:csv":function(n){return"Eksportuj do CSV"},"PAGE_ACTION:export:xlsx":function(n){return"Eksportuj do XLSX"},"PAGE_ACTION:jump:title":function(n){return"Skocz do szczegółów po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID"},"LIST:COLUMN:actions":function(n){return"Akcje"},"LIST:NO_DATA":function(n){return"Brak danych."},"LIST:NO_DATA:cell":function(n){return""},"LIST:ACTION:viewDetails":function(n){return"Pokaż szczegóły"},"LIST:ACTION:edit":function(n){return"Edytuj"},"LIST:ACTION:delete":function(n){return"Usuń"},"LIST:ACTION:print":function(n){return"Drukuj"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"ERROR:notify:message":function(n){return"Kliknij tutaj, aby poinformować administratora o błędzie."},"ERROR:notify:success":function(n){return"Administrator został powiadomiony o błędzie!"},"ERROR:notify:failure":function(n){return"Nie udało się powiadomić administratora."},"ERROR:notify:subject":function(n){return"["+r.v(n,"APP_NAME")+"] Błąd "+r.v(n,"code")+" od "+r.v(n,"user")},"ERROR:0:title":function(n){return"Błąd podczas ładowania"},"ERROR:0:message":function(n){return"Nieoczekiwany błąd podczas wykonywania żądania. Sprawdź, czy masz połączenie z siecią i <a href=# data-reload>załaduj ponownie stronę</a>."},"ERROR:400:title":function(n){return"Błąd 400: nieprawidłowe zapytanie"},"ERROR:400:message":function(n){return"Żądanie nie może być obsłużone przez serwer z powodu błędnej składni zapytania."},"ERROR:401:title":function(n){return"Błąd 401: nieautoryzowany dostęp"},"ERROR:401:message":function(n){return"Żądanie wymaga uwierzytelnienia. <a href='#login'>Kliknij tutaj, aby przejść do formularza logowania</a>."},"ERROR:403:title":function(n){return"Błąd 403: zabroniony"},"ERROR:403:message":function(n){return"Nie masz uprawnień do wykonania żądanej akcji."},"ERROR:403:guest:message":function(n){return"Nie masz uprawnień do wykonania żądanej akcji. <a href='#login'>Kliknij tutaj, aby przejść do formularza logowania</a>."},"ERROR:404:title":function(n){return"Błąd 404: nie znaleziono"},"ERROR:404:message":function(n){return"Wybrana strona nigdy nie istniała lub została usunięta."},"ERROR:500:title":function(n){return"Błąd 500: wewnętrzny błąd serwera"},"ERROR:500:message":function(n){return"Serwer napotkał niespodziewane trudności, które uniemożliwiły zrealizowanie żądania."},"ERROR:503:title":function(n){return"Błąd 503: usługa niedostępna"},"ERROR:503:message":function(n){return"Serwer nie jest w stanie w danej chwili zrealizować żądania ze względu na przeciążenie lub przerwę konserwacyjną."},"ERROR:504:title":function(n){return"Błąd 504: przekroczony czas bramy"},"ERROR:504:message":function(n){return"Serwer bramy nie otrzymał w ustalonym czasie odpowiedzi od nadrzędnego serwera."},"PAGINATION:FIRST_PAGE":function(n){return"Pierwsza strona"},"PAGINATION:PREV_PAGE":function(n){return"Poprzednia strona"},"PAGINATION:NEXT_PAGE":function(n){return"Następna strona"},"PAGINATION:LAST_PAGE":function(n){return"Ostatnia strona"},"BOOL:true":function(n){return"Tak"},"BOOL:false":function(n){return"Nie"},"BOOL:null":function(n){return"Nie dotyczy"},"#":function(n){return"Lp."},GUEST_USER_NAME:function(n){return"Gość"},"NAVBAR:TOGGLE":function(n){return"Pokaż menu"},"NAVBAR:DASHBOARD":function(n){return"Pulpit"},"NAVBAR:EVENTS":function(n){return"Zdarzenia"},"NAVBAR:ORDERS":function(n){return"Zlecenia"},"NAVBAR:MECH_ORDERS":function(n){return"Zlecenia mechaniczne"},"NAVBAR:OTHER_ORDERS":function(n){return"Zlecenia produkcyjne"},"NAVBAR:EMPTY_ORDERS":function(n){return"Puste zlecenia WMES"},"NAVBAR:LINES":function(n){return"Linie produkcyjne"},"NAVBAR:USERS":function(n){return"Użytkownicy"},"NAVBAR:MY_ACCOUNT":function(n){return"Moje konto"},"NAVBAR:UI_LOCALE":function(n){return"Lokalizacja UI"},"NAVBAR:LOCALE_PL":function(n){return"Po polsku"},"NAVBAR:LOCALE_US":function(n){return"Po angielsku"},"NAVBAR:LOG_IN":function(n){return"Zaloguj się"},"NAVBAR:LOG_OUT":function(n){return"Wyloguj się"},"NAVBAR:DICTIONARIES":function(n){return"Słowniki"},"NAVBAR:TOOLS":function(n){return"Narzędzia"},"NAVBAR:ORDER_STATUSES":function(n){return"Statusy zleceń"},"NAVBAR:DELAY_REASONS":function(n){return"Powody opóźnień"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Powody przestojów"},"NAVBAR:LOSS_REASONS":function(n){return"Powody strat materiałowych"},"NAVBAR:AORS":function(n){return"Obszary odpowiedzialności"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCentra"},"NAVBAR:COMPANIES":function(n){return"Firmy"},"NAVBAR:DIVISIONS":function(n){return"Wydziały"},"NAVBAR:SUBDIVISIONS":function(n){return"Działy"},"NAVBAR:MRP_CONTROLLERS":function(n){return"Kontrolery MRP"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Funkcje"},"NAVBAR:PROD_FLOWS":function(n){return"Przepływy"},"NAVBAR:PROD_TASKS":function(n){return"Zadania produkcyjne"},"NAVBAR:PROD_LINES":function(n){return"Linie produkcyjne"},"NAVBAR:PLANNING:main":function(n){return"Planowanie"},"NAVBAR:PLANNING:plans":function(n){return"Plany"},"NAVBAR:PLANNING:hourly":function(n){return"godzinowe"},"NAVBAR:PLANNING:daily":function(n){return"dzienne"},"NAVBAR:PLANNING:drilling":function(n){return"Wiercenie"},"NAVBAR:PLANNING:wiring":function(n){return"Przewody"},"NAVBAR:PLANNING:paintShop":function(n){return"Malarnia"},"NAVBAR:PLANNING:paintShop:load":function(n){return"Obciążenie"},"NAVBAR:PLANNING:wh":function(n){return"Magazyn"},"NAVBAR:PLANNING:wh:old":function(n){return"stary"},"NAVBAR:PLANNING:wh:new":function(n){return"nowy"},"NAVBAR:PLANNING:wh:problems":function(n){return"Problemy"},"NAVBAR:PLANNING:all":function(n){return"Wszystkie"},"NAVBAR:PLANNING:0d":function(n){return"Na dzisiaj"},"NAVBAR:PLANNING:-1d":function(n){return"Na wczoraj"},"NAVBAR:PLANNING:1d":function(n){return"Na jutro"},"NAVBAR:PLANNING:2d":function(n){return"Na pojutrze"},"NAVBAR:PLANNING:2d:help":function(n){return"Plan dostępny około godziny 17:00."},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Produkcja"},"NAVBAR:FTE:WH":function(n){return"Magazyn"},"NAVBAR:FTE:LEADER":function(n){return"Inne"},"NAVBAR:FTE:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:VIS":function(n){return"Wizualizacja"},"NAVBAR:VIS:STRUCTURE":function(n){return"Struktura organizacyjna"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Karty pracy"},"NAVBAR:REPORTS":function(n){return"Raporty"},"NAVBAR:REPORTS:1":function(n){return"Wskaźniki"},"NAVBAR:REPORTS:clip":function(n){return"CLIP"},"NAVBAR:REPORTS:3":function(n){return"Wykorzystanie zasobów"},"NAVBAR:REPORTS:4":function(n){return"Operatorzy"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Magazyn"},"NAVBAR:REPORTS:7":function(n){return"Przestoje w obszarach"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planowane obciążenie linii"},"NAVBAR:PROD":function(n){return"Produkcja"},"NAVBAR:PROD:DATA":function(n){return"Dane produkcyjne"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Historia operacji"},"NAVBAR:PROD:SHIFTS":function(n){return"Zmiany"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Zlecenia"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Przestoje"},"NAVBAR:PROD:ALERTS":function(n){return"Alarmy"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Żądania zmian"},"NAVBAR:PROD:SERIAL_NUMBERS":function(n){return"Numery seryjne"},"NAVBAR:PROD:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:testing":function(n){return"Baza testów"},"NAVBAR:xiconf":function(n){return"Xiconf"},"NAVBAR:xiconf:clients":function(n){return"Klienci"},"NAVBAR:xiconf:orders":function(n){return"Zlecenia"},"NAVBAR:xiconf:results":function(n){return"Wyniki"},"NAVBAR:xiconf:programs":function(n){return"Programy"},"NAVBAR:xiconf:hidLamps":function(n){return"Oprawy HID"},"NAVBAR:xiconf:componentWeights":function(n){return"Wagi komponentów"},"NAVBAR:snf":function(n){return"SNF"},"NAVBAR:snf:results":function(n){return"Wyniki"},"NAVBAR:snf:programs":function(n){return"Programy"},"NAVBAR:trw":function(n){return"TRW"},"NAVBAR:trw:results":function(n){return"Wyniki"},"NAVBAR:trw:testers":function(n){return"Sterowniki"},"NAVBAR:trw:bases":function(n){return"Podstawki"},"NAVBAR:trw:programs":function(n){return"Programy"},"NAVBAR:DOCUMENTS":function(n){return"Dokumentacja"},"NAVBAR:DOCUMENTS:TREE":function(n){return"Dokumenty"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Klienci"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Ustawienia"},"NAVBAR:DOCUMENTS:CONFIRMATIONS":function(n){return"Potwierdzenia"},"NAVBAR:VENDORS":function(n){return"Dostawcy"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Zamówienia"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Układ fabryki"},"NAVBAR:MONITORING:LIST":function(n){return"Lista linii produkcyjnych"},"NAVBAR:VENDOR_NC12S":function(n){return"Baza 12NC"},"NAVBAR:LICENSES":function(n){return"Licencje"},"NAVBAR:ISA_PALLET_KINDS":function(n){return"Rodzaje palet"},"NAVBAR:ISA":function(n){return"Pola odkładcze"},"NAVBAR:INVALID_ORDERS":function(n){return"Nieprawidłowe zlecenia IPT"},"NAVBAR:IPT_CHECK":function(n){return"Sprawdzacz zleceń IPT"},"NAVBAR:SAP_LABOR_TIME_FIXER":function(n){return"Sprawdzacz Labor Time"},"NAVBAR:PRINTERS":function(n){return"Drukarki"},"NAVBAR:PKHD_STRATEGIES":function(n){return"Strategie dost. komponentów"},"NAVBAR:kanban":function(n){return"Baza komponentów"},"NAVBAR:pfep":function(n){return"Baza PFEP"},"NAVBAR:layout":function(n){return"Layout"},"NAVBAR:toolcal":function(n){return"Narzędzia pomiarowe"},"NAVBAR:luma2":function(n){return"Luma gen. 2"},"NAVBAR:luca":function(n){return"LUCA Pick by Light"},"NAVBAR:logs:browserErrors":function(n){return"Błędy klientów"},"NAVBAR:OPINION:main":function(n){return"Badanie Opinia"},"NAVBAR:OPINION:current":function(n){return"Aktualne badanie"},"NAVBAR:OPINION:report":function(n){return"Raport"},"NAVBAR:OPINION:actions":function(n){return"Akcje naprawcze"},"NAVBAR:OPINION:responses":function(n){return"Odpowiedzi"},"NAVBAR:OPINION:scanning":function(n){return"Skanowanie"},"NAVBAR:OPINION:scanTemplates":function(n){return"Szablony"},"NAVBAR:OPINION:omrResults":function(n){return"Wyniki"},"NAVBAR:OPINION:dictionaries":function(n){return"Słowniki"},"NAVBAR:OPINION:surveys":function(n){return"Badania"},"NAVBAR:OPINION:employers":function(n){return"Pracodawcy"},"NAVBAR:OPINION:divisions":function(n){return"Wydziały"},"NAVBAR:OPINION:questions":function(n){return"Pytania"},"NAVBAR:KAIZEN:main":function(n){return"ZPW"},"NAVBAR:KAIZEN:orders":function(n){return"Zgłoszenia"},"NAVBAR:KAIZEN:all":function(n){return"Wszystkie"},"NAVBAR:KAIZEN:open":function(n){return"Tylko otwarte"},"NAVBAR:KAIZEN:mine":function(n){return"Tylko moje"},"NAVBAR:KAIZEN:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:KAIZEN:reports":function(n){return"Raporty"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:KAIZEN:reports:engagement":function(n){return"Zaangażowanie"},"NAVBAR:KAIZEN:reports:metrics":function(n){return"Wskaźniki"},"NAVBAR:KAIZEN:reports:count":function(n){return"Ilość ZPW"},"NAVBAR:KAIZEN:reports:observations":function(n){return"Ilość obserwacji"},"NAVBAR:KAIZEN:reports:minutes":function(n){return"Ilość minutek"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Słowniki"},"NAVBAR:KAIZEN:sections":function(n){return"Działy"},"NAVBAR:KAIZEN:areas":function(n){return"Miejsca zdarzeń"},"NAVBAR:KAIZEN:categories":function(n){return"Kategorie"},"NAVBAR:KAIZEN:causes":function(n){return"Przyczyny"},"NAVBAR:KAIZEN:risks":function(n){return"Rodzaje ryzyka"},"NAVBAR:KAIZEN:behaviours":function(n){return"Zachowania"},"NAVBAR:KAIZEN:help":function(n){return"Pomoc"},"NAVBAR:KAIZEN:observations":function(n){return"Obserwacje"},"NAVBAR:KAIZEN:minutesForSafety":function(n){return"Minuty dla Bezpieczeństwa"},"NAVBAR:SUGGESTIONS:main":function(n){return"Usprawnienia"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Zgłoszenia"},"NAVBAR:SUGGESTIONS:all":function(n){return"Wszystkie"},"NAVBAR:SUGGESTIONS:open":function(n){return"Tylko otwarte"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Tylko moje"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Tylko nieprzeczytane"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Raporty"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Ilość zgłoszeń"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Zestawienie informacji"},"NAVBAR:SUGGESTIONS:reports:engagement":function(n){return"Zaangażowanie"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Słowniki"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Działy"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Kategorie"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Rodziny produktów"},"NAVBAR:SUGGESTIONS:help":function(n){return"Pomoc"},"NAVBAR:QI:main":function(n){return"Inspekcja Jakości"},"NAVBAR:QI:results":function(n){return"Wyniki"},"NAVBAR:QI:results:all":function(n){return"Wszystkie"},"NAVBAR:QI:results:good":function(n){return"Zgodne"},"NAVBAR:QI:results:bad":function(n){return"Niezgodne"},"NAVBAR:QI:reports":function(n){return"Raporty"},"NAVBAR:QI:reports:count":function(n){return"Ilości"},"NAVBAR:QI:reports:okRatio":function(n){return"% wyrobów zgodnych"},"NAVBAR:QI:reports:nokRatio":function(n){return"Jakość wyrobu gotowego"},"NAVBAR:QI:reports:outgoingQuality":function(n){return"Outgoing quality"},"NAVBAR:QI:dictionaries":function(n){return"Słowniki"},"NAVBAR:QI:kinds":function(n){return"Rodzaje inspekcji"},"NAVBAR:QI:errorCategories":function(n){return"Kategorie błędów"},"NAVBAR:QI:faults":function(n){return"Wady"},"NAVBAR:QI:standards":function(n){return"Standardy"},"NAVBAR:QI:actionStatuses":function(n){return"Statusy akcji"},"NAVBAR:SEARCH:help":function(n){return"Szukaj wg nr zlecenia, 12NC, zgłoszenia lub daty."},"NAVBAR:SEARCH:empty":function(n){return"Brak wyników."},"NAVBAR:SEARCH:fullOrderNo":function(n){return"Zlecenie nr "+r.v(n,"orderNo")},"NAVBAR:SEARCH:partialOrderNo":function(n){return"Zlecenia nr "+r.v(n,"orderNo")+"..."},"NAVBAR:SEARCH:fullNc12":function(n){return"12NC "+r.v(n,"nc12")},"NAVBAR:SEARCH:partialNc12":function(n){return"12NC "+r.v(n,"nc12")+"..."},"NAVBAR:SEARCH:fullNc15":function(n){return"15NC "+r.v(n,"nc15")},"NAVBAR:SEARCH:searchName":function(n){return"Użytkownicy"},"NAVBAR:SEARCH:sapDetails":function(n){return"szczegóły z SAP"},"NAVBAR:SEARCH:xiconfDetails":function(n){return"szczegóły z bazy testów"},"NAVBAR:SEARCH:xiconfResults":function(n){return"wyniki testów"},"NAVBAR:SEARCH:prodShiftOrders":function(n){return"lista z linii produkcyjnych"},"NAVBAR:SEARCH:prodShiftOrdersList":function(n){return"lista zleceń z linii produkcyjnych"},"NAVBAR:SEARCH:prodDowntimes":function(n){return"lista przestojów"},"NAVBAR:SEARCH:qiResults":function(n){return"wyniki inspekcji"},"NAVBAR:SEARCH:mechOrders":function(n){return"lista zleceń mechanicznych"},"NAVBAR:SEARCH:sapOrders":function(n){return"lista zleceń z SAP"},"NAVBAR:SEARCH:sapOrdersBom":function(n){return"lista zleceń z SAP z komponentem"},"NAVBAR:SEARCH:sapOrdersDoc":function(n){return"lista zleceń z SAP z dokumentem"},"NAVBAR:SEARCH:sapOrdersStart":function(n){return"lista zleceń z SAP wg daty startu"},"NAVBAR:SEARCH:sapOrdersFinish":function(n){return"lista zleceń z SAP wg daty ukończenia"},"NAVBAR:SEARCH:sapList":function(n){return"lista z SAP"},"NAVBAR:SEARCH:xiconfOrders":function(n){return"lista zleceń z bazy testów"},"NAVBAR:SEARCH:xiconfList":function(n){return"lista z bazy testów"},"NAVBAR:SEARCH:worksheetOrders":function(n){return"lista zleceń z kart pracy"},"NAVBAR:SEARCH:fte:master":function(n){return"lista FTE (produkcja)"},"NAVBAR:SEARCH:fte:wh":function(n){return"lista FTE (magazyn)"},"NAVBAR:SEARCH:fte:leader":function(n){return"lista FTE (inne)"},"NAVBAR:SEARCH:hourlyPlans":function(n){return"lista planów godzinowych"},"NAVBAR:SEARCH:hourlyPlan":function(n){return"plan godzinowy"},"NAVBAR:SEARCH:prodShifts":function(n){return"lista zmian produkcyjnych"},"NAVBAR:SEARCH:document":function(n){return"dokument w katalogu"},"NAVBAR:SEARCH:documentFile":function(n){return"plik dokumentacji"},"NAVBAR:SEARCH:entryId":function(n){return"Zgłoszenie nr "+r.v(n,"entryId")},"NAVBAR:SEARCH:kaizenOrders":function(n){return"ZPW"},"NAVBAR:SEARCH:suggestions":function(n){return"Usprawnienie"},"NAVBAR:SEARCH:behaviorObsCards":function(n){return"Obserwacje"},"NAVBAR:SEARCH:minutesForSafetyCards":function(n){return"Minutki"},"NAVBAR:SEARCH:d8":function(n){return"8D"},"NAVBAR:SEARCH:qi":function(n){return"Inspekcja Jakości"},"NAVBAR:SEARCH:plan:prod":function(n){return"plan produkcji"},"NAVBAR:SEARCH:plan:wh":function(n){return"plan magazynu"},"NAVBAR:SEARCH:plan:ps":function(n){return"plan malarnii"},"NAVBAR:SEARCH:fap":function(n){return"FAP"},"NAVBAR:SEARCH:fapEntries":function(n){return"zgłoszenia FAP"},"NAVBAR:SEARCH:kanbanEntries":function(n){return"kanbany"},"NAVBAR:SEARCH:kanbanComponent":function(n){return"komponent kanban"},"NAVBAR:mor":function(n){return"Matryca odpowiedzialności"},"ACTION_FORM:BUTTON":function(n){return"Wykonaj akcję"},"ACTION_FORM:BUTTON:cancel":function(n){return"Anuluj"},"ACTION_FORM:MESSAGE":function(n){return"Czy na pewno chcesz wykonać żądaną akcję?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Wykonywanie akcji nie powiodło się."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną pozycję?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Usuwanie nie powiodło się."},"FORM:ACTION:add":function(n){return"Dodaj"},"FORM:ACTION:edit":function(n){return"Edytuj"},"FORM:ERROR:addFailure":function(n){return"Dodawanie nie powiodło się."},"FORM:ERROR:editFailure":function(n){return"Edycja nie powiodła się."},"ORG_UNIT:division":function(n){return"Wydział"},"ORG_UNIT:subdivision":function(n){return"Dział"},"ORG_UNIT:mrpController":function(n){return"Kontroler MRP"},"ORG_UNIT:mrpControllers":function(n){return"Kontroler MRP"},"ORG_UNIT:prodFlow":function(n){return"Przepływ"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Linia montażowa"},SHIFT:function(n){return r.v(n,"date")+", "+r.s(n,"shift",{1:"I",2:"II",3:"III",other:r.v(n,"shift")})},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Dowolna"},QUARTER:function(n){return r.v(n,"quarter")+" kwartał "+r.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Dowolny"},"highcharts:contextButtonTitle":function(n){return"Menu kontekstowe wykresu"},"highcharts:downloadJPEG":function(n){return"Zapisz jako JPEG"},"highcharts:downloadPDF":function(n){return"Zapisz jako PDF"},"highcharts:downloadPNG":function(n){return"Zapisz jako PNG"},"highcharts:downloadSVG":function(n){return"Zapisz jako SVG"},"highcharts:downloadCSV":function(n){return"Zapisz jako CSV"},"highcharts:printChart":function(n){return"Drukuj wykres"},"highcharts:decimalPoint":function(n){return","},"highcharts:thousandsSep":function(n){return" "},"highcharts:noData":function(n){return"Brak danych."},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Zresetuj przybliżenie"},"highcharts:loading":function(n){return"Ładowanie..."},"highcharts:months":function(n){return"Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień"},"highcharts:shortMonths":function(n){return"Sty_Lut_Mar_Kwi_Maj_Cze_Lip_Sie_Wrz_Paź_Lis_Gru"},"highcharts:weekdays":function(n){return"Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota"},"dataTables:emptyTable":function(n){return"Brak danych."},"dataTables:loadingRecords":function(n){return"Ładowanie danych..."},"dataTables:loadingFailed":function(n){return"Ładowanie danych nie powiodło się."},"colorPicker:label":function(n){return"Kolor"},"filter:date":function(n){return"Data"},"filter:date:from":function(n){return"Od"},"filter:date:from:info":function(n){return"Dane od godziny 06:00 wybranego dnia"},"filter:date:to":function(n){return"Do"},"filter:date:to:info":function(n){return"Dane do godziny 06:00 wybranego dnia"},"filter:shift":function(n){return"Zmiana"},"filter:submit":function(n){return"Filtruj"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Pokaż filtr"},"filter:hide":function(n){return"Ukryj filtr"},"placeholder:date":function(n){return"rrrr-mm-dd"},"placeholder:time":function(n){return"--:--"},"placeholder:month":function(n){return"rrrr-mm"},"PRINT_PAGE:FT:PAGE_NO":function(n){return"Strona <span class=print-page-no>?</span> z <span class=print-page-count>?</span>"},"PRINT_PAGE:FT:INFO":function(n){return"Wydruk wygenerowany <span class=print-page-date>?</span> przez użytkownika <span class=print-page-user>?</span>."},"html2pdf:progress":function(n){return"Generowanie wydruku..."},"html2pdf:failure":function(n){return"Generowanie wydruku nie powiodło się."},"html2pdf:printing":function(n){return"Wysyłanie wydruku na drukarkę..."},"html2pdf:printing:success":function(n){return"Wydruk został wysłany na wybraną drukarkę."},"html2pdf:printing:failure":function(n){return"Wysyłanie wydruku na wybraną drukarkę nie powiodło się."},"dateTimeRange:placeholder:date":function(n){return"rrrr-mm-dd"},"dateTimeRange:placeholder:time":function(n){return"gg:mm"},"dateTimeRange:label:date":function(n){return"Data"},"dateTimeRange:label:date+time":function(n){return"Czas"},"dateTimeRange:label:month":function(n){return"Data"},"dateTimeRange:+0+1":function(n){return"aktualny"},"dateTimeRange:-1+0":function(n){return"poprzedni"},"dateTimeRange:-2+0":function(n){return"ostatnie 2"},"dateTimeRange:-3+0":function(n){return"ostatnie 3"},"dateTimeRange:-4+0":function(n){return"ostatnie 4"},"dateTimeRange:-6+0":function(n){return"ostatnie 6"},"dateTimeRange:-7+0":function(n){return"ostatnie 7"},"dateTimeRange:+0+7":function(n){return"następne 7"},"dateTimeRange:-14+0":function(n){return"ostatnie 14"},"dateTimeRange:-28+0":function(n){return"ostatnie 28"},"dateTimeRange:shifts":function(n){return"Zmiana"},"dateTimeRange:shifts:+0+1":function(n){return"aktualna"},"dateTimeRange:shifts:-1+0":function(n){return"poprzednia"},"dateTimeRange:shifts:1":function(n){return"I"},"dateTimeRange:shifts:2":function(n){return"II"},"dateTimeRange:shifts:3":function(n){return"III"},"dateTimeRange:days":function(n){return"Dzień"},"dateTimeRange:days:+0+1":function(n){return"dzisiaj"},"dateTimeRange:days:-1+0":function(n){return"wczoraj"},"dateTimeRange:days:+1+2":function(n){return"jutro"},"dateTimeRange:weeks":function(n){return"Tydzień"},"dateTimeRange:months":function(n){return"Miesiąc"},"dateTimeRange:quarters":function(n){return"Kwartał"},"dateTimeRange:quarters:1":function(n){return"I"},"dateTimeRange:quarters:2":function(n){return"II"},"dateTimeRange:quarters:3":function(n){return"III"},"dateTimeRange:quarters:4":function(n){return"IV"},"dateTimeRange:years":function(n){return"Rok"},"dateTimeRange:help":function(n){return"Przytrzymaj <kbd>Alt</kbd> wybierając opcję, aby jednocześnie wysłać formularz."},"embedded:actions:switch":function(n){return"Zmień aplikację"},"embedded:actions:refresh":function(n){return"Odśwież aplikację"},"embedded:actions:config":function(n){return"Konfiguruj"},"embedded:actions:reboot":function(n){return"Uruchom ponownie komputer"},"embedded:actions:shutdown":function(n){return"Wyłącz komputer"},"embedded:actions:resetBrowser":function(n){return"Resetuj przeglądarkę"},"embedded:actions:restartBrowser":function(n){return"Uruchom ponownie przeglądarkę"},"embedded:actions:noKiosk":function(n){return"Wyłącz tryb kiosku"},"embedded:apps:operator":function(n){return"Formatka operatora"},"embedded:apps:documents":function(n){return"Dokumentacja"},"embedded:apps:xiconf":function(n){return"Skanowanie LED"},"embedded:apps:maxos":function(n){return"Wizualizacja MAXOS"},"embedded:apps:drilling":function(n){return"Wiercenie"},"embedded:apps:ps-queue":function(n){return"Kolejka malarnii"},"embedded:apps:ps-load":function(n){return"Obciążenie malarnii"},"embedded:apps:isa":function(n){return"Pola odkładcze"},"embedded:apps:remote":function(n){return"Zdalna"},"embedded:apps:heff":function(n){return"Wydajność godzinowa"},"embedded:reboot:title":function(n){return"Ponowne uruchamianie komputera"},"embedded:reboot:message":function(n){return"Czy na pewno chcesz ponownie uruchomić komputer?"},"embedded:reboot:yes":function(n){return"Uruchom ponownie"},"embedded:reboot:no":function(n){return"Anuluj"},"embedded:shutdown:title":function(n){return"Wyłączanie komputera"},"embedded:shutdown:message":function(n){return"Czy na pewno chcesz wyłączyć komputer?"},"embedded:shutdown:yes":function(n){return"Wyłącz komputer"},"embedded:shutdown:no":function(n){return"Anuluj"},"PANEL:TITLE:details":function(n){return"Szczegóły"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji"},"notifications:request:message":function(n){return"Kliknij tutaj, aby włączyć powiadomienia w przeglądarce."},"lang:pl":function(n){return"Polski (pl)"},"lang:en":function(n){return"Angielski (en)"},labelCopySuffix:function(n){return r.v(n,"label")+" (kopia)"}}});