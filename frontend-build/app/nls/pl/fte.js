define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,i,a){return r.c(n,e),n[e]in a?a[n[e]]:(e=r.lc[i](n[e]-t))in a?a[e]:a.other},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMB:base":function(n){return"FTE"},"BREADCRUMB:master:browse":function(n){return"FTE (produkcja)"},"BREADCRUMB:wh:browse":function(n){return"FTE (magazyn)"},"BREADCRUMB:leader:browse":function(n){return"FTE (inne)"},"BREADCRUMB:addForm":function(n){return"Wybieranie wpisu"},"BREADCRUMB:editForm":function(n){return"Edycja"},"BREADCRUMB:details":function(n){return"Zasoby"},"BREADCRUMB:settings":function(n){return"Ustawienia"},"PAGE_ACTION:print":function(n){return"Pokaż wersję do druku"},"PAGE_ACTION:add":function(n){return"Przydzielaj zasoby"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"PAGE_ACTION:changeRequest:save":function(n){return"Utwórz żądanie zmiany"},"PAGE_ACTION:changeRequest:cancel":function(n){return"Anuluj"},"LIST:ACTION:requestChange":function(n){return"Utwórz żądanie zmiany"},"filter:date":function(n){return"Data"},"filter:shift":function(n){return"Zmiana"},"filter:submit":function(n){return"Filtruj"},"addForm:panel:title":function(n){return"Formularz wyszukiwania/tworzenia wpisu FTE"},"addForm:copy":function(n){return"Kopiuj wartości z poprzedniego wpisu wybranej zmiany"},"addForm:submit":function(n){return"Przydzielaj zasoby"},"addForm:msg:offline":function(n){return"Nie można przydzielać zasobów: brak połączenia z serwerem."},"addForm:msg:failure":function(n){return"Nie udało się znaleźć/utworzyć wpisu do edycji: "+r.s(n,"error",{AUTH:"brak uprawnień!",INPUT:"nieprawidłowe dane wejściowe!",other:r.v(n,"error")})},"property:date":function(n){return"Data"},"property:shift":function(n){return"Zmiana"},label:function(n){return r.v(n,"subdivision")+", "+r.v(n,"date")+", "+r.v(n,"shift")+" zmiana"},"leaderEntry:panel:title":function(n){return"Podział zasobów"},"leaderEntry:panel:title:editable":function(n){return"Formularz przydzielania zasobów"},"leaderEntry:column:task":function(n){return"Zadanie produkcyjne"},"leaderEntry:column:taskTotal":function(n){return"Suma"},"leaderEntry:column:companyTotal":function(n){return"Suma"},"masterEntry:tasksPanel:title":function(n){return"Podział zasobów"},"masterEntry:tasksPanel:title:editable":function(n){return"Formularz przydzielania zasobów"},"masterEntry:absencePanel:title":function(n){return"Absencja personalna"},"masterEntry:absencePanel:title:editable":function(n){return"Formularz absencji personalnej"},"masterEntry:column:task":function(n){return"Przepływ/<em>Zadanie produkcyjne</em>"},"masterEntry:column:noPlan":function(n){return"Brak planu?"},"masterEntry:column:total":function(n){return"Suma"},"masterEntry:column:demand":function(n){return"Zamówienie"},"masterEntry:column:supply":function(n){return"Dostarczenie"},"masterEntry:column:shortage":function(n){return"Braki"},showHidden:function(n){return"Pokaż ukryte"},"print:hdLeft":function(n){return"Zasoby przydzielone do "+r.v(n,"subdivision")},"print:hdRight":function(n){return r.v(n,"date")+", "+r.v(n,"shift")+" zmiana"},"settings:tab:general":function(n){return"Ogólne"},"settings:tab:structure":function(n){return"Struktura"},"settings:general:absenceTasks":function(n){return"Zadania produkcyjne zaliczane do absencji"},"settings:structure:subdivision:placeholder":function(n){return"Wybierz dział, dla którego chcesz ustalić strukturę wpisu FTE"},"settings:structure:prodFunction":function(n){return"Funkcja"},"settings:structure:prodFunction:placeholder":function(n){return"Wybierz funkcję"},"settings:structure:companies":function(n){return"Pracodawcy"},"settings:structure:companies:placeholder":function(n){return"Wybierz firmy"},"changeRequest:warning:edit":function(n){return"Jesteś w trybie tworzenia żądania zmiany danych produkcyjnych. Wpis FTE zostanie zaktualizowany dopiero po zaakceptowaniu dokonanych zmian przez osobę odpowiedzialną."},"changeRequest:comment:placeholder":function(n){return"Opcjonalny komentarz do żądania zmiany..."},"changeRequest:msg:success:edit":function(n){return"Żądanie edycji wpisu FTE zostało utworzone."},"changeRequest:msg:failure:edit":function(n){return"Nie udało się stworzyć żądania edycji wpisu FTE."}}});