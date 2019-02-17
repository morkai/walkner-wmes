define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować wywalenie się serwera, jeżeli dwóch użytkowników zmieniało zgłoszenie\n    w tym samym czasie.</li>\n  <li>Zmieniono treść powiadomienia SMS tak, aby zawierał adres URL do zgłoszenia.</li>\n  <li>Dodano możliwość wywoływania formularza dodawania zgłoszenia klawiszem <kbd>F1</kbd>.</li>\n  <li>Dodano możliwość kopiowania Kategorii i Problemu z ostatniego zgłoszenia użytkownika podczas dodawania\n    nowego zgłoszenia.</li>\n  <li>Dodano możliwość zdefiniowania 'Kategorii ETO' dla każdej kategorii zgłoszeń. Jeżeli wybrana zostanie kategoria,\n    która ma przypisaną kategorię ETO oraz wybrane zlecenie jest ETO, to kategoria automatycznie zostanie zamieniona\n    na kategorię ETO (i w drugą stronę).</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono poawiadamianie o nowych zgłoszeniach tak, aby specjalny e-mail FM-24 był wysyłany na adres\n    zatwierdzającego, jeżeli nazwa zatwierdzającego pasuje do wzorca <code>/fm.?24/i</code>.</li>\n  <li>Dodano do formularza dodawania możliwość dołączenia prośby o potwierdzenie przyjęcia zgłoszenia FM-24\n    do specjalnego e-maila FM-24.</li>\n  <li>Dodano możliwość włączenia powiadomień SMS i e-mail o nowych zgłoszeniach FM-24 przez każdego użytkownika.</li>\n</ul>\n<h3>Operator</h3>\n<ul>\n  <li>Poprawiono błąd powodujący nieprzeliczanie danych zmiany produkcyjnej po wykonaniu operacji\n    'Poprawa zlecenia'.</li>\n  <li>Poprawiono błąd powodujący zwracanie pustej kolejki zaplanowanych zleceń po połączeniu się klienta\n    z serwerem.</li>\n  <li>Dodano osie czasu przedstawiające zaplanowaną oraz wykonaną sekwencję zleceń.</li>\n</ul>\n<li>Inspekcja Jakości</li>\n<ul>\n  <li>Usunięto komunikat informujący o nowym typie filtra listy.</li>\n</ul>\n<li>Jednostki organizacyjne</li>\n<ul>\n  <li>Zmieniono usuwanie jednostek organizacyjnych tak, aby nie można było usunąć jednostki nadrzędnej, która\n    ma przypisane jednostki podrzędne (np. nie można usunąć WorkCentra, jeżeli jakaś Linia należy do tego WC).</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Dodano do statystyk wskaźniki realizacji planu z podziałem na zmiany produkcyjne.</li>\n  <li>Dodano do statusów zleceń wyświetlanie priorytetu zlecenia (np. <strong>E</strong> - Pilot ETO).</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Dodano nowe uprawnienie: Magazyn - zarządzanie użytkownikami.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Zmieniono maksymalną szerokość często używanych formularzy tak aby była dynamicznie dostosowywana na większych\n    rozdzielczościach ekranu.</li>\n</ul>\n");return __output.join("")}});