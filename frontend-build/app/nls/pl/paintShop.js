define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,o,u){return e.c(n,r),n[r]in u?u[n[r]]:(r=e.lc[o](n[r]-t),r in u?u[r]:u.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Malarnia"},"BREADCRUMBS:queue":function(n){return"Kolejka zleceń"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie zleceń nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie zlecenia nie powiodło się."},"MSG:LOADING_FAILURE:dropZones":function(n){return"Ładowanie drop zone nie powiodło się."},"MSG:start:failure":function(n){return"Nie udało się rozpocząć zlecenia."},"MSG:finish:failure":function(n){return"Nie udało się zakończyć zlecenia."},"MSG:reset:failure":function(n){return"Nie udało się zresetować zlecenia."},"MSG:cancel:failure":function(n){return"Nie udało się zignorować zlecenia."},"MSG:search:failure":function(n){return"Nie znaleziono zlecenia."},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:nc12":function(n){return"12NC wyrobu"},"PROPERTY:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:qtyDone":function(n){return"Ilość pomalowana"},"PROPERTY:mrp":function(n){return"Przepływ"},"PROPERTY:startTime":function(n){return"Początek montażu"},"PROPERTY:placement":function(n){return"Położenie"},"PROPERTY:no":function(n){return"Nr"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:comment":function(n){return"Komentarz"},"status:new":function(n){return"Do realizacji"},"status:started":function(n){return"W realizacji"},"status:finished":function(n){return"Zrealizowane"},"status:cancelled":function(n){return"Anulowane"},"action:start":function(n){return"Rozpocznij"},"action:finish":function(n){return"Zakończ"},"action:cancel":function(n){return"Ignoruj"},"action:reset":function(n){return"Resetuj"},"action:continue":function(n){return"Kontynuuj"},"action:comment":function(n){return"Komentuj"},"datePicker:d0":function(n){return"Dzisiaj"},"datePicker:d+1":function(n){return"Jutro"},"datePicker:d+2":function(n){return"Pojutrze"},"datePicker:d-1":function(n){return"Wczoraj"},"datePicker:d-2":function(n){return"Przedwczoraj"},"datePicker:submit":function(n){return"Wybierz datę"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"rrrr"},"datePicker:invalid":function(n){return"Podaj prawidłową datę."},"tabs:all":function(n){return"Wszystkie"},"tabs:dropZone":function(n){return"Drop zone wywołany"},empty:function(n){return"Brak zleceń dla wybranego dnia."},multiPaint:function(n){return"UWAGA! Zlecenie z "+e.p(n,"count",0,"pl",{one:"jedną farbą",2:"dwiema farbami",other:e.v(n,"count")+" farbami"})+"."},"orderChanges:change":function(n){return e.s(n,"type",{start:"Rozpoczęto",finish:"Zakończono",cancel:"Zignorowano",reset:"Zresetowano",comment:"Skomentowano",other:"Zmieniono"})+" <time title='"+e.v(n,"timeLong")+"'>"+e.v(n,"timeAgo")+"</time> przez "+e.v(n,"user")},"menu:header:mrp":function(n){return e.v(n,"mrp")},"menu:header:all":function(n){return"Wszystkie przepływy"},"menu:copyOrders":function(n){return"Kopiuj nr zleceń"},"menu:copyOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:copyChildOrders":function(n){return"Kopiuj nr podzleceń"},"menu:copyChildOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:printOrder":function(n){return"Drukuj zlecenie"},"menu:printOrders":function(n){return"Drukuj zlecenia"},"menu:printOrders:all":function(n){return"Drukuj wszystkie zlecenia"},"menu:printOrders:mrp":function(n){return"Drukuj zlecenia "+e.v(n,"mrp")},"menu:dropZone:true":function(n){return"Odwołaj drop zone"},"menu:dropZone:false":function(n){return"Wywołaj drop zone"},"menu:dropZone:failure":function(n){return"Nie udało się zmienić drop zone."},"parent:switchApps":function(n){return"Zmień aplikację/Konfiguruj po 3s"},"parent:reboot":function(n){return"Odśwież stronę/Restartuj komputer po 3s"},"parent:shutdown":function(n){return"Wyłącz komputer po 3s"}}});