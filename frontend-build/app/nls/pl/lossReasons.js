define(["app/nls/locale/pl"],function(t){var r={lc:{pl:function(r){return t(r)},en:function(r){return t(r)}},c:function(t,r){if(!t)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(t,r,o){if(isNaN(t[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return t[r]-(o||0)},v:function(t,o){return r.c(t,o),t[o]},p:function(t,o,n,e,a){return r.c(t,o),t[o]in a?a[t[o]]:(o=r.lc[e](t[o]-n),o in a?a[o]:a.other)},s:function(t,o,n){return r.c(t,o),t[o]in n?n[t[o]]:n.other}};return{"BREADCRUMBS:browse":function(t){return"Powody strat materiałowych"},"BREADCRUMBS:addForm":function(t){return"Dodawanie"},"BREADCRUMBS:editForm":function(t){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(t){return"Usuwanie"},"MSG:LOADING_FAILURE":function(t){return"Ładowanie powodów strat materiałowych nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(t){return"Ładowanie powodu strat materiałowych nie powiodło się."},"MSG:DELETED":function(t){return"Powód strat materiałowych <em>"+r.v(t,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(t){return"Dodaj powod strat materiałowych"},"PAGE_ACTION:edit":function(t){return"Edytuj powod strat materiałowych"},"PAGE_ACTION:delete":function(t){return"Usuń powod strat materiałowych"},"PANEL:TITLE:details":function(t){return"Szczegóły powodu strat materiałowych"},"PANEL:TITLE:addForm":function(t){return"Formularz dodawania powodu strat materiałowych"},"PANEL:TITLE:editForm":function(t){return"Formularz edycji powodu strat materiałowych"},"PROPERTY:_id":function(t){return"ID"},"PROPERTY:label":function(t){return"Opis"},"PROPERTY:position":function(t){return"Pozycja na karcie pracy"},"FORM:ACTION:add":function(t){return"Dodaj powod strat materiałowych"},"FORM:ACTION:edit":function(t){return"Edytuj powod strat materiałowych"},"FORM:ERROR:addFailure":function(t){return"Nie udało się dodać powodu strat materiałowych."},"FORM:ERROR:editFailure":function(t){return"Nie udało się zmodyfikować powodu strat materiałowych."},"ACTION_FORM:DIALOG_TITLE:delete":function(t){return"Potwierdzenie usunięcia powodu strat materiałowych"},"ACTION_FORM:BUTTON:delete":function(t){return"Usuń powod strat materiałowych"},"ACTION_FORM:MESSAGE:delete":function(t){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany powod strat materiałowych?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Czy na pewno chcesz bezpowrotnie usunąć powod strat materiałowych <em>"+r.v(t,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(t){return"Nie udało się usunąć powodu strat materiałowych."}}});