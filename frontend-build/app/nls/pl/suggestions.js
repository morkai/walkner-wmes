define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Usprawnienia"},"BREADCRUMBS:browse":function(n){return"Zgłoszenia"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"BREADCRUMBS:reports:count":function(n){return"Ilość zgłoszeń"},"BREADCRUMBS:reports:summary":function(n){return"Zestawienie informacji"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie zgłoszeń nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie zgłoszenia nie powiodło się :("},"MSG:DELETED":function(n){return"Zgłoszenie <em>"+e.v(n,"label")+"</em> zostało usunięte."},"MSG:jump:404":function(n){return"Nie znaleziono zgłoszenia o ID <em>"+e.v(n,"rid")+"</em> :("},"MSG:markAsSeen:failure":function(n){return"Nie udało się oznaczyć zgłoszenia jako przeczytane :("},"MSG:observe:failure":function(n){return"Nie udało się rozpocząć obserwacji zgłoszenia :("},"MSG:unobserve:failure":function(n){return"Nie udało się zakończyć obserwacji zgłoszenia :("},"MSG:comment:failure":function(n){return"Nie udało się skomentować zgłoszenia :("},"PAGE_ACTION:export":function(n){return"Eksportuj zgłoszenia"},"PAGE_ACTION:add":function(n){return"Dodaj zgłoszenie"},"PAGE_ACTION:edit":function(n){return"Edytuj zgłoszenie"},"PAGE_ACTION:delete":function(n){return"Usuń zgłoszenie"},"PAGE_ACTION:markAsSeen":function(n){return"Oznacz jako przeczytane"},"PAGE_ACTION:observe":function(n){return"Obserwuj zgłoszenie"},"PAGE_ACTION:unobserve":function(n){return"Przestań obserwować"},"PAGE_ACTION:jump:title":function(n){return"Skocz do zgłoszenia po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID zgłoszenia"},"PANEL:TITLE:details":function(n){return"Szczegóły zgłoszenia"},"PANEL:TITLE:changes":function(n){return"Historia zmian zgłoszenia"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania zgłoszenia"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji zgłoszenia"},"LIST:owners":function(n){return e.v(n,"first")+" <span class=text-nowrap>+"+e.p(n,"count",0,"pl",{one:"1 inna",other:e.v(n,"count")+" inne"})+"</span>"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:subject":function(n){return"Temat zgłoszenia"},"PROPERTY:subjectAndDescription":function(n){return"Temat/opis zgłoszenia"},"PROPERTY:date":function(n){return"Data złożenia wniosku"},"PROPERTY:howItIs":function(n){return"Jak jest?"},"PROPERTY:howItShouldBe":function(n){return"Jak ma być?"},"PROPERTY:suggestion":function(n){return"Pomysł/działanie usprawniające"},"PROPERTY:category":function(n){return"Kategoria"},"PROPERTY:categories":function(n){return"Kategorie"},"PROPERTY:productFamily":function(n){return"Rodzina produktów"},"PROPERTY:section":function(n){return"Dział zgłaszający"},"PROPERTY:owners":function(n){return"Właściciele"},"PROPERTY:suggestionOwners":function(n){return"Osoby wnioskujące"},"PROPERTY:kaizenOwners":function(n){return"Osoby wykonujące"},"PROPERTY:kaizenStartDate":function(n){return"Data rozpoczęcia realizacji"},"PROPERTY:kaizenFinishDate":function(n){return"Data zakończenia realizacji"},"PROPERTY:kaizenDuration":function(n){return"Liczba dni realizacji Kaizena"},"PROPERTY:kaizenImprovements":function(n){return"Wdrożone usprawnienia"},"PROPERTY:kaizenEffect":function(n){return"Efekt usprawnień"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:creator":function(n){return"Stworzone przez"},"PROPERTY:updater":function(n){return"Ostatnio zmienione przez"},"PROPERTY:confirmer":function(n){return"Osoba zatwierdzająca"},"PROPERTY:createdAt":function(n){return"Czas stworzenia"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:confirmedAt":function(n){return"Czas potwierdzenia"},"PROPERTY:attachments":function(n){return"Załączniki"},"PROPERTY:attachments:description":function(n){return"Opis"},"PROPERTY:attachments:file":function(n){return"Nazwa pliku"},"PROPERTY:attachments:type":function(n){return"Typ pliku"},"PROPERTY:comment":function(n){return"Komentarz/opinia"},"PROPERTY:subscribers":function(n){return"Obserwatorzy zgłoszenia"},"PROPERTY:observers:name":function(n){return"Imię i nazwisko"},"PROPERTY:observers:role":function(n){return"Rola"},"PROPERTY:observers:lastSeenAt":function(n){return"Ostatnio widziany"},"PROPERTY:finishDuration":function(n){return"Liczba dni realizacji wniosku"},"type:suggestion":function(n){return"Sugestia"},"type:kaizen":function(n){return"Kaizen"},"status:new":function(n){return"Nowe"},"status:accepted":function(n){return"Zaakceptowane"},"status:todo":function(n){return"Do realizacji"},"status:inProgress":function(n){return"W realizacji"},"status:cancelled":function(n){return"Anulowane"},"status:finished":function(n){return"Zakończone"},"status:paused":function(n){return"Wstrzymane"},"status:open":function(n){return"Otwarte"},"role:creator":function(n){return"Zgłaszający"},"role:confirmer":function(n){return"Zatwierdzający"},"role:owner":function(n){return"Właściciel"},"role:subscriber":function(n){return"Obserwator"},"tab:attachments":function(n){return"Załączniki zgłoszenia"},"tab:observers":function(n){return"Uczestnicy zgłoszenia"},"attachments:noData":function(n){return"Zgłoszenie nie ma żadnych załączników."},"attachments:actions:view":function(n){return"Otwórz plik"},"attachments:actions:download":function(n){return"Pobierz plik"},"attachments:scan":function(n){return"Skan dokumentu"},"attachments:scan:current":function(n){return"Aktualny skan dokumentu"},"attachments:scan:new":function(n){return"Nowy skan dokumentu"},"attachments:before":function(n){return"Stan przed"},"attachments:before:current":function(n){return"Aktualny skan przed"},"attachments:before:new":function(n){return"Nowy stan przed"},"attachments:after":function(n){return"Stan po"},"attachments:after:current":function(n){return"Aktualny stan po"},"attachments:after:new":function(n){return"Nowy stan po"},"FORM:ACTION:add":function(n){return"Dodaj zgłoszenie"},"FORM:ACTION:edit":function(n){return"Zapisz"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać zgłoszenia :("},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować zgłoszenia :("},"FORM:ERROR:upload":function(n){return"Nie udało się załadować załączników :("},"FORM:MSG:attachmentEdit":function(n){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać już istniejące pliki."},"FORM:help:subject":function(n){return"Wpisz krótki tekst..."},"FORM:help:section":function(n){return"Wybierz swój dział..."},"FORM:help:confirmer":function(n){return"Wyszukaj po nazwisku przełożonego, do którego ma zostać skierowane zgłoszenie..."},"FORM:help:subscribers":function(n){return"W tym polu możesz wybrać dodatkowe osoby, które nie zostały wskazane we wcześniejszych polach, a mogą być zainteresowane tym zgłoszeniem lub chcesz, aby wyraziły swoją opinię.<br>Osoby te zostaną dodane do listy uczestników zgłoszenia z rolą Obserwatora, dzięki czemu będą powiadamiani o zmianach w tym zgłoszeniu."},"FORM:help:date:diff":function(n){return"Wybrano datę będącą "+e.v(n,"days")+" dni w "+e.s(n,"dir",{past:"przeszłości",other:"przyszłości"})+"."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia zgłoszenia"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń zgłoszenie"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane zgłoszenie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć zgłoszenie <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć zgłoszenia :("},"filter:user:mine":function(n){return"Moje"},"filter:user:unseen":function(n){return"Nieprzeczytane"},"filter:user:owner":function(n){return"Zgłaszający"},"filter:user:others":function(n){return"Uczestnik"},"filter:submit":function(n){return"Filtruj"},"history:added":function(n){return"utworzenie zgłoszenia."},"history:observer:0":function(n){return"rozpoczęcie obserwacji zgłoszenia."},"history:observer:1":function(n){return"zakończenie obserwacji zgłoszenia."},"history:editMessage":function(n){return"Tutaj możesz dodać komentarz do zgłoszenia. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+e.v(n,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(n){return"Komentuj"},"report:title:total":function(n){return"Ilość zgłoszeń"},"report:title:status":function(n){return"Ilość zgłoszeń wg statusów"},"report:title:section":function(n){return"Ilość zgłoszeń wg działów"},"report:title:productFamily":function(n){return"Ilość zgłoszeń wg rodzin produktów"},"report:title:category":function(n){return"Ilość zgłoszeń wg kategorii"},"report:title:confirmer":function(n){return"Ilość zgłoszeń wg zatwiedzających"},"report:title:owner":function(n){return"Ilość zgłoszeń wg właścicieli"},"report:series:total":function(n){return"Suma"},"report:series:entry":function(n){return"Zgłoszenia"},"report:series:suggestion":function(n){return"Sugestie"},"report:series:kaizen":function(n){return"Kaizeny"},"report:series:new":function(n){return"Nowe"},"report:series:accepted":function(n){return"Zaakceptowane"},"report:series:todo":function(n){return"Do realizacji"},"report:series:inProgress":function(n){return"W realizacji"},"report:series:cancelled":function(n){return"Anulowane"},"report:series:finished":function(n){return"Zakończone"},"report:series:paused":function(n){return"Wstrzymane"},"report:filenames:total":function(n){return"SUG_Ilosc"},"report:filenames:status":function(n){return"SUG_IloscWgStatusow"},"report:filenames:section":function(n){return"SUG_IloscWgDzialow"},"report:filenames:productFamily":function(n){return"SUG_IloscWgRodzinProduktow"},"report:filenames:category":function(n){return"SUG_IloscWgKategorii"},"report:filenames:confirmer":function(n){return"SUG_IloscWgZatwierdzajacych"},"report:filenames:owner":function(n){return"SUG_IloscWgWlascicieli"},"report:title:summary:averageDuration":function(n){return"Średnia ilość dni realizacji w poszczególnych tygodniach"},"report:title:summary:count":function(n){return"Ilość zgłoszeń w poszczególnych tygodniach"},"report:title:summary:suggestionOwners":function(n){return"Ilość sugestii zgłoszonych przez pracownika"},"report:subtitle:summary:averageDuration":function(n){return"Całkowita średnia dla wybranego okresu: "+e.v(n,"averageDuration")},"report:subtitle:summary:count":function(n){return"Całkowita ilość zgłoszeń w wybranym okresie: "+e.v(n,"total")+" ("+e.v(n,"open")+" "+e.p(n,"open",0,"pl",{few:"otwarte",one:"otwarte",other:"otwartych"})+", "+e.v(n,"finished")+" "+e.p(n,"finished",0,"pl",{few:"zamknięte",one:"zamknięte",other:"zamkniętych"})+", "+e.v(n,"cancelled")+" "+e.p(n,"cancelled",0,"pl",{few:"anulowane",one:"anulowane",other:"anulowanych"})+")"},"report:series:summary:averageDuration":function(n){return"Średnia ilość dni realizacji"},"report:series:summary:open":function(n){return"Otwarte"},"report:series:summary:finished":function(n){return"Zakończone"},"report:series:summary:cancelled":function(n){return"Anulowane"},"report:filenames:summary:averageDuration":function(n){return"SUG_SredniaIloscDniRealizacji"},"report:filenames:summary:count":function(n){return"SUG_IloscWTygodniach"},"report:filenames:summary:suggestionOwners":function(n){return"SUG_IloscSugestiiWgPracownikow"},"thanks:message":function(n){return"Dziękujemy za zgłoszenie!"},"thanks:footnote":function(n){return"(kliknij dowolny przycisk lub wciśnij dowolny klawisz, aby zamknąć ten komunikat)"}}});