define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,i,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[i](n[r]-t),r in o?o[r]:o.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:base":function(){return"Usprawnienia"},"BREADCRUMBS:browse":function(){return"Kategorie"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie kategorii nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie kategorii nie powiodło się :("},"MSG:DELETED":function(n){return"Kategoria <em>"+e.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(){return"Dodaj kategorię"},"PAGE_ACTION:edit":function(){return"Edytuj kategorię"},"PAGE_ACTION:delete":function(){return"Usuń kategorię"},"PANEL:TITLE:details":function(){return"Szczegóły kategorii"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania kategorii"},"PANEL:TITLE:editForm":function(){return"Formularz edycji kategorii"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:name":function(){return"Nazwa"},"PROPERTY:description":function(){return"Opis"},"PROPERTY:inNearMiss":function(){return"W zdarzeniach potencjalnie wypadkowych?"},"PROPERTY:inSuggestion":function(){return"W sugestiach?"},"PROPERTY:position":function(){return"Pozycja"},"FORM:ACTION:add":function(){return"Dodaj kategorię"},"FORM:ACTION:edit":function(){return"Edytuj kategorię"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać kategorii :("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować kategorii :("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia kategorii"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń kategorię"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną kategorię?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć kategorię <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć kategorii :("}}});