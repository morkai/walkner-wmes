define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\n  <h1>v0.115.2</h1>\n  <h2>'),__append(time.format("2017-07-30","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono pole 'Ilość wykonana w zleceniu' podczas kończenia zlecenia tak, aby nie można było wpisać wartości\n      mniejszej niż ilość zeskanowanych numerów seryjnych.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Dodano aktualizowanie czasów operacji wykonanych zleceń, jeżeli te zmieniły się podczas importu\n      'Zleceń reszty działów'.</li>\n  </ul>\n  <h3>Linie produkcyjne</h3>\n  <ul>\n    <li>Poprawiono błąd w formularzu edycji linii powodujący niezaznaczanie MRP Kontrolera, jeżeli dana linia jest\n      w przepływie, który ma więcej niż jeden MRP.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.115.1</h1>\n  <h2>"),__append(time.format("2017-07-23","LL")),__append("</h2>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Usunięto z ekranu wizualizacji linii 'LM-Maxos_T' wyświetlanie wyniku ostatniej akcji.</li>\n    <li>Zmieniono ekran wizualizacji linii 'LM-Maxos_T', tak aby walidacja przewodu 5-żyłowego sprawdzała podłączenie\n      pinów 2, 3, 4, 5, i 6, a nie dowolnych pięciu.</li>\n    <li>Dodano do ekranu wizualizacji linii 'LM-Maxos_T' wyświetlanie ilości pomyślnych testów po danej stronie,\n      całkowitej ilości pomyślnych testów w zleceniu oraz wymaganą ilość testów do wykonania.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wywalenie się serwera, jeżeli zmodyfikowano plik dokumentu, który został wyświetlony\n      w ciągu ostatnich 60 sekund.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono pole 'Data inspekcji' tak, aby można było wybrać datę maksymalnie dwa tygodnie w przeszłości.</li>\n  </ul>\n  <h3>Przestoje</h3>\n  <ul>\n    <li>Zmieniono czcionkę etykiety z rodziną produktu na liście przestojów na czcionkę ze stałą szerokością znaków.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Dodano nowy raport: Wskaźniki.</li>\n  </ul>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Poprawiono błąd podczas przetwarzania operacji z Formatki operatora mogący spowodować podwójne wykonywanie\n      operacji.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.115.0</h1>\n  <h2>"),__append(time.format("2017-07-16","LL")),__append("</h2>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Usunięto kolumnę 'Licznik' z listy wyników.</li>\n    <li>Zmieniono kolumnę 'Zlecenie' na liście wyników, tak aby kliknięcie na nr zlecenia przeniosło użytkownika\n      do strony ze szczegółami danego zlecenia.</li>\n    <li>Zmieniono ekran wizualizacji linii 'LM-Maxos_T', tak aby kolor tła zmieniany był na zielony lub czerwony\n      w celu sygnalizacji powodzenia lub niepowodzenia testu.</li>\n    <li>Dodano przyciski 'Start' i 'Reset' do ekranu wizualizacji linii 'LM-Maxos_T'.</li>\n    <li>Dodano wsparcie dla rejestracji wyników z testów okablowania i elektrycznego na linii 'LM-Maxos_T'.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano uprawnienie 'Tylko zmiana linii ze spigotem' pozwalające na zmianę ustawienia\n      'Formatka operatora > Sprawdzanie Spigota > Linie ze sprawdzaniem Spigota'.</li>\n  </ul>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Dodano do raportu 'Obserwacje' wykres 'Ilość kart obserwacji wg obserwatorów'.</li>\n  </ul>\n  <h3>Minuty dla Bezpieczeństwa</h3>\n  <ul>\n    <li>Usunięto z formularza komunikat o dodawaniu ZPW na podstawie Obserwacji.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono błąd w katalogu dokumentów powodujący próbę pobierania przez przeglądarkę pliku po kliknięciu na\n      datę dokumentu przytrzymując klawisz <kbd>ALT</kbd>.</li>\n    <li>Zmieniono dodawanie istniejących plików do listy plików do zmiany przez <kbd>ALT+LPM</kbd> tak, aby pole\n      z datą ostatnio dodanego pliku było automatycznie zaznaczane.</li>\n  </ul>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Dodano nowy moduł: Malarnia. Umożliwia załadowanie pliku z kolejką zleceń malarnii, wyświetlanie kolejki\n      oraz rozpoczynanie, kończenie i ignorowanie zleceń z kolejki na dany dzień.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.114.2</h1>\n  <h2>"),__append(time.format("2017-07-09","LL")),__append("</h2>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Usunięto ograniczenie wyświetlania danych dla linii, które nie należały do jednostki organizacyjnej przypisanej\n      użytkownikowi. Od teraz w filtrze 'Jednostka organizacyjna' domyślnie ustawiany jest przypisany wydział\n      lub dział.</li>\n    <li>Dodano do wszystkich filtrów 'Kontroler MRP zlecenia' odnośnik '(moje)', po kliknięciu którego do pola\n      skopiowane zostaną MRP przypisane do użytkownika w Matrycy odpowiedzialności.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Poprawiono błąd podczas liczenia wydajności dla eksportowanych zleceń.</li>\n    <li>Poprawiono błąd powodujący nieustawianie wartości filtra 'Kontroler MRP zlecenia' po załadowaniu strony.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zmiany</h3>\n  <ul>\n    <li>Zmieniono kolumnę 'Kontroler MRP' tak, aby wyświetlał wszystkie MRP ze zleceń jakie były robione na danej\n      zmianie produkcyjnej. Przekreślone MRP oznacza, że jest to MRP będące jednostką organizacyjną w jakiej znajduje\n      się dana linia produkcyjna i nie było robionego żadego zlecenia z tym MRP.</li>\n    <li>Dodano filtr 'Kontroler MRP zlecenia'.</li>\n    <li>Dodano wartość 'Wydajność' obliczaną ze wszystkich zleceń robionych na danej zmianie produkcyjnej.</li>\n    <li>Dodano kolumnę 'Wykonana ilość' do listy zmian produkcyjnych.</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Zmieniono domyślny filtr listy zleceń tak, aby domyślnie pokazywane były tylko zlecenia z ostatnich 7 dni.</li>\n    <li>Zmieniono listę klientów tak, aby była sortowana w porządku naturalnym po ID linii ('CT9' przed 'CT10').</li>\n    <li>Dodano do listy klientów kolumnę 'Adres IP'.</li>\n    <li>Dodano ekran wizualizacji dla linii 'LM-Maxos_T'.</li>\n  </ul>\n  <h3>Zdarzenia</h3>\n  <ul>\n    <li>Wyłączono rejestrowanie zdarzenia 'Karty pracy: edycja'.</li>\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Zmieniono generowanie ankiet w formie elektronicznej i PDF tak, aby do treści wstępu automatycznie dodawane\n      były paragrafy (jeżeli nie istnieją) w miejscu nowych linii.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Zmieniono filtr 'Linia produkcyjna' na listach 'Zdarzeń' i 'Żądań' na nowy filtr 'Jednostki organizacyjne'.</li>\n  </ul>\n  <h3>8D</h3>\n  <ul>\n    <li>Zmieniono filtr listy 'Obszar' tak, aby jako opcje wyświetlana była nazwa a nie ID obszaru.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Dodano możliwość eksportu danych do formatu XLSX.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.114.1</h1>\n  <h2>"),__append(time.format("2017-06-25","LL")),__append("</h2>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Usunięto pole 'Kategoria zachowania'.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono algorytm obliczania 'Jakości wyrobu gotowego'\n      z <code>Ilość_niezgodnych_w_skontrolowanych / Ilość_niezgodnych</code> tylko wyników NOK\n      na <code>Ilość_niezgodnych_w_skontrolowanych / Ilość_skontrolowana</code> wszystkich wyników.</li>\n  </ul>\n  <h3>Nieprawidłowe zlecenia IPT</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieusuwanie zleceń, których data startu została zmieniona na datę poza\n      sprawdzanym zakresem.</li>\n    <li>Zmieniono sprawdzanie zleceń tak, aby nieprawidłowe zlecenia, dla których zlecenie reszty działów nie istnieje\n      było usuwane.</li>\n    <li>Zmieniono sprawdzanie zleceń tak, aby odbywało się pomiędzy 05:00 a 21:00.</li>\n    <li>Dodano powiadamianie wszystkich Konstruktorów ETO o nieprawidłowych zleceniach z 12NC zaczynającym\n      się na <code>8</code>.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono rozpoczynanie nowego zlecenia tak, aby wymagane było podanie ilości osób.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Zmieniono eksportowanie danych tak, aby zawierało dodatkowo: Datę zmiany, Numer zmiany oraz Wydajność.</li>\n    <li>Zmieniono filtr 'Linia produkcyjna' na uniwersalny filtr 'Jednostka organizacyjna'.</li>\n  </ul>\n  <h3>Dane produkcyjne > Historia operacji</h3>\n  <h3>Dane produkcyjne > Zmiany</h3>\n  <h3>Dane produkcyjne > Przestoje</h3>\n  <h3>Dane produkcyjne > Żądania zmian</h3>\n  <h3>Dane produkcyjne > Numery seryjne</h3>\n  <ul>\n    <li>Zmieniono filtr 'Linia produkcyjna' na uniwersalny filtr 'Jednostka organizacyjna'.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono importowanie zleceń tak, aby usuwane były zlecenia, które nie znajdują się już w aktualnym zrzucie\n      (bo data startu została zmieniona na datę poza importowanym zakresem).</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Dodano wsparcie dla importu ustawień klientów.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.114.0</h1>\n  <h2>"),__append(time.format("2017-06-18","LL")),__append("</h2>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Zmieniono kolumny 'Co zaobserwowano' oraz 'Ryzykowne warunki w miejscu pracy' na liście kart tak,\n      aby preferowały wyświetlanie 'Trudnych' wpisów.</li>\n    <li>Zmieniono filtr 'Trudne do zmiany' tak, aby wyszukiwał karty wg wpisów w tabeli 'Trudności zmian',\n      a nie w 'Obserwacje zachowań' i 'Ryzykowne warunki w miejscu pracy'.</li>\n    <li>Dodano nowy raport.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Dodano okres czasu 'Ostatnie dwa tygodnie' do filtrów raportów.</li>\n    <li>Dodano filtr 'Działy' do raportu 'Zaangażowanie'.</li>\n    <li>Dodano kolumny 'Obserwacje zachowań' oraz 'Minuty dla Bezpieczeństwa' do raportu 'Zaangażowanie'.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono domyślny filtr raportu 'Ilości' tak, aby pobierane były dane z ostatnich 6 miesięcy.</li>\n    <li>Zmieniono raporty tak, aby dezaktywowane Wydziały nie były wyświetlane.</li>\n  </ul>\n  <h3>Nieprawidłowe zlecenia IPT</h3>\n  <ul>\n    <li>Zmieniono kolumnę 'Komentarz IPT' tak, aby była pusta, jeżeli zawiera taką samą wartość jak kolumna\n      'Status IPT'.</li>\n    <li>Zmieniono kolumnę 'Data startu' tak, aby kolor tła zmieniał się tylko dla zleceń ze statusem 'Błąd'.</li>\n    <li>Zmieniono sprawdzanie zleceń tak, aby błędne zlecenia były automatycznie rozwiązywane, jeżeli otrzymają\n      status 'TECO'.</li>\n    <li>Zmieniono sprawdzanie zleceń tak, aby błędne zlecenia, których data startu została zmieniona na datę poza\n      sprawdzanym zakresem, były usuwane.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano możliwość filtrowania listy przestojów i obszarów odpowiedzialności podczas rozpoczynania nowego\n      przestoju w trybie dotykowym.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Zmieniono filtr 'Nr/12NC zleceń' tak, aby można było wyszukać kilka zleceń na raz podając listę numerów zleceń\n      oddzielonych przecinkiem.</li>\n    <li>Dodano filtr 'Komponenty' umożliwiający wyszukiwanie zleceń wg numeru lub 12NC komponentów.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono przycisk kopiowania uprawnień użytkownika tak, aby działał nawet jak w przeglądarce nie ma technologii\n      Flash.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd w polach wyszukiwania użytkowników powodujący niepreferowanie użytkowników z firmy Philips,\n      w przypadku wykrycia zduplikowanego użytkownika.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.113.0</h1>\n  <h2>"),__append(time.format("2017-06-11","LL")),__append("</h2>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający edycję osób odpowiedzialnych dla funkcji, jeżeli dana funkcja nie miała jeszcze\n      przypisanych żadnych osób.</li>\n    <li>Zmieniono zarządzanie MRP tak, aby wymagało uprawnienia <em>Matryca odpowiedzialności: zarządzanie</em>.\n      Wcześniej zmieniać MRP mogli także kierownicy.</li>\n    <li>Zmieniono aktualizację dostępności osób odpowiedzialnych na podstawie bazy KD tak, aby brany był pod uwagę\n      czas użycia karty (niekiedy wcześniejsze użycia karty na niektórych czytnikach mogą pojawić się w bazie\n      z opóźnieniem i będą w takim wypadku ignorowane).</li>\n    <li>Dodano listę grup w prawym dolnym rogu w celu ułatwienia nawigacji między grupami.</li>\n    <li>Dodano przycisk 'Tryb edycji' do matrycy wyświetlanej w oknie dialogowym.</li>\n    <li>Dodano możliwość ukrycia chmurki z danymi użytkownika po kliknięciu na dowolny obszar.</li>\n    <li>Dodano uprawnienie: Matryca odpowiedzialności: edycja osób - użytkownicy mogą przypisywać osoby odpowiedzialne\n      do funkcji, ale nie mogą zmieniać struktury.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający dodawanie i edycję użytkowników przez formularz.</li>\n  </ul>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Poprawiono filtr 'Trudne do zmiany zachowania' wybierający karty, które miały przynajmniej jedną bezpieczną\n      obserwację zachowań i żadnych ryzykownych, trudnych obserwacji.</li>\n    <li>Dodano do listy kolumny: Co zaobserwowano, Ryzykowne warunki w miejscu pracy, Trudne do zmiany zachowania oraz\n      Trudne do zmiany warunki pracy. W komórce tabeli wyświetla się pierwszy wpis danego typu, a po kliknięciu na nią\n      wyświetlana jest dodatkowa tabelka ze wszystkimi wpisami danego typu.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono tryb pracy Formatki na wszystkich komputerach na dotykowy.</li>\n    <li>Zmieniono akcję żądania dostarczenia palet tak, aby można było wybrać ilość palet.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Dodano wyświetlanie żądanej ilości palet do dostarczenia.</li>\n  </ul>\n  <h3>Dokumentacja > Dokumenty</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wybranie pliku do edycji przez klinięcie <kbd>ALT+LPM</kbd>.</li>\n  </ul>\n  <h3>Pulpit</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący, że kliknięcie na osobę na liście 'Najaktywniejsi w miesiącu' ustawiało nieprawidłowy\n      filtr Od-Do na liście zgłoszeń.</li>\n  </ul>\n  <h3>Nieprawidłowe zlecenia IPT</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zaktualizowano środowisko i pakiety zależne.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.112.0</h1>\n  <h2>"),__append(time.format("2017-06-04","LL")),__append("</h2>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Dodano nowy moduł. Matryca odpowiedzialności dostępna jest po kliknięciu na ikonę <i class=\"fa fa-group\"></i>\n      znajdującą się koło wyszukiwarki w górnym pasku.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano przycisk <i class=\"fa fa-group\"></i> otwierający Matrycę odpowiedzialności.</li>\n  </ul>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Dodano filtr 'Trudne do zmiany' do listy kart.</li>\n  </ul>\n  <h3>Wydajność godzinowa</h3>\n  <ul>\n    <li>Zmieniono skanowanie numerów seryjnych tak, aby można było zarejestrować numer seryjny nawet podczas\n      przestoju linii, jeżeli numer seryjny jest z zakończonego zlecenia.</li>\n  </ul>\n  <h3>Pulpit</h3>\n  <ul>\n    <li>Usunięto tekst 'Wersja testowa' z przycisków 'Zarejestruj obserwację'\n      i 'Zarejestruj Minuty dla bezpieczeństwa'.</li>\n    <li>Zmieniono listę 'Najaktywniejsi w miesiącu' tak, aby można było wyświetlić zgłoszenia danego użytkownika\n      po kliknięciu na imię i nazwisko.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.111.3</h1>\n  <h2>"),__append(time.format("2017-05-28","LL")),__append("</h2>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący automatyczne wpisywanie wartości 'Stanowisko (KD)' danego użytkownika\n      do pola 'Obserwowane stanowisko'.</li>\n    <li>Zmieniono formularz tak, aby wszystkie kategorie zachowań zawsze były wyświetlane.</li>\n    <li>Zmieniono wymagane pola w formularzu.</li>\n    <li>Dodano możliwość definiowania nowych obserwacji zachowań z kategorii Inne.</li>\n  </ul>\n  <h3>Minuty dla Bezpieczeństwa</h3>\n  <ul>\n    <li>Usunięto pola 'Kto?' i 'Kiedy?' z propozycji.</li>\n  </ul>\n  <h3>Wydajność godzinowa</h3>\n  <ul>\n    <li>Dodano możliwość skanowania numerów seryjnych dla wszystkich zleceń rozpoczętych na danej zmianie, a nie tylko\n      do aktualnie wykonywanego zlecenia.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono pola wyszukiwania użytkowników tak, aby pokazywał tylko jedną opcję o takim samym imieniu i nazwisku\n      (jeżeli w bazie istnieje użytkownik Jan Kowalski trzy razy: w firmie PLP, APT oraz Pozostali, to na liście dostępny\n      będzie Jan Kowalski z firmy PLP).</li>\n    <li>Zmieniono strony błedów tak, aby w razie pilnej potrzeby można było poinformować administratora o błędzie.</li>\n    <li>Dodano strony błędów podczas ładowania danych (wcześniej wyświetlała się tylko biała strona).</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.111.2</h1>\n  <h2>"),__append(time.format("2017-05-21","LL")),__append("</h2>\n  <h3>Działy</h3>\n  <ul>\n    <li>Dodano możliwość dezaktywowania działów.</li>\n  </ul>\n  <h3>Raporty > Struktura organizacyjna</h3>\n  <ul>\n    <li>Dodano zapamiętywanie pozycji poszczególnych jednostek organizacyjnych.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Poprawiono błąd podczas importu zleceń z SAP powodujący nieprzypisywanie wartości 'Opis', 'Zleceniodawca'\n      oraz 'Czas utworzenia' w przypadku, gdy dla danego zlecenia sprzedaży istnieje więcej niż jedno\n      zlecenie produkcyjne.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono kolumnę 'Ilość popr.' na liście wyników na 'Ilość do sel.'.</li>\n    <li>Zmieniono filtrowanie listy inspekcji tak, aby dodatkowe filtry były domyślnie schowane. Dodatkowe filtry można\n      zdefiniować wybierając je z listy rozwijanej lub klikając na nazwę kolumny w tabeli wyników.</li>\n    <li>Zmieniono filtr 'Kod wady' tak, aby można było wybrać kilka kodów.</li>\n    <li>Dodano filtr i kolumnę 'Właściciel niezgodności - Mistrz' do listy wyników.</li>\n    <li>Dodano filtr 'Rodzaj inspekcji' do raportu 'Jakośc wyrobu gotowego'.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.111.1</h1>\n  <h2>"),__append(time.format("2017-05-14","LL")),__append('</h2>\n  <h3>Dokumentacja > Dokumenty</h3>\n  <ul>\n    <li>Poprawiono błędy wywalające serwer podczas serwowania dokumentów, które nie istnieją w katalogu WMES.</li>\n    <li>Poprawiono błąd wywalający serwer podczas otwierania dokumentu z katalogu WMES, jeżeli w nazwie zawiera\n      polskie znaki.</li>\n    <li>Poprawiono błąd powodujący zmianę nazw wszystkich podkatalogów po zmianie nazwy nadrzędnego katalogu\n      (tylko po stronie klienta).</li>\n    <li>Poprawiono błąd powodujący latanie po całej stronie ikony ładowania dokumentów.</li>\n    <li>Zmieniono dodawanie nowych dokumentów tak, aby nazwa domyślnie była ustawiana na 15NC, jeżeli nie udało\n      się pobrać nazwy z nazwy pliku i serwera.</li>\n    <li>Zmieniono pola dat dostępności tak, aby można było wkleić wartość ze schowka (<kbd>CTRL+V</kbd>).</li>\n    <li>Zmieniono zaznaczanie katalogu/dokumentu na liście tak, aby dokument nie był zaznaczany, jeżeli wcześniej\n      zaznaczono jakiś tekst.</li>\n    <li>Zmieniono drzewo katalogów tak, aby kliknięcie <kbd>CTRL+PPM</kbd> otwierało katalog w nowej karcie\n      przeglądarki.</li>\n    <li>Dodano pasek narzędzi do głównego widoku oraz przeniesiono do niego wyszukiwanie po 15NC i zmianę trybu\n      wyświetlania.</li>\n    <li>Dodano możliwość zmiany dat dostępności istniejących plików dokumentów poprzez kliknięcie <kbd>ALT+LPM</kbd>\n      na daną datę dostępności.</li>\n    <li>Dodano wsparcie dla historii przeglądarki: zmiana katalogu dodawana jest do historii, dzięki czemu można wrócić\n      do poprzedniego katalogu korzystając z akcji <em>Wróć</em> przeglądarki.</li>\n    <li>Dodano możliwość bezpowrotnego usuwania katalogów i plików ze śmietnika.</li>\n    <li>Dodano możliwość oznaczania wielu plików w aktualnym katalogu w celu usunięcia przypisania do aktualnego katalogu,\n      przeniesienia ich do śmietnika, przywrócenia ze śmietnika lub bezpowrotnego usunięcia ze śmietnika.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono listę dokumentów na stronie szczegółów zlecenia tak, aby otwierany był dokument z datą dostępności\n      danego zlecenia.</li>\n  </ul>\n  <h3>8D</h3>\n  <ul>\n    <li>Zmieniono wysyłanie powiadomień e-mail tak, aby powiadomienia nie były wysyłane po restarcie serwera\n      oraz co trzy dni po 42 dniu.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.111.0</h1>\n  <h2>'),__append(time.format("2017-05-07","LL")),__append("</h2>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Zmieniono pole 'Stanowisko' na 'Obserwowane stanowisko'.</li>\n  </ul>\n  <h3>Inspekcja jakości</h3>\n  <ul>\n    <li>Poprawiono błąd wywalający serwer po dodaniu wyniku inspekcji z wybranym Właścicielem niezgodności.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono importowanie zleceń ZLF1 tak, aby zdarzenie pomyślnego importu było tworzone nawet wtedy, gdy lista\n      zleceń do zaimportowania była pusta.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Usunięto filtr 'Operacja'.</li>\n    <li>Zmieniono kolumnę 'Kontroler MRP' na liście tak, aby najpierw wyświetlany był MRP ze zlecenia\n      (MRP w jakim znajduje się linia jest przekreślone, jeżeli różni się od MRP zlecenia).</li>\n    <li>Dodano filtr 'Kontroler MRP zlecenia'.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Dodano zarządzanie plikami dokumentacji z poziomu WMES.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.110.0</h1>\n  <h2>"),__append(time.format("2017-04-24","LL")),__append("</h2>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Poprawiono błąd umożliwiający dodanie pustej karty.</li>\n  </ul>\n  <h3>Inspekcja jakości</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający komentowanie użytkowników nie będącym inspektorami.</li>\n    <li>Poprawiono błąd umożliwiający zmianę wyniku z NOK na OK przez użytkowników nie będących inspektorami.</li>\n    <li>Poprawiono błąd powodujący niewysyłanie e-maili do wybranego właściciela niezgodności.</li>\n    <li>Zmieniono eksportowanie wyników tak, aby zawierało kolumnę 'Ilość niezgodnych w skontrolowanych'.</li>\n    <li>Zmieniono stronę szczegółów wyniku tak, aby 'Właściciel niezgodności - mistrz' nie był wyświetlany w wynikach OK.</li>\n    <li>Zmieniono formularz tak, aby Inspektorzy nie mogli zmieniać akcji korygujących.</li>\n    <li>Zmieniono pole 'Właściciel niezgodności - mistrz' tak, aby lista zawierała tylko użytkowników z Funkcją na produkcji\n      Mistrz.</li>\n    <li>Zmieniono uprawnienia do modułu tak, aby Liderzy, Mistrzowie oraz Kierownicy mogli przegladać wyniki inspekcji.\n      Dodatkowo Liderzy i wybrani Mistrzowie mogą zmieniać pola: Akcje natychmiastowe, Przyczyna źródłowa oraz Akcje korygujące.</li>\n    <li>Zmieniono powiadamianie o przypisaniu do wyniku inspekcji tak, aby powiadamiany był także Kierownik wydziału, w którym\n      znajduje się wybrany Mistrz.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono filtr 'Nazwisko' tak, aby ignorował polskie znaki.</li>\n    <li>Dodano filtr 'Funkcja na produkcji'.</li>\n  </ul>\n  <h3>FTE</h3>\n  <ul>\n    <li>Zmieniono tworzenie nowych wpisów 'FTE (inne)' tak, aby dezaktywowane Wydziały były ignorowane.</li>\n  </ul>\n  <h3>Minuty dla Bezpieczeństwa</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.109.0</h1>\n  <h2>"),__append(time.format("2017-04-17","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niewyświetlanie listy ostatnich pracowników podczas wyboru personelu linii, w przypadku\n      gdy znaleziono tylko jedną osobę.</li>\n    <li>Zmieniono wyszukiwanie personelu tak, aby wyszukiwanie po nazwisku ignorowało polskie znaki.</li>\n    <li>Dodano wsparcie dla ekranów dotykowych na komputerach UP.</li>\n  </ul>\n  <h3>Plany dzienne MRP</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niewyświetlanie dymków ze szczegółami niektórych zleceń.</li>\n  </ul>\n  <h3>Obserwacje zachowań</h3>\n  <ul>\n    <li>Zmieniono stronę ze szczegółami karty tak, aby puste tabele nie były wyświetlane.</li>\n    <li>Zmieniono tabelę 'Obserwacje zachowań' na formularzu tak, aby domyślnie była pusta, zamiast zawierać wszystkie\n      dostępne kategorie zachowań.</li>\n    <li>Zmieniono pole 'Co zaobserwowano?\tCo aktywowało ryzykowne zachowanie?' na dwa oddzielne: 'Co zaobserwowano?' oraz\n      'Co aktywowało ryzykowne zachowanie?'.</li>\n    <li>Dodano napis 'wersja testowa' do przycisku 'Zarejestruj obserwację' dostępnym na Pulpicie.</li>\n  </ul>\n  <h3>Inspekcja jakości</h3>\n  <ul>\n    <li>Dodano nowe pole: Właściciel niezgodności - mistrz'.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono filtry 'Linia produkcyjna' tak, aby dla użytkowników z przypisanym wydziałem innego typu niż 'Produkcja'\n      wyświetlane były wszystkie linie produkcyjne.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.108.0</h1>\n  <h2>"),__append(time.format("2017-04-02","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd wywalający serwer, gdy przeglądarka z Formatką operatora dla linii, która została usunięta utraci\n      połączenie z serwerem.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono listę operacji tak, aby użytkownik bez uprawnień 'Dane produkcyjne: przeglądanie'\n      lub 'Zlecenia reszty działów: przeglądanie' nie mógł widzieć czasów operacji.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zlecenia</h3>\n  <ul>\n    <li>Zmieniono listę zleceń tak, aby użytkownik bez uprawnienia 'Dane produkcyjne: przeglądanie'\n      nie mógł widzieć kolumny 'Wydajność'.</li>\n  </ul>\n  <h3>Dane produkcyjne > Zmiany</h3>\n  <ul>\n    <li>Zmieniono oś czasu zmiany tak, aby użytkownik bez uprawnienia 'Dane produkcyjne: przeglądanie'\n      nie mógł widzieć wartości 'Wydajność'.</li>\n  </ul>\n  <h3>Plany dzienne MRP</h3>\n  <ul>\n    <li>Dodano możliwość przeglądania wszystkich planów.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący zablokowanie pól podczas edycji dla Inspektorów oraz Specjalistów.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Dodano możliwość rejestrowania 'Kart obserwacji zachowań'.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.107.0</h1>\n  <h2>"),__append(time.format("2017-03-19","LL")),__append("</h2>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprzeliczanie aktywnie wykonywanych zleceń po imporcie danych z SAP.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Poprawiono błąd wywalający serwer importera danych z SAP, gdy nie otrzymano danych zleceń (tylko operacje).</li>\n  </ul>\n  <h3>Plany dzienne MRP</h3>\n  <ul>\n    <li>Zmieniono edycję planów tak, aby nie można było edytować planów z przeszłości.</li>\n    <li>Dodano aktualizację 'Ilości do zrobienia', 'Ilości zrobionej' oraz 'Statusów' zleceń po każdym imporcie zleceń z SAP.</li>\n    <li>Dodano podświetlanie na pomarańczowo zleceń, w których 'Ilość zrobiona' jest większa od 'Ilości do zrobienia'.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono kolumnę 'Akcje korygujące' na liście wyników tak, aby wyświetlana była akcja najbliższa do aktualnego\n      dnia mająca status inny niż 'Zakończona'.</li>\n    <li>Dodano nowe pole: Ilość niezgodnych w skontrolowanych.</li>\n    <li>Dodano nowy raport: Jakość wyrobu gotowego.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.106.2</h1>\n  <h2>"),__append(time.format("2017-03-19","LL")),__append('</h2>\n  <h3>Plany dzienne MRP</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący utracenie części dużego zlecenia podczas generowania planu, gdy druga część zlecenia\n      została przydzielona do tej samej linii co pierwsza część (ponieważ czas dostępności linii nawet po przydzieleniu\n      części zlecenia nadal jest najwcześniejszy, co czyni tę linię najlepszym kandydatem do drugiej części zlecenia).</li>\n    <li>Zmieniono generowanie planu tak, aby pod uwagę brane były automatyczne przestoje zdefiniowane na poziomie linii,\n      a nie tylko na poziomie działu.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.106.1</h1>\n  <h2>'),__append(time.format("2017-03-13","LL")),__append("</h2>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Zmieniono wagi komponentów tak, że można zdefiniować minimalną i maksymalną wagę komponentu.</li>\n  </ul>\n  <h3>8D</h3>\n  <ul>\n    <li>Zmieniono listę zgłoszeń tak, żeby zamiast kolumny 'Opis problemu' wyświetlana była kolumna 'Temat'. Opis problemu\n      wyświetlany jest teraz w dymku po najechaniu na Temat.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.106.0</h1>\n  <h2>"),__append(time.format("2017-03-05","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano możliwość definiowania automatycznych przestojów dla grup linii produkcyjnych, a nie tylko na poziomie\n      działu. Jeżeli dana linia ma zdefiniowane automatyczne przestoje, to przestoje zdefiniowane w jej dziale\n      są ignorowane.</li>\n  </ul>\n  <h3>Monitoring > Lista linii produkcyjnych</h3>\n  <ul>\n    <li>Usunięto wyświetlanie 12NC zlecenia.</li>\n    <li>Zmieniono wyświetlanie personelu linii tak, aby wyświetlany był tylko nazwisko oraz iniciał imienia.</li>\n    <li>Zmieniono wyświetlanie nr zlecenia tak, aby wyświetlana była także nazwa produktu.</li>\n  </ul>\n  <h3>Wydajność godzinowa</h3>\n  <ul>\n    <li>Dodano możliwość skanowania kodów z numerami seryjnymi (tak jak na Formatce operatora).</li>\n  </ul>\n  <h3>FTE</h3>\n  <ul>\n    <li>Dodano do menu pozycję 'Ustawienia' (widoczna tylko dla użytkownikó z uprawnieniem\n      'Dane produkcyjne: zrządzanie').</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Dodano do raportu 'Ilość zgłoszeń' możliwość filtrowania po kategoriach.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.105.0</h1>\n  <h2>"),__append(time.format("2017-02-26","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie ilości zrobionej w nowo wybranym zleceniu jako <code>undefined</code>\n      (teraz <code>?</code>).</li>\n    <li>Dodano możliwość skanowania wirtualnego kodu z numerem seryjnym w celu zliczania ilości i obliczania czasu cyklu\n      linii.</li>\n  </ul>\n  <h3>Plany dzienne MRP</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający zresetowanie wartości 'Ilość' zlecenia poprzez usunięcie ustawionej wartości\n      (zamiast ustawienia na 0).</li>\n    <li>Dodano możliwość oznaczania zleceń w kolejce jako ignorowane. Ignorowane zlecenie nie jest brane pod uwagę\n      podczas generowania planu.</li>\n  </ul>\n  <h3>Raport Wskaźniki</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas generowania raportu z godzinowym podziałem czasu.</li>\n  </ul>\n  <h3>Zlecenie reszty działów</h3>\n  <ul>\n    <li>Zmieniono importowanie dokumentów zlecenia tak, aby nowa lista była sortowana po numerze, nazwie i 12NC dokumentu,\n      w celu ograniczenia ilości zmian zlecenia, gdy w zleceniu zdefiniowane są dokumenty o takim samym numerze.</li>\n  </ul>\n  <h3>8D</h3>\n  <ul>\n    <li>Usunięto pole 'Data reklamacji/paska'.</li>\n    <li>Poprawiono błąd pokazujący kierownikowi pola 'Data zakończenia D5' oraz 'Data zakończenia 8D' jako możliwe do zmiany,\n      mimo że po wysłaniu formularza, zmienione wartości nie będą zapisane.</li>\n    <li>Zmieniono etykietę pola 'Data rejestracji CRS' na 'Data rejestracji CRS/niezgodności'.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono wysyłanie e-maili tak, aby ignorowane były wysyłki e-maili bez przynajmniej jednego odbiorcy.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.104.1</h1>\n  <h2>"),
__append(time.format("2017-02-19","LL")),__append('</h2>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Dodano importowanie danych zleceń z transakcji SAP ZLF1.</li>\n  </ul>\n  <h3>8D</h3>\n  <ul>\n    <li>Usunięto pole: Wydział.</li>\n    <li>Poprawiono błąd powodujący wysyłanie podójnych e-maili z powiadomieniami o nieukończonych zgłoszeniach.</li>\n    <li>Zmieniono pole ID tak, aby było edytowalne przez użytkownika.</li>\n    <li>Dodano nowy słownik: Obszary.</li>\n    <li>Dodano nowe pola: Obszar oraz Kierownik obszaru.</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas aktualizacji klientów.</li>\n    <li>Dodano wsparcie dla aplikacji Walkner Xiconf v2.23.0.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.104.0</h1>\n  <h2>'),__append(time.format("2017-02-05","LL")),__append("</h2>\n  <h3>ZPW</h3>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Dodano nowy raport: Zaangażowanie.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono importowanie użytkowników z bazy KD tak, aby nieaktywni użytkownicy nie byli importowani.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący niezmienianie się wartości Takt Time (SAP) po zmianie ilości osób w zleceniu.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Poprawiono błąd przy wyświetlaniu zaznaczonego zlecenia ze statusami CNF i DLV.</li>\n    <li>Poprawiono błąd w algorytmie powodujący tworzenie pustego zlecenia na początku nowej zmiany.</li>\n    <li>Zmieniono menu 'Plany godzinowe' na 'Planowanie'.</li>\n    <li>Zmieniono algorytm planowania tak, aby ostatnie nieukończone zlecenie na III zmianie było przydzielane do\n      pozostałych linii (jeżeli jakieś są).</li>\n    <li>Zmieniono drukowanie planu tak, aby kolumna 'Ilość' znajdowała się po kolumnie 'Wyrób'.</li>\n    <li>Zmieniono drukowanie planu tak, aby plan był dzielony na kilka stron, jeżeli w planie jest więcej niż 42 zleceń.</li>\n    <li>Zmieniono wyświetlanie planowanych zleceń na zmianie danej linii tak, aby zawsze wyświetlany był plan ze wszystkich\n      MRP, w których dana linia jest aktywna.</li>\n    <li>Dodano ilość osób pracujących na linii do planu w wersji do druku.</li>\n    <li>Dodano możliwość wydrukowania planów dla wszystkich linii z danego MRP za jednym razem.</li>\n    <li>Dodano wyświetlanie komunikatu informującego o linii aktywnej w tym samym czasie na kilku różnych MRP.</li>\n    <li>Dodano oznaczanie zleceń jako nieprawidłowe (czerwone tło), jeżeli zlecenie nie ma żadnej operacji lub statusu.</li>\n    <li>Dodano ustawienia umożliwiające konfigurację algorytmu planowania.</li>\n  </ul>\n  <h3>Wydziały</h3>\n  <h3>Kontrolery MRP</h3>\n  <h3>WorkCentra</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający użycia znaku <code>-</code> w ID jednostki organizacyjnej.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprawidłowe informowanie użytkowników o nowej wersji aplikacji.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.103.0</h1>\n  <h2>"),__append(time.format("2017-01-15","LL")),__append("</h2>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono filtr daty na stronie z listą zleceń tak, aby podanie dat nie było wymagane.</li>\n    <li>Zmieniono wyświetlanie nazwy wyrobu tak, aby wyświetlana była wartość 'Nazwa' ze zlecenia, jeżeli rozpoczyna się\n      od 6 znaków A-Z0-9, a dopiero potem wartość 'Opis' (jeżeli istnieje).</li>\n    <li>Dodano do strony szczegółów zlecenia wyświetlanie komponentów z malarnii znajdujących się w podrzędnych zleceniach.</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Zmieniono domyślny limit wyświetlanych klientów z 50 na 100.</li>\n  </ul>\n  <h3>Plany godzinowe</h3>\n  <ul>\n    <li>Zmieniono ograniczenie dodawania nowego planu tak, aby można było dodawać plany do 7 dni w przyszłości.</li>\n    <li>Zmieniono ograniczenie edycji tak, aby można było edytować plany do 24 godzin po dacie planu.</li>\n    <li>Dodano funkcjonalność generowania dziennego planu na podstawie kolejki zleceń.</li>\n  </ul>\n  <h3>Watchdog</h3>\n  <ul>\n    <li>Zmieniono sprawdzanie żywotności serwerów tak, aby zapytania zostały automatycznie kończone, jeżeli trwają dłużej\n      niż 5 sekund.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.102.0</h1>\n  <h2>"),__append(time.format("2017-01-01","LL")),__append("</h2>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono rozpoznawanie starych numerów seryjnych IPT.</li>\n    <li>Poprawiono błąd powodujący nieprzeliczanie wartości 'Czas taktu' po operacji 'Poprawa zlecenia'.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Zmieniono filtry tak, aby można było wybrać kilka opcji na raz.</li>\n  </ul>\n  <h3>Plany godzinowe</h3>\n  <ul>\n    <li>Dodano możliwość ustawienia dla każdej linii sztywnej planowanej ilości wyświetlanej na ekranie\n      'Wydajność godzinowa'.</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie wykonanej ilości jako <code>undefined</code>.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Zmieniono akcję 'Znajdź zlecenie' na 'Znajdź zlecenie/dokument'. Nowy dokument dopisywany jest do lokalnej listy\n      dokumentów aktualnego zlecenia.</li>\n    <li>Zmieniono pole 'Filtruj dokumenty' tak, aby po wpisaniu pełnego 15NC, na liście pojawił się dany dokument.\n      Po otwarciu nowego dokumentu, dopisywany jest on do lokalnej listy dokumentów aktualnego zlecenia.</li>\n    <li>Zmieniono pole 'Filtruj dokumenty' tak, aby po wciśnięciu klawisza <kbd>Enter</kbd> otwierany był pierwszy dokument\n      na liście.</li>\n    <li>Dodano klawiaturę numeryczną do pola 'Filtruj dokumenty' w trybie dotykowym.</li>\n    <li>Dodano do nowego wyświetlacza dokumentów zapamiętywanie ostatnio otwartej strony dokumentu.</li>\n  </ul>\n</div>\n");return __output.join("")}});