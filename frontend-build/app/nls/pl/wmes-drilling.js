define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,i,u){return e.c(n,r),n[r]in u?u[n[r]]:(r=e.lc[i](n[r]-t))in u?u[r]:u.other},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Wiercenie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:date:failure":function(n){return"Nie udało się znaleźć daty."},"MSG:date:empty":function(n){return"Brak zleceń."},"MSG:start:failure":function(n){return"Nie udało się rozpocząć zlecenia."},"MSG:continue:failure":function(n){return"Nie udało się kontynuować zlecenia."},"MSG:finish:failure":function(n){return"Nie udało się zakończyć zlecenia."},"MSG:reset:failure":function(n){return"Nie udało się zresetować zlecenia."},"MSG:cancel:failure":function(n){return"Nie udało się zignorować zlecenia."},"MSG:search:failure":function(n){return"Nie znaleziono zlecenia."},"PAGE_ACTIONS:paintShop":function(n){return"Malarnia"},"PAGE_ACTIONS:settings":function(n){return"Ustawienia"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:nc12":function(n){return"12NC wyrobu"},"PROPERTY:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:qtyDone":function(n){return"Ilość wywiercona"},"PROPERTY:qtyDrill":function(n){return"Ilość do wiercenia"},"PROPERTY:mrp":function(n){return"Przepływ"},"PROPERTY:startTime":function(n){return"Początek montażu"},"PROPERTY:placement":function(n){return"Położenie"},"PROPERTY:no":function(n){return"Nr"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:comment":function(n){return"Komentarz"},"status:new":function(n){return"Do realizacji"},"status:started":function(n){return"W realizacji"},"status:finished":function(n){return"Zrealizowane"},"status:painted":function(n){return"Malowane"},"status:partial":function(n){return"Niekompletne"},"status:cancelled":function(n){return"Anulowane"},"action:start":function(n){return"Rozpocznij"},"action:finish":function(n){return"Zakończ"},"action:cancel":function(n){return"Ignoruj"},"action:reset":function(n){return"Resetuj"},"action:continue":function(n){return"Kontynuuj"},"action:comment":function(n){return"Komentuj"},"datePicker:d0":function(n){return"Dzisiaj"},"datePicker:d+1":function(n){return"Jutro"},"datePicker:d+2":function(n){return"Pojutrze"},"datePicker:d-1":function(n){return"Wczoraj"},"datePicker:d-2":function(n){return"Przedwczoraj"},"datePicker:submit":function(n){return"Wybierz datę"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"rrrr"},"datePicker:invalid":function(n){return"Podaj prawidłową datę."},"userPicker:guest":function(n){return"Zaloguj się"},"userPicker:logIn":function(n){return"Zaloguj"},"userPicker:logOut":function(n){return"Wyloguj"},"tabs:all":function(n){return"Wszystkie przepływy"},empty:function(n){return"Brak zleceń dla wybranego dnia."},"orderChanges:change:reset":function(n){return"Zresetowano zlecenie."},"orderChanges:change:cancel":function(n){return"Anulowano zlecenie."},"orderChanges:change:start":function(n){return"Rozpoczęto zlecenie."},"orderChanges:change:finish":function(n){return"Zakończono "+e.v(n,"qtyDone")+" szt."},"orderChanges:change:continue":function(n){return"Wznowiono zlecenie."},"menu:header:mrp":function(n){return e.v(n,"mrp")},"menu:header:all":function(n){return"Wszystkie przepływy"},"menu:openOrder":function(n){return"Otwórz zlecenie "+e.s(n,"orderNo",{parent:"nadrzędne",other:e.v(n,"orderNo")})},"menu:copyOrder":function(n){return"Kopiuj nr zlecenia"},"menu:copyOrders":function(n){return"Kopiuj nr zleceń"},"menu:copyOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:copyChildOrders":function(n){return"Kopiuj nr podzleceń"},"menu:copyChildOrders:success":function(n){return"Lista skopiowana do schowka."},"menu:printOrder":function(n){return"Drukuj zlecenie"},"menu:printOrders":function(n){return"Drukuj zlecenia"},"menu:printOrders:all":function(n){return"Drukuj wszystkie zlecenia"},"menu:printOrders:mrp":function(n){return"Drukuj zlecenia "+e.v(n,"mrp")},"menu:exportOrders":function(n){return"Eksportuj zlecenia"},"settings:tab:planning":function(n){return"Planowanie"},"settings:planning:workCenters":function(n){return"WorkCentra"},"settings:planning:workCenters:help":function(n){return"Lista WorkCenter wykorzystywana podczas generowania kolejki wiercenia do pobierania zleceń wiercenia podrzędnych do zaplanowanych zleceń produkcyjnych."},"mrp:all":function(n){return"Wszystkie przepływy"},"printPage:title":function(n){return"Plan wiercenia na dzień "+e.v(n,"date")},"printPage:hd":function(n){return"Plan wiercenia"},"printPage:ft":function(n){return"Plan wiercenia na dzień "+e.v(n,"date")+"."},"printPage:info":function(n){return"Wciśnij <kbd>Ctrl+P</kbd>, aby rozpocząć drukowanie."},"printPage:date":function(n){return"Data:"},"printPage:mrp":function(n){return"Przepływ:"},"printPage:order":function(n){return"Zlecenie:"},"printPage:page":function(n){return"Strona "+e.v(n,"n")+" z "+e.v(n,"total")},"printPage:printed":function(n){return"Wydrukowano w "+e.v(n,"time")+" przez "+e.v(n,"user")+" za pomocą systemu WMES."}}});