define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,function(a){return _ENCODE_HTML_RULES[a]||a})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="kaizenHelp">\n  <ul class="page-breadcrumbs">\n    <li><a href="#kaizenOrders">Usprawnienia</a></li>\n    <li>Pomoc</li>\n  </ul>\n  <h3>Logowanie do systemu</h3>\n  <p>\n    W celu zalogowania się do programu, korzystamy z przeglądarki Google Chrome.<br>\n    Do paska adresu wpisujemy: '),__output.push(window.location.origin),__output.push('\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/new_tab.png" alt="Pasek adresu"></p>\n  <p>\n    Loginem oraz pierwszym hasłem dostępu jest numer karty kontroli dostępu pracownika (np. 46000058).\n    Po zalogowaniu się, jest możliwość zmiany hasła. W tym celu klikamy na swoje imię i nazwisko w prawym, górnym rogu\n    ekranu i wybieramy z menu pozycję <em>Moje konto</em>,\n    a następnie klikamy przycisk <button class="btn btn-default"><i class="fa fa-edit"></i><span>Edytuj konto</span></button>.\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/my_account.png" alt="Moje konto"></p>\n  <p>\n    W przypadku wystąpienia problemów technicznych związanych z otwarciem strony, przed zgłoszeniem problemu\n    administratorowi, należy spróbować odświeżyć stronę za pomocą klawisza <kbd>F5</kbd>.\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/login_form.png" alt="Formularz logowania"></p>\n  <h3>Dodawanie zgłoszenia</h3>\n  <p>\n    Po zalogowaniu do systemu, otworzy się strona <strong>Usprawnienia \\ Zgłoszenia</strong>.\n    Klikamy przycisk <button class="btn btn-default"><i class="fa fa-plus"></i><span>Dodaj zgłoszenie</span></button>.\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/add_order.png" alt="Akcja dodawania zgłoszenia"></p>\n  <p>Po kliknięciu pojawi się formularz dodawania nowego zgłoszenia usprawnień:</p>\n  <p><img src="/app/kaizenOrders/assets/help/add_form.png" alt="Formularz dodawania zgłoszenia"></p>\n  <p>i wypełniamy poszczególne pola:</p>\n  <dl>\n    <dt>Temat zgłoszenia\n    <dd>Wpisujemy krótką informację (słowo klucz) identyfikujące dane zdarzenie. Pole wymagane.\n    <dt>Dział zgłaszający\n    <dd>Wybieramy swój dział z listy rozwijalnej. Pole wymagane.\n    <dt>Osoba zatwierdzająca\n    <dd>Wyszukujemy przełożonego, w którego obszarze odpowiedzialności stwierdzono zdarzenie. Wyszukiwanie rozpocznie się po wpisaniu przynajmniej trzech liter nazwiska. Pole wymagane.\n    <dt>Osoby zgłaszające\n    <dd>Wyszukujemy osobę lub osoby, które zgłosiły zdarzenie. Pole wymagane.\n    <dt>Czas zdarzenia\n    <dd>Wpisujemy faktyczną datę i godzinę wystąpienia zdarzenia. Pole wymagane.\n    <dt>Miejsce zdarzenia\n    <dd>Wybieramy miejsce wystąpienia zdarzenia z listy rozwijalnej. Pole wymagane.\n    <dt>Opis zdarzenia (jak jest)\n    <dd>Opisujemy zdarzenie, które zostało zgłoszone. Pole wymagane.\n  </dl>\n  <p>\n    Następujące pola wypełnia się w przypadku, gdy posiadamy pełne informacje na temat zdarzenia lub chcemy zakończyć zgłoszenie:\n  </p>\n  <dl>\n    <dt>Przyczyna wystąpienia zdarzenia\n    <dd>Opisujemy przyczynę wystąpienia zgłaszanego zdarzenia.\n    <dt>Kategoria przyczyny\n    <dt>Rodzaj ryzyka\n    <dt>Kategoria zdarzenia\n    <dd>Wybieramy właściwe wartości z list rozwijalnych.\n    <dt>Podjęte działania korekcyjne (gaszenie pożaru)\n    <dd>Opisujemy co zrobiono, aby usunąć <em>skutek</em> wystąpienia tego konkretnego zdarzenia.\n    <dt>Podjęte działania korygujące\n    <dd>Opisujemy co zrobiono, aby usunąć <em>przyczynę</em> występowania podobnych zdarzeń.\n  </dl>\n  <p>\n    W przypadku posiadania zdjęć i dokumentów towarzyszących zdarzeniu możemy je dodać do zgłoszenia w polach:\n    Skan dokumentu, Stan przed oraz Stan po:\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/add_form_attachments.png" alt="Dodawanie załączników"></p>\n  <p>\n    W przypadku, gdy chcemy poinformować inne osoby (od tych wybranych we wcześniejszych polach) o dodanym zgłoszeniu\n    (np. w celu wyrażenia opinii), to możemy dodać je do listy Obserwatorów zgłoszenia.\n    Osoby te zostaną dodane do listy uczestników zgłoszenia z rolą Obserwatora,\n    dzięki czemu będą powiadamiani e-mailem o zmianach w tym zgłoszeniu.\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/add_form_observers.png" alt="Dodawanie obserwatorów"></p>\n  <p>\n    Po wypełnieniu pól klikamy przycisk <button class="btn btn-primary">Dodaj zgłoszenie</button>,\n    w celu zapisania zgłoszenia w bazie danych. Prawidłowe przyjęcie zgłoszenia zostanie potwierdzone komunikatem:\n  </p>\n  <p><img src="/app/kaizenOrders/assets/help/add_thanks.png" alt="Komunikat podziękowania"></p>\n  <h3>Zarządzanie statusami</h3>\n  <p>\n    Każde zgłoszenie posiada swój status.\n    Statusami zarządza Osoba zatwierdzająca zgłoszenie.\n    Dostępne są następujące statusy:\n  </p>\n  <ul>\n    <li><em>Nowe</em> - status zgłoszenia zaraz po dodaniu.</li>\n    <li><em>Zaakceptowane</em> - status informujący, że zgłoszenie zostało zaakceptowane przez Osobę zatwierdzającą zgłoszenie.</li>\n    <li><em>Do realizacji</em> - status informujący, że poszukiwane są osoby, które podejmą się zrealizowania zgłoszenia.</li>\n    <li><em>W realizacji</em> - status informujący, że zgłoszenie jest w trakcie realizacji.</li>\n    <li><em>Wstrzymane</em> - status informujący, że realizacja zgłoszenie jest tymczasowo wstrzymana.</li>\n    <li><em>Zakończone</em> - status informujący, że zgłoszenie zostało pomyślnie zrealizowane.</li>\n    <li><em>Anulowane</em> - status informujący, że zgłoszenie jest nieprawidłowe (np. zostało zgłoszone przez pomyłkę).</li>\n  </ul>\n</div>\n');return __output.join("")}});