define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,i,t){return e.c(n,r),n[r]in t?t[n[r]]:(r=e.lc[i](n[r]-o),r in t?t[r]:t.other)},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{"BREADCRUMBS:browse":function(){return"Plany godzinowe"},"BREADCRUMBS:addForm":function(){return"Wybieranie planu"},"BREADCRUMBS:editForm":function(){return"Planowanie"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie planów godzinowych nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie planu godzinowego nie powiodło się :("},"MSG:DELETED":function(n){return"Plan godzinowy <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:print":function(){return"Pokaż wersję do druku"},"PAGE_ACTION:add":function(){return"Planuj"},"PAGE_ACTION:edit":function(){return"Edytuj plan"},"PAGE_ACTION:delete":function(){return"Usuń plan"},"PAGE_ACTION:export":function(){return"Eksportuj plany godzinowe"},"FILTER:DATE":function(){return"Data:"},"FILTER:LIMIT":function(){return"Limit:"},"FILTER:SHIFT":function(){return"Zmiana:"},"FILTER:BUTTON":function(){return"Filtruj plany"},"panel:title":function(){return"Plan godzinowy"},"panel:title:editable":function(){return"Formularz edycji planu godzinowego"},"panel:info":function(){return"Wszystkie zmiany w formularzu zapisywane są na bieżąco. Planowane ilości rozdzielone zostaną dla pracujących Linii produkcyjnych minutę po ostatniej zmianie!"},"column:flow":function(){return"Przepływ"},"column:noPlan":function(){return"Brak<br>planu?"},"column:level":function(){return"Poziom"},"property:shift":function(){return"Zmiana:"},"property:date":function(){return"Data:"},"print:hdLeft":function(n){return"Plan godzinowy dla "+e.v(n,"division")},"print:hdRight":function(n){return e.v(n,"date")+", "+e.v(n,"shift")+" zmiana"},"addForm:panel:title":function(){return"Formularz wyszukiwania/tworzenia planu godzinowego"},"addForm:submit":function(){return"Planuj"},"addForm:msg:offline":function(){return"Nie można planować: brak połączenia z serwerem :("},"addForm:msg:failure":function(n){return"Nie udało się znaleźć/utworzyć wpisu do edycji: "+e.s(n,"error",{AUTH:"brak uprawnień!",INPUT:"nieprawidłowe dane wejściowe!",other:e.v(n,"error")})},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia planu godzinowego"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń plan godzinowy"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany plan godzinowy?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć plan godzinowy <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć planu godzinowego :-("}}});