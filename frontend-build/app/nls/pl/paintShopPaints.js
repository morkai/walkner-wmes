define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,u,i){return r.c(n,e),n[e]in i?i[n[e]]:(e=r.lc[u](n[e]-t),e in i?i[e]:i.other)},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Malarnia"},"BREADCRUMBS:browse":function(n){return"Farby"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie farb nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie farby nie powiodło się."},"MSG:DELETED":function(n){return"Farba <em>"+r.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(n){return"Dodaj farbę"},"PAGE_ACTION:edit":function(n){return"Edytuj farbę"},"PAGE_ACTION:delete":function(n){return"Usuń farbę"},"PAGE_ACTION:jump:title":function(n){return"Skocz do farby po 12NC"},"PAGE_ACTION:jump:placeholder":function(n){return"12NC farby..."},"PANEL:TITLE:details":function(n){return"Szczegóły farby"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania farby"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji farby"},"PROPERTY:_id":function(n){return"12NC"},"PROPERTY:shelf":function(n){return"Regał"},"PROPERTY:bin":function(n){return"Bin"},"PROPERTY:name":function(n){return"Nazwa"},"filter:submit":function(n){return"Filtruj farby"},"FORM:ACTION:add":function(n){return"Dodaj farbę"},"FORM:ACTION:edit":function(n){return"Edytuj farbę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać farby."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować farby."},"FORM:ERROR:alreadyExists":function(n){return"Farba o danym 12NC już istnieje."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia farby"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń farbę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną farbę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć farbę <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć farby."}}});