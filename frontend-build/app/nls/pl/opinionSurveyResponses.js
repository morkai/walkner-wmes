define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,i,t){return e.c(n,r),n[r]in t?t[n[r]]:(r=e.lc[i](n[r]-o),r in t?t[r]:t.other)},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{"BREADCRUMBS:base":function(){return"Badanie Opinia"},"BREADCRUMBS:browse":function(){return"Odpowiedzi"},"BREADCRUMBS:details":function(){return"Odpowiedź"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie odpowiedzi nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie odpowiedzi nie powiodło się :("},"MSG:DELETED":function(){return"Odpowiedź została usunięta."},"PAGE_ACTION:add":function(){return"Dodaj odpowiedź"},"PAGE_ACTION:edit":function(){return"Edytuj odpowiedź"},"PAGE_ACTION:delete":function(){return"Usuń odpowiedź"},"PANEL:TITLE:details":function(){return"Szczegóły odpowiedzi"},"PANEL:TITLE:answers":function(){return"Odpowiedzi do ankiety"},"PANEL:TITLE:comment":function(){return"Komentarz"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania odpowiedzi"},"PANEL:TITLE:editForm":function(){return"Formularz edycji odpowiedzi"},"PROPERTY:creator":function(){return"Dodający"},"PROPERTY:createdAt":function(){return"Czas dodania"},"PROPERTY:comment":function(){return"Komentarz"},"PROPERTY:survey":function(){return"Badanie"},"PROPERTY:division":function(){return"Wydział"},"PROPERTY:superior":function(){return"Przełożony"},"PROPERTY:employer":function(){return"Pracodawca"},"PROPERTY:answer":function(){return"Odpowiedź"},"FORM:ACTION:add":function(){return"Dodaj odpowiedź"},"FORM:ACTION:edit":function(){return"Edytuj odpowiedź"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać odpowiedzi :("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować odpowiedzi :("},"form:preview:tab":function(n){return"Strona "+e.v(n,"pageNumber")},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia odpowiedzi"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń odpowiedź"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną odpowiedź?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną odpowiedź?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć odpowiedzi :("},"filter:submit":function(){return"Filtruj odpowiedzi"},noComment:function(){return"Brak komentarza."},"answer:yes":function(){return"Zgadzam się"},"answer:no":function(){return"Nie zgadzam się"},"answer:na":function(){return"Nie mam zdania"},"answer:null":function(){return"?"}}});