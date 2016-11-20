define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.98.2</h1>\n<h2>"),__append(time.format("2016-11-20","LL")),__append("</h2>\n<h3>Zdarzenia</h3>\n<ul>\n  <li>Dodano brakujące tłumaczenia zdarzeń.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Poprawiono błąd powodujący, że przycisku usuwania klienta na liście klientów były aktywne dla klientów, którzy\n    aktualnie są połączeni z serwerem, zamiast tylko dla będących offline.</li>\n  <li>Zmieniono program do konwertowania plików PDF na obrazy z <em>sejda-console</em> na <em>pdfbox-app</em>\n    w celu poprawy renderowania niektórych czcionek.</li>\n  <li>Dodano wsparcie dla uruchamiania przeglądarki dokumentów na nowych komputerach UP.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Poprawiono błąd powodujący, że pole 'Kategoria zachowania' nie było obsługiwane przez historię zmian zgłoszenia.</li>\n  <li>Poprawiono błąd powodujący, że nie można było zmienić wartości pól typu lista wyboru na pustą wartość.</li>\n  <li>Zmieniono pole 'Kategoria zachowania' tak, aby nie było wymagane.</li>\n  <li>Dodano kolumnę 'Kategoria zachowania' do listy zgłoszeń.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający zapisanie użytkownika, jeżeli jako wartość pola 'ID (KD)'\n    podano <code>-1</code>.</li>\n  <li>Zmieniono formularz edycji użytkownika tak, aby użytkownik nie mógł sam sobie zmienić wartości pola 'ID (KD)'\n    oraz flagi 'Konto aktywne?'.</li>\n</ul>\n<h3>Baza testów</h3>\n<ul>\n  <li>Zmieniono eksportowanie wyników do pliku CSV: usunięto kolumny dotyczące wewnętrznego, lokalnego zlecenia\n    oraz dodano kolumny: service tag, linia produkcyjna oraz nazwy LED/HID.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Zmieniono wyświetlanie wartości 'Nazwa rodziny/detalu' tak, aby wyświetlał wartość 'Opis' ze zlecenia\n    zamiast 'Nazwa' (jeżeli jest dostępne).</li>\n  <li>Dodano nową opcję konfiguracyjną: Takt Time > Współczynniki operacji.</li>\n</ul>\n");return __output.join("")}});