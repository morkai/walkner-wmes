define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd powodujący, że użytkownik dokonujący zmiany w zgłoszeniu nie pojawiał się dla danego\n    użytkownika na liście uczestników (jeżeli wcześniej tam się nie znajdował) bez ponownego załadowania\n    zgłoszenia.</li>\n  <li>Dodano możliwość automatycznego przypisywania planistów do zgłoszeń z wybranych kategorii.</li>\n</ul>\n<h3>Zlecenia mechaniczne</h3>\n<ul>\n  <li>Poprawiono błąd powodujący, że lista operacji na stronie ze szczegółami zlecenia nie miała tłumaczeń.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Zmieniono blokowanie interfejsu tak, aby przy zablokowanym interfejsie nie działały żadne gesty dotykowe.</li>\n  <li>Zmieniono obsługę gestów tak, aby nie można było zmienić strony dokumentu przez ruch w lewo lub prawo.</li>\n</ul>\n");return __output.join("")}});