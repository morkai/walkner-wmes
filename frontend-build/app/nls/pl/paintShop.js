define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,u){return t.c(n,r),n[r]in u?u[n[r]]:(r=t.lc[o](n[r]-e),r in u?u[r]:u.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Malarnia"},"BREADCRUMBS:load":function(n){return"Obciążenie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:date:failure":function(n){return"Nie udało się znaleźć daty."},"MSG:date:empty":function(n){return"Brak zleceń."},"MSG:start:failure":function(n){return"Nie udało się rozpocząć zlecenia."},"MSG:finish:failure":function(n){return"Nie udało się zakończyć zlecenia."},"MSG:reset:failure":function(n){return"Nie udało się zresetować zlecenia."},"MSG:cancel:failure":function(n){return"Nie udało się zignorować zlecenia."},"MSG:search:failure":function(n){return"Nie znaleziono zlecenia."},"PAGE_ACTIONS:load":function(n){return"Obciążenie"},"PAGE_ACTIONS:paints":function(n){return"Farby"},"PAGE_ACTIONS:settings":function(n){return"Ustawienia"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:nc12":function(n){return"12NC wyrobu"},"PROPERTY:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:qtyDone":function(n){return"Ilość pomalowana"},"PROPERTY:qtyPaint":function(n){return"Ilość do pomalowania"},"PROPERTY:mrp":function(n){return"Przepływ"},"PROPERTY:startTime":function(n){return"Początek montażu"},"PROPERTY:placement":function(n){return"Położenie"},"PROPERTY:no":function(n){return"Nr"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:comment":function(n){return"Komentarz"},"status:new":function(n){return"Do realizacji"},"status:started":function(n){return"W realizacji"},"status:finished":function(n){return"Zrealizowane"},"status:partial":function(n){return"Niekompletne"},"status:cancelled":function(n){return"Anulowane"},"action:start":function(n){return"Rozpocznij"},"action:finish":function(n){return"Zakończ"},"action:cancel":function(n){return"Ignoruj"},"action:reset":function(n){return"Resetuj"},"action:continue":function(n){return"Kontynuuj"},"action:comment":function(n){return"Komentuj"},"datePicker:d0":function(n){return"Dzisiaj"},"datePicker:d+1":function(n){return"Jutro"},"datePicker:d+2":function(n){return"Pojutrze"},"datePicker:d-1":function(n){return"Wczoraj"},"datePicker:d-2":function(n){return"Przedwczoraj"},"datePicker:submit":function(n){return"Wybierz datę"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"rrrr"},"datePicker:invalid":function(n){return"Podaj prawidłową datę."},"tabs:all":function(n){return"Wszystkie"},"tabs:dropZone":function(n){return"Drop zone wywołany"},empty:function(n){return"Brak zleceń dla wybranego dnia."},multiPaint:function(n){return"UWAGA! Zlecenie z "+t.p(n,"count",0,"pl",{one:"jedną farbą",2:"dwiema farbami",other:t.v(n,"count")+" farbami"})+"."},"orderChanges:change":function(n){return t.s(n,"type",{start:"Rozpoczęto",finish:"Zakończono",cancel:"Zignorowano",reset:"Zresetowano",comment:"Skomentowano",other:"Zmieniono"})+" <time title='"+t.v(n,"timeLong")+"'>"+t.v(n,"timeShort")+"</time> przez "+t.v(n,"user")},"menu:header:mrp":function(n){return t.v(n,"mrp")},"menu:header:all":function(n){return"Wszystkie przepływy"},"menu:copyOrders":function(n){return"Kopiuj nr zleceń"},"menu:copyOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:copyChildOrders":function(n){return"Kopiuj nr podzleceń"},"menu:copyChildOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:printOrder":function(n){return"Drukuj zlecenie"},"menu:printOrders":function(n){return"Drukuj zlecenia"},"menu:printOrders:all":function(n){return"Drukuj wszystkie zlecenia"},"menu:printOrders:mrp":function(n){return"Drukuj zlecenia "+t.v(n,"mrp")},"menu:exportOrders":function(n){return"Eksportuj zlecenia"},"menu:dropZone:true":function(n){return"Odwołaj drop zone"},"menu:dropZone:false":function(n){return"Wywołaj drop zone"},"menu:dropZone:failure":function(n){return"Nie udało się zmienić drop zone."},"parent:switchApps":function(n){return"Zmień aplikację/Konfiguruj po 3s"},"parent:reboot":function(n){return"Odśwież stronę/Restartuj komputer po 3s"},"parent:shutdown":function(n){return"Wyłącz komputer po 3s"},"load:stats:last":function(n){return"Ostatni"},"load:stats:current":function(n){return"Aktualny"},"load:stats:10m":function(n){return"10 minut"},"load:stats:1h":function(n){return"Godzina"},"load:stats:shift":function(n){return"Zmiana"},"load:stats:8h":function(n){return"8 godzin"},"load:stats:1d":function(n){return"24 godziny"},"load:stats:7d":function(n){return"7 dni"},"load:stats:30d":function(n){return"30 dni"},"load:report:filename":function(n){return"WMES_ObciazenieMalarnii"},"load:report:title":function(n){return"Obciążenie malarnii"},"load:report:avgDuration":function(n){return"Średni czas cyklu"},"load:report:count":function(n){return"Ilość"},"settings:tab:planning":function(n){return"Planowanie"},"settings:tab:load":function(n){return"Obciążenie"},"settings:planning:workCenters":function(n){return"WorkCentra"},"settings:planning:workCenters:help":function(n){return"Lista WorkCenter wykorzystywana podczas generowania kolejki malarnii do pobierania zleceń malarnii podrzędnych do zaplanowanych zleceń produkcyjnych."},"settings:load:statuses":function(n){return"Statusy"},"settings:load:statuses:from":function(n){return"Od [s]"},"settings:load:statuses:to":function(n){return"Do [s]"},"settings:load:statuses:icon":function(n){return"Ikona"},"settings:load:statuses:color":function(n){return"Kolor"},"settings:load:statuses:add":function(n){return"Dodaj status"}}});