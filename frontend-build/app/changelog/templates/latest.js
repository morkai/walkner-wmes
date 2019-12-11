define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>FAP</h3>\n<ul>\n  <li>Zmieniono sprawdzanie uprawnień do zmiany kategorii zgłoszenia tak, aby lista uprawnionych Funkcji produkcyjnych\n    była definiowana w ustawieniach.</li>\n  <li>Zmieniono Kod komponentu tak, aby podany komponent nie musiał istnieć w bazie danych.</li>\n  <li>Zmieniono określanie wymaganych pól przy dodawaniu zgłoszenia tak, aby były określane na podstawie wybranej\n    kategorii. Każda kategoria/podkategoria może mieć własną kombinację pól.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Zmieniono pole Przyczyna źródłowa tak, aby można było definiować wiele przyczyn.</li>\n  <li>Zmieniono tabele pareto w raporcie Outgoing quality tak, aby nie wyświetlane były rodziny/wady, które\n    nie wystąpiły w ostatnim tygodniu.</li>\n  <li>Zmieniono wykresy pareto w raporcie Outgoing quality tak, aby wyświetlane były wartości tylko z ostatniego\n    tygodnia.</li>\n  <li>Zmieniono wersję do druku raportu Outgoing quality tak, aby generoiwany był dokument PDF z większą ilością\n    danych na kilku poziomych stronach A4.</li>\n  <li>Zmieniono kolumnę 'Przyczyna' na 'Opis błędu' w raporcie Outgoing quality.</li>\n  <li>Dodano kolumnę 'Przyczyna źródłowa' do raportu Outgoing quality.</li>\n</ul>\n<h3>Monitoring > Czas cyklu</h3>\n<ul>\n  <li>Zmieniono rozpoczynanie pierwszej sztuki na pierwszym stanowisku tak, aby zaczynała się wraz z rozpoczęciem\n    zlecenia na Formatce operatora. Jeżeli w ciągu następnych 60s otrzymany zostanie sygnał z windy, to czas\n    rozpoczęcia pierwszej sztuki jest aktualizowany.</li>\n  <li>Dodano wsparcie dla wielu kart RFID na jednym wózku.</li>\n  <li>Dodano nowy raport.</li>\n  <li>Dodano ekran diagnostyczny pokazujący wszystkie akcje, które serwer otrzymał do przerobienia.</li>\n</ul>\n<h3>Wydajność godzinowa</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wyświetlanie komunikatu o zarejestrowaniu zeskanowanego numeru seryjnego\n    w przypadku, gdy rejestrowanie nie powiodło się ze względu na błędy sieci.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Dodano listę przestojów na stronie szczegółów zlecenia.</li>\n</ul>\n<h3>WorkCentra</h3>\n<h3>Linie produkcyjne</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie nadrzędnej jednostki na stronie ze szczegółami.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono tekstowe pole 'Podjęte działania korygujące' na dwa checkboxy: 'Powrót do standardu' oraz\n    'Powiązane usprawnienie'.</li>\n  <li>Zmieniono Pomoc tak, aby odzwierciedlała najnowszy stan faktyczny.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono Pomoc tak, aby odzwierciedlała najnowszy stan faktyczny.</li>\n  <li>Zmieniono formularz tak, aby nie można było zapisać zgłoszenia jeżeli\n    'Osoba zatwierdzająca' znajduje się także na liście 'Osób zgłaszających'\n    lub 'Osób wykonujących'.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Poprawiono błąd powodujący w niektórych przypadkach niedodawanie do historii zlecenia komentarzy\n    z Malarnii.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Dodano możliwość wyeksportowania do XLSX planu dla robotnika transportu.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Zmieniono sortowanie głównej listy zleceń tak, aby zlecenia były pogrupowane wg MRP,\n    jeżeli wybrano filtr farby.</li>\n  <li>Zmieniono wyświetlanie zakładek MRP tak, aby były wyszarzone, jeżeli nie mają żadnych\n    zleceń z wybraną farbą.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Poprawiono błąd powodujący usuwanie zewnętrznych dokumentów z listy po odświeżeniu\n    klienta aplikacji.</li>\n  <li>Zmieniono wyszukiwanie zewnętrznego dokumentu tak, aby przy wyszukiwaniu brana była pod\n    uwagę data dostępności aktualnie wybranego zlecenia. Dodatkowo usprawniono komunikaty błędów\n    podczas wyszukiwania dokumentu.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Poprawiono błąd powodujący ukrywanie menu w przeglądarce Firefox Mobile.</li>\n</ul>\n");return __output}});