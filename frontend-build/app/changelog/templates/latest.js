define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.93.1</h1>\n<h2>"),__append(time.format("2016-08-28","LL")),__append("</h2>\n<h3>8D</h3>\n<ul>\n  <li>Poprawiono błąd wywalający serwer podczas wysyłania powiadomień do zgłoszeń mających zdefiniowaną\n    jedną reklamację.</li>\n  <li>Poprawniono błąd mogący podować podwójne wysyłanie powiadomień e-mail.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Poprawiono błąd wywalający serwer podczas synchronizacji użytkowników z bazą KD.</li>\n  <li>Dodano możliwość zmiany wewnętrznego pola 'ID (KD)' - identyfikator użytkownika w bazie KD, używany\n    do porównywania rekordów podczas procesu synchronizacji użytkowników.</li>\n  <li>Dodano możliwość dezaktywacji konta użytkownika.</li>\n  <li>Dodano możliwość tworzenia kilku użytkowników z tym samym loginem (ale z tylko jeden z nich może mieć aktywne\n    konto w tym samym czasie).</li>\n</ul>\n<h3>Przestoje > Alarmy</h3>\n<ul>\n  <li>Zmieniono temat wysyłanych e-maili tak, aby zawierał opis lub nazwę produktu ze zlecenia, w którym rozpoczęto\n    przestój.</li>\n</ul>\n");return __output.join("")}});