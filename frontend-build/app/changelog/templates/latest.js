define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd powodujący oznaczenie czasu rozpoczęcia zlecenia jako zaliczony na podsumowaniu realizacji\n    sekwencji dla wybranego MRP, jeżeli czas rozpoczęcia różni się od czasu granicznego o przesunięcie lokalnej\n    strefy czasowej.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano wsparcie dla dwóch nowych liczników obciążenia: Kabina 1 i Kabina 2.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający zapisanie opcji 'W trakcie malowania (MSP)' dla ustawienia\n    'Ignorowane statusy malarnii'.</li>\n  <li>Poprawiono błąd powodujący dublowanie podsumowania Ilości oraz Czasu produkcji na ekranie Wysyłki, jeżeli\n    jedno zlecenie skompletowane jest na więcej niż jednym wózku.</li>\n  <li>Poprawiono błąd mogący spowodować desynchronizację statusu malarnii dla zlecenia wierconego niemalowanego.</li>\n  <li>Zmieniono listę problemów tak, aby zamiast zaplanowanego czasu końca zlecenia wyświetlany był czas rozpoczęcia\n    problemu.</li>\n  <li>Dodano wsparcie dla drukowania wielostronicowych picklist malarnii.</li>\n</ul>\n<h3>Monitoring</h3>\n<ul>\n  <li>Zmieniono oznaczanie zleceń oraz linii tak, aby zielony kolor oznaczał wydajność >= 100%, żółty < 100%,\n    a pomarańczowy < 90%.</li>\n  <li>Zmieniono oznaczanie linii na liście linii produkcyjnych tak, aby tło oznaczało wydajność całej zmiany a nie\n    aktualnie wykonywanego zlecenia.</li>\n</ul>\n<h3>Narzędzia</h3>\n<ul>\n  <li>Dodano do menu Narzędzia pozycje Sprawdzanie komponentów oraz Etykiety komponentów.</li>\n  <li>Dodano dla Inżynierów procesu uprawnienia do Sprawdzania komponentów oraz Etykiet komponentów.</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Zmieniono powiadomienia e-mail tak, aby w treści znalazł się Czas zgłoszenia oraz informacja o zgłoszeniu\n    starszym niż dwa dni (wysłane z powodu zmiany kategorii).</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Usunięto pole Działy koordynujące z formularza dodawania zgłoszenia.</li>\n  <li>Dodano do powiadomienia o niezakończonych zgłoszeniach wysyłane do Koordynatorów Kaizen nowy odnośnik\n    'Otwarte zgłoszenia koordynowane przez Ciebie' oraz zmieniono opisy pozostałych odnośników na czytelniejsze.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Dodano możliwość przypisania do dokumentu 12NC komponentu, który nie istnieje jeszcze w bazie danych.</li>\n</ul>\n");return __output}});