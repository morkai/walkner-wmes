define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,o){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(o||0)},v:function(r,o){return n.c(r,o),r[o]},p:function(r,o,e,i,t){return n.c(r,o),r[o]in t?t[r[o]]:(o=n.lc[i](r[o]-e))in t?t[o]:t.other},s:function(r,o,e){return n.c(r,o),r[o]in e?e[r[o]]:e.other}};return{"BREADCRUMBS:base":function(r){return"Xiconf"},"BREADCRUMBS:browse":function(r){return"Historia"},"BREADCRUMBS:details":function(r){return"Wynik"},"BREADCRUMBS:settings":function(r){return"Ustawienia"},"MSG:LOADING_FAILURE":function(r){return"Ładowanie wyników programowania nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(r){return"Ładowanie danych wyniku programowania nie powiodło się."},"MSG:drop:filesOnly":function(r){return"Upuszczać można tylko pliki!"},"MSG:drop:invalidFile":function(r){return"Nieprawidłowy plik aktualizacji oprogramowania!"},"MSG:drop:upload:failure":function(r){return"Nie udało się załadować pliku aktualizacji."},"MSG:drop:upload:success":function(r){return"Plik aktualizacji został załadowany :)"},"PANEL:TITLE:details:order":function(r){return"Szczegóły lokalnego zlecenia"},"PANEL:TITLE:details:entry":function(r){return"Szczegóły programowania"},"PAGE_ACTION:export":function(r){return"Eksportuj wyniki"},"PAGE_ACTION:download":function(r){return"Pobierz konfigurację"},"PAGE_ACTION:download:workflow":function(r){return"Konfiguracja MultiOneWorkflow"},"PAGE_ACTION:download:feature":function(r){return"Konfiguracja drivera"},"PAGE_ACTION:download:gprsOrderFile":function(r){return"Zlecenie"},"PAGE_ACTION:download:gprsInputFile":function(r){return"Konfiguracja CityTouchIPT"},"PAGE_ACTION:download:gprsOutputFile":function(r){return"Wynik CityTouchIPT"},"PROPERTY:srcId":function(r){return"ID instalacji"},"PROPERTY:srcTitle":function(r){return"Tytuł instalacji"},"PROPERTY:srcIp":function(r){return"IP instalacji"},"PROPERTY:srcUuid":function(r){return"Klucz instalacji"},"PROPERTY:no":function(r){return"Nr zlecenia"},"PROPERTY:totalCounter":function(r){return"Całkowita ilość programowań"},"PROPERTY:successCounter":function(r){return"Ilość pomyślnych programowań"},"PROPERTY:failureCounter":function(r){return"Ilość błędnych programowań"},"PROPERTY:order":function(r){return"Zlecenie"},"PROPERTY:quantity":function(r){return"Ilość"},"PROPERTY:counter":function(r){return"Licznik"},"PROPERTY:nc12":function(r){return"12NC programu"},"PROPERTY:gprsNc12":function(r){return"12NC GPRS"},"PROPERTY:startedAt":function(r){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(r){return"Czas zakończenia"},"PROPERTY:duration":function(r){return"Czas trwania"},"PROPERTY:log":function(r){return"Log"},"PROPERTY:result":function(r){return"Wynik"},"PROPERTY:errorCode":function(r){return"Błąd"},"PROPERTY:exception":function(r){return"Szczegóły błędu"},"PROPERTY:output":function(r){return"Odpowiedź programatora"},"PROPERTY:featureFile":function(r){return"Plik konfiguracyjny drivera"},"PROPERTY:featureFileName":function(r){return"Nazwa pliku konfiguracyjnego drivera"},"PROPERTY:feature":function(r){return"Zawartość pliku konfiguracyjego drivera"},"PROPERTY:workflowFile":function(r){return"Plik konfiguracyjny programatora"},"PROPERTY:workflow":function(r){return"Zawartość pliku konfiguracyjnego programatora"},"PROPERTY:programName":function(r){return"Nazwa programu"},"PROPERTY:programSteps":function(r){return"Kroki programu"},"PROPERTY:serviceTag":function(r){return"Service Tag"},"PROPERTY:prodLine":function(r){return"Linia"},"details:showOrderSummaryLink":function(r){return"Pokaż podsumowanie zlecenia"},"filter:result:success":function(r){return"Sukces"},"filter:result:failure":function(r){return"Porażka"},"filter:placeholder:srcId":function(r){return"Dowolne"},"filter:nc12Type:program":function(r){return"12NC programu"},"filter:nc12Type:led":function(r){return"12NC płytki LED"},"filter:submit":function(r){return"Filtruj wyniki"},"step:wait":function(r){return"Przerwa"},"step:pe":function(r){return"Test obwodu ochronnego"},"step:sol":function(r){return"Programowanie Fortimo Solar"},"step:fn":function(r){return"Test funkcjonalny"},"tab:log":function(r){return"Przebieg programowania"},"tab:output":function(r){return"Przebieg komunikacji"},"tab:workflow":function(r){return"Konfiguracja programatora"},"tab:feature":function(r){return"Konfiguracja drivera"},"tab:leds":function(r){return"Płytki LED"},"tab:hidLamps":function(r){return"Lampy HID"},"tab:wiring":function(r){return"Oprzewodowanie"},"tab:program":function(r){return"Program"},"tab:gprsOrderFile":function(r){return"Zlecenie"},"tab:gprsInputFile":function(r){return"Konfiguracja CityTouchIPT"},"tab:gprsOutputFile":function(r){return"Wynik CityTouchIPT"},"metrics:title":function(r){return"Zmierzone wartości"},"metrics:u":function(r){return"Napięcie"},"metrics:uSet":function(r){return"Napięcie ustawione"},"metrics:uGet":function(r){return"Napięcie zmierzone"},"metrics:i":function(r){return"Natężenie"},"metrics:r":function(r){return"Rezystancja"},"metrics:p":function(r){return"Moc"},"wiring:probe:1":function(r){return"Sonda LED 1"},"wiring:probe:2":function(r){return"Sonda LED 2"},"wiring:probe:3":function(r){return"Sonda LED 3"},"wiring:probe:4":function(r){return"Sonda żeńska"},"leds:error:INVALID_NC12":function(r){return"Nieprawidłowe 12NC:<br>"+n.v(r,"nc12")+"!"},"leds:error:NO_CONNECTION":function(r){return"Brak połączenia z<br>serwerem zewnętrznym!"},"leds:error:TIMEOUT":function(r){return"Upłynął limit czasu<br>oczekiwania na odpowiedź!"},"ledS:error:DB_FAILURE":function(r){return"Błąd bazy danych!"},"leds:error:UNKNOWN_ORDER_NO":function(r){return"Nieznane zlecenie!"},"leds:error:UNKNOWN_ITEM_NC12":function(r){return"Nieznana pozycja zlecenia!"},"leds:error:SERIAL_NUMBER_USED":function(r){return"SN użyty w zleceniu "+n.v(r,"orderNo")+":<br>"+n.v(r,"name")},"log:ORDER_CREATED":function(r){return"Rozpoczynanie zlecenia nr <code>"+n.v(r,"orderNo")+"</code> (1/"+n.v(r,"quantity")+")..."},"log:ORDER_CONTINUED":function(r){return"Kontynuacja zlecenia nr <code>"+n.v(r,"orderNo")+"</code> ("+n.v(r,"counter")+"/"+n.v(r,"quantity")+")..."},"log:PROGRAMMING_STARTED":function(r){return"Rozpoczynanie programowania 12NC <code>"+n.v(r,"nc12")+"</code>..."},"log:COUNTDOWN_STARTED":function(r){return"Odliczanie <code>"+n.v(r,"delay")+"</code> "+n.p(r,"delay",0,"pl",{one:"sekundy",other:"sekund"})+"..."},"log:READING_WORKFLOW_FILE":function(r){return"Odczytywanie pliku konfiguracyjnego programatora: <code>"+n.v(r,"workflowFile")+"</code>"},"log:WORKFLOW_FILE_READ":function(r){return"Odczytano <code>"+n.v(r,"length")+"B</code> pliku konfiguracyjnego programatora."},"log:WRITING_WORKFLOW_FILE":function(r){return"Zapisywanie pliku konfiguracyjnego programatora: <code>"+n.v(r,"workflowFile")+"</code> (<code>"+n.v(r,"workflowOptions")+"</code>)"},"log:WORKFLOW_FILE_WRITTEN":function(r){return"Zapisano <code>"+n.v(r,"length")+"B</code> pliku konfiguracyjnego programatora."},"log:USING_LAST_FEATURE_FILE":function(r){return"Pomijanie wyszukiwania pliku konfiguracyjnego drivera: wykorzystany zostanie ostatni plik."},"log:SEARCHING_FEATURE_FILE":function(r){return"Wyszukiwanie pliku konfiguracyjnego drivera w ścieżce: <code>"+n.v(r,"featurePath")+"</code>"},"log:SEARCHING_FEATURE_FILE_FAILURE":function(r){return"Nieudane wyszukiwanie pliku: <code>"+n.v(r,"error")+"</code>"},"log:SEARCHING_FEATURE_FILE_TIMEOUT":function(r){return"Upłynął limit czasu wyszukiwania pliku konfiguracyjnego drivera."},"log:MISSING_FEATURE_FILE_1":function(r){return"Nie znaleziono pliku konfiguracyjnego drivera w pierwszej ścieżce."},"log:MISSING_FEATURE_FILE_2":function(r){return"Nie znaleziono pliku konfiguracyjnego drivera w ścieżce zapasowej."},"log:DUPLICATE_FEATURE_FILE_1":function(r){return"W pierwszej ścieżce wykryto "+n.v(r,"fileCount")+" "+n.p(r,"fileCount",0,"pl",{one:"plik konfiguracyjny drivera",few:"pliki konfiguracje driverów",other:"plików konfiguracyjnych driverów"})+" dla danego kodu 12NC."},"log:DUPLICATE_FEATURE_FILE_2":function(r){return"W ścieżce zapasowej wykryto "+n.v(r,"fileCount")+" "+n.p(r,"fileCount",0,"pl",{one:"plik konfiguracyjny drivera",few:"pliki konfiguracje driverów",other:"plików konfiguracyjnych driverów"})+" dla danego kodu 12NC."},"log:FEATURE_FILE_FOUND":function(r){return"Znaleziono plik konfiguracyjny drivera: <code>"+n.v(r,"featureFile")+"</code>"},"log:SKIPPING_FEATURE_FILE_2":function(r){return"Pomijanie wyszukiwania pliku konfiguracyjnego drivera w ścieżce zapasowej..."},"log:CANCELLING":function(r){return"Anulowanie programowania..."},"log:PROGRAMMING_SUCCESS":function(r){return"Pomyślnie ukończono programowanie 12NC <code>"+n.v(r,"nc12")+"</code> w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Zakończono programowanie 12NC <code>"+n.v(r,"nc12")+"</code> w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:LED_SCANNING_SUCCESS":function(r){return"Pomyślnie ukończono sprawdzanie płytek LED w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:LED_SCANNING_FAILURE":function(r){return"Zakończono sprawdzanie płytek LED w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:TESTING_SUCCESS":function(r){return"Pomyślnie ukończono testowanie w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:TESTING_FAILURE":function(r){return"Zakończono testowanie w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE":function(r){return"Odczytywanie pliku konfiguracyjnego drivera..."},"log:READING_FEATURE_FILE_FAILURE":function(r){return"Błąd podczas odczytywania pliku: <code>"+n.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE_TIMEOUT":function(r){return"Upłynął limit czasu odczytywania pliku."},"log:FEATURE_FILE_READ":function(r){return"Odczytano <code>"+n.v(r,"length")+"B</code> pliku konfiguracyjnego drivera."},"log:STARTING_PROGRAMMER":function(r){return"Uruchamianie programatora przez interfejs <code>"+n.s(r,"interface",{d:"USB2DALI",s:"SimpleSet®",z:"ZigBee",i:"IP",other:"?"})+"</code>: <code>"+n.v(r,"programmerFile")+"</code>"},"log:SOL_STARTED":function(r){return"Rozpoczynanie programowania Fortimo Solar..."},"log:SOL_PARSE_ERROR":function(r){return"Błąd parsowania pliku programu w linii <code>"+n.v(r,"i")+"</code>: <code>"+n.v(r,"line")+"</code>"},"log:SOL_SEARCHING_COM":function(r){return"Wyszukiwanie portu szeregowego wg wzrorca <code>"+n.v(r,"pattern")+"</code>..."},"log:SOL_OPENING_COM":function(r){return"Otwieranie portu szeregowego <code>"+n.v(r,"comPort")+"</code>..."},"log:SOL_EXECUTING_SET_COMMANDS":function(r){return"Wykonywanie "+n.p(r,"count",0,"pl",{one:"<code>1</code> komendy ustawiającej",other:"<code>"+n.v(r,"count")+"</code> komend ustawiających"})+" wartości parametrów..."},"log:SOL_RESETTING":function(r){return"Resetowanie urządzenia..."},"log:SOL_EXECUTING_GET_COMMANDS":function(r){return"Porównywanie zaprogramowanych wartości parametrów..."},"log:SOL_INVALID_OPTION":function(r){return"Odczytana wartość parametru <code>"+n.v(r,"option")+"</code> różni się od wartości zaprogramowanej (oczekiwano <code>"+n.v(r,"expected")+"</code>; otrzymano <code>"+n.v(r,"actual")+"</code>)."},"log:LPT_STARTING":function(r){return"(LPT) Oczekiwanie na sygnał uruchomienia programatora..."},"log:LPT_FINISHING":function(r){return"(LPT) Ustawianie wartości wynikowej..."},"log:TESTING_WITH_PROGRAM_STARTED":function(r){return"Rozpoczynanie testowania..."},"log:TESTING_STARTED":function(r){return"Rozpoczynanie programu <code>"+n.v(r,"program")+"</code>..."},"log:TESTING_SEARCHING_COM":function(r){return"Wyszukiwanie portu szeregowego wg wzrorca <code>"+n.v(r,"pattern")+"</code>..."},"log:TESTING_OPENING_COM":function(r){return"Otwieranie portu szeregowego <code>"+n.v(r,"comPort")+"</code>..."},"log:TESTING_SDP_SETUP":function(r){return"Przygotowywanie zasilacza..."},"log:TESTING_SDP_TEARDOWN":function(r){return"Wyłączanie zasilacza..."},"log:TESTING_PLC_SETUP":function(r){return"Przygotowywanie sterownika..."},"log:TESTING_PLC_TEARDOWN":function(r){return"Wyłączanie sterownika..."},"log:TESTING_EXECUTING_STEP":function(r){return n.s(r,"type",{wait:"Przerwa",pe:"Wykonywanie testu obwodu ochronnego",iso:"Wykonywanie testu rezystancji izolacji",sol:"Programowanie Fortimo Solar",program:"Wykonywanie kroku programowania",fn:"Wykonywanie testu funkcjonalnego",vis:"Wykonywanie testu wizualnego",other:"Wykonywanie kroku programu <em>"+n.v(r,"type")+"</em>"})+"..."},"log:TESTING_SKIPPING_PROGRAMMING":function(r){return"Pomijanie kroku programowania..."},"log:ACQUIRING_SERVICE_TAG":function(r){return"Pobieranie nowego Service Taga..."},"log:ACQUIRING_SERVICE_TAG_FAILURE":function(r){return"Nie udało się pobrać nowego Service Taga: <code>"+n.v(r,"error")+"</code>"},"log:SERVICE_TAG_ACQUIRED":function(r){return"Otrzymano Service Tag: <code>"+n.v(r,"serviceTag")+"</code>"},"log:SKIPPING_SERVICE_TAG_ACQUIRING":function(r){return"Pomijanie pobierania nowego Service Taga..."},"log:PRINTING_SERVICE_TAG":function(r){return"Drukowanie etykiety Service Tag na drukarce <code>"+n.v(r,"printerName")+"</code>..."},"log:PRINTING_SERVICE_TAG_FAILURE":function(r){return"Nie udało się wydrukować etykiety Service Tag: <code>"+n.v(r,"error")+"</code>"},"log:LED_CHECKING_STARTED":function(r){return"Rozpoczynanie sprawdzania płytek LED..."},"log:WAITING_FOR_LEDS":function(r){return"Oczekiwanie na "+n.v(r,"ledCount")+" "+n.p(r,"ledCount",0,"pl",{one:"płytkę",few:"płytki",other:"płytek"})+" LED..."},"log:ADDING_LAST_LEDS":function(r){return"Dodawanie "+n.v(r,"ledCount")+" "+n.p(r,"ledCount",0,"pl",{one:"płytki",other:"płytek"})+" LED z ostatniego nieudanego programowania..."},"log:WAITING_FOR_CONTINUE":function(r){return"Oczekiwanie na kontynuację..."},"log:GENERATING_SERVICE_TAG":function(r){return"Generowanie nowego Service Taga..."},"log:SERVICE_TAG_GENERATED":function(r){return"Wygenerowano Service Tag: <code>"+n.v(r,"serviceTag")+"</code>"},"error:WORKFLOW_FILE_ERROR":function(r){return"Błąd podczas odczytywania pliku konfiguracyjnego programatora."},"error:WORKFLOW_FILE_WRITE_ERROR":function(r){return"Błąd podczas zapisywania pliku konfiguracyjnego programatora."},"error:FEATURE_FILE_ERROR":function(r){return"Błąd podczas odczytywania pliku konfiguracyjnego drivera."},"error:UNSET_WORKFLOW_FILE":function(r){return"Nie ustawiono ścieżki do pliku konfiguracyjnego programatora."},"error:UNSET_FEATURE_PATH_1":function(r){return"Nie ustawiono pierwszej ścieżki do plików konfiguracyjnych driverów."},"error:UNSET_PROGRAMMER_FILE":function(r){return"Nie ustawiono ścieżki do pliku wykonywalnego programatora."},"error:MISSING_WORKFLOW_FILE":function(r){return"Nie znaleziono pliku konfiguracyjnego programatora."},"error:MISSING_FEATURE_FILE":function(r){return"Nie znaleziono pliku konfiguracyjnego drivera."},"error:DUPLICATE_FEATURE_FILE":function(r){return"Wykryto kilka plików konfiguracyjnych driverów dla danego kodu 12NC."},"error:CANCELLED":function(r){return"Anulowanie programowania."},"error:READING_FEATURE_FILE_TIMEOUT":function(r){return"Upłynięcie limitu czasu odczytywania pliku konfiguracyjnego drivera."},"error:MISSING_PROGRAMMER_FILE":function(r){return"Nie znaleziono pliku wykonywalnego programatora."},"error:PROGRAMMER_FILE_ERROR":function(r){return"Błąd podczas uruchamiania pliku wykonywalnego programatora."},"error:EXIT_CODE:-1":function(r){return"MultiOneWorkflow (-1): błąd aplikacji."},"error:EXIT_CODE:1":function(r){return"MultiOneWorkflow (1): klucz oprogramowania nie aktywowany."},"error:EXIT_CODE:4":function(r){return"MultiOneWorkflow (4): błąd weryfikacji."},"error:EXIT_CODE:5":function(r){return"MultiOneWorkflow (5): interfejs podany jako argument do pliku wykonywalnego programatora jest nieprawidłowy."},"error:EXIT_CODE:9":function(r){return"MultiOneWorkflow (9): nie znaleziono pliku konfiguracyjnego programatora."},"error:EXIT_CODE:10":function(r){return"MultiOneWorkflow (10): nieprawidłowy plik konfiguracyjny programatora."},"error:EXIT_CODE:20":function(r){return"MultiOneWorkflow (20): nie znaleziono pliku wspieranych urządzeń."},"error:EXIT_CODE:21":function(r){return"MultiOneWorkflow (21): nieprawidłowy plik wspieranych urządzeń."},"error:EXIT_CODE:30":function(r){return"MultiOneWorkflow (30): nie udało się stworzyć katalogu etykiet."},"error:EXIT_CODE:31":function(r){return"MultiOneWorkflow (31): nie udało się wygenerować danych etykiety."},"error:EXIT_CODE:32":function(r){return"MultiOneWorkflow (32): nie udało się wyeksportować danych etykiety."},"error:EXIT_CODE:101":function(r){return"MultiOneWorkflow (101): brak opcji drivera do zapisu."},"error:EXIT_CODE:102":function(r){return"MultiOneWorkflow (102): zapisywanie opcji drivera nie powiodło się."},"error:EXIT_CODE:150":function(r){return"MultiOneWorkflow (150): resetowanie krótkiego adresu urządzenia nie powiodło się."},"error:EXIT_CODE:151":function(r){return"MultiOneWorkflow (151): przywracanie ustawień fabrycznych DALI nie powiodło się (dalifactorynew)."},"error:EXIT_CODE:200":function(r){return"MultiOneWorkflow (200): nie znaleziono pliku konfiguracyjnego drivera."},"error:EXIT_CODE:201":function(r){return"MultiOneWorkflow (201): nieprawidłowy plik konfiguracyjny drivera."},"error:EXIT_CODE:202":function(r){return"MultiOneWorkflow (202): pusty plik konfiguracyjny drivera."},"error:EXIT_CODE:203":function(r){return"MultiOneWorkflow (203): wykryto zduplikowane opcje drivera."},"error:EXIT_CODE:300":function(r){return"MultiOneWorkflow (300): urządzenie nie obsługuje wszystkich opcji z pliku konfiguracyjnego."},"error:EXIT_CODE:301":function(r){return"MultiOneWorkflow (301): model urządzenia różni się od tego w pliku konfiguracyjnym drivera."},"error:EXIT_CODE:350":function(r){return"MultiOneWorkflow (350): hasło w pliku opcji drivera nie pasuje do hasła w urządzeniu."},"error:EXIT_CODE:351":function(r){return"MultiOneWorkflow (351): min. wartość ALO w urządzeniu jest większa niż wartość ALO w pliku opcji drivera."},"error:EXIT_CODE:400":function(r){return"MultiOneWorkflow (400): zapisywanie informacji identyfikacyjnych nie powiodło się."},"error:EXIT_CODE:500":function(r){return"MultiOneWorkflow (500): nie znaleziono urządzenia."},"error:EXIT_CODE:501":function(r){return"MultiOneWorkflow (501): znaleziono za dużo urządzeń."},"error:EXIT_CODE:502":function(r){return"MultiOneWorkflow (502): nie można wykonać wyszukiwania urządzeń."},"error:EXIT_CODE:503":function(r){return"MultiOneWorkflow (503): kilka urządzeń ma taki sam krótki adres."},"error:EXIT_CODE:504":function(r){return"MultiOneWorkflow (504): wykryto niewspierane urządzenie."},"error:EXIT_CODE:600":function(r){return"MultiOneWorkflow (600): brak opcji drivera do konwersji."},"error:EXIT_CODE:650":function(r){return"MultiOneWorkflow (650): brak opcji drivera do odczytu (nie ma opcji w pliku drivera pasujących do opcji w urządzeniu)."},"error:EXIT_CODE:651":function(r){return"MultiOneWorkflow (651): odczytywanie pliku opcji drivera nie powiodło się."},"error:EXIT_CODE:700":function(r){return"MultiOneWorkflow (700): nie podłączono interfejsu."},"error:EXIT_CODE:800":function(r){return"MultiOneWorkflow (800): niemożliwa konwersja danych opcji drivera."},"error:EXIT_CODE:900":function(r){return"MultiOneWorkflow (900): dany plik z harmonogramem jest nieprawidłowy i nie udało się go wczytać."},"error:EXIT_CODE:1000":function(r){return"MultiOneWorkflow (1000): nie znaleziono pliku bazy danych. Przeinstaluj MultiOne Workflow."},"error:SOL_PARSE_ERROR":function(r){return"SOL: Błąd podczas parsowania pliku programu."},"error:SOL_NO_COMMANDS":function(r){return"SOL: Brak komend ustawiających wartości parametrów."},"error:SOL_SEARCHING_COM_FAILURE":function(r){return"SOL: Błąd podczas wyszukiwania portu szeregowego."},"error:SOL_COM_NOT_FOUND":function(r){return"SOL: Nie znaleziono portu szeregowego."},"error:SOL_OPENING_COM_FAILURE":function(r){return"SOL: Błąd podczas otwierania portu szeregowego."},"error:SOL_SERIAL_PORT_FAILURE":function(r){return"SOL: Błąd portu szeregowego."},"error:SOL_INVALID_OPTION":function(r){return"SOL: Odczytana wartość różni się od wartości zaprogramowanej."},"error:SOL_NO_CONNECTION":function(r){return"SOL: Brak odpowiedzi od urządzenia. Sprawdź połączenie portu szeregowego."},"error:SOL_FEATURE_DISABLED":function(r){return"Ustawiona licencja nie ma opcji programowania Fortimo Solar."},"error:LPT_FILE_ERROR":function(r){return"Błąd podczas komunikacji LPT."},"error:LPT_START_TIMEOUT":function(r){return"Upłynięcie limitu czasu oczekiwania na sygnał uruchomienia programatora."},"error:T24VDC_FEATURE_DISABLED":function(r){return"Ustawiona licencja nie ma opcji testera 24V DC."},"error:TESTING_DISABLED":function(r){return"T24VDC: Opcja testowania jest wyłączona."},"error:TESTING_NOT_SOL":function(r){return"T24VDC: Znaleziono konfigurację drivera nieprawidłowego typu."},"error:TESTING_SEARCHING_COM_FAILURE":function(r){return"T24VDC: Błąd podczas wyszukiwania portu szeregowego."},"error:TESTING_COM_NOT_FOUND":function(r){return"T24VDC: Nie znaleziono portu szeregowego."},"error:TESTING_OPENING_COM_FAILURE":function(r){return"T24VDC: Błąd podczas otwierania portu szeregowego."},"error:TESTING_SERIAL_PORT_FAILURE":function(r){return"T24VDC: Błąd portu szeregowego."},"error:TESTING_PLC_FAILURE":function(r){return"T24VDC: Błąd PLC."},"error:TESTING_PLC_NO_CONNECTION":function(r){return"T24VDC: Nie udało się połączyć ze sterownikiem. Sprawdź ustawienia Modbus."},"error:TESTING_SDP_TIMEOUT":function(r){return"T24VDC: Upłynięcie limitu czasu oczekiwania na odpowiedź testera."},"error:TESTING_SDP_INVALID_RESPONSE":function(r){return"T24VDC: Otrzymano nieprawidłową odpowiedź od testera."},"error:TESTING_MAX_RESISTANCE":function(r){return"T24VDC: Przekroczono maksymalną wartość rezystancji."},"error:TESTING_MIN_POWER":function(r){return"T24VDC: Przekroczono minimalną wartość mocy."},"error:TESTING_MAX_POWER":function(r){return"T24VDC: Przekroczono maksymalną wartość mocy."},"error:REMOTE_SERVICE_TAG_FAILURE":function(r){return"Błąd podczas pobierania nowego Service Taga."},"error:INVALID_ITEM_QUANTITY":function(r){return"Wykryto nieprawidłowe ilości komponentów w aktualnym zleceniu."},"error:NOTHING_DONE":function(r){return"Nie wykonano żadnej operacji (puste zlecenie?)"},"log:GPRS:READING_ORDER_FILE":function(r){return"Odczytywanie pliku zlecenia: <code>"+n.v(r,"orderFile")+"</code>"},"log:GPRS:ORDER_FILE_READ":function(r){return"Odczytano <code>"+n.v(r,"length")+"B</code> pliku zlecenia."},"log:GPRS:READING_INPUT_TEMPLATE_FILE":function(r){return"Odczytywanie pliku szablonu konfiguracji programatora: <code>"+n.v(r,"inputTemplateFile")+"</code>"},"log:GPRS:INPUT_TEMPLATE_FILE_READ":function(r){return"Odczytano <code>"+n.v(r,"length")+"B</code> pliku szablonu konfiguracji programatora."},"log:GPRS:PARSING_INPUT_TEMPLATE":function(r){return"Przetwarzanie szablonu konfiguracji programatora..."},"log:GPRS:PARSING_INPUT_TEMPLATE_SUCCESS":function(r){return"Pomyślnie przetworzono szablon konfiguracji programatora."},"log:GPRS:PREPARING_INPUT_FILE":function(r){return"Przygotowywanie konfiguracji programatora..."},"log:GPRS:PREPARING_INPUT_FILE_SUCCESS":function(r){return"Pomyślnie przygotowano konfigurację programatora."},"log:GPRS:PROGRAMMER_FILE_STARTED":function(r){return"Uruchamianie programatora na porcie DALI <code>"+n.v(r,"daliPort")+"</code>: <code>"+n.v(r,"programmerFile")+"</code>"},"log:GPRS:READING_OUTPUT_FILE":function(r){return"Odczytywanie pliku wynikowego programatora: <code>"+n.v(r,"outputFile")+"</code>"},"log:GPRS:READING_OUTPUT_FILE_SUCCESS":function(r){return"Odczytano <code>"+n.v(r,"length")+"B</code> pliku wynikowego programatora."},"log:GPRS:COPYING_OUTPUT_FILE":function(r){return"Kopiowanie pliku wynikowego programatora..."},"log:GPRS:COPYING_OUTPUT_FILE_SUCCESS":function(r){return"Pomyślnie skopiowano plik wynikowy programatora."},"log:GPRS:VERIFICATION_STARTED":function(r){return"Rozpoczynanie weryfikacji..."},"log:GPRS:VERIFICATION_SKIPPED":function(r){return"Pomijanie weryfikacji..."},"error:GPRS:READING_ORDER_FILE_FAILURE":function(r){return"GPRS: Błąd podczas odczytywania pliku zlecenia."},"error:GPRS:READING_ORDER_FILE_TIMEOUT":function(r){return"GPRS: Upłynął limit czasu odczytywania pliku zlecenia."},"error:GPRS:READING_INPUT_TEMPLATE_FILE_FAILURE":function(r){return"GPRS: Błąd podczas odczytywania pliku szablonu konfiguracji programatora."},"error:GPRS:READING_INPUT_TEMPLATE_FILE_TIMEOUT":function(r){return"GPRS: Upłynął limit czasu odczytywania pliku szablonu konfiguracji programatora."},"error:GPRS:PARSING_INPUT_TEMPLATE_FAILURE":function(r){return"GPRS: Błąd podczas przetwarzania szablonu konfiguracji programatora."},"error:GPRS:PREPARING_INPUT_FILE_FAILURE":function(r){return"GPRS: Błąd podczas przygotowywania pliku konfiguracji programatora."},"error:GPRS:INVALID_OPTION":function(r){return"GPRS: Nieprawidłowa opcja konfiguracyjna."},"error:GPRS:PARSING_DRIVER_FILE_FAILURE":function(r){return"GPRS: Błąd podczas przetwarzania pliku konfiguracji drivera."},"error:GPRS:PROGRAMMER_FILE_UNSET":function(r){return"GPRS: Nie ustawiono ścieżki do pliku wykonywalnego programatora."},"error:GPRS:PROGRAMMER_FILE_MISSING":function(r){return"GPRS: Nie znaleziono pliku wykonywalnego programatora."},"error:GPRS:PROGRAMMER_FILE_FAILURE":function(r){return"GPRS: Błąd podczas uruchamiania pliku wykonywalnego programatora."},"error:GPRS:OUTPUT_FILE_MISSING":function(r){return"GPRS: Nie znaleziono pliku wynikowego programatora."},"error:GPRS:COPYING_OUTPUT_FILE_FAILURE":function(r){return"GPRS: Błąd podczas zapisywania pliku wynikowego programatora."},"error:GPRS:VERIFICATION_INPUT_FAILURE":function(r){return"GPRS: Błąd poczas kopiowania pliku wynikowego programatora do weryfikacji."},"error:GPRS:VERIFICATION_ERROR":function(r){return"GPRS: Plik wynikowy programatora nie przeszedł weryfikacji."},"error:GPRS:VERIFICATION_TIMEOUT":function(r){return"GPRS: Upłynął limit czasu weryfikacji pliku wynikowego programatora."},"error:GPRS:EXIT_CODE:-1":function(r){return"CityTouchIPT (-1): błąd aplikacji."},"log:GLP2:RESETTING_TESTER":function(r){return"Resetowanie testera GLP2-I..."},"log:GLP2:TEST_STEP_FAILURE":function(r){return"Przekroczono wartość graniczną 1 <code>"+n.v(r,"setValue")+"</code>: <code>"+n.v(r,"actualValue")+"</code> lub wartość graniczną 2: <code>"+n.v(r,"setValue2")+"</code>: <code>"+n.v(r,"actualValue2")+"</code>"},"error:GLP2:SETTING_DISABLED":function(r){return"GLP2: Opcja jest wyłączona w ustawieniach."},"error:GLP2:FEATURE_DISABLED":function(r){return"Aktualna licencja nie ma opcji testera GLP2-I."},"error:GLP2:TESTER_NOT_READY":function(r){return"GLP2: Tester nie jest gotowy."},"error:GLP2:RESETTING_TESTER_FAILURE":function(r){return"GLP2: Resetowanie testera nie powiodło się."},"error:GLP2:PROGRAM_NOT_RECOGNIZED":function(r){return"GLP2: Program nie został rozpoznany."},"error:GLP2:UNEXPECTED_RESPONSE":function(r){return"GLP2: Nieoczekiwana odpowiedź testera."},"error:GLP2:TEST_STEP_FAILURE":function(r){return"GLP2: Krok testowy zakończony niepowodzeniem."},"error:GLP2:BUSY_TESTER":function(r){return"GLP2: Tester jest zajęty lub wymaga testu BlackBox."},"error:GLP2:INVALID_CHECKSUM":function(r){return"GLP2: Nieprawidłowa suma kontrolna odpowiedzi testera."},"error:GLP2:INVALID_PARAMETERS":function(r){return"GLP2: Nieprawidłowe parametry testera."},"error:GLP2:INVALID_RESPONSE":function(r){return"GLP2: Nieprawidłowa odpowiedź testera."},"error:GLP2:NO_CONNECTION":function(r){return"GLP2: Brak połączenia z testerem."},"error:GLP2:RESPONSE_TIMEOUT":function(r){return"GLP2: Upłynął limit czasu oczekiwania na odpowiedź testera."},"error:GLP2:START_TIMEOUT":function(r){return"GLP2: Upłynął limit czasu oczekiwania na rozpoczęcie testu."},"error:GLP2:FAULT:1":function(r){return"GLP2 (1): Styk bezpieczeństwa przerwany."},"error:GLP2:FAULT:2":function(r){return"GLP2 (2): Uszkodzony bezpiecznik."},"error:GLP2:FAULT:3":function(r){return"GLP2 (3): Brak zdefiniowanego kroku testowego."},"error:GLP2:FAULT:4":function(r){return"GLP2 (4): Nieprawidłowe napięcie substitute-LKC."},"error:GLP2:FAULT:5":function(r){return"GLP2 (5): Zwarcie na badanym obiekcie."},"error:GLP2:FAULT:6":function(r){return"GLP2 (6): Błąd kontroli napięcia."},"error:GLP2:FAULT:7":function(r){return"GLP2 (7): Błąd danych."},"error:GLP2:FAULT:8":function(r){return"GLP2 (8): Przekroczono minimalne natężenie w teście LKC."},"error:GLP2:FAULT:9":function(r){return"GLP2 (9): Testowanie przerwane."},"error:GLP2:FAULT:10":function(r){return"GLP2 (10): Przekroczono minimalne napięcie w teście HV."},"error:GLP2:FAULT:11":function(r){return"GLP2 (11): Przekroczono maksymalne napięcie w teście HV."},"error:GLP2:FAULT:12":function(r){return"GLP2 (12): Przekroczono minimalne natężenie w teście HV."},"error:GLP2:FAULT:13":function(r){return"GLP2 (13): Błąd komunikacji z elektroniką HV."},"error:GLP2:FAULT:14":function(r){return"GLP2 (14): Kontrola napięcia HV nie powiodła się."},"error:GLP2:FAULT:15":function(r){return"GLP2 (15): Program nie istnieje."},"error:GLP2:FAULT:16":function(r){return"GLP2 (16): Błąd regulacji w teście HV."},"error:GLP2:FAULT:17":function(r){return"GLP2 (17): Aktywowano bezpiecznik maksymalnego napięcia testu LKC EN60601."},"error:GLP2:FAULT:18":function(r){return"GLP2 (18): Badany obiekt nadal pod napięciem (L-N)"},"error:GLP2:FAULT:19":function(r){return"GLP2 (19): Skręcona wtyczka sieciowa (podczas testowania bez transformatora izolującego)."},"error:GLP2:FAULT:20":function(r){return"GLP2 (20): Brak PE w przewodzie sieciowym."},"error:GLP2:FAULT:21":function(r){return"GLP2 (21): Drukarka na porcie LPT1 nie jest gotowa!"},"error:GLP2:FAULT:22":function(r){return"GLP2 (22): Wysokie napięcie wyłączone (włącznik z kluczykiem)."},"error:GLP2:FAULT:23":function(r){return"GLP2 (23): Przełącznik termiczny wysokiego napięcia został załączony."},"error:GLP2:FAULT:24":function(r){return"GLP2 (24): Urządzenie nie jest włączone do pracy."},"error:GLP2:FAULT:25":function(r){return"GLP2 (25): Maksymalny prąd pierwotny testu HV."},"error:GLP2:FAULT:26":function(r){return"GLP2 (26): Brak fazy zewnętrznego napięcia FCT lub jest nieprawidłowo spolaryzowana."},"error:GLP2:FAULT:27":function(r){return"GLP2 (27): Otwarta pokrywa ochronna."},"error:GLP2:FAULT:28":function(r){return"GLP2 (28): Brak obiektu do badania."},"error:GLP2:FAULT:29":function(r){return"GLP2 (29): Sekwencja testowa zgłosiła błąd."},"error:GLP2:FAULT:30":function(r){return"GLP2 (30): Błąd regulacji temperatury (krok testowy TMP)."},"error:GLP2:FAULT:31":function(r){return"GLP2 (31): Błąd testu referencji FI."},"log:FL:MONITORING":function(r){return"Monitorowanie czasu świecenia <code>"+n.v(r,"count")+"</code> "+n.p(r,"count",0,"pl",{one:"świetlówki",other:"świetlówek"})+"..."},"log:FL:LIGHTING_TIME":function(r){return n.v(r,"no")+". świetlówka świeciła nieprzerwanie przez <code>"+n.v(r,"duration")+"</code> ms."},"error:FL:FEATURE_DISABLED":function(r){return"Aktualna licencja nie ma opcji sprawdzania świetlówek."},"error:FL:LIGHTING_TIME_TOO_SHORT":function(r){return"FL: Zbyt krótki czas świecenia."},"log:FT:STARTED":function(r){return"Rozpoczynanie testowania ramki..."},"log:FT:SUCCESS":function(r){return"Pomyślnie ukończono testowanie ramki w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:FT:FAILURE":function(r){return"Zakończono testowanie ramki w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:FT:CONNECTING":function(r){return"Nawiązywanie połączenia z testerem..."},"log:FT:RESETTING":function(r){return"Resetowanie testera..."},"log:FT:PROGRAMMING":function(r){return"Programowanie testera..."},"log:FT:CHECKING":function(r){return"Sprawdzanie obwodu ochronnego..."},"error:FT:INVALID_SERIAL_PROXY_ADDRESS":function(r){return"FT: Nieprawidłowy adres serwera ser2net."},"error:FT:CONNECTING_FAILURE":function(r){return"FT: Błąd połączenia z testerem."},"error:FT:SDP_TIMEOUT":function(r){return"FT: Upłynięcie limitu czasu oczekiwania na odpowiedź testera."},"error:FT:SDP_INVALID_RESPONSE":function(r){return"FT: Otrzymano nieprawidłową odpowiedź od testera."},"error:FT:PE_FAILURE":function(r){return"FT: Nieprawidłowy obwód ochronny."},"log:HID:STARTED":function(r){return"Rozpoczynanie sprawdzania lamp HID..."},"log:HID:SUCCESS":function(r){return"Pomyślnie ukończono sprawdzanie lamp HID w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:HID:FAILURE":function(r){return"Zakończono sprawdzanie lamp HID w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:HID:WAITING":function(r){return"Oczekiwanie na "+n.v(r,"hidLampCount")+" "+n.p(r,"hidLampCount",0,"pl",{one:"lampę",few:"lampy",other:"lamp"})+" HID..."},"hidLamps:error:NO_CONNECTION":function(r){return"Brak połączenia z<br>serwerem zewnętrznym!"},"hidLamps:error:TIMEOUT":function(r){return"Upłynął limit czasu<br>oczekiwania na odpowiedź!"},"hidLamps:error:DB_FAILURE":function(r){return"Błąd bazy danych!"},"hidLamps:error:UNKNOWN_ORDER_NO":function(r){return"Nieznane zlecenie!"},"hidLamps:error:UNKNOWN_HID_LAMP":function(r){return"Nieznana lampa HID!"},"hidLamps:error:NO_HID_LAMPS":function(r){return"Zlecenie bez lamp HID!"},"hidLamps:error:INVALID_HID_LAMP":function(r){return"Nieprawidłowe ID lampy HID!"},"log:WEIGHT:STARTED":function(r){return"Rozpoczynanie ważenia komponentu..."},"log:WEIGHT:SUCCESS":function(r){return"Pomyślnie ukończono ważenie komponentu w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:WEIGHT:FAILURE":function(r){return"Zakończono ważenie komponentu w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu: <code>"+n.v(r,"error")+"</code>"},"log:WEIGHT:SCANNING":function(r){return"Oczekiwanie na zeskanowanie kodu komponentu..."},"log:WEIGHT:SCANNED":function(r){return"Zeskanowano: <code>"+n.v(r,"scanValue")+"</code>"},"log:WEIGHT:CHECKING_COMPONENT":function(r){return"Sprawdzanie komponentu <code>"+n.v(r,"nc12")+"</code>..."},"log:WEIGHT:WEIGHING":function(r){return"Ważenie komponentu <code>"+n.v(r,"component")+"</code>. Oczekiwana waga: <code>"+n.v(r,"weight")+"</code>g"},"log:WEIGHT:WEIGHED":function(r){return"Rzeczywista waga: <code>"+n.v(r,"weight")+"</code>g"},"error:WEIGHT:SCAN_FAILURE":function(r){return"Zeskanowano nieprawidłowy kod komponentu."},"error:WEIGHT:DB_FAILURE":function(r){return"Błąd bazy danych podczas sprawdzania komponentu przez zewnętrzny serwer."},"error:WEIGHT:ORDER_NOT_FOUND":function(r){return"Zeskanowany komponent nie istnieje w wybranym zleceniu."},"error:WEIGHT:WEIGHT_NOT_FOUND":function(r){return"Brak zdefiniowanej wagi komponentu."},"error:WEIGHT:SN_ALREADY_USED":function(r){return"Numer seryjny komponentu został już użyty."},"error:WEIGHT:BAD_RESPONSE":function(r){return"Nieprawidłowa odpowiedź z serwera zewnętrznego."},"error:WEIGHT:TIMEOUT":function(r){return"Upłynięcie limitu czasu oczekiwania na zważenie komponentu."},"log:MRL:STARTED":function(r){return"Rozpoczynanie testu..."},"log:MRL:SUCCESS":function(r){return"Pomyślnie ukończono test w ciągu <code>"+n.v(r,"duration")+"</code>."},"log:MRL:FAILURE":function(r){return"Zakończono test w ciągu <code>"+n.v(r,"duration")+"</code> z powodu błędu."},"log:MRL:WIRING_TEST_STARTED":function(r){return"Rozpoczynanie testu oprzewodowania..."},"log:MRL:WIRING_TEST:FINISHED":function(r){return"Zakończono test oprzewodowania w ciągu <code>"+n.v(r,"duration")+"</code>..."},"log:MRL:ELECTRICAL_TEST:STARTED":function(r){return"Rozpoczynanie testu elektrycznego..."},"log:MRL:ELECTRICAL_TEST:FINISHED":function(r){return"Zakończono test elektryczny w ciągu <code>"+n.v(r,"duration")+"</code>..."},"settings:tab:clients":function(r){return"Klienci"},"settings:tab:notifier":function(r){return"Powiadomienia"},"settings:appVersion":function(r){return"Aktualna wersja aplikacji Walkner Xiconf"},"settings:notifier:enabled":function(r){return"Powiadamianie włączone"},"settings:notifier:emptyLeds":function(r){return"Powiadamianie o zleceniach bez driverów z zerową ilością zeskanowanych płytek LED"},"settings:notifier:emptyHids":function(r){return"Powiadamianie o zleceniach bez driverów z zerową ilością zeskanowanych lamp HID"},"settings:notifier:delay":function(r){return"Opóźnienie powiadomienia [min]"},"settings:notifier:nameFilter":function(r){return"Ignorowanie powiadomień po nazwie wyrobu"}}});