define(["app/nls/locale/pl"],function(r){var n={locale:{}};n.locale.pl=r;var o=function(r){if(!r)throw new Error("MessageFormat: No data passed to function.")},t=function(r,n){return o(r),r[n]};return{"BREADCRUMBS:browse":function(){return"Przestoje"},"BREADCRUMBS:details":function(){return"Przestój"},"BREADCRUMBS:corroborate":function(){return"Potwierdzanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie przestojów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie przestoju nie powiodło się :("},"PAGE_ACTION:export":function(){return"Eksportuj przestoje"},"PANEL:TITLE:details":function(){return"Szczegóły przestoju"},"PANEL:TITLE:details:corroboration":function(){return"Potwierdzenie przestoju"},"FILTER:DATE:FROM":function(){return"Od"},"FILTER:DATE:TO":function(){return"Do"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:BUTTON":function(){return"Filtruj przestoje"},"FILTER:TOOLTIP:in":function(){return"Zaznaczony: wszystkie wybrane\nNiezaznaczony: wszystkie oprócz wybranych"},"FILTER:PLACEHOLDER:aor":function(){return"Dowolny obszar odpowiedzialności"},"FILTER:PLACEHOLDER:reason":function(){return"Dowolny powód przestoju"},"FILTER:PLACEHOLDER:orgUnit":function(){return"Dowolna jednostka organizacyjna"},"LIST:ACTION:corroborate":function(){return"Potwierdź przestój"},"PROPERTY:mrpControllers":function(){return"Kontroler MRP"},"PROPERTY:prodFlow":function(){return"Przepływ"},"PROPERTY:orgUnit":function(){return"Jednostka organizacyjna"},"PROPERTY:aor":function(){return"Obszar odpowiedzialności"},"PROPERTY:prodLine":function(){return"Linia produkcyjna/Maszyna"},"PROPERTY:reason":function(){return"Powód przestoju"},"PROPERTY:reasonComment":function(){return"Komentarz powodu"},"PROPERTY:decisionComment":function(){return"Komentarz potwierdzenia"},"PROPERTY:order":function(){return"Wykonywane zlecenie"},"PROPERTY:orderId":function(){return"Zlecenie"},"PROPERTY:startedAt":function(){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(){return"Czas zakończenia"},"PROPERTY:status":function(){return"Status"},"PROPERTY:status:undecided":function(){return"Niepotwierdzony"},"PROPERTY:status:confirmed":function(){return"Potwierdzony"},"PROPERTY:status:rejected":function(){return"Odrzucony"},"PROPERTY:shift":function(){return"Zmiana"},"PROPERTY:master":function(){return"Mistrz"},"PROPERTY:leader":function(){return"Lider"},"PROPERTY:operator":function(){return"Operator"},"PROPERTY:creator":function(){return"Użytkownik rozpoczynający"},"PROPERTY:corroborator":function(){return"Użytkownik potwierdzający"},"PROPERTY:corroboratedAt":function(){return"Czas potwierdzenia"},"PROPERTY:duration":function(){return"Czas trwania"},"shift+date":function(r){return t(r,"date")+", "+t(r,"shift")+" zmiana"},"NO_DATA:order":function(){return"<em>brak zlecenia</em>"},"NO_DATA:finishedAt":function(){return"<em>nie ukończony</em>"},"NO_DATA:corroboration":function(){return"Przestój nie został jeszcze potwierdzony."},"corroborate:title":function(){return"Potwierdzenie przestoju"},"corroborate:decisionComment":function(){return"Opcjonalny komentarz do potwierdzenia..."},"corroborate:cancel":function(){return"Anuluj potwierdzenie"},"corroborate:confirm":function(){return"Zatwierdź przestój"},"corroborate:reject":function(){return"Odrzuć przestój"},"corroborate:msg:failure":function(r){return"Nie udało się potwierdzić przestoju: "+t(r,"error")},"filter:message":function(){return"Jeżeli po przejściu do ekranu szczegołów wybranego przestoju chcesz wrócić do ekranu listy przestojów zachowując wcześniej zdefiniowane filtry, to skorzystaj z przycisku <em><i class='fa fa-arrow-left'></i> Wstecz</em> przeglądarki lub wciśnij klawisz <kbd><i class='fa fa-long-arrow-left'></i> Backspace</kbd> na klawiaturze."}}});