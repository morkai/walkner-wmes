define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Zmieniono domyślną maksymalną ilość wykonaną na 125% całkowitej ilości do zrobienia lub 9999, jeżeli nie\n    udało się określić całkowitej ilości do zrobienia.</li>\n  <li>Zmieniono domyślną maksymalną ilość osób na 125% ilości osób wg SAP lub 15, jeżeli nie udało się określić\n    ilości osób wg SAP.</li>\n</ul>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Dodano możliwość zmiany opinii po dopuszczeniu materiału zastępczego przez osobę, która wcześniej wydała\n    opinię.</li>\n  <li>Dodano możliwość usuwania zleceń bez względu na aktualny status dopuszczenia.</li>\n</ul>\n<h3>Firmy</h3>\n<ul>\n  <li>Dodano możliwość definiowania wielu różnych wzorców synchronizacji z bazą KD.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Zmieniono importowanie użytkowników z bazy KD tak, aby firma określana była na podstawie zdefiniowanych\n    wzorców synchronizacji firmy a nie ID firmy.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować zresetowanie planu godzinowego linii.</li>\n  <li>Dodano nową wersję algorytmu generatora planu.</li>\n</ul>\n<h3>Baza kanban</h3>\n<ul>\n  <li>Zmieniono filtry tekstowe tak, aby można było filtrować według wielu wartości oddzielonych średnikiem.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono sposób wyświetlania załączników z tabeli na galerię.</li>\n  <li>Dodano możliwość dodawania wielu załączników.</li>\n</ul>\n");return __output}});