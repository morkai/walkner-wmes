define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Magazyn</h3>\n<ul>\n  <li>Zmieniono przydzielanie do istniejącego seta tak, aby odbywało się wg najwcześniejszego czasu\n    rozpoczęcia kompletacji seta a nie wg najwcześniejszego czasu rozpoczęcia zlecenia w secie.</li>\n  <li>Zmieniono przydzielanie Platformowego do istniejącego seta tak, aby przydzielany był najpierw\n    do setów dla linii, które mają najmniejszy dostępny czas.</li>\n  <li>Zmieniono obsługę problemów:\n    <ul>\n      <li>Problem podczas kompletacji nie usuwa zlecenia z seta. Problem z transakcją LP10 nadal\n        usuwa zlecenie z seta.</li>\n      <li>Sety z problemami mogą być wysyłane.</li>\n      <li>Dostarczone zlecenia, które mają problem są automatycznie blokowane podczas wysyłki.</li>\n      <li>Zablokowane, dostarczone zlecenia są automatycznie odblokowywane podczas wysyłki wózków zawierających\n        zablokowane zlecenie, jeżeli zlecenie to nie ma żadnego problemu.</li>\n    </ul>\n  </li>\n  <li>Zmieniono wyświetlanie statusu kompletacji Malarnii tak, aby status Kompletacja miał taką samą ikonę\n    jak status Oczekiwanie (znak zapytania zamiast wózek), jeżeli do funkcji Malarnii nie została jeszcze\n    przypisana osoba.</li>\n  <li>Zmieniono automatyczne anulowanie wykonanych zleceń tak, aby zlecenia z magazynu, które otrzymają status\n    CNF, DLV, TECO, DLT lub DLFL zostały anulowane, jeżeli ich status to 'Oczekiwanie', a dla zleceń z rozpoczętą\n    kompletacją kończone były wszystkie dostarczone zlecenia o takich samych numerach.</li>\n  <li>Zmieniono wysyłkę wózków tak, aby dostarczone zlecenia, które w momencie rozpoczęcia wysyłki są oznaczone\n    w SAP jako zakończone (status CNF, DLV, TECO, DLT lub DLFL), były automatycznie tworzone ze statusem\n    'Zrobione'.</li>\n  <li>Zmieniono kompletację setów tak, aby FMX oraz Kitter nie mogli zmieniać statusu zlecenia, jeżeli\n    Platformowy skompletował już wózki.</li>\n  <li>Dodano automatyczne drukowanie picklisty malarnii po rozpoczęciu kompletacji przez malarnię.</li>\n  <li>Dodano do listy stanów linii możliwość wyświetlenia listy zleceń kompletowanych, skompletowanych oraz\n    dostępnych (dostarczonych).</li>\n  <li>Dodano możliwość podania komentarza do problemu LP10.</li>\n  <li>Dodano automatyczne dodawanie komentarza problemu do historii zlecenia.</li>\n</ul>\n<h3>Usprawnienia</h3>\n<ul>\n  <li>Zmieniono przepływ zgłoszeń.</li>\n</ul>\n<h3>Narzędzia pomiarowe</h3>\n<ul>\n  <li>Poprawiono błąd powodujący usuwanie załączników po 30 minutach od momentu załadowania na serwer.</li>\n</ul>\n<h3>Czas cyklu</h3>\n<ul>\n  <li>Dodano wsparcie dla linii z systemami Balluff RFID.</li>\n</ul>\n<h3>Dummy paint</h3>\n<ul>\n  <li>Dodano nowy moduł do podmiany w SAP komponentów dummy na rzeczywiste farby.</li>\n</ul>\n");return __output}});