define(["app/nls/locale/pl"],function(o){var n={lc:{pl:function(n){return o(n)}},c:function(o,n){if(!o)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(o,n,i){if(isNaN(o[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return o[n]-(i||0)},v:function(o,i){return n.c(o,i),o[i]},p:function(o,i,e,r,u){return n.c(o,i),o[i]in u?u[o[i]]:(i=n.lc[r](o[i]-e),i in u?u[i]:u.other)},s:function(o,i,e){return n.c(o,i),o[i]in e?e[o[i]]:e.other}};return{"BREADCRUMBS:browse":function(){return"Obszary odpowiedzialności"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie obszarów odpowiedzialności nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie obszaru odpowiedzialności nie powiodło się :("},"MSG:DELETED":function(o){return"Obszar odpowiedzialności <em>"+n.v(o,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(){return"Dodaj obszar odpowiedzialności"},"PAGE_ACTION:edit":function(){return"Edytuj obszar odpowiedzialności"},"PAGE_ACTION:delete":function(){return"Usuń obszar odpowiedzialności"},"PANEL:TITLE:details":function(){return"Szczegóły obszaru odpowiedzialności"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania obszaru odpowiedzialności"},"PANEL:TITLE:editForm":function(){return"Formularz edycji obszaru odpowiedzialności"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:name":function(){return"Nazwa"},"PROPERTY:description":function(){return"Opis"},"PROPERTY:color":function(){return"Kolor wartości"},"PROPERTY:refValue":function(){return"Referencja [FTE]"},"PROPERTY:refColor":function(){return"Kolor referencji"},"FORM:ACTION:add":function(){return"Dodaj obszar odpowiedzialności"},"FORM:ACTION:edit":function(){return"Edytuj obszar odpowiedzialności"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać obszaru odpowiedzialności :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować obszaru odpowiedzialności :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia obszaru odpowiedzialności"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń obszar odpowiedzialności"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany obszar odpowiedzialności?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(o){return"Czy na pewno chcesz bezpowrotnie usunąć obszar odpowiedzialności <em>"+n.v(o,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć obszaru odpowiedzialności :-("}}});