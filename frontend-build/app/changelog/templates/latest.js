define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.116.4</h1>\n<h2>"),__append(time.format("2017-10-08","LL")),__append("</h2>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Poprawiono błąd powodujący całkowite niedziałanie Formatki na starych wersjach przeglądarki Google Chrome.</li>\n  <li>Poprawiono błąd w formularzu 'Koniec pracy' powodujący niesprawdzanie 'Wykonanej ilość aktualnego zlecenia'\n    pod kątem minimalnej i maksymalnej wartości, jeżeli operator nie zaznaczył tego pola.</li>\n  <li>Zmieniono ograniczenie zrobionej ilości tak, aby pod uwagę brana była wykonywana aktualnie operacja.</li>\n</ul>\n<h3>Zlecenia reszty działów</h3>\n<ul>\n  <li>Usunięto 'Maksymalną ilość do zrobienia' w zleceniu.</li>\n  <li>Zmieniono obliczanie 'Ilości zrobionej'. Wcześnij była to suma 'Wykonanych ilości' ze zleceń spływających\n    z Formatki operatora. Teraz obliczana jest suma 'Wykonanych ilości' dla każdej operacji zlecenia, a następnie\n    wybierana jest najmniejsza wartość większa od 0.</li>\n  <li>Dodano możliwość definiowania 'Maksymalnej ilości do zrobienia' dla każdej operacji zlecenia.</li>\n</ul>\n<h3>SAP GUI</h3>\n<ul>\n  <li>Zmieniono zrzut dokumentów zlecenia tak, aby był robiony w trzech częściach (-2, +0 dni; +1 dzień; +2 dni).\n    Wcześnij zrzut robiony był w dwóch częściach (-2, +0 dni; +1, +2 dni), co sprawiało, że drugi zrzut trwał bardzo\n    długo lub bardzo często kończył się niepomyślnie.</li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Zmieniono wyświetlanie nazwy użytkownika tak, aby zawsze nazwisko było pierwsze.</li>\n</ul>\n");return __output.join("")}});