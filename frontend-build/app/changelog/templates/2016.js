define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\n  <h1>v0.89.0</h1>\n  <h2>'),__append(time.format("2016-06-19","LL")),__append("</h2>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono wykres 'Ilość czerwonych pasków per centrum produkcyjne' tak, aby kolory centrów produkcyjnych brane były\n      z ustawień Układu fabryki.</li>\n  </ul>\n  <h3>Raport Lean</h3>\n  <ul>\n    <li>Zmieniono eksportowanie wykresu w drugiej kolumnie tak, aby do trybu jednokolumnowego można było wybrać wartości\n      o różnych jednostkach (np. Czas przestojów i Wydajność).</li>\n  </ul>\n  <h3>Działy</h3>\n  <ul>\n    <li>Usunięto pola 'Początkowy przestój' i 'Automatyczny przestój'.</li>\n    <li>Dodano nowe pole: 'Automatyczne przestoje'.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono automatyczne rozpoczynanie przestojów na bardziej elastyczne. Od teraz można zdefiniować dowolnie długą\n      kombinację automatycznych przestojów rozpoczynanych po rozpoczęciu nowego zlecenia w danym dziale.</li>\n    <li>Zmieniono 'Pola odkładcze' tak, aby można było w tym samy czasie zażądać dostawy i odbioru palety. Od teraz lewy\n      wskaźnik statusu dotyczy odbioru palety, a prawy - dostawy. Szary wskaźnik oznacza, że nie ma aktywnego żądania,\n      pomarańczowy wskaźnik - jest żądanie, ale jeszcze nie zaakceptowane przez magazyniera, zielone - żądanie jest\n      w trakcie realizacji przez magazyniera.</li>\n    <li>Dodano komunikat potwierdzenia do akcji anulowania żądania dostawy/odbioru palety.</li>\n    <li>Dodano opcję sprawdzania komponentu Spigot po rozpoczęciu wybranego powodu przestoju i przed zakończeniem zlecenia.\n      Sprawdzenie komponentu odbywa się przez zeskanowanie 12NC z kodu kreskowego i porównanie tej wartości z 12NC komponentu\n      Spigot w danym zleceniu. Konfiguracja opcji dostępna jest dla użytkowników z uprawnieniem 'Dane produkcyjne: zarządzanie'\n      w menu 'Produkcja > Ustawienia'.\n    </li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Usunięto filtr żądań w realizacji.</li>\n    <li>Zmieniono obliczanie wyświetlanego czasu tak, aby nie wskazywał czasu w przyszłości, jeżeli zegar klienta różni\n      się od zegara serwera.</li>\n    <li>Zmieniono sortowanie żądań do realizacji tak, aby żądania dostawy miały najwyższy priorytet.</li>\n    <li>Zmieniono wyświetlanie rodzaju palety w żądaniach dostawy tak, aby wyświetlana była pełna nazwa, a nie skrócona.</li>\n    <li>Dodano możliwość obsługi wielu żądań z jednej linii produkcyjnej.</li>\n    <li>Dodano możliwość akceptacji i kończenia żądań przez zeskanowanie czytnikiem nr personalnego magazyniera. Po zeskanowaniu\n      nr personalnego wyświetli się komunikat informujący o wykonanej akcji. Komunikat zamknie się po 2.5-10s (w zależności\n      od akcji) lub po wciśnięciu klawisza Escape, Enter lub Spacja.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Zmieniono sposób wymuszenia aktualizacji aktywności sesji użytkownika tak, aby sesja była aktualizowana raz na 8 godzin\n      (zamiast 20% szansy na aktualizacje przy każdym żądaniu).</li>\n    <li>Zmieniono czas wygasania nieaktywnych sesji na 30 dni.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.88.1</h1>\n  <h2>"),__append(time.format("2016-06-05","LL")),__append("</h2>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający usunięcie wartości pól tekstowych (zmianę na puste).</li>\n    <li>Zmieniono pobieranie rodziny wyrobu z nazwy, tak aby Rodzina była pierwszymi sześcioma znakami nazwy, jeżeli\n      w nazwie nie występują żadne znaki spacji.</li>\n    <li>Zmieniono pole 'Ilość do poprawy' na 'Ilość do selekcji'</li>\n    <li>Zmieniono eksportowanie wykresu 'Ilość niezgodnych produktów' tak, aby w tytule wykresu odzwierciedlany był\n      aktualnie wybrany okres czasu oraz wybrane Wydziały.</li>\n    <li>Zmieniono panele załączników na stronie szczegółów wyniku tak, aby ich maksymalna wysokość nie przekraczała 512px\n      (jeżeli wysokość będzie większa, to pojawią się paski przewijania).</li>\n    <li>Zmieniono wydruk 'Zgłoszenie niezgodności' tak, aby był generowany po stronie serwera (PDF) zamiast po stronie\n      klienta (HTML).\n    <li>Dodano do wydruku 'Zgłoszenie niezgodności' etykiety pod obrazkami oraz wartości pól: Ilość skontrolowana,\n      Ilość do selekcji oraz Ilość niezgodnych.</li>\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Poprawiono obliczanie FTE dla Kontrolerów MRP oraz Przepływów w przypadku, gdy Przepływ na danej zmianie miał\n      podane FTE, ale w rzeczywistości żadna linia nie była aktywna.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.88.0</h1>\n  <h2>"),__append(time.format("2016-05-24","LL")),__append("</h2>\n  <h3>Działy</h3>\n  <ul>\n    <li>Dodano nowe pole: Początkowy przestój - przestój jaki ma być automatycznie uruchomiony po rozpoczęciu nowego\n      zlecenia na linii produkcyjnej w ciągu kilku minut od rozpoczęcia zmiany produkcyjnej. Po zakończeniu przestoju\n      'początkowego' (Operatywka) rozpoczynany jest przestój 'automatyczny' (Przezbrojenie).</li>\n  </ul>\n  <h3>Karty pracy</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie czasów rozpoczęcia i zakończenia każdego zlecenia podczas edycji kart\n      pracy typu Malarnia.</li>\n  </ul>\n  <h3>Raporty > Operatorzy</h3>\n  <ul>\n    <li>Zmieniono raport tak, aby pobierał dane także z działów typu Malarnia, a nie tylko z Tłoczni.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.87.0</h1>\n  <h2>"),__append(time.format("2016-05-22","LL")),__append("</h2>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono pole 'Czas stworzenia' na 'Czas importu'.</li>\n    <li>Dodano nowe pole 'Czas utworzenia', będące wartością 'Doc.Date' oraz 'Doc.Time' ze zrzutu transakcji 'ZOIN' w SAP.</li>\n    <li>Dodano akcję 'Skocz do zlecenia po nr' do strony z listą zleceń.</li>\n  </ul>\n  <h3>Karty pracy</h3>\n  <ul>\n    <li>Zmieniono stronę ze szczegółami karty tak, aby na 'Liście części' nie wyświetlała się kolumna 'Straty materiałowe',\n      jeżeli żadne ze zleceń nie ma żadnych strat.</li>\n    <li>Dodano do menu odnośnik do formularza dodawania nowej karty.</li>\n  </ul>\n  <h3>FTE</h3>\n  <ul>\n    <li>Zmieniono menu, tak aby wyświetlały się tylko dwie opcje: Produkcja oraz Inne wraz z odnośnikami do formularza\n      przydzielania zasobów.</li>\n  </ul>\n  <h3>Zdarzenia</h3>\n  <ul>\n    <li>Dodano brakujące tłumaczenia.</li>\n  </ul>\n  <h3>ZPW, Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wysyłanie e-maili przypomniających o zalegających zgłoszeniach tylko raz\n      po restarcie serwera.</li>\n    <li>Zmieniono domyślny filtr raportów tak, aby wyświetlał dane z ostatnich 4 miesięcy.</li>\n    <li>Zmieniono algorytm przeliczania czasów trwania otwartych zgłoszeń na bardziej wydajny.</li>\n    <li>Zmieniono raporty tak, aby na wykresach 'wg użytkownika' wyświetlane było maksymalnie 15 słupków, a reszta danych\n      w tabelce.</li>\n    <li>Zmieniono wykresy tak, aby wartości przy słupkach były widoczne, jeżeli na wykresie znajduje się w sumie mniej\n      niż 35 słupków.</li>\n    <li>Dodano do menu odnośnik do formularza dodawania nowego zgłoszenia.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący, że po kliknięciu przycisku 'Oznacz jako przeczytane', zmiany nie były oznaczane jako\n      przeczytane po stronie klienta do momentu odświeżenia strony.</li>\n    <li>Zmieniono wykres 'Ilość zgłoszeń w poszczególnych tygodniach' tak, aby wyświetlał legendę.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący, że pole 'Inspektor' w formularzu dodawania nowego wyniku nie było automatycznie\n      ustawiane na zalogowanego użytkownika-inspektora.</li>\n    <li>Zmieniono filtry 'Rodzina produktów' z pola tekstowego na listę wyboru.</li>\n    <li>Zmieniono wyświetlanie załączników na stronie szczegółów wyniku inspekcji: załączniki wyświetlane są teraz\n      w osobnych panelach.</li>\n    <li>Zmieniono wybieranie okresu do wykresu 'Ilość niezgodnych produktów' poprzez kliknięcie na obszarze wykresu\n      'Ilość czerwonych pasków per centrum produkcyjne' tak, aby zawsze wybierany był okres wyświetlany aktualnie\n      w dymku.</li>\n    <li>Dodano filtr 'Inspektor' do raportu 'Ilości'.</li>\n    <li>Dodano dodatkowe filtrowanie wykresu 'Ilość niezgodnych produktów' wg wydziałów wybranych w legendzie\n      wykresu 'Ilość czerwonych pasków per centrum produkcyjne'.</li>\n    <li>Dodano automatyczne generowanie mniejszej wersji dużych zdjęć-załączników.</li>\n    <li>Dodano możliwość usuwania wybranych załączników.</li>\n    <li>Dodano możliwość wygenerowania 'Zgłoszenia niezgodności' w wersji do druku.</li>\n    <li>Dodano licznik dziennych inspekcji: ilość przeprowadzonych inspekcji oraz ilość wymaganych inspekcji wyświetlane\n      są dla Inspektorów w menu po wejściu do modułu.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Poprawiono wsparcie dla skrótów klawiszowych w różnych przeglądarkach.</li>\n    <li>Dodano zapamiętywanie między ponownymi otwarciami przeglądarki stanu wyświetlania sekcji 'Zdarzenia'.</li>\n    <li>Dodano opis skrótów klawiszowych dostępny pod klawiszem F1.</li>\n  </ul>\n  <h3>Pulpit</h3>\n  <ul>\n    <li>Poprawiono wyświetlanie 'Top 10' dla poprzedniego miesiąca w przelądarce Internet Explorer.</li>\n  </ul>\n  <h3>Działy</h3>\n  <ul>\n    <li>Dodano nowy typ działu: Malarnia.</li>\n  </ul>\n  <h3>Powody przestojów</h3>\n  <ul>\n    <li>Dodano wsparcie dla typu działu Malarnia.</li>\n  </ul>\n  <h3>Raporty > Planowane obciążenie linii</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający dodanie nowych CAGów.</li>\n  </ul>\n  <h3>Raporty > Wykorzystanie zasobów</h3>\n  <ul>\n    <li>Dodano wsparcie dla typu działu Malarnia.</li>\n  </ul>\n  <h3>Raporty > Lean</h3>\n  <ul>\n    <li>Dodano wsparcie dla typu działu Malarnia.</li>\n  </ul>\n  <h3>Raporty > Wskaźniki</h3>\n  <ul>\n    <li>Usunięto filtr 'Typy działów'.</li>\n    <li>Dodano filtr 'Ignorowane jednostki organizacyjne'.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.86.1</h1>\n  <h2>"),__append(time.format("2016-05-16","LL")),__append('</h2>\n  <h3>ZPW, Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący, że podczas edycji zgłoszenia porównywane jest tylko jedno pole.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.86.0</h1>\n  <h2>'),__append(time.format("2016-05-15","LL")),__append('</h2>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Poprawiono proces rozpoznawania zaznaczonych odpowiedzi ze zeskanowanych ankiet.</li>\n  </ul>\n  <h3>Zlecenia działu mechanicznego</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia.</li>\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Poprawiono błąd mogący wywalać serwer podczas nieudanego eksportu wykresu.</li>\n    <li>Zmieniono wielkość czcionki w wersji do druku wykresu w drugiej kolumnie raportu Lean.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono niedziałające odnośniki w wiadomości e-mail przypominającej o niezakończonych zgłoszeniach.</li>\n  </ul>\n  <h3>Zlecenia działu mechanicznego</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia.</li>\n  </ul>\n  <h3>Historia operacji na liniach</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia.</li>\n  </ul>\n  <h3>Przestoje</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować zatrzymanie się procesu automatycznego potwierdzania przestojów.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Poprawiono ucięte nagłówki sekcji na głównym ekranie w starszej wersji przeglądarki Google Chrome.</li>\n  </ul>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Poprawiono błąd podczas zapisywania danych z Formatki operatora w wypadku, gdy baza danych zwróciła nieoczekiwany\n      komunikat błędu.</li>\n    <li>Zmieniono proces importowania operacji z Formatki operatora tak, aby za jednym razem zapisywane było maksymalnie\n      50 operacji.</li>\n    <li>Zmieniono proces przetwarzania operacji z Formatki operatora tak, aby za jednym pobierane było maksymalnie\n      25 operacji.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd mogący wywalać serwer podczas wykonywania żądania zakończonego błędem, którego połączenie zostało\n      zakończone przed przesłaniem wyniku do klienta.</li>\n    <li>Zmieniono konfigurację połączenia z bazą danych tak, aby po jego utracie, serwer próbował ciagle nawiązywać nowe\n      połączenie, a nie tylko 30 razy.</li>\n    <li>Zaktualizowano środowisko i moduły zależne.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.85.1</h1>\n  <h2>'),__append(time.format("2016-04-18","LL")),__append('</h2>\n  <h3>ZPW/Usprawnienia/Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono błąd wywalający serwer podczas pobierania załączników, w nazwie których znajdują się specjalne znaki.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.85.0</h1>\n  <h2>'),__append(time.format("2016-04-17","LL")),__append("</h2>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n  <h3>Raporty > Lean</h3>\n  <ul>\n    <li>Zmieniono wykres w drugiej kolumnie tak, aby na osi x wyświetlał kategorie zamiast daty, jeżeli wygenerowano dane\n      tylko dla jednej grupy (jeden dzień, tydzień lub miesiąc) oraz do wyświetlania wybrano wskaźniki o takiej samej jednostce\n      (godz., szt. lub %).</li>\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Dodano wsparcie dla aplikacji Walkner Xiconf v2.19.0.</li>\n    <li>Dodano możliwość ładowania paczek aktualizacji aplikacji Walkner Xiconf z poziomu ekranu 'Ustawień'.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Poprawiono błąd mogący powodować utratę operacji podczas zapisywania kilku operacji na raz, jeżeli zapisywanie\n      wcześniejszej operacji nie powiodło się, bo została zapisana wcześniej (duplikat).</li>\n    <li>Poprawiono błąd powodujący, że czas sprawdzania czy uruchomiono kilka instancji formatki wynosił 2ms zamiast 2s.</li>\n    <li>Dodano możliwość zgłaszania sugestii (usprawnień) po kliknięciu ikonki <i class=\"fa fa-lightbulb-o\"></i>.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Dodano możliwość zgłaszania sugestii (usprawnień) po kliknięciu ikonki <i class=\"fa fa-lightbulb-o\"></i>.</li>\n  </ul>\n  <h3>ZPW/Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenie dla właściwości 'Pozycja' w słowniku 'Kategorie'.</li>\n    <li>Dodano oznaczenia '*' dla wszystkich wymaganych pól w słownikach.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący aktualizację tylko jednej aktywnej sesji zmodyfikowanego użytkownika.</li>\n  </ul>\n  <h3>FTE/Plany godzinowe</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający stworzenie nowego wpisu w przeglądarce IE11.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono wyświetlanie akcji w listach tak, aby zajmowały mniej miejsca i zwiększono domyślną ilość rekordów na stronę z 15 na 20.</li>\n    <li>Zaktualizowano bibliotekę do generowania wykresów.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.84.3</h1>\n  <h2>"),__append(time.format("2016-04-03","LL")),__append('</h2>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Poprawiono błąd wywalający serwer przy dodawaniu/edycji użytkownika, jeżeli ustawiono istniejący już login.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.84.2</h1>\n  <h2>'),__append(time.format("2016-03-31","LL")),__append('</h2>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono błąd uniemozliwiający załadowanie dokumentów BOM oraz ETO.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.84.1</h1>\n  <h2>'),__append(time.format("2016-03-27","LL")),__append("</h2>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono kolumnę '15NC' w tabelce 'Dokumentów' tak, aby wartość po kliknięciu otwierała podczepiony dokument (jeżeli istnieje).</li>\n    <li>Dodano sekcję 'ETO' w szczegółach zlecenia, gdzie wyświetlana jest zaimportowana tabelka ETO.</li>\n    <li>Dodano funkcjonalność 'Skocz do sekcji' w prawym dolnym rogu strony szczegółów zlecenia.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono formularz tak, aby użytkownicy bez uprawnienia 'ZPW: zarządzanie zgłoszeniami' lub nie będący 'Zatwierdzającym' nie mogli wybrać\n      więcej niż jednej 'Osoby zgłaszającej'.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zaktualizowano i przeniesiono bazę danych na zewnętrzny serwer (MSD04).</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.84.0</h1>\n  <h2>"),__append(time.format("2016-03-20","LL")),__append("</h2>\n  <h3>Pulpit</h3>\n  <ul>\n    <li>Dodano wsparcie dla mniejszych rozdzielczości ekranów.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono zaokrąglanie części ułamkowej w ilości komponentów.</li>\n    <li>Zmieniono automatyczne odświeżanie klienta tak, aby odbywało się tylko na przeglądarce Chrome w wersji mniejszej\n      niż 49.</li>\n    <li>Dodano funkcjonalność automatycznego pojawiania się na liście dokumentów pozycji ETO, jeżeli wcześniej ETO\n      nie było dostępne a zostało zaimportowane.</li>\n  </ul>\n  <h3>Pola odkładcze</h3>\n  <ul>\n    <li>Dodano nowy moduł.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie pełnej paginacji list na mniejszych ekranach\n      (zamiast tylko aktualnej strony i przycisków poprzednia/następna).</li>\n    <li>Poprawiono brakujące tłumaczenia na podstronach 'wersji do druku'.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.83.2</h1>\n  <h2>"),__append(time.format("2016-03-06","LL")),__append('</h2>\n  <h3>Produkcja > Zmiany</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenie w formularzu edycji zlecenia produkcyjnego.</li>\n  </ul>\n  <h3>Produkcja > Żądania zmian</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia w szczegółach żądania zmiany.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Poprawiono błąd podczas logowania.</li>\n    <li>Zmieniono import użytkowników z bazy KD tak, aby dla każdego nowego użytkownika generowane było domyślne hasło\n      (takie jak login) oraz adres e-mail (imie.nazwisko@philips.com).</li>\n    <li>Ustawiono domyślne hasło wszystkim użytkownikom, którzy nie mieli hasła oraz adres e-mail wszystkim użytkownikom,\n      którzy nie mieli adresu e-mail a byli przypisani do firmy Philips.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.83.1</h1>\n  <h2>'),__append(time.format("2016-02-28","LL")),__append('</h2>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający edycję zgłoszeń przez osoby zatwierdzające.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający edycję zgłoszeń przez osoby zatwierdzające.</li>\n  </ul>\n  <h3>Plany godzinowe</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenie przycisku filtrowania listy planów godzinowych.</li>\n  </ul>\n  <h3>Raporty > HR</h3>\n  <ul>\n    <li>Zmieniono wskaźnik IND/DIR na wykresie INDIRECT/DIRECT z <code>INDIRECT_FTE / DIRECT_FTE</code>\n      na <code>INDIRECT_FTE / TOTAL_FTE</code>.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono czas wykrywania niedziałającego połączenia z serwerem z 60s na 5s oraz\n      wysyłanie pakietu sprawdzającego z 25s na 10s.</li>\n  </ul>\n</div>\n<div class="hidden">\n  <h1>v0.83.0</h1>\n  <h2>'),__append(time.format("2016-02-21","LL")),__append("</h2>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Zmieniono pozycję 'Lista komponentów' tak, aby pokazywała się tylko wtedy, gdy zlecenie ma jakieś komponenty.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprzeliczanie ilości dni realizacji zgłoszenia po zmianie 'Czasu zdarzenia'.</li>\n    <li>Zmieniono formularz edycji zgłoszenia tak, aby użytkownik mógł wybrać status 'Anulowane', jeżeli jest osobą\n      zatwierdzającą w tym zgłoszniu (wcześniej anulować zgłoszenie mógł tylko użytkownik, który dodał zgłoszenie\n      i zgłoszenie to miało status 'Nowe').</li>\n    <li>Dodano wymuszanie wybierania dat nie różniących się o więcej niż 60 dni od aktualnej daty. Użytkownicy\n      z uprawnieniem 'ZPW: zarządzanie' nadal mogą wybrać dowolną datę.</li>\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieprzeliczanie ilości dni realizacji zgłoszenia po zmianie 'Daty złożenia wniosku'.</li>\n    <li>Zmieniono formularz edycji zgłoszenia tak, aby użytkownik mógł wybrać status 'Anulowane', jeżeli jest osobą\n      zatwierdzającą w tym zgłoszniu (wcześniej anulować zgłoszenie mógł tylko użytkownik, który dodał zgłoszenie\n      i zgłoszenie to musiało mieć status 'Nowe').</li>\n    <li>Dodano wykres 'Ilość sugestii zgłoszonych w kategoriach' do raportu 'Zestawienie informacji'.</li>\n    <li>Dodano przycisk 'Wersja do druku' do raportu 'Zestawienie informacji', po wciśnięciu którego raport zostanie\n      przystosowany do wydruku na jednej stronie A4 (m.in. brak wykresu 'Ilość zgłoszeń' w poszczególnych tygodniach',\n      wyświetlanie maksymalnie 10 pracowników i kategorii).</li>\n    <li>Dodano wymuszanie wybierania dat nie różniących się o więcej niż 60 dni od aktualnej daty. Użytkownicy\n      z uprawnieniem 'Usprawnienia: zarządzanie' nadal mogą wybrać dowolną datę.</li>\n  </ul>\n  <h3>Raport > Przestoje w obszarach</h3>\n  <ul>\n    <li>Zmieniono pierwsze ładowanie danych raportu tak, aby odbywało się po załadowaniu strony, a nie w trakcie.\n  </ul>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Poprawiono niedziałający indeks bazy danych dla wartości 'Kontroler MRP' w 'Zmianach produkcyjnych'.</li>\n    <li>Przeniesiono dezaktywowane jednostki organizacyjne w 'KF9' do 'KF9~a', a aktywne jednostki w 'KF9~c' do 'KF9'.</li>\n    <li>Dodano tymczasowe zamienianie ID jednostek produkcyjnych w 'KF9~c' tak, aby dane zaliczane były do 'KF9'.\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.82.0</h1>\n  <h2>"),__append(time.format("2016-02-14","LL")),__append("</h2>\n  <h3>Przestoje</h3>\n  <ul>\n    <li>Zmieniono listę Powodów przestojów w formularzu Potwierdzania przestoju tak, aby wyświetlały się tylko te\n      Powody, które pasują do typu Działu, w którym rozpoczęto dany Przestój.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Dodano do Listy komponentów (BOM) dzielenie ilości komponentów przez ilość w zleceniu (działa tak samo jak\n      lista komponentów zlecenia w wersji do druku).</li>\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Zmieniono dzielenie ilości komponentów przez ilość w zleceniu w wersji do druku tak, aby było wykonywane zawsze,\n      a nie tylko wtedy, gdy ilość komponentów jest większa od ilości w zleceniu.</li>\n    <li>Zmieniono wyświetlanie ilości i jednostki komponentów w wersji do druku tak, aby nie były wyświetlane dla\n      komponentów, które nie mają 12NC.</li>\n  </ul>\n  <h3>Użytkownicy</h3>\n  <ul>\n    <li>Dodano brakujące tłumaczenie dla uprawnienia 'Raporty: Planowane obciążenie linii'.</li>\n  </ul>\n  <h3>Raporty > Planowane obciążenie linii</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający załadowanie nowego planu.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający przekierowanie na stronę 'Pulpit' po wylogowaniu się użytkownika.</li>\n    <li>Dodano funkcję automatycznego wylogowywania użytkowników, którzy zostali usunięci.</li>\n    <li>Dodano funkcję powiadamiania zalogowanych użytkowników o zmianie ich uprawnień. Od teraz po zmianie uprawnień\n      użytkownikowi, nie musi się on przelogowywać, aby nowe uprawnienia weszły w życie.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.81.0</h1>\n  <h2>"),__append(time.format("2016-02-07","LL")),__append("</h2>\n  <h3>Monitoring > Lista linii produkcyjnych</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia w dymkach osi czasu zmian produkcyjnych.</li>\n  </ul>\n  <h3>Badanie opinia</h3>\n  <ul>\n    <li>Poprawiono brakujące tłumaczenia na stronie szczegółów Odpowiedzi.</li>\n    <li>Zmieniono kolejność odpowiedzi w formularzu Odpowiedzi z Tak, Nie, Nie mam zdania na Nie, Nie mam zdania, Tak,\n      aby pasowała do kolejności na formularzu fizycznym.</li>\n  </ul>\n  <h3>Lista zmian</h3>\n  <ul>\n    <li>Zmieniono listę tak, aby wyświetlała na początku tylko 5 ostatnich wersji. Po kliknięciu 'Pokaż więcej'\n      wyświetlone zostanie 10 kolejnych wersji oraz przycisk 'Pokaż wszystkie'.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Dodano do aplikacji klienta wyświetlanie stałej, pierwszej pozycji 'Listy komponentów'. Po wybraniu dokumentu\n      'Lista dokumentów' otworzy się BOM aktualnie wybranego Zlecenia.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.80.3</h1>\n  <h2>"),__append(time.format("2016-01-31","LL")),__append("</h2>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Zmieniono importowanie zleceń tak, aby w danym zleceniu znajdowała się tylko jedna pozycja rodzaju\n      'programowanie driverów' (pozycja utworzona z dokumentów 'Zlecenia reszty działów' ma większy priorytet niż\n      pozycja z komponentów zlecenia).\n    </li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Zmieniono wysyłanie e-maili tak, aby odbywało się przez serwer SMTP a nie serwer Exchange.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.80.2</h1>\n  <h2>"),__append(time.format("2016-01-24","LL")),__append("</h2>\n  <h3>Produkcja > Zlecenia</h3>\n  <ul>\n    <li>Poprawiono brak tłumaczenia sekcji 'Szczegóły zlecenia w momencie rozpoczęcia'.\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono rozpoczynanie zleceń i przestojów tak, aby czas rozpoczęcia zawsze był po czasie rozpoczęcia zmiany\n      (nawet w przypadku, gdy zaraz po rozpoczęciu zmiany zegar systemowy zostanie przesunięty do tyłu).\n  </ul>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie braku wyników na liście usprawnień, jeżeli podano wartości w filtrze\n      'Od-Do', nawet w przypadku, gdy zgłoszenia pasujące do filtrów istnieją.\n  </ul>\n  <h3>Zlecenia reszty działów</h3>\n  <ul>\n    <li>Poprawiono listę komponentów tak, aby wyświetlała różne komponenty z takim samym numerem zamiast wyświetlać\n      tylko ostatni.\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Zmieniono importowanie programów z dokumentów 'Zleceń reszty działów' tak, aby ilość driverów zawsze była brana\n      ze 'Zlecenia reszty działów' zamiast ze 'Zlecenia Xiconf'.\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.80.1</h1>\n  <h2>"),__append(time.format("2016-01-20","LL")),__append("</h2>\n  <h3>Raporty > Lean</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wywalanie się serwera, gdy w pobieranych Zleceniach lub Przestojach znajdzie się\n      rekord, którego Zmiana produkcyjna jest po czasie podanym w filtrze 'Do' raportu (może się tak zdarzyć,\n      gdy na komputerze z Formatka operatora zegar systemowy zostanie przesunięty zaraz po rozpoczęciu zmiany\n      - w historii wygląda to tak, jakby Zlecenie rozpoczęło się przed Zmianą).\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.80.0</h1>\n  <h2>"),__append(time.format("2016-01-17","LL")),__append("</h2>\n  <h3>Pulpit</h3>\n  <ul>\n    <li>Poprawiono brak tłumaczenia wartości kolumn 'Status' w tabelkach otwartych ZPW i Usprawnień.\n    <li>Poprawiono nagłówek listy Top 10 dla poprzedniego miesiąca wyświetlający tekst 'Najaktywniejsi w miesiącu'\n      zamiast 'Najaktywniejsci w grudniu', jeżeli aktualny miesiąc to styczeń.\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wywalanie się serwera, gdy dwóch użytkownik zażąda w tym samym momencie podglądu\n      badania, dla którego plik PDF nie został jeszcze wygenerowany.\n  </ul>\n  <h3>SAP GUI</h3>\n  <ul>\n    <li>Zmieniono skrypt transakcji tak, aby SAP zrzucał wynik do lokalnego katalogu. Po zakończeniu transakcji, wynik\n      kopiowany jest do ścieżki docelowej.\n  </ul>\n  <h3>ZPW</h3>\n  <h3>Usprawnienia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący nieodświeżanie się historii zmian zgłoszenia po wysłaniu komentarza.\n    <li>Poprawiono brak tłumaczeń w raporcie 'Zestawienie informacji'.\n    <li>Dodano filtr 'Dział zgłaszający' do raportu 'Ilość zgłoszeń'.\n    <li>Dodano paski przewijania do dymków w wykresach, gdzie ilość serii danych jest większa niż 10.\n  </ul>\n  <h3>Baza testów</h3>\n  <ul>\n    <li>Dodano importowanie do zleceń pozycji programów 'XT' ze zrzutu dokumentów 'Zleceń reszty działów'. Brane są pod\n      uwagę dokumenty zaczynające się od 'SETTINGS XT'.\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Zmieniono pierwsze ładowanie danych raportu tak, aby odbywało się po załadowaniu strony, a nie w trakcie.\n  </ul>\n  <h3>Raporty > Magazyn</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący znikanie wykresów po ponownym wygenerowaniu strony (np. po utracie i odzyskaniu\n      połączenia z serwerem).\n  </ul>\n  <h3>Raporty > Lean</h3>\n  <ul>\n    <li>Usunięto komunikat o wersji testowej raportu.\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Poprawiono odstępy między niektórymi polami w filtrze listy zleceń.\n    <li>Poprawiono brak tłumaczeń kolumn listy zleceń.\n  </ul>\n  <h3>Raporty > Operatorzy</h3>\n  <ul>\n    <li>Poprawiono brak tłumaczeń kolumn listy zleceń.\n  </ul>\n  <h3>Raporty > OEE</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący ignorowanie początkowych wartości filtru z adresu URL.\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Dodano listę zmian w systemie. Lista dostępna jest po kliknięciu na numer wersji w stopce.\n    <li>Zoptymalizowano wysyłanie komunikatów od serwera do połączonych klientów.\n    <li>Serwer dostępny jest teraz także na porcie 80, tzn.: <a href=\"http://161.87.64.46/\">http://161.87.64.46/</a>\n      lub <a href=\"http://192.168.21.60/\">http://192.168.21.60/</a> (nie trzeba podawać w adresie portu 6080).\n  </ul>\n</div>\n");return __output.join("")}});