define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Baza komponentów</h3>\n<ul>\n  <li>Dodano nowe pole do komponentów: Jednostka miary.</li>\n</ul>\n<h3>Inspekcja jakości</h3>\n<ul>\n  <li>Zmieniono Gdzie/Co w raporcie Outgoing quality tak, aby zliczana była wartość <em>Ilość niezgodnych</em>\n    a nie ilość przeprowadzonych inspekcji oraz dane na wykresie były z trzech tygodni a nie tylko z tygodnia\n    wybranego w filtrze.\n  </li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd powodujący brak aktualizacji listy uczestników dla użytkownika, który rozpoczął oczekujące\n    zlecenie.</li>\n  <li>Zmieniono uprawnienia do eskalacji zgłoszeń tak, aby Magazynierzy mogli eskalować wszystkie zgłoszenia bez\n    względu na wybrany Dział.</li>\n  <li>Dodano nowy poziom zgłoszenia: 0. Zgłoszenia dodawane od 17.06.2019 06:00 będą tworzone z poziomem 0.\n    Nowe zgłoszenia z poziomem 0 nie mają uzupełnianej listy uczestników. Lista uczestników będzie uzupełniana\n    dopiero po eskalacji zgłoszenia na wyższy poziom.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Zmieniono logowanie w trybie wbudowanym tak, aby było dostępne bez względu na to czy przeglądarka jest\n    zalogowana w głównej aplikacji.</li>\n  <li>Dodano do kolejki zleceń zakładkę 'Wszystkie przepływy'.</li>\n  <li>Dodano do menu kontekstowego zlecenia pozycje 'Otwórz zlecenie nadrzędne' oraz 'Otwórz zlecenie ...'\n    dla każdego zlecenia podrzędnego.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Zmieniono eksportowanie statystyk tak, aby można było wyeksportować dane dla zakresu dat oraz wybranych\n    linii. Dodatkowo oddzielnie obliczane są statystyki dla całości, dnia, MRP i linii.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Zmieniono importowanie dokumentów z SAP tak, aby po każdym importowaniu aktualizowane były nazwy dokumentów\n    w katalogu, które nie mają nazwy.</li>\n</ul>\n<h3>Baza testów > TRW</h3>\n<ul>\n  <li>Zmieniono proces testowania tak, aby pierwsze sprawdzenie wartości wejść w każdym kroku odbywało się po\n    minimum 150ms od ustawienia wyjścia a nie 1ms, aby przekaźniki z poprzedniego kroku miały szansę na\n    wyłączenie się.</li>\n  <li>Zmieniono proces testowania tak, aby przed odłączaniem przewodów wszystkie kroki były ponownie sprawdzane\n    po kolei, aby wykryć przypadek, gdy operator podczas podłączania przewodów w późniejszych krokach\n    przypadkowo odłączył wcześniej podłączone przewody.</li>\n  <li>Zmieniono proces testowania tak, aby odłączanie przewodów odbywało się krokowo: zamiast włączać wszystkie\n    zdefiniowane wyjścia i czekać na wyłączenie się wszystkich zdefiniowanych wejść, to wszystkie kroki testu są\n    są wykonywane ponownie ale z odwrotym warunkiem (wejście zamiast załączone musi być wyłączone).</li>\n</ul>\n");return __output.join("")}});