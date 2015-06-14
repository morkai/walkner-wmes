define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,i,c,t){return e.c(n,r),n[r]in t?t[n[r]]:(r=e.lc[c](n[r]-i),r in t?t[r]:t.other)},s:function(n,r,i){return e.c(n,r),n[r]in i?i[n[r]]:i.other}};return{"BREADCRUMBS:browse":function(){return"Licencje"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie licencji nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie licencji nie powiodło się :("},"MSG:DELETED":function(n){return"Licencja <em>"+e.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(){return"Dodaj licencję"},"PAGE_ACTION:edit":function(){return"Edytuj licencję"},"PAGE_ACTION:delete":function(){return"Usuń licencję"},"PANEL:TITLE:details":function(){return"Szczegóły licencji"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania licencji"},"PANEL:TITLE:editForm":function(){return"Formularz modyfikacji licencji"},"PROPERTY:_id":function(){return"ID licencji"},"PROPERTY:appId":function(){return"ID aplikacji"},"PROPERTY:appName":function(){return"Aplikacja"},"PROPERTY:appVersion":function(){return"Wersja aplikacji"},"PROPERTY:date":function(){return"Data wydania"},"PROPERTY:expireDate":function(){return"Data wygaśnięcia"},"PROPERTY:features":function(){return"Opcje"},"PROPERTY:licensee":function(){return"Licencjobiorca"},"PROPERTY:key":function(){return"Klucz licencyjny"},"filter:submit":function(){return"Filtruj licencje"},"FORM:ACTION:add":function(){return"Dodaj licencję"},"FORM:ACTION:edit":function(){return"Edytuj licencję"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia licencji"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń licencję"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną licencję?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć licencję <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć licencji :-("},"error:NO_KEY":function(){return"Brak klucza licencji."},"error:INVALID_ED_PEM":function(){return"Nieprawidłowy klucz odszyfrowywania."},"error:APP_ID":function(){return"Ustawiona licencja nie została przydzielona do uruchomionej aplikacji."},"error:APP_VERSION":function(){return"Ustawiona licencja nie obejmuje aktualnie uruchomionej wersji aplikacji."},"error:UNKNOWN_LICENSE":function(){return"Licencja nie została rozpoznana przez zewnętrzy serwer."},"error:DUPLICATE_LICENSE":function(){return"Zewnętrzny serwer wykrył zduplikowane licencje."},"app:msys-xiconf-lp":function(){return"Xiconf Label Printer"},"app:walkner-xiconf":function(){return"Walkner Xiconf"},"app:walkner-icpo":function(){return"Walkner ICPO"},"app:wmes-docs":function(){return"Dokumenty WMES"},"picker:unused":function(){return"Pokazuj tylko nieużywane licencje"},"picker:noData":function(){return"Brak pasujących licencji."},"picker:loading":function(){return"Ładowanie listy licencji..."}}});