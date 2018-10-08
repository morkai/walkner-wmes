define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.126.0</h1>\n<h2>"),__append(time.format("2018-10-07","LL")),__append("</h2>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd powodujący nieresetowanie grupy dla zleceń, które były kandydatem do trafnienia na linię, ale\n    ostatecznie się na niej nie znalazły i wróciły do puli zleceń do rozplanowania.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Zmieniono klucz powiązania etapu ze zleceniem magazynu z 'nr zlecenia:nr grupy:linia' na\n    'nr zlecenia:kolejny nr:linia' w celu ograniczenia sytuacji, w których wybrana wartość jest utracona po zmianach\n    w planie dziennym.</li>\n  <li>Dodano filtr 'Linie produkcyjkne'.</li>\n  <li>Dodano możliwość eksportu zleceń.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Zmieniono eksportowanie zleceń tak, aby pod uwagę brany był aktualny filtr farby.</li>\n</ul>\n<h3>Plany godzinowe</h3>\n<ul>\n  <li>Zmieniono algorytm aktualizacji wartości planu tak, aby zmiany wykonywały się jedna po drugiej a nie równolegle,\n    w celu ograniczenia błędu zapisu poza kolejnością.</li>\n</ul>\n<h3>Produkcja > Numery seryjne</h3>\n<ul>\n  <li></li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Dodano kolumnę 'Linia' do listy wyników inspekcji.</li>\n  <li>Dodano flagę 'Wymagane zlecenie?' do rodzajów inspekcji.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Poprawiono przybliżanie i powiększanie dokumentu za pomocą dotyku.</li>\n  <li>Dodano filtr 'Data dokumentu' do katalogu dokumentów.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n</ul>\n<h3>Minuty dla Bezpieczeństwa</h3>\n<ul>\n  <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n</ul>\n<h3>Obserwacje zachowań</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie szczegółów karty po kliknięciu myszką na wartości kolumn:\n    Co zaobserwowano, Ryzykowne warunki w miejscu pracy, Trudne do zmiany zachowania oraz\n    Trudne do zmiany warunki pracy.</li>\n  <li>Zmieniono formularz dodawania tak, aby dezaktywowani użytkownicy nie byli wyświetlani na liście.</li>\n  <li>Dodano filtr 'Linia' do listy kart obserwacji.</li>\n  <li>Dodano nowe pole: Miejsce pracy obserwatora.</li>\n  <li>Dodano do raportu wykres 'Ilość przeprowadzonych obserwacji wg działów (miejsce pracy obserwatora)'.</li>\n</ul>\n<h3>Baza testów > Oprawy HID</h3>\n<ul>\n  <li>Zmieniono maksymalną długość ID lampy HID z 13 znaków do 20 znaków.</li>\n  <li>Dodano oddzielne uprawnienie do zarządzania oprawami HID.</li>\n</ul>\n<h3>Baza PFEP</h3>\n<ul>\n  <li>Zmieniono uprawnienia do odczytu tak, aby mieli je wszyscy zalagowani użytkownicy.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Dodano możliwość sprawdzania komponentów po skanowaniu nr seryjnego zlecenia.</li>\n</ul>\n<h3>Wydajność godzinowa</h3>\n<ul>\n  <li>Dodano możliwość sprawdzania komponentów po skanowaniu nr seryjnego zlecenia.</li>\n</ul>\n");return __output.join("")}});