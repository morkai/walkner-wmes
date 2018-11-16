define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\n  <h1>v0.127.1</h1>\n  <h2>'),__append(time.format("2018-11-01","LL")),__append("</h2>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Dodano automatyczne odświeżanie listy magazynierów po zmianie użytkowników.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nadpisywanie wartości 'Status malarnii' oraz '4M' podczas importu zleceń z SAP.</li>\n  </ul>\n  <h3>Dokumentacja > Dokumenty</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprawidłowe pozycjonowanie szczegółów wybranego dokumentu po zmianie katalogu,\n      na katalog, w którym wybrany dokument również się znajduje.</li>\n    <li>Zmieniono szerokość panelu z drzewem katalogów z 585px do 405px.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zablokowano możliwość logowania do syetemu w trybie wsadowym.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.127.0</h1>\n  <h2>"),__append(time.format("2018-10-28","LL")),__append("</h2>\n  <h3>Baza PFEP</h3>\n  <ul>\n    <li>Zmieniono etykiety oraz wymagalność niektórych pól.</li>\n    <li>Zmieniono wyświetlanie wartości liczbowych tak, aby wyświetlane były w formacie przeglądarki wybranym przez\n      użytkownika.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Dodano nowe pole importowane z SAP: Ostatnia zmiana przez - kto dokonał ostatniej zmiany w zleceniu.</li>\n    <li>Dodano nowe pole: Status malarnii. Wartość jest kopiowana ze zlecenia nadrzędnego malarnii lub określana\n      na podstawie wszystkich zleceń malarnii mających jako zlecenie nadrzędne dane zlecenie (np. w przypadku, gdy\n      zlecenie malarnii ma inną datę niż zlecenie nadrzędne).</li>\n  </ul>\n  <h3>Plany godzinowe</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera.</li>\n    <li>Zmieniono algorytm aktualizacji wartości poprzez formualrz edycji planu tak, aby wyeliminować sytuacje, gdy\n      wartość wcześniejsza nadpisywała wartość późniejszą w przypadku szybkiej zmiany wartości.</li>\n  </ul>\n  <h3>Plany dzienne</h3>\n  <ul>\n    <li>Dodano nagłówki do całkowitych statystyk planu.</li>\n    <li>Dodano nowe ustawienie: Ignorowane WorkCentra.</li>\n  </ul>\n  <h3>Sprawdzanie komponentów</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieodświeżanie się użytej na linii strategii po dokonaniu w niej zmian.</li>\n    <li>Zmieniono pole 'Wzorzec' na 'Wzorzec etykiety'.</li>\n    <li>Zmieniono pole '12NC komponentu' na 'Wzorzec komponentu' - pole przyjmuje teraz wartość 12NC lub wyrażenie\n      regularce dopasowujące po 12NC i nazwie komponentu.</li>\n    <li>Dodano nowe pole: Aktywna?.</li>\n    <li>Dodano możliwość sprawdzania wszystkich sztuk danego komponentu w każdej sztuce produktu.</li>\n    <li>Dodano specjalne tagi do pól 'Opis' oraz 'Wzorzec etykiety':\n      <ul>\n        <li><code>@COMPONENT.ITEM@</code> - nr dopasowanego komponentu,</li>\n        <li><code>@COMPONENT.12NC@</code> - 12NC dopasowanego komponentu,</li>\n        <li><code>@COMPONENT.NAME@</code> - nazwa dopasowanego komponentu,</li>\n        <li><code>@ORDER.NO@</code> - nr zlecenia,</li>\n        <li><code>@ORDER.12NC@</code> - 12NC zlecenia,</li>\n        <li><code>@HID.ID@</code> - ID oprawy HID przypisane do dopasowanego komponentu.</li>\n      </ul>\n    </li>\n    <li>Dodano możliwość definiowania wirtualnych komponentów do sprawdzenia za pomocą pustego pola\n      'Wzorzec komponentu'.</li>\n    <li>Dodano możliwość ograniczenia strategii do konkretnych linii produkcyjnych.</li>\n  </ul>\n  <h3>Drukarki</h3>\n  <ul>\n    <li>Dodano nowe tagi: Ogólna: Tekst oraz Oprawy HID.</li>\n    <li>Dodano możliwość sprawdzania wszystkich sztuk danego komponentu w każdej sztuce produktu.</li>\n    <li>Dodano specjalne ustawienie <code>Line:{ID linii}:{IP drukarki}:{port drukarki}</code> umożliwiający zdefiniowanie\n      różnych drukarek ZPL po TCP/IP dla różnych linii produkcyjnych.</li>\n  </ul>\n  <h3>Powody opóźnień</h3>\n  <ul>\n    <li>Dodano nowe pole: Kategoria DRM.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Zmieniono ustawienie 'Przesunięcie godzinowe danych' tak, aby można było przypisać różne wartośsci do różnych MRP\n      zleceń.</li>\n    <li>Zmieniono ustalanie koloru tła zlecenia w tabeli zleceń tak, aby zlecenia, które są aktualnie potwierdzone miały\n      zawsze kolor zielony.</li>\n    <li>Zmieniono zachowanie pokazywania historii zlecenia po kliknięciu na wiersz w tabeli tak, aby automatycznie\n      zaznaczane było pole 'Powód opóźnienia' w formularzu komentarza, jeżeli użytkownik kliknie na komórkę\n      'Powód opóźnienia' w tabeli.</li>\n    <li>Zmieniono wartości 'Produkcja' oraz 'End2End' tak, aby wyświetlane były do jednego miejsca po przecinku.</li>\n    <li>Dodano nowe wykresy: 4M oraz Kategoria DRM.</li>\n    <li>Dodano nową opcję wyświetlania: Zera - Uwzględniaj/Dziura/Ignoruj.</li>\n  </ul>\n  <h3>Zdarzenia</h3>\n  <ul>\n    <li>Dodano brakujące tłumaczenia zdarzeń.</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Dodano funkcję drukowania etykiet po udanym teście na liniach AV.</li>\n  </ul>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Dodano nowe pola: Zmiana oraz Osoba obserwowana zatrudniona przez.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niedziałanie formularza edycji dla niektórych ról użytkowników.</li>\n  </ul>\n  <h3>Dokumentacja > Dokumenty</h3>\n  <ul>\n    <li>Zmieniono czcionkę 15NC dokumentu w trybie listy na czcionkę równej szerokości.</li>\n    <li>Dodano specjalny dokument 'Layout', do którego odnośnik znajduje się w menu 'Produkcja'.</li>\n    <li>Dodano możliwość obserwowania dokumentów. Użytkownicy obserwujący dokument zostaną powiadomieni e-mailem,\n      jeżeli dany dokument zostanie zmodyfikowany.</li>\n  </ul>\n  <h3>Plan magazynu</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas wydruku etykiet.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano wsparcie do zamykania wszystkich okien dialogowych po zeskanowaniu wartości `&lt;ESC>`\n      lub `1337000027`.</li>\n  </ul>\n  <h3>Kanban</h3>\n  <ul>\n    <li>Poprawiono brak odstępu między tabelą kolejki wydruków a paginacją.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niepojawianie się menu kontekstowego.</li>\n    <li>Zmieniono menu kontekstowe w trybie wsadowym tak, aby było bardziej przyjazne dla dotyku: pozycje niepotrzebne\n      są niewidoczne i całe menu jest większe.</li>\n    <li>Dodano możliwość aktywacji menu kontekstowego przez przytrzymanie lewego przycisku myszy (lub dotyku) przez\n      300ms.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zaktualizowano środowisko i pakiety zależne</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.126.0</h1>\n  <h2>"),__append(time.format("2018-10-07","LL")),__append("</h2>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieresetowanie grupy dla zleceń, które były kandydatem do trafnienia na linię, ale\n      ostatecznie się na niej nie znalazły i wróciły do puli zleceń do rozplanowania.</li>\n  </ul>\n  <h3>Magazyn</h3>\n  <ul>\n    <li>Zmieniono klucz powiązania etapu ze zleceniem magazynu z 'nr zlecenia:nr grupy:linia' na\n      'nr zlecenia:kolejny nr:linia' w celu ograniczenia sytuacji, w których wybrana wartość jest utracona po zmianach\n      w planie dziennym.</li>\n    <li>Dodano filtr 'Linie produkcyjkne'.</li>\n    <li>Dodano możliwość eksportu zleceń.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Zmieniono eksportowanie zleceń tak, aby pod uwagę brany był aktualny filtr farby.</li>\n  </ul>\n  <h3>Plany godzinowe</h3>\n  <ul>\n    <li>Zmieniono algorytm aktualizacji wartości planu tak, aby zmiany wykonywały się jedna po drugiej a nie równolegle,\n      w celu ograniczenia błędu zapisu poza kolejnością.</li>\n  </ul>\n  <h3>Produkcja > Numery seryjne</h3>\n  <ul>\n    <li></li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Dodano kolumnę 'Linia' do listy wyników inspekcji.</li>\n    <li>Dodano flagę 'Wymagane zlecenie?' do rodzajów inspekcji.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono przybliżanie i powiększanie dokumentu za pomocą dotyku.</li>\n    <li>Dodano filtr 'Data dokumentu' do katalogu dokumentów.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n  </ul>\n  <h3>Minuty dla Bezpieczeństwa</h3>\n  <ul>\n    <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n  </ul>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niewyświetlanie szczegółów karty po kliknięciu myszką na wartości kolumn:\n      Co zaobserwowano, Ryzykowne warunki w miejscu pracy, Trudne do zmiany zachowania oraz\n      Trudne do zmiany warunki pracy.</li>\n    <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n    <li>Dodano filtr 'Linia' do listy kart obserwacji.</li>\n    <li>Dodano nowe pole: Miejsce pracy obserwatora.</li>\n    <li>Dodano do raportu wykres 'Ilość przeprowadzonych obserwacji wg działów (miejsce pracy obserwatora)'.</li>\n  </ul>\n  <h3>Baza testów > Oprawy HID</h3>\n  <ul>\n    <li>Zmieniono maksymalną długość ID lampy HID z 13 znaków do 20 znaków.</li>\n    <li>Dodano oddzielne uprawnienie do zarządzania oprawami HID.</li>\n  </ul>\n  <h3>Baza PFEP</h3>\n  <ul>\n    <li>Zmieniono uprawnienia do odczytu tak, aby mieli je wszyscy zalagowani użytkownicy.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano możliwość sprawdzania komponentów po skanowaniu nr seryjnego zlecenia.</li>\n  </ul>\n  <h3>Wydajność godzinowa</h3>\n  <ul>\n    <li>Dodano możliwość sprawdzania komponentów po skanowaniu nr seryjnego zlecenia.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.125.0</h1>\n  <h2>"),__append(time.format("2018-09-16","LL")),__append("</h2>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wyświetlenie dymku z informacjami o dodanym zleceniu w historii zmian planu.</li>\n    <li>Zmieniono sortowanie zleceń w grupach tak, aby zlecenia niemalowane lub pomalowane były przed zleceniami\n      niepomalowanymi.</li>\n    <li>Zmieniono generowanie planów tak, aby nie rozpoczynało się w trakcie aktywnych operacji zmieniających dane\n      zleceń z SAP.</li>\n    <li>Zmieniono generowanie aktywnych planów tak, aby generowane były plany do najpóźniejszego dnia, dla którego\n      w bazie zleceń znajduje się przynajmniej jedno zlecenie z przynajmniej jednym komponentem, ze statusem REL\n      oraz bez statusów TECO, DLFL lub DLT.</li>\n    <li>Zmieniono status usuniętego zlecenia tak, aby wskazywał dodatkowo zlecenia ze statusem DLT lub DLFL\n      (a nie tylko TECO).</li>\n    <li>Zmieniono sortowanie listu zleceń MRP w planie tak, aby zlecenia usunięte znajdowały się na końcu listy.</li>\n    <li>Dodano nową ikonę statusu zleceń: <i class=\"fa fa-wrench\"></i> ETO.</li>\n    <li>Dodano nowe ustawienie: Statusy zrobionego zlecenia - zlecenia, które otrzymają ten status pozostaną na liście\n      zleceń planu, ale nie będą rozplanowywane (wcześniej zostały usuwane z planu).</li>\n    <li>Dodano nową statystykę do planu produkcji: Ilość zleceń.</li>\n    <li>Dodano nową statystykę do planu magazynu: Ilość zleceń wg statusów.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd podczas generowania kolejki mogący zresetować status zlecenia z powodu losowej kolejności\n      podzleceń.</li>\n    <li>Zmieniono generowanie kolejki tak, aby zlecenia, których data zmieniła się, trafiały do nowej kolejki.</li>\n    <li>Zmieniono generowanie kolejki tak, aby zlecenia w większości przypadków były anulowane zamiast usuwane\n      z kolejki.</li>\n    <li>Dodano ilości do pomalowania wg statusów do listy farb. Lista farb jest teraz sortowana malejąco wg ilości\n      pozostałej do pomalowania.</li>\n  </ul>\n  <h3>Baza Kanban</h3>\n  <ul>\n    <li>Zmieniono kod QR z wartością Pusty/Pełny na etykietach Pusty/Pełny na kod kreskowy w formacie Code 128.</li>\n    <li>Zmieniono słownik Obszarów zaopatrzenia tak, aby możliwe było dodanie kilku Obszarów z taką samą nazwą,\n      ale różniących się nową wartością WorkCenter.</li>\n    <li>Zmieniono listę linii w Obszarach zaopatrzenia tak, aby można było rezerwować pozycję linii (np. w razie\n      dezaktywacji linii).</li>\n    <li>Zmieniono importowanie CCN z SAP tak, aby nieistniejące rekordy były usuwane.</li>\n    <li>Zmieniono wyświetlanie rozmarów pojemnika w dymku z Szerokość x Wysokość x Długość\n      na Długość x Szerokość x Wysokość.</li>\n    <li>Dodano nową kolumnę: Komentarz.</li>\n    <li>Dodano nową kolumnę: Lokalizacja magazynowa (nowa) - wartość przypisywana do komponentów.</li>\n    <li>Dodano nową kolumnę: WorkCenter.</li>\n    <li>Dodano nową kolumnę: Rodzaj pojemnika - wartość wybierana z nowego słownika.</li>\n    <li>Dodano nową kolumnę: Kolor znacznika - wartość przypisywana do rzędu lokalizacji magazynowej.</li>\n    <li>Dodano nową kolumnę: Ilość Kanban ID w SAP - wartość ma czerwone tło, jeżeli jest za mało kanbanów\n      lub żółte, jeżeli za dużo.</li>\n    <li>Dodano możliwość eksportu tabeli.</li>\n    <li>Dodano możliwość importu danych CCN z arkusza XLSX.</li>\n    <li>Dodano możliwość importu danych komponentów z arkusza XLSX.</li>\n    <li>Dodano możliwość drukowania etykiet pogrupowanych wg stanowisk na liniach.</li>\n    <li>Dodano możliwość szybkiego druku po ID kanbana.</li>\n  </ul>\n  <h3>Raporty > CLIP (stary)</h3>\n  <ul>\n    <li>Usunięto raport.</li>\n  </ul>\n  <h3>Raporty > CLIP (nowy)</h3>\n  <ul>\n    <li>Dodano możliwość eksportu zleceń CLIP jako akcję w menu wykresów.</li>\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Zmieniono szablon ankiety tak, aby obok imienia i nazwiska przełożonego wyświetlana była krótka nazwa wydziału,\n      a nie ID.</li>\n  </ul>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wybranie kierowników.</li>\n  </ul>\n  <h3>Strategie dostarczania komponentów</h3>\n  <ul>\n    <li>Dodano nowy moduł słownikowy.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Dodano eksport listy zleceń.</li>\n    <li>Dodano do listy zleceń filtry: Wymagane statusy oraz Ignorowane statusy.</li>\n    <li>Dodano kolumnę 'Strategia dostarczania komponentu' do listy komponentów zlecenia.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono nazwę pola 'Nr karty' na 'Nr karty (KD)'.</li>\n    <li>Dodano nowe pole: ID karty.</li>\n    <li>Dodano możliwość logowania za pomocą konta @signify.com.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Zmieniono wyszukiwanie magazynierów tak, aby zeskanowana wartość sprawdzana była wobec nr personalnego,\n      nr karty (KD) i ID karty użytkownika.</li>\n  </ul>\n  <h3>Produkcja > Numery seryjne</h3>\n  <ul>\n    <li>Poprawiono błąd podczas obliczania taktu dla numeru seryjnego, jeżeli w czasie skanowania danej sztuki\n      istniał niezakończony przestój.</li>\n  </ul>\n  <h3>Produkcja > Przestoje</h3>\n  <ul>\n    <li>Dodano nowy filtr listy: Kontroler MRP zlecenia.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Dodano możliwość zablokowania interfejsu użytkownika w celu zapobiegnięcia przypadkowych kliknięć.</li>\n    <li>Dodano kolumnę 'Strategia dostarczania komponentu' do listy komponentów zlecenia.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Dodano użytkownikom z funkcją 'Magazynier obsługi prod.' takie same uprawnienia jak 'Lider'.</li>\n  </ul>\n  <h3>Baza PFEP</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niewyświetlanie się formatki w trybie wsadowym, jeżeli linia została dezaktywowana.</li>\n    <li>Zmieniono sprawdzanie spigota tak, aby pod uwagę brany był także komponent z 12NC w nazwie.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.124.0</h1>\n  <h2>"),__append(time.format("2018-07-01","LL")),__append('</h2>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Poprawiono zliczanie całkowitych wartości wskaźników w raporcie Wskaźniki tak, aby były równe sumie poszczególnych\n      wartości na wykresach.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Zmieniono grupowanie linii tak, aby grupy bez komponentów nie były ignorowane.</li>\n    <li>Dodano wskaźnik procentowego wykonania planu.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono importowanie zleceń tak, aby niekompletne zrzuty były ignorowane, dzięki czemu brakujące zlecenia nie\n      będą usuwane z bazy.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprawidłowe wyświetlanie klawiatury ekranowej w trybie wsadowym.</li>\n    <li>Dodano możliwość filtrowania listy wg farb.</li>\n    <li>Dodano możliwość ustawiania drop zone dla farb.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono pola z użytkownikami w formularzu wyniku tak, aby dezaktywowani użytkownicy nie byli wyświetlani.</li>\n  </ul>\n  <h3>Baza Kanban</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.123.0</h1>\n  <h2>'),__append(time.format("2018-05-20","LL")),__append('</h2>\n  <h3>Plany magazynu</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niewyświetlanie planu magazynu po zmianie ustawienia\n      <em>Minimalna ilość sztuk w grupie</em>.</li>\n    <li>Zmieniono ustawianie <em>Etapu</em> tak, aby ustawienie <em>Wysyłki</em> wymagało podania\n      <em>Wysyłanej ilości</em>.</li>\n    <li>Dodano automatyczne dodawanie komentarza do zlecenia po ustawieniu <em>Etapu</em> danego zlecenia\n      na <em>Wysyłka</em>.</li>\n  </ul>\n  <h3>Plany dzienne</h3>\n  <ul>\n    <li>Dodano akcję <em>Wymuś utworzenie planu</em> na liście planów, umożliwiającą stworzenie planu na przyszły dzień.\n      Akcja dostępna tylko dla Super administratorów.</li>\n  </ul>\n  <h3>Minuty dla Bezpieczeństwa</h3>\n  <ul>\n    <li>Usunięto pole: Reguły zachowania.</li>\n    <li>Zmieniono pole <em>Jak muszą się zachować, aby nic się nie stało?</em>\n      na <em>Prawidłowe zachowanie/Reguły zachowania</em>.</li>\n    <li>Dodano nowe pole: Status.</li>\n    <li>Dodano nowy raport: Ilość minutek.</li>\n    <li>Dodano możliwość przypisywania ZPW oraz Usprawnień do Minutek.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Dodano nowe uprawnienie: Super administrator - użytkownik z tym uprawnieniem ma dostęp do wszystkich funkcji.</li>\n    <li>Dodano funkcjonalność anonimizacji danych użytkownika - podczas anonimizacji wszystkie dane na koncie użytkownika\n      są usuwane, a imię i nazwisko zapisane w bazach danych różnych modułów zamieniane jest na <code>?</code>.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono ustawienie <em>Ogranicz skanowanie numerów seryjnych do następujących linii</em> na\n      <em>Wyłącz skanowanie na następujących liniach</em>. Od teraz skanowanie jest domyślnie włączone na wszystkich\n      liniach.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować niezapisanie się danych o wykonywanych MRP we wszystkich jednostkach\n      organizacyjnych w poprzednim dniu.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd przy eksporcie danych do formatu XLSX powodujący niewyświetlanie dat w niektórych przypadkach.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.122.0</h1>\n  <h2>'),__append(time.format("2018-04-29","LL")),__append("</h2>\n  <h3>Plany dzienne</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie komunikatu o pustym planie, jeżeli dane planu zostały pobrane przed\n      ustawieniami.</li>\n    <li>Poprawiono nieprawidłowy kolor tła zleceń usuniętych (TECO) w trybie wysokiego kontrastu.</li>\n    <li>Zmieniono formularz 'Ustawianie dostępnych linii' na stronie planu tak, aby nie można było usunąć wszystkich linii\n      z danego MRP (co skutkowałoby usunięciem MRP z planu). Od teraz MRP można usunąć tylko z poziomu ustawień planu.</li>\n    <li>Zmieniono pobieranie niekompletnych zleceń z poprzedniego dnia tak, aby ignorowane były zlecenia, dla których\n      różnica między datą zlecenia a datą planu jest większa od 7 dni.</li>\n    <li>Dodano nowe ustawienie: Godzina rozpoczęcia opóźnionych zleceń (godzina, od której rozplanowywane są ręcznie\n      dodane, pilne zlecenia (opóźnione)).</li>\n    <li>Dodano możliwość dodawania do kolejki zleceń MRP wielu opóźnionych zleceń na raz.</li>\n    <li>Dodano możliwość grupowania linii wg komponentów zlecenia.</li>\n  </ul>\n  <h3>Plany magazynu</h3>\n  <ul>\n    <li>Poprawiono błąd podczas dzielenia zleceń na grupy powodujący, że niektóre części zlecenia mogły należeć do tej\n      samej grupy.</li>\n    <li>Poprawiono błąd podczas dzielenia zleceń na grupy powodujący, że niektóre części zlecenia mogłby zaczynać się\n      w jednej grupie i kończyć w drugiej (zamiast zaczynać i kończyć się w jednej grupie, a w drugiej następna\n      część).</li>\n    <li>Zmieniono przypisywanie etapu dla zlecenia do kombinacji wartości\n      <code>nr zlecenia+nr grupy+linia</code> (było <code>nr zlecenia+czas startu+linia</code>),\n      aby zminimalizować szansę utraty ustawionego etapu po zmianie planu.</li>\n    <li>Dodano nowe ustawienie: Minimalna ilość sztuk w grupie (jeżeli ilość sztuk zlecenia\n      w pierwszej/ostatniej grupie danej linii będzie mniejsza lub równa podanej wartości, to grupa ta zostanie\n      scalona z następną/poprzednią grupą).</li>\n  </ul>\n  <h3>Inspekcja jakości</h3>\n  <ul>\n    <li>Zmieniono wysyłanie powiadomień o wynikach inspekcji tak, aby powiadamiani byli wszyscy kierownicy mający\n      przypisany dany wydział w bazie użytkowników oraz w matrycy odpowiedzialności.</li>\n    <li>Zmieniono formularz edycji tak, aby Inspektorzy mogli zmieniać wartość 'Przyczyna źródłowa'.</li>\n    <li>Zmieniono formularz edycji tak, aby wszyscy Mistrzowie i Liderzy mogli zmieniać 'Akcje korygujące'.</li>\n  </ul>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Zmieniono stronę szczegółów karty obserwacji tak, aby panele 'Ryzykowne warunki w miejscu pracy/Trudności zmian'\n      były widoczne nawet jak są puste, ale do karty przypisane zostało ZPW/Usprawnienie.</li>\n  </ul>\n  <h3>Drukarki</h3>\n  <ul>\n    <li>Dodano nowy słownik: Drukarki - po dodaniu do WMES drukarek zdefiniowanych w systemie operacyjnym, można wysyłać\n      wydruki generowane w WMES bezpośrednio na wybraną drukarkę (zamiast otwierać PDF w przeglądarce).</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.121.0</h1>\n  <h2>"),__append(time.format("2018-03-31","LL")),__append("</h2>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Usunięto możliwość wyłączania najnowszych danych w planie produkcji.</li>\n    <li>Usunięto funkcjonalność Drop zone.</li>\n    <li>Zmieniono generator planu tak, aby wybieranie linii do podziału dużych zleceń brało pod uwagę pozostały\n      dostępny czas na linii.</li>\n    <li>Zmieniono 'Zrobioną ilość' zleceń w planie tak, aby ich wartość brana była z ilośći wykonanej dla operacji\n      wybranej do planowania, a nie z całkowitej zrobionej ilości zlecenia SAP.\n    <li>Zmieniono plan linii w wersji do wydruku tak, aby plan godzinowy był zawsze widoczny, a nie tylko wtedy, gdy\n      jest wolne miejsce na ostatniej stronie.</li>\n    <li>Zmieniono plan linii w wersji do wydruku tak, aby do każdego zlecenia wyświetlane były wszystkie ikony\n      statusów.</li>\n    <li>Zmieniono plan magazynu tak, aby wyświetlał jedną listę zleceń dla wybranych MRP.</li>\n    <li>Zmieniono filtr 'Wybrane MRP' w planie magazynu na filtr 'Wybrane MRP/Ignorowane MRP/Moje/Magazyn'. MRP magazynu\n      można wybrać w ustawiniach.</li>\n    <li>Zmieniono listy zleceń do rozplanowania oraz zleceń opóźnionych tak, aby miały maksymalną wysokość. Po osiągnięciu\n      maksymalnej wysokości lista robi się przewijalna.</li>\n    <li>Dodano wyświetlanie ostatniego komentarza zlecenia w dymkach zleceń do rozplanowania i zleceń rozplanowanych.</li>\n    <li>Dodano możliwość dzielenia zleceń dłuższych od określonej ilości godzin na dodatkowe części.</li>\n    <li>Dodano możliwość włączenia trybu wysokiego kontrastu w planie magazynu.</li>\n    <li>Dodano możliwość wyboru etapu na jakim znajduje się każde zlecenie w planie magazynu.</li>\n    <li>Dodano oznaczanie zleceń ze statusem 'TECO'.</li>\n    <li>Dodano możliwość ustawiania kilku zakresów aktywności dla każdej linii.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono sposób odczytywania ilości stron w dokumentach PDF konwertowanych na obrazy.</li>\n    <li>Dodano listę zaplanowanych zleceń do formularza wybierania zlecenia/dokumentu.</li>\n  </ul>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Zmieniono uprawnienia wymagane do wyświetlania danych produkcyjnych.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Dodano nową wersję raportu.</li>\n  </ul>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Poprawiono błędne wyświetlanie tabel w matrycy podczas korzystania z najnowszej wersji przeglądarki Chrome.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Dodano wyszukiwanie po ID wyników inspekcji, ZPW, usprawnień, obserwacji, minutek i 8D.</li>\n    <li>Dodano do wyszukiwarki odnośniki do planu produkcji, magazynu i malarnii po wpisaniu daty.</li>\n    <li>Zaktualizowano pakiety zależne</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.120.0</h1>\n  <h2>"),__append(time.format("2018-02-15","LL")),__append("</h2>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący brak odświeżania danych na stronach listy i szczegółów farb.</li>\n    <li>Poprawiono błąd powodujący niedodawanie do planu malarnii zleceń malarnii niemających zlecenia nadrzędnego\n      jeżeli ich MRP zostało zdefiniowane w module planowania.</li>\n    <li>Zmieniono odnośnik do malarnii w 'okruszkach' na podstronach modułu tak, aby przekierowywał do planu malarnii,\n      z którego użytkownik wszedł na podstronę.</li>\n    <li>Dodano filtr do listy farb.</li>\n    <li>Dodano komunikat o istnieniu farby o danym 12NC podczas dodawania nowej farby.</li>\n    <li>Dodano nową aplikację: Zliczanie obciążenia malarnii.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Zmieniono obliczanie roboczogodzin tak, aby pod uwagę brana była 'Szybkość planowania'.</li>\n    <li>Zmieniono zamrażanie planu tak, aby zamrażane były wszystkie zlecenia, a nie tylko zlecenia z pierwszej zmiany.</li>\n    <li>Zmieniono ustawienie 'Szybkość planowania' tak, aby można było ustawić inną wartość dla każdego MRP.</li>\n    <li>Zmieniono sortowanie małych zleceń tak, aby rodzina produktu (pierwsze 6 znaków nazwy) miały wagę 6 zamiast 5 oraz\n      wymiary produktu 'WnLm' (jeżeli występują w nazwie) miały wagę 4 zamiast 1.</li>\n    <li>Zmieniono sortowanie łatwych zleceń tak, aby były sortowane jak małe zlecenia (wcześniej sortowane były po RBH).</li>\n    <li>Zmieniono kopiowanie listy zleceń do schowka tak, aby kolumna 'Drop zone' także była kopiowana.</li>\n    <li>Dodano nowe ustawienie: godzina zamrożenia planu.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono uprawnienia edycji wyników tak, aby dostęp dodatkowo miieli wybrany lider, właściciel niezgodności oraz\n      osoby przypisane do akcji korekcyjnych.</li>\n    <li>Dodano nowe pole: Numer seryjny.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono wykresy wskaźników IPR, IPS oraz IPC tak, aby można było zmienić grupowanie danych na całkowite\n      lub według działów (tylko jak wybrano podział czasu).</li>\n    <li>Zmieniono wykres 'Średnie dzienne FTE' tak, aby można było zmienić grupowanie danych na całkowite lub\n      według firm.</li>\n    <li>Dodano filtr 'Podział czasu' do raportu 'Wskaźniki'.</li>\n  </ul>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Dodano do raportu tabelę i wykres 'Ilość przeprowadzonych obserwacji'.</li>\n  </ul>\n  <h3>Monitoring</h3>\n  <ul>\n    <li>Zmieniono listę linii produkcyjnych tak, aby wydajność oraz czas cyklu widoczne były w trybie historii.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano automatyczne ładowanie kolejki zleceń dla aktualnej zmiany na podstawie planu na dany dzień.</li>\n  </ul>\n  <h3>FTE</h3>\n  <ul>\n    <li>Zmieniono wyświetlanie wartości FTE tak, aby zamiast wartości ujemnych były wyświetlane zera.</li>\n    <li>Zmieniono FTE (inne) tak, aby dostępne były wydziały typu 'Inny' oraz nie będące wydziałem o ID 'LD'.</li>\n    <li>Dodano FTE (magazyn), w którym dostępne są działy z wydziału 'LD'. We wpisach FTE (magazyn) dostępna jest także\n      funkcjonalność 'Zamówienie/Dostarczenie/Braki'.</li>\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący brak powrotu do początkowej pozycji paska przewijania po wyjściu z trybu\n      pełnoekranowego wykresu.</li>\n    <li>Zmieniono wykres 'Obecność' w raporcie HR tak, aby pokazywał 'Ilośc obecnych pracowników' oraz\n      'Ilość brakujących pracowników' w trybie domyślnym oraz pełnoekranowym.</li>\n    <li>Zmieniono wykres 'Obecność' w raporcie HR tak, aby w trybie pełnoekranowym dane były dodatkowo grupowane\n      po dacie.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono błąd podczas konwertowania dokumentów mogący spowodować niepowodzenie, jeżeli w pliku PDF zastosowano\n      nieznane czcionki.</li>\n    <li>Zmieniono komunikat wyświetlany podczas otwarcia pliku, który nie został jeszcze przekonwertowany\n      z 'Nie znaleziono' na 'W trakcje konwertowania'. Strona jest automatycznie odświeżana co 30 sekund, aż do momentu\n      otwarcia pliku.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.119.0</h1>\n  <h2>"),__append(time.format("2018-01-10","LL")),__append("</h2>\n  <h3>Nieprawidłowe zlecenia IPT</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera importera zleceń.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Usunięto specjalne przewijania listy rozplanowanych zleceń w zależności od pozycji kursora na liście.</li>\n    <li>Poprawiono błąd uniemożliwiający załadowanie planu przez użytkowników z uprawnieniem 'Plany dzienne: przeglądanie',\n      ale bez uprawnienia 'Dane produkcyjne: przeglądanie'.</li>\n    <li>Poprawiono błąd mogący spowodować wyświetlanie nieaktualnego stanu planu dziennego, jeżeli poszczególne dane\n      zostały załadowane w nieprawidłowej kolejności.</li>\n    <li>Poprawiono błąd zatrzymujący wyświetlanie MRP planu dziennego, jeżeli do planu dodano maszynę (linia produkcyjna\n      z działu typu 'Tłocznia').</li>\n    <li>Poprawiono błąd podczas generowania planu polegający na ignorowanie wartości 'Linia aktywna do' podczas fazy\n      rozszerzania niekompletnego zlecenia.</li>\n    <li>Poprawiono błąd mogący spowodować brak odświeżenia aktualnego stanu planu po otrzymaniu od serwera informacji\n      o zmianach w planie.</li>\n    <li>Poprawiono błąd powodujący nietworzenie planów godzinowych z nowego planu dziennego, gdy dane plany godzinowe\n      wcześniej nie istniały.</li>\n    <li>Poprawiono błąd powodujący nieaktualizowanie istniejących planów godzinowych po zmianach w planie dziennym.</li>\n    <li>Zmieniono sortowanie wejściowej kolejki zleceń tak, aby zlecenia 'Pilne' i 'Przypięte' były brane pod uwagę\n      wcześniej od zleceń tylko 'Pilnych'.</li>\n    <li>Zmieniono edycję 'Ilości osób' na linii z poziomu planu tak, aby można było ustawić wartość 0.</li>\n    <li>Dodano funkcjonalność wybóru daty planu z poziomu 'okruszków' (jak w malarnii).</li>\n    <li>Dodano możliwość włączenia opcji wysokiego kontrastu dla widoku planu dziennego.</li>\n    <li>Dodano nowe ustawienie: Szybkość planowania.</li>\n    <li>Dodano funkcjonalność zamrażania zleceń. Zlecenia z pierwszej zmiany są automatycznie zamrażane po 23:00.</li>\n    <li>Dodano obliczanie wartości 'Sumy RBH do zrobienia' oraz 'Sumy ilości sztuk do zrobienia'.</li>\n    <li>Dodano specjalny widok zleceń dla Magazynu.</li>\n    <li>Dodano akcje 'Malarnia' oraz 'Magazyn' do strony planu dziennego.</li>\n    <li>Dodano możliwość ustawiania 'Grupy drop zone', 'Czasu wywołania', 'Statusu magazynu' oraz 'Komentarzu magazynu'\n      dla każdego zlecenia.</li>\n    <li>Dodano funkcjonalność skakania do MRP na stronie planu dziennego oraz magazynu za pomocą <kbd>Spacji</kbd>\n      lub wpisania na klawiaturze nazwy MRP.</li>\n    <li>Dodano słownik farb do Malarnii.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono wartość 'Całkowite średnie dzienne FTE' w raporcie 'Wskaźniki' tak, aby była sumą wartości poszczególnych\n      działów, a nie ich średnią.</li>\n    <li>Zmieniono liczenie użytkowników w raporcie 'Wskaźniki', aby działało tak jak w raporcie 'Zaangażowanie'.</li>\n    <li>Zmieniono liczenie użytkowników we wszystkich raportach tak, aby grupowani byli po imieniu i nazwisku\n      zamiast po ID.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono filtr listy wyników tak, aby domyślny wyświetlane były wyniki z ostatnich 14 dni.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wybranie powodu opóźnienia z poziomu listy zleceń.</li>\n    <li>Zmieniono filtr 'Godzina' listy zleceń tak, aby akceptował wartość w formacie 'gg' lub 'gg:mm'.</li>\n    <li>Zmieniono nazwę kolumny 'Data ukończenia (podst.)' na 'Data ukończenia (plan.)'.</li>\n    <li>Zmieniono listę zleceń tak, aby ignorowane były zlecenia ze statusem 'TECO' lub 'DLT'.</li>\n  </ul>\n  <h3>Raporty > Wskaźniki</h3>\n  <ul>\n    <li>Dodano 'Produktywność' do eksportowanych danych.</li>\n    <li>Zwiększono czas generowania raportu o 17%.</li>\n  </ul>\n  <h3>Raporty > HR</h3>\n  <ul>\n    <li>Dodano legendę do eksportowanego wykresu 'Obecności'.</li>\n  </ul>\n  <h3>Zlecenie reszty działów</h3>\n  <ul>\n    <li>Dodano możliwość wyboru źródła komentarza: Inne, Malarnia, Magazyn.</li>\n    <li>Dodano rejestrację komentarzy z malarnii w historii zlecenia.</li>\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Usunięto logo EES z szablonu dla Kętrzyna.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono kolejność nazwy personelu z 'Imię+Nazwisko' na 'Nazwisko+Imię'.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas eksportu wydruku do PDF.</li>\n    <li>Zmieniono pole wyszukiwania użytkowników tak, aby w przypadku napotkania kilku użytkowników o takim samym\n      imieniu i nazwisku, najpierw preferowany był aktywny użytkowników, poźniej użytkownik mający przypisany adres\n      e-mail, a na końcu użytkownik przypisany do firmy 'PHILIPS'.</li>\n    <li>Uruchomiono dwa dodatkowe procesy do generowania raportów na oddzielnym serwerze.</li>\n  </ul>\n</div>\n");return __output.join("")}});