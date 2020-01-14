define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r))in i?i[t]:i.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMB:base":function(n){return"Usprawnienia"},"BREADCRUMB:browse":function(n){return"Zgłoszenia"},"BREADCRUMB:reports:count":function(n){return"Ilość zgłoszeń"},"BREADCRUMB:reports:summary":function(n){return"Zestawienie informacji"},"BREADCRUMB:reports:engagement":function(n){return"Zaangażowanie"},"MSG:markAsSeen:failure":function(n){return"Nie udało się oznaczyć zgłoszenia jako przeczytane."},"MSG:observe:failure":function(n){return"Nie udało się rozpocząć obserwacji zgłoszenia."},"MSG:unobserve:failure":function(n){return"Nie udało się zakończyć obserwacji zgłoszenia."},"MSG:comment:failure":function(n){return"Nie udało się skomentować zgłoszenia."},"PAGE_ACTION:add":function(n){return"Dodaj zgłoszenie"},"PAGE_ACTION:markAsSeen":function(n){return"Oznacz jako przeczytane"},"PAGE_ACTION:observe":function(n){return"Obserwuj zgłoszenie"},"PAGE_ACTION:unobserve":function(n){return"Przestań obserwować"},"PAGE_ACTION:print":function(n){return"Wersja do druku"},"PANEL:TITLE:changes":function(n){return"Historia zmian zgłoszenia"},"LIST:owners":function(n){return e.v(n,"first")+" <span class=text-nowrap>+"+e.p(n,"count",0,"pl",{one:"1 inna",other:e.v(n,"count")+" inne"})+"</span>"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:subject":function(n){return"Temat zgłoszenia"},"PROPERTY:subjectAndDescription":function(n){return"Temat/opis zgłoszenia"},"PROPERTY:date":function(n){return"Data złożenia wniosku"},"PROPERTY:howItIs":function(n){return"Jak jest?"},"PROPERTY:howItShouldBe":function(n){return"Jak ma być?"},"PROPERTY:suggestion":function(n){return"Pomysł/działanie usprawniające"},"PROPERTY:category":function(n){return"Kategoria"},"PROPERTY:categories":function(n){return"Kategorie"},"PROPERTY:productFamily":function(n){return"Rodzina produktów"},"PROPERTY:section":function(n){return"Dział zgłaszający"},"PROPERTY:owners":function(n){return"Właściciele"},"PROPERTY:suggestionOwners":function(n){return"Osoby wnioskujące"},"PROPERTY:kaizenOwners":function(n){return"Osoby wykonujące"},"PROPERTY:kaizenStartDate":function(n){return"Data rozpoczęcia realizacji"},"PROPERTY:kaizenFinishDate":function(n){return"Data zakończenia realizacji"},"PROPERTY:kaizenDuration":function(n){return"Liczba dni realizacji Kaizena"},"PROPERTY:kaizenImprovements":function(n){return"Wdrożone usprawnienia"},"PROPERTY:kaizenEffect":function(n){return"Efekt usprawnień"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:creator":function(n){return"Stworzone przez"},"PROPERTY:updater":function(n){return"Ostatnio zmienione przez"},"PROPERTY:confirmer":function(n){return"Osoba zatwierdzająca"},"PROPERTY:createdAt":function(n){return"Czas utworzenia"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:confirmedAt":function(n){return"Czas potwierdzenia"},"PROPERTY:attachments":function(n){return"Załączniki"},"PROPERTY:attachments:description":function(n){return"Opis"},"PROPERTY:attachments:file":function(n){return"Nazwa pliku"},"PROPERTY:attachments:type":function(n){return"Typ pliku"},"PROPERTY:comment":function(n){return"Komentarz/opinia"},"PROPERTY:subscribers":function(n){return"Obserwatorzy zgłoszenia"},"PROPERTY:observers:name":function(n){return"Imię i nazwisko"},"PROPERTY:observers:role":function(n){return"Rola"},"PROPERTY:observers:lastSeenAt":function(n){return"Ostatnio widziany"},"PROPERTY:finishDuration":function(n){return"Liczba dni realizacji wniosku"},"type:suggestion":function(n){return"Sugestia"},"type:kaizen":function(n){return"Kaizen"},"status:new":function(n){return"Nowe"},"status:accepted":function(n){return"Zaakceptowane"},"status:todo":function(n){return"Do realizacji"},"status:inProgress":function(n){return"W realizacji"},"status:cancelled":function(n){return"Anulowane"},"status:finished":function(n){return"Zakończone"},"status:paused":function(n){return"Wstrzymane"},"status:open":function(n){return"Otwarte"},"role:creator":function(n){return"Zgłaszający"},"role:confirmer":function(n){return"Zatwierdzający"},"role:owner":function(n){return"Właściciel"},"role:subscriber":function(n){return"Obserwator"},"tab:attachments":function(n){return"Załączniki zgłoszenia"},"tab:observers":function(n){return"Uczestnicy zgłoszenia"},"attachments:noData":function(n){return"Zgłoszenie nie ma żadnych załączników."},"attachments:actions:view":function(n){return"Otwórz plik"},"attachments:actions:download":function(n){return"Pobierz plik"},"attachments:scan":function(n){return"Skan dokumentu"},"attachments:scan:current":function(n){return"Aktualny skan dokumentu"},"attachments:scan:new":function(n){return"Nowy skan dokumentu"},"attachments:before":function(n){return"Stan przed"},"attachments:before:current":function(n){return"Aktualny skan przed"},"attachments:before:new":function(n){return"Nowy stan przed"},"attachments:after":function(n){return"Stan po"},"attachments:after:current":function(n){return"Aktualny stan po"},"attachments:after:new":function(n){return"Nowy stan po"},"FORM:ACTION:edit":function(n){return"Zapisz"},"FORM:backTo:behaviorObsCards:cancel":function(n){return"Anuluj i wróć do karty obserwacji"},"FORM:backTo:behaviorObsCards:add":function(n){return"Dodaj zgłoszenie i wróć do karty obserwacji"},"FORM:backTo:behaviorObsCards:edit":function(n){return"Zapisz i wróć do karty obserwacji"},"FORM:backTo:minutesForSafetyCards:cancel":function(n){return"Anuluj i wróć do karty minutek"},"FORM:backTo:minutesForSafetyCards:add":function(n){return"Dodaj zgłoszenie i wróć do karty minutek"},"FORM:backTo:minutesForSafetyCards:edit":function(n){return"Zapisz i wróć do karty minutek"},"FORM:backTo:kaizenOrders:cancel":function(n){return"Anuluj i wróć do ZPW"},"FORM:backTo:kaizenOrders:add":function(n){return"Dodaj zgłoszenie i wróć do ZPW"},"FORM:backTo:kaizenOrders:edit":function(n){return"Zapisz i wróć do ZPW"},"FORM:ERROR:upload":function(n){return"Nie udało się załadować załączników."},"FORM:ERROR:date":function(n){return"Podana data nie może się różnić o więcej niż "+e.v(n,"days")+" dni od aktualnej daty."},"FORM:ERROR:ownerConfirmer":function(n){return"Osoba nie może być osobą zatwierdzajacą."},"FORM:MSG:attachmentEdit":function(n){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać już istniejące pliki."},"FORM:help:subject":function(n){return"Wpisz krótki tekst..."},"FORM:help:section":function(n){return"Wybierz swój dział..."},"FORM:help:confirmer":function(n){return"Wyszukaj po nazwisku przełożonego, do którego ma zostać skierowane zgłoszenie..."},"FORM:help:subscribers":function(n){return"W tym polu możesz wybrać dodatkowe osoby, które nie zostały wskazane we wcześniejszych polach, a mogą być zainteresowane tym zgłoszeniem lub chcesz, aby wyraziły swoją opinię.<br>Osoby te zostaną dodane do listy uczestników zgłoszenia z rolą Obserwatora, dzięki czemu będą powiadamiani o zmianach w tym zgłoszeniu."},"FORM:help:date:diff":function(n){return"Wybrano datę będącą "+e.v(n,"days")+" dni w "+e.s(n,"dir",{past:"przeszłości",other:"przyszłości"})+"."},"FORM:productFamily:other":function(n){return"(inna)"},"FORM:productFamily:list":function(n){return"(lista)"},"FORM:productFamily:kaizenEvent":function(n){return"Inna..."},"filter:user:mine":function(n){return"Moje"},"filter:user:unseen":function(n){return"Nieprzeczytane"},"filter:user:owner":function(n){return"Zgłaszający"},"filter:user:others":function(n){return"Uczestnik"},"filter:submit":function(n){return"Filtruj"},"history:added":function(n){return"utworzenie zgłoszenia."},"history:observer:0":function(n){return"rozpoczęcie obserwacji zgłoszenia."},"history:observer:1":function(n){return"zakończenie obserwacji zgłoszenia."},"history:submit":function(n){return"Komentuj"},"report:title:total":function(n){return"Ilość zgłoszeń"},"report:title:status":function(n){return"Ilość zgłoszeń wg statusów"},"report:title:section":function(n){return"Ilość zgłoszeń wg działów"},"report:title:productFamily":function(n){return"Ilość zgłoszeń wg rodzin produktów"},"report:title:category":function(n){return"Ilość zgłoszeń wg kategorii"},"report:title:confirmer":function(n){return"Ilość zgłoszeń wg zatwiedzających"},"report:title:owner":function(n){return"Ilość zgłoszeń wg właścicieli"},"report:series:total":function(n){return"Suma"},"report:series:entry":function(n){return"Zgłoszenia"},"report:series:suggestion":function(n){return"Sugestie"},"report:series:kaizen":function(n){return"Kaizeny"},"report:series:kaizenEvent":function(n){return"Kaizen Event"},"report:series:new":function(n){return"Nowe"},"report:series:accepted":function(n){return"Zaakceptowane"},"report:series:todo":function(n){return"Do realizacji"},"report:series:inProgress":function(n){return"W realizacji"},"report:series:cancelled":function(n){return"Anulowane"},"report:series:finished":function(n){return"Zakończone"},"report:series:paused":function(n){return"Wstrzymane"},"report:filenames:total":function(n){return"SUG_Ilosc"},"report:filenames:status":function(n){return"SUG_IloscWgStatusow"},"report:filenames:section":function(n){return"SUG_IloscWgDzialow"},"report:filenames:productFamily":function(n){return"SUG_IloscWgRodzinProduktow"},"report:filenames:category":function(n){return"SUG_IloscWgKategorii"},"report:filenames:confirmer":function(n){return"SUG_IloscWgZatwierdzajacych"},"report:filenames:owner":function(n){return"SUG_IloscWgWlascicieli"},"report:title:summary:averageDuration":function(n){return"Średnia ilość dni realizacji w poszczególnych tygodniach"},"report:title:summary:count":function(n){return"Ilość zgłoszeń w poszczególnych tygodniach"},"report:title:summary:suggestionOwners":function(n){return"Ilość sugestii zgłoszonych przez pracownika"},"report:title:summary:categories":function(n){return"Ilość sugestii zgłoszonych w kategoriach"},"report:subtitle:summary:averageDuration":function(n){return"Całkowita średnia dla wybranego okresu: "+e.v(n,"averageDuration")},"report:subtitle:summary:averageDuration:short":function(n){return"Całkowita średnia: "+e.v(n,"averageDuration")},"report:subtitle:summary:productFamily":function(n){return"Rodzina: "+e.v(n,"productFamily")},"report:subtitle:summary:section":function(n){return"Dział: "+e.v(n,"section")},"report:subtitle:summary:count":function(n){return"Całkowita ilość zgłoszeń w wybranym okresie: "+e.v(n,"total")+" ("+e.v(n,"open")+" "+e.p(n,"open",0,"pl",{few:"otwarte",one:"otwarte",other:"otwartych"})+", "+e.v(n,"finished")+" "+e.p(n,"finished",0,"pl",{few:"zamknięte",one:"zamknięte",other:"zamkniętych"})+", "+e.v(n,"cancelled")+" "+e.p(n,"cancelled",0,"pl",{few:"anulowane",one:"anulowane",other:"anulowanych"})+")"},"report:series:summary:averageDuration":function(n){return"Średnia ilość dni realizacji"},"report:series:summary:open":function(n){return"Otwarte"},"report:series:summary:finished":function(n){return"Zakończone"},"report:series:summary:cancelled":function(n){return"Anulowane"},"report:filenames:summary:averageDuration":function(n){return"SUG_SredniaIloscDniRealizacji"},"report:filenames:summary:count":function(n){return"SUG_IloscWTygodniach"},"report:filenames:summary:suggestionOwners":function(n){return"SUG_IloscSugestiiWgPracownikow"},"report:filenames:summary:categories":function(n){return"SUG_IloscSugestiiWgKategorii"},"thanks:message":function(n){return"Dziękujemy za zgłoszenie!"},"thanks:footnote":function(n){return"(kliknij dowolny przycisk lub wciśnij dowolny klawisz, aby zamknąć ten komunikat)"},"engagement:name":function(n){return"Nazwisko i imię"},"engagement:nearMisses":function(n){return"ZPW"},"engagement:suggestions":function(n){return"BHP+ergonomia"},"engagement:behaviorObs":function(n){return"Obserwacje zachowań"},"engagement:minutesForSafety":function(n){return"Minuty dla Bezpieczeństwa"},"engagement:sections":function(n){return"Dział zgłaszający"},"engagement:empty":function(n){return"Brak zgłoszeń pasujących do aktualnych filtrów."},"engagement:export:action":function(n){return"Eksportuj do pliku"},"engagement:export:filename":function(n){return"WMES_ZAANGAZOWANIE"}}});