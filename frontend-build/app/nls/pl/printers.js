define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,a,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[a](n[t]-e))in u?u[t]:u.other},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:browse":function(n){return"Drukarki"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:DELETED":function(n){return"Drukarka <em>"+r.v(n,"label")+"</em> została usunięta."},"PAGE_ACTION:add":function(n){return"Dodaj drukarkę"},"PAGE_ACTION:edit":function(n){return"Edytuj drukarkę"},"PAGE_ACTION:delete":function(n){return"Usuń drukarkę"},"PANEL:TITLE:details":function(n){return"Szczegóły drukarki"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania drukarki"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji drukarki"},"PROPERTY:name":function(n){return"Nazwa systemowa"},"PROPERTY:label":function(n){return"Opis"},"PROPERTY:tags":function(n){return"Tagi"},"PROPERTY:special":function(n){return"Ustawienia specjalne"},"FORM:ACTION:add":function(n){return"Dodaj drukarkę"},"FORM:ACTION:edit":function(n){return"Edytuj drukarkę"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać drukarki."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować drukarki."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia drukarki"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń drukarkę"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany drukarkę?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć drukarkę <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć drukarki."},"menu:header":function(n){return"Drukarki"},"menu:browser":function(n){return"Przez przeglądarkę..."},"select:label":function(n){return"Drukarka"},"select:placeholder":function(n){return"Wybierz drukarkę..."},"select:browser":function(n){return"Przez przeglądarkę..."},"tags:orders":function(n){return"Zlecenia produkcyjne"},"tags:qi":function(n){return"Inspekcja jakości"},"tags:planning":function(n){return"Plany dzienne"},"tags:hourlyPlans":function(n){return"Plany godzinowe"},"tags:paintShop":function(n){return"Malarnia"},"tags:fte/production":function(n){return"FTE (produkcja)"},"tags:fte/warehouse":function(n){return" FTE (magazyn)"},"tags:fte/other":function(n){return"FTE (inne)"},"tags:kanban/kk":function(n){return"Baza Kanban: Karta Kanbanowa"},"tags:kanban/empty":function(n){return"Baza Kanban: Pusty"},"tags:kanban/full":function(n){return"Baza Kanban: Pełny"},"tags:kanban/wh":function(n){return"Baza Kanban: Magazynowa"},"tags:kanban/desc":function(n){return"Baza Kanban: Opisowa"},"tags:wh/cart/fmx":function(n){return"Magazyn: Wózek FMX"},"tags:wh/cart/kitter":function(n){return"Magazyn: Wózek Kitter"},"tags:wh/cart/packer":function(n){return"Magazyn: Wózek Opakowania"},"tags:generic/text":function(n){return"Ogólna: Tekst"},"tags:hidLamps":function(n){return"Oprawy HID"}}});