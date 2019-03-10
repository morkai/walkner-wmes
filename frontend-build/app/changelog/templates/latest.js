define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v?.?.?</h1>\n<h2>"),__append(time.format(Date.now(),"LL")),__append("</h2>\n<h3>Karty pracy</h3>\n<ul>\n  <li>Poprawiono błąd powodujący niedziałanie skrótu do zaznaczenia ostatniego pola <kbd>Alt+Enter</kbd>.</li>\n</ul>\n<h3>Planowanie</h3>\n<ul>\n  <li>Poprawiono błąd uniemożliwiający wydrukowanie planu dla linii, na której zostały rozplanowane brakujące zlecenia\n    (zwykle zlecenia niekompletne z poprzedniego dnia, które zostały w planie linii, ale nie ma już ich w kolejce\n    zleceń danego MRP, bo zostały całkowicie zrobione, usunięte z listy zleceń planu, ale nie z rozplanowanych\n    zleceń na linii, bo MRP było zablokowane).</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Zmieniono treść powiadomienia SMS tak, aby zawierało opis problemu zamiast odnośnika do zgłoszenia.</li>\n</ul>\n<h3>Raporty > CLIP</h3>\n<ul>\n  <li>Zmieniono domyślny filtr daty tak, aby wskazywał na ostatni dzień, a nie ostatnie 7 dni.</li>\n  <li>Zmieniono wykres CLIP tak, aby wyświetlał dane w kolumnach zamiast punktach, jeżeli wyfiltrowano wyniki tylko\n    dla jednego okresu czasu.</li>\n</ul>\n<h3>ZPW</h3>\n<ul>\n  <li>Zmieniono raport Zaangażowanie tak, aby zliczał Obserwacje zachowań według Miejsca pracy obserwatora, a nie\n    Miejsca obserwacji.</li>\n</ul>\n<h3>Formatka operatora</h3>\n<ul>\n  <li>Dodano nową opcję konfiguracyjną do ustawień sprawdzania spigota: Grupy 12NC Insertów - umożliwia przypisanie\n    listy 12NC opraw do skanowanego przez Operatora kodu podczas sprawdzania spigota. Jeżeli zlecenie ma komponent\n    spigot oraz znajduje się na liście insertów, to podczas sprawdzania, komponent spigota zastępowany jest\n    komponentem inserta.</li>\n</ul>\n<h3>FAP</h3>\n<ul>\n  <li>Dodano nowe pole: Komponent.</li>\n  <li>Dodano nowe pole: Dział - wybrany dział wpływa na to jakie dodatkowe pola są wymagane podczas dodawania\n    zgłoszenia:\n    <ul>\n      <li>Montaż - nr zlecenia,</li>\n      <li>Tłocznia - komponent oraz linia,</li>\n      <li>Magazyn - komponent.</li>\n    </ul>\n    Dodatkowo wybranie kategorii 'Awaria infrastruktury' zmienia wymagane pola tak, że 'Nr zlecenia' nie jest\n    wymagane (nawet w przypadku wybrania działu 'Montaż') oraz 'Linia' jest wymagane.\n  </li>\n</ul>\n<h3>Inne</h3>\n<ul>\n  <li>Dodano brakujące tłumaczenia modułów na język angielski.</li>\n</ul>\n");return __output.join("")}});