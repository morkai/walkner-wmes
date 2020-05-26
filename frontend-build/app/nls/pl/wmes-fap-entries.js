define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,o,r,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[r](n[t]-o))in i?i[t]:i.other},s:function(n,t,o){return e.c(n,t),n[t]in o?o[n[t]]:o.other}};return{"BREADCRUMB:base":function(n){return"FAP"},"BREADCRUMB:browse":function(n){return"FAP"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"BREADCRUMB:history":function(n){return"Historia zmian"},"BREADCRUMB:reports:count":function(n){return"Ilości"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:jump:title":function(n){return"Skocz do zgłoszenia po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID zgłoszenia"},"PAGE_ACTION:start":function(n){return"Rozpocznij zgłoszenie"},"PAGE_ACTION:finish":function(n){return"Zakończ zgłoszenie"},"PAGE_ACTION:restart":function(n){return"Wznów zgłoszenie"},"PAGE_ACTION:markAsSeen":function(n){return"Oznacz jako przeczytane"},"PAGE_ACTION:subscribe":function(n){return"Włącz powiadomienia"},"PAGE_ACTION:unsubscribe":function(n){return"Wyłącz powiadomienia"},"PAGE_ACTION:history":function(n){return"Historia zmian"},"markAsSeen:listAction":function(n){return"Oznacz jako przeczytane"},"markAsSeen:success":function(n){return e.p(n,"count",0,"pl",{0:"Wszystkie zgłoszenia przeczytane!",one:"Oznaczono jedno zgłoszenie.",few:"Oznaczono "+e.v(n,"count")+" zgłoszenia.",other:"Oznaczono "+e.v(n,"count")+" zgłoszeń."})},"markAsSeen:failure":function(n){return"Oznaczanie zgłoszeń nie powiodło się."},"markAsSeen:noComment":function(n){return"Zmiany bez komentarzy"},"markAsSeen:finished":function(n){return"Zakończone"},"markAsSeen:dayOld":function(n){return"Starsze niż dzień"},"markAsSeen:weekOld":function(n){return"Starsze niż tydzień"},"markAsSeen:all":function(n){return"Wszystkie"},"PANEL:TITLE:changes":function(n){return"Historia zmian"},"LIST:COLUMN:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:createdAt":function(n){return"Czas zgłoszenia"},"PROPERTY:owner":function(n){return"Zgłaszający"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:level":function(n){return"Poziom"},"PROPERTY:order":function(n){return"Zlecenie/12NC"},"PROPERTY:orderNo":function(n){return"Nr zlecenia"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:productName":function(n){return"Nazwa wyrobu"},"PROPERTY:category":function(n){return"Kategoria"},"PROPERTY:subCategory":function(n){return"Podkategoria"},"PROPERTY:problem":function(n){return"Opis problemu"},"PROPERTY:uploads":function(n){return"Załączniki"},"PROPERTY:divisions":function(n){return"Wydział"},"PROPERTY:lines":function(n){return"Linia"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:qtyTodo":function(n){return"Ilość do zrobienia"},"PROPERTY:qtyDone":function(n){return"Ilość zrobiona"},"PROPERTY:attachments":function(n){return"Załączniki"},"PROPERTY:observers":function(n){return"Uczestnicy"},"PROPERTY:assessment":function(n){return"Ocena kroków gaszących"},"PROPERTY:analysisNeed":function(n){return"Potrzebna dalsza analiza"},"PROPERTY:analysisDone":function(n){return"Analiza zakończona"},"PROPERTY:mainAnalyzer":function(n){return"Osoba odpowiedzialna"},"PROPERTY:analyzers":function(n){return"Osoby biorące udział w analizie"},"PROPERTY:why5":function(n){return"Przyczyna problemu"},"PROPERTY:why":function(n){return"Dlaczego?"},"PROPERTY:solution":function(n){return"Opis rozwiązania problemu"},"PROPERTY:solutionSteps":function(n){return"Opis kroków rozwiązujących problem"},"PROPERTY:limit":function(n){return"Limit"},"PROPERTY:search":function(n){return"Tekst"},"PROPERTY:subdivisionType":function(n){return"Dział"},"PROPERTY:componentCode":function(n){return"Komponent"},"PROPERTY:componentName":function(n){return"Nazwa komponentu"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia zgłoszenia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia zgłoszenia"},"PROPERTY:analysisStartedAt":function(n){return"Czas rozpoczęcia analizy"},"PROPERTY:analysisFinishedAt":function(n){return"Czas zakończenia analizy"},"levelIndicator:label":function(n){return"Poziom eskalacji zgłoszenia"},"levelIndicator:title":function(n){return"Eskaluj zgłoszenie na poziom "+e.v(n,"level")},"subdivisionType:unspecified":function(n){return"Nieokreślony"},"subdivisionType:assembly":function(n){return"Montaż"},"subdivisionType:press":function(n){return"Tłocznia"},"subdivisionType:wh":function(n){return"Magazyn"},"status:pending":function(n){return"Oczekujące"},"status:started":function(n){return"Rozpoczęte"},"status:finished":function(n){return"Zakończone"},"assessment:header":function(n){return"Strukturalne rozwiązanie problemu"},"assessment:unspecified":function(n){return"Nieokreślona"},"assessment:effective":function(n){return"Skuteczne"},"assessment:ineffective":function(n){return"Nieskuteczne"},"assessment:repeatable":function(n){return"Powtarzają się"},"division:unspecified":function(n){return"Nieokreślony"},"mrp:unspecified":function(n){return"Nieokreślone"},"message:pending":function(n){return"Zgłoszenie czeka na weryfikację."},"message:started:true":function(n){return"Problem jest analizowany."},"message:started:false":function(n){return"Problem jest w trakcie rozwiązywania."},"message:finished:true":function(n){return"Zgłoszenie zostało zakończone, ale analiza nadal trwa."},"message:finished:false":function(n){return"Zgłoszenie zostało zakończone."},"filter:user:mine":function(n){return"Moje"},"filter:user:unseen":function(n){return"Nieprzeczytane"},"filter:user:others":function(n){return"Użytkownik"},"filter:status:specific":function(n){return"Status"},"filter:status:analysis":function(n){return"Analiza"},"filter:submit":function(n){return"Filtruj"},"history:added":function(n){return"<i>Utworzono zgłoszenie o "+e.v(n,"time")+" "+e.s(n,"day",{7:"w niedzielę",6:"w sobotę",3:"w środę",2:"we wtorek",other:"w "+e.v(n,"ddd")})+", "+e.v(n,"date")+".</i>"},"settings:tab:general":function(n){return"Ogólne"},"settings:general:pendingFunctions":function(n){return"Funkcje wymagające zatwierdzenia"},"settings:general:pendingFunctions:help":function(n){return"Zgłoszenia dodane przez użytkownika bez przypisanej funkcji lub z przypisaną jedną z poniższych funkcji zostaną dodane ze statusem <em>Oczekujące</em> i będą musiały być zatwierdzone przez lidera."},"settings:general:categoryFunctions":function(n){return"Funkcje zmiany kategorii"},"navbar:dictionaries":function(n){return"Słowniki"},"navbar:categories":function(n){return"Kategorie"},"navbar:subCategories":function(n){return"Podkategorie"},"navbar:button":function(n){return"FAP"},"navbar:unseen":function(n){return"Nieprzeczytane"},"navbar:add":function(n){return"Dodaj FAP"},"navbar:all":function(n){return"Wszystkie"},"navbar:open":function(n){return"Otwarte"},"navbar:pending":function(n){return"Oczekujące"},"navbar:started":function(n){return"Rozpoczęte"},"navbar:finished":function(n){return"Zakończone"},"navbar:analysis":function(n){return"Analizowane"},"navbar:mine":function(n){return"Moje"},"navbar:reports:count":function(n){return"Raport"},"addForm:subdivisions":function(n){return"Powiadomione działy"},"addForm:submit":function(n){return"Dodaj zgłoszenie"},"addForm:cancel":function(n){return"Anuluj"},"addForm:orderNo:notFound":function(n){return"Podane zlecenie nie istnieje."},"addForm:componentCode:notFound":function(n){return"Podany komponent nie istnieje."},"addForm:notifications:subdivisions":function(n){return"Działy"},"addForm:notifications:prodFunctions":function(n){return"Funkcje"},"addForm:copy:title":function(n){return"Kopiuj kategorię i problem z Twojego ostatniego zgłoszenia."},"addForm:copy:failure":function(n){return"Kopiowanie ostatniego zgłoszenia nie powiodło się."},"addForm:copy:notFound":function(n){return"Nie znaleziono żadnych pasujących zgłoszeń."},"upload:drop":function(n){return"Upuść tutaj pliki jakie chcesz dodać do tego zgłoszenia."},"upload:tooMany":function(n){return"Możesz załączyć maksymalnie "+e.v(n,"max")+" "+e.p(n,"max",0,"pl",{few:"pliki",one:"plik",other:"plików"})+"."},"upload:auth":function(n){return"Zaloguj się, aby dodawać pliki."},"upload:failure":function(n){return"Nie udało się załadować pliku: "+e.v(n,"file")},"chat:title":function(n){return"Czat"},"chat:submit":function(n){return"Wyślij wiadomość"},"chat:send":function(n){return"Wyślij wiadomość"},"chat:send:auth":function(n){return"Zaloguj się, aby wysłać wiadomość"},"chat:new":function(n){return"Kliknij tutaj, aby zobaczyć nowe wiadomości..."},"chat:status:pending:started":function(n){return"<i>Zaakceptowano zgłoszenie.</i>"},"chat:status:started:finished":function(n){return"<i>Zakończono zgłoszenie w "+e.v(n,"duration")+".</i>"},"chat:status:finished:started":function(n){return"<i>Wznowiono zgłoszenie.</i>"},"chat:status:pending:finished":function(n){return"<i>Zakończono zgłoszenie.</i>"},"chat:analysis:started":function(n){return"<i>Rozpoczęto analizę.</i>"},"chat:analysis:finished":function(n){return"<i>Zakończono analizę w "+e.v(n,"duration")+".</i>"},"chat:level:up":function(n){return"<i>Wyeskalowano zgłoszenie do poziomu "+e.v(n,"level")+".</i>"},"chat:level:down":function(n){return"<i>Deeskalowano zgłoszenie do poziomu "+e.v(n,"level")+".</i>"},"autolink:attachment":function(n){return"Załącznik"},"autolink:product":function(n){return"12NC"},"autolink:document":function(n){return"15NC"},"autolink:order":function(n){return"Nr zlecenia"},"autolink:entry":function(n){return"Zgłoszenie"},"observers:message":function(n){return"Dodatkowe osoby zostaną automatycznie dodane wg kategorii po eskalacji zgłoszenia."},"observers:placeholder":function(n){return"Dodaj po nazwisku lub nr kadrowym..."},"observers:placeholder:auth":function(n){return"Zaloguj się, aby dodać nową osobę..."},"attachments:upload":function(n){return"Dodaj załączniki"},"attachments:menu:rename":function(n){return"Zmień nazwę"},"attachments:menu:remove":function(n){return"Usuń plik"},"orderNo:404":function(n){return"Zlecenie nie istnieje."},"orderNo:failure":function(n){return"Sprawdzanie zlecenia nie powiodło się."},"componentCode:404":function(n){return"Komponent nie istnieje."},"componentCode:failure":function(n){return"Sprawdzanie komponentu nie powiodło się."},"notifications:added:title":function(n){return"Nowy FAP: "+e.v(n,"rid")+" ("+e.v(n,"category")+")"},"notifications:changed:title":function(n){return"Zmieniony FAP: "+e.v(n,"rid")},"notifications:changed:placeholder":function(n){return"Odpowiedź..."},"notifications:changed:reply":function(n){return"Wyślij odpowiedź"},"report:title:count":function(n){return"Ilość zgłoszeń"},"report:title:duration":function(n){return"Średni czas trwania zgłoszeń [h]"},"report:title:owner":function(n){return"Ilość zgłoszeń wg osób zgłaszających"},"report:title:solver":function(n){return"Ilość zgłoszeń wg osób rozwiązujących"},"report:title:status":function(n){return"Ilość zgłoszeń wg statusów"},"report:title:level":function(n){return"Ilość zgłoszeń wg poziomów"},"report:title:category":function(n){return"Ilość zgłoszeń wg kategorii"},"report:title:subCategory":function(n){return"Ilość zgłoszeń wg podkategorii"},"report:title:subdivisionType":function(n){return"Ilość zgłoszeń wg działów"},"report:title:division":function(n){return"Ilość zgłoszeń wg wydziałów"},"report:title:mrp":function(n){return"Ilość zgłoszeń wg MRP"},"report:title:assessment":function(n){return"Ilość zgłoszeń wg oceny kroków gaszących"},"report:series:entry":function(n){return"Zgłoszenia"},"report:series:analysis":function(n){return"Analizy"},"report:series:total":function(n){return"Suma"},"report:series:unspecified":function(n){return"Suma"},"report:filenames:count":function(n){return"FAP_Ilosc"},"report:filenames:duration":function(n){return"FAP_CzasTrwania"},"report:filenames:owner":function(n){return"FAP_IloscWgZglaszajacych"},"report:filenames:solver":function(n){return"FAP_IloscWgRozwiazujacych"},"report:filenames:status":function(n){return"FAP_IloscWgStatusow"},"report:filenames:level":function(n){return"FAP_IloscWgPoziomow"},"report:filenames:category":function(n){return"FAP_IloscWgKategorii"},"report:filenames:subCategory":function(n){return"FAP_IloscWgPodKategorii"},"report:filenames:subdivisionType":function(n){return"FAP_IloscWgDzialow"},"report:filenames:division":function(n){return"FAP_IloscWgWydzialow"},"report:filenames:mrp":function(n){return"FAP_IloscWgMRP"},"report:filenames:assessment":function(n){return"FAP_IloscWgOceny"}}});