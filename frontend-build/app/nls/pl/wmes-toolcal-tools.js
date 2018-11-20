define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[i](n[t]-r))in u?u[t]:u.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Narzędzia pomiarowe"},"BREADCRUMBS:browse":function(n){return"Narzędzia pomiarowe"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:DELETED":function(n){return"Urządzenie <em>"+e.v(n,"label")+"</em> zostało usunięte."},"MSG:jump:404":function(n){return"Nie znaleziono urządzenia o ID <em>"+e.v(n,"rid")+"</em>."},"MSG:comment:failure":function(n){return"Nie udało się skomentować urządzenia."},"PAGE_ACTION:export":function(n){return"Eksportuj urządzenia"},"PAGE_ACTION:add":function(n){return"Dodaj urządzenie"},"PAGE_ACTION:edit":function(n){return"Edytuj urządzenie"},"PAGE_ACTION:delete":function(n){return"Usuń urządzenie"},"PAGE_ACTION:types":function(n){return"Typy urządzeń"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:jump:title":function(n){return"Skocz do urządzenia po ID"},"PAGE_ACTION:jump:placeholder":function(n){return"ID urządzenia"},"PANEL:TITLE:details":function(n){return"Szczegóły urządzenia"},"PANEL:TITLE:changes":function(n){return"Historia zmian urządzenia"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania urządzenia"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji urządzenia"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa urządzenia"},"PROPERTY:type":function(n){return"Typ urządzenia"},"PROPERTY:sn":function(n){return"Nr seryjny"},"PROPERTY:lastDate":function(n){return"Data ostatniej kalibracji"},"PROPERTY:nextDate":function(n){return"Data kolejnej kalibracji"},"PROPERTY:interval":function(n){return"Okres kalibracji"},"PROPERTY:intervalUnit":function(n){return"Jednostka okresu kalibracji"},"PROPERTY:users":function(n){return"Użytkownicy urządzenia"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:remaining":function(n){return"Dni do kalibracji"},"status:in-use":function(n){return"W użyciu"},"status:retired":function(n){return"Wycofane"},"interval:unit:year":function(n){return"rok"},"interval:unit:month":function(n){return"miesiąc"},"interval:unit:week":function(n){return"tydzień"},"interval:unit:day":function(n){return"dzień"},"interval:year":function(n){return e.v(n,"v")+" "+e.p(n,"v",0,"pl",{one:"rok",few:"lata",other:"lat"})},"interval:month":function(n){return e.v(n,"v")+" "+e.p(n,"v",0,"pl",{one:"miesiąc",few:"miesiące",other:"miesięcy"})},"interval:week":function(n){return e.v(n,"v")+" "+e.p(n,"v",0,"pl",{one:"tydzień",few:"tygodnie",other:"tygodni"})},"interval:day":function(n){return e.v(n,"v")+" "+e.p(n,"v",0,"pl",{one:"dzień",other:"dni"})},"FORM:ACTION:add":function(n){return"Dodaj urządzenie"},"FORM:ACTION:edit":function(n){return"Edytuj urządzenie"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać urządzenia."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować urządzenia."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia urządzenia"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń urządzenie"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane urządzenie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć urządzenie <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć urządzenia."},"filter:user:mine":function(n){return"Moje"},"filter:user:others":function(n){return"Użytkownik"},"filter:date:last":function(n){return"Data ostatniej"},"filter:date:next":function(n){return"Data kolejnej"},"filter:submit":function(n){return"Filtruj"},"history:added":function(n){return"utworzenie urządzenia."},"history:editMessage":function(n){return"Tutaj możesz dodać komentarz do urządzenia. Jeżeli chcesz także zmienić jakieś właściwości, <a href='"+e.v(n,"editUrl")+"'>to skorzystaj z formularza edycji</a>."},"history:submit":function(n){return"Komentuj"},"settings:tab:notifier":function(n){return"Powiadamianie"},"settings:notifier:daysBefore":function(n){return"Odstęp powiadomień"},"settings:notifier:daysBefore:help":function(n){return"Ilość dni przed kolejną datą kalibracji, na podstawie których określane są urządzenia, do których mają zostać wysłane powiadomienia o zbliżającej się kalibracji. Powiadomienia wysyłane są codziennie o 05:30. Można zdefiniować listę dni."}}});