define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Dane produkcyjne > Zmiany</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie się dymków ze szczegółami zlecenia na osi czasu zmiany.</li>\n  <li>Zmieniono określanie wykonanych MRP na zmianie tak, aby ignorowane były zlecenia, w których ilość wykonana\n    jest równa 0 (MRP nie zostanie zaliczone do złego Działu w raporcie CLIP, gdy na linii produkcyjnej operator\n    rozpoczął przez pomyłkę nieprawidłowe zlecenie).</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Dodano uprawnienia do zmiany kategorii dla funkcji 'Inżynier jakości'.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano wyświetlanie zleceń Magazynu przy zleceniach Malarnii.</li>\n</ul>\n<h3>Wiercenie</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wyeksportowanie zleceń wszystkich przepływów.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Dodano historię potwierdzeń dokumentów.</li>\n  <li>Dodano możliwość przypisywania komponentów do plików dokumentów po nazwie.</li>\n  <li>Dodano możliwość wyszukiwania wielu dokumentów po 15NC.</li>\n</ul>\n");return __output.join("")}});