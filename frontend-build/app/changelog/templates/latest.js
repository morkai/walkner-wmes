define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Poprawiono błąd umożliwiający dodanie wniosku bez zdefiniowania przynajmniej jednego zastępczego komponentu.</li>\n  <li>Zmieniono wyświetlanie dopuszczonych komponentów w zleceniu tak, aby pokazywały się także komponenty zastępcze\n    bez komponentu podstawowego.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Zmieniono obliczanie wskaźnika realizacji sekwencji tak, aby zlecenia o tym samym numerze rozpoczęte na tej\n    samej linii jedno po drugim były traktowane jako jedno, te same zlecenie.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Dodano do raportu Ilość zgłoszeń wykres Ilość zgłoszeń wg zatrudnienia. Zatrudnienie właściciela zgłoszenia\n    brane jest z firmy do niego przypisanej w momencie dodania zgłoszenia.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wyświetlanie komunikatu o złej dacie realizacji, nawet gdy po wybraniu nieprawidłowej\n    daty wybrano prawidłową.</li>\n  <li>Dodano nowe pole: Przełożony.</li>\n  <li>Dodano Ilość zgłoszeń wg przełożonych do raportu Ilość zgłoszeń.</li>\n  <li>Dodano filtr Przełożony do raportu Wynagrodzenie.</li>\n  <li>Dodano wartość wynagrodzenia do raportu Wynagrodzenie.</li>\n</ul>\n");return __output}});