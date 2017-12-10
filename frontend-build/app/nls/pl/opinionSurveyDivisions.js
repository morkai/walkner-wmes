define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,u){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(u||0)},v:function(n,u){return e.c(n,u),n[u]},p:function(n,u,i,r,t){return e.c(n,u),n[u]in t?t[n[u]]:(u=e.lc[r](n[u]-i),u in t?t[u]:t.other)},s:function(n,u,i){return e.c(n,u),n[u]in i?i[n[u]]:i.other}};return{"BREADCRUMBS:base":function(n){return"Badanie Opinia"},"BREADCRUMBS:browse":function(n){return"Wydziały"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie wydziału nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie wydziału nie powiodło się."},"MSG:DELETED":function(n){return"Wydział <em>"+e.v(n,"label")+"</em> został usunięte."},"PAGE_ACTION:add":function(n){return"Dodaj wydział"},"PAGE_ACTION:edit":function(n){return"Edytuj wydział"},"PAGE_ACTION:delete":function(n){return"Usuń wydział"},"PANEL:TITLE:details":function(n){return"Szczegóły wydziału"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania wydziału"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji wydziału"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:full":function(n){return"Pełna nazwa"},"PROPERTY:short":function(n){return"Krótka nazwa"},"FORM:ACTION:add":function(n){return"Dodaj wydział"},"FORM:ACTION:edit":function(n){return"Edytuj wydział"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać wydziału."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować wydziału."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wydziału"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wydział"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany wydział?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wydział <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wydziału."}}});