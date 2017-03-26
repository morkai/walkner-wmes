define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.107.0</h1>\r\n<h2>"),__append(time.format("2017-03-19","LL")),__append("</h2>\r\n<h3>Baza testów</h3>\r\n<ul>\r\n  <li>Poprawiono błąd powodujący nieprzeliczanie aktywnie wykonywanych zleceń po imporcie danych z SAP.</li>\r\n</ul>\r\n<h3>Zlecenia reszty działów</h3>\r\n<ul>\r\n  <li>Poprawiono błąd wywalający serwer importera danych z SAP, gdy nie otrzymano danych zleceń (tylko operacje).</li>\r\n</ul>\r\n<h3>Plany dzienne MRP</h3>\r\n<ul>\r\n  <li>Zmieniono edycję planów tak, aby nie można było edytować planów z przeszłości.</li>\r\n  <li>Dodano aktualizację 'Ilości do zrobienia', 'Ilości zrobionej' oraz 'Statusów' zleceń po każdym imporcie zleceń z SAP.</li>\r\n  <li>Dodano podświetlanie na pomarańczowo zleceń, w których 'Ilość zrobiona' jest większa od 'Ilości do zrobienia'.</li>\r\n</ul>\r\n<h3>Inspekcja Jakości</h3>\r\n<ul>\r\n  <li>Zmieniono kolumnę 'Akcje korygujące' na liście wyników tak, aby wyświetlana była akcja najbliższa do aktualnego\r\n    dnia mająca status inny niż 'Zakończona'.</li>\r\n  <li>Dodano nowe pole: Ilość niezgodnych w skontrolowanych.</li>\r\n  <li>Dodano nowy raport: Jakość wyrobu gotowego.</li>\r\n</ul>\r\n");return __output.join("")}});