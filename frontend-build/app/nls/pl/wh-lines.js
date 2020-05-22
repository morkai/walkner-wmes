define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,i){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(i||0)},v:function(n,i){return e.c(n,i),n[i]},p:function(n,i,r,t,a){return e.c(n,i),n[i]in a?a[n[i]]:(i=e.lc[t](n[i]-r))in a?a[i]:a.other},s:function(n,i,r){return e.c(n,i),n[i]in r?r[n[i]]:r.other}};return{"BREADCRUMB:base":function(n){return"Magazyn (nowy)"},"BREADCRUMB:browse":function(n){return"Linie"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:pickup":function(n){return"Skompletowane"},"PROPERTY:components":function(n){return"Dostępne"},"PROPERTY:packaging":function(n){return"Wysyłka opakowań"},"PROPERTY:sets":function(n){return"Sety"},"PROPERTY:qty":function(n){return"Sztuki"},"PROPERTY:time":function(n){return"Czas"},"PROPERTY:redirLine":function(n){return"Przekierowanie"},"PROPERTY:working":function(n){return"Pracuje?"},"PROPERTY:nextShiftAt":function(n){return"Następna zmiana"},"PROPERTY:startedPlan":function(n){return"Rozpoczęty plan"},"LIST:COLUMN:nextShiftAt":function(n){return"Następna<br>zaplanowana<br>zmiana"},"LIST:COLUMN:startedPlan":function(n){return"Rozpoczęty<br>plan"},"redirLine:start":function(n){return"Rozpocznij przekierowanie linii"},"redirLine:stop":function(n){return"Zakończ przekierowanie linii"},"redirLine:title:start":function(n){return"Rozpoczynanie przekierowania linii"},"redirLine:title:stop":function(n){return"Kończenie przekierowania linii"},"redirLine:submit:start":function(n){return"Rozpocznij przekierowanie"},"redirLine:submit:stop":function(n){return"Zakończ przekierowanie"},"redirLine:message:start":function(n){return"Rozpoczęcie przekierowania linii sprawi, że zlecenia zaplanowane na linię źródłową trafią na linię docelową."},"redirLine:message:stop":function(n){return"Zakończenie przekierowania linii sprawi, że wcześniej przekierowane zlecenia z linii źródłowej na linię docelową wrócą na linię źródłową."},"redirLine:sourceLine":function(n){return"Linia źródłowa"},"redirLine:targetLine":function(n){return"Linia docelowa"},"redirLine:redirDelivered":function(n){return"Przekieruj dostarczone zlecenia"},"redirLine:error:SAME_LINES":function(n){return"Nie można przekierować na tę samą linię."},"redirLine:error:LINE_REDIRECTED":function(n){return"Linia jest już przekierowana: "+e.v(n,"line")+" ➜ "+e.v(n,"redirLine")+"."},"redirLine:error:UNKNOWN_SOURCE_LINE":function(n){return"Nieznana linia źródłowa."},"redirLine:error:UNKNOWN_TARGET_LINE":function(n){return"Nieznana linia docelowa."},"redirLine:error:INVALID_TARGET_LINE":function(n){return"Nieprawidłowa linia docelowa."},"redirLine:error:LINE_NOT_REDIRECTED":function(n){return"Linia źródłowa nie ma przekierowania."},"editStartedPlan:tooltip":function(n){return"Zmień datę rozpoczętego planu"},"editStartedPlan:title":function(n){return"Zmiana daty rozpoczętego planu na linii"},"editStartedPlan:message":function(n){return"<p>Sety podczas kompletacji tworzone są dla linii, które mają zlecenia zaplanowane do daty aktualnie rozpoczętego planu lub aktualnego daty aktualnego dnia, jeżeli jest późniejsza (włącznie).</p><p>Data rozpoczętego planu jest automatycznie zmieniana, jeżeli na linii rozpoczęte zostanie zlecenie z Datą startu (plan.) późniejszą niż aktualna wartość.</p><p>Zmieniając aktualną datę rozpoczęcia planu dla linii na nową, można aktywować na niej kompletacje zleceń do wybranej daty.</p>"},"editStartedPlan:line":function(n){return"Linia"},"editStartedPlan:oldValue":function(n){return"Aktualnie rozpoczęty plan"},"editStartedPlan:newValue":function(n){return"Nowy rozpoczęty plan"},"editStartedPlan:submit":function(n){return"Zmień datę"}}});