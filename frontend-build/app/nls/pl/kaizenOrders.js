define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[i](n[t]-r),t in o?o[t]:o.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(){return"Usprawnienia"},"BREADCRUMBS:browse":function(){return"Zgłoszenia"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie zgłoszeń nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie zgłoszenia nie powiodło się :("},"MSG:DELETED":function(n){return"Zgłoszenie <em>"+e.v(n,"label")+"</em> zostało usunięte."},"MSG:jump:404":function(n){return"Nie znaleziono zgłoszenia o ID <em>"+e.v(n,"rid")+"</em> :("},"MSG:markAsSeen:failure":function(){return"Nie udało się oznaczyć zgłoszenia jako przeczytane :("},"MSG:observe:failure":function(){return"Nie udało się rozpocząć obserwacji zgłoszenia :("},"MSG:unobserve:failure":function(){return"Nie udało się zakończyć obserwacji zgłoszenia :("},"MSG:comment:failure":function(){return"Nie udało się skomentować zgłoszenia :("},"PAGE_ACTION:add":function(){return"Dodaj zgłoszenie"},"PAGE_ACTION:edit":function(){return"Edytuj zgłoszenie"},"PAGE_ACTION:delete":function(){return"Usuń zgłoszenie"},"PAGE_ACTION:markAsSeen":function(){return"Oznacz jako przeczytane"},"PAGE_ACTION:observe":function(){return"Obserwuj zgłoszenie"},"PAGE_ACTION:unobserve":function(){return"Przestań obserwować"},"PAGE_ACTION:jump:title":function(){return"Skocz do zgłoszenia po ID"},"PAGE_ACTION:jump:placeholder":function(){return"ID zgłoszenia"},"PANEL:TITLE:details":function(){return"Szczegóły zgłoszenia"},"PANEL:TITLE:changes":function(){return"Historia zmian zgłoszenia"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania zgłoszenia"},"PANEL:TITLE:editForm":function(){return"Formularz edycji zgłoszenia"},"PROPERTY:rid":function(){return"ID"},"PROPERTY:types":function(){return"Rodzaj"},"PROPERTY:subject":function(){return"Temat zgłoszenia"},"PROPERTY:eventDate":function(){return"Czas zdarzenia"},"PROPERTY:eventDate:short":function(){return"YY-MM-DD[, godz. ] H."},"PROPERTY:eventDate:long":function(){return"LL[, godz. ] H."},"PROPERTY:area":function(){return"Miejsce zdarzenia"},"PROPERTY:cause":function(){return"Kategoria przyczyny"},"PROPERTY:causeText":function(){return"Przyczyna wystąpienia zdarzenia"},"PROPERTY:risk":function(){return"Rodzaj ryzyka"},"PROPERTY:category":function(){return"Kategoria"},"PROPERTY:section":function(){return"Dział zgłaszający"},"PROPERTY:nearMissCategory":function(){return"Kategoria zdarzenia"},"PROPERTY:suggestionCategory":function(){return"Kategoria sugestii"},"PROPERTY:description":function(){return"Opis zdarzenia (jak jest)"},"PROPERTY:nearMissOwners":function(){return"Osoby zgłaszające"},"PROPERTY:suggestionOwners":function(){return"Osoby sugerujące"},"PROPERTY:kaizenOwners":function(){return"Osoby realizujące"},"PROPERTY:correctiveMeasures":function(){return"Podjęte działania korekcyjne (gaszenie pożaru)"},"PROPERTY:suggestion":function(){return"Propozycja działań korygujących (jak ma być)"},"PROPERTY:kaizenStartDate":function(){return"Data rozpoczęcia realizacji"},"PROPERTY:kaizenFinishDate":function(){return"Data zakończenia realizacji"},"PROPERTY:kaizenDuration":function(){return"Czas realizacji"},"PROPERTY:kaizenImprovements":function(){return"Wdrożone usprawnienia"},"PROPERTY:kaizenEffect":function(){return"Efekt usprawnień"},"PROPERTY:status":function(){return"Status"},"PROPERTY:creator":function(){return"Stworzone przez"},"PROPERTY:updater":function(){return"Ostatnio zmienione przez"},"PROPERTY:confirmer":function(){return"Osoba zatwierdzająca"},"PROPERTY:createdAt":function(){return"Czas stworzenia"},"PROPERTY:updatedAt":function(){return"Czas ostatniej zmiany"},"PROPERTY:confirmedAt":function(){return"Czas potwierdzenia"},"PROPERTY:attachments":function(){return"Załączniki"},"PROPERTY:attachments:description":function(){return"Opis"},"PROPERTY:attachments:file":function(){return"Nazwa pliku"},"PROPERTY:attachments:type":function(){return"Typ pliku"},"PROPERTY:comment":function(){return"Komentarz/opinia"},"PROPERTY:subscribers":function(){return"Obserwatorzy zgłoszenia"},"PROPERTY:observers:name":function(){return"Imię i nazwisko"},"PROPERTY:observers:role":function(){return"Rola"},"PROPERTY:observers:lastSeenAt":function(){return"Ostatnio widziany"},"type:nearMiss":function(){return"Zdarzenie Potencjalnie Wypadkowe"},"type:suggestion":function(){return"Sugestia"},"type:kaizen":function(){return"Kaizen"},"type:short:nearMiss":function(){return"ZPW"},"type:short:suggestion":function(){return"Sugestia"},"type:short:kaizen":function(){return"Kaizen"},"type:label:nearMiss":function(){return"ZPW"},"type:label:suggestion":function(){return"SUG"},"type:label:kaizen":function(){return"KZN"},"status:draft":function(){return"Wersja robocza"},"status:new":function(){return"Nowe"},"status:accepted":function(){return"Zaakceptowane"},"status:todo":function(){return"Do realizacji"},"status:inProgress":function(){return"W realizacji"},"status:cancelled":function(){return"Anulowane"},"status:finished":function(){return"Zakończone"},"status:paused":function(){return"Wstrzymane"},"role:creator":function(){return"Zgłaszający"},"role:confirmer":function(){return"Zatwierdzający"},"role:owner":function(){return"Właściciel"},"role:subscriber":function(){return"Obserwator"},"tab:attachments":function(){return"Załączniki zgłoszenia"},"tab:observers":function(){return"Uczestnicy zgłoszenia"},"attachments:noData":function(){return"Zgłoszenie nie ma żadnych załączników."},"attachments:actions:view":function(){return"Otwórz plik"},"attachments:actions:download":function(){return"Pobierz plik"},"attachments:scan":function(){return"Skan dokumentu"},"attachments:scan:current":function(){return"Aktualny skan dokumentu"},"attachments:scan:new":function(){return"Nowy skan dokumentu"},"attachments:before":function(){return"Stan przed"},"attachments:before:current":function(){return"Aktualny skan przed"},"attachments:before:new":function(){return"Nowy stan przed"},"attachments:after":function(){return"Stan po"},"attachments:after:current":function(){return"Aktualny stan po"},"attachments:after:new":function(){return"Nowy stan po"},"FORM:ACTION:add":function(){return"Dodaj zgłoszenie"},"FORM:ACTION:edit":function(){return"Zapisz"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać zgłoszenia :("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować zgłoszenia :("},"FORM:ERROR:onlyKaizen":function(){return"Kaizen wymaga ZPW lub Sugestii!"},"FORM:ERROR:upload":function(){return"Nie udało się załadować załączników :("},"FORM:MSG:eventTime":function(){return"Godzina"},"FORM:MSG:optional":function(n){return"Poniższe pola są opcjonalne. Pozostaw je puste, jeżeli nie jesteś "+e.s(n,"gender",{female:"pewna",other:"pewien"})+" co w nich wpisać."},"FORM:MSG:chooseTypes":function(){return"Wybierz typy zgłoszenia (ZPW, Sugestia, Kaizen) klikając na poniższe belki. Zgłoszenie może mieć w tym samym czasie dowolną kombinację typów."},"FORM:MSG:attachmentEdit":function(){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać już istniejące."},"FORM:help:subject":function(){return"Wpisz krótki opis podsumowujący..."},"FORM:help:section":function(){return"Wybierz swój dział..."},"FORM:help:confirmer":function(){return"Wyszukaj swojego przełożonego po nazwisku lub nr kadrowym..."},"FORM:help:subscribers":function(){return"W tym polu możesz wybrać dodatkowe osoby, które nie zostały wskazane we wcześniejszych polach, a mogą być zainteresowane tym zgłoszeniem lub chcesz, aby wyraziły swoją opinię.<br>Osoby te zostaną dodane do listy uczestników zgłoszenia z rolą Obserwatora, dzięki czemu będą powiadamiani o zmianach w tym zgłoszeniu."},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia zgłoszenia"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń zgłoszenie"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane zgłoszenie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć zgłoszenie <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć zgłoszenia :("},"filter:cause":function(){return"Przyczyna"},"filter:user:mine":function(){return"Moje"},"filter:user:unseen":function(){return"Nieprzeczytane"},"filter:user:creator":function(){return"Zgłaszający"},"filter:user:others":function(){return"Inny"},"filter:submit":function(){return"Filtruj"},"history:added":function(){return"utworzenie zgłoszenia."},"history:observer:0":function(){return"rozpoczęcie obserwacji zgłoszenia."},"history:observer:1":function(){return"zakończenie obserwacji zgłoszenia."},"history:editMessage":function(n){return"Tutaj możesz dodać komentarz do zgłoszenia. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+e.v(n,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(){return"Komentuj"}}});