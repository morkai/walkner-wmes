define(["app/nls/locale/pl"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,u,r,o){return t.c(e,n),e[n]in o?o[e[n]]:(n=t.lc[r](e[n]-u),n in o?o[n]:o.other)},s:function(e,n,u){return t.c(e,n),e[n]in u?u[e[n]]:u.other}};return{"BREADCRUMBS:browse":function(e){return"Statusy zleceń"},"BREADCRUMBS:addForm":function(e){return"Dodawanie"},"BREADCRUMBS:editForm":function(e){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Usuwanie"},"MSG:LOADING_FAILURE":function(e){return"Ładowanie statusów zleceń nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Ładowanie statusu zleceń nie powiodło się."},"MSG:DELETED":function(e){return"Status zleceń <em>"+t.v(e,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(e){return"Dodaj status zleceń"},"PAGE_ACTION:edit":function(e){return"Edytuj status zleceń"},"PAGE_ACTION:delete":function(e){return"Usuń status zleceń"},"PANEL:TITLE:details":function(e){return"Szczegóły statusu zleceń"},"PANEL:TITLE:addForm":function(e){return"Formularz dodawania statusu zleceń"},"PANEL:TITLE:editForm":function(e){return"Formularz edycji statusu zleceń"},"PROPERTY:_id":function(e){return"Etykieta"},"PROPERTY:label":function(e){return"Opis"},"PROPERTY:color":function(e){return"Kolor"},"FORM:ACTION:add":function(e){return"Dodaj status zleceń"},"FORM:ACTION:edit":function(e){return"Edytuj status zleceń"},"FORM:ERROR:addFailure":function(e){return"Nie udało się dodać statusu zleceń."},"FORM:ERROR:editFailure":function(e){return"Nie udało się zmodyfikować statusu zleceń."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Potwierdzenie usunięcia statusu zleceń"},"ACTION_FORM:BUTTON:delete":function(e){return"Usuń status zleceń"},"ACTION_FORM:MESSAGE:delete":function(e){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany status zleceń?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Czy na pewno chcesz bezpowrotnie usunąć status zleceń <em>"+t.v(e,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Nie udało się usunąć statusu zleceń."}}});