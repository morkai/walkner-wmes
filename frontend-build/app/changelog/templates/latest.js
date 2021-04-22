define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano wyświetlanie i eksportowanie numeru pozycji komponentu (item).</li>\n  <li>Dodano możliwość rejestracji wykonanych ilości na zmianie produkcyjnej w każdym podzleceniu.</li>\n  <li>Dodano możliwość przypisania katalogu z modułu Dokumenty do listy dokumentów.</li>\n</ul>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Dodano możliwość wygenerowania listy części dla malarnii na podstawie zarejestrowanych ilości wykonanych\n    na zmianie produkcyjnej.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Zablokowano możliwość zmiany ilości wykonanej w zleceniu oraz ilości wykonanej w godzinie, jeżeli linia\n    ma włączone skanowanie numerów seryjnych.</li>\n  <li>Dodano możliwość drukowania etykiety bez 12NC komponentu.</li>\n  <li>Dodano możliwość przypisania etykiet komponentów do konkretnych linii produkcyjnych.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Grupy zleceń w raporcie Grupy wyrobów brane są od teraz z modułu Planów dziennych.</li>\n  <li>Zmieniono zliczanie sztuk tak, aby pojawienie się nowego wózka na stanowisku kończyło aktualną sztukę na tym\n    stanowisku, jeżeli jeszcze nie została zakończona.</li>\n</ul>\n<h3>Raporty > CLIP</h3>\n<ul>\n  <li>Dodano możliwość eksportowania wskaźników do pliku.</li>\n</ul>\n<h3>Reaguj</h3>\n<ul>\n  <li>Dodano Audyty oraz Rozmowy o BHP do raportu Zaangażowanie.</li>\n</ul>\n<h3>Audyty BHP</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający edycję audytów przez osobę z uprawnieniami do zarządzania.</li>\n  <li>Usunięto Osobę odpowiedzialną za niezgodność.</li>\n  <li>Zmieniono formularz tak, aby można było zapisać audyt bez żadnych niezgodności (wszystko OK).</li>\n  <li>Zmieniono nazwę pola 'Komentarz / Stwierdzone nieprawidłowości, ryzyka' na 'Stwierdzone nieprawidłowości,\n    ryzyka'.</li>\n  <li>Zmieniono kolumnę 'Stwierdzone nieprawidłowości' tak, aby pokazywała opis nieprawidłowości zamiast nazwy\n    kategorii.</li>\n  <li>Dodano do listy kolumnę 'Kategorie'.</li>\n  <li>Dodano nowe pole: Komentarz.</li>\n  <li>Dodano wymuszenie potwierdzenia zarejestrowania niezgodności jako ZPW.</li>\n</ul>\n<h3>Rozmowy o BHP</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający edycję rozmów przez osobę z uprawnieniami do zarządzania.</li>\n  <li>Poprawiono błąd umożliwiający wybranie działów zdefiniowanych dla Audytów a nie Rozmów.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Zmieniono drukowanie picklisty malarnii tak, aby każde zlecenie znajdowało się na oddzielnej stronie.</li>\n  <li>Dodano status malarnii 'W trakcie malowania (MSP)' do filtra kompletacji.</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Powiadomienia e-mail nie będą już wysyłane do uczestników zgłoszenia, jeżeli w momencie wysyłki przeglądają oni\n    dane zgłoszenie.</li>\n  <li>Dodano do raportu nowy podział czasu: brak (grupowanie sumy dla całego okresu).</li>\n  <li>Dodano do raportu dwa nowe wykresy: Ilość zgłoszeń wg zmiany produkcyjnej i godziny zgłoszenia.</li>\n  <li>Dodano wysyłanie powiadomień e-mail do uczestników wywołanych na czacie (nazwa+<kbd>TAB</kbd>).</li>\n</ul>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Dodano brakujące menu kontekstowe do podświetlonych na czacie kodów 12NC oraz numerów zleceń.</li>\n</ul>\n<h3>Dokumenty</h3>\n<ul>\n  <li>Dodano możliwość ograniczenia dostępu do nadrzędnych katalogów do wybranych funkcji na produkcji.</li>\n</ul>\n");return __output}});