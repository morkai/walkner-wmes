define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Baza testów > TRW</h3>\n<ul>\n  <li>Dodano możliwość przypisywania komunikatów do poszczególnych kroków programu.</li>\n</ul>\n<h3>Baza testów > Xiconf</h3>\n<ul>\n  <li>Dodano możliwość filtrowania importowanych komponentów po 12NC.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Zmieniono wyświetlanie zagnieżdżonych list w historii zleceń na bardziej użyteczne.</li>\n  <li>Dodano możliwość definiowania uwag dla zleceń. Uwagi wyświetlane są w aplikacjach dokumentacji\n    oraz malarnii.</li>\n  <li>Dodano skróty klawiszowe do poszczególnych paneli na stronie ze szczegółami zlecenia.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd powodujący ignorowanie przypisania zlecenia do linii.</li>\n  <li>Poprawiono błąd powodujący ignorowanie flagi 'Wymuś dzień pracujący'.</li>\n  <li>Poprawiono błąd powodujący niezapisywanie usunięcia grup linii.</li>\n  <li>Zmieniono algorytm planowania tak, aby podczas kolejnych przejść planowania, zlecenia zostały usunięte\n    z grupy, do której zostały przypisane w pierwszym przejściu, jeżeli ta grupa nie ma zdefiniowanych\n    żadnych komponentów.</li>\n  <li>Zmieniono akcję 'Komentuj zlecenie' tak, aby zamiast otwierania nowego okna ze stroną szczegółów zlecenia,\n    pokazywany był tylko formularz do komentowania.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niezapisywanie podsumowania czasu cyklu dla zlecenia produkcyjnego\n    z linii podczas kończenia zlecenia.</li>\n  <li>Poprawiono błąd powodujący niewysyłanie stanów lamp natychmiast po ich zmianie.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano ilość do zrobienia do zrzutu wykonania planu.</li>\n  <li>Dodano ilość roboczogodzin do listy farb oraz zrzutu farb.</li>\n</ul>\n<h3>Obserwacje zachowań</h3>\n<ul>\n  <li>Dodano odnośniki do formularza w wersji do druku.</li>\n  <li>Dodano filtr 'Ryzykowne zachowania'.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Dodano możliwość drukowania etykiet komponentów.</li>\n</ul>\n<h3>Monitoring > Układ fabryki</h3>\n<ul>\n  <li>Dodano nowy tryb wyświetlania: Wydajność godzinowa.</li>\n</ul>\n<h3>Wydajność godzinowa</h3>\n<ul>\n  <li>Dodano wykres z zaplanowanymi i wykonanymi ilościami na zmianie.</li>\n</ul>\n");return __output}});