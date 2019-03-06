define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,i,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[i](n[t]-e))in o?o[t]:o.other},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:browse":function(n){return"Karty pracy"},"PANEL:TITLE:details:orders":function(n){return"Lista części"},"filter:submit":function(n){return"Filtruj"},"filter:shift":function(n){return"Zmiana"},"filter:type:any":function(n){return"Dowolny"},"filter:type:mech":function(n){return"Obr. mech."},"filter:type:paintShop":function(n){return"Malarnia"},"filter:type:optics":function(n){return"M. optyki"},"filter:mine":function(n){return"Tylko moje"},"filter:mine:title":function(n){return"Ogranicz listę kart pracy do dodanych przez Ciebie w kolejności od najnowszej do najstarszej!"},"filter:user:master":function(n){return"Mistrz"},"filter:user:operators":function(n){return"Operator"},"filter:machine":function(n){return"Maszyna"},"PROPERTY:pressWorksheet":function(n){return"Karta pracy"},"PROPERTY:user":function(n){return"Użytkownik"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:operators":function(n){return"Nastawiacze/operatorzy"},"PROPERTY:operator":function(n){return"Podpisany nastawiacz/operator"},"PROPERTY:master":function(n){return"Podpisany mistrz"},"PROPERTY:date":function(n){return"Data"},"PROPERTY:shift":function(n){return"Zmiana"},"PROPERTY:type":function(n){return"Typ"},"PROPERTY:type:mech":function(n){return"Obróbka mechaniczna"},"PROPERTY:type:paintShop":function(n){return"Malarnia"},"PROPERTY:type:optics":function(n){return"Montaż optyki"},"PROPERTY:startedAt":function(n){return"Godz. rozp."},"PROPERTY:finishedAt":function(n){return"Godz. zak."},"PROPERTY:createdAt":function(n){return"Czas dodania"},"PROPERTY:creator":function(n){return"Dodana przez"},"PROPERTY:divisions":function(n){return"Wydziały"},"PROPERTY:order.part":function(n){return"Część"},"PROPERTY:order.operation":function(n){return"Operacja"},"PROPERTY:order.#":function(n){return"Lp."},"PROPERTY:order.nc12":function(n){return"12NC części"},"PROPERTY:order.name":function(n){return"Nazwa części"},"PROPERTY:order.operationName":function(n){return"Nazwa operacji"},"PROPERTY:order.operationNo":function(n){return"Numer oper."},"PROPERTY:order.division":function(n){return"Wydział"},"PROPERTY:order.prodLine":function(n){return"Maszyna"},"PROPERTY:order.quantityDone":function(n){return"Ilość dobrych"},"PROPERTY:order.startedAt":function(n){return"Godz. rozp."},"PROPERTY:order.finishedAt":function(n){return"Godz. zak."},"PROPERTY:order.losses":function(n){return"Straty materiałowe [sztuki]"},"PROPERTY:order.downtimes":function(n){return"Straty czasu z polecenia mistrza [minuty]"},"PROPERTY:order.machineManHours":function(n){return"RBH"},"FROM:ACTION:saveOverlapping":function(n){return"Zapisz kartę pracy z pokrywającymi się czasami zleceń"},"FORM:ERROR:startedAt:boundries":function(n){return"Godz. rozp. musi mieścić się w zakresie godzinowym wybranej zmiany."},"FORM:ERROR:finishedAt:boundries":function(n){return"Godz. zak. musi mieścić się w zakresie godzinowym wybranej zmiany."},"FORM:ERROR:finishedAt:gt":function(n){return"Godz. zak. musi być późniejsza niż Godz. rozp."},"FORM:ERROR:finishedAt:downtime":function(n){return"Suma przestojów musi być krótsza niż czas trwania zlecenia."},"FORM:ERROR:overlapping":function(n){return"Czasy zleceń na tych samych maszynach pokrywają się!"},"FORM:ERROR:date":function(n){return"Czas zmiany nie może być z przyszłości."},"FORM:PLACEHOLDER:part":function(n){return"Szukaj części po 12NC..."},"FORM:PLACEHOLDER:operation":function(n){return"Wybierz operację..."},"FORM:PLACEHOLDER:prodLine":function(n){return"Wybierz maszynę..."},"FORM:focusLastPart":function(n){return"(skrót ALT+Enter zaznaczy ostatnie pole)"},"FORM:typeChangeWarning":function(n){return"<strong>UWAGA!</strong> Zmiana typu wyczyści listę wykonanych części!"},"FORM:existingWarning":function(n){return"<strong>UWAGA!</strong> Dla wybranej Daty, Zmiany i Podpisanego nastawiacza/operatora "+r.p(n,"count",0,"pl",{one:"istnieje już karta pracy",other:"istnieją już karty pracy"})+": "+r.v(n,"links")+"."}}});