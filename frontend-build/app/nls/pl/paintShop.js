define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r))in i?i[t]:i.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Malarnia"},"BREADCRUMBS:load":function(n){return"Obciążenie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:date:failure":function(n){return"Nie udało się znaleźć daty."},"MSG:date:empty":function(n){return"Brak zleceń."},"MSG:start:failure":function(n){return"Nie udało się rozpocząć zlecenia."},"MSG:continue:failure":function(n){return"Nie udało się kontynuować zlecenia."},"MSG:finish:failure":function(n){return"Nie udało się zakończyć zlecenia."},"MSG:reset:failure":function(n){return"Nie udało się zresetować zlecenia."},"MSG:cancel:failure":function(n){return"Nie udało się zignorować zlecenia."},"MSG:deliver:failure":function(n){return"Nie udało się dostarczyć zlecenia."},"MSG:search:failure":function(n){return"Nie znaleziono zlecenia."},"PAGE_ACTIONS:load":function(n){return"Obciążenie"},"PAGE_ACTIONS:paints":function(n){return"Farby"},"PAGE_ACTIONS:settings":function(n){return"Ustawienia"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:nc12":function(n){return"12NC wyrobu"},"PROPERTY:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:qtyDone":function(n){return"Ilość pomalowana"},"PROPERTY:qtyPaint":function(n){return"Ilość do pomalowania"},"PROPERTY:qtyDlv":function(n){return"Ilość do dostarczenia"},"PROPERTY:mrp":function(n){return"Przepływ"},"PROPERTY:startTime":function(n){return"Początek montażu"},"PROPERTY:placement":function(n){return"Położenie"},"PROPERTY:no":function(n){return"Nr"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:cabin":function(n){return"Kabina"},"status:new":function(n){return"Do realizacji"},"status:started":function(n){return"W realizacji"},"status:finished":function(n){return"Zrealizowane"},"status:partial":function(n){return"Niekompletne"},"status:cancelled":function(n){return"Anulowane"},"status:delivered":function(n){return"Dostarczone"},"action:start":function(n){return"<small>Rozpocznij</small>Kabina "+e.v(n,"cabin")},"action:finish":function(n){return"Zakończ"},"action:cancel":function(n){return"Ignoruj"},"action:reset":function(n){return"Resetuj"},"action:continue":function(n){return"<small>Kontynuuj</small>Kabina "+e.v(n,"cabin")},"action:comment":function(n){return"Komentuj"},"action:deliver":function(n){return"Dostarcz"},"datePicker:d0":function(n){return"Dzisiaj"},"datePicker:d+1":function(n){return"Jutro"},"datePicker:d+2":function(n){return"Pojutrze"},"datePicker:d-1":function(n){return"Wczoraj"},"datePicker:d-2":function(n){return"Przedwczoraj"},"datePicker:submit":function(n){return"Wybierz datę"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"rrrr"},"datePicker:invalid":function(n){return"Podaj prawidłową datę."},"paintPicker:select":function(n){return"Wybierz"},"paintPicker:msp":function(n){return"MSP"},"paintPicker:all":function(n){return"Wszystkie"},"userPicker:guest":function(n){return"Zaloguj się"},"userPicker:logIn":function(n){return"Zaloguj"},"userPicker:logOut":function(n){return"Wyloguj"},"tabs:all":function(n){return"Wszystkie"},"tabs:dropZone":function(n){return"Drop zone wywołany"},"tabs:paint:all":function(n){return"Wszystkie farby"},"tabs:paint:msp":function(n){return"Farby MSP"},empty:function(n){return"Brak zleceń dla wybranego dnia."},multiPaint:function(n){return"UWAGA! Zlecenie z "+e.p(n,"count",0,"pl",{one:"jedną farbą",2:"dwiema farbami",other:e.v(n,"count")+" farbami"})+"."},"orderChanges:change":function(n){return e.s(n,"type",{start:"Rozpoczęto",finish:"Zakończono "+e.v(n,"qtyDone")+" szt.",cancel:"Zignorowano",reset:"Zresetowano",comment:"Skomentowano",continue:"Kontynuowano",deliver:"Dostarczono "+e.v(n,"qtyDlv")+" szt.",other:"Zmieniono"})+" <time title='"+e.v(n,"timeLong")+"'>"+e.v(n,"timeShort")+"</time> przez "+e.v(n,"user")},"orderChanges:change:reset":function(n){return"Zresetowano zlecenie."},"orderChanges:change:cancel":function(n){return"Zignorowano zlecenie."},"orderChanges:change:start":function(n){return e.s(n,"cabin",{1:"Rozpoczęto zlecenie w kabinie pierwszej.",2:"Rozpoczęto zlecenie w kabinie drugiej.",other:"Rozpoczęto zlecenie."})},"orderChanges:change:finish":function(n){return"Zakończono "+e.v(n,"qtyDone")+" szt."},"orderChanges:change:continue":function(n){return e.s(n,"cabin",{1:"Wznowiono zlecenie w kabinie pierwszej.",2:"Wznowiono zlecenie w kabinie drugiej.",other:"Wznowiono zlecenie."})},"orderChanges:change:deliver":function(n){return"Dostarczono "+e.v(n,"qtyDlv")+" szt."},"menu:header:mrp":function(n){return e.v(n,"mrp")},"menu:header:all":function(n){return"Wszystkie przepływy"},"menu:copyOrder":function(n){return"Kopiuj nr zlecenia"},"menu:copyOrders":function(n){return"Kopiuj nr zleceń"},"menu:copyOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:copyChildOrders":function(n){return"Kopiuj nr podzleceń"},"menu:copyChildOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:printOrder":function(n){return"Drukuj zlecenie"},"menu:printOrders":function(n){return"Drukuj zlecenia"},"menu:printOrders:all":function(n){return"Drukuj wszystkie zlecenia"},"menu:printOrders:mrp":function(n){return"Drukuj zlecenia "+e.v(n,"mrp")},"menu:exportOrders":function(n){return"Eksportuj zlecenia"},"menu:dropZone:true":function(n){return"Odwołaj drop zone"},"menu:dropZone:false":function(n){return"Wywołaj drop zone"},"menu:dropZone:failure":function(n){return"Nie udało się zmienić drop zone."},"load:stats:last":function(n){return"Ostatni"},"load:stats:current":function(n){return"Aktualny"},"load:stats:10m":function(n){return"10 minut"},"load:stats:1h":function(n){return"Godzina"},"load:stats:shift":function(n){return"Zmiana"},"load:stats:8h":function(n){return"8 godzin"},"load:stats:1d":function(n){return"24 godziny"},"load:stats:7d":function(n){return"7 dni"},"load:stats:30d":function(n){return"30 dni"},"load:report:filename":function(n){return"WMES_ObciazenieMalarnii"},"load:report:title":function(n){return"Obciążenie malarnii"},"load:report:avgDuration":function(n){return"Średni czas cyklu"},"load:report:count":function(n){return"Ilość"},"settings:tab:planning":function(n){return"Planowanie"},"settings:tab:load":function(n){return"Obciążenie"},"settings:planning:workCenters":function(n){return"WorkCentra"},"settings:planning:workCenters:help":function(n){return"Lista WorkCenter wykorzystywana podczas generowania kolejki malarnii do pobierania zleceń malarnii podrzędnych do zaplanowanych zleceń produkcyjnych."},"settings:planning:mspPaints":function(n){return"Farby MSP"},"settings:planning:mspPaints:help":function(n){return"Lista farb w grupie MSP."},"settings:load:statuses":function(n){return"Statusy"},"settings:load:statuses:from":function(n){return"Od [s]"},"settings:load:statuses:to":function(n){return"Do [s]"},"settings:load:statuses:icon":function(n){return"Ikona"},"settings:load:statuses:color":function(n){return"Kolor"},"settings:load:statuses:add":function(n){return"Dodaj status"}}});