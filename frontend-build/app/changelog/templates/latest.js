define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v0.148.0</h1>\n<h2>"),__append(time.format("2020-04-22","LL")),__append("</h2>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie na ekranie monitoringu menu z raportami dla użytkowników\n    z uprawnieniem 'Dane produkcyjne: przeglądanie'.</li>\n  <li>Poprawiono błąd przy liczeniu ilości wszystkich linii montażowych w raporcie Wyniki.</li>\n  <li>Zmieniono sposób obliczania unbalance.</li>\n  <li>Dodano oddzielne uprawnienia do zarządzania grupami wyrobów.</li>\n  <li>Dodano wsparcie dla balansowania operacji.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Usunięto funkcjonalność serwowania plików dokumentów z ustawionego katalogu na dysku lokalnym.\n    Od teraz pliki dokumentów zawsze są serwowane z Katalogu dokumentów WMES.</li>\n  <li>Dodano możliwość dodawania do katalogu plików innego typu niż PDF: txt, json, docx, xlsx, pptx, mp4.</li>\n  <li>Dodano możliwość dodawania do katalogu plików bez podania 15NC. Jeżeli 15NC nie zostanie podane, to dokument\n    dostanie automatycznie wygenerowany, unikalny kod z prefiksem 000.</li>\n  <li>Dodano wsparcie dla balansowania operacji.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Poprawiono błąd oznaczający status wysyłki FIFO kompletowanego zlecenia jako 'Zakończone', jeżeli\n    zakończono kompletację FMX a następnie zignorowano kompletację Kitter (lub odwrotnie).</li>\n  <li>Poprawiono błąd powodujący zawieszenie statusów wózków w secie po rozwiązaniu problemu z transakcją LP10.</li>\n  <li>Zmieniono dokładanie brakujących wózków FIFO do wywózki tak, aby brane pod uwagę były tylko pierwsze\n    pasujące sety z każdej kwalifikującej się linii (a nie wszystkie), żeby zachować kolejność wywożonych\n    zleceń.</li>\n  <li>Dodano możliwość przekierowywania linii.</li>\n  <li>Dodano możliwość zmiany nr wózków w niewysłanych setach dla użytkowników z uprawnieniem\n    'Magazyn: zarządzanie wózkami'.</li>\n</ul>\n<h3>FTE (produkcja)</h3>\n<ul>\n  <li>Poprawiono błąd powodujący wyświetlanie w formularzu edycji zasobów `undefined` jako ID linii, jeżeli\n    w danym przepływie nie ma żadnych aktywnych linii.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd powodujący zatrzymanie procesu automatycznego blokowania MRP po zablokowaniu pierwszego MRP\n    od uruchomienia serwera.</li>\n  <li>Zmieniono odblokowywanie MRP tak, aby tylko super administrator mógł odblokować MRP, dla którego istnieją\n    skompletowane sety w magazynie.</li>\n  <li>Dodano wsparcie dla przekierowywania linii z poziomu planu.</li>\n  <li>Dodano informację o skompletowanych oraz dostępnych sztukach do dymka linii.</li>\n</ul>\n<h3>Baza PFEP</h3>\n<ul>\n  <li>Dodano listy rozwijane z istniejącymi wartościami do pól Jednostka, Rodzaj opakowania oraz Dostawca.</li>\n</ul>\n");return __output}});