define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd powodujący nieprawidłową obsługę nieudanego dodania załącznika na stronie ze szczegółami\n    zgłoszenia.</li>\n  <li>Zmieniono wykresy tak, aby etykiety nad słupkami były wyświetlane, jeżeli całkowita ilość słupków na\n    wykresie nie przekracza 40, jeżeli jest tylko jedna grupa słupków (wcześniej zawsze 35).</li>\n</ul>\n<h3>Zmiany produkcyjne</h3>\n<ul>\n  <li>Zmieniono obliczanie Wydajności dla całej zmiany tak, aby pod uwagę brany był Współczynnik operacji\n    (Takt Time).</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Zmieniono kolumnę 'Nazwa wyrobu' na liście zleceń tak, aby zawsze wyświetlała wartość 'Nazwa' zlecenia,\n    a wartość 'Opis' w dymku po najechaniu kursorem (jeżeli istnieje i jest inna niż 'Nazwa'). Wcześniej\n    zamiast 'Nazwy' wyświetlany był 'Opis' (jeżeli istniał).</li>\n</ul>\n");return __output.join("")}});