define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v0.158.0</h1>\n<h2>"),__append(time.format("2021-02-28","LL")),__append("</h2>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Zmieniono domyślną maksymalną ilość wykonaną na 125% całkowitej ilości do zrobienia lub 9999, jeżeli nie\n    udało się określić całkowitej ilości do zrobienia.</li>\n  <li>Zmieniono domyślną maksymalną ilość osób na 125% ilości osób wg SAP lub 15, jeżeli nie udało się określić\n    ilości osób wg SAP.</li>\n</ul>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Dodano możliwość zmiany opinii po dopuszczeniu materiału zastępczego przez osobę, która wcześniej wydała\n    opinię.</li>\n  <li>Dodano możliwość usuwania zleceń bez względu na aktualny status dopuszczenia.</li>\n</ul>\n<h3>Firmy</h3>\n<ul>\n  <li>Dodano możliwość definiowania wielu różnych wzorców synchronizacji z bazą KD.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Zmieniono importowanie użytkowników z bazy KD tak, aby firma określana była na podstawie zdefiniowanych\n    wzorców synchronizacji firmy a nie ID firmy.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować zresetowanie planu godzinowego linii.</li>\n  <li>Dodano nową wersję algorytmu generatora planu.</li>\n</ul>\n<h3>Baza komponentów</h3>\n<ul>\n  <li>Zmieniono filtry tekstowe tak, aby można było filtrować według wielu wartości oddzielonych średnikiem.</li>\n  <li>Zmieniono wyświetlanie wartości w kolumnach Stanowisko tak, aby puste stanowiska nie pokazywały wartości 0.</li>\n  <li>Dodano kolumnę 'Używane w' (Miejsce przeznaczenia).</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono sposób wyświetlania załączników z tabeli na galerię.</li>\n  <li>Dodano możliwość dodawania wielu załączników.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wygenerowanie raportu Wyniki dla większego zakresu danych.</li>\n</ul>\n<h3>Narzędzia pomiarowe</h3>\n<ul>\n  <li>Dodano nową opcję konfiguracyjną umożliwiającą ustawienie osób, które mają być powiadamiane o każdej\n    zbliżającej się kalibracji.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Zmieniono wysyłkę wózków tak, aby podczas dokładania wózków do limitu brany był tylko pierwszy dostępny set\n    w całości mieszczący się w limicie. Wcześniej wysyłka mogła być rozszerzona o wózek zaplanowany na później co\n    mogło zakłócić sekwencję.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Zmieniono aplikację do wyświetlania dokumentów tak, aby lista dokumentów była automatycznie aktualizowana\n    jeżeli zmieni się lista dokumentów w zleceniu.</li>\n  <li>Dodano możliwość przypisywania dokumentów do MRP.</li>\n  <li>Dodano możliwość dodawania do katalogu dokumentów obrazów w formacie JPEG.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Zmieniono import dokumentów tak, aby zrzut był robiony tylko dla niezakończonych zleceń. Dodatkowo dokumenty\n    dla zleceń dwa dni robocze w przód nie są zrzucane, jeżeli już istnieją.</li>\n  <li>Zmieniono 'Czas utworzenia' tak, aby wartość brana była z danych 'COOIS > Headers > Created on/Time'.\n    Wcześniejsza wartość brana z 'ZOIN > Document Date/Time' to teraz 'Czas zlecenia sprzedaży'.</li>\n  <li>Dodano możliwość dodawania do katalogu dokumentów obrazów w formacie JPEG.</li>\n  <li>Dodano automatyczny import dokumentów do zlecenia, które zostało rozpoczęte na linii produkcyjnej i nie ma\n    aktualnie żadnych dokumentów.</li>\n</ul>\n<h3>Baza testów</h3>\n<ul>\n  <li>Dodano nowy moduł: Tester GearFlex.</li>\n</ul>\n");return __output}});