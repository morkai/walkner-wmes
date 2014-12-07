define(["app/nls/locale/pl"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,o,i){return n.c(e,t),e[t]in i?i[e[t]]:(t=n.lc[o](e[t]-r),t in i?i[t]:i.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{"BREADCRUMBS:browse":function(){return"Historia operacji na liniach produkcyjnych"},"MSG:LOADING_FAILURE":function(){return"Ładowanie historii operacji nie powiodło się :("},"filter:submit":function(){return"Filtruj historię"},"filter:placeholder:type":function(){return"Dowolny typ"},"filter:placeholder:prodLine":function(){return"Dowolna linia produkcyjna"},"PROPERTY:prodLine":function(){return"Linia produkcyjna"},"PROPERTY:type":function(){return"Typ"},"PROPERTY:createdAt":function(){return"Czas operacji"},"PROPERTY:creator":function(){return"Wykonawca operacji"},"PROPERTY:data":function(){return"Dodatkowe informacje"},"PROPERTY:prodShift":function(){return"Zmiana"},"PROPERTY:prodShiftOrder":function(){return"Zlecenie"},"type:changeShift":function(){return"Rozpoczęcie zmiany"},"type:changeMaster":function(){return"Zmiana mistrza"},"type:changeLeader":function(){return"Zmiana lidera"},"type:changeOperator":function(){return"Zmiana operatora"},"type:changeQuantitiesDone":function(){return"Zmiana wykonanej ilości w godzinie"},"type:changeOrder":function(){return"Rozpoczęcie zlecenia"},"type:changeQuantityDone":function(){return"Zmiana wykonanej ilości w zleceniu"},"type:changeWorkerCount":function(){return"Zmiana ilości osób w zleceniu"},"type:correctOrder":function(){return"Poprawa zlecenia"},"type:finishOrder":function(){return"Zakończenie zlecenia"},"type:startDowntime":function(){return"Rozpoczęcie przestoju"},"type:finishDowntime":function(){return"Zakończenie przestoju"},"type:corroborateDowntime":function(){return"Potwierdzenie przestoju"},"type:endWork":function(){return"Zakończenie pracy"},"type:editShift":function(){return"Edycja zmiany"},"type:editOrder":function(){return"Edycja zlecenia"},"type:editDowntime":function(){return"Edycja przestoju"},"type:deleteShift":function(){return"Usunięcie zmiany"},"type:deleteDowntime":function(){return"Usunięcie przestoju"},"type:deleteOrder":function(){return"Usunięcie zlecenia"},"type:addShift":function(){return"Dodanie zmiany"},"type:addOrder":function(){return"Dodanie zlecenia"},"type:addDowntime":function(){return"Dodanie przestoju"},"data:changeShift":function(e){return"Zmiana <em>"+n.v(e,"shift")+"</em> z dnia <em>"+n.v(e,"date")+"</em>"},"data:addShift":function(e){return"Zmiana <em>"+n.v(e,"shift")+"</em> z dnia <em>"+n.v(e,"date")+"</em>"},"data:changeMaster":function(e){return"Nowy mistrz: <em>"+n.v(e,"name")+"</em>"},"data:changeLeader":function(e){return"Nowy lider: <em>"+n.v(e,"name")+"</em>"},"data:changeOperator":function(e){return"Nowy operator: <em>"+n.v(e,"name")+"</em>"},"data:changeQuantitiesDone":function(e){return"Wykonana ilość w <em>"+n.v(e,"hour")+".</em> godzinie: <em>"+n.v(e,"value")+"</em>"},"data:changeOrder":function(e){return"Zlecenie: <em>"+n.v(e,"orderId")+"</em> (<em>"+n.v(e,"orderName")+"</em>); operacja: <em>"+n.v(e,"operationNo")+"</em> (<em>"+n.v(e,"operationName")+"</em>)"},"data:addOrder":function(e){return"Zlecenie: <em>"+n.v(e,"orderId")+"</em> (<em>"+n.v(e,"orderName")+"</em>); operacja: <em>"+n.v(e,"operationNo")+"</em> (<em>"+n.v(e,"operationName")+"</em>)"},"data:changeQuantityDone":function(e){return"Wykonana ilość w zleceniu: <em>"+n.v(e,"value")+"</em>"},"data:changeWorkerCount":function(e){return"Ilość osób w zleceniu: <em>"+n.v(e,"value")+"</em>"},"data:correctOrder":function(e){return"Zlecenie: <em>"+n.v(e,"orderId")+"</em> (<em>"+n.v(e,"orderName")+"</em>); operacja: <em>"+n.v(e,"operationNo")+"</em> (<em>"+n.v(e,"operationName")+"</em>)"},"data:finishOrder":function(){return"-"},"data:startDowntime":function(e){return"<a href='#prodDowntimes/"+n.v(e,"_id")+"'>Powód: <em>"+n.v(e,"reason")+"</em>; obszar odpowiedzialności: <em>"+n.v(e,"aor")+"</em></a>"},"data:addDowntime":function(e){return"<a href='#prodDowntimes/"+n.v(e,"_id")+"'>Powód: <em>"+n.v(e,"reason")+"</em>; obszar odpowiedzialności: <em>"+n.v(e,"aor")+"</em></a>"},"data:finishDowntime":function(e){return"Zakończono <a href='#prodDowntimes/"+n.v(e,"_id")+"'>przestój</a>."},"data:corroborateDowntime":function(e){return n.s(e,"status",{confirmed:"Zatwierdzono",rejected:"Odrzucono",other:"Potwierdzono"})+" <a href='#prodDowntimes/"+n.v(e,"_id")+"'>przestój</a>."},"data:endWork":function(){return"-"},"data:editShift":function(e){return"Zmienione atrybuty: <em>"+n.v(e,"changedProperties")+"</em>"},"data:editOrder":function(e){return"Zmienione atrybuty: <em>"+n.v(e,"changedProperties")+"</em>"},"data:editDowntime":function(e){return"Zmienione atrybuty <a href='#prodDowntimes/"+n.v(e,"_id")+"'>przestoju</a>: <em>"+n.v(e,"changedProperties")+"</em>"},"data:deleteShift":function(){return"-"},"data:deleteDowntime":function(e){return"Usunięto przestój <em>"+n.v(e,"rid")+"</em>."},"data:deleteOrder":function(e){return"Usunięto zlecenie "+n.v(e,"orderId")+"; "+n.v(e,"operationNo")+"</em>."},"noData:prodShiftOrder":function(){return"<em>brak zlecenia</em>"}}});