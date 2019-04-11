define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Baza testów > TRW</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wywalenie się serwera po usunięciu Testera, który nie ma zdefiniowanych żadnych\n    Programów.</li>\n  <li>Poprawiono błąd powodujący ustawienie ID linii jako numer wcześniej wybranego zlecenia po odświeżeniu\n    strony.</li>\n  <li>Dodano możliwość testowania bez wybrania istniejącego zlecenia.</li>\n  <li>Dodano możliwość dodawania nowego programu przez skopiowanie istniejącego.</li>\n</ul>\n<h3>Dane produkcyjne > Zlecenia</h3>\n<ul>\n  <li>Poprawiono błąd powodujący nieodświeżanie się listy zleceń po zmianach, jeżeli do listy weszło się z modułu\n    Planowanie dzienne lub Magazyn.</li>\n  <li>Zmieniono obliczanie czasu pracy zlecenia tak, aby czas mniejszy niż 0s był zamieniany na 0s.</li>\n  <li>Zmieniono obliczanie czasu przestojów zlecenia tak, aby zlecenia z ujemnym czasem trwania były ignorowane.</li>\n</ul>\n<h3>Raporty > Wskaźniki</h3>\n<ul>\n  <li>Zmieniono eksportowanie danych wydajności tak, aby zlecenia, których czas pracy nie jest większy od 0\n    były ignorowane.</li>\n  <li>Zmieniono obliczanie wydajności na wykresach tak, aby pod uwagę brane były te same wartości co podczas\n    eksportowania danych.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie się komunikatu z podziękowaniem po dodaniu nowego ZPW\n    oraz Usprawnienia.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Poprawiono błąd mogący zatrzymać zmianę list zleceń do zrobienia oraz zleceń rozpoczętych podczas zmiany\n    filtra MRP lub farby.</li>\n  <li>Poprawiono błąd zatrzymujący ładowanie zleceń po zmianie filtra daty, jeżeli wybrane było MRP, które\n    w nowym dniu nie ma żadnych zleceń.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować brak zmiany wymagania pola 'Nr zlecenia' po zmianie 'Rodzaju inspekcji'\n    w starszych wersjach przeglądarki Chrome.</li>\n  <li>Poprawiono błąd uniemożliwiający przeglądanie szczegółów starych wyników inspekcji.</li>\n</ul>\n<h3>Przestoje</h3>\n<ul>\n  <li>Poprawiono błąd powodujący nieodświeżanie się danych na stronie ze szczegółami przestoju po dokonaniu\n    zmiany przestoju przez dowolnego użytkownika.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Poprawiono błąd mogący spowodować niekompletne załadowanie się strony z filtrowalną listą, jeżeli filtr\n    zawiera kontrolkę 'Moje MRP' w starszych wersjach przeglądarki Chrome.</li>\n</ul>\n");return __output.join("")}});