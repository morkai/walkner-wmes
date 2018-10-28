define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,i,o){return t.c(n,e),n[e]in o?o[n[e]]:(e=t.lc[i](n[e]-r))in o?o[e]:o.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{"BREADCRUMBS:operator":function(n){return"Operator"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:browse":function(n){return"Sprawdzanie komponentów"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:DELETED":function(n){return"Strategia <em>"+t.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(n){return"Dodaj strategię"},"PAGE_ACTION:edit":function(n){return"Edytuj strategię"},"PAGE_ACTION:delete":function(n){return"Usuń strategię"},"PANEL:TITLE:details":function(n){return"Szczegóły strategii"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania strategii"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji strategii"},"filter:submit":function(n){return"Filtruj strategie"},"PROPERTY:active":function(n){return"Aktywna?"},"PROPERTY:description":function(n){return"Opis"},"PROPERTY:mrp":function(n){return"MRP zlecenia"},"PROPERTY:nc12":function(n){return"12NC zlecenia"},"PROPERTY:name":function(n){return"Wzorce nazwy zlecenia"},"PROPERTY:line":function(n){return"Linie produkcyjne"},"PROPERTY:components":function(n){return"Komponenty"},"PROPERTY:components.description":function(n){return"Opis"},"PROPERTY:components.nc12":function(n){return"12NC"},"PROPERTY:components.pattern":function(n){return"Wzorzec komponentu"},"PROPERTY:components.labelPattern":function(n){return"Wzorzec etykiety"},"PROPERTY:components.nc12Index":function(n){return"Nr grupy 12NC"},"PROPERTY:components.snIndex":function(n){return"Nr grupy SN"},"PROPERTY:components.unique":function(n){return"Unikalny?"},"PROPERTY:components.single":function(n){return"Tylko 1?"},"FORM:ACTION:add":function(n){return"Dodaj strategię"},"FORM:ACTION:edit":function(n){return"Edytuj strategię"},"FORM:ACTION:addComponent":function(n){return"Dodaj komponent"},"FORM:ACTION:removeComponent":function(n){return"Usuń komponent"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać strategii."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować strategii."},"FORM:ERROR:pattern":function(n){return"Nieprawidłowy wzorzec."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia strategii"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń strategię"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną strategię?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć strategię <em>"+t.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć strategii."}}});