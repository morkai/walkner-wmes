define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e))in i?i[r]:i.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Inspekcja Jakości"},"BREADCRUMBS:browse":function(n){return"Wyniki"},"BREADCRUMBS:reports:count":function(n){return"Ilości"},"BREADCRUMBS:reports:okRatio":function(n){return"% wyrobów zgodnych"},"BREADCRUMBS:reports:nokRatio":function(n){return"Jakość wyrobu gotowego"},"BREADCRUMBS:reports:outgoingQuality":function(n){return"Outgoing quality"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:comment:failure":function(n){return"Nie udało się skomentować zgłoszenia."},"PAGE_ACTION:add":function(n){return"Dodaj wynik"},"PAGE_ACTION:add:ok":function(n){return"Dodaj wynik zgodny"},"PAGE_ACTION:add:nok":function(n){return"niezgodny"},"PAGE_ACTION:print":function(n){return"Drukuj zgłoszenie niezgodności"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PANEL:TITLE:details":function(n){return"Szczegóły wyniku"},"PANEL:TITLE:details:prod":function(n){return"Zlecenie"},"PANEL:TITLE:details:wh":function(n){return"Komponent"},"PANEL:TITLE:details:inspection":function(n){return"Inspekcja"},"PANEL:TITLE:details:inspection:nok":function(n){return"Szczegóły inspekcji"},"PANEL:TITLE:details:extra":function(n){return"Dodatkowe informacje"},"PANEL:TITLE:details:actions":function(n){return"Akcje korygujące"},"PANEL:TITLE:details:attachments:ok":function(n){return"Załącznik OK"},"PANEL:TITLE:details:attachments:nok":function(n){return"Załącznik NOK"},"PANEL:TITLE:changes":function(n){return"Historia zmian"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:creator":function(n){return"Stworzone przez"},"PROPERTY:createdAt":function(n){return"Czas utworzenia"},"PROPERTY:updater":function(n){return"Ostatnio zmienione przez"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:inspector":function(n){return"Inspektor"},"PROPERTY:inspectedAt":function(n){return"Data inspekcji"},"PROPERTY:nokOwner":function(n){return"Właściciel niezgodności - mistrz"},"PROPERTY:leader":function(n){return"Lider/magazynier"},"PROPERTY:leader:prod":function(n){return"Lider"},"PROPERTY:leader:wh":function(n){return"Magazynier"},"PROPERTY:division":function(n){return"Centrum"},"PROPERTY:line":function(n){return"Lokalizacja"},"PROPERTY:line:prod":function(n){return"Linia"},"PROPERTY:line:wh":function(n){return"Lokalizacja magazynowa"},"PROPERTY:orderNo":function(n){return"Nr zlecenia"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:nc12:prod":function(n){return"12NC wyrobu"},"PROPERTY:nc12:wh":function(n){return"12NC komponentu"},"PROPERTY:productName":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:productName:prod":function(n){return"Nazwa wyrobu"},"PROPERTY:productName:wh":function(n){return"Nazwa komponentu"},"PROPERTY:productFamily":function(n){return"Rodzina wyrobów"},"PROPERTY:kind":function(n){return"Rodzaj inspekcji"},"PROPERTY:fault":function(n){return"Wada"},"PROPERTY:faultCode":function(n){return"Kod wady"},"PROPERTY:faultDescription":function(n){return"Klasyfikacja wady"},"PROPERTY:errorCategory":function(n){return"Kategoria błędu"},"PROPERTY:problem":function(n){return"Opis błędu"},"PROPERTY:immediateActions":function(n){return"Akcje natychmiastowe"},"PROPERTY:immediateResults":function(n){return"Wynik"},"PROPERTY:rootCause":function(n){return"Przyczyna źródłowa"},"PROPERTY:correctiveActions":function(n){return"Akcje korygujące"},"PROPERTY:okFile":function(n){return"Zdjęcie OK"},"PROPERTY:nokFile":function(n){return"Zdjęcie NOK"},"PROPERTY:qtyOrder":function(n){return"Ilość w zleceniu"},"PROPERTY:qtyInspected":function(n){return"Ilość skontrolowana"},"PROPERTY:qtyToFix":function(n){return"Ilość do selekcji"},"PROPERTY:qtyNok":function(n){return"Ilość niezgodnych"},"PROPERTY:qtyNokInspected":function(n){return"Ilość niezgodnych w skontrolowanych"},"PROPERTY:qtyNokInspected:min":function(n){return"Ilość niezg. w skontr."},"PROPERTY:serialNumbers":function(n){return"Numer seryjny"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:ok":function(n){return"Wynik"},"PROPERTY:kpi":function(n){return"KPI"},"PROPERTY:site":function(n){return"Fabryka"},"PROPERTY:date":function(n){return"Data"},"PROPERTY:pareto":function(n){return"Rodzina"},"PROPERTY:concern":function(n){return"Wada"},"PROPERTY:cause":function(n){return"Przyczyna"},"PROPERTY:countermeasure":function(n){return"Akcja naprawcza"},"PROPERTY:check":function(n){return"Check"},"PROPERTY:standard":function(n){return"Standard"},"PROPERTY:who":function(n){return"Kto"},"PROPERTY:when":function(n){return"Kiedy"},"source:prod":function(n){return"Produkcja"},"source:wh":function(n){return"Magazyn"},"ok:true":function(n){return"OK"},"ok:false":function(n){return"NOK"},"filter:result":function(n){return"Wynik"},"filter:result:ok":function(n){return"OK"},"filter:result:nok":function(n){return"NOK"},"filter:order":function(n){return"Zlecenie/12NC"},"filter:serialNumbers":function(n){return"Numer seryjny"},"filter:productFamily":function(n){return"Rodzina wyrobów"},"filter:division":function(n){return"Centrum"},"filter:line":function(n){return"Lokalizacja"},"filter:kind":function(n){return"Rodzaj inspekcji"},"filter:errorCategory":function(n){return"Kategoria błędu"},"filter:faultCode":function(n){return"Kod wady"},"filter:status":function(n){return"Status akcji"},"filter:inspector":function(n){return"Inspektor"},"filter:nokOwner":function(n){return"Mistrz"},"filter:leader":function(n){return"Lider"},"filter:limit":function(n){return"Ilość wyników na stronę"},"filter:submit":function(n){return"Filtruj wyniki"},"filter:filters":function(n){return"Pokaż dodatkowe filtry"},"filter:help":function(n){return"<i class='fa fa-question-circle'></i> Dodatkowe filtry są od teraz domyślnie schowane. Nowe filtry można dodać wybierając je z rozwijanego menu obok przycisku <em><i class='fa fa-filter'></i> Filtruj wyniki</em> lub klikając na kolumnę w tabeli wyników poniżej. Kliknij tutaj, aby ukryć ten komunikat."},"LIST:COLUMN:orderNo":function(n){return"Zlecenie"},"LIST:COLUMN:productFamily":function(n){return"Rodzina"},"LIST:COLUMN:inspectedAt":function(n){return"Data"},"LIST:COLUMN:division":function(n){return"Centrum"},"LIST:COLUMN:nokOwner":function(n){return"Mistrz"},"LIST:COLUMN:qtyOrder":function(n){return"Ilość w&nbsp;zlec."},"LIST:COLUMN:qtyInspected":function(n){return"Ilość spr."},"LIST:COLUMN:qtyToFix":function(n){return"Ilość do&nbsp;sel."},"LIST:COLUMN:qtyNok":function(n){return"Ilość NOK"},"LIST:COLUMN:qtyNokInspected":function(n){return"Ilość&nbsp;NOK w&nbsp;spr."},"FORM:ERROR:upload":function(n){return"Nie udało się załadować załączników."},"FORM:ERROR:orderNo":function(n){return"Wybierz prawidłowe zlecenie."},"FORM:ERROR:nc12":function(n){return"Wybierz prawidłowy komponent."},"FORM:okFile:new":function(n){return"Nowe zdjęcie OK"},"FORM:okFile:current":function(n){return"Aktualne zdjęcie OK"},"FORM:nokFile:new":function(n){return"Nowe zdjęcie NOK"},"FORM:nokFile:current":function(n){return"Aktualne zdjęcie NOK"},"FORM:attachments:remove":function(n){return"usuń"},"FORM:attachments:update":function(n){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać aktualne."},"correctiveActions:#":function(n){return"#"},"correctiveActions:what":function(n){return"Akcja"},"correctiveActions:when":function(n){return"Termin"},"correctiveActions:who":function(n){return"Kto"},"correctiveActions:status":function(n){return"Status"},"correctiveActions:add":function(n){return"Dodaj akcję korygującą"},"correctiveActions:empty":function(n){return"Brak akcji."},"history:added":function(n){return"utworzenie wyniku inspekcji."},"history:submit":function(n){return"Komentuj"},"history:correctiveActions":function(n){return t.p(n,"count",0,"pl",{one:"1 akcja korygująca",few:t.n(n,"count")+" akcje korygujące",other:t.n(n,"count")+" akcji korygujących"})},"report:title:totalNokCount":function(n){return"Ilość czerwonych pasków"},"report:title:nokCountPerDivision":function(n){return"Ilość czerwonych pasków per centrum produkcyjne"},"report:title:nokQtyPerFamily":function(n){return"Ilość niezgodnych produktów"},"report:title:okRatio":function(n){return"Ilość wyrobów zgodnych w centrach [%]"},"report:title:nokRatio:total":function(n){return"Ilość wyrobów zakwestionowanych do ilości wyrobów skontrolowanych - Total [%]"},"report:title:nokRatio:division":function(n){return"Ilość wyrobów zakwestionowanych do ilości wyrobów skontrolowanych - w centrach [%]"},"report:series:nokCount":function(n){return"Czerwone paski"},"report:series:maxNokCount":function(n){return"Górny limit"},"report:series:nokQty":function(n){return"Ilość niezgodnych"},"report:series:prod":function(n){return"Total"},"report:series:wh":function(n){return"Magazyn"},"report:series:okRatioRef":function(n){return"Cel"},"report:series:nokRatioRef":function(n){return"Cel"},"report:series:nokRatio":function(n){return"% wyrobów niezgodnych"},"report:series:qtyInspected":function(n){return"Ilość skontrolowana"},"report:series:qtyNok":function(n){return"Ilość NOK"},"report:series:qtyNokInspected":function(n){return"Ilość NOK w spr."},"report:filenames:totalNokCount":function(n){return"WMES_QI_IloscNok"},"report:filenames:nokCountPerDivision":function(n){return"WMES_QI_IloscNokPerCentrum"},"report:filenames:nokQtyPerFamily":function(n){return"WMES_QI_IloscNiezgodnych"},"report:filenames:okRatio":function(n){return"WMES_QI_ProcentZgodnych"},"report:filenames:nokRatio:total":function(n){return"WMES_QI_ProcentNiezgodnych_ML"},"report:filenames:nokRatio:division":function(n){return"WMES_QI_ProcentNiezgodnych_Centra"},"report:column:division":function(n){return"Centrum"},"report:column:nok":function(n){return"Wadliwe"},"report:column:all":function(n){return"Wszystkie"},"report:column:ratio":function(n){return"% dobrych"},"report:oql:title:ppm":function(n){return"Tygodniowy poziom PPM"},"report:oql:title:where":function(n){return"Gdzie"},"report:oql:title:what":function(n){return"Co"},"report:oql:title:results":function(n){return"4C"},"report:oql:series:oql":function(n){return"PPM"},"report:oql:series:oqlTarget":function(n){return"Cel"},"report:oql:filename:ppm":function(n){return"WMES_OQL_TygPPM"},"report:oql:filename:where":function(n){return"WMES_OQL_Gdzie"},"report:oql:filename:what":function(n){return"WMES_OQL_Co"},"report:oql:week":function(n){return"Tydzień"},"report:oql:where":function(n){return"Rodzina"},"report:oql:what":function(n){return"Wada"},"report:oql:qtyNok":function(n){return"Ilość niezgodnych"},"report:oql:pareto":function(n){return"Pareto"},"report:oql:printable":function(n){return"Wersja do druku"},"settings:tab:results":function(n){return"Wyniki"},"settings:tab:reports":function(n){return"Raporty"},"settings:requiredCount":function(n){return"Dzienna wymagana ilość kontroli"},"settings:maxNokPerDay":function(n){return"Górny limit czerwonych pasków na dzień"},"settings:okRatioRef":function(n){return"Cel dla % wyrobów zgodnych"},"settings:nokRatioRef":function(n){return"Cel dla % wyrobów niezgodnych"},"settings:oqlKinds":function(n){return"Rodzaje inspekcji w Outgoing Quality"},"settings:defaultErrorCategory":function(n){return"Domyślna kategoria błędu"}}});