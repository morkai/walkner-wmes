define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,i,r,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[r](n[t]-i),t in u?u[t]:u.other)},s:function(n,t,i){return e.c(n,t),n[t]in i?i[n[t]]:i.other}};return{"BREADCRUMBS:base":function(){return"Dokumentacja"},"BREADCRUMBS:browse":function(){return"Klienci"},"MSG:LOADING_FAILURE":function(){return"Ładowanie klientów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie klienta nie powiodło się :("},"page:settings":function(){return"Zmień ustawienia"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:status":function(){return"Status"},"PROPERTY:prodLine":function(){return"Linia"},"PROPERTY:lastSeenAt":function(){return"Ostatnio widziany"},"PROPERTY:fileSource":function(){return"Źródło pliku"},"PROPERTY:orderNo":function(){return"Nr zlecenia"},"PROPERTY:orderNc12":function(){return"12NC zlecenia"},"PROPERTY:orderName":function(){return"Nazwa zlecenia"},"PROPERTY:documentNc15":function(){return"15NC dokumentu"},"PROPERTY:documentName":function(){return"Nazwa dokumentu"},"status:online":function(){return"Online"},"status:offline":function(){return"Offline"},"fileSource:local":function(){return"Plik lokalny"},"fileSource:remote":function(){return"Plik zdalny"},"fileSource:search":function(){return"Wyszukiwarka TPD"},"filter:submit":function(){return"Filtruj klientów"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia klienta"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń klietna"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego klienta?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć klienta <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć klienta :-("},licensingMessage:function(n){return"Aktualna liczba dodanych klientów ("+e.v(n,"clientCount")+") jest większa od liczby wykupionych licencji ("+e.v(n,"licenseCount")+")!"}}});