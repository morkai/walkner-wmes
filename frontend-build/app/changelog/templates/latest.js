define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niedziałanie skrótu do zaznaczenia ostatniego pola <kbd>Alt+Enter</kbd>.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wydrukowanie planu dla linii, na której zostały rozplanowane brakujące zlecenia\n    (zwykle zlecenia niekompletne z poprzedniego dnia, które zostały w planie linii, ale nie ma już ich w kolejce\n    zleceń danego MRP, bo zostały całkowicie zrobione, usunięte z listy zleceń planu, ale nie z rozplanowanych\n    zleceń na linii, bo MRP było zablokowane).</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Dodano brakujące tłumaczenia modułów na język angielski.</li>\n</ul>\n");return __output.join("")}});