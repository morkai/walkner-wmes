define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,o,u){return e.c(n,r),n[r]in u?u[n[r]]:(r=e.lc[o](n[r]-t),r in u?u[r]:u.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:browse":function(){return"WorkCentra"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie WorkCentrów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie WorkCenter nie powiodło się :("},"MSG:DELETED":function(n){return"WorkCenter <em>"+e.v(n,"label")+"</em> zostało usunięte."},"PAGE_ACTION:add":function(){return"Dodaj WorkCenter"},"PAGE_ACTION:edit":function(){return"Edytuj WorkCenter"},"PAGE_ACTION:delete":function(){return"Usuń WorkCenter"},"PANEL:TITLE:details":function(){return"Szczegóły WorkCenter"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania WorkCenter"},"PANEL:TITLE:editForm":function(){return"Formularz edycji WorkCenter"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:description":function(){return"Opis"},"PROPERTY:orgUnitPath":function(){return"Kontroler MRP/Przepływ"},"PROPERTY:deactivatedAt":function(){return"Data dezaktywacji"},"FORM:ACTION:add":function(){return"Dodaj WorkCenter"},"FORM:ACTION:edit":function(){return"Edytuj WorkCenter"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać WorkCenter :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować WorkCenter :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia WorkCenter"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń WorkCenter"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane WorkCenter?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć WorkCenter <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć WorkCenter :-("}}});