define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,t,s){return e.c(n,r),n[r]in s?s[n[r]]:(r=e.lc[t](n[r]-o),r in s?s[r]:s.other)},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{shift:function(n){return e.v(n,"shift")+"<br>zmiana"},line:function(n){return"Linia:"},title:function(n){return"Wydajność godzinowa "+e.v(n,"from")+"-"+e.v(n,"to")},planned:function(n){return"Ilość zaplanowana [szt]"},actual:function(n){return"Ilość zrobiona [szt]"},remaining:function(n){return"Do końca zmiany pozostało:"},unit:function(n){return"szt"},"controls:switchApps":function(n){return"Zmień aplikację/Konfiguruj po 3s"},"controls:reboot":function(n){return"Odśwież stronę/Restartuj komputer po 3s"},"controls:shutdown":function(n){return"Wyłącz komputer po 3s"},"snMessage:scannedValue":function(n){return"Zeskanowana wartość"},"snMessage:orderNo":function(n){return"Zlecenie"},"snMessage:serialNo":function(n){return"Numer"},"snMessage:UNKNOWN_CODE":function(n){return"Zeskanowany kod nie zawiera numeru seryjnego."},"snMessage:INVALID_LINE_STATE":function(n){return"Nieprawidłowa zmiana produkcyjna lub zlecenie."},"snMessage:INVALID_STATE:idle":function(n){return"Rozpocznij zlecenie, aby móc skanować numery seryjne."},"snMessage:INVALID_STATE:downtime":function(n){return"Zakończ przestój, aby móc skanować numery seryjne."},"snMessage:INVALID_ORDER":function(n){return"Zeskanowano numer seryjny z nieprawidłowego zlecenia."},"snMessage:ALREADY_USED":function(n){return"Zeskanowany numer seryjny został już użyty."},"snMessage:CHECKING":function(n){return"<span class='fa fa-spinner fa-spin'></span><br>Sprawdzanie numeru seryjnego..."},"snMessage:SERVER_FAILURE":function(n){return"Błąd podczas sprawdzania numeru seryjnego."},"snMessage:SHIFT_NOT_FOUND":function(n){return"Nie znaleziono zmiany z linii."},"snMessage:ORDER_NOT_FOUND":function(n){return"Nie znaleziono zlecenia z linii."},"snMessage:STANDARD_LABEL":function(n){return"Nie można używać wirtualnego numeru seryjnego w tym zleceniu."},"snMessage:SUCCESS":function(n){return"Numer seryjny został pomyślnie zarejestrowany."}}});