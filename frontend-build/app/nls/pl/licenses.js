define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,i,o,t){return e.c(n,r),n[r]in t?t[n[r]]:(r=e.lc[o](n[r]-i),r in t?t[r]:t.other)},s:function(n,r,i){return e.c(n,r),n[r]in i?i[n[r]]:i.other}};return{"BREADCRUMBS:browse":function(){return"Licencje"},"MSG:LOADING_FAILURE":function(){return"Ładowanie licencji nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie licencji nie powiodło się :("},"PROPERTY:":function(){return""},"filter:submit":function(){return"Filtruj licencje"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia licencji"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń licencję"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną licencję?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć licencję <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć licencji :-("},"error:NO_KEY":function(){return"Brak klucza licencji."},"error:INVALID_ED_PEM":function(){return"Nieprawidłowy klucz odszyfrowywania."},"error:APP_ID":function(){return"Ustawiona licencja nie została przydzielona do uruchomionej aplikacji."},"error:APP_VERSION":function(){return"Ustawiona licencja nie obejmuje aktualnie uruchomionej wersji aplikacji."},"error:UNKNOWN_LICENSE":function(){return"Licencja nie została rozpoznana przez zewnętrzy serwer."},"error:DUPLICATE_LICENSE":function(){return"Zewnętrzny serwer wykrył zduplikowane licencje."}}});