define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,o,r,u){return t.c(n,e),n[e]in u?u[n[e]]:(e=t.lc[r](n[e]-o),e in u?u[e]:u.other)},s:function(n,e,o){return t.c(n,e),n[e]in o?o[n[e]]:o.other}};return{"BREADCRUMBS:browse":function(n){return"Dostawcy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie dostawców nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie dostawcy nie powiodło się."},"MSG:DELETED":function(n){return"Dostawca <em>"+t.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj dostawcę"},"PAGE_ACTION:edit":function(n){return"Edytuj dostawcę"},"PAGE_ACTION:delete":function(n){return"Usuń dostawcę"},"PANEL:TITLE:details":function(n){return"Szczegóły dostawcy"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania dostawcy"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji dostawcy"},"PROPERTY:_id":function(n){return"Nr dostawcy"},"PROPERTY:name":function(n){return"Nazwa"},"FORM:ACTION:add":function(n){return"Dodaj dostawcę"},"FORM:ACTION:edit":function(n){return"Edytuj dostawcę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać dostawcy."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować dostawcy."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia dostawcy"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń dostawcę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego dostawcę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć dostawcę <em>"+t.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć dostawcy."},"select2:placeholder":function(n){return"Dowolny dostawca"}}});