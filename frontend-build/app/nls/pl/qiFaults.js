define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,u,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[u](n[t]-r))in i?i[t]:i.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Inspekcja Jakości"},"BREADCRUMBS:browse":function(n){return"Wady"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie wad nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie wady nie powiodło się."},"MSG:DELETED":function(n){return"Wada <em>"+e.v(n,"label")+"</em> została usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj wadę"},"PAGE_ACTION:edit":function(n){return"Edytuj wadę"},"PAGE_ACTION:delete":function(n){return"Usuń wadę"},"PANEL:TITLE:details":function(n){return"Szczegóły wady"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania wady"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji wady"},"PROPERTY:_id":function(n){return"Kod wady"},"PROPERTY:name":function(n){return"Klasyfikacja wady"},"PROPERTY:description":function(n){return"Opis wady"},"PROPERTY:active":function(n){return"Aktywna?"},"active:true":function(n){return"Aktywna"},"active:false":function(n){return"Nieaktywna"},"FORM:ACTION:add":function(n){return"Dodaj wadę"},"FORM:ACTION:edit":function(n){return"Edytuj wadę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać wady."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować wady."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wady"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wadę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną wadę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wadę <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wady."}}});