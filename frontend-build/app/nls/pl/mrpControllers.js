define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,o,u){return r.c(n,e),n[e]in u?u[n[e]]:(e=r.lc[o](n[e]-t),e in u?u[e]:u.other)},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMBS:browse":function(){return"Kontrolery MRP"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie kontrolerów MRP nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie kontrolera MRP nie powiodło się :("},"MSG:DELETED":function(n){return"Kontroler MRP <em>"+r.v(n,"label")+"</em> zostało usunięte."},"PAGE_ACTION:add":function(){return"Dodaj kontroler MRP"},"PAGE_ACTION:edit":function(){return"Edytuj kontroler MRP"},"PAGE_ACTION:delete":function(){return"Usuń kontroler MRP"},"PAGE_ACTION:toggleDeactivated":function(){return"Ukryj dezaktywowane"},"PANEL:TITLE:details":function(){return"Szczegóły kontrolera MRP"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania kontrolera MRP"},"PANEL:TITLE:editForm":function(){return"Formularz edycji kontrolera MRP"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:description":function(){return"Opis"},"PROPERTY:division":function(){return"Wydział"},"PROPERTY:subdivision":function(){return"Dział"},"PROPERTY:deactivatedAt":function(){return"Data dezaktywacji"},"PROPERTY:replacedBy":function(){return"Zastąpiony przez"},"PROPERTY:inout":function(){return"Obszar"},"inout:-1":function(){return"Outdoor"},"inout:0":function(){return"Nie dotyczy"},"inout:1":function(){return"Indoor"},"FORM:ACTION:add":function(){return"Dodaj kontroler MRP"},"FORM:ACTION:edit":function(){return"Edytuj kontroler MRP"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać kontrolera MRP :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować kontrolera MRP :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia kontrolera MRP"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń kontroler MRP"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany kontroler MRP?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć kontroler MRP <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć kontrolera MRP :-("}}});