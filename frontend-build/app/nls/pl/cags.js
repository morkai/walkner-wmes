define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,u,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[u](n[r]-t),r in i?i[r]:i.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Planowane obciążenie linii"},"BREADCRUMBS:browse":function(n){return"CAG"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie CAGów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie CAGa nie powiodło się :("},"MSG:DELETED":function(n){return"Firma <em>"+e.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(n){return"Dodaj CAG"},"PAGE_ACTION:edit":function(n){return"Edytuj CAG"},"PAGE_ACTION:delete":function(n){return"Usuń CAG"},"PANEL:TITLE:details":function(n){return"Szczegóły CAGa"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania CAGa"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji CAGa"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa"},"FORM:ACTION:add":function(n){return"Dodaj CAG"},"FORM:ACTION:edit":function(n){return"Edytuj CAG"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać CAGa :-("},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować CAGa :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia CAGa"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń CAG"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany CAG?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć CAG <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć CAGa :-("}}});