define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,i,a){return t.c(n,r),n[r]in a?a[n[r]]:(r=t.lc[i](n[r]-e))in a?a[r]:a.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"navbar:hr":function(n){return"HR"},"navbar:users":function(n){return"Użytkownicy"},"navbar:employments":function(n){return"Zatrudnienie"},"navbar:brigades":function(n){return"Brygady"},"navbar:companies":function(n){return"Firmy"},"navbar:divisions":function(n){return"Dywizje"},"navbar:workplaces":function(n){return"Zakłady"},"navbar:departments":function(n){return"Wydziały"},"navbar:buildings":function(n){return"Budynki"},"navbar:locations":function(n){return"Obszary"},"navbar:stations":function(n){return"Stanowiska"},"navbar:kinds":function(n){return"Rodzaje zgłoszeń"},"navbar:activityKinds":function(n){return"Rodzaje aktywności"},"navbar:observationKinds":function(n){return"Rodzaje kart obserwacji"},"navbar:observationCategories":function(n){return"Kategorie obserwacji"},"navbar:eventCategories":function(n){return"Kategorie zdarzeń"},"navbar:reasonCategories":function(n){return"Kategorie przyczyn zdarzeń"},"navbar:rootCauseCategories":function(n){return"Kategorie przyczyn źródłowych"},"navbar:kaizenCategories":function(n){return"Kategorie kaizen"},"navbar:nearMisses":function(n){return"ZPW"},"navbar:kaizens":function(n){return"Kaizen"},"navbar:actions":function(n){return"Akcje"},"navbar:observations":function(n){return"Obserwacje"},"navbar:accidents":function(n){return"Wypadki"},"navbar:reports":function(n){return"Raporty"},"navbar:reports:metrics":function(n){return"Wskaźniki"},"navbar:reports:engagement":function(n){return"Zaangażowanie"},"navbar:reports:gratification":function(n){return"Wynagrodzenie"},"navbar:reports:observers":function(n){return"Obserwatorzy"},"navbar:reports:count/nearMiss":function(n){return"Ilość ZPW"},"navbar:reports:count/kaizen":function(n){return"Ilość kaizenów"},"navbar:reports:count/action":function(n){return"Ilość akcji"},"navbar:reports:count/observation":function(n){return"Ilość obserwacji"},"navbar:reports:count/accident":function(n){return"Ilość wypadków"},"navbar:entries:all":function(n){return"Wszystkie"},"navbar:entries:open":function(n){return"Otwarte"},"navbar:entries:mine":function(n){return"Moje"},"navbar:entries:unseen":function(n){return"Nieprzeczytane"},"navbar:entries:todo":function(n){return"Do realizacji"},"navbar:search:nearMiss":function(n){return"ZPW"},"navbar:search:kaizen":function(n){return"kaizen"},"navbar:search:action":function(n){return"akcja"},"navbar:search:observation":function(n){return"obserwacja"},"type:nearMiss":function(n){return"ZPW"},"type:kaizen":function(n){return"Kaizen"},"type:action":function(n){return"Akcja"},"type:observation":function(n){return"Obserwacja"},"priority:0":function(n){return"Niski"},"priority:1":function(n){return"Normalny"},"priority:2":function(n){return"Wysoki"},"priority:3":function(n){return"Krytyczny"},"kind:osh":function(n){return"BHP"},"kind:env":function(n){return"Ochrona środowiska"},"kind:inf":function(n){return"Infrastruktura"},"kind:other":function(n){return"Inny"},"status:new":function(n){return"Nowe"},"status:inProgress":function(n){return"Realizacja"},"status:verification":function(n){return"Weryfikacja"},"status:finished":function(n){return"Zakończone"},"status:paused":function(n){return"Wstrzymane"},"status:cancelled":function(n){return"Anulowane"},"status:kom":function(n){return"Kaizen miesiąca"},"orgUnit:divisions":function(n){return"Dywizje"},"orgUnit:division":function(n){return"Dywizja"},"orgUnit:workplaces":function(n){return"Zakłady"},"orgUnit:workplace":function(n){return"Zakład"},"orgUnit:departments":function(n){return"Wydziały"},"orgUnit:department":function(n){return"Wydział"},"orgUnit:buildings":function(n){return"Budynki"},"orgUnit:building":function(n){return"Budynek"},"orgUnit:locations":function(n){return"Obszary"},"orgUnit:location":function(n){return"Obszar"},"orgUnit:stations":function(n){return"Stanowiska"},"orgUnit:station":function(n){return"Stanowisko"},"duration:days":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"pl",{one:"dzień",other:"dni"})},"duration:hours":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"pl",{one:"godzina",few:"godziny",other:"godzin"})},"duration:minutes":function(n){return t.v(n,"duration")+" "+t.p(n,"duration",0,"pl",{one:"minuta",few:"minuty",other:"minut"})},"anonymous:label":function(n){return"Anonim"},"attachments:panelTitle:default":function(n){return"Załączniki"},"attachments:panelTitle:other":function(n){return"Załączniki"},"attachments:panelTitle:before":function(n){return"Zdjęcia stanu przed"},"attachments:panelTitle:after":function(n){return"Zdjęcia stanu po"},"attachments:empty":function(n){return"Nie dodano żadnych załączników."},"attachments:open":function(n){return"Otwórz plik"},"attachments:edit":function(n){return"Edytuj załącznik"},"attachments:edit:title":function(n){return"Edycja załącznika"},"attachments:edit:name":function(n){return"Nazwa pliku"},"attachments:edit:kind":function(n){return"Rodzaj załącznika"},"attachments:edit:submit":function(n){return"Zapisz"},"attachments:delete":function(n){return"Usuń załącznik"},"attachments:delete:title":function(n){return"Usuwanie pliku"},"attachments:delete:message":function(n){return"Czy na pewno chcesz usunąć wybrany plik?"},"attachments:delete:yes":function(n){return"Usuń plik"},"attachments:kind:before":function(n){return"stan przed"},"attachments:kind:after":function(n){return"stan po"},"attachments:kind:other":function(n){return"inny"},"history:panelTitle":function(n){return"Historia zmian"},"history:maximize":function(n){return"Maksymalizuj widok"},"history:commentsOnly":function(n){return"Tylko komentarze"},"history:comment:placeholder":function(n){return"Komentarz..."},"history:comment:submit":function(n){return"Komentuj"},"history:attachmentKind:before":function(n){return"przed"},"history:attachmentKind:after":function(n){return"po"},"relation:unspecified":function(n){return""},"relation:nearMiss":function(n){return"<a href='#osh/nearMisses/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:action":function(n){return"<a href='#osh/actions/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:kaizen":function(n){return"<a href='#osh/kaizens/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"relation:observation":function(n){return"<a href='#osh/observations/"+t.v(n,"_id")+"'>"+t.v(n,"rid")+"</a>"},"markAsSeen:listAction":function(n){return"Oznacz jako przeczytane"},"markAsSeen:pageAction:list":function(n){return"Oznacz jako przeczytane"},"markAsSeen:pageAction:details":function(n){return"Oznacz jako przeczytane"},"markAsSeen:success":function(n){return t.p(n,"count",0,"pl",{0:"Wszystkie zgłoszenia przeczytane!",one:"Oznaczono jedno zgłoszenie.",few:"Oznaczono "+t.v(n,"count")+" zgłoszenia.",other:"Oznaczono "+t.v(n,"count")+" zgłoszeń."})},"markAsSeen:failure":function(n){return"Oznaczanie zgłoszeń nie powiodło się."},"markAsSeen:noComment":function(n){return"Zmiany bez komentarzy"},"markAsSeen:finished":function(n){return"Zakończone"},"markAsSeen:dayOld":function(n){return"Starsze niż dzień"},"markAsSeen:weekOld":function(n){return"Starsze niż tydzień"},"markAsSeen:all":function(n){return"Wszystkie"},"FORM:ERROR:upload":function(n){return"Zapisywanie załączników nie powiodło się."},"FORM:ERROR:tooManyFiles":function(n){return"Możesz wybrać maksymalnie "+t.v(n,"max")+" "+t.p(n,"max",0,"pl",{1:"plik",few:"pliki",other:"plików"})+"."},"FORM:ACTION:add":function(n){return"Dodaj zgłoszenie"},"FORM:ACTION:edit":function(n){return"Zapisz"},"FORM:ACTION:title:edit":function(n){return"Zapisz zgłoszenie bez zmiany statusu"},"FORM:ACTION:title:status":function(n){return"Zapisz zgłoszenie i zmień status na: "+t.v(n,"status")},"FORM:ACTION:title:cancel:add":function(n){return"Wróć do poprzedniej strony bez dodawania zgłoszenia"},"FORM:ACTION:title:cancel:edit":function(n){return"Wróć do poprzedniej strony bez zmian w zgłoszeniu"},"FORM:ACTION:inProgress":function(n){return"Do realizacji"},"FORM:ACTION:correction":function(n){return"Do poprawy"},"FORM:ACTION:verification":function(n){return"Do weryfikacji"},"FORM:ACTION:finished":function(n){return"Zakończ"},"FORM:ACTION:paused":function(n){return"Wstrzymaj"},"FORM:ACTION:cancelled":function(n){return"Anuluj"},"FORM:ACTION:cancel:add":function(n){return"Anuluj dodawanie"},"FORM:ACTION:cancel:edit":function(n){return"Odrzuć zmiany"},"FORM:unsaved":function(n){return"Wprowadzone zmiany nie zostaną zapisane."},"orgUnitPicker:filter:label":function(n){return"Jednostki organizacyjne"},"orgUnitPicker:filter:any":function(n){return"Dowolne"},"orgUnitPicker:dialog:title":function(n){return"Jednostki organizacyjne"},"orgUnitPicker:dialog:submit":function(n){return"Wybierz"},"orgUnitPicker:dialog:deactivated":function(n){return"Dezaktywowane"},"coordinators:types":function(n){return"Typy zgłoszeń"},"coordinators:kinds":function(n){return"Rodzaje zgłoszeń"},"coordinators:users":function(n){return"Użytkownicy"},"coordinators:add":function(n){return"Dodaj koordynatorów"},"coordinators:all":function(n){return"Wszystkie"}}});