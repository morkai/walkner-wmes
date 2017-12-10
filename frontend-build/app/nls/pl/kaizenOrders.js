define(["app/nls/locale/pl"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,r){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(r||0)},v:function(e,r){return n.c(e,r),e[r]},p:function(e,r,t,i,o){return n.c(e,r),e[r]in o?o[e[r]]:(r=n.lc[i](e[r]-t),r in o?o[r]:o.other)},s:function(e,r,t){return n.c(e,r),e[r]in t?t[e[r]]:t.other}};return{"BREADCRUMBS:base":function(e){return"ZPW"},"BREADCRUMBS:browse":function(e){return"Zgłoszenia"},"BREADCRUMBS:addForm":function(e){return"Dodawanie"},"BREADCRUMBS:editForm":function(e){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Usuwanie"},"BREADCRUMBS:reports:count":function(e){return"Ilość zgłoszeń"},"BREADCRUMBS:reports:summary":function(e){return"Zestawienie informacji"},"MSG:LOADING_FAILURE":function(e){return"Ładowanie zgłoszeń nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Ładowanie zgłoszenia nie powiodło się."},"MSG:DELETED":function(e){return"Zgłoszenie <em>"+n.v(e,"label")+"</em> zostało usunięte."},"MSG:jump:404":function(e){return"Nie znaleziono zgłoszenia o ID <em>"+n.v(e,"rid")+"</em>."},"MSG:markAsSeen:failure":function(e){return"Nie udało się oznaczyć zgłoszenia jako przeczytane."},"MSG:observe:failure":function(e){return"Nie udało się rozpocząć obserwacji zgłoszenia."},"MSG:unobserve:failure":function(e){return"Nie udało się zakończyć obserwacji zgłoszenia."},"MSG:comment:failure":function(e){return"Nie udało się skomentować zgłoszenia."},"PAGE_ACTION:export":function(e){return"Eksportuj zgłoszenia"},"PAGE_ACTION:add":function(e){return"Dodaj zgłoszenie"},"PAGE_ACTION:edit":function(e){return"Edytuj zgłoszenie"},"PAGE_ACTION:delete":function(e){return"Usuń zgłoszenie"},"PAGE_ACTION:markAsSeen":function(e){return"Oznacz jako przeczytane"},"PAGE_ACTION:observe":function(e){return"Obserwuj zgłoszenie"},"PAGE_ACTION:unobserve":function(e){return"Przestań obserwować"},"PAGE_ACTION:jump:title":function(e){return"Skocz do zgłoszenia po ID"},"PAGE_ACTION:jump:placeholder":function(e){return"ID zgłoszenia"},"PANEL:TITLE:details":function(e){return"Szczegóły zgłoszenia"},"PANEL:TITLE:changes":function(e){return"Historia zmian zgłoszenia"},"PANEL:TITLE:addForm":function(e){return"Formularz dodawania zgłoszenia"},"PANEL:TITLE:editForm":function(e){return"Formularz edycji zgłoszenia"},"LIST:owners":function(e){return n.v(e,"first")+" +"+n.p(e,"count",0,"pl",{one:"1 inna",other:n.v(e,"count")+" inne"})},"PROPERTY:rid":function(e){return"ID"},"PROPERTY:types":function(e){return"Rodzaj"},"PROPERTY:subject":function(e){return"Temat zgłoszenia"},"PROPERTY:subjectAndDescription":function(e){return"Temat/opis zgłoszenia"},"PROPERTY:eventDate":function(e){return"Czas zdarzenia"},"PROPERTY:eventDate:short":function(e){return"YY-MM-DD[, godz. ] H."},"PROPERTY:eventDate:long":function(e){return"LL[, godz. ] H."},"PROPERTY:area":function(e){return"Miejsce zdarzenia"},"PROPERTY:cause":function(e){return"Kategoria przyczyny"},"PROPERTY:causeText":function(e){return"Przyczyna wystąpienia zdarzenia"},"PROPERTY:risk":function(e){return"Rodzaj ryzyka"},"PROPERTY:category":function(e){return"Kategoria"},"PROPERTY:section":function(e){return"Dział zgłaszający"},"PROPERTY:nearMissCategory":function(e){return"Kategoria zdarzenia"},"PROPERTY:suggestionCategory":function(e){return"Kategoria sugestii"},"PROPERTY:description":function(e){return"Opis zdarzenia (jak jest)"},"PROPERTY:nearMissOwners":function(e){return"Osoby zgłaszające"},"PROPERTY:nearMissOwner":function(e){return"Osoba zgłaszająca"},"PROPERTY:suggestionOwners":function(e){return"Osoby sugerujące"},"PROPERTY:kaizenOwners":function(e){return"Osoby realizujące"},"PROPERTY:correctiveMeasures":function(e){return"Podjęte działania korekcyjne (gaszenie pożaru)"},"PROPERTY:preventiveMeasures":function(e){return"Podjęte działania korygujące"},"PROPERTY:suggestion":function(e){return"Propozycja działań korygujących (jak ma być)"},"PROPERTY:kaizenStartDate":function(e){return"Data rozpoczęcia realizacji"},"PROPERTY:kaizenFinishDate":function(e){return"Data zakończenia realizacji"},"PROPERTY:kaizenDuration":function(e){return"Czas realizacji"},"PROPERTY:kaizenImprovements":function(e){return"Wdrożone usprawnienia"},"PROPERTY:kaizenEffect":function(e){return"Efekt usprawnień"},"PROPERTY:status":function(e){return"Status"},"PROPERTY:creator":function(e){return"Stworzone przez"},"PROPERTY:updater":function(e){return"Ostatnio zmienione przez"},"PROPERTY:confirmer":function(e){return"Osoba zatwierdzająca"},"PROPERTY:createdAt":function(e){return"Czas stworzenia"},"PROPERTY:updatedAt":function(e){return"Czas ostatniej zmiany"},"PROPERTY:confirmedAt":function(e){return"Czas potwierdzenia"},"PROPERTY:attachments":function(e){return"Załączniki"},"PROPERTY:attachments:description":function(e){return"Opis"},"PROPERTY:attachments:file":function(e){return"Nazwa pliku"},"PROPERTY:attachments:type":function(e){return"Typ pliku"},"PROPERTY:comment":function(e){return"Komentarz/opinia"},"PROPERTY:subscribers":function(e){return"Obserwatorzy zgłoszenia"},"PROPERTY:observers:name":function(e){return"Imię i nazwisko"},"PROPERTY:observers:role":function(e){return"Rola"},"PROPERTY:observers:lastSeenAt":function(e){return"Ostatnio widziany"},"type:nearMiss":function(e){return"Zdarzenie Potencjalnie Wypadkowe"},"type:suggestion":function(e){return"Sugestia"},"type:kaizen":function(e){return"Kaizen"},"type:short:nearMiss":function(e){return"ZPW"},"type:short:suggestion":function(e){return"Sugestia"},"type:short:kaizen":function(e){return"Kaizen"},"type:label:nearMiss":function(e){return"ZPW"},"type:label:suggestion":function(e){return"SUG"},"type:label:kaizen":function(e){return"KZN"},"status:new":function(e){return"Nowe"},"status:accepted":function(e){return"Zaakceptowane"},"status:todo":function(e){return"Do realizacji"},"status:inProgress":function(e){return"W realizacji"},"status:cancelled":function(e){return"Anulowane"},"status:finished":function(e){return"Zakończone"},"status:paused":function(e){return"Wstrzymane"},"status:open":function(e){return"Otwarte"},"role:creator":function(e){return"Zgłaszający"},"role:confirmer":function(e){return"Zatwierdzający"},"role:owner":function(e){return"Właściciel"},"role:subscriber":function(e){return"Obserwator"},"tab:attachments":function(e){return"Załączniki zgłoszenia"},"tab:observers":function(e){return"Uczestnicy zgłoszenia"},"attachments:noData":function(e){return"Zgłoszenie nie ma żadnych załączników."},"attachments:actions:view":function(e){return"Otwórz plik"},"attachments:actions:download":function(e){return"Pobierz plik"},"attachments:scan":function(e){return"Skan dokumentu"},"attachments:scan:current":function(e){return"Aktualny skan dokumentu"},"attachments:scan:new":function(e){return"Nowy skan dokumentu"},"attachments:before":function(e){return"Stan przed"},"attachments:before:current":function(e){return"Aktualny skan przed"},"attachments:before:new":function(e){return"Nowy stan przed"},"attachments:after":function(e){return"Stan po"},"attachments:after:current":function(e){return"Aktualny stan po"},"attachments:after:new":function(e){return"Nowy stan po"},"FORM:ACTION:add":function(e){return"Dodaj zgłoszenie"},"FORM:ACTION:edit":function(e){return"Zapisz"},"FORM:backToBoc:cancel":function(e){return"Anuluj i wróć do karty obserwacji"},"FORM:backToBoc:add":function(e){return"Dodaj zgłoszenie i wróć do karty obserwacji"},"FORM:backToBoc:edit":function(e){return"Zapisz i wróć do karty obserwacji"},"FORM:ERROR:addFailure":function(e){return"Nie udało się dodać zgłoszenia."},"FORM:ERROR:editFailure":function(e){return"Nie udało się zmodyfikować zgłoszenia."},"FORM:ERROR:onlyKaizen":function(e){return"Kaizen wymaga ZPW lub Sugestii!"},"FORM:ERROR:upload":function(e){return"Nie udało się załadować załączników."},"FORM:ERROR:date":function(e){return"Podana data nie może się różnić o więcej niż "+n.v(e,"days")+" dni od aktualnej daty."},"FORM:MSG:eventTime":function(e){return"Godzina"},"FORM:MSG:optional":function(e){return"Poniższe pola są opcjonalne. Pozostaw je puste, jeżeli nie wiesz co w nich wpisać."},"FORM:MSG:categories":function(e){return"Jeżeli przyczyną źródłową zdarzenia było niebezpieczne zachowanie przypisz je do odpowiedniej kategorii."},"FORM:MSG:chooseTypes":function(e){return"Wybierz typy zgłoszenia (ZPW, Sugestia, Kaizen) klikając na poniższe belki. Zgłoszenie może mieć w tym samym czasie dowolną kombinację typów."},"FORM:MSG:attachmentEdit":function(e){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać już istniejące pliki."},"FORM:help:subject":function(e){return"Wpisz krótki tekst..."},"FORM:help:section":function(e){return"Wybierz swój dział..."},"FORM:help:confirmer":function(e){return"Wybierz nazwisko przełożonego, w którego obszarze odpowiedzialności stwierdzono zdarzenie..."},"FORM:help:correctiveMeasures":function(e){return"Co zrobiono, aby usunąć <strong>skutek</strong> wystąpienia tego konkretnego zdarzenia."},"FORM:help:preventiveMeasures":function(e){return"Co zrobiono, aby usunąć <strong>przyczynę</strong> występowania podobnych zdarzeń."},"FORM:help:subscribers":function(e){return"W tym polu możesz wybrać dodatkowe osoby, które nie zostały wskazane we wcześniejszych polach, a mogą być zainteresowane tym zgłoszeniem lub chcesz, aby wyraziły swoją opinię.<br>Osoby te zostaną dodane do listy uczestników zgłoszenia z rolą Obserwatora, dzięki czemu będą powiadamiani o zmianach w tym zgłoszeniu."},"FORM:help:date:diff":function(e){return"Wybrano datę będącą "+n.v(e,"days")+" dni w "+n.s(e,"dir",{past:"przeszłości",other:"przyszłości"})+"."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Potwierdzenie usunięcia zgłoszenia"},"ACTION_FORM:BUTTON:delete":function(e){return"Usuń zgłoszenie"},"ACTION_FORM:MESSAGE:delete":function(e){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane zgłoszenie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Czy na pewno chcesz bezpowrotnie usunąć zgłoszenie <em>"+n.v(e,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Nie udało się usunąć zgłoszenia."},"filter:cause":function(e){return"Przyczyna"},"filter:user:mine":function(e){return"Moje"},"filter:user:unseen":function(e){return"Nieprzeczytane"},"filter:user:owner":function(e){return"Zgłaszający"},"filter:user:others":function(e){return"Uczestnik"},"filter:submit":function(e){return"Filtruj"},"history:added":function(e){return"utworzenie zgłoszenia."},"history:observer:0":function(e){return"rozpoczęcie obserwacji zgłoszenia."},"history:observer:1":function(e){return"zakończenie obserwacji zgłoszenia."},"history:editMessage":function(e){return"Tutaj możesz dodać komentarz do zgłoszenia. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+n.v(e,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(e){return"Komentuj"},"report:title:type":function(e){return"Ilość zgłoszeń"},"report:title:status":function(e){return"Ilość zgłoszeń wg statusów"},"report:title:section":function(e){return"Ilość zgłoszeń wg działów"},"report:title:area":function(e){return"Ilość zgłoszeń wg miejsc zdarzeń"},"report:title:cause":function(e){return"Ilość zgłoszeń wg przyczyn"},"report:title:risk":function(e){return"Ilość zgłoszeń wg rodzajów ryzyka"},"report:title:nearMissCategory":function(e){return"Ilość zgłoszeń wg kategorii ZPW"},"report:title:suggestionCategory":function(e){return"Ilość zgłoszeń wg kategorii sugestii"},"report:title:confirmer":function(e){return"Ilość zgłoszeń wg zatwiedzających"},"report:title:owner":function(e){return"Ilość zgłoszeń wg właścicieli"},"report:series:singleTotal":function(e){return"Suma (bez powtórzeń typów)"},"report:series:multiTotal":function(e){return"Suma (z powtórzeniami typów)"},"report:series:entry":function(e){return"Zgłoszenia"},"report:series:nearMiss":function(e){return"ZPW"},"report:series:suggestion":function(e){return"Usprawnienia"},"report:series:kaizen":function(e){return"Kaizeny"},"report:series:new":function(e){return"Nowe"},"report:series:accepted":function(e){return"Zaakceptowane"},"report:series:todo":function(e){return"Do realizacji"},"report:series:inProgress":function(e){return"W realizacji"},"report:series:cancelled":function(e){return"Anulowane"},"report:series:finished":function(e){return"Zakończone"},"report:series:paused":function(e){return"Wstrzymane"},"report:filenames:type":function(e){return"ZPW_IloscWgTypow"},"report:filenames:status":function(e){return"ZPW_IloscWgStatusow"},"report:filenames:section":function(e){return"ZPW_IloscWgDzialow"},"report:filenames:area":function(e){return"ZPW_IloscWgMiejsc"},"report:filenames:cause":function(e){return"ZPW_IloscWgPrzyczyn"},"report:filenames:risk":function(e){return"ZPW_IloscWgRyzyka"},"report:filenames:nearMissCategory":function(e){return"ZPW_IloscWgKatZPW"},"report:filenames:suggestionCategory":function(e){return"ZPW_IloscWgKatSug"},"report:filenames:confirmer":function(e){return"ZPW_IloscWgZatwierdzajacych"},"report:filenames:owner":function(e){return"ZPW_IloscWgWlascicieli"},"report:title:summary:averageDuration":function(e){return"Średnia ilość dni realizacji w poszczególnych tygodniach"},"report:title:summary:count":function(e){return"Ilość zgłoszeń w poszczególnych tygodniach"},"report:title:summary:nearMissOwners":function(e){return"Ilość ZPW zgłoszonych przez pracownika"},"report:subtitle:summary:averageDuration":function(e){return"Całkowita średnia dla wybranego okresu: "+n.v(e,"averageDuration")},"report:subtitle:summary:count":function(e){return"Całkowita ilość zgłoszeń w wybranym okresie: "+n.v(e,"total")+" ("+n.v(e,"open")+" "+n.p(e,"open",0,"pl",{few:"otwarte",one:"otwarte",other:"otwartych"})+", "+n.v(e,"finished")+" "+n.p(e,"finished",0,"pl",{few:"zamknięte",one:"zamknięte",other:"zamkniętych"})+", "+n.v(e,"cancelled")+" "+n.p(e,"cancelled",0,"pl",{few:"anulowane",one:"anulowane",other:"anulowanych"})+")"},"report:series:summary:averageDuration":function(e){return"Średnia ilość dni realizacji"},"report:series:summary:open":function(e){return"Otwarte"},"report:series:summary:finished":function(e){return"Zakończone"},"report:series:summary:cancelled":function(e){return"Anulowane"},"report:filenames:summary:averageDuration":function(e){return"ZPW_SredniaIloscDniRealizacji"},"report:filenames:summary:count":function(e){return"ZPW_IloscWTygodniach"},"report:filenames:summary:nearMissOwners":function(e){return"ZPW_IloscWgPracownikow"},"thanks:message":function(e){return"Dziękujemy za zgłoszenie!"},"thanks:footnote":function(e){return"(kliknij dowolny przycisk lub wciśnij dowolny klawisz, aby zamknąć ten komunikat)"},"BREADCRUMBS:reports:metrics":function(e){return"Wskaźniki"},"report:title:ipr":function(e){return"Wskaźnik IPR wg działów"},"report:title:ips":function(e){return"Wskaźnik IP Structure wg działów"},"report:title:ipc":function(e){return"Wskaźnik IP Coverage wg działów"},"report:title:fte":function(e){return"Średnie dzienne FTE wg działów"},"report:title:count":function(e){return"Ilość zgłoszeń wg działów"},"report:title:users":function(e){return"Ilość użytkowników wg działów"},"report:subtitle:ipr":function(e){return"Całkowity wskaźnik IPR: "+n.v(e,"value")},"report:subtitle:ips":function(e){return"Całkowity wskaźnik IP Structure: "+n.v(e,"value")+"%"},"report:subtitle:ipc":function(e){return"Całkowity wskaźnik IP Coverage: "+n.v(e,"value")+"%"},"report:subtitle:count":function(e){return"Całkowita ilość ZPW: "+n.v(e,"nearMisses")+"; Usprawnień: "+n.v(e,"suggestions")+"; Obserwacji: "+n.v(e,"observations")+"; Minutek: "+n.v(e,"minutes")},"report:subtitle:fte":function(e){return"Całkowite średnie dzienne FTE: "+n.v(e,"value")},"report:subtitle:users":function(e){return"Całkowita ilość użytkowników: "+n.v(e,"value")},"report:series:ipr":function(e){return"IPR"},"report:series:ips":function(e){return"IPS"},"report:series:ipc":function(e){return"IPC"},"report:series:fte":function(e){return"Średnie FTE"},"report:series:observation":function(e){return"Obserwacje zachowań"},"report:series:minutes":function(e){return"Minuty dla Bezpieczeństwa"},"report:series:users":function(e){return"Użytkownicy"},"report:filenames:ipr":function(e){return"ZPW_Wskazniki_IPR"},"report:filenames:ips":function(e){return"ZPW_Wskazniki_IPS"},"report:filenames:ipc":function(e){return"ZPW_Wskazniki_IPC"},"report:filenames:fte":function(e){return"ZPW_Wskazniki_FTE"},"report:filenames:count":function(e){return"ZPW_Wskazniki_Ilosci"},"report:filenames:users":function(e){return"ZPW_Wskazniki_Uzytkownicy"}}});