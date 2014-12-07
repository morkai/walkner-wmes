define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,e){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(e||0)},v:function(r,e){return n.c(r,e),r[e]},p:function(r,e,t,o,i){return n.c(r,e),r[e]in i?i[r[e]]:(e=n.lc[o](r[e]-t),e in i?i[e]:i.other)},s:function(r,e,t){return n.c(r,e),r[e]in t?t[r[e]]:t.other}};return{"BREADCRUMBS:browse":function(){return"Przestoje"},"BREADCRUMBS:corroborate":function(){return"Potwierdzanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie przestojów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie przestoju nie powiodło się :("},"MSG:DELETED":function(r){return"Przestój <em>"+n.v(r,"label")+"</em> został usunięty."},"MSG:jump:404":function(r){return"Nie znaleziono przestoju o ID <em>"+n.v(r,"rid")+"</em> :("},"PAGE_ACTION:export":function(){return"Eksportuj przestoje"},"PAGE_ACTION:edit":function(){return"Edytuj przestój"},"PAGE_ACTION:delete":function(){return"Usuń przestój"},"PAGE_ACTION:jump:title":function(){return"Skocz do przestoju po ID"},"PAGE_ACTION:jump:placeholder":function(){return"ID przestoju"},"PANEL:TITLE:details":function(){return"Szczegóły przestoju"},"PANEL:TITLE:details:corroboration":function(){return"Potwierdzenie przestoju"},"PANEL:TITLE:editForm":function(){return"Formularz edycji danych przestoju"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania przestoju"},"filter:submit":function(){return"Filtruj przestoje"},"filter:tooltip:in":function(){return"Zaznaczony: wszystkie wybrane\nNiezaznaczony: wszystkie oprócz wybranych"},"filter:placeholder:aor":function(){return"Dowolny obszar odpowiedzialności"},"filter:placeholder:reason":function(){return"Dowolny powód przestoju"},"filter:placeholder:orgUnit":function(){return"Dowolna jednostka organizacyjna"},"LIST:ACTION:corroborate":function(){return"Potwierdź przestój"},"PROPERTY:rid":function(){return"ID"},"PROPERTY:mrpControllers":function(){return"Kontroler MRP"},"PROPERTY:prodFlow":function(){return"Przepływ"},"PROPERTY:orgUnit":function(){return"Jednostka organizacyjna"},"PROPERTY:aor":function(){return"Obszar odpowiedzialności"},"PROPERTY:prodLine":function(){return"Linia produkcyjna/Maszyna"},"PROPERTY:reason":function(){return"Powód przestoju"},"PROPERTY:reasonComment":function(){return"Komentarz powodu"},"PROPERTY:decisionComment":function(){return"Komentarz potwierdzenia"},"PROPERTY:order":function(){return"Wykonywane zlecenie"},"PROPERTY:orderId":function(){return"Zlecenie"},"PROPERTY:startedAt":function(){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(){return"Czas zakończenia"},"PROPERTY:status":function(){return"Status"},"PROPERTY:status:undecided":function(){return"Niepotwierdzony"},"PROPERTY:status:confirmed":function(){return"Potwierdzony"},"PROPERTY:status:rejected":function(){return"Odrzucony"},"PROPERTY:shift":function(){return"Zmiana"},"PROPERTY:master":function(){return"Mistrz"},"PROPERTY:leader":function(){return"Lider"},"PROPERTY:operator":function(){return"Operator"},"PROPERTY:operators":function(){return"Operatorzy"},"PROPERTY:creator":function(){return"Użytkownik rozpoczynający"},"PROPERTY:corroborator":function(){return"Użytkownik potwierdzający"},"PROPERTY:corroboratedAt":function(){return"Czas potwierdzenia"},"PROPERTY:duration":function(){return"Czas trwania"},"PROPERTY:pressWorksheet":function(){return"Karta pracy"},"FORM:ACTION:add":function(){return"Dodaj przestój"},"FORM:ACTION:edit":function(){return"Edytuj przestój"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać przestoju :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować przestoju :-("},"FORM:ERROR:startedAt":function(){return"Czas rozpoczęcia musi mieścić się w ramach Zmiany produkcyjnej!"},"FORM:ERROR:finishedAt":function(){return"Czas zakończenia musi mieścić się w ramach Zmiany produkcyjnej!"},"FORM:ERROR:times":function(){return"Czas zakończenia musi być po Czasie rozpoczęcia!"},"FORM:ERROR:INVALID_CHANGES":function(){return"Nie można zmodyfikować przestoju: nie wykryto żadnych poprawnych zmian :("},"FORM:ERROR:INPUT":function(){return"Nieprawidłowe dane wejściowe!"},"shift+date":function(r){return n.v(r,"date")+", "+n.v(r,"shift")+" zmiana"},"NO_DATA:order":function(){return"<em>brak zlecenia</em>"},"NO_DATA:finishedAt":function(){return"<em>nie ukończony</em>"},"NO_DATA:corroboration":function(){return"Przestój nie został jeszcze potwierdzony."},"corroborate:title":function(){return"Potwierdzenie przestoju"},"corroborate:decisionComment":function(){return"Opcjonalny komentarz do potwierdzenia..."},"corroborate:cancel":function(){return"Anuluj potwierdzenie"},"corroborate:confirm":function(){return"Zatwierdź przestój"},"corroborate:reject":function(){return"Odrzuć przestój"},"corroborate:msg:failure":function(r){return"Nie udało się potwierdzić przestoju: "+n.v(r,"error")},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia przestoju"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń przestój"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany przestój?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć przestój <em>"+n.v(r,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć przestoju :-("},"filter:message":function(){return"Jeżeli po przejściu do ekranu szczegołów wybranego przestoju chcesz wrócić do ekranu listy przestojów zachowując wcześniej zdefiniowane filtry, to skorzystaj z przycisku <em><i class='fa fa-arrow-left'></i> Wstecz</em> przeglądarki lub wciśnij klawisz <kbd><i class='fa fa-long-arrow-left'></i> Backspace</kbd> na klawiaturze."}}});