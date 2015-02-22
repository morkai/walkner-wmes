define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,o,u){return r.c(n,e),n[e]in u?u[n[e]]:(e=r.lc[o](n[e]-t),e in u?u[e]:u.other)},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMBS:browse":function(){return"Programy Xiconf"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie programów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie programu nie powiodło się :("},"MSG:DELETED":function(n){return"Program <em>"+r.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(){return"Dodaj program"},"PAGE_ACTION:edit":function(){return"Edytuj program"},"PAGE_ACTION:delete":function(){return"Usuń program"},"PANEL:TITLE:details":function(){return"Szczegóły programu"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania programu"},"PANEL:TITLE:editForm":function(){return"Formularz edycji programu"},"step:pe":function(){return"Test obwodu ochronnego"},"step:sol":function(){return"Programowanie Fortimo Solar"},"step:fn":function(){return"Test funkcjonalny"},"filter:submit":function(){return"Filtruj programy"},"PROPERTY:name":function(){return"Nazwa"},"PROPERTY:createdAt":function(){return"Data i czas dodania"},"PROPERTY:updatedAt":function(){return"Data i czas modyfikacji"},"PROPERTY:startTime":function(){return"Czas rozruchu"},"PROPERTY:duration":function(){return"Czas pomiaru"},"PROPERTY:totalTime":function(){return"Całkowity czas testu"},"PROPERTY:voltage":function(){return"Napięcie [V]"},"PROPERTY:resistance:max":function(){return"Maksymalna rezystancja [Ω]"},"PROPERTY:power":function(){return"Moc [W]"},"PROPERTY:power:req":function(){return"Wymagana moc [W]"},"PROPERTY:power:rel":function(){return"Tolerancja [%]"},"PROPERTY:power:min":function(){return"Minimalna moc [W]"},"PROPERTY:power:max":function(){return"Maksymalna moc [W]"},"FORM:ACTION:add":function(){return"Dodaj program"},"FORM:ACTION:edit":function(){return"Edytuj program"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać programu :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować programu :-("},"FORM:ERROR:minDuration":function(){return"Wartość nie może być mniejsza niż 1s."},"FORM:ERROR:requiredStep":function(){return"Wybierz przynajmniej jeden krok."},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia programu"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń program"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany program?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć program <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć programu :-("}}});