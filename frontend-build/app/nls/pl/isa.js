define(["app/nls/locale/pl"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,i,u){return n.c(e,t),e[t]in u?u[e[t]]:(t=n.lc[i](e[t]-r),t in u?u[t]:u.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{"BREADCRUMBS:base":function(e){return"Pola odkładcze"},"BREADCRUMBS:events":function(e){return"Zdarzenia"},"BREADCRUMBS:requests":function(e){return"Żądania"},"MSG:LOADING_FAILURE":function(e){return"Ładowanie pól odkładczych nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Ładowanie pola odkładczego nie powiodło się :("},"PAGE_ACTION:export":function(e){return"Eksportuj"},"actions:shiftPersonnel":function(e){return"Zmień personel"},"actions:responderFilter":function(e){return"Filtruj wg magazyniera"},"actions:toggleFullscreen":function(e){return"Przełącz tryb pełnoekranowy"},"actions:toggleHotkeys":function(e){return"Przełącz wyświetlanie skrótów klawiszowych"},"actions:showRequests":function(e){return"Pokaż żądania"},"actions:collapseEvents":function(e){return"Ukryj zdarzenia"},"requests:header":function(e){return"Do realizacji"},"requests:empty":function(e){return"Nie ma żadnych żądań do realizacji."},"responses:header":function(e){return"W realizacji"},"responses:empty":function(e){return"Nie ma żadnych żądań w realizacji."},"lineState:header:pickup":function(e){return"odbiór palety"},"lineState:header:delivery":function(e){return"dostawa <small>"+n.v(e,"qty")+"x</small> <small>"+n.v(e,"palletKindFull")+"</small>"},"lineState:division":function(e){return"Wydział"},"lineState:prodFlow":function(e){return"Przepływ"},"lineState:workCenter":function(e){return"WorkCenter"},"lineState:prodLine":function(e){return"Linia"},"lineState:time":function(e){return"Czas"},"lineState:whman":function(e){return"Magazynier"},"pickup:failure":function(e){return"Nie udało się rozpocząć odbioru palety :("},"pickup:LOCKED":function(e){return"Nie można rozpocząć nowego żądania tak szybko po zakończeniu porzedniego!"},"deliver:failure":function(e){return"Nie udało się rozpocząć dostawy palety :("},"deliver:LOCKED":function(e){return"Nie można rozpocząć nowego żądania tak szybko po zakończeniu porzedniego!"},"cancel:action":function(e){return"Anuluj żądanie"},"cancel:title":function(e){return"Anulowanie żądania"},"cancel:message":function(e){return"Czy na pewno chcesz anulować wybrane żądanie?"},"cancel:yes":function(e){return"Anuluj żądanie"},"cancel:no":function(e){return"Nie anuluj żądania"},"cancel:failure":function(e){return"Nie udało się anulować żądania :("},"cancel:LOCKED":function(e){return"Nie można anulować żądania tak szybko po jego utworzeniu!"},"accept:action":function(e){return"Akceptuj żądanie"},"accept:failure":function(e){return"Nie udało się zaakceptować żądania :("},"accept:UNKNOWN_RESPONDER":function(e){return"Nie udało się zaakceptować żądania: nieistniejący użytkownik."},"accept:INVALID_RESPONDER":function(e){return"Nie udało się zaakceptować żądania: nieprawidłowy użytkownik."},"finish:action":function(e){return"Zakończ żądanie"},"finish:failure":function(e){return"Nie udało się zakończyć żądania :("},"shiftPersonnel:title":function(e){return"Personel zmiany"},"shiftPersonnel:message":function(e){return"Wybierz magazynierów pracujących na aktualnej zmianie:"},"shiftPersonnel:submit":function(e){return"Zapisz personel"},"shiftPersonnel:msg:failure":function(e){return"Nie udało się zapisać personelu zmiany :("},"shiftPersonnel:msg:success":function(e){return"Personel zmiany został zapisany!"},"responderPicker:empty":function(e){return"Nie ustawiono personelu zmiany!"},"events:header":function(e){return"Zdarzenia"},"events:time":function(e){return"Czas"},"events:line":function(e){return"Linia"},"events:user":function(e){return"Użytkownik"},"events:action":function(e){return"Akcja"},"events:pickupRequested":function(e){return"Żądanie odbioru palety."},"events:deliveryRequested":function(e){return"Żądanie dostawy palety "+n.v(e,"palletKind->label")+" x"+n.v(e,"qty")+"."},"events:requestCancelled":function(e){return"Anulowanie żądania."},"events:requestAccepted":function(e){return"Rozpoczęcie realizacji przez "+n.v(e,"responder->label")+"."},"events:requestFinished":function(e){return"Zakończenie realizacji żądania."},"events:shiftPersonnelUpdated":function(e){return"Zmiana personelu."},"events:filter":function(e){return"Filtruj zdarzenia"},"events:type:pickupRequested":function(e){return"Żądanie odbioru"},"events:type:deliveryRequested":function(e){return"Żądanie dostawy"},"events:type:requestCancelled":function(e){return"Anulowanie żądania"},"events:type:requestAccepted":function(e){return"Rozpoczęcie realizacji"},"events:type:requestFinished":function(e){return"Zakończenie realizacji"},"events:type:shiftPersonnelUpdated":function(e){return"Zmiana personelu"},"requests:filter":function(e){return"Filtruj żądania"},"requests:line":function(e){return"Linia"},"requests:type":function(e){return"Typ"},"requests:type:pickup":function(e){return"Odbiór"},"requests:type:delivery":function(e){return"Dostawa <em>"+n.v(e,"palletKind")+"</em> x"+n.v(e,"qty")},"requests:status":function(e){return"Status"},"requests:status:new":function(e){return"Nowe"},"requests:status:accepted":function(e){return"Zaakceptowane"},"requests:status:finished":function(e){return"Zakończone"},"requests:status:cancelled":function(e){return"Anulowane"},"requests:request":function(e){return"Żądanie"},"requests:response":function(e){return"Realizacja"},"requests:finish":function(e){return"Zakończenie"},"requests:requester":function(e){return"Rozpoczęte przez"},"requests:requestedAt":function(e){return"Czas rozpoczęcia"},"requests:responder":function(e){return"Magazynier"},"requests:respondedAt":function(e){return"Czas akceptacji"},"requests:finisher":function(e){return"Zakończone przez"},"requests:finishedAt":function(e){return"Czas zakończenia"},"requests:duration":function(e){return"Czas trwania"},"requests:date+user":function(e){return n.v(e,"date")+" przez "+n.v(e,"user")},"requests:time+user":function(e){return"o "+n.v(e,"time")+" przez "+n.v(e,"user")},"hotkeys:shiftLeft+n:kbd":function(e){return"Lewy SHIFT+Liczba"},"hotkeys:shiftLeft+n:lbl":function(e){return"Akceptacja żądania"},"hotkeys:altLeft+n:kbd":function(e){return"Lewy ALT+Liczba"},"hotkeys:altLeft+n:lbl":function(e){return"Zakończenie żądania"},"hotkeys:shiftRight+n:kbd":function(e){return"Prawy SHIFT+Liczba"},"hotkeys:shiftRight+n:lbl":function(e){return"Anulowanie żądania do realizacji"},"hotkeys:altRight+n:kbd":function(e){return"Prawy ALT+Liczba"},"hotkeys:altRight+n:lbl":function(e){return"Anulowanie żądania w realizacji"},"hotkeys:p:kbd":function(e){return"P"},"hotkeys:p:lbl":function(e){return"Personel"},"hotkeys:f:kbd":function(e){return"F"},"hotkeys:f:lbl":function(e){return"Filtr"},"msg:whmanNotFound":function(e){return"Nie znaleziono magazyniera:<br>"+n.v(e,"personnelId")},"msg:noAction":function(e){return"Brak akcji dla magazyniera:<br>"+n.v(e,"whman")},"msg:accept:failure":function(e){return"Nie udało się zaakceptować żądania :-("},"msg:accept:header":function(e){return n.s(e,"requestType",{delivery:"Dostawa palety",other:"Odbiór palety"})},"msg:finish:failure":function(e){return"Nie udało się zakończyć żądania :-("},"msg:finish:success":function(e){return"Zakończono żądanie "+n.s(e,"type",{delivery:"dostawy na linię",other:"odbioru z linii"})+"<br>"+n.v(e,"line")}}});