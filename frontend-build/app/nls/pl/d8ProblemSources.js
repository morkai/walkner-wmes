define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,e){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(e||0)},v:function(r,e){return n.c(r,e),r[e]},p:function(r,e,o,t,u){return n.c(r,e),r[e]in u?u[r[e]]:(e=n.lc[t](r[e]-o),e in u?u[e]:u.other)},s:function(r,e,o){return n.c(r,e),r[e]in o?o[r[e]]:o.other}};return{"BREADCRUMBS:base":function(r){return"8D"},"BREADCRUMBS:browse":function(r){return"Źródła problemów"},"BREADCRUMBS:addForm":function(r){return"Dodawanie"},"BREADCRUMBS:editForm":function(r){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(r){return"Usuwanie"},"MSG:LOADING_FAILURE":function(r){return"Ładowanie źródeł problemów nie powiodło się :-("},"MSG:LOADING_SINGLE_FAILURE":function(r){return"Ładowanie źródła problemów nie powiodło się :-("},"MSG:DELETED":function(r){return"Źródło problemów <em>"+n.v(r,"label")+"</em> zostało usunięte."},"PAGE_ACTION:add":function(r){return"Dodaj źródło problemów"},"PAGE_ACTION:edit":function(r){return"Edytuj źródło problemów"},"PAGE_ACTION:delete":function(r){return"Usuń źródło problemów"},"PANEL:TITLE:details":function(r){return"Szczegóły źródła problemów"},"PANEL:TITLE:addForm":function(r){return"Formularz dodawania źródła problemów"},"PANEL:TITLE:editForm":function(r){return"Formularz edycji źródła problemów"},"PROPERTY:_id":function(r){return"ID"},"PROPERTY:name":function(r){return"Nazwa"},"PROPERTY:position":function(r){return"Pozycja"},"FORM:ACTION:add":function(r){return"Dodaj źródło problemów"},"FORM:ACTION:edit":function(r){return"Edytuj źródło problemów"},"FORM:ERROR:addFailure":function(r){return"Nie udało się dodać źródła problemów :-("},"FORM:ERROR:editFailure":function(r){return"Nie udało się zmodyfikować źródła problemów :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(r){return"Potwierdzenie usunięcia źródła problemów"},"ACTION_FORM:BUTTON:delete":function(r){return"Usuń źródło problemów"},"ACTION_FORM:MESSAGE:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane źródło problemów?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć źródło problemów <em>"+n.v(r,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(r){return"Nie udało się usunąć źródła problemów :-("}}});