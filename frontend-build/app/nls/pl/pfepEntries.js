define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,u){return t.c(n,r),n[r]in u?u[n[r]]:(r=t.lc[o](n[r]-e),r in u?u[r]:u.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Baza PFEP"},"BREADCRUMBS:browse":function(n){return"Wpisy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie wpisów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie wpisu nie powiodło się."},"MSG:DELETED":function(n){return"Wpis <em>"+t.v(n,"label")+"</em> został usunięty."},"MSG:jump:404":function(n){return"Nie znaleziono wpisu o ID <em>"+t.v(n,"rid")+"</em>."},"MSG:comment:failure":function(n){return"Nie udało się skomentować wpisu."},"PAGE_ACTION:export":function(n){return"Eksportuj wpisy"},"PAGE_ACTION:add":function(n){return"Dodaj wpis"},"PAGE_ACTION:edit":function(n){return"Edytuj wpis"},"PAGE_ACTION:delete":function(n){return"Usuń wpis"},"PAGE_ACTION:jump:title":function(n){return"Skocz do wpisu po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID wpisu"},"PANEL:TITLE:details":function(n){return"Szczegóły wpisu"},"PANEL:TITLE:details:extra":function(n){return"Dodatkowe informacje"},"PANEL:TITLE:changes":function(n){return"Historia zmian"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania wpisu"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji wpisu"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:date":function(n){return"Data wpisu"},"PROPERTY:creator":function(n){return"Stworzony przez"},"PROPERTY:createdAt":function(n){return"Czas utworzenia"},"PROPERTY:updater":function(n){return"Ostatnio zmieniony przez"},"PROPERTY:updatedAt":function(n){return"Czas ostatniej zmiany"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:description":function(n){return"Opis"},"PROPERTY:unit":function(n){return"Jednostka"},"PROPERTY:packType":function(n){return"Rodzaj opakowania"},"PROPERTY:externalPackQty":function(n){return"Ilość w opakowaniu zewnętrznym"},"PROPERTY:internalPackQty":function(n){return"Ilość w opakowaniu wewnętrznym"},"PROPERTY:packSize":function(n){return"Wymiary opakowania [cm]"},"PROPERTY:packLength":function(n){return"Długość opakowania [cm]"},"PROPERTY:packWidth":function(n){return"Szerokość opakowania [cm]"},"PROPERTY:packHeight":function(n){return"Wysokość opakowania [cm]"},"PROPERTY:packGrossWeight":function(n){return"Waga brutto opakowania [kg]"},"PROPERTY:componentNetWeight":function(n){return"Waga netto komponentu (1uom) w kg"},"PROPERTY:componentGrossWeight":function(n){return"Waga brutto komponentu (1uom) w kg"},"PROPERTY:qtyPerLayer":function(n){return"Ilość na warstwę"},"PROPERTY:qtyOnPallet":function(n){return"Ilość na paletę"},"PROPERTY:palletSize":function(n){return"Wymiary palety [cm]"},"PROPERTY:palletLength":function(n){return"Długość palety [cm]"},"PROPERTY:palletWidth":function(n){return"Szerokość palety [cm]"},"PROPERTY:palletHeight":function(n){return"Całkowita wysokość palety [cm]"},"PROPERTY:moq":function(n){return"MOQ"},"PROPERTY:roundingValue":function(n){return"Wartość zaokrąglenia"},"PROPERTY:vendor":function(n){return"Dostawca"},"PROPERTY:notes":function(n){return"Uwagi"},"PROPERTY:comment":function(n){return"Komentarz"},"filter:nc12":function(n){return"12NC"},"filter:packType":function(n){return"Rodzaj opakowania"},"filter:vendor":function(n){return"Dostawca"},"filter:creator":function(n){return"Stworzony przez"},"filter:limit":function(n){return"Ilość wpisów na stronę"},"filter:submit":function(n){return"Filtruj wpisy"},"filter:filters":function(n){return"Pokaż dodatkowe filtry"},"LIST:COLUMN:unit":function(n){return"Jedn."},"LIST:COLUMN:packType":function(n){return"Rodzaj<br>opakowania"},"LIST:COLUMN:externalPackQty":function(n){return"Ilość w<br>opakowaniu<br>(zewnętrzna)"},"LIST:COLUMN:internalPackQty":function(n){return"Ilość w<br>opakowaniu<br>(wewnętrzna)"},"LIST:COLUMN:packSize":function(n){return"Wymiary<br>opakowania<br>[cm]"},"LIST:COLUMN:packGrossWeight":function(n){return"Waga brutto<br>opakowania<br>[kg]"},"LIST:COLUMN:componentNetWeight":function(n){return"Waga netto<br>komponentu<br>[1PC]"},"LIST:COLUMN:componentGrossWeight":function(n){return"Waga brutto<br>komponentu<br>[1PC]"},"LIST:COLUMN:qtyPerLayer":function(n){return"Ilość<br>na<br>warstwę"},"LIST:COLUMN:qtyOnPallet":function(n){return"Ilość<br>na<br>paletę"},"LIST:COLUMN:palletSize":function(n){return"Wymiary<br>palety<br>[cm]"},"LIST:COLUMN:moq":function(n){return"MOQ"},"LIST:COLUMN:roundingValue":function(n){return"Wartość<br>zaokrąglenia"},"LIST:COLUMN:notes":function(n){return"Uwagi"},"FORM:ACTION:add":function(n){return"Dodaj wpis"},"FORM:ACTION:edit":function(n){return"Edytuj wpis"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać wpisu."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować wpisu."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wpisu"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wpis"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany wpis?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wpis <em>"+t.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wpisu."},"history:added":function(n){return"utworzenie wpisu PFEP."},"history:editMessage":function(n){return"Tutaj możesz dodać komentarz do wpisu. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+t.v(n,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(n){return"Komentuj"}}});