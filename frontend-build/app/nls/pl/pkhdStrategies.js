define(["app/nls/locale/pl"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,i,u){return n.c(t,e),t[e]in u?u[t[e]]:(e=n.lc[i](t[e]-r),e in u?u[e]:u.other)},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{"BREADCRUMBS:browse":function(t){return"Strategie dost. komponentów"},"BREADCRUMBS:addForm":function(t){return"Dodawanie"},"BREADCRUMBS:editForm":function(t){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(t){return"Usuwanie"},"MSG:DELETED":function(t){return"Strategia <em>"+n.v(t,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(t){return"Dodaj strategię"},"PAGE_ACTION:edit":function(t){return"Edytuj strategię"},"PAGE_ACTION:delete":function(t){return"Usuń strategię"},"PANEL:TITLE:details":function(t){return"Szczegóły strategii"},"PANEL:TITLE:addForm":function(t){return"Formularz dodawania strategię"},"PANEL:TITLE:editForm":function(t){return"Formularz edycji strategię"},"filter:submit":function(t){return"Filtruj strategie"},"PROPERTY:s":function(t){return"Mat. Staging Indicat."},"PROPERTY:t":function(t){return"Storage Type"},"PROPERTY:name":function(t){return"Nazwa"},"FORM:ACTION:add":function(t){return"Dodaj strategię"},"FORM:ACTION:edit":function(t){return"Edytuj strategię"},"FORM:ERROR:addFailure":function(t){return"Nie udało się dodać strategii."},"FORM:ERROR:editFailure":function(t){return"Nie udało się zmodyfikować strategii."},"FORM:ERROR:alreadyExists":function(t){return"Dana strategia już istnieje."},"ACTION_FORM:DIALOG_TITLE:delete":function(t){return"Potwierdzenie usunięcia strategii"},"ACTION_FORM:BUTTON:delete":function(t){return"Usuń strategię"},"ACTION_FORM:MESSAGE:delete":function(t){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną strategię?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Czy na pewno chcesz bezpowrotnie usunąć strategię <em>"+n.v(t,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(t){return"Nie udało się usunąć strategii."}}});