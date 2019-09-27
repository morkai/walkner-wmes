define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="qzPrint-help">\n  <h2>Konfiguracja wtyczki Java</h2>\n  <ol>\n    <li>Instalujemy <a href="http://www.oracle.com/technetwork/java/javase/downloads/jre7-downloads-1880261.html">środowisko uruchomieniowe Java</a> (jeżeli jeszcze nie mamy).</li>\n    <li><a href="https://www.java.com/pl/download/help/enable_browser.xml">Włączamy obsługę technologii Java w przeglądarce.</a></li>\n    <li>Ściągamy plik <a href="/vendor/qz-print/wmes-qz-print.csr">wmes-qz-print.csr</a> na dysk lokalny.</li>\n    <li>Otwieramy <em>Java Control Panel</em>. <a href="https://www.java.com/pl/download/help/win_controlpanel.xml">Gdzie w systemie Windows znajduje się Java Control Panel?</a></li>\n    <li>W zakładce <em>Security</em> zaznaczamy opcję <em>Enable Java content in the browser</em>.</li>\n    <li>Dodajemy adres http://pos.walkner.pl/ do listy wyjątków. <a href="https://www.java.com/pl/download/help/jcp_security.xml">Jak kontrolować czas i sposób uruchamiania niezaufanych aplikacji lub apletów w przeglądarce internetowej?</a></li>\n    <li>Importujemy wcześniej ściągnięty certyfikat <em>wmes-qz-print.csv</em>:\n      <ol>\n        <li>W zakładce <em>Security</em> klikamy przycisk <em>Manage certificates</em>.</li>\n        <li>Z listy <em>Certificate type</em> wybieramy <em>Signer CA</em>.</li>\n        <li>Klikamy przycisk <em>Import</em>.</li>\n        <li>Wyszukujemy plik <em>wmes-qz-print.csv</em> i klikamy przycisk <em>Open</em>.</li>\n        <li>Zamykamy okienko <em>Certificates</em> klikając przycisk <em>Close</em>.</li>\n        <li>\n          Klikamy przycisk <em>Restore Security Prompts</em> i <em>Restore All</em>\n          (na wypadek, gdy w przeszłości wtyczka została przez przypadek zablokowana).\n        </li>\n      </ol>\n    </li>\n    <li>Zamykamy okienko <em>Java Control Panel</em> klikając przycisk <em>OK</em>.</li>\n    <li><a href="javascript:window.location.reload()">Odświeżamy stronę.</a></li>\n    <li>Zazwalamy na uruchomienie wtyczki <em>QZ Print Plugin</em> (zaznaczamy opcję zapamiętania decyzji, aby komunikat nie pojawiał się za każdym wejściem do aplikacji).</li>\n  </ol>\n  <p>Wtyczka działa poprawnie, jeżeli nad menu nie widać paska z komunikatem informującym o niepomyślnym uruchomieniu wtyczki.</p>\n  <h2>Formularz drukowania etykiet</h2>\n  <p>Jeżeli wtyczka zostanie uruchomiona, to do listy pola <em>Drukarka</em> formularza <em>Drukowanie etykiet</em> dodane zostaną wszystkie zdefiniowane na komputerze drukarki.</p>\n  <p>\n    Wybranie drukarki <em>Przeglądarka WWW</em> (zawsze dostępna; wymaga zezwolenia na otwieranie wyskakujących okienek\n    w przeglądarce) spowoduje, że po wysłaniu formularza zostanie otwarte nowe okienko z wygenerowanym plikiem PDF zawierającym\n    etykietyi uruchomiony zostanie standardowy mechanizm drukowania przeglądarki\n    (tj. dostępny podgląd, możliwość wyboru drukarki i ustawienia jej parametrów).\n  </p>\n  <p class="message message-inline message-warning">\n    UWAGA: przy drukowaniu z wykorzystaniem mechanizmu przeglądarki należy upewnić się, że wyłączona jest opcja skalowania\n    (np. w Chrome jest to opcja <em>Dopasuj do strony</em>). Jeżeli skalowanie będzie włączone, to cała zawartość dokumentu\n    może zmienić rozmiary, co może spowodować, że nie da się odczytać kodu kreskowego czytnikiem.\n  </p>\n  <p>\n    Wybranie drukarki, w nazwie której znajduje się ciąg znaków <code>ZPL203</code> oraz rozmiaru papieru <em>104x42 mm</em>,\n    spowoduje, że na daną drukarkę wysłane zostaną bezpośrednio etykiety w formacie <em>ZPL</em> (<em>Zebra Programming Language</em>).\n    Aplikacja zakłada, że drukarka ta, to jeden z modeli drukarek termotransferowych Zebra (lub innych obsługujących format ZPL)\n    o rozdzielczości 203 DPI. W sekcji <em>Konfiguracja drukarki Zebra 203 DPI</em> poniżej, opisany jest sposób odpowiedniej\n    konfiguracji drukarki w systemie Windows. Tym sposobem nie ma możliwości podglądu etykiet przed drukowaniem.\n  </p>\n  <p>\n    Wybranie innej drukarki spowoduje, że na daną drukarkę wysłany zostanie bezpośrednio taki sam plik PDF, jaki jest\n    generowany dla <em>Przeglądarki WWW</em>, ale jako obraz (mapa bitowa). Tym sposobem nie ma możliwości podglądu\n    etykiet przed drukowaniem.\n  </p>\n  <p class="message message-inline message-warning">\n    UWAGA: przy drukowaniu z wykorzystaniem innej drukarki niż <em>Przeglądarka WWW</em> oraz <em>ZPL203</em>, należy\n    ustawić w opcjach drukarki odpowiedni rozmiar papieru (w przeciwnym wypadku mogą wydrukować się puste strony).\n  </p>\n  <h2>Konfiguracja drukarki ZPL203</h2>\n  <p>Aplikacja ma możliwość drukowania bezpośrednio na drukarkę termotransferową.</p>\n  <p>\n    Aktualnie dostępny jest jeden rozmiar etykiety (104x42 mm) oraz drukarki o rozdzielczości 203 DPI obsługujące format ZPL.\n    Testy przeprowadzane były na <a href="https://www.zebra.com/us/en/support-downloads/desktop/gk420t.html">drukarce Zebra GK420t</a>.\n  </p>\n  <ol>\n    <li>\n      Instalujemy i konfigurujemy drukarkę wg instrukcji producenta.\n      Po pomyślnym zainstalowaniu, drukarka powinna pojawić się w <em>Urządzeniach i drukarkach</em> systemu Windows,\n      jako np. <em>ZDesigner GK420t</em> (drukarka Zebra GK420t).\n    </li>\n    <li>Otwieramy okienko dodawania nowe drukarki:\n      <ol>\n        <li>Otwieramy okienko <em>Urządzenia i drukarki</em> systemu Windows.</li>\n        <li>Klikamy przycisk <em>Dodaj drukarkę</em>.</li>\n      </ol>\n      lub\n      <ol>\n        <li>\n          Otwieramy okienko <em>Uruchom...</em> wciskając kombinację klawiszy <code>Win+R</code> lub wybierając\n          odpowiednią pozycję w menu <em>Start</em>.\n        </li>\n        <li>Wykonujemy komendę <code>rundll32 printui.dll PrintUIEntry /il</code>.</li>\n      </ol>\n    </li>\n    <li>Wybieramy opcję dodawania nowej, lokalnej drukarki z własnymi ustawieniami.</li>\n    <li>Wybieramy port, do którego podłączona jest drukarka termotransferowa (np. <em>USB001</em>).</li>\n    <li>Jako producenta wybieramy <em>Generic</em>, a jako drukarkę <em>Generic / Text Only</em>.</li>\n    <li>Na następnym ekranie zostawiamy zalecany sterownik.</li>\n    <li>\n      Na następnym ekranie nadajemy drukarce nazwę, pamiętając o tym, aby w nazwie znalazł się ciąg znaków\n      <code>ZPL203</code> (może to być cała nazwa).\n    </li>\n    <li>Zatwierdzamy dodanie drukarki.</li>\n    <li>\n      Jeżeli aplikacja była otwarta podczas dodawania drukarki, to aby została ona rozponana, należy\n      <a href="javascript:window.location.reload()">przeładować stronę</a>.\n    </li>\n  </ol>\n  <p class="message message-inline message-info">\n    Bezpośrednie, szybkie drukowanie etykiet wykona się tylko wtedy, gdy wybierzemy rozmiar papieru\n    <em>104x42 mm</em> oraz drukarkę zawierającą w nazwie ciąg znaków <em>ZPL203</em>.\n  </p>\n</div>\n');return __output.join("")}});