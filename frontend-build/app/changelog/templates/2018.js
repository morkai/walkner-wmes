define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="hidden">\n  <h1>v0.122.0</h1>\n  <h2>'),__append(time.format("2018-04-29","LL")),__append("</h2>\n  <h3>Plany dzienne</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący wyświetlanie komunikatu o pustym planie, jeżeli dane planu zostały pobrane przed\n      ustawieniami.</li>\n    <li>Poprawiono nieprawidłowy kolor tła zleceń usuniętych (TECO) w trybie wysokiego kontrastu.</li>\n    <li>Zmieniono formularz 'Ustawianie dostępnych linii' na stronie planu tak, aby nie można było usunąć wszystkich linii\n      z danego MRP (co skutkowałoby usunięciem MRP z planu). Od teraz MRP można usunąć tylko z poziomu ustawień planu.</li>\n    <li>Zmieniono pobieranie niekompletnych zleceń z poprzedniego dnia tak, aby ignorowane były zlecenia, dla których\n      różnica między datą zlecenia a datą planu jest większa od 7 dni.</li>\n    <li>Dodano nowe ustawienie: Godzina rozpoczęcia opóźnionych zleceń (godzina, od której rozplanowywane są ręcznie\n      dodane, pilne zlecenia (opóźnione)).</li>\n    <li>Dodano możliwość dodawania do kolejki zleceń MRP wielu opóźnionych zleceń na raz.</li>\n    <li>Dodano możliwość grupowania linii wg komponentów zlecenia.</li>\n  </ul>\n  <h3>Plany magazynu</h3>\n  <ul>\n    <li>Poprawiono błąd podczas dzielenia zleceń na grupy powodujący, że niektóre części zlecenia mogły należeć do tej\n      samej grupy.</li>\n    <li>Poprawiono błąd podczas dzielenia zleceń na grupy powodujący, że niektóre części zlecenia mogłby zaczynać się\n      w jednej grupie i kończyć w drugiej (zamiast zaczynać i kończyć się w jednej grupie, a w drugiej następna\n      część).</li>\n    <li>Zmieniono przypisywanie etapu dla zlecenia do kombinacji wartości\n      <code>nr zlecenia+nr grupy+linia</code> (było <code>nr zlecenia+czas startu+linia</code>),\n      aby zminimalizować szansę utraty ustawionego etapu po zmianie planu.</li>\n    <li>Dodano nowe ustawienie: Minimalna ilość sztuk w grupie (jeżeli ilość sztuk zlecenia\n      w pierwszej/ostatniej grupie danej linii będzie mniejsza lub równa podanej wartości, to grupa ta zostanie\n      scalona z następną/poprzednią grupą).</li>\n  </ul>\n  <h3>Inspekcja jakości</h3>\n  <ul>\n    <li>Zmieniono wysyłanie powiadomień o wynikach inspekcji tak, aby powiadamiani byli wszyscy kierownicy mający\n      przypisany dany wydział w bazie użytkowników oraz w matrycy odpowiedzialności.</li>\n    <li>Zmieniono formularz edycji tak, aby Inspektorzy mogli zmieniać wartość 'Przyczyna źródłowa'.</li>\n    <li>Zmieniono formularz edycji tak, aby wszyscy Mistrzowie i Liderzy mogli zmieniać 'Akcje korygujące'.</li>\n  </ul>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Zmieniono stronę szczegółów karty obserwacji tak, aby panele 'Ryzykowne warunki w miejscu pracy/Trudności zmian'\n      były widoczne nawet jak są puste, ale do karty przypisane zostało ZPW/Usprawnienie.</li>\n  </ul>\n  <h3>Drukarki</h3>\n  <ul>\n    <li>Dodano nowy słownik: Drukarki - po dodaniu do WMES drukarek zdefiniowanych w systemie operacyjnym, można wysyłać\n      wydruki generowane w WMES bezpośrednio na wybraną drukarkę (zamiast otwierać PDF w przeglądarce).</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.121.0</h1>\n  <h2>"),__append(time.format("2018-03-31","LL")),__append("</h2>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Usunięto możliwość wyłączania najnowszych danych w planie produkcji.</li>\n    <li>Usunięto funkcjonalność Drop zone.</li>\n    <li>Zmieniono generator planu tak, aby wybieranie linii do podziału dużych zleceń brało pod uwagę pozostały\n      dostępny czas na linii.</li>\n    <li>Zmieniono 'Zrobioną ilość' zleceń w planie tak, aby ich wartość brana była z ilośći wykonanej dla operacji\n      wybranej do planowania, a nie z całkowitej zrobionej ilości zlecenia SAP.\n    <li>Zmieniono plan linii w wersji do wydruku tak, aby plan godzinowy był zawsze widoczny, a nie tylko wtedy, gdy\n      jest wolne miejsce na ostatniej stronie.</li>\n    <li>Zmieniono plan linii w wersji do wydruku tak, aby do każdego zlecenia wyświetlane były wszystkie ikony\n      statusów.</li>\n    <li>Zmieniono plan magazynu tak, aby wyświetlał jedną listę zleceń dla wybranych MRP.</li>\n    <li>Zmieniono filtr 'Wybrane MRP' w planie magazynu na filtr 'Wybrane MRP/Ignorowane MRP/Moje/Magazyn'. MRP magazynu\n      można wybrać w ustawiniach.</li>\n    <li>Zmieniono listy zleceń do rozplanowania oraz zleceń opóźnionych tak, aby miały maksymalną wysokość. Po osiągnięciu\n      maksymalnej wysokości lista robi się przewijalna.</li>\n    <li>Dodano wyświetlanie ostatniego komentarza zlecenia w dymkach zleceń do rozplanowania i zleceń rozplanowanych.</li>\n    <li>Dodano możliwość dzielenia zleceń dłuższych od określonej ilości godzin na dodatkowe części.</li>\n    <li>Dodano możliwość włączenia trybu wysokiego kontrastu w planie magazynu.</li>\n    <li>Dodano możliwość wyboru etapu na jakim znajduje się każde zlecenie w planie magazynu.</li>\n    <li>Dodano oznaczanie zleceń ze statusem 'TECO'.</li>\n    <li>Dodano możliwość ustawiania kilku zakresów aktywności dla każdej linii.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono sposób odczytywania ilości stron w dokumentach PDF konwertowanych na obrazy.</li>\n    <li>Dodano listę zaplanowanych zleceń do formularza wybierania zlecenia/dokumentu.</li>\n  </ul>\n  <h3>Dane produkcyjne</h3>\n  <ul>\n    <li>Zmieniono uprawnienia wymagane do wyświetlania danych produkcyjnych.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Dodano nową wersję raportu.</li>\n  </ul>\n  <h3>Matryca odpowiedzialności</h3>\n  <ul>\n    <li>Poprawiono błędne wyświetlanie tabel w matrycy podczas korzystania z najnowszej wersji przeglądarki Chrome.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Dodano wyszukiwanie po ID wyników inspekcji, ZPW, usprawnień, obserwacji, minutek i 8D.</li>\n    <li>Dodano do wyszukiwarki odnośniki do planu produkcji, magazynu i malarnii po wpisaniu daty.</li>\n    <li>Zaktualizowano pakiety zależne</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.120.0</h1>\n  <h2>"),__append(time.format("2018-02-15","LL")),__append("</h2>\n  <h3>Malarnia</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący brak odświeżania danych na stronach listy i szczegółów farb.</li>\n    <li>Poprawiono błąd powodujący niedodawanie do planu malarnii zleceń malarnii niemających zlecenia nadrzędnego\n      jeżeli ich MRP zostało zdefiniowane w module planowania.</li>\n    <li>Zmieniono odnośnik do malarnii w 'okruszkach' na podstronach modułu tak, aby przekierowywał do planu malarnii,\n      z którego użytkownik wszedł na podstronę.</li>\n    <li>Dodano filtr do listy farb.</li>\n    <li>Dodano komunikat o istnieniu farby o danym 12NC podczas dodawania nowej farby.</li>\n    <li>Dodano nową aplikację: Zliczanie obciążenia malarnii.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Zmieniono obliczanie roboczogodzin tak, aby pod uwagę brana była 'Szybkość planowania'.</li>\n    <li>Zmieniono zamrażanie planu tak, aby zamrażane były wszystkie zlecenia, a nie tylko zlecenia z pierwszej zmiany.</li>\n    <li>Zmieniono ustawienie 'Szybkość planowania' tak, aby można było ustawić inną wartość dla każdego MRP.</li>\n    <li>Zmieniono sortowanie małych zleceń tak, aby rodzina produktu (pierwsze 6 znaków nazwy) miały wagę 6 zamiast 5 oraz\n      wymiary produktu 'WnLm' (jeżeli występują w nazwie) miały wagę 4 zamiast 1.</li>\n    <li>Zmieniono sortowanie łatwych zleceń tak, aby były sortowane jak małe zlecenia (wcześniej sortowane były po RBH).</li>\n    <li>Zmieniono kopiowanie listy zleceń do schowka tak, aby kolumna 'Drop zone' także była kopiowana.</li>\n    <li>Dodano nowe ustawienie: godzina zamrożenia planu.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Poprawiono uprawnienia edycji wyników tak, aby dostęp dodatkowo miieli wybrany lider, właściciel niezgodności oraz\n      osoby przypisane do akcji korekcyjnych.</li>\n    <li>Dodano nowe pole: Numer seryjny.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono wykresy wskaźników IPR, IPS oraz IPC tak, aby można było zmienić grupowanie danych na całkowite\n      lub według działów (tylko jak wybrano podział czasu).</li>\n    <li>Zmieniono wykres 'Średnie dzienne FTE' tak, aby można było zmienić grupowanie danych na całkowite lub\n      według firm.</li>\n    <li>Dodano filtr 'Podział czasu' do raportu 'Wskaźniki'.</li>\n  </ul>\n  <h3>Obserwacje</h3>\n  <ul>\n    <li>Dodano do raportu tabelę i wykres 'Ilość przeprowadzonych obserwacji'.</li>\n  </ul>\n  <h3>Monitoring</h3>\n  <ul>\n    <li>Zmieniono listę linii produkcyjnych tak, aby wydajność oraz czas cyklu widoczne były w trybie historii.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Dodano automatyczne ładowanie kolejki zleceń dla aktualnej zmiany na podstawie planu na dany dzień.</li>\n  </ul>\n  <h3>FTE</h3>\n  <ul>\n    <li>Zmieniono wyświetlanie wartości FTE tak, aby zamiast wartości ujemnych były wyświetlane zera.</li>\n    <li>Zmieniono FTE (inne) tak, aby dostępne były wydziały typu 'Inny' oraz nie będące wydziałem o ID 'LD'.</li>\n    <li>Dodano FTE (magazyn), w którym dostępne są działy z wydziału 'LD'. We wpisach FTE (magazyn) dostępna jest także\n      funkcjonalność 'Zamówienie/Dostarczenie/Braki'.</li>\n  </ul>\n  <h3>Raporty</h3>\n  <ul>\n    <li>Poprawiono błąd powodujący brak powrotu do początkowej pozycji paska przewijania po wyjściu z trybu\n      pełnoekranowego wykresu.</li>\n    <li>Zmieniono wykres 'Obecność' w raporcie HR tak, aby pokazywał 'Ilośc obecnych pracowników' oraz\n      'Ilość brakujących pracowników' w trybie domyślnym oraz pełnoekranowym.</li>\n    <li>Zmieniono wykres 'Obecność' w raporcie HR tak, aby w trybie pełnoekranowym dane były dodatkowo grupowane\n      po dacie.</li>\n  </ul>\n  <h3>Dokumentacja</h3>\n  <ul>\n    <li>Poprawiono błąd podczas konwertowania dokumentów mogący spowodować niepowodzenie, jeżeli w pliku PDF zastosowano\n      nieznane czcionki.</li>\n    <li>Zmieniono komunikat wyświetlany podczas otwarcia pliku, który nie został jeszcze przekonwertowany\n      z 'Nie znaleziono' na 'W trakcje konwertowania'. Strona jest automatycznie odświeżana co 30 sekund, aż do momentu\n      otwarcia pliku.</li>\n  </ul>\n</div>\n<div class=\"hidden\">\n  <h1>v0.119.0</h1>\n  <h2>"),__append(time.format("2018-01-10","LL")),__append("</h2>\n  <h3>Nieprawidłowe zlecenia IPT</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera importera zleceń.</li>\n  </ul>\n  <h3>Planowanie</h3>\n  <ul>\n    <li>Usunięto specjalne przewijania listy rozplanowanych zleceń w zależności od pozycji kursora na liście.</li>\n    <li>Poprawiono błąd uniemożliwiający załadowanie planu przez użytkowników z uprawnieniem 'Plany dzienne: przeglądanie',\n      ale bez uprawnienia 'Dane produkcyjne: przeglądanie'.</li>\n    <li>Poprawiono błąd mogący spowodować wyświetlanie nieaktualnego stanu planu dziennego, jeżeli poszczególne dane\n      zostały załadowane w nieprawidłowej kolejności.</li>\n    <li>Poprawiono błąd zatrzymujący wyświetlanie MRP planu dziennego, jeżeli do planu dodano maszynę (linia produkcyjna\n      z działu typu 'Tłocznia').</li>\n    <li>Poprawiono błąd podczas generowania planu polegający na ignorowanie wartości 'Linia aktywna do' podczas fazy\n      rozszerzania niekompletnego zlecenia.</li>\n    <li>Poprawiono błąd mogący spowodować brak odświeżenia aktualnego stanu planu po otrzymaniu od serwera informacji\n      o zmianach w planie.</li>\n    <li>Poprawiono błąd powodujący nietworzenie planów godzinowych z nowego planu dziennego, gdy dane plany godzinowe\n      wcześniej nie istniały.</li>\n    <li>Poprawiono błąd powodujący nieaktualizowanie istniejących planów godzinowych po zmianach w planie dziennym.</li>\n    <li>Zmieniono sortowanie wejściowej kolejki zleceń tak, aby zlecenia 'Pilne' i 'Przypięte' były brane pod uwagę\n      wcześniej od zleceń tylko 'Pilnych'.</li>\n    <li>Zmieniono edycję 'Ilości osób' na linii z poziomu planu tak, aby można było ustawić wartość 0.</li>\n    <li>Dodano funkcjonalność wybóru daty planu z poziomu 'okruszków' (jak w malarnii).</li>\n    <li>Dodano możliwość włączenia opcji wysokiego kontrastu dla widoku planu dziennego.</li>\n    <li>Dodano nowe ustawienie: Szybkość planowania.</li>\n    <li>Dodano funkcjonalność zamrażania zleceń. Zlecenia z pierwszej zmiany są automatycznie zamrażane po 23:00.</li>\n    <li>Dodano obliczanie wartości 'Sumy RBH do zrobienia' oraz 'Sumy ilości sztuk do zrobienia'.</li>\n    <li>Dodano specjalny widok zleceń dla Magazynu.</li>\n    <li>Dodano akcje 'Malarnia' oraz 'Magazyn' do strony planu dziennego.</li>\n    <li>Dodano możliwość ustawiania 'Grupy drop zone', 'Czasu wywołania', 'Statusu magazynu' oraz 'Komentarzu magazynu'\n      dla każdego zlecenia.</li>\n    <li>Dodano funkcjonalność skakania do MRP na stronie planu dziennego oraz magazynu za pomocą <kbd>Spacji</kbd>\n      lub wpisania na klawiaturze nazwy MRP.</li>\n    <li>Dodano słownik farb do Malarnii.</li>\n  </ul>\n  <h3>ZPW</h3>\n  <ul>\n    <li>Zmieniono wartość 'Całkowite średnie dzienne FTE' w raporcie 'Wskaźniki' tak, aby była sumą wartości poszczególnych\n      działów, a nie ich średnią.</li>\n    <li>Zmieniono liczenie użytkowników w raporcie 'Wskaźniki', aby działało tak jak w raporcie 'Zaangażowanie'.</li>\n    <li>Zmieniono liczenie użytkowników we wszystkich raportach tak, aby grupowani byli po imieniu i nazwisku\n      zamiast po ID.</li>\n  </ul>\n  <h3>Inspekcja Jakości</h3>\n  <ul>\n    <li>Zmieniono filtr listy wyników tak, aby domyślny wyświetlane były wyniki z ostatnich 14 dni.</li>\n  </ul>\n  <h3>Raporty > CLIP</h3>\n  <ul>\n    <li>Poprawiono błąd uniemożliwiający wybranie powodu opóźnienia z poziomu listy zleceń.</li>\n    <li>Zmieniono filtr 'Godzina' listy zleceń tak, aby akceptował wartość w formacie 'gg' lub 'gg:mm'.</li>\n    <li>Zmieniono nazwę kolumny 'Data ukończenia (podst.)' na 'Data ukończenia (plan.)'.</li>\n    <li>Zmieniono listę zleceń tak, aby ignorowane były zlecenia ze statusem 'TECO' lub 'DLT'.</li>\n  </ul>\n  <h3>Raporty > Wskaźniki</h3>\n  <ul>\n    <li>Dodano 'Produktywność' do eksportowanych danych.</li>\n    <li>Zwiększono czas generowania raportu o 17%.</li>\n  </ul>\n  <h3>Raporty > HR</h3>\n  <ul>\n    <li>Dodano legendę do eksportowanego wykresu 'Obecności'.</li>\n  </ul>\n  <h3>Zlecenie reszty działów</h3>\n  <ul>\n    <li>Dodano możliwość wyboru źródła komentarza: Inne, Malarnia, Magazyn.</li>\n    <li>Dodano rejestrację komentarzy z malarnii w historii zlecenia.</li>\n  </ul>\n  <h3>Badanie Opinia</h3>\n  <ul>\n    <li>Usunięto logo EES z szablonu dla Kętrzyna.</li>\n  </ul>\n  <h3>Formatka operatora</h3>\n  <ul>\n    <li>Zmieniono kolejność nazwy personelu z 'Imię+Nazwisko' na 'Nazwisko+Imię'.</li>\n  </ul>\n  <h3>Inne</h3>\n  <ul>\n    <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas eksportu wydruku do PDF.</li>\n    <li>Zmieniono pole wyszukiwania użytkowników tak, aby w przypadku napotkania kilku użytkowników o takim samym\n      imieniu i nazwisku, najpierw preferowany był aktywny użytkowników, poźniej użytkownik mający przypisany adres\n      e-mail, a na końcu użytkownik przypisany do firmy 'PHILIPS'.</li>\n    <li>Uruchomiono dwa dodatkowe procesy do generowania raportów na oddzielnym serwerze.</li>\n  </ul>\n</div>\n");return __output.join("")}});