define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,u,t,o){return r.c(n,e),n[e]in o?o[n[e]]:(e=r.lc[t](n[e]-u),e in o?o[e]:o.other)},s:function(n,e,u){return r.c(n,e),n[e]in u?u[n[e]]:u.other}};return{"BREADCRUMBS:base":function(n){return"Baza Kanban"},"BREADCRUMBS:browse":function(n){return"Obszary zaopatrzenia"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:DELETED":function(n){return"Obszar <em>"+r.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj obszar"},"PAGE_ACTION:edit":function(n){return"Edytuj obszar"},"PAGE_ACTION:delete":function(n){return"Usuń obszar"},"PANEL:TITLE:details":function(n){return"Szczegóły obszaru"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania obszaru"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji obszaru"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:lines":function(n){return"Linie produkcyjne"},"filter:submit":function(n){return"Filtruj obszary"},"FORM:ACTION:add":function(n){return"Dodaj obszar"},"FORM:ACTION:edit":function(n){return"Edytuj obszar"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać obszaru."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować obszaru."},"FORM:ERROR:alreadyExists":function(n){return"Obszar o danym ID już istnieje."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia obszaru"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń obszar"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany obszar?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć obszar <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć obszaru."}}});