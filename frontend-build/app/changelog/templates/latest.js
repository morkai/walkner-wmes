define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Planowanie</h3>\n<ul>\n  <li>Zmieniono zaliczanie zleceń do sekwencji tak, aby kontynuacja zlecenia była zaliczana jeżeli poprzednie zlecenie\n    mieściło się w ramach czasowych.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Zmieniono wykres strat czasu w raporcie Obciążenie tak, aby od czasu pomiaru odejmowana była granica\n    opóźnienia.</li>\n  <li>Dodano możliwość ustawnienia statusów oraz granicy opóźnienia dla każdego licznika obciążenia oddzielnie.</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niepojawianie się podglądu załącznika po najechaniu na jego nazwę.</li>\n  <li>Zmieniono uprawnienia Magazynierów oraz Starszym magazynierów na takie same jak Liderzy.</li>\n  <li>Zmieniono opcję konfiguracyjną 'Użytkownicy dostępni w menu szybkiego dodawania' tak, aby można było\n    wybrać także wszystkich użytkowników z wybraną funkcją na produkcji.</li>\n</ul>\n<h3>Inspecja Jakości</h3>\n<ul>\n  <li>Dodano możliwość przypisywania usprawnień do akcji korygujących.</li>\n</ul>\n<h3>Raporty > Operatorzy</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający załadowanie komentarzy z kart pracy.</li>\n</ul>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Poprawiono filtr Jednostka organizacyjna.</li>\n</ul>\n<h3>Produkcja > Zlecenia</h3>\n<ul>\n  <li>Dodano filtr Karta pracy. Domyślnie wyświetlane są tylko zlecenia z linii.</li>\n  <li>Dodano odnośnik do Zlecenia produkcyjnego na liście zleceń.</li>\n  <li>Dodano wyświetlanie przypisanej Grupy zlecenia.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Dodano filtr Powód opóźnienia.</li>\n</ul>\n<h3>Reaguj > Zaangażowanie</h3>\n<ul>\n  <li>Zmieniono Sumę zgłoszeń na Ilość zgłoszeń.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Dodano możliwość wybrania przełożonego dla każdego właściciela oddzielnie.</li>\n</ul>\n<h3>Baza komponentów</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający szybki dodruk etykiet.</li>\n</ul>\n");return __output}});