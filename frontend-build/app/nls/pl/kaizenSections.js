define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,i){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(i||0)},v:function(n,i){return e.c(n,i),n[i]},p:function(n,i,u,r,t){return e.c(n,i),n[i]in t?t[n[i]]:(i=e.lc[r](n[i]-u))in t?t[i]:t.other},s:function(n,i,u){return e.c(n,i),n[i]in u?u[n[i]]:u.other}};return{"BREADCRUMBS:base":function(n){return"Usprawnienia"},"BREADCRUMBS:browse":function(n){return"Działy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie działów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie działu nie powiodło się."},"MSG:DELETED":function(n){return"Dział <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj dział"},"PAGE_ACTION:edit":function(n){return"Edytuj dział"},"PAGE_ACTION:delete":function(n){return"Usuń dział"},"PANEL:TITLE:details":function(n){return"Szczegóły działu"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania działu"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji działu"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:position":function(n){return"Pozycja"},"PROPERTY:subdivisions":function(n){return"Działy WMES"},"FORM:ACTION:add":function(n){return"Dodaj dział"},"FORM:ACTION:edit":function(n){return"Edytuj dział"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać działu."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować działu."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia działu"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń dział"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany dział?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć dział <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć działu."}}});