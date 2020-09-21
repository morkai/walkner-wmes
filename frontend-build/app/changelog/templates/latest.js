define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Poprawiono błędy związane ze sprawdzaniem uprawnień.</li>\n  <li>Dodano możliwość dopuszczania zleceń po planowanej dacie rozpoczęcia zlecenia.</li>\n  <li>Dodano do listy komponentów w szczegółach zlecenia oraz w aplikacji do wyświetlania dokumentów podświetlanie\n    komponentów dopuszczonych, które znajdują się już w BOM zlecenia.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono 'Sugestia' na 'Pomysł'.</li>\n  <li>Zmieniono pole 'Osoba zatwierdzająca' na 'Koordynator Kaizen'. Dodatkowo, jeżeli wybrany dział zgłaszający\n    ma zdefiniowaną listę koordynatorów, to użytkownik bez uprawnienia 'Usprawnienia: zarządzanie' nie może przypisać\n    dowolnego innego użytkownika jako koordynatora.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano nowy status: W trakcie malowania (MSP). Status nadawany w momencie rozpoczęcia malowania zleceniom,\n    które mają farbę MSP oraz ilość pomalowaną równą 0. Pędzel w Planowaniu i Kompletacji ma kolor fioletowy.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wymuszenie wysyłki wózków przeznaczonych na grupę linii.</li>\n  <li>Poprawiono błąd uniemożliwiający dodanie wszystkich powiązanych wózków z innego zlecenia z seta podczas\n    kompletacji przez kliknięcie na nazwę funkcji w edytorze wózków.</li>\n  <li>Zmieniono przydzielanie do istniejących setów tak, aby pierwszeństwo miały sety utworzone przez wymuszenie\n    kompletacji.</li>\n  <li>Dodano eksportowanie zdarzeń.</li>\n  <li>Dodano wsparcie dla interfejsu dotykowego w trybie wbudowanym aplikacji do kompletacji.</li>\n  <li>Dodano wyświetlanie statystyk w każdej sekcji na ekranie Wysyłki.</li>\n  <li>Dodano wyświetlanie statystyk dla każdej funkcji na ekranie Kompletacji.</li>\n  <li>Dodano możliwość otwarcia szczegółow seta na ekranie Kompletacji przez wpisanie numeru seta za pomocą\n    klawiatury w ciągu 0,5s.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Dodano do formuły obliczania czasu sztuki oraz roboczogodzin Współczynnik operacji Takt Time.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Dodano przeliczanie statusu malarnii dla zleceń nadrzędnych po zmianie numeru zlecenia nadrzędnego w zleceniach\n    podrzędnych.</li>\n</ul>\n<h3>Baza komponentów</h3>\n<ul>\n  <li>Dodano nowe stanowiska: PRE1, PRE2 oraz PRE3.</li>\n  <li>Dodano możliwość dzielenia CCN na części.</li>\n</ul>\n<h3>Raporty > Przezbrojenie</h3>\n<ul>\n  <li>Dodano dwa nowe wskaźniki oraz kolumny Bezczynność, Przestoje, Przerwy, Ilość oraz Wydajność.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Zmieniono format tygodni w raporcie Outgoing quality z daty początku tygodnia na numer tygodnia.</li>\n  <li>Zmieniono tabele Gdzie/Co tak, aby wyświetlany był opis obok kodu MRP/wady.</li>\n</ul>\n");return __output}});