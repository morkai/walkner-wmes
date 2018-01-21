define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[i](n[t]-r),t in u?u[t]:u.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"FTE"},"BREADCRUMBS:master:browse":function(n){return"FTE (produkcja)"},"BREADCRUMBS:wh:browse":function(n){return"FTE (magazyn)"},"BREADCRUMBS:leader:browse":function(n){return"FTE (inne)"},"BREADCRUMBS:addForm":function(n){return"Wybieranie wpisu"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:details":function(n){return"Zasoby"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie danych FTE nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie danych FTE nie powiodło się."},"MSG:DELETED":function(n){return"Wpis FTE <em>"+e.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:print":function(n){return"Pokaż wersję do druku"},"PAGE_ACTION:add":function(n){return"Przydzielaj zasoby"},"PAGE_ACTION:edit":function(n){return"Edytuj wpis"},"PAGE_ACTION:delete":function(n){return"Usuń wpis"},"PAGE_ACTION:export":function(n){return"Eksportuj wpisy"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:changeRequest:save":function(n){return"Utwórz żądanie zmiany"},"PAGE_ACTION:changeRequest:cancel":function(n){return"Anuluj"},"LIST:ACTION:requestChange":function(n){return"Utwórz żądanie zmiany"},"filter:date":function(n){return"Data"},"filter:shift":function(n){return"Zmiana"},"filter:submit":function(n){return"Filtruj wpisy"},"addForm:panel:title":function(n){return"Formularz wyszukiwania/tworzenia wpisu FTE"},"addForm:copy":function(n){return"Kopiuj wartości z poprzedniego wpisu wybranej zmiany"},"addForm:submit":function(n){return"Przydzielaj zasoby"},"addForm:msg:offline":function(n){return"Nie można przydzielać zasobów: brak połączenia z serwerem."},"addForm:msg:failure":function(n){return"Nie udało się znaleźć/utworzyć wpisu do edycji: "+e.s(n,"error",{AUTH:"brak uprawnień!",INPUT:"nieprawidłowe dane wejściowe!",other:e.v(n,"error")})},"property:date":function(n){return"Data"},"property:shift":function(n){return"Zmiana"},label:function(n){return e.v(n,"subdivision")+", "+e.v(n,"date")+", "+e.v(n,"shift")+" zmiana"},"leaderEntry:panel:title":function(n){return"Podział zasobów"},"leaderEntry:panel:title:editable":function(n){return"Formularz przydzielania zasobów"},"leaderEntry:column:task":function(n){return"Zadanie produkcyjne"},"leaderEntry:column:taskTotal":function(n){return"Suma"},"leaderEntry:column:companyTotal":function(n){return"Suma"},"masterEntry:tasksPanel:title":function(n){return"Podział zasobów"},"masterEntry:tasksPanel:title:editable":function(n){return"Formularz przydzielania zasobów"},"masterEntry:absencePanel:title":function(n){return"Absencja personalna"},"masterEntry:absencePanel:title:editable":function(n){return"Formularz absencji personalnej"},"masterEntry:column:task":function(n){return"Przepływ/<em>Zadanie produkcyjne</em>"},"masterEntry:column:noPlan":function(n){return"Brak planu?"},"masterEntry:column:total":function(n){return"Suma"},"masterEntry:column:demand":function(n){return"Zamówienie"},"masterEntry:column:supply":function(n){return"Dostarczenie"},"masterEntry:column:shortage":function(n){return"Braki"},showHidden:function(n){return"Pokaż ukryte"},"print:hdLeft":function(n){return"Zasoby przydzielone do "+e.v(n,"subdivision")},"print:hdRight":function(n){return e.v(n,"date")+", "+e.v(n,"shift")+" zmiana"},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wpisu FTE"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wpis FTE"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany wpis FTE?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wpis FTE <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wpisu FTE."},"settings:tab:general":function(n){return"Ogólne"},"settings:tab:structure":function(n){return"Struktura"},"settings:general:absenceTasks":function(n){return"Zadania produkcyjne zaliczane do absencji"},"settings:structure:subdivision:placeholder":function(n){return"Wybierz dział, dla którego chcesz ustalić strukturę wpisu FTE"},"settings:structure:prodFunction":function(n){return"Funkcja"},"settings:structure:prodFunction:placeholder":function(n){return"Wybierz funkcję"},"settings:structure:companies":function(n){return"Pracodawcy"},"settings:structure:companies:placeholder":function(n){return"Wybierz firmy"},"changeRequest:warning:edit":function(n){return"Jesteś w trybie tworzenia żądania zmiany danych produkcyjnych. Wpis FTE zostanie zaktualizowany dopiero po zaakceptowaniu dokonanych zmian przez osobę odpowiedzialną."},"changeRequest:comment:placeholder":function(n){return"Opcjonalny komentarz do żądania zmiany..."},"changeRequest:msg:success:edit":function(n){return"Żądanie edycji wpisu FTE zostało utworzone."},"changeRequest:msg:failure:edit":function(n){return"Nie udało się stworzyć żądania edycji wpisu FTE."}}});