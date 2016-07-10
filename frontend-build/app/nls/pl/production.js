define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,i,t){return e.c(n,r),n[r]in t?t[n[r]]:(r=e.lc[i](n[r]-o),r in t?t[r]:t.other)},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{"breadcrumbs:base":function(n){return"Produkcja"},"breadcrumbs:settings":function(n){return"Ustawienia"},"duplicate:title":function(n){return"Podwójne uruchomienie formatki"},"duplicate:message":function(n){return"Wykryto podwójne uruchomienie przeglądarki z formatką operatora.<br>Zamknij wszystkie inne formatki i wciśnij poniższy przycisk, aby ponownie załadować formatkę w tym oknie."},"duplicate:button":function(n){return"Przeładuj formatkę"},"msg:shiftChange":function(n){return"Nowa zmiana!"},"msg:locked":function(n){return"Linia produkcyjna została dezaktywowana!"},"controls:dashboard":function(n){return"Przejdź do dashboardu"},"controls:lock":function(n){return"Zablokuj edycję"},"controls:unlock":function(n){return"Aktywuj edycję"},"controls:locked":function(n){return"Edycja zablokowana"},"controls:unlocked":function(n){return"Edycja aktywna"},"controls:sync":function(n){return"Wskaźnik komunikacji z serwerem"},"controls:addSuggestion":function(n){return"Zgłoś sugestię"},"controls:msg:sync:noConnection":function(n){return"Nie można aktywować edycji: brak połączenia z serwerem :("},"controls:msg:sync:remoteError":function(n){return"Nie można aktywować edycji: nieudane pobranie klucza :("},"controls:msg:sync:success":function(n){return"Pomyślnie aktywowano edycję :)"},"controls:msg:popup":function(n){return"Wyskakujące okienko zostało zablokowane :("},"unlockDialog:title:unlock":function(n){return"Aktywacja linii produkcyjnej"},"unlockDialog:title:lock":function(n){return"Dezaktywacja linii produkcyjnej"},"unlockDialog:message:unlock":function(n){return"Aby aktywować linię produkcyjną <em>"+e.v(n,"prodLine")+"</em> na tym komputerze, podaj login i hasło użytkownika z uprawnieniem <em>Aktywacja klienta Operator WMES</em>. Linii nie będzie można aktywować, jeżeli jest w tym momencie podłączona do serwera na innym komputerze."},"unlockDialog:message:lock":function(n){return"Aby dezaktywować linię produkcyjną <em>"+e.v(n,"prodLine")+"</em> na tym komputerze, podaj login i hasło użytkownika z uprawnieniem <em>Aktywacja klienta Operator WMES</em>."},"unlockDialog:login":function(n){return"Login"},"unlockDialog:password":function(n){return"Hasło"},"unlockDialog:unlock":function(n){return"Aktywuj linię produkcyjną"},"unlockDialog:lock":function(n){return"Dezaktywuj linię produkcyjną"},"unlockDialog:error:UNLOCK_FAILURE":function(n){return"Nie udało się aktywować linii produkcyjnej :("},"unlockDialog:error:LOCK_FAILURE":function(n){return"Nie udało się dezaktywować linii produkcyjnej :("},"unlockDialog:error:INVALID_PROD_LINE":function(n){return"Nieprawidłowa linia produkcyjna!"},"unlockDialog:error:INVALID_LOGIN":function(n){return"Nieprawidłowy login!"},"unlockDialog:error:INVALID_PASSWORD":function(n){return"Nieprawidłowe hasło!"},"unlockDialog:error:NO_PRIVILEGES":function(n){return"Brak wymaganych uprawnień!"},"unlockDialog:error:ALREADY_UNLOCKED":function(n){return"Linia produkcyjna jest aktualnie uruchomiona na innym komputerze!"},"unlockDialog:error:DEACTIVATED":function(n){return"Linia produkcyjna jest dezaktywowana!"},"section:data":function(n){return"Dane produkcyjne"},"section:history":function(n){return"Historia"},"section:quantities":function(n){return"Wykonane ilości"},"section:downtimes":function(n){return"Przestoje"},"section:isa":function(n){return"Pole odkładcze"},"property:currentTime":function(n){return"Aktualny czas"},"property:shift":function(n){return"Zmiana"},"property:orgUnit":function(n){return"Dział"},"property:master":function(n){return"Mistrz"},"property:master:change":function(n){return"(zmień)"},"property:master:noData:locked":function(n){return"nie wybrany"},"property:master:noData:unlocked":function(n){return"(wybierz mistrza)"},"property:leader":function(n){return"Lider"},"property:leader:change":function(n){return"(zmień)"},"property:leader:noData:locked":function(n){return"nie wybrany"},"property:leader:noData:unlocked":function(n){return"(wybierz lidera)"},"property:operator":function(n){return"Operator"},"property:operator:change":function(n){return"(zmień)"},"property:operator:noData:locked":function(n){return"nie wybrany"},"property:operator:noData:unlocked":function(n){return"(wybierz operatora)"},"property:orderNo":function(n){return"Nr zlecenia"},"property:orderNo:change":function(n){return"(popraw)"},"property:nc12":function(n){return"12NC"},"property:nc12:change":function(n){return"(popraw)"},"property:productName":function(n){return"Nazwa rodziny/detalu"},"property:operationName":function(n){return"Nazwa operacji"},"property:taktTime":function(n){return"Takt [s]"},"property:workerCountSap":function(n){return"Osoby wg SAP"},"property:createdAt":function(n){return"Czas rozpoczęcia"},"property:quantityDone":function(n){return"Wykonana ilość"},"property:quantityDone:change":function(n){return"(zmień ilość)"},"property:workerCount":function(n){return"Osoby pracujące"},"property:workerCount:change:data":function(n){return"(zmień ilość)"},"property:workerCount:change:noData":function(n){return"(ustaw ilość)"},"action:newOrder":function(n){return"Nowe zlecenie"},"action:continueOrder":function(n){return"Kontynuuj zlecenie"},"action:startDowntime":function(n){return"Przestój"},"action:startBreak":function(n){return"Przerwa"},"action:endDowntime":function(n){return"Koniec przestoju"},"action:endWork":function(n){return"Koniec pracy"},"action:emptyPallet":function(n){return"Pusta paleta"},"action:fullPallet":function(n){return"Paleta"},"quantities:column:time":function(n){return"Godzina"},"quantities:column:planned":function(n){return"Plan"},"quantities:column:actual":function(n){return"Wykonane"},"quantities:unit":function(n){return"szt."},"quantities:change":function(n){return"(zmień)"},"quantities:newValuePlaceholder":function(n){return"Nowa ilość..."},"quantityEditor:title":function(n){return"Wykonana ilość w przedziale godzinowym"},"quantityEditor:label":function(n){return"Ilość wykonana od "+e.v(n,"from")+" do "+e.v(n,"to")+":"},"quantityEditor:submit":function(n){return"Ustaw ilość"},"quantityEditor:cancel":function(n){return"Anuluj ustawianie"},"personelPicker:title:master":function(n){return"Wybieranie mistrza"},"personelPicker:title:leader":function(n){return"Wybieranie lidera"},"personelPicker:title:operator":function(n){return"Wybieranie operatora"},"personelPicker:submit":function(n){return"Wybierz użytkownika"},"personelPicker:cancel":function(n){return"Anuluj wybieranie"},"personelPicker:online:label":function(n){return"Użytkownik:"},"personelPicker:online:placeholder":function(n){return"Szukaj po numerze kadrowym lub nazwisku"},"personelPicker:offline:label":function(n){return"Użytkownik:"},"personelPicker:offline:placeholder":function(n){return"Numer kadrowy użytkownika"},"personelPicker:offline:warning":function(n){return"Brak połączenia z serwerem. Możesz tylko wpisać numer kadrowy użytkownika."},"newOrderPicker:title":function(n){return"Rozpoczynanie nowego zlecenia"},"newOrderPicker:title:replacing":function(n){return"Kończenie aktualnego zlecenia"},"newOrderPicker:title:correcting":function(n){return"Poprawianie aktualnego zlecenia"},"newOrderPicker:order:label":function(n){return"Nowe zlecenie:"},"newOrderPicker:order:placeholder:no":function(n){return"Wpisz numer nowego zlecenia..."},"newOrderPicker:order:placeholder:nc12":function(n){return"12NC zlecenia"},"newOrderPicker:operation:label":function(n){return"Operacja:"},"newOrderPicker:offline:operation:placeholder":function(n){return"Numer operacji"},"newOrderPicker:online:operation:placeholder":function(n){return"Wybierz operację nowego zlecenia..."},"newOrderPicker:submit":function(n){return"Rozpocznij nowe zlecenie"},"newOrderPicker:submit:replacing":function(n){return"Zakończ aktualne zlecenie i rozpocznij nowe"},"newOrderPicker:submit:correcting":function(n){return"Popraw aktualne zlecenie"},"newOrderPicker:cancel":function(n){return"Anuluj"},"newOrderPicker:msg:invalidOrderId:no":function(n){return"Nieprawidłowy numer zlecenia :("},"newOrderPicker:msg:invalidOrderId:nc12":function(n){return"Nieprawidłowe 12NC zlecenia :("},"newOrderPicker:msg:invalidOperationNo":function(n){return"Nieprawidłowy numer operacji :("},"newOrderPicker:msg:searchFailure":function(n){return"Wyszukiwanie zlecenia nie powiodło się :("},"newOrderPicker:msg:emptyOrder":function(n){return"Zlecenie jest wymagane."},"newOrderPicker:msg:emptyOperation":function(n){return"Operacja jest wymagana."},"newOrderPicker:msg:noOperations":function(n){return"Wybrane zlecenie nie ma zdefiniowanych żadnych operacji.<br>Możesz ręcznie wpisać czterocyfrowy nr operacji."},"newOrderPicker:online:info:no":function(n){return"Wpisz numer zlecenia i wybierz z listy operację aby rozpocząć nowe zlecenie."},"newOrderPicker:online:info:nc12":function(n){return"Wpisz 12NC zlecenia i wybierz z listy operację aby rozpocząć nowe zlecenie."},"newOrderPicker:offline:warning:no":function(n){return"Wpisz numer zlecenia oraz numer operacji aby rozpocząć nowe zlecenie."},"newOrderPicker:offline:warning:nc12":function(n){return"Wpisz 12NC zlecenia oraz numer operacji aby rozpocząć nowe zlecenie."},"newOrderPicker:checkData:warning":function(n){return"Wybranie nowego zlecenia ukończy aktualnie wybrane zlecenie. Sprawdź czy pola <em>Ilość wykonana</em> i <em>Osoby pracujące</em> aktualnego zlecenia mają prawidłowe wartości, gdyż po wybraniu nowego zlecenia nie będzie można ich zmienić."},"newOrderPicker:quantityDone":function(n){return"Ilość wykonana w kończonym zleceniu:"},"newOrderPicker:workerCount":function(n){return"Osoby pracujące przy kończonym zleceniu:"},"newOrderPicker:spigot:nc12":function(n){return"12NC komponentu Spigot"},"newOrderPicker:spigot:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"newOrderPicker:spigot:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"downtimePicker:title:start":function(n){return"Rozpoczynanie przestoju"},"downtimePicker:title:edit":function(n){return"Poprawianie przestoju"},"downtimePicker:submit:start":function(n){return"Rozpocznij przestój"},"downtimePicker:submit:edit":function(n){return"Popraw przestój"},"downtimePicker:cancel":function(n){return"Anuluj"},"downtimePicker:reason:label":function(n){return"Powód przestoju:"},"downtimePicker:reason:placeholder":function(n){return"Wybierz powód przestoju..."},"downtimePicker:reasonComment:label":function(n){return"Komentarz:"},"downtimePicker:reasonComment:placeholder":function(n){return"Opcjonalne, dodatkowe informacje..."},"downtimePicker:aor:label":function(n){return"Obszar odpowiedzialności:"},"downtimePicker:aor:placeholder":function(n){return"Wybierz obszar odpowiedzialności..."},"downtimePicker:msg:emptyReason":function(n){return"Powód przestoju jest wymagany."},"downtimePicker:msg:emptyAor":function(n){return"Obszar odpowiedzialności jest wymagany."},"downtimePicker:startedAt":function(n){return"Czas rozpoczęcia"},"downtimePicker:startedAt:now":function(n){return"Teraz"},"prodDowntime:time":function(n){return"Czas"},"prodDowntime:reason":function(n){return"Powód przestoju"},"prodDowntime:aor":function(n){return"Obszar odpowiedzialności"},"endDowntimeDialog:title":function(n){return"Potwierdzenie zakończenia przestoju"},"endDowntimeDialog:message":function(n){return"<p>Czy na pewno chcesz zakończyć aktualny przestój?</p>"},"endDowntimeDialog:yes":function(n){return"Zakończ przestój"},"endDowntimeDialog:no":function(n){return"Nie kończ przestoju"},"continueOrderDialog:title":function(n){return"Potwierdzenie kontynuacji zlecenia"},"continueOrderDialog:message":function(n){return"<p>Czy na pewno chcesz rozpocząć aktualnie wybrane zlecenie?</p>"},"continueOrderDialog:yes":function(n){return"Kontynuuj zlecenie"},"continueOrderDialog:no":function(n){return"Nie kontynuuj zlecenia"},"endWorkDialog:title":function(n){return"Potwierdzenie zakończenia pracy"},"endWorkDialog:warning":function(n){return"Zakończenie pracy ukończy "+e.s(n,"downtime",{"true":"aktualnie wybrany przestój i zlecenie",other:"aktualnie wybrane zlecenie"})+". Sprawdź czy poniższe pola mają prawidłowe wartości, gdyż po zakończeniu pracy nie będzie można ich zmienić."},"endWorkDialog:quantitiesDone":function(n){return"Wykonana ilość w przedziale godzinowym "+e.v(n,"hourRange")+":"},"endWorkDialog:quantityDone":function(n){return"Wykonana ilość aktualnego zlecenia:"},"endWorkDialog:workerCount":function(n){return"Osoby pracujące przy aktualnym zleceniu:"},"endWorkDialog:yes":function(n){return"Zakończ pracę"},"endWorkDialog:no":function(n){return"Anuluj"},"endWorkDialog:spigot:nc12":function(n){return"12NC komponentu Spigot"},"endWorkDialog:spigot:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"endWorkDialog:spigot:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"unload:downtime":function(n){return"Czy na pewno chcesz zamknąć przeglądarkę pozostawiając linię produkcyjną w stanie przestoju?\n\nJeżeli zamkniesz przeglądarkę nie wciskając przycisku Koniec pracy, to czas trwania przestoju będzie się naliczał do końca zmiany!"},"unload:order":function(n){return"Czy na pewno chcesz zamknąć przeglądarkę pozostawiając linię produkcyjną w stanie wykonywania zlecenia?\n\nJeżeli zamkniesz przeglądarkę nie wciskając przycisku Koniec pracy, to czas trwania zlecenia będzie się naliczał do końca zmiany!"},"isa:header":function(n){return"Pole odkładcze"},"isa:pickup":function(n){return"Odbiór<br>palety"},"isa:deliver":function(n){return"Dostawa<br>palety"},"isa:deliver:specific":function(n){return"Dostawa<span class='production-isa-selectedPalletKind'>"+e.v(n,"palletKind")+"</span>"},"isa:cancel:title":function(n){return"Potwierdzenie anulowania żądania"},"isa:cancel:message":function(n){return"<p>Czy na pewno chcesz anulować wybrane żądanie "+e.s(n,"requestType",{delivery:"dostawy palety",other:"odbioru palety"})+"?</p>"},"isa:cancel:yes":function(n){return"Anuluj żądanie"},"isa:cancel:no":function(n){return"Pozostaw aktywne"},"spigotChecker:title":function(n){return"Sprawdzanie komponentu Spigot"},"spigotChecker:name:label":function(n){return"Nazwa komponentu:"},"spigotChecker:nc12:label":function(n){return"12NC komponentu:"},"spigotChecker:nc12:placeholder":function(n){return"Zeskanuj kod kreskowy komponentu..."},"spigotChecker:nc12:invalid":function(n){return"Nieprawidłowe 12NC komponentu!"},"spigotChecker:submit":function(n){return"Sprawdź komponent"},"spigotChecker:success":function(n){return"Zeskanowano prawidłowy komponent :)"},"settings:tab:operator":function(n){return"Formatka operatora"},"settings:tab:downtimes":function(n){return"Przestoje"},"settings:tab:spigot":function(n){return"Sprawdzanie Spigota"},"settings:initialDowntimeWindow":function(n){return"Czas na rozpoczęcie początkowego przestoju na zmianie [min]"},"settings:rearmDowntimeReason":function(n){return"Przestój ze sprawdzaniem Spigota"},"settings:spigotLines":function(n){return"Linie ze sprawdzaniem Spigota"},"settings:spigotPatterns":function(n){return"Wzorce komponentów Spigot"},"settings:spigotFinish":function(n){return"Wymuś sprawdzanie Spigota na koniec zlecenia"}}});