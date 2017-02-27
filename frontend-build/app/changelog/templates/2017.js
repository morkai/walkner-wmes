define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\r\n  <h1>v0.104.1</h1>\r\n  <h2>'),__append(time.format("2017-02-19","LL")),__append('</h2>\r\n  <h3>Zlecenia reszty działów</h3>\r\n  <ul>\r\n    <li>Dodano importowanie danych zleceń z transakcji SAP ZLF1.</li>\r\n  </ul>\r\n  <h3>8D</h3>\r\n  <ul>\r\n    <li>Usunięto pole: Wydział.</li>\r\n    <li>Poprawiono błąd powodujący wysyłanie podójnych e-maili z powiadomieniami o nieukończonych zgłoszeniach.</li>\r\n    <li>Zmieniono pole ID tak, aby było edytowalne przez użytkownika.</li>\r\n    <li>Dodano nowy słownik: Obszary.</li>\r\n    <li>Dodano nowe pola: Obszar oraz Kierownik obszaru.</li>\r\n  </ul>\r\n  <h3>Baza testów</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas aktualizacji klientów.</li>\r\n    <li>Dodano wsparcie dla aplikacji Walkner Xiconf v2.23.0.</li>\r\n  </ul>\r\n</div>\r\n<div class="hidden">\r\n  <h1>v0.104.0</h1>\r\n  <h2>'),__append(time.format("2017-02-05","LL")),__append("</h2>\r\n  <h3>ZPW</h3>\r\n  <h3>Usprawnienia</h3>\r\n  <ul>\r\n    <li>Dodano nowy raport: Zaangażowanie.</li>\r\n  </ul>\r\n  <h3>Użytkownicy</h3>\r\n  <ul>\r\n    <li>Zmieniono importowanie użytkowników z bazy KD tak, aby nieaktywni użytkownicy nie byli importowani.</li>\r\n  </ul>\r\n  <h3>Formatka operatora</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd powodujący niezmienianie się wartości Takt Time (SAP) po zmianie ilości osób w zleceniu.</li>\r\n  </ul>\r\n  <h3>Planowanie</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd przy wyświetlaniu zaznaczonego zlecenia ze statusami CNF i DLV.</li>\r\n    <li>Poprawiono błąd w algorytmie powodujący tworzenie pustego zlecenia na początku nowej zmiany.</li>\r\n    <li>Zmieniono menu 'Plany godzinowe' na 'Planowanie'.</li>\r\n    <li>Zmieniono algorytm planowania tak, aby ostatnie nieukończone zlecenie na III zmianie było przydzielane do\r\n      pozostałych linii (jeżeli jakieś są).</li>\r\n    <li>Zmieniono drukowanie planu tak, aby kolumna 'Ilość' znajdowała się po kolumnie 'Wyrób'.</li>\r\n    <li>Zmieniono drukowanie planu tak, aby plan był dzielony na kilka stron, jeżeli w planie jest więcej niż 42 zleceń.</li>\r\n    <li>Zmieniono wyświetlanie planowanych zleceń na zmianie danej linii tak, aby zawsze wyświetlany był plan ze wszystkich\r\n      MRP, w których dana linia jest aktywna.</li>\r\n    <li>Dodano ilość osób pracujących na linii do planu w wersji do druku.</li>\r\n    <li>Dodano możliwość wydrukowania planów dla wszystkich linii z danego MRP za jednym razem.</li>\r\n    <li>Dodano wyświetlanie komunikatu informującego o linii aktywnej w tym samym czasie na kilku różnych MRP.</li>\r\n    <li>Dodano oznaczanie zleceń jako nieprawidłowe (czerwone tło), jeżeli zlecenie nie ma żadnej operacji lub statusu.</li>\r\n    <li>Dodano ustawienia umożliwiające konfigurację algorytmu planowania.</li>\r\n  </ul>\r\n  <h3>Wydziały</h3>\r\n  <h3>Kontrolery MRP</h3>\r\n  <h3>WorkCentra</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd uniemożliwiający użycia znaku <code>-</code> w ID jednostki organizacyjnej.</li>\r\n  </ul>\r\n  <h3>Inne</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd powodujący nieprawidłowe informowanie użytkowników o nowej wersji aplikacji.</li>\r\n  </ul>\r\n</div>\r\n<div class=\"hidden\">\r\n  <h1>v0.103.0</h1>\r\n  <h2>"),__append(time.format("2017-01-15","LL")),__append("</h2>\r\n  <h3>Zlecenia reszty działów</h3>\r\n  <ul>\r\n    <li>Zmieniono filtr daty na stronie z listą zleceń tak, aby podanie dat nie było wymagane.</li>\r\n    <li>Zmieniono wyświetlanie nazwy wyrobu tak, aby wyświetlana była wartość 'Nazwa' ze zlecenia, jeżeli rozpoczyna się\r\n      od 6 znaków A-Z0-9, a dopiero potem wartość 'Opis' (jeżeli istnieje).</li>\r\n    <li>Dodano do strony szczegółów zlecenia wyświetlanie komponentów z malarnii znajdujących się w podrzędnych zleceniach.</li>\r\n  </ul>\r\n  <h3>Baza testów</h3>\r\n  <ul>\r\n    <li>Zmieniono domyślny limit wyświetlanych klientów z 50 na 100.</li>\r\n  </ul>\r\n  <h3>Plany godzinowe</h3>\r\n  <ul>\r\n    <li>Zmieniono ograniczenie dodawania nowego planu tak, aby można było dodawać plany do 7 dni w przyszłości.</li>\r\n    <li>Zmieniono ograniczenie edycji tak, aby można było edytować plany do 24 godzin po dacie planu.</li>\r\n    <li>Dodano funkcjonalność generowania dziennego planu na podstawie kolejki zleceń.</li>\r\n  </ul>\r\n  <h3>Watchdog</h3>\r\n  <ul>\r\n    <li>Zmieniono sprawdzanie żywotności serwerów tak, aby zapytania zostały automatycznie kończone, jeżeli trwają dłużej\r\n      niż 5 sekund.</li>\r\n  </ul>\r\n</div>\r\n<div class=\"hidden\">\r\n  <h1>v0.102.0</h1>\r\n  <h2>"),__append(time.format("2017-01-01","LL")),__append("</h2>\r\n  <h3>Formatka operatora</h3>\r\n  <ul>\r\n    <li>Poprawiono rozpoznawanie starych numerów seryjnych IPT.</li>\r\n    <li>Poprawiono błąd powodujący nieprzeliczanie wartości 'Czas taktu' po operacji 'Poprawa zlecenia'.</li>\r\n  </ul>\r\n  <h3>Usprawnienia</h3>\r\n  <ul>\r\n    <li>Zmieniono filtry tak, aby można było wybrać kilka opcji na raz.</li>\r\n  </ul>\r\n  <h3>Plany godzinowe</h3>\r\n  <ul>\r\n    <li>Dodano możliwość ustawienia dla każdej linii sztywnej planowanej ilości wyświetlanej na ekranie\r\n      'Wydajność godzinowa'.</li>\r\n  </ul>\r\n  <h3>Zlecenia reszty działów</h3>\r\n  <ul>\r\n    <li>Poprawiono błąd powodujący wyświetlanie wykonanej ilości jako <code>undefined</code>.</li>\r\n  </ul>\r\n  <h3>Dokumentacja</h3>\r\n  <ul>\r\n    <li>Zmieniono akcję 'Znajdź zlecenie' na 'Znajdź zlecenie/dokument'. Nowy dokument dopisywany jest do lokalnej listy\r\n      dokumentów aktualnego zlecenia.</li>\r\n    <li>Zmieniono pole 'Filtruj dokumenty' tak, aby po wpisaniu pełnego 15NC, na liście pojawił się dany dokument.\r\n      Po otwarciu nowego dokumentu, dopisywany jest on do lokalnej listy dokumentów aktualnego zlecenia.</li>\r\n    <li>Zmieniono pole 'Filtruj dokumenty' tak, aby po wciśnięciu klawisza <kbd>Enter</kbd> otwierany był pierwszy dokument\r\n      na liście.</li>\r\n    <li>Dodano klawiaturę numeryczną do pola 'Filtruj dokumenty' w trybie dotykowym.</li>\r\n    <li>Dodano do nowego wyświetlacza dokumentów zapamiętywanie ostatnio otwartej strony dokumentu.</li>\r\n  </ul>\r\n</div>\r\n");return __output.join("")}});