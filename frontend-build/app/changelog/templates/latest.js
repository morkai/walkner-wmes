define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Pulpit</h3>\n<ul>\n  <li>Dodano okno dialogowe informujące użytkownika o używaniu nieaktualnej wersji przeglądarki Chrome.</li>\n  <li>Dodano okno dialogowe informujące użytkownika o używaniu nieaktualnego adresu do systemu WMES.</li>\n</ul>\n<h3>Raporty > CLIP</h3>\n<ul>\n  <li>Dodano ikonę <i class=\"fa fa-wrench\"></i> przy nazwie wyrobu na liście zleceń informującą, że dane zlecenie\n    jest ETO.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono raport Wskaźniki tak, aby Obserwacje zliczane były na podstawie 'Miejsca pracy obserwatora',\n    a nie 'Miejsca obserwacji'.</li>\n  <li>Dodano uprawnienia do przeglądania i dodawania wpisów dla lokalnych, niezalogowanych użytkowników.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Dodano uprawnienia do przeglądania i dodawania wpisów dla lokalnych, niezalogowanych użytkowników.</li>\n</ul>\n<h3>Baza testów</h3>\n<ul>\n  <li>Poprawiono błąd podczas importowania wyników, jeżeli w importowanym archiwum plik zleceń był pusty.</li>\n  <li>Zmieniono drukowanie etykiet po teście opraw HID tak, aby etykieta żarówki drukowała się tylko wtedy, gdy\n    dane zlecenie ma przynajmiej jedną żarówkę.</li>\n</ul>\n<h3>Strategie sprawdzania komponentów</h3>\n<ul>\n  <li>Poprawiono błąd w formularzu powodujący nieprawidłowe zapisywanie filtra linii produkcyjnych.</li>\n  <li>Dodano nowe pole do listy komponentów: Brak? - określa, czy dany komponent ma być na liście komponentów zlecenia\n    czy nie.</li>\n</ul>\n<h3>SAP GUI</h3>\n<ul>\n  <li>Zmieniono zrzucanie dokumentów zleceń tak, aby zrzucane były dokumenty tylko dla zleceń znajdujących się\n    w planie dziennym.</li>\n</ul>\n<h3>Produkcja > Zlecenia</h3>\n<ul>\n  <li>Dodano kolumnę 'Ilość do zrobienia w zleceniu' do eksportowanych danych.</li>\n</ul>\n<h3>FTE</h3>\n<ul>\n  <li>Zmieniono limity eksportowania wpisów tak, aby można było za jednym razem eksportować dane z mniej więcej\n    jednego roku.</li>\n</ul>\n<h3>Watchdog</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wywalenie się serwera po osiągnięciu przez proces serwera ponad 900MB\n    użytej pamięci.</li>\n</ul>\n<h3>Kanban</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wyeksportowanie całej tabeli.</li>\n  <li>Poprawiono błąd powodujący w niektórych przypadkach nieukrywanie dymka z pomocą dot. filtra.</li>\n  <li>Zmieniono algorytm eksportowania tabeli tak, aby używał mniej pamięci.</li>\n  <li>Zmieniono pole 'Nazwa' obszaru zaopatrzenia na 'Supply area (SAP)'.</li>\n  <li>Zmieniono kolumny 'Lokalizacja magazynowa' i 'Kolor' tak, aby nie miały wartości, jeżeli 'Strategia' danego\n    rekordu równa się `153`.</li>\n  <li>Dodano nową kolumnę: Strategia.</li>\n  <li>Dodano importowanie danych ze strategią `153`.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Poprawiono błąd powodujący dodawanie niepotrzebnego komentarza do wszystkich zleceń podczas każdego\n    przeliczania kolejki malarnii.</li>\n  <li>Zmieniono wywoływanie menu kontekstowego przez przytrzymanie lewego przycisku myszy tak, aby funkcja dostępna\n    była tylko w trybie wsadowym.</li>\n  <li>Dodano do menu kontekstowego akcje 'Kopiuj nr zlecenia' oraz 'Kopiuj nr podzleceń' na poziomie zlecenia.</li>\n</ul>\n<h3>Żądania zmian</h3>\n<ul>\n  <li>Dodano automatyczne wyświetlanie dymka z informacjami dot. zmienianego zlecenia/przestoju po otworzeniu szczegółów\n    żądania zmiany.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Dodano nowe pole do Rodzajów inspekcji: Pozycja - umożliwia ustawienie kolejności sortowania pozycji.</li>\n</ul>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Dodano funkcjonalność eksportowania kart pracy.</li>\n</ul>\n<h3>Obserwacje zachowań</h3>\n<ul>\n  <li>Dodano możliwość przeglądania i dodawania nowych obserwacji przez lokalnych użytkowników.</li>\n  <li>Dodano możliwość dodawania nowych obserwacji z poziomu aplikacji Formatki operatora oraz Dokumentacji.</li>\n</ul>\n<h3>Użytkownicy</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający zalogowanie się za pomocą konta @signify.com z adresu innego\n    niż http://161.87.64.46/.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Poprawiono błąd powodujący duże zużycie pamięci przez proces serwera, jeżeli użytkownik próbował załadować\n    na serwer załącznik przekraczający ustawione limity wielkości plików.</li>\n  <li>Zmieniono automatyczne odświeżanie przeglądarki po otrzymaniu komunikatu o nowej wersji aplikacji ze stałych\n    60s nieaktywności na losową ilość sekund z przedziału 60-120, w celu uniknięcia inicjacji aktualizacji przez\n    wszystkich klientów na raz.</li>\n  <li>Dodano do filtrów Od-Do możliwość szybkiego wyboru daty.</li>\n</ul>\n");return __output.join("")}});