define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,i,t,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[t](n[r]-i),r in o?o[r]:o.other)},s:function(n,r,i){return e.c(n,r),n[r]in i?i[n[r]]:i.other}};return{"BREADCRUMBS:browse":function(n){return"Nieprawidłowe zlecenia"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie nieprawidłowych zleceń nie powiodło się :("},"PAGE_ACTION:check":function(n){return"Sprawdź zlecenia"},"PAGE_ACTION:notify":function(n){return"Powiadom osoby odpowiedzialne"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"ACTION_FORM:DIALOG_TITLE:ignore":function(n){return"Ignorowanie zlecenia"},"ACTION_FORM:MESSAGE_SPECIFIC:ignore":function(n){return"Czy na pewno chcesz zignorować zlecenie "+e.v(n,"label")+"?"},"ACTION_FORM:BUTTON:ignore":function(n){return"Ignoruj zlecenie"},"ACTION_FORM:MESSAGE_FAILURE:ignore":function(n){return"Nie udało się zignorować zlecenia :("},"ACTION_FORM:DIALOG_TITLE:notify":function(n){return"Powiadamianie osób odpowiedzialnych"},"ACTION_FORM:MESSAGE_SPECIFIC:notify":function(n){return"Czy na pewno chcesz wysłać powiadomienia do zleceń: "+e.v(n,"orders")+"?"},"ACTION_FORM:BUTTON:notify":function(n){return"Wyślij powiadomienia"},"ACTION_FORM:MESSAGE_FAILURE:notify":function(n){return"Nie udało się wysłać powiadomień :("},"ACTION_FORM:DIALOG_TITLE:check":function(n){return"Sprawdzanie zleceń"},"ACTION_FORM:MESSAGE:check":function(n){return"Czy na pewno chcesz ponownie sprawdzić wszystkie zlecenia?"},"ACTION_FORM:BUTTON:check":function(n){return"Sprawdź zlecenia"},"ACTION_FORM:MESSAGE_FAILURE:check":function(n){return"Nie udało się sprawdzić zleceń :("},"PROPERTY:orderNo":function(n){return"Nr zlecenia"},"PROPERTY:productName":function(n){return"Nazwa wyrobu"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:startDate":function(n){return"Data startu"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:problem":function(n){return"Problem"},"PROPERTY:solution":function(n){return"Rozwiązanie"},"PROPERTY:iptStatus":function(n){return"Status IPT"},"PROPERTY:iptComment":function(n){return"Komentarz IPT"},"status:invalid":function(n){return"Błąd"},"status:ignored":function(n){return"Zignorowane"},"status:resolved":function(n){return"Rozwiązane"},"problem:MISSING":function(n){return"Brak zlecenia"},"problem:EMPTY":function(n){return"Brak operacji"},"solution:DONE":function(n){return"Wykonanie wymaganej ilości."},"solution:STATUS":function(n){return"CNF, DLV lub TECO."},"solution:OPERATIONS":function(n){return"Pojawienie się operacji."},"filter:ownMrps":function(n){return"moje"},"filter:submit":function(n){return"Filtruj zlecenia"},"LIST:ACTION:select":function(n){return"Oznacz do powiadomienia"},"LIST:ACTION:ignore":function(n){return"Ignoruj"}}});