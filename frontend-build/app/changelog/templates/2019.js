define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\n  <h1>v0.132.0</h1>\n  <h2>'),__append(time.format("2019-03-03","LL")),__append("</h2>\n  <h3>FAP</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera, jeżeli dwóch użytkowników zmieniało zgłoszenie\n      w tym samym czasie.</li>\n    <li>Poprawiono błąd powodujący brak aktualizacji szczegółów zgłoszenia w czasie rzeczywistym, jeżeli\n      FAP otwarto za pomocą ID zgłoszenia.</li>\n    <li>Zmieniono treść powiadomienia SMS tak, aby zawierał adres URL do zgłoszenia.</li>\n    <li>Zmieniono tabele w wykresach 'Ilość zgłoszeń wg wydziałów' oraz 'Ilość zgłoszeń wg MRP' raportu tak,\n      aby zliczały pozycje 'Nieokreślone' (bez wydziału/MRP).</li>\n    <li>Zmieniono tabele w wykresach 'Ilość zgłoszeń wg osób' tak, aby pokazywały sumę osób.</li>\n    <li>Zmieniono menu oraz stronę ze szczegółami zgłoszenia tak, aby były bardziej użyteczne na urządzeniach\n      mobilnych.</li>\n    <li>Dodano możliwość wywoływania formularza dodawania zgłoszenia klawiszem <kbd>F1</kbd>.</li>\n    <li>Dodano możliwość kopiowania Kategorii i Problemu z ostatniego zgłoszenia użytkownika podczas dodawania\n      nowego zgłoszenia.</li>\n    <li>Dodano możliwość zdefiniowania 'Kategorii ETO' dla każdej kategorii zgłoszeń. Jeżeli wybrana zostanie kategoria,\n      która ma przypisaną kategorię ETO oraz wybrane zlecenie jest ETO, to kategoria automatycznie zostanie zamieniona\n      na kategorię ETO (i w drugą stronę).</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono poawiadamianie o nowych zgłoszeniach tak, aby specjalny e-mail FM-24 był wysyłany na adres\n      zatwierdzającego, jeżeli nazwa zatwierdzającego pasuje do wzorca <code>/fm.?24/i</code>.</li>\n    <li>Dodano do formularza dodawania możliwość dołączenia prośby o potwierdzenie przyjęcia zgłoszenia FM-24\n      do specjalnego e-maila FM-24.</li>\n    <li>Dodano możliwość włączenia powiadomień SMS i e-mail o nowych zgłoszeniach FM-24 przez każdego użytkownika.</li>\n  </ul>\n  <h3>Operator</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprzeliczanie danych zmiany produkcyjnej po wykonaniu operacji\n      'Poprawa zlecenia'.</li>\n    <li>Poprawiono błąd powodujący zwracanie pustej kolejki zaplanowanych zleceń po połączeniu się klienta\n      z serwerem.</li>\n    <li>Dodano osie czasu przedstawiające zaplanowaną oraz wykonaną sekwencję zleceń.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Usunięto komunikat informujący o nowym typie filtra listy.</li>\n  </ul>\n  <h3>Jednostki organizacyjne</h3>\n  <ul>\n    <li>Zmieniono usuwanie jednostek organizacyjnych tak, aby nie można było usunąć jednostki nadrzędnej, która\n      ma przypisane jednostki podrzędne (np. nie można usunąć WorkCentra, jeżeli jakaś Linia należy do tego WC).</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Zmieniono generowanie planu tak, aby zlecenia z priorytetem <strong>E</strong> były rozplanowywane\n      w całości tylko na pierwszej zmianie.</li>\n    <li>Dodano do statystyk wskaźniki realizacji planu z podziałem na zmiany produkcyjne.</li>\n    <li>Dodano do statusów zleceń wyświetlanie priorytetu zlecenia <strong>E</strong> - Pilot ETO.</li>\n    <li>Dodano możliwość blokowania MRP. Zablokowane MRP nie będzie przeliczane i nie można w nim dokonywać\n      żadnych zmian, tak jakby wykonywanie danego planu już się rozpoczęło.</li>\n    <li>Dodano możliwość kopiowania niektórych ustawień linii z dowolnego planu do innych wybranych,\n      otwartych planów.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Zmieniono rozpoczynanie zlecenia tak, aby wymagało wybranie nr kabiny.</li>\n    <li>Dodano możliwość rejestrowania dostarczonej ilości.</li>\n    <li>Dodano możliwość logowania się malarzy w trybie wsadowym. Bez zalogowania się nie można dokonywać zmian\n      w zleceniach.</li>\n  </ul>\n  <h3>Magazyn</h3>\n  <ul>\n    <li>Dodano filtr 'Etap' do starej wersji modułu.</li>\n    <li>Dodano nową wersję modułu.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący, że ustawienie przesunięcia daty danych nie miało na nic wpływu.</li>\n    <li>Zmieniono ustawienia 'Przesunięcie dniowe ...' oraz 'Przesunięcie godzinowe danych' tak, aby podana\n      ilość oznaczała dni robocze (tzn. dla przesunięcia <code>-2</code>, data z poniedziałku zostanie zamieniona\n      na czwartek poprzedniego tygodnia, a nie na sobotę, zakładając, że czwartek i piątek to dni robocze).</li>\n  </ul>\n  <h3>Baza Kanban</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący ukrycie menu kontekstowego kolumny po użyciu klawisza <kbd>Delete</kbd>\n      lub <kbd>Backspace</kbd> w polu filtra.</li>\n    <li>Dodano wsparcie dla siódmego stanowiska.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono proces logowania tak, aby wymuszona została zmiana hasła dla użytkowników, których hasło\n      jest takie samo jak login lub numer kadrowy.</li>\n    <li>Zmieniono proces logowania tak, aby nie można było się zalogować, jeżeli jako loginu użytko adresu\n      e-mail i w bazie istnieje kilku użytkowników z takim samym adres.</li>\n    <li>Zmieniono formularz resetowania hasła tak, aby użytkownik musiał potwierdzić nowe hasło podając\n      je dwa razy.</li>\n    <li>Zmieniono formularz logowania tak, aby był ponownie dostępny w trybie wsadowym.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono maksymalną szerokość często używanych formularzy tak aby była dynamicznie dostosowywana na większych\n      rozdzielczościach ekranu.</li>\n    <li>Zmieniono wewnętrzny kalendarz tak, aby traktował dni bez zleceń ze statusem REL jako dni wolne od pracy.</li>\n    <li>Dodano do wewnętrznego kalendarza dni ustawowo wolne od pracy dla lat 2019, 2020 i 2021.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.131.0</h1>\n  <h2>"),__append(time.format("2019-02-03","LL")),__append("</h2>\n  <h3>FAP</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprawidłowe ustawianie filtra 'MRP' po wejściu na listę zgłoszeń\n      z filtrem 'Kategoria'.</li>\n    <li>Poprawiono błąd powodujący niedziałanie automatycznego dodawania uczestników do nowego zgłoszenia.</li>\n    <li>Poprawiono błąd powodujący dodawanie do zgłoszenia plików załadowanych do modułu Dokumentów, jeżeli wcześniej\n      użytkownik odwiedził stronę ze szczegółami zgłoszenia FAP.</li>\n    <li>Zmieniono nazwy załączników na czacie tak, aby stawały się przekreślone, jeżeli załącznik został usunięty.</li>\n    <li>Zmieniono wyświetlanie wiadomości na czacie tak, aby wszystkie wiadomości wysłane przez innych użytkowników\n      były po lewej stronie, a wiadomości użytkownika po prawej.</li>\n    <li>Zmieniono dodawanie nowych zgłoszeń tak, aby zgłoszenia dodane przez użytkownika bez ustawionej\n      'Funkcji na produkcji', ale z przynajmniej jednym 'Uprawnieniem' miały status 'Rozpoczęte' a nie 'Oczekujące'.</li>\n    <li>Zmieniono kolumnę 'Linie' na liście zgłoszeń tak, żeby miała maksymalnie szerokość równą 200px.</li>\n    <li>Dodano filtr 'Wydział' do listy zgłoszeń.</li>\n    <li>Dodano filtr 'Tekst' do listy zgłoszeń przeszukujący: Nazwa produktu, Problem, Rozwiązanie, Dlaczego?,\n      Opis kroków rozwiązujących problem oraz czat.</li>\n    <li>Dodano do listy kolumnę 'Nazwa produktu'.</li>\n    <li>Dodano do listy akcję 'Oznacz jako przeczytane'.</li>\n    <li>Dodano raport.</li>\n    <li>Dodano możliwość dodawania obrazków znajdujących się w schowku przez skrót <kbd>CTRL+V</kbd>.</li>\n    <li>Dodano akcję 'Dodaj załączniki' do sekcji 'Załączniki' na stronie szczegółów zgłoszenia umożliwiającą\n      wybranie plików z dysku.</li>\n    <li>Dodano do eksportowania zgłoszeń kolumnę z wiadomościami z czata.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Zmieniono listę zleceń tak, aby dane w wygenerowanym raporcie zmieniały się, jeżeli zaktualizowano zlecenie\n      (komentarz, powód opóźnienia, opóźniony komponent, M4) zanim raport wygasł.</li>\n    <li>Dodano wyświetlanie 'Opóźnionego komponentu' w kolumnie 'Powód opóźnienia' na liście zleceń.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Usunięto przycisk umożliwiający przejście do Pulpitu.</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie adresów IP klientów jako <code>127.0.0.1</code>.</li>\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Zmieniono domyślny filtr 'Badania' w raporcie tak, aby pokazywane były wyniki tylko dla badania\n      z najnowszymi wynikami zamiast wszystkie.</li>\n    <li>Zmieniono nagłówki odpowiedzi w papierowej wersji ankiety z tekstu na ikony.</li>\n    <li>Dodano wsparcie dla języka ukraińskiego w przeglądarkowej wersji ankiety.</li>\n    <li>Dodano wsparcie dla pytania 'Polecanie' w formacie 1-10 do przeglądarkowej wersji ankiety\n      oraz do 'Odpowiedzi'.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący rozplanowanie zlecenia z 0 ilością sztuk na początku drugiej i trzeciej zmiany\n      w niektórych przypadkach.</li>\n    <li>Zmieniono generowanie planu tak, aby linie były rozplanowywane w kolejności alfanumerycznej wg MRP i ID linii,\n      a nie wg kolejności pojawienia się w ustawieniach.</li>\n    <li>Zmieniono generowanie planu tak, aby części podzielonych zleceń były wcześniej rozplanowywane na kolejnych\n      liniach, jeżeli różnica w czasie rozpoczęcia pierszej części zlecenia i aktualnego czasu rozplanowywanej linii\n      jest mniejsza niż 60 minut, a nie 20 minut.</li>\n    <li>Zmieniono generowanie planu tak, aby zlecenia, które pasują do przynajmniej jednej grupy ze\n      zdefiniowanymi 12NC nie trafiały na linie, które należą do grupy bez żadnych 12NC w przypadku,\n      gdy na liniach z grupy 12NC nie ma już miejsca.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający 'przyklejenie' dymka z informacjami o użytkowniku po kliknięciu\n      na nazwę użytkownika.</li>\n    <li>Dodano do aplikacji uruchomionych w trybie wsadowym akcje resetowania przeglądarki, ponownego uruchomienia\n      oraz uruchomienia przeglądarki bez trybu kioskowego. Akcje dostępne po trzykrotnym kliknięciu na przycisk\n      menu akcji.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.130.0</h1>\n  <h2>"),__append(time.format("2019-01-13","LL")),__append("</h2>\n  <h3>FAP</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować niewyświetlanie się nazwy kategorii, jeżeli użytkownik wszedł bezpośrednio\n      na stronę szczegółów zgłoszenia.</li>\n    <li>Zmieniono chat tak, aby nie wyświetlał imienia i nazwiska bez żadnych linii (np. w przypadku usunięcia\n      załączników).</li>\n    <li>Zmieniono czat tak, aby odnośniki podane w wiadomości były automatycznie zamieniane na klikalną wersję.</li>\n    <li>Zmieniono 'Opis rozwiązania problemu' tak, aby był podświetlany na zielono, jeżeli podano jakąś wartość.</li>\n    <li>Zmieniono uprawnienia niezalogowanych użytkowników tak, aby nie mogli już wysyłać wiadomości, dodawać\n      uczestników oraz załączników.</li>\n    <li>Zmieniono uprawnienia tak, aby użytkownicy z funkcją 'Konstruktor FD' lub 'Konstruktor ETO' mieli możliwość\n      zmiany pól: Status, Kategoria, Problem i Rozwiązanie.</li>\n    <li>Zmieniono uprawnienia tak, aby użytkownicy z funkcją 'Inżynier procesu ds. nowych wdrożeń' mieli takie same\n      uprawnienia jak 'Inżynier procesu'.</li>\n    <li>Dodano do wiadomości 'Zakończono zgłoszenie' czas trwania zgłoszenia.</li>\n    <li>Dodano do czatu automatyczne wyświetlanie wiadomości 'Analiza rozpoczęta' oraz 'Analiza zakończona'.</li>\n    <li>Dodano do czatu autouzupełnianie imienia i nazwiska użytkownika po wciśnięciu klawisza <kbd>TAB</kbd>.</li>\n    <li>Dodano oznaczanie nieprzeczytanych zmian w zgłoszeniach.</li>\n    <li>Dodano powiadamianie o nowych wiadomościach w obserwowanych zgłoszeniach.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Dodano nową opcję do kont użytkowników: Powiadamianie SMS o każdym nowym zgłoszeniu FAP (a nie tylko podczas\n      dyżuru).</li>\n  </ul>\n  <h3>Zlecenia produkcyjne</h3>\n  <ul>\n    <li>Dodano listę zgłoszeń FAP do strony ze szczegółami zlecenia.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Poprawiono błąd, który powodował wyświetlanie wszystkich nowych zleceń dodanych podczas przeliczania planu jako\n      'Niekompletne'.</li>\n    <li>Zmieniono ustawienie 'Ilość pracowników' tak, aby można było zdefiniować różną ilość dla każdej zmiany\n      produkcyjnej.</li>\n    <li>Zmieniono wyświetlanie listy linii tak, aby wyświetlane były w kolejności alfabetycznej, a nie kolejności\n      zdefiniowania.</li>\n  </ul>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wywalenie się serwera, jeżeli usunięto Użytkownika, który występował w Matrycy.</li>\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Zmieniono etykiety osi x we wszystkich wykresach czasowych tak, aby były zależne od wybranego Podziału czasu.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Dodano wyświetlanie ID zgłoszeń FAP na liście zleceń.</li>\n  </ul>\n  <h3>Raporty > Przestoje w obszarach</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wyeksportowanie przestojów.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wyeksportowanie zleceń.</li>\n  </ul>\n  <h3>Magazyn</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wyeksportowanie zleceń.</li>\n  </ul>\n  <h3>Kanban</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wyeksportowanie tabeli.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono akcje 'Skocz do ... po ID' tak, aby pole nie było automatycznie zaznaczane na\n      urządzeniach mobilnych.</li>\n    <li>Zmieniono 'okruszki' prowadzące z powrotem do listy tak, aby miały ustawiony ostatnio wybrany filtr.</li>\n  </ul>\n</div>\n");return __output.join("")}});