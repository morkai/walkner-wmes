define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,i,t,u){return r.c(n,e),n[e]in u?u[n[e]]:(e=r.lc[t](n[e]-i),e in u?u[e]:u.other)},s:function(n,e,i){return r.c(n,e),n[e]in i?i[n[e]]:i.other}};return{"BREADCRUMBS:browse":function(n){return"Firmy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie firm nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie firmy nie powiodło się."},"MSG:DELETED":function(n){return"Firma <em>"+r.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(n){return"Dodaj firmę"},"PAGE_ACTION:edit":function(n){return"Edytuj firmę"},"PAGE_ACTION:delete":function(n){return"Usuń firmę"},"PANEL:TITLE:details":function(n){return"Szczegóły firmy"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania firmy"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji firmy"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:shortName":function(n){return"Krótka nazwa"},"PROPERTY:color":function(n){return"Kolor"},"FORM:ACTION:add":function(n){return"Dodaj firmę"},"FORM:ACTION:edit":function(n){return"Edytuj firmę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać firmy."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować firmy."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia firmy"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń firmę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną firmę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć firmę <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć firmy."}}});