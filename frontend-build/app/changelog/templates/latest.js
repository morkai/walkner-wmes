define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.119.0</h1>\n<h2>"),__append(time.format("2018-01-10","LL")),__append("</h2>\n<h3>Nieprawidłowe zlecenia IPT</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować wywalenie się serwera importera zleceń.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Usunięto specjalne przewijania listy rozplanowanych zleceń w zależności od pozycji kursora na liście.</li>\n  <li>Poprawiono błąd uniemożliwiający załadowanie planu przez użytkowników z uprawnieniem 'Plany dzienne: przeglądanie',\n    ale bez uprawnienia 'Dane produkcyjne: przeglądanie'.</li>\n  <li>Poprawiono błąd mogący spowodować wyświetlanie nieaktualnego stanu planu dziennego, jeżeli poszczególne dane\n    zostały załadowane w nieprawidłowej kolejności.</li>\n  <li>Poprawiono błąd zatrzymujący wyświetlanie MRP planu dziennego, jeżeli do planu dodano maszynę (linia produkcyjna\n    z działu typu 'Tłocznia').</li>\n  <li>Poprawiono błąd podczas generowania planu polegający na ignorowanie wartości 'Linia aktywna do' podczas fazy\n    rozszerzania niekompletnego zlecenia.</li>\n  <li>Poprawiono błąd mogący spowodować brak odświeżenia aktualnego stanu planu po otrzymaniu od serwera informacji\n    o zmianach w planie.</li>\n  <li>Poprawiono błąd powodujący nietworzenie planów godzinowych z nowego planu dziennego, gdy dane plany godzinowe\n    wcześniej nie istniały.</li>\n  <li>Poprawiono błąd powodujący nieaktualizowanie istniejących planów godzinowych po zmianach w planie dziennym.</li>\n  <li>Zmieniono sortowanie wejściowej kolejki zleceń tak, aby zlecenia 'Pilne' i 'Przypięte' były brane pod uwagę\n    wcześniej od zleceń tylko 'Pilnych'.</li>\n  <li>Zmieniono edycję 'Ilości osób' na linii z poziomu planu tak, aby można było ustawić wartość 0.</li>\n  <li>Dodano funkcjonalność wybóru daty planu z poziomu 'okruszków' (jak w malarnii).</li>\n  <li>Dodano możliwość włączenia opcji wysokiego kontrastu dla widoku planu dziennego.</li>\n  <li>Dodano nowe ustawienie: Szybkość planowania.</li>\n  <li>Dodano funkcjonalność zamrażania zleceń. Zlecenia z pierwszej zmiany są automatycznie zamrażane po 23:00.</li>\n  <li>Dodano obliczanie wartości 'Sumy RBH do zrobienia' oraz 'Sumy ilości sztuk do zrobienia'.</li>\n  <li>Dodano specjalny widok zleceń dla Magazynu.</li>\n  <li>Dodano akcje 'Malarnia' oraz 'Magazyn' do strony planu dziennego.</li>\n  <li>Dodano możliwość ustawiania 'Grupy drop zone', 'Czasu wywołania', 'Statusu magazynu' oraz 'Komentarzu magazynu'\n    dla każdego zlecenia.</li>\n  <li>Dodano funkcjonalność skakania do MRP na stronie planu dziennego oraz magazynu za pomocą <kbd>Spacji</kbd>\n    lub wpisania na klawiaturze nazwy MRP.</li>\n  <li>Dodano słownik farb do Malarnii.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono wartość 'Całkowite średnie dzienne FTE' w raporcie 'Wskaźniki' tak, aby była sumą wartości poszczególnych\n    działów, a nie ich średnią.</li>\n  <li>Zmieniono liczenie użytkowników w raporcie 'Wskaźniki', aby działało tak jak w raporcie 'Zaangażowanie'.</li>\n  <li>Zmieniono liczenie użytkowników we wszystkich raportach tak, aby grupowani byli po imieniu i nazwisku\n    zamiast po ID.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Zmieniono filtr listy wyników tak, aby domyślny wyświetlane były wyniki z ostatnich 14 dni.</li>\n</ul>\n<h3>Raporty > CLIP</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wybranie powodu opóźnienia z poziomu listy zleceń.</li>\n  <li>Zmieniono filtr 'Godzina' listy zleceń tak, aby akceptował wartość w formacie 'gg' lub 'gg:mm'.</li>\n  <li>Zmieniono nazwę kolumny 'Data ukończenia (podst.)' na 'Data ukończenia (plan.)'.</li>\n  <li>Zmieniono listę zleceń tak, aby ignorowane były zlecenia ze statusem 'TECO' lub 'DLT'.</li>\n</ul>\n<h3>Raporty > Wskaźniki</h3>\n<ul>\n  <li>Dodano 'Produktywność' do eksportowanych danych.</li>\n  <li>Zwiększono czas generowania raportu o 17%.</li>\n</ul>\n<h3>Raporty > HR</h3>\n<ul>\n  <li>Dodano legendę do eksportowanego wykresu 'Obecności'.</li>\n</ul>\n<h3>Zlecenie reszty działów</h3>\n<ul>\n  <li>Dodano możliwość wyboru źródła komentarza: Inne, Malarnia, Magazyn.</li>\n  <li>Dodano rejestrację komentarzy z malarnii w historii zlecenia.</li>\n</ul>\n<h3>Badanie Opinia</h3>\n<ul>\n  <li>Usunięto logo EES z szablonu dla Kętrzyna.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Zmieniono kolejność nazwy personelu z 'Imię+Nazwisko' na 'Nazwisko+Imię'.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować wywalenie się serwera podczas eksportu wydruku do PDF.</li>\n  <li>Zmieniono pole wyszukiwania użytkowników tak, aby w przypadku napotkania kilku użytkowników o takim samym\n    imieniu i nazwisku, najpierw preferowany był aktywny użytkowników, poźniej użytkownik mający przypisany adres\n    e-mail, a na końcu użytkownik przypisany do firmy 'PHILIPS'.</li>\n  <li>Uruchomiono dwa dodatkowe procesy do generowania raportów na oddzielnym serwerze.</li>\n</ul>\n");return __output.join("")}});