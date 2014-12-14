define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,t){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(t||0)},v:function(r,t){return n.c(r,t),r[t]},p:function(r,t,e,i,a){return n.c(r,t),r[t]in a?a[r[t]]:(t=n.lc[i](r[t]-e),t in a?a[t]:a.other)},s:function(r,t,e){return n.c(r,t),r[t]in e?e[r[t]]:e.other}};return{"BREADCRUMBS:browse":function(){return"Karty pracy"},"BREADCRUMBS:details":function(){return"Karta pracy"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie kart pracy nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie karty pracy nie powiodło się :("},"MSG:DELETED":function(r){return"Karta pracy <em>"+n.v(r,"label")+"</em> została usunięta."},"MSG:jump:404":function(r){return"Nie znaleziono karty pracy o ID <em>"+n.v(r,"rid")+"</em> :("},"PAGE_ACTION:add":function(){return"Dodaj kartę pracy"},"PAGE_ACTION:edit":function(){return"Edytuj kartę pracy"},"PAGE_ACTION:delete":function(){return"Usuń kartę pracy"},"PAGE_ACTION:jump:title":function(){return"Skocz do karty pracy po ID"},"PAGE_ACTION:jump:placeholder":function(){return"ID karty pracy"},"PANEL:TITLE:details":function(){return"Szczegóły karty pracy"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania karty pracy"},"PANEL:TITLE:editForm":function(){return"Formularz edycji karty pracy"},"PANEL:TITLE:details:orders":function(){return"Lista części"},"filter:submit":function(){return"Filtruj karty pracy"},"filter:shift":function(){return"Zmiana"},"filter:type:any":function(){return"Dowolny"},"filter:type:mech":function(){return"Obr. mech."},"filter:type:paintShop":function(){return"Malarnia"},"filter:type:optics":function(){return"M. optyki"},"filter:mine":function(){return"Tylko moje"},"filter:mine:title":function(){return"Ogranicz listę kart pracy do dodanych przez Ciebie w kolejności od najnowszej do najstarszej!"},"filter:user:master":function(){return"Mistrz"},"filter:user:operators":function(){return"Operator"},"PROPERTY:pressWorksheet":function(){return"Karta pracy"},"PROPERTY:user":function(){return"Użytkownik"},"PROPERTY:rid":function(){return"ID"},"PROPERTY:operators":function(){return"Nastawiacze/operatorzy"},"PROPERTY:operator":function(){return"Podpisany nastawiacz/operator"},"PROPERTY:master":function(){return"Podpisany mistrz"},"PROPERTY:date":function(){return"Data"},"PROPERTY:shift":function(){return"Zmiana"},"PROPERTY:type":function(){return"Typ"},"PROPERTY:type:mech":function(){return"Obróbka mechaniczna"},"PROPERTY:type:paintShop":function(){return"Malarnia"},"PROPERTY:type:optics":function(){return"Montaż optyki"},"PROPERTY:startedAt":function(){return"Godz. rozp."},"PROPERTY:finishedAt":function(){return"Godz. zak."},"PROPERTY:createdAt":function(){return"Czas dodania"},"PROPERTY:creator":function(){return"Dodana przez"},"PROPERTY:divisions":function(){return"Wydziały"},"PROPERTY:order.part":function(){return"Część"},"PROPERTY:order.operation":function(){return"Operacja"},"PROPERTY:order.#":function(){return"Lp."},"PROPERTY:order.nc12":function(){return"12NC części"},"PROPERTY:order.name":function(){return"Nazwa części"},"PROPERTY:order.operationName":function(){return"Nazwa operacji"},"PROPERTY:order.operationNo":function(){return"Numer oper."},"PROPERTY:order.division":function(){return"Wydział"},"PROPERTY:order.prodLine":function(){return"Maszyna"},"PROPERTY:order.quantityDone":function(){return"Ilość dobrych"},"PROPERTY:order.startedAt":function(){return"Godz. rozp."},"PROPERTY:order.finishedAt":function(){return"Godz. zak."},"PROPERTY:order.losses":function(){return"Straty materiałowe [sztuki]"},"PROPERTY:order.downtimes":function(){return"Straty czasu z polecenia mistrza [minuty]"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia karty pracy"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń kartę pracy"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną kartę pracy?<br><br>Wraz z kartą pracy usunięte zostaną zdefiniowane w niej Zlecenia i Przestoje."},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć kartę pracy <em>"+n.v(r,"label")+"</em>?<br><br>Wraz z kartą pracy usunięte zostaną zdefiniowane w niej Zlecenia i Przestoje."},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć karty pracy :-("},"FORM:ACTION:add":function(){return"Dodaj kartę pracy"},"FORM:ACTION:edit":function(){return"Edytuj kartę pracy"},"FROM:ACTION:saveOverlapping":function(){return"Zapisz kartę pracy z pokrywającymi się czasami zleceń"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać karty pracy :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować karty pracy :-("},"FORM:ERROR:startedAt:boundries":function(){return"Godz. rozp. musi mieścić się w zakresie godzinowym wybranej zmiany."},"FORM:ERROR:finishedAt:boundries":function(){return"Godz. zak. musi mieścić się w zakresie godzinowym wybranej zmiany."},"FORM:ERROR:finishedAt:gt":function(){return"Godz. zak. musi być późniejsza niż Godz. rozp."},"FORM:ERROR:finishedAt:downtime":function(){return"Suma przestojów musi być krótsza niż czas trwania zlecenia."},"FORM:ERROR:overlapping":function(){return"Czasy zleceń na tych samych maszynach pokrywają się!"},"FORM:ERROR:date":function(){return"Czas zmiany nie może być z przyszłości."},"FORM:PLACEHOLDER:part":function(){return"Szukaj części po 12NC..."},"FORM:PLACEHOLDER:operation":function(){return"Wybierz operację..."},"FORM:PLACEHOLDER:prodLine":function(){return"Wybierz maszynę..."},"FORM:focusLastPart":function(){return"(skrót ALT+Enter zaznaczy ostatnie pole)"},"FORM:typeChangeWarning":function(){return"<strong>UWAGA!</strong> Zmiana typu wyczyści listę wykonanych części!"},"FORM:existingWarning":function(r){return"<strong>UWAGA!</strong> Dla wybranej Daty, Zmiany i Podpisanego nastawiacza/operatora "+n.p(r,"count",0,"pl",{one:"istnieje już karta pracy",other:"istnieją już karty pracy"})+": "+n.v(r,"links")+"."}}});