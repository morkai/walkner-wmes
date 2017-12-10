define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,i){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(i||0)},v:function(n,i){return e.c(n,i),n[i]},p:function(n,i,r,o,u){return e.c(n,i),n[i]in u?u[n[i]]:(i=e.lc[o](n[i]-r),i in u?u[i]:u.other)},s:function(n,i,r){return e.c(n,i),n[i]in r?r[n[i]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Inspekcja Jakości"},"BREADCRUMBS:browse":function(n){return"Rodzaje inspekcji"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie rodzajów inspekcji nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie rodzaju inspekcji nie powiodło się."},"MSG:DELETED":function(n){return"Rodzaj inspekcji <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj rodzaj inspekcji"},"PAGE_ACTION:edit":function(n){return"Edytuj rodzaj inspekcji"},"PAGE_ACTION:delete":function(n){return"Usuń rodzaj inspekcji"},"PANEL:TITLE:details":function(n){return"Szczegóły rodzaju inspekcji"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania rodzaju inspekcji"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji rodzaju inspekcji"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:division":function(n){return"Wydział"},ordersDivision:function(n){return"centrum produkcyjne ze zlecenia"},"FORM:ACTION:add":function(n){return"Dodaj rodzaj inspekcji"},"FORM:ACTION:edit":function(n){return"Edytuj rodzaj inspekcji"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać rodzaju inspekcji."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować rodzaju inspekcji."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia rodzaju inspekcji"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń rodzaj inspekcji"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną rodzaj inspekcji?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć rodzaj inspekcji <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć rodzaju inspekcji."}}});