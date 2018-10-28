define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,u,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[u](n[r]-t))in i?i[r]:i.other},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:browse":function(n){return"Przepływy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie przepływów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie przepływu nie powiodło się."},"MSG:DELETED":function(n){return"Przepływ <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj przepływ"},"PAGE_ACTION:edit":function(n){return"Edytuj przepływ"},"PAGE_ACTION:delete":function(n){return"Usuń przepływ"},"PAGE_ACTION:toggleDeactivated":function(n){return"Ukryj dezaktywowane"},"PANEL:TITLE:details":function(n){return"Szczegóły przepływu"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania przepływu"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji przepływu"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:subdivision":function(n){return"Dział"},"PROPERTY:mrpControllers":function(n){return"Kontrolery MRP"},"PROPERTY:deactivatedAt":function(n){return"Data dezaktywacji"},"FORM:ACTION:add":function(n){return"Dodaj przepływ"},"FORM:ACTION:edit":function(n){return"Edytuj przepływ"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać przepływu."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować przepływu."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia przepływu"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń przepływ"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany przepływ?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć przepływ <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć przepływu."}}});