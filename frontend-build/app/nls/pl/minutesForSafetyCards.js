define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,i,o){return r.c(n,e),n[e]in o?o[n[e]]:(e=r.lc[i](n[e]-t),e in o?o[e]:o.other)},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Minuty dla Bezpieczeństwa"},"BREADCRUMBS:browse":function(n){return"Karty"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"BREADCRUMBS:reports:count":function(n){return"Ilość minutek"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie kart MdB nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie karty MdB nie powiodło się."},"MSG:DELETED":function(n){return"Karta MdB <em>"+r.v(n,"label")+"</em> została usunięta."},"MSG:jump:404":function(n){return"Nie znaleziono karty MdB o ID <em>"+r.v(n,"rid")+"</em>."},"PAGE_ACTION:add":function(n){return"Dodaj kartę"},"PAGE_ACTION:edit":function(n){return"Edytuj kartę"},"PAGE_ACTION:delete":function(n){return"Usuń kartę"},"PAGE_ACTION:export":function(n){return"Eksportuj karty"},"PAGE_ACTION:jump:title":function(n){return"Skocz do karty po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID karty"},"PAGE_ACTION:print":function(n){return"Wersja do druku"},"PANEL:TITLE:details":function(n){return"Szczegóły karty MdB"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania karty Minuty dla Bezpieczeństwa"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji karty Minuty dla Bezpieczeństwa"},"PANEL:ACTION:nearMiss":function(n){return"Przypisane ZPW:"},"PANEL:ACTION:suggestion":function(n){return"Przypisane usprawnienie:"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:subject":function(n){return"Temat"},"PROPERTY:date":function(n){return"Data spotkania"},"PROPERTY:section":function(n){return"Dział"},"PROPERTY:owner":function(n){return"Osoba rejestrująca"},"PROPERTY:creator":function(n){return"Stworzone przez"},"PROPERTY:updater":function(n){return"Ostatnio zmienione przez"},"PROPERTY:createdAt":function(n){return"Czas stworzenia"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:observations:what":function(n){return"Co może się zdarzyć w czasie wykonywania czynności?"},"PROPERTY:observations:why":function(n){return"Jakie są tego przyczyny?"},"PROPERTY:propositions:what":function(n){return"Co?"},"PROPERTY:propositions:who":function(n){return"Kto?"},"PROPERTY:propositions:when":function(n){return"Kiedy?"},"PROPERTY:observations":function(n){return"Obserwacje"},"PROPERTY:orgPropositions":function(n){return"Propozycje rozwiązań organizacyjnych"},"PROPERTY:techPropositions":function(n){return"Propozycje rozwiązań technicznych"},"PROPERTY:safeBehavior":function(n){return"Prawidłowe zachowanie/Reguły zachowania"},"PROPERTY:participants":function(n){return"Uczestnicy spotkania"},"PROPERTY:status":function(n){return"Status"},"FORM:ACTION:add":function(n){return"Dodaj kartę MdB"},"FORM:ACTION:edit":function(n){return"Zapisz kartę MdB"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać karty MdB."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować karty MdB."},"FORM:ERROR:empty":function(n){return"Podaj przynajmniej jedną obserwację."},"FORM:MSG:nearMiss:add":function(n){return"Jeżeli stwierdziłeś ryzykowne warunki w miejscu prowadzenia obserwacji zarejestruj je w bazie ZPW - <a href='#kaizenOrders;add'>Zgłoś nowe ZPW</a> lub <a href=# role=rid data-kind=nearMiss>przypisz istniejące</a>!"},"FORM:MSG:nearMiss:edit":function(n){return"Stwierdzone ryzykowne warunki w miejscu prowadzenia obserwacji zostały zarejestrowane w bazie ZPW - <a href='#kaizenOrders/"+r.v(n,"rid")+"'>zgłoszenie #"+r.v(n,"rid")+"</a>! (<a href=# role=rid data-kind=nearMiss>zmień</a>)"},"FORM:MSG:suggestion:add":function(n){return"Proponowane rozwiązania zarejestruj w bazie Usprawnień - <a href='#suggestions;add'>Zgłoś nową sugestię</a> lub <a href=# role=rid data-kind=suggestion>przypisz istniejącą</a>!"},"FORM:MSG:suggestion:edit":function(n){return"Proponowane rozwiązania zostały zarejestrowane w bazie Usprawnień - <a href='#suggestions/"+r.v(n,"rid")+"'>zgłoszenie #"+r.v(n,"rid")+"</a>! (<a href=# role=rid data-kind=suggestion>zmień</a>)"},"FORM:ridEditor:rid":function(n){return"ID zgłoszenia"},"FORM:ridEditor:submit":function(n){return"Zmień"},"FORM:ridEditor:cancel":function(n){return"Anuluj"},"FORM:ridEditor:notFound":function(n){return"Dane zgłoszenie nie istnieje!"},"FORM:ridEditor:failure":function(n){return"Nie udało się sprawdzić zgłoszenia."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia karty MdB"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń kartę MdB"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną kartę MdB?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć kartę MdB <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć karty MdB."},"filter:user:mine":function(n){return"Moje"},"filter:user:owner":function(n){return"Rejestrujący"},"filter:user:others":function(n){return"Uczestnik"},"filter:submit":function(n){return"Filtruj"},"status:new":function(n){return"Nowe"},"status:accepted":function(n){return"Zaakceptowane"},"status:todo":function(n){return"Do realizacji"},"status:inProgress":function(n){return"W realizacji"},"status:cancelled":function(n){return"Anulowane"},"status:finished":function(n){return"Zakończone"},"status:paused":function(n){return"Wstrzymane"},"status:open":function(n){return"Otwarte"},"report:title:total":function(n){return"Ilość przeprowadzonych spotkań"},"report:title:countBySection":function(n){return"Ilość przeprowadzonych spotkań wg działów"},"report:title:owners":function(n){return"Ilość przeprowadzonych spotkań wg osób rejestrujących"},"report:title:participants":function(n){return"Ilość przeprowadzonych spotkań wg osób uczestniczących"},"report:title:engaged":function(n){return"Ilość przeprowadzonych spotkań wg osób zaangażowanych"},"report:series:minutesForSafetyCard":function(n){return"Karty minutek"},"report:series:total":function(n){return"Suma"},"report:series:card":function(n){return"Karty minutek"},"report:filenames:total":function(n){return"MdB_Ilosc"},"report:filenames:countBySection":function(n){return"MdB_IloscWgDzialow"},"report:filenames:owners":function(n){return"MdB_IloscWgRejestrujacych"},"report:filenames:participants":function(n){return"MdB_IloscWgUczestniczacych"},"report:filenames:engaged":function(n){return"MdB_IloscWgZaangazowanych"}}});