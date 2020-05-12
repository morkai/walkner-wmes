define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Magazyn</h3>\n<ul>\n  <li>Poprawiono błąd powodujący oznaczenie statusu wysyłki opakowań dla zleceń, które nie mają skompletowanych\n    opakowań, jeżeli ich wysyłka została rozpoczęta razem ze zleceniami, które mają opakowania.</li>\n  <li>Zmieniono zliczanie skompletowanych setów tak, aby sety, które mają problem były pomijane.</li>\n  <li>Zmieniono dokładanie brakujących wózków FIFO do wywózki tak, aby brane pod uwagę były wszystkie kolejne\n    sety z kwalifikujących się linii: do seta z jednym wózkiem może zostać dołożony kolejny set z tej samej linii,\n    tylko, jeżeli mieści się w limicie wózków i następuje dokładnie po poprzednim secie.</li>\n  <li>Zmieniono rozpoczynanie akcji kompletacji tak, aby nie była ograniczona do aktualnie wyświetlanego dnia.</li>\n  <li>Zmieniono wysyłkę wózków opakowań tak, aby można było zainicjować wysyłkę na kwalifikujące się linie\n    bezpośrednio z poziomu wysyłki opakowań, a nie dopiero po rozpoczęciu wysyłki FIFO.</li>\n  <li>Zmieniono rozpoczynanie problemu tak, aby problematyczne zlecenie było usuwane z seta.</li>\n  <li>Zmieniono rozwiązywanie problemu tak, aby resetowano całe zlecenie.</li>\n  <li>Dodano listę zdarzeń.</li>\n  <li>Dodano nową funkcję kompletacji: Platformowy.</li>\n  <li>Dodano nową opcję konfiguracyjną wysyłki: Maksymalny czas do rozpoczęcia zlecenia - maksymalna ilość minut\n    od teraz do zaplanowanego czasu rozpoczęcia zlecenia, aby wózek został przeznaczony do realizacji,\n    jeżeli linia w danym momencie nie pracuje.</li>\n  <li>Dodano automatyczne anulowanie Oczekujących i Problematycznych zleceń, które zostały zakończone, tzn.\n    otrzymały status CNF, DLV, TECO, DLT lub DLFL.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Dodano uprawnienia do konfiguracji MRP i UPPH w raporcie Wyniki dla użytkowników z funkcją\n    inżyniera produkcji.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Zmieniono obliczanie % realizacji zaplanowanej sekwencji tak, aby pod uwagę brane były tylko zrobione zlecenia\n    z zaplanowaną operacją.</li>\n</ul>\n<h3>Produkcja > Zlecenia</h3>\n<ul>\n  <li>Zmieniono sposób wyświetlania zeskanowanych numerów seryjnych na stronie ze szczegółami zlecenia:\n    <ul>\n      <li>panel widoczny jest tylko, gdy zlecenie ma zeskanowane numery seryjne,</li>\n      <li>lista numerów seryjnych wyświetlana jest w jednym przewijalnym wierszu,</li>\n      <li>dodano wykres prezentujący rzeczywiste czasy poszczególnych sztuk oraz cel,</li>\n      <li>dodano obliczanie średniej, mediany, minimum oraz maksimum z dostępnym danych.</li>\n    </ul>\n  </li>\n</ul>\n<h3>Monitoring > Układ fabryki</h3>\n<ul>\n  <li>Zmieniono tytuł z 'Monitoring' na 'Układ fabryki' lub 'Wydajność godzinowa' (jeżeli ten tryb jest włączony).</li>\n  <li>Dodano legendę objaśniającą statusy linii.</li>\n  <li>Dodano nową opcję konfiguracyjną do trybu wydajności godzinowej: Próg odbiegania od planu [%] - linie, które\n    odbiegają od planu o podany procent, są oznaczana innym kolorem.</li>\n</ul>\n<h3>Zlecenia produkcyjne</h3>\n<ul>\n  <li>Dodano możliwość definiowania uwag dla numerów zleceń.</li>\n  <li>Dodano możliwość dodawania do zleceń tagów na podstawie MRP, 12NC wyrobu lub komponentów.</li>\n</ul>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niewyświetlanie ręcznie zdefiniowanych uwag na liście komponentów.</li>\n</ul>\n<h3>Inspekcja Jakości</h3>\n<ul>\n  <li>Dodano nowe pole: Operator.</li>\n</ul>\n");return __output}});