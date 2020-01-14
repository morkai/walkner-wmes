define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,i,u){return t.c(n,e),n[e]in u?u[n[e]]:(e=t.lc[i](n[e]-r))in u?u[e]:u.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{"BREADCRUMB:base":function(n){return"Narzędzia pomiarowe"},"BREADCRUMB:browse":function(n){return"Narzędzia pomiarowe"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"MSG:comment:failure":function(n){return"Nie udało się skomentować urządzenia."},"PAGE_ACTION:types":function(n){return"Typy urządzeń"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PANEL:TITLE:changes":function(n){return"Historia zmian urządzenia"},"FORM:attachment:old":function(n){return"Aktualny plik:"},"FORM:attachment:new":function(n){return"Nowy plik:"},"FORM:attachment:empty":function(n){return"nie załączono żadnego pliku."},"FORM:attachment:help":function(n){return"Wybierz nowy plik, tylko gdy chcesz zastąpić istniejący."},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:name":function(n){return"Nazwa urządzenia"},"PROPERTY:type":function(n){return"Typ urządzenia"},"PROPERTY:sn":function(n){return"Nr seryjny"},"PROPERTY:lastDate":function(n){return"Data ostatniej kalibracji"},"PROPERTY:nextDate":function(n){return"Data kolejnej kalibracji"},"PROPERTY:interval":function(n){return"Okres kalibracji"},"PROPERTY:intervalUnit":function(n){return"Jednostka okresu kalibracji"},"PROPERTY:users":function(n){return"Dysponent sprzętu"},"PROPERTY:individualUsers":function(n){return"Indywidualny dysponent sprzętu"},"PROPERTY:currentUsers":function(n){return"Aktualny dysponent sprzętu"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:remaining":function(n){return"Dni do kalibracji"},"PROPERTY:certificateFile":function(n){return"Skan certifikatu"},"status:in-use":function(n){return"W użyciu"},"status:retired":function(n){return"Wycofane"},"interval:unit:year":function(n){return"rok"},"interval:unit:month":function(n){return"miesiąc"},"interval:unit:week":function(n){return"tydzień"},"interval:unit:day":function(n){return"dzień"},"interval:year":function(n){return t.v(n,"v")+" "+t.p(n,"v",0,"pl",{one:"rok",few:"lata",other:"lat"})},"interval:month":function(n){return t.v(n,"v")+" "+t.p(n,"v",0,"pl",{one:"miesiąc",few:"miesiące",other:"miesięcy"})},"interval:week":function(n){return t.v(n,"v")+" "+t.p(n,"v",0,"pl",{one:"tydzień",few:"tygodnie",other:"tygodni"})},"interval:day":function(n){return t.v(n,"v")+" "+t.p(n,"v",0,"pl",{one:"dzień",other:"dni"})},"filter:user:mine":function(n){return"Moje"},"filter:user:others":function(n){return"Użytkownik"},"filter:date:last":function(n){return"Data ostatniej"},"filter:date:next":function(n){return"Data kolejnej"},"filter:submit":function(n){return"Filtruj"},"history:added":function(n){return"utworzenie urządzenia."},"history:submit":function(n){return"Komentuj"},"settings:tab:notifier":function(n){return"Powiadamianie"},"settings:notifier:daysBefore":function(n){return"Odstęp powiadomień"},"settings:notifier:daysBefore:help":function(n){return"Ilość dni przed kolejną datą kalibracji, na podstawie których określane są urządzenia, do których mają zostać wysłane powiadomienia o zbliżającej się kalibracji. Powiadomienia wysyłane są codziennie o 05:30. Można zdefiniować listę dni."}}});