define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,i,r,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[r](n[t]-i),t in u?u[t]:u.other)},s:function(n,t,i){return e.c(n,t),n[t]in i?i[n[t]]:i.other}};return{"BREADCRUMBS:base":function(n){return"Dokumentacja"},"BREADCRUMBS:browse":function(n){return"Klienci"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie klientów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie klienta nie powiodło się :("},"page:settings":function(n){return"Zmień ustawienia"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:prodLine":function(n){return"Linia"},"PROPERTY:lastSeenAt":function(n){return"Ostatnio widziany"},"PROPERTY:fileSource":function(n){return"Źródło pliku"},"PROPERTY:orderNo":function(n){return"Nr zlecenia"},"PROPERTY:orderNc12":function(n){return"12NC zlecenia"},"PROPERTY:orderName":function(n){return"Nazwa zlecenia"},"PROPERTY:documentNc15":function(n){return"15NC dokumentu"},"PROPERTY:documentName":function(n){return"Nazwa dokumentu"},"status:online":function(n){return"Online"},"status:offline":function(n){return"Offline"},"fileSource:local":function(n){return"Plik lokalny"},"fileSource:remote":function(n){return"Plik zdalny"},"fileSource:search":function(n){return"Wyszukiwarka TPD"},"filter:submit":function(n){return"Filtruj klientów"},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia klienta"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń klietna"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego klienta?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć klienta <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć klienta :-("},licensingMessage:function(n){return"Aktualna liczba dodanych klientów ("+e.v(n,"clientCount")+") jest większa od liczby wykupionych licencji ("+e.v(n,"licenseCount")+")!"}}});