define(["app/nls/locale/pl"],function(o){var n={lc:{pl:function(n){return o(n)}},c:function(o,n){if(!o)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(o,n,i){if(isNaN(o[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return o[n]-(i||0)},v:function(o,i){return n.c(o,i),o[i]},p:function(o,i,e,r,u){return n.c(o,i),o[i]in u?u[o[i]]:(i=n.lc[r](o[i]-e))in u?u[i]:u.other},s:function(o,i,e){return n.c(o,i),o[i]in e?e[o[i]]:e.other}};return{"BREADCRUMBS:browse":function(o){return"Obszary odpowiedzialności"},"BREADCRUMBS:addForm":function(o){return"Dodawanie"},"BREADCRUMBS:editForm":function(o){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(o){return"Usuwanie"},"MSG:LOADING_FAILURE":function(o){return"Ładowanie obszarów odpowiedzialności nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(o){return"Ładowanie obszaru odpowiedzialności nie powiodło się."},"MSG:DELETED":function(o){return"Obszar odpowiedzialności <em>"+n.v(o,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(o){return"Dodaj obszar odpowiedzialności"},"PAGE_ACTION:edit":function(o){return"Edytuj obszar odpowiedzialności"},"PAGE_ACTION:delete":function(o){return"Usuń obszar odpowiedzialności"},"PANEL:TITLE:details":function(o){return"Szczegóły obszaru odpowiedzialności"},"PANEL:TITLE:addForm":function(o){return"Formularz dodawania obszaru odpowiedzialności"},"PANEL:TITLE:editForm":function(o){return"Formularz edycji obszaru odpowiedzialności"},"PROPERTY:_id":function(o){return"ID"},"PROPERTY:name":function(o){return"Nazwa"},"PROPERTY:description":function(o){return"Opis"},"PROPERTY:color":function(o){return"Kolor wartości"},"PROPERTY:refValue":function(o){return"Referencja [FTE]"},"PROPERTY:refColor":function(o){return"Kolor referencji"},"FORM:ACTION:add":function(o){return"Dodaj obszar odpowiedzialności"},"FORM:ACTION:edit":function(o){return"Edytuj obszar odpowiedzialności"},"FORM:ERROR:addFailure":function(o){return"Nie udało się dodać obszaru odpowiedzialności."},"FORM:ERROR:editFailure":function(o){return"Nie udało się zmodyfikować obszaru odpowiedzialności."},"ACTION_FORM:DIALOG_TITLE:delete":function(o){return"Potwierdzenie usunięcia obszaru odpowiedzialności"},"ACTION_FORM:BUTTON:delete":function(o){return"Usuń obszar odpowiedzialności"},"ACTION_FORM:MESSAGE:delete":function(o){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany obszar odpowiedzialności?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(o){return"Czy na pewno chcesz bezpowrotnie usunąć obszar odpowiedzialności <em>"+n.v(o,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(o){return"Nie udało się usunąć obszaru odpowiedzialności."}}});