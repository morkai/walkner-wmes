define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"Malarnia"},"BREADCRUMBS:queue":function(n){return"Kolejka zleceń"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie zleceń nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie zlecenia nie powiodło się :("},"MSG:start:failure":function(n){return"Nie udało się rozpocząć zlecenia :("},"MSG:finish:failure":function(n){return"Nie udało się zakończyć zlecenia :("},"MSG:reset:failure":function(n){return"Nie udało się zresetować zlecenia :("},"MSG:cancel:failure":function(n){return"Nie udało się zignorować zlecenia :("},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:nc12":function(n){return"12NC wyrobu"},"PROPERTY:name":function(n){return"Nazwa wyrobu/komponentu"},"PROPERTY:qty":function(n){return"Ilość"},"PROPERTY:mrp":function(n){return"Przepływ"},"PROPERTY:startTime":function(n){return"Początek montażu"},"PROPERTY:placement":function(n){return"Położenie"},"PROPERTY:no":function(n){return"Nr"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:comment":function(n){return"Komentarz"},"status:new":function(n){return"Do realizacji"},"status:started":function(n){return"W realizacji"},"status:finished":function(n){return"Zrealizowane"},"status:cancelled":function(n){return"Anulowane"},"action:start":function(n){return"Rozpocznij"},"action:finish":function(n){return"Zakończ"},"action:cancel":function(n){return"Ignoruj"},"action:reset":function(n){return"Resetuj"},"action:comment":function(n){return"Komentuj"},"datePicker:d0":function(n){return"Dzisiaj"},"datePicker:d+1":function(n){return"Jutro"},"datePicker:d+2":function(n){return"Pojutrze"},"datePicker:d-1":function(n){return"Wczoraj"},"datePicker:d-2":function(n){return"Przedwczoraj"},"datePicker:submit":function(n){return"Wybierz datę"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"rrrr"},"datePicker:invalid":function(n){return"Podaj prawidłową datę."},"tabs:all":function(n){return"Wszystkie"},empty:function(n){return"Brak zleceń dla wybranego dnia."},"orderChanges:change":function(n){return e.s(n,"type",{start:"Rozpoczęto",finish:"Zakończono",cancel:"Zignorowano",reset:"Zresetowano",comment:"Skomentowano",other:"Zmieniono"})+" <time title='"+e.v(n,"timeLong")+"'>"+e.v(n,"timeAgo")+"</time> przez "+e.v(n,"user")}}});