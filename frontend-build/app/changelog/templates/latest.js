define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Zmieniono wyświetlanie komunikatu dopuszczenia na liście komponentów tak, aby pokazywał się zawsze przy\n    komponencie dopuszczonym.</li>\n  <li>Dodano możliwość ręcznego dodawania dokumentów do zlecenia.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono formularz edycji zgłoszenia tak, aby pola w sekcji Kaizen były wymagane, jeżeli wybrano status\n    Zakończone.</li>\n  <li>Zmieniono uprawnienia do edycji zgłoszenia tak, aby przypisany Koordynator Kaizen oraz Zatwierdzający\n    z przypisanego Działu zgłaszającego mogli edytować zgłoszenie nawet jak ma już status Zakończone lub\n    Anulowane.</li>\n  <li>Dodano możliwość oznaczania zakończonych zgłoszeń jako Kaizen Miesiąca.</li>\n  <li>Dodano raport Wynagrodzenie.</li>\n</ul>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Zmieniono formularz karty pracy malarnii tak, aby po wpisaniu numeru części automatycznie była wybierana\n    operacja z WorkCenter PAINT oraz maszyna PAINT_.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Zmieniono wyświetlanie daty rozpoczętego planu linii tak, aby data miała kolor pomarańczowy, jeżeli\n    w danym dniu nie ma już żadnych zleceń oczekujących na kompletację dla danej linii.</li>\n  <li>Zmieniano warunek oznaczania wykonanych zleceń rozplanowanych na linii tak, aby zielone były zlecenia,\n    które zostały w całości wykonane lub mają status CNF albo DLV, a nie tylko takie, które zostały\n    wykonane w zaplanowanej ilości na zaplanowanej linii i zmianie.</li>\n  <li>Dodano wykonane zlecenia do eksportu statystyk planu. Wykonane zlecenia to zlecenia zrobione zgodnie\n    z planem.</li>\n</ul>\n<h3>Magazyn</h3>\n<ul>\n  <li>Poprawiono łączenie zleceń w grupy.</li>\n  <li>Poprawiono błąd powodujący nieprzeliczanie statystyk wozków na ekranie wysyłki po jakichkolwiek zmianach\n    w wózkach.</li>\n  <li>Poprawiono błąd mogący spowodować ponowne zaliczenie do licznika skompletowanych sztuk na linii części\n    wysłanych już zleceń, jeżeli zostały wysłane najpierw przez malarnię lub opakowania.</li>\n  <li>Zmieniono generowanie picklisty malarnii tak, aby zlecenia podrzędne brane były z danych Zleceń\n    produkcyjnych, a nie ze Zleceń malarnii.</li>\n  <li>Dodano filtry do kompletacji: Zlecenie, Linia, MRP oraz Set.</li>\n  <li>Dodano możliwość wpisania komentarza podczas przekierowywania dostarczonego zlecenia.</li>\n  <li>Dodano możliwość przeglądania historii stanów linii.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Dodano do raportu Wyniki możliwość eksportowania UPPH do pliku.</li>\n</ul>\n<h3>FTE</h3>\n<ul>\n  <li>Poprawiono eksportowanie zasobów produkcji tak, aby kolumny dla poszczególnych firm miały zawsze taką samą\n    kolejność.</li>\n</ul>\n<h3>Dopuszczenia</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający filtrowanie dopuszczeń po numerze zlecenia.</li>\n  <li>Dodano możliwość masowego usuwania dopuszczonych zleceń.</li>\n</ul>\n<h3>Malarnia</h3>\n<ul>\n  <li>Dodano możliwość eksportowania danych obciążenia.</li>\n</ul>\n");return __output}});