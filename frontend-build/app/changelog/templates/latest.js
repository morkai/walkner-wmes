define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.93.0</h1>\n<h2>"),__append(time.format("2016-08-21","LL")),__append("</h2>\n<h3>8D</h3>\n<ul>\n  <li>Dodano nowy moduł: 8D.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Poprawiono błąd podczas logowania mogący powodować, że po zalogowaniu nadal wyświetlany jest formularz logowania.</li>\n  <li>Zmieniono logowanie tak, aby wartość nazwy użytkownika nie rozróżniała wielkości liter.</li>\n</ul>\n<h3>Linie produkcyjne</h3>\n<ul>\n  <li>Zmieniono sortowanie na liście tak, aby linie posortowane były według nadrzędnych jednostek organizacyjnych.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Zmieniono strony z formularzami tak, aby nie były automatycznie odświeżane po utracie i ponownym nawiązaniu połączenia\n  z serwerem, w celu uniknięcia utraty wprowadzonych do formularza danych.</li>\n  <li>Zaktualizowano pakiety zależne.</li>\n</ul>\n");return __output.join("")}});