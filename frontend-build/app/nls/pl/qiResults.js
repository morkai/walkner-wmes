define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e),r in i?i[r]:i.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Inspekcja Jakości"},"BREADCRUMBS:browse":function(n){return"Wyniki"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:reports:count":function(n){return"Ilości"},"BREADCRUMBS:reports:okRatio":function(n){return"% wyrobów zgodnych"},"BREADCRUMBS:reports:nokRatio":function(n){return"Jakość wyrobu gotowego"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie wyników nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie wyniku nie powiodło się."},"MSG:DELETED":function(n){return"Wynik <em>"+t.v(n,"label")+"</em> został usunięty."},"MSG:jump:404":function(n){return"Nie znaleziono wyniku o ID <em>"+t.v(n,"rid")+"</em>."},"MSG:comment:failure":function(n){return"Nie udało się skomentować zgłoszenia."},"PAGE_ACTION:export":function(n){return"Eksportuj wyniki"},"PAGE_ACTION:add":function(n){return"Dodaj wynik"},"PAGE_ACTION:add:ok":function(n){return"Dodaj wynik zgodny"},"PAGE_ACTION:add:nok":function(n){return"niezgodny"},"PAGE_ACTION:edit":function(n){return"Edytuj wynik"},"PAGE_ACTION:delete":function(n){return"Usuń wynik"},"PAGE_ACTION:print":function(n){return"Drukuj zgłoszenie niezgodności"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:jump:title":function(n){return"Skocz do wyniku po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID wyniku"},"PANEL:TITLE:details":function(n){return"Szczegóły wyniku"},"PANEL:TITLE:details:order":function(n){return"Zlecenie"},"PANEL:TITLE:details:inspection":function(n){return"Inspekcja"},"PANEL:TITLE:details:inspection:nok":function(n){return"Szczegóły inspekcji"},"PANEL:TITLE:details:extra":function(n){return"Dodatkowe informacje"},"PANEL:TITLE:details:actions":function(n){return"Akcje korygujące"},"PANEL:TITLE:details:attachments:ok":function(n){return"Załącznik OK"},"PANEL:TITLE:details:attachments:nok":function(n){return"Załącznik NOK"},"PANEL:TITLE:changes":function(n){return"Historia zmian"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania wyniku"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji wyniku"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:creator":function(n){return"Stworzone przez"},"PROPERTY:createdAt":function(n){return"Czas stworzenia"},"PROPERTY:updater":function(n){return"Ostatnio zmienione przez"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:inspector":function(n){return"Inspektor"},"PROPERTY:inspectedAt":function(n){return"Data inspekcji"},"PROPERTY:nokOwner":function(n){return"Właściciel niezgodności - mistrz"},"PROPERTY:leader":function(n){return"Lider"},"PROPERTY:division":function(n){return"Centrum"},"PROPERTY:line":function(n){return"Linia"},"PROPERTY:orderNo":function(n){return"Nr zlecenia"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:productName":function(n){return"Nazwa wyrobu"},"PROPERTY:productFamily":function(n){return"Rodzina wyrobów"},"PROPERTY:kind":function(n){return"Rodzaj inspekcji"},"PROPERTY:fault":function(n){return"Wada"},"PROPERTY:faultCode":function(n){return"Kod wady"},"PROPERTY:faultDescription":function(n){return"Klasyfikacja wady"},"PROPERTY:errorCategory":function(n){return"Kategoria błędu"},"PROPERTY:problem":function(n){return"Opis błędu"},"PROPERTY:immediateActions":function(n){return"Akcje natychmiastowe"},"PROPERTY:immediateResults":function(n){return"Wynik"},"PROPERTY:rootCause":function(n){return"Przyczyna źródłowa"},"PROPERTY:correctiveActions":function(n){return"Akcje korygujące"},"PROPERTY:okFile":function(n){return"Zdjęcie OK"},"PROPERTY:nokFile":function(n){return"Zdjęcie NOK"},"PROPERTY:qtyOrder":function(n){return"Ilość w zleceniu"},"PROPERTY:qtyInspected":function(n){return"Ilość skontrolowana"},"PROPERTY:qtyToFix":function(n){return"Ilość do selekcji"},"PROPERTY:qtyNok":function(n){return"Ilość niezgodnych"},"PROPERTY:qtyNokInspected":function(n){return"Ilość niezgodnych w skontrolowanych"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:ok":function(n){return"Wynik"},"ok:true":function(n){return"OK"},"ok:false":function(n){return"NOK"},"filter:result":function(n){return"Wynik"},"filter:result:ok":function(n){return"OK"},"filter:result:nok":function(n){return"NOK"},"filter:order":function(n){return"Zlecenie/12NC"},"filter:productFamily":function(n){return"Rodzina wyrobów"},"filter:division":function(n){return"Centrum"},"filter:line":function(n){return"Linia"},"filter:kind":function(n){return"Rodzaj inspekcji"},"filter:errorCategory":function(n){return"Kategoria błędu"},"filter:faultCode":function(n){return"Kod wady"},"filter:status":function(n){return"Status akcji"},"filter:inspector":function(n){return"Inspektor"},"filter:nokOwner":function(n){return"Mistrz"},"filter:leader":function(n){return"Lider"},"filter:limit":function(n){return"Ilość wyników na stronę"},"filter:submit":function(n){return"Filtruj wyniki"},"filter:filters":function(n){return"Pokaż dodatkowe filtry"},"filter:help":function(n){return"<i class='fa fa-question-circle'></i> Dodatkowe filtry są od teraz domyślnie schowane. Nowe filtry można dodać wybierając je z rozwijanego menu obok przycisku <em><i class='fa fa-filter'></i> Filtruj wyniki</em> lub klikając na kolumnę w tabeli wyników poniżej. Kliknij tutaj, aby ukryć ten komunikat."},"LIST:COLUMN:orderNo":function(n){return"Zlecenie"},"LIST:COLUMN:productFamily":function(n){return"Rodzina"},"LIST:COLUMN:inspectedAt":function(n){return"Data"},"LIST:COLUMN:division":function(n){return"Centrum"},"LIST:COLUMN:nokOwner":function(n){return"Mistrz"},"LIST:COLUMN:qtyOrder":function(n){return"Ilość w&nbsp;zlec."},"LIST:COLUMN:qtyInspected":function(n){return"Ilość spr."},"LIST:COLUMN:qtyToFix":function(n){return"Ilość do&nbsp;sel."},"LIST:COLUMN:qtyNok":function(n){return"Ilość NOK"},"LIST:COLUMN:qtyNokInspected":function(n){return"Ilość&nbsp;NOK w&nbsp;spr."},"FORM:ACTION:add":function(n){return"Dodaj wynik"},"FORM:ACTION:edit":function(n){return"Edytuj wynik"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać wyniku."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować wyniku."},"FORM:ERROR:upload":function(n){return"Nie udało się załadować załączników."},"FORM:ERROR:orderNo":function(n){return"Wybierz prawidłowe zlecenie."},"FORM:okFile:new":function(n){return"Nowe zdjęcie OK"},"FORM:okFile:current":function(n){return"Aktualne zdjęcie OK"},"FORM:nokFile:new":function(n){return"Nowe zdjęcie NOK"},"FORM:nokFile:current":function(n){return"Aktualne zdjęcie NOK"},"FORM:attachments:remove":function(n){return"usuń"},"FORM:attachments:update":function(n){return"Wybierz nowe pliki tylko wtedy, gdy chcesz nadpisać aktualne."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wyniku"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wynik"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany wynik?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wynik <em>"+t.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wyniku."},"correctiveActions:#":function(n){return"#"},"correctiveActions:what":function(n){return"Akcja"},"correctiveActions:when":function(n){return"Termin"},"correctiveActions:who":function(n){return"Kto"},"correctiveActions:status":function(n){return"Status"},"correctiveActions:add":function(n){return"Dodaj akcję korygującą"},"correctiveActions:empty":function(n){return"Brak akcji."},"history:added":function(n){return"utworzenie wyniku inspekcji."},"history:editMessage":function(n){return"Tutaj możesz dodać komentarz do wyniku inspekcji. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+t.v(n,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(n){return"Komentuj"},"history:correctiveActions":function(n){return t.p(n,"count",0,"pl",{one:"1 akcja korygująca",few:t.n(n,"count")+" akcje korygujące",other:t.n(n,"count")+" akcji korygujących"})},"report:title:totalNokCount":function(n){return"Ilość czerwonych pasków"},"report:title:nokCountPerDivision":function(n){return"Ilość czerwonych pasków per centrum produkcyjne"},"report:title:nokQtyPerFamily":function(n){return"Ilość niezgodnych produktów"},"report:title:okRatio":function(n){return"Ilość wyrobów zgodnych w centrach [%]"},"report:title:nokRatio:total":function(n){return"Ilość wyrobów zakwestionowanych do ilości wyrobów skontrolowanych - ML [%]"},"report:title:nokRatio:division":function(n){return"Ilość wyrobów zakwestionowanych do ilości wyrobów skontrolowanych - w centrach [%]"},"report:series:nokCount":function(n){return"Czerwone paski"},"report:series:maxNokCount":function(n){return"Górny limit"},"report:series:nokQty":function(n){return"Ilość niezgodnych"},"report:series:prod":function(n){return"ML"},"report:series:wh":function(n){return"Magazyn"},"report:series:okRatioRef":function(n){return"Cel"},"report:series:nokRatioRef":function(n){return"Cel"},"report:series:nokRatio":function(n){return"% wyrobów niezgodnych"},"report:series:qtyInspected":function(n){return"Ilość skontrolowana"},"report:series:qtyNok":function(n){return"Ilość NOK"},"report:series:qtyNokInspected":function(n){return"Ilość NOK w spr."},"report:filenames:totalNokCount":function(n){return"WMES_QI_IloscNok"},"report:filenames:nokCountPerDivision":function(n){return"WMES_QI_IloscNokPerCentrum"},"report:filenames:nokQtyPerFamily":function(n){return"WMES_QI_IloscNiezgodnych"},"report:filenames:okRatio":function(n){return"WMES_QI_ProcentZgodnych"},"report:filenames:nokRatio:total":function(n){return"WMES_QI_ProcentNiezgodnych_ML"},"report:filenames:nokRatio:division":function(n){return"WMES_QI_ProcentNiezgodnych_Centra"},"report:column:division":function(n){return"Centrum"},"report:column:nok":function(n){return"Wadliwe"},"report:column:all":function(n){return"Wszystkie"},"report:column:ratio":function(n){return"% dobrych"},"settings:tab:results":function(n){return"Wyniki"},"settings:tab:reports":function(n){return"Raporty"},"settings:requiredCount":function(n){return"Dzienna wymagana ilość kontroli"},"settings:maxNokPerDay":function(n){return"Górny limit czerwonych pasków na dzień"},"settings:okRatioRef":function(n){return"Cel dla % wyrobów zgodnych"},"settings:nokRatioRef":function(n){return"Cel dla % wyrobów niezgodnych"}}});