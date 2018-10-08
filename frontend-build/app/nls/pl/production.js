define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,t,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[t](n[r]-o),r in i?i[r]:i.other)},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{"breadcrumbs:base":function(n){return"Operator"},"breadcrumbs:settings":function(n){return"Ustawienia"},"duplicate:title":function(n){return"Podwójne uruchomienie formatki"},"duplicate:message":function(n){return"Wykryto podwójne uruchomienie przeglądarki z formatką operatora.<br>Zamknij wszystkie inne formatki i wciśnij poniższy przycisk, aby ponownie załadować formatkę w tym oknie."},"duplicate:button":function(n){return"Przeładuj formatkę"},"msg:shiftChange":function(n){return"Nowa zmiana!"},"msg:locked":function(n){return"Linia produkcyjna została dezaktywowana!"},"controls:dashboard":function(n){return"Przejdź do dashboardu"},"controls:lock":function(n){return"Zablokuj edycję"},"controls:unlock":function(n){return"Aktywuj edycję"},"controls:locked":function(n){return"Edycja zablokowana"},"controls:unlocked":function(n){return"Edycja aktywna"},"controls:sync":function(n){return"Wskaźnik komunikacji z serwerem"},"controls:addNearMiss":function(n){return"Zgłoś ZPW"},"controls:addSuggestion":function(n){return"Zgłoś sugestię"},"controls:msg:sync:noConnection":function(n){return"Nie można aktywować edycji: brak połączenia z serwerem."},"controls:msg:sync:remoteError":function(n){return"Nie można aktywować edycji: nieudane pobranie klucza."},"controls:msg:sync:success":function(n){return"Pomyślnie aktywowano edycję :)"},"controls:msg:popup":function(n){return"Wyskakujące okienko zostało zablokowane."},"controls:switchApps":function(n){return"Zmień aplikację/Konfiguruj po 3s"},"controls:reboot":function(n){return"Odśwież stronę/Restartuj komputer po 3s"},"controls:shutdown":function(n){return"Wyłącz komputer po 3s"},"controls:mor":function(n){return"Matryca odpowiedzialności"},"unlockDialog:title:unlock":function(n){return"Aktywacja linii produkcyjnej"},"unlockDialog:title:lock":function(n){return"Dezaktywacja linii produkcyjnej"},"unlockDialog:message:unlock":function(n){return"Aby aktywować linię produkcyjną <em>"+e.v(n,"prodLine")+"</em> na tym komputerze, podaj login i hasło użytkownika z uprawnieniem <em>Aktywacja klienta Operator WMES</em>. Linii nie będzie można aktywować, jeżeli jest w tym momencie podłączona do serwera na innym komputerze."},"unlockDialog:message:lock":function(n){return"Aby dezaktywować linię produkcyjną <em>"+e.v(n,"prodLine")+"</em> na tym komputerze, podaj login i hasło użytkownika z uprawnieniem <em>Aktywacja klienta Operator WMES</em>."},"unlockDialog:login":function(n){return"Login"},"unlockDialog:password":function(n){return"Hasło"},"unlockDialog:prodLine":function(n){return"Linia produkcyjna"},"unlockDialog:unlock":function(n){return"Aktywuj linię produkcyjną"},"unlockDialog:lock":function(n){return"Dezaktywuj linię produkcyjną"},"unlockDialog:error:UNLOCK_FAILURE":function(n){return"Nie udało się aktywować linii produkcyjnej."},"unlockDialog:error:LOCK_FAILURE":function(n){return"Nie udało się dezaktywować linii produkcyjnej."},"unlockDialog:error:INVALID_PROD_LINE":function(n){return"Nieprawidłowa linia produkcyjna!"},"unlockDialog:error:INVALID_LOGIN":function(n){return"Nieprawidłowy login!"},"unlockDialog:error:INVALID_PASSWORD":function(n){return"Nieprawidłowe hasło!"},"unlockDialog:error:NO_PRIVILEGES":function(n){return"Brak wymaganych uprawnień!"},"unlockDialog:error:ALREADY_UNLOCKED":function(n){return"Linia produkcyjna jest aktualnie uruchomiona na innym komputerze!"},"unlockDialog:error:DEACTIVATED":function(n){return"Linia produkcyjna jest dezaktywowana!"},"section:data":function(n){return"Dane produkcyjne"},"section:history":function(n){return"Historia"},"section:quantities":function(n){return"Wykonane ilości"},"section:downtimes":function(n){return"Przestoje"},"section:isa":function(n){return"Pole odkładcze"},"section:taktTime":function(n){return"Czas cyklu"},"property:currentTime":function(n){return"Aktualny czas"},"property:shift":function(n){return"Zmiana"},"property:orgUnit":function(n){return"Dział"},"property:master":function(n){return"Mistrz"},"property:master:change":function(n){return"(zmień)"},"property:master:noData:locked":function(n){return"nie wybrany"},"property:master:noData:unlocked":function(n){return"(wybierz mistrza)"},"property:leader":function(n){return"Lider"},"property:leader:change":function(n){return"(zmień)"},"property:leader:noData:locked":function(n){return"nie wybrany"},"property:leader:noData:unlocked":function(n){return"(wybierz lidera)"},"property:operator":function(n){return"Operator"},"property:operator:change":function(n){return"(zmień)"},"property:operator:noData:locked":function(n){return"nie wybrany"},"property:operator:noData:unlocked":function(n){return"(wybierz operatora)"},"property:orderNo":function(n){return"Nr zlecenia"},"property:orderNo:change":function(n){return"(popraw)"},"property:nc12":function(n){return"12NC"},"property:nc12:change":function(n){return"(popraw)"},"property:productName":function(n){return"Nazwa rodziny/detalu"},"property:operationName":function(n){return"Nazwa operacji"},"property:taktTime":function(n){return"Takt [s]"},"property:taktTime:checkSn":function(n){return"(sprawdź)"},"property:lastTaktTime":function(n){return"Cykl [s]"},"property:avgTaktTime":function(n){return"Śr. cykl [s]"},"property:workerCountSap":function(n){return"Osoby wg SAP"},"property:createdAt":function(n){return"Czas rozpoczęcia"},"property:totalQuantityDone":function(n){return"Ilość w zleceniu"},"property:quantityDone":function(n){return"Wykonana ilość"},"property:quantityDone:change":function(n){return"(zmień ilość)"},"property:workerCount":function(n){return"Osoby pracujące"},"property:workerCount:change:data":function(n){return"(zmień ilość)"},"property:workerCount:change:noData":function(n){return"(ustaw ilość)"},"action:newOrder":function(n){return"Nowe zlecenie"},"action:nextOrder":function(n){return"<i class='fa fa-forward' title='Kolejka zleceń'></i>"},"action:continueOrder":function(n){return"Kontynuuj zlecenie"},"action:startDowntime":function(n){return"Przestój"},"action:startBreak":function(n){return"Przerwa"},"action:endDowntime":function(n){return"Koniec przestoju"},"action:endWork":function(n){return"Koniec pracy"},"action:emptyPallet":function(n){return"Pusta paleta"},"action:fullPallet":function(n){return"Paleta"},"quantities:column:time":function(n){return"Godzina"},"quantities:column:planned":function(n){return"Plan"},"quantities:column:actual":function(n){return"Wykonane"},"quantities:unit":function(n){return"szt."},"quantities:change":function(n){return"(zmień)"},"quantities:newValuePlaceholder":function(n){return"Nowa ilość..."},"quantityEditor:title":function(n){return"Wykonana ilość w przedziale godzinowym"},"quantityEditor:label:hour":function(n){return"Przedział godzinowy:"},"quantityEditor:label:value":function(n){return"Ilość wykonana:"},"quantityEditor:submit":function(n){return"Ustaw ilość"},"quantityEditor:cancel":function(n){return"Anuluj ustawianie"},"quantityEditor:maxQuantity":function(n){return"Wartość nie może być większa niż "+e.v(n,"max")+"."},"personelPicker:title:master":function(n){return"Wybieranie mistrza"},"personelPicker:title:leader":function(n){return"Wybieranie lidera"},"personelPicker:title:operator":function(n){return"Wybieranie operatora"},"personelPicker:submit":function(n){return"Wybierz pracownika"},"personelPicker:cancel":function(n){return"Anuluj wybieranie"},"personelPicker:recent":function(n){return"Pracownicy ostatnio pracujący na tej zmianie:"},"personelPicker:matches":function(n){return"Znalezieni pracownicy:"},"personelPicker:tooShort":function(n){return"Podaj przynajmniej trzy początkowe znaki nazwiska."},"personelPicker:notFound":function(n){return"Nie znaleziono żadnych pasujących pracowników."},"personelPicker:online:label":function(n){return"Wybrany pracownik:"},"personelPicker:online:placeholder":function(n){return"Szukaj po numerze kadrowym lub nazwisku"},"personelPicker:offline:label":function(n){return"Nr kadrowy pracownika:"},"personelPicker:offline:warning":function(n){return"Brak połączenia z serwerem. Możesz wpisać tylko numer kadrowy pracownika."},"personelPicker:embedded:label":function(n){return"Szukaj pracownika po nazwisku:"},"orderQueue:title":function(n){return"Ustawianie kolejki zleceń"},"orderQueue:message:order":function(n){return"Wpisz numer zlecenia i wybierz z listy operację, aby dodać następne zlecenie do kolejki."},"orderQueue:message:queue":function(n){return"Poniżej znajduje się aktualna kolejka zleceń."},"orderQueue:message:empty":function(n){return"Kolejka zleceń jest pusta."},"orderQueue:submit":function(n){return"Ustaw kolejkę zleceń"},"orderQueue:enqueue":function(n){return"Dodaj do kolejki"},"orderQueue:clear":function(n){return"Wyczyść kolejkę"},"orderQueue:cancel":function(n){return"Anuluj"},"orderQueue:order:label":function(n){return"Zlecenie"},"orderQueue:order:placeholder":function(n){return"Szukaj zlecenia po numerze..."},"orderQueue:operation:label":function(n){return"Operacja"},"orderQueue:operation:placeholder":function(n){return"Wybierz operację..."},"newOrderPicker:title":function(n){return"Rozpoczynanie nowego zlecenia"},"newOrderPicker:title:replacing":function(n){return"Kończenie aktualnego zlecenia"},"newOrderPicker:title:correcting":function(n){return"Poprawianie aktualnego zlecenia"},"newOrderPicker:order:label:no":function(n){return"Nr nowego zlecenia:"},"newOrderPicker:order:label:nc12":function(n){return"12NC nowego zlecenia:"},"newOrderPicker:order:placeholder:no":function(n){return"Wpisz numer nowego zlecenia..."},"newOrderPicker:order:placeholder:nc12":function(n){return"Wpisz 12NC nowego zlecenia..."},"newOrderPicker:order:tooShort":function(n){return"Podaj pełny, 9-cyfrowy numer zlecenia."},"newOrderPicker:order:notFound":function(n){return"Podane zlecenie nie istnieje."},"newOrderPicker:operation:label:online":function(n){return"Operacja:"},"newOrderPicker:operation:label:offline":function(n){return"Numer operacji:"},"newOrderPicker:operation:placeholder":function(n){return"Wybierz operację nowego zlecenia..."},"newOrderPicker:submit":function(n){return"Rozpocznij nowe zlecenie"},"newOrderPicker:submit:replacing":function(n){return"Zakończ aktualne zlecenie i rozpocznij nowe"},"newOrderPicker:submit:correcting":function(n){return"Popraw aktualne zlecenie"},"newOrderPicker:cancel":function(n){return"Anuluj"},"newOrderPicker:msg:invalidOrderId:no":function(n){return"Nieprawidłowy numer zlecenia."},"newOrderPicker:msg:invalidOrderId:nc12":function(n){return"Nieprawidłowe 12NC zlecenia."},"newOrderPicker:msg:invalidOperationNo":function(n){return"Nieprawidłowy numer operacji."},"newOrderPicker:msg:searchFailure":function(n){return"Wyszukiwanie zlecenia nie powiodło się."},"newOrderPicker:msg:emptyOrder":function(n){return"Prawidłowe zlecenie jest wymagane."},"newOrderPicker:msg:emptyOperation":function(n){return"Operacja jest wymagana."},"newOrderPicker:msg:noOperations":function(n){return"Wybrane zlecenie nie ma zdefiniowanych żadnych operacji.<br>Możesz ręcznie wpisać czterocyfrowy nr operacji."},"newOrderPicker:online:info:no":function(n){return"Wpisz numer zlecenia i wybierz z listy operację, aby rozpocząć nowe zlecenie."},"newOrderPicker:online:info:nc12":function(n){return"Wpisz 12NC zlecenia i wybierz z listy operację, aby rozpocząć nowe zlecenie."},"newOrderPicker:offline:warning:no":function(n){return"Wpisz numer zlecenia oraz numer operacji aby rozpocząć nowe zlecenie."},"newOrderPicker:offline:warning:nc12":function(n){return"Wpisz 12NC zlecenia oraz numer operacji aby rozpocząć nowe zlecenie."},"newOrderPicker:checkData:warning":function(n){return"Wybranie nowego zlecenia ukończy aktualnie wybrane zlecenie. Sprawdź czy pola <em>Ilość wykonana</em> i <em>Osoby pracujące</em> aktualnego zlecenia mają prawidłowe wartości, gdyż po wybraniu nowego zlecenia nie będzie można ich zmienić."},"newOrderPicker:quantityDone":function(n){return"Ilość wykonana w kończonym zleceniu:"},"newOrderPicker:workerCount":function(n){return"Osoby pracujące przy kończonym zleceniu:"},"newOrderPicker:newWorkerCount":function(n){return"Ilość osób:"},"newOrderPicker:spigot:nc12":function(n){return"12NC komponentu Spigot"},"newOrderPicker:spigot:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"newOrderPicker:spigot:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"error:min":function(n){return"Wartość nie może być mniejsza niż "+e.v(n,"min")+"."},"error:max":function(n){return"Wartość nie może być większa niż "+e.v(n,"max")+"."},"downtimePicker:title:start":function(n){return"Rozpoczynanie przestoju"},"downtimePicker:title:edit":function(n){return"Poprawianie przestoju"},"downtimePicker:submit:start":function(n){return"Rozpocznij przestój"},"downtimePicker:submit:edit":function(n){return"Popraw przestój"},"downtimePicker:cancel":function(n){return"Anuluj"},"downtimePicker:reason:label":function(n){return"Powód przestoju:"},"downtimePicker:reason:placeholder":function(n){return"Wybierz powód przestoju..."},"downtimePicker:reasonFilter:placeholder":function(n){return"Powód przestoju..."},"downtimePicker:reasonComment:label":function(n){return"Komentarz:"},"downtimePicker:reasonComment:placeholder":function(n){return"Opcjonalne, dodatkowe informacje..."},"downtimePicker:aor:label":function(n){return"Obszar odpowiedzialności:"},"downtimePicker:aor:placeholder":function(n){return"Wybierz obszar odpowiedzialności..."},"downtimePicker:aorFilter:placeholder":function(n){return"Obszar odpowiedzialności..."},"downtimePicker:msg:emptyReason":function(n){return"Powód przestoju jest wymagany."},"downtimePicker:msg:emptyAor":function(n){return"Obszar odpowiedzialności jest wymagany."},"downtimePicker:startedAt":function(n){return"Czas rozpoczęcia"},"downtimePicker:startedAt:now":function(n){return"Teraz"},"prodDowntime:time":function(n){return"Czas"},"prodDowntime:reason":function(n){return"Powód przestoju"},"prodDowntime:aor":function(n){return"Obszar odpowiedzialności"},"endDowntimeDialog:title":function(n){return"Potwierdzenie zakończenia przestoju"},"endDowntimeDialog:message":function(n){return"<p>Czy na pewno chcesz zakończyć aktualny przestój?</p>"},"endDowntimeDialog:yes":function(n){return"Zakończ przestój"},"endDowntimeDialog:no":function(n){return"Nie kończ przestoju"},"continueOrderDialog:title":function(n){return"Potwierdzenie kontynuacji zlecenia"},"continueOrderDialog:message":function(n){return"<p>Czy na pewno chcesz rozpocząć aktualnie wybrane zlecenie?</p>"},"continueOrderDialog:yes":function(n){return"Kontynuuj zlecenie"},"continueOrderDialog:no":function(n){return"Nie kontynuuj zlecenia"},"endWorkDialog:title":function(n){return"Potwierdzenie zakończenia pracy"},"endWorkDialog:warning":function(n){return"Zakończenie pracy ukończy "+e.s(n,"downtime",{true:"aktualnie wybrany przestój i zlecenie",other:"aktualnie wybrane zlecenie"})+". Sprawdź czy poniższe pola mają prawidłowe wartości, gdyż po zakończeniu pracy nie będzie można ich zmienić."},"endWorkDialog:quantitiesDone":function(n){return"Wykonana ilość w przedziale godzinowym "+e.v(n,"hourRange")+":"},"endWorkDialog:quantityDone":function(n){return"Wykonana ilość aktualnego zlecenia:"},"endWorkDialog:workerCount":function(n){return"Osoby pracujące przy aktualnym zleceniu:"},"endWorkDialog:yes":function(n){return"Zakończ pracę"},"endWorkDialog:no":function(n){return"Anuluj"},"endWorkDialog:spigot:nc12":function(n){return"12NC komponentu Spigot"},"endWorkDialog:spigot:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"endWorkDialog:spigot:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"propertyEditorDialog:title:quantityDone":function(n){return"Ustawianie ilości wykonanej"},"propertyEditorDialog:label:quantityDone":function(n){return"Ilość wykonana w zleceniu"},"propertyEditorDialog:title:workerCount":function(n){return"Ustawianie ilości osób pracujących"},"propertyEditorDialog:label:workerCount":function(n){return"Ilość osób pracujących przy zleceniu"},"propertyEditorDialog:yes":function(n){return"Ustaw ilość"},"propertyEditorDialog:no":function(n){return"Anuluj"},"unload:downtime":function(n){return"Czy na pewno chcesz zamknąć przeglądarkę pozostawiając linię produkcyjną w stanie przestoju?\n\nJeżeli zamkniesz przeglądarkę nie wciskając przycisku Koniec pracy, to czas trwania przestoju będzie się naliczał do końca zmiany!"},"unload:order":function(n){return"Czy na pewno chcesz zamknąć przeglądarkę pozostawiając linię produkcyjną w stanie wykonywania zlecenia?\n\nJeżeli zamkniesz przeglądarkę nie wciskając przycisku Koniec pracy, to czas trwania zlecenia będzie się naliczał do końca zmiany!"},"isa:header":function(n){return"Pole odkładcze"},"isa:pickup":function(n){return"Odbiór<br>palety"},"isa:deliver":function(n){return"Dostawa<br>palety"},"isa:deliver:specific":function(n){return"Dostawa <span class='production-isa-selectedQty'>"+e.v(n,"qty")+"x</span><span class='production-isa-selectedPalletKind'>"+e.v(n,"palletKind")+"</span>"},"isa:deliver:title":function(n){return"Dostawa palety"},"isa:deliver:qty":function(n){return"Ilość palet"},"isa:deliver:palletKind":function(n){return"Rodzaj palety"},"isa:deliver:submit":function(n){return"Dostawa palety"},"isa:deliver:cancel":function(n){return"Anuluj"},"isa:cancel:title":function(n){return"Potwierdzenie anulowania żądania"},"isa:cancel:message":function(n){return"<p>Czy na pewno chcesz anulować wybrane żądanie "+e.s(n,"requestType",{delivery:"dostawy palety",other:"odbioru palety"})+"?</p>"},"isa:cancel:yes":function(n){return"Anuluj żądanie"},"isa:cancel:no":function(n){return"Pozostaw aktywne"},"isa:status:idle":function(n){return"Brak żądania"},"isa:status:new":function(n){return"Oczekiwanie na przyjęcie żądania"},"isa:status:accepted":function(n){return"Żądanie w realizacji"},"spigotChecker:title":function(n){return"Sprawdzanie komponentu Spigot"},"spigotChecker:name:label":function(n){return"Nazwa komponentu:"},"spigotChecker:nc12:label":function(n){return"12NC komponentu:"},"spigotChecker:nc12:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"spigotChecker:nc12:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"spigotChecker:submit":function(n){return"Sprawdź komponent"},"spigotChecker:success":function(n){return"Zeskanowano prawidłowy komponent :)"},"autoDowntimes:remainingTime":function(n){return"rozpocznie się za "+e.v(n,"time")},"snMessage:scannedValue":function(n){return"Zeskanowana wartość"},"snMessage:orderNo":function(n){return"Zlecenie"},"snMessage:serialNo":function(n){return"Numer"},"snMessage:UNKNOWN_CODE":function(n){return"Zeskanowany kod nie zawiera numeru seryjnego."},"snMessage:INVALID_LINE":function(n){return"Nieprawidłowa linia produkcyjna."},"snMessage:INVALID_LINE_STATE":function(n){return"Nieprawidłowa zmiana produkcyjna lub zlecenie."},"snMessage:INVALID_STATE:idle":function(n){return"Rozpocznij zlecenie, aby móc skanować numery seryjne."},"snMessage:INVALID_STATE:downtime":function(n){return"Zakończ przestój, aby móc skanować numery seryjne."},"snMessage:INVALID_ORDER":function(n){return"Zeskanowano numer seryjny z nieprawidłowego zlecenia."},"snMessage:ALREADY_USED":function(n){return"Zeskanowany numer seryjny został już użyty."},"snMessage:CHECKING":function(n){return"<span class='fa fa-spinner fa-spin'></span><br>Sprawdzanie numeru seryjnego..."},"snMessage:SERVER_FAILURE":function(n){return"Błąd podczas sprawdzania numeru seryjnego."},"snMessage:SHIFT_NOT_FOUND":function(n){return"Nie znaleziono zmiany z linii."},"snMessage:ORDER_NOT_FOUND":function(n){return"Nie znaleziono zlecenia z linii."},"snMessage:STANDARD_LABEL":function(n){return"Nie można używać wirtualnego numeru seryjnego w tym zleceniu."},"snMessage:SUCCESS":function(n){return"Numer seryjny został pomyślnie zarejestrowany."},"taktTime:check:button":function(n){return"Sprawdź<br>numer seryjny"},"taktTime:check:title":function(n){return"Sprawdzanie nr seryjnych"},"taktTime:check:orderNo":function(n){return"Nr zlecenia"},"taktTime:check:serialNo":function(n){return"Nr sztuki"},"taktTime:check:submit":function(n){return"Sprawdź nr seryjny"},"taktTime:check:list":function(n){return"Pokaż listę nr seryjnych"},"taktTime:check:help":function(n){return"Podaj nr zlecenia oraz nr sztuki składające się na nr seryjny, który chcesz sprawdzić. Nr seryjny do sprawdzenia możesz także zeskanować."},"taktTime:check:checking":function(n){return"<i class='fa fa-spinner fa-spin'></i> Sprawdzanie nr seryjnego..."},"taktTime:check:local":function(n){return"Dany nr seryjny został zeskanowany na tej linii produkcyjnej."},"taktTime:check:remote":function(n){return"Dany nr seryjny został już zeskanowany na linii produkcyjnej: "+e.v(n,"prodLine")},"taktTime:check:notFound":function(n){return"Dany nr seryjny nie był jeszcze zeskanowany."},"taktTime:list:title":function(n){return"Lista zeskanowanych nr seryjnych"},"bomChecker:title":function(n){return"Sprawdzanie komponentów dla "+e.v(n,"psn")},"bomChecker:message:todo":function(n){return"Zeskanuj etykietę komponentu."},"bomChecker:message:checking":function(n){return"Sprawdzanie komponentu..."},"bomChecker:message:success":function(n){return"Prawidłowy komponent!"},"bomChecker:message:failure":function(n){return"Nie udało się sprawdzić komponentu."},"bomChecker:message:nc12":function(n){return"Niepasujące 12NC: "+e.v(n,"nc12")},"bomChecker:message:used":function(n){return"Kod wykorzystany w: "+e.v(n,"psn")},"snMessage:BOM_CHECKER:NO_ORDER":function(n){return"Wymagany kod komponentu a nie zlecenia."},"snMessage:BOM_CHECKER:NO_MATCH":function(n){return"Kod nie pasuje do żadnego z komponentów."},"settings:tab:operator":function(n){return"Formatka operatora"},"settings:tab:downtimes":function(n){return"Przestoje"},"settings:tab:spigot":function(n){return"Sprawdzanie Spigota"},"settings:tab:bomChecker":function(n){return"Sprawdzanie komponentów"},"settings:tab:taktTime":function(n){return"Takt Time"},"settings:initialDowntimeWindow":function(n){return"Czas na rozpoczęcie początkowego przestoju na zmianie [min]"},"settings:rearmDowntimeReason":function(n){return"Przestój ze sprawdzaniem Spigota"},"settings:spigotLines":function(n){return"Linie ze sprawdzaniem Spigota"},"settings:spigotPatterns":function(n){return"Wybierz komponent Spigot pasujący do jednego z poniższych wzorców"},"settings:spigotNotPatterns":function(n){return"Zignoruj wybrany komponent, jeżeli pasuje do jednego z poniższych wzorców"},"settings:spigotFinish":function(n){return"Wymuś sprawdzanie Spigota na koniec zlecenia"},"settings:spigotGroups":function(n){return"Grupy 12NC"},"settings:taktTime:enabled":function(n){return"Skanowanie numerów seryjnych"},"settings:taktTime:ignoredLines":function(n){return"Wyłącz skanowanie na następujących liniach:"},"settings:taktTime:ignoredDowntimes":function(n){return"Ignoruj czas trwania następujących przestojów:"},"settings:taktTime:last":function(n){return"Pokazuj czas cyklu dla ostatniej sztuki"},"settings:taktTime:avg":function(n){return"Pokazuj średni czas cyklu dla aktualnego zlecenia"},"settings:taktTime:sap":function(n){return"Pokazuj czas taktu SAP dla aktualnego zlecenia"},"settings:taktTime:smiley":function(n){return"Pokazuj buźkę"},"settings:taktTime:coeffs":function(n){return"Współczynniki operacji"},"settings:taktTime:coeffs:help":function(n){return"W każdej linii należy podać MRP zlecenia, dla którego współczynniki Takt Time mają być zmienione, a następnie WorkCenter operacji i wartości współczynników. W miejsce MRP i WorkCenter można użyć znaku <code>*</code> (wszystkie). Na przykład:<br><code class=multiline>*: *=1.053 PIVATIC5=0.9<br>KE6: *=1 OUTDOOR5=1.1</code>"},"settings:lineAutoDowntimes":function(n){return"Automatyczne przestoje"},"settings:lineAutoDowntimes:groups:placeholder":function(n){return"Wybierz istniejącą grupę linii, aby zmienić automatyczne przestoje."},"settings:lineAutoDowntimes:groups:label":function(n){return"Grupy automatycznych przestojów"},"settings:lineAutoDowntimes:group:label":function(n){return"Nazwa grupy"},"settings:lineAutoDowntimes:reasons:placeholder":function(n){return"Wybierz nowy automatyczny przestój"},"settings:lineAutoDowntimes:lines:label":function(n){return"Linie produkcyjne w grupie"},"settings:lineAutoDowntimes:reason":function(n){return"Automatyczny powód przestoju"},"settings:lineAutoDowntimes:init":function(n){return"Inicjalizacja"},"settings:lineAutoDowntimes:when:initial":function(n){return"na początku zmiany"},"settings:lineAutoDowntimes:when:always":function(n){return"zawsze"},"settings:lineAutoDowntimes:when:time":function(n){return"o godzinie:"}}});