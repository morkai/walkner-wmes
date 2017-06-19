define(["app/nls/locale/pl"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,e){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(e||0)},v:function(r,e){return n.c(r,e),r[e]},p:function(r,e,t,o,i){return n.c(r,e),r[e]in i?i[r[e]]:(e=n.lc[o](r[e]-t),e in i?i[e]:i.other)},s:function(r,e,t){return n.c(r,e),r[e]in t?t[r[e]]:t.other}};return{"BREADCRUMBS:base":function(r){return"Obserwacje zachowań"},"BREADCRUMBS:browse":function(r){return"Karty"},"BREADCRUMBS:addForm":function(r){return"Dodawanie"},"BREADCRUMBS:editForm":function(r){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(r){return"Usuwanie"},"BREADCRUMBS:reports:count":function(r){return"Ilość obserwacji"},"MSG:LOADING_FAILURE":function(r){return"Ładowanie kart obserwacji nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(r){return"Ładowanie karty obserwacji nie powiodło się :("},"MSG:DELETED":function(r){return"Karta obserwacji <em>"+n.v(r,"label")+"</em> została usunięta."},"MSG:jump:404":function(r){return"Nie znaleziono karty obserwacji o ID <em>"+n.v(r,"rid")+"</em> :("},"PAGE_ACTION:add":function(r){return"Dodaj kartę"},"PAGE_ACTION:edit":function(r){return"Edytuj kartę"},"PAGE_ACTION:delete":function(r){return"Usuń kartę"},"PAGE_ACTION:export":function(r){return"Eksportuj karty"},"PAGE_ACTION:jump:title":function(r){return"Skocz do karty po ID"},"PAGE_ACTION:jump:placeholder":function(r){return"ID karty"},"PAGE_ACTION:print":function(r){return"Wersja do druku"},"PANEL:TITLE:details":function(r){return"Szczegóły karty obserwacji"},"PANEL:TITLE:where":function(r){return"Miejsce obserwacji"},"PANEL:TITLE:observations":function(r){return"Obserwacje zachowań"},"PANEL:TITLE:risks":function(r){return"Ryzykowne warunki w miejscu pracy"},"PANEL:TITLE:difficulties":function(r){return"Trudności zmian"},"PANEL:TITLE:addForm":function(r){return"Formularz dodawania karty obserwacji"},"PANEL:TITLE:editForm":function(r){return"Formularz edycji karty obserwacji"},"PROPERTY:rid":function(r){return"ID"},"PROPERTY:date":function(r){return"Data obserwacji"},"PROPERTY:section":function(r){return"Dział"},"PROPERTY:observer":function(r){return"Obserwator"},"PROPERTY:position":function(r){return"Stanowisko"},"PROPERTY:line":function(r){return"Linia"},"PROPERTY:creator":function(r){return"Stworzone przez"},"PROPERTY:updater":function(r){return"Ostatnio zmienione przez"},"PROPERTY:createdAt":function(r){return"Czas stworzenia"},"PROPERTY:updatedAt":function(r){return"Czas ostatniej zmiany"},"PROPERTY:observations:safe:true":function(r){return"Bezpieczne"},"PROPERTY:observations:safe:false":function(r){return"Ryzykowne"},"PROPERTY:observations:category":function(r){return"Kategoria zachowań"},"PROPERTY:observations:observation":function(r){return"Co zaobserwowano?"},"PROPERTY:observations:cause":function(r){return"Co aktywowało ryzykowne zachowanie?"},"PROPERTY:observations:easy:true":function(r){return"&quot;Łatwe&quot;"},"PROPERTY:observations:easy:false":function(r){return"&quot;Trudne&quot;"},"PROPERTY:risks:risk":function(r){return"Co zauważono?"},"PROPERTY:risks:cause":function(r){return"Jaka była przyczyna powstania ryzyka?"},"PROPERTY:risks:easy:true":function(r){return"&quot;Łatwe&quot;"},"PROPERTY:risks:easy:false":function(r){return"&quot;Trudne&quot;"},"PROPERTY:difficulties:problem":function(r){return"&quot;Trudne&quot; do zmiany zachowania oraz warunki pracy"},"PROPERTY:difficulties:solution":function(r){return"Proponowane rozwiązanie"},"PROPERTY:difficulties:behavior:true":function(r){return"Zachowanie"},"PROPERTY:difficulties:behavior:false":function(r){return"Warunki pracy"},"PROPERTY:easyDiscussed":function(r){return"&quot;Łatwe&quot; do zmiany zachowania oraz warunki pracy omówiono z osobą obserwowaną i uzyskano potwierdzenie pracy w sposób bezpieczny."},"PROPERTY:observation":function(r){return"Co zaobserwowano"},"PROPERTY:risk":function(r){return"Ryzykowne warunki w miejscu pracy"},"PROPERTY:hardBehavior":function(r){return"Trudne do zmiany zachowania"},"PROPERTY:hardCondition":function(r){return"Trudne do zmiany warunki pracy"},"FORM:ACTION:add":function(r){return"Dodaj kartę obserwacji zachowań"},"FORM:ACTION:edit":function(r){return"Zapisz kartę obserwacji zachowań"},"FORM:ERROR:addFailure":function(r){return"Nie udało się dodać karty obserwacji :("},"FORM:ERROR:editFailure":function(r){return"Nie udało się zmodyfikować karty obserwacji :("},"FORM:ERROR:empty":function(r){return"Opisz przynajmniej jedną obserwację lub ryzykowne warunki w pracy."},"FORM:MSG:risks":function(r){return"Jeżeli stwierdziłeś ryzykowne warunki w miejscu prowadzenia obserwacji zarejestruj je w bazie ZPW - <a href='#kaizenOrders;add'>Zgłoś ZPW</a>!"},"FORM:MSG:difficulties":function(r){return"Proponowane rozwiązania zarejestruj w bazie Usprawnień - <a href='#suggestions;add'>Zgłoś sugestię</a>!"},"FORM:BTN:add":function(r){return"Dodaj nowe"},"FORM:BTN:remove":function(r){return"Usuń puste"},"ACTION_FORM:DIALOG_TITLE:delete":function(r){return"Potwierdzenie usunięcia karty obserwacji"},"ACTION_FORM:BUTTON:delete":function(r){return"Usuń kartę obserwacji"},"ACTION_FORM:MESSAGE:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć wybraną kartę obserwacji zachowań?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(r){return"Czy na pewno chcesz bezpowrotnie usunąć kartę obserwacji zachowań <em>"+n.v(r,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(r){return"Nie udało się usunąć karty obserwacji :("},"filter:user:mine":function(r){return"Moje"},"filter:user:observer":function(r){return"Obserwator"},"filter:user:others":function(r){return"Uczestnik"},"filter:anyHard":function(r){return"Trudne do zmiany"},"filter:anyHard:observations":function(r){return"zachowania"},"filter:anyHard:risks":function(r){return"warunki pracy"},"filter:submit":function(r){return"Filtruj"},"report:title:countBySection":function(r){return"Ilość przeprowadzonych obserwacji"},"report:title:safeBySection":function(r){return"Ilość bezpiecznych zachowań"},"report:title:riskyBySection":function(r){return"Ilość ryzykownych zachowań"},"report:title:categories":function(r){return"Ilość ryzykownych zachowań wg kategorii"},"report:series:total":function(r){return"Suma"},"report:filenames:countBySection":function(r){return"OBS_Ilosc"},"report:filenames:safeBySection":function(r){return"OBS_IloscBezpZach"},"report:filenames:riskyBySection":function(r){return"OBS_IloscRyzykZach"},"report:filenames:categories":function(r){return"OBS_IloscRyzykZachWgKategorii"}}});