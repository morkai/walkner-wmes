define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,u,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[u](n[t]-e),t in o?o[t]:o.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:base":function(){return"Xiconf"},"BREADCRUMBS:browse":function(){return"Programy"},"BREADCRUMBS:addForm":function(){return"Dodawanie"},"BREADCRUMBS:editForm":function(){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Usuwanie"},"MSG:LOADING_FAILURE":function(){return"Ładowanie programów nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Ładowanie programu nie powiodło się :("},"MSG:DELETED":function(n){return"Program <em>"+r.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(){return"Dodaj program"},"PAGE_ACTION:edit":function(){return"Edytuj program"},"PAGE_ACTION:delete":function(){return"Usuń program"},"PAGE_ACTION:toggle":function(){return"Pokaż/ukryj szczegóły"},"PANEL:TITLE:details":function(){return"Szczegóły programu"},"PANEL:TITLE:addForm":function(){return"Formularz dodawania programu"},"PANEL:TITLE:editForm":function(){return"Formularz edycji programu"},"step:wait":function(){return"Przerwa"},"step:pe":function(){return"Test obwodu ochronnego"},"step:iso":function(){return"Test rezystancji izolacji"},"step:sol":function(){return"Programowanie Fortimo Solar"},"step:sol:label":function(){return"prg"},"step:program":function(){return"Programowanie"},"step:program:label":function(){return"prg"},"step:fn":function(){return"Test funkcjonalny"},"step:fn:label":function(){return"fct"},"step:vis":function(){return"Test wizualny"},"type:t24vdc":function(){return"24V DC"},"type:glp2":function(){return"GLP2-I"},"glp2:fn:mode:0":function(){return"Test poboru prądu"},"glp2:fn:mode:0:label":function(){return"Natężenie prądu [A]"},"glp2:fn:mode:1":function(){return"Test mocy pozornej"},"glp2:fn:mode:1:label":function(){return"Moc pozorna [W]"},"glp2:fn:mode:2":function(){return"Test mocy"},"glp2:fn:mode:2:label":function(){return"Moc [W]"},"glp2:fn:mode:3":function(){return"Test cosφ"},"glp2:fn:mode:3:label":function(){return"cosφ"},"glp2:fn:mode:5":function(){return"Test wizualny"},"glp2:fn:mode:5:label":function(){return"Wartość nastawy"},"glp2:fn:mode:6":function(){return"Test napięcia resztkowego"},"glp2:fn:mode:6:label":function(){return"Napięcie resztkowe [V]"},"glp2:iso:mode:0":function(){return"Oporność ISO"},"glp2:iso:mode:0:label":function(){return"Wartość nastawy [MΩ]"},"glp2:iso:mode:1":function(){return"Prąd ISO"},"glp2:iso:mode:1:label":function(){return"Wartość nastawy [mA]"},"glp2:iso:mode:2":function(){return"Warystor"},"glp2:iso:mode:2:label":function(){return"Wartość nastawy [V]"},"glp2:iso:u":function(){return"Napięcie izolacji [V]"},"glp2:iso:rMax":function(){return"Maksymalny opór [MΩ]"},"glp2:iso:ramp":function(){return"Czas rampowy"},"glp2:vis:duration":function(){return"Czas do potwierdzenia"},"glp2:vis:maxDuration":function(){return"Czas na potwierdzenie"},"glp2:vis:mode":function(){return"Tryb potwierdzenia"},"glp2:vis:mode:0":function(){return"Normalny"},"glp2:vis:mode:1":function(){return"Stan kontrolowany"},"glp2:vis:goInput":function(){return"Wejście sukcesu"},"glp2:vis:noGoInput":function(){return"Wejście porażki"},"glp2:input:1":function(){return"Start"},"glp2:input:2":function(){return"Sonda: przycisk 1"},"glp2:input:3":function(){return"Sonda: przycisk 2"},"glp2:input:4":function(){return"Sonda: przełącznik"},"glp2:input:5":function(){return"HV Start"},"glp2:input:6":function(){return"HV Stop"},"glp2:input:7":function(){return"HV Pistol (sonda wysokonapięciowa)"},"glp2:input:8":function(){return"RSP Trigger"},"glp2:input:15":function(){return"Przełącznik z kluczem 1 (lewy)"},"glp2:input:16":function(){return"Przełącznik z kluczem 2 (prawy)"},"glp2:input:17":function(){return"Wejście dodatkowe 1"},"glp2:input:18":function(){return"Wejście dodatkowe 2"},"glp2:input:19":function(){return"Wejście dodatkowe 3"},"glp2:input:20":function(){return"Wejście dodatkowe 4"},"glp2:input:21":function(){return"Przełącznik oburęczny 1"},"glp2:input:22":function(){return"Przełącznik oburęczny 2"},"glp2:input:23":function(){return"Styk bezpieczeństwa HV"},"glp2:input:24":function(){return"Styk bezpieczeństwa LV"},"glp2:input:25":function(){return"Przełącznik nożny"},"glp2:input:26":function(){return"Stop bezpieczeństwa"},"glp2:input:27":function(){return"Start oburęczny"},"filter:submit":function(){return"Filtruj programy"},"PROPERTY:name":function(){return"Nazwa"},"PROPERTY:type":function(){return"Typ"},"PROPERTY:prodLines":function(){return"Linie produkcyjne"},"PROPERTY:prodLines:all":function(){return"Wszystkie"},"PROPERTY:createdAt":function(){return"Data i czas dodania"},"PROPERTY:updatedAt":function(){return"Data i czas modyfikacji"},"PROPERTY:startTime":function(){return"Czas rozruchu"},"PROPERTY:duration":function(){return"Czas pomiaru"},"PROPERTY:totalTime":function(){return"Całkowity czas testu"},"PROPERTY:voltage":function(){return"Napięcie [V]"},"PROPERTY:current":function(){return"Natężenie [A]"},"PROPERTY:resistance:max":function(){return"Maksymalny opór [Ω]"},"PROPERTY:power":function(){return"Moc [W]"},"PROPERTY:power:req":function(){return"Wymagana moc [W]"},"PROPERTY:power:rel":function(){return"Tolerancja [%]"},"PROPERTY:power:min":function(){return"Minimalna moc [W]"},"PROPERTY:power:max":function(){return"Maksymalna moc [W]"},"PROPERTY:steps":function(){return"Kroki"},"PROPERTY:waitKind":function(){return"Kontynuacja"},"PROPERTY:waitKind:manual":function(){return"po akcji użytkownika"},"PROPERTY:waitKind:auto":function(){return"po upływie czasu:"},"PROPERTY:label":function(){return"Definicja testu"},"PROPERTY:mode":function(){return"Tryb badania"},"PROPERTY:buzzer":function(){return"Sygnał dźwiękowy"},"PROPERTY:buzzer:0":function(){return"Wyłączony"},"PROPERTY:buzzer:1":function(){return"Po sukcesie"},"PROPERTY:lowerTolerance":function(){return"Dolna granica"},"PROPERTY:upperTolerance":function(){return"Górna granica"},"PROPERTY:execution":function(){return"Rodzaj przebiegu"},"PROPERTY:execution:0":function(){return"Automatyczny"},"PROPERTY:execution:1":function(){return"Przytrzymaj start"},"PROPERTY:execution:2":function(){return"Stop przed testem"},"PROPERTY:execution:4":function(){return"Stop po teście"},"PROPERTY:trigger":function(){return"Wyzwalacz"},"PROPERTY:trigger:0":function(){return"Czas rozruchu"},"PROPERTY:trigger:1":function(){return"Sygnał startu"},"PROPERTY:trigger:2":function(){return"Mierzona wartość"},"FORM:ACTION:add":function(){return"Dodaj program"},"FORM:ACTION:edit":function(){return"Edytuj program"},"FORM:ERROR:addFailure":function(){return"Nie udało się dodać programu :-("},"FORM:ERROR:editFailure":function(){return"Nie udało się zmodyfikować programu :-("},"FORM:ERROR:minDuration":function(){return"Wartość nie może być mniejsza niż 1s."},"FORM:ERROR:minMaxDurations":function(){return"Czas na potwierdzenie musi być dłuższy od Czasu do potwierdzenia."},"FORM:ERROR:requiredStep":function(){return"Wybierz przynajmniej jeden krok."},"form:steps:add":function(){return"Dodaj krok"},"form:steps:placeholder":function(){return"Wybierz typ kroku..."},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Potwierdzenie usunięcia programu"},"ACTION_FORM:BUTTON:delete":function(){return"Usuń program"},"ACTION_FORM:MESSAGE:delete":function(){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany program?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć program <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Nie udało się usunąć programu :-("}}});