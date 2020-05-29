define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Poprawiono błąd powodujący traktowanie zeskanowanej etykiety komponentu jako etykiety oprawy z numerem\n    seryjnym, jeżeli nr sztuki przekracza wartośc 9999.</li>\n  <li>Zmieniono rozpoczynanie nowych zleceń tak, aby nie można było rozpocząć zamkniętego zlecenia (CNF, DLV,\n    TECO, DLT lub DLFL).</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować utratę wartości MRP zlecenia podczas edycji wyniku inspekcji.</li>\n  <li>Dodano do raportu Outgoing quality wyświetlanie Kategorii błędu do listy wyników 4C oraz w dymku wady\n    na wykresie Co.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Zmieniono opcję ignorowania statusów malarnii podczas kompletacji tak, aby można było wybrać poszczególne\n    ignorowane statusy.</li>\n  <li>Zmieniono wysyłkę wózków tak, aby wózki ze zleceniami zaplanowanymi na początek I zmiany trafiały do realizacji\n    pod koniec ostatniej pracującej zmiany fabryki, a nie godzinę przed rozpoczęciem zaplanowanego zlecenia.</li>\n  <li>Dodano nową opcję konfiguracyjną kompletacji: Próg czasu dostępności - jeżeli całkowity dostępny czas linii\n    (suma czas skompletowanego i dostępnego) podczas tworzenia nowego seta jest mniejszy niż dany próg, to\n    traktowany jest jakby wynosił 0. Całkowity dostępny czas ma priorytet w określaniu dla jakiej linii zostanie\n    stworzony kolejny set.</li>\n  <li>Dodano możliwość wymuszenia rozpoczęcia wysyłki na wybraną linię.</li>\n  <li>Dodano blokowanie kompletacji zleceń zaplanowanych na dzień, który nie został jeszcze rozpoczęty na danej\n    linii.</li>\n  <li>Dodano możliwość przenoszenia dostarczonych zleceń na inne linie.</li>\n  <li>Dodano odnośniki do 'Dostarczonych zleceń' do menu 'Planowanie > Magazyn' oraz do wyników wyszukiwania\n    po pełnym numerze zlecenia.</li>\n</ul>\n<h3>Obserwacje zachowań</h3>\n<ul>\n  <li>Dodano do raportu Ilość obserwacji wykres Ilość bezpiecznych zachowań wg kategorii.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano nowy status: Odstawione.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd powodujący, że przy Odblokowywaniu MRP komunikat o skompletowaniu zleceń w magazynie\n    widoczny jest, jeżeli w planie magazynu na dany dzień istnieje jakiekolwiek zlecenie z danym MRP, zamiast\n    sprawdzać czy istnieje zlecenie Rozpoczęte lub Zakończone.</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wyświetlenie zduplikowanej wiadomości dla użytkownika, który ją wysłał, jeżeli\n    dany użytkownik nie znajdował się na liście uczestników.</li>\n  <li>Poprawiono błąd powodujacy duplikowanie użytkowników na liście uczestników po dodaniu nowego uczestnika.</li>\n  <li>Zmieniono pole 'Wyślij wiadomość...' w czacie tak, aby jego wysokość dostosowywała się do treści.</li>\n  <li>Dodano możliwość włączenia trybu wieloliniowego dla wysyłanej wiadomości w czacie wciskając <kbd>Enter</kbd>\n    w pustym polu lub <kbd>Shift+Enter</kbd> po wpisaniu czegokolowiek.</li>\n</ul>\n");return __output}});