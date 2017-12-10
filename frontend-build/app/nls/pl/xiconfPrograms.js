define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,u,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[u](n[t]-e),t in o?o[t]:o.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Xiconf"},"BREADCRUMBS:browse":function(n){return"Programy"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie programów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie programu nie powiodło się."},"MSG:DELETED":function(n){return"Program <em>"+r.v(n,"label")+"</em> został usunięty."},"PAGE_ACTION:add":function(n){return"Dodaj program"},"PAGE_ACTION:edit":function(n){return"Edytuj program"},"PAGE_ACTION:delete":function(n){return"Usuń program"},"PAGE_ACTION:toggle":function(n){return"Pokaż/ukryj szczegóły"},"PANEL:TITLE:details":function(n){return"Szczegóły programu"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania programu"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji programu"},"step:wait":function(n){return"Przerwa"},"step:pe":function(n){return"Test obwodu ochronnego"},"step:iso":function(n){return"Test rezystancji izolacji"},"step:sol":function(n){return"Programowanie Fortimo Solar"},"step:sol:label":function(n){return"prg"},"step:program":function(n){return"Programowanie"},"step:program:label":function(n){return"prg"},"step:fn":function(n){return"Test funkcjonalny"},"step:fn:label":function(n){return"fct"},"step:vis":function(n){return"Test wizualny"},"type:t24vdc":function(n){return"24V DC"},"type:glp2":function(n){return"GLP2-I"},"glp2:fn:mode:0":function(n){return"Test poboru prądu"},"glp2:fn:mode:0:label":function(n){return"Natężenie prądu [A]"},"glp2:fn:mode:1":function(n){return"Test mocy pozornej"},"glp2:fn:mode:1:label":function(n){return"Moc pozorna [W]"},"glp2:fn:mode:2":function(n){return"Test mocy"},"glp2:fn:mode:2:label":function(n){return"Moc [W]"},"glp2:fn:mode:3":function(n){return"Test cosφ"},"glp2:fn:mode:3:label":function(n){return"cosφ"},"glp2:fn:mode:5":function(n){return"Test wizualny"},"glp2:fn:mode:5:label":function(n){return"Wartość nastawy"},"glp2:fn:mode:6":function(n){return"Test napięcia resztkowego"},"glp2:fn:mode:6:label":function(n){return"Napięcie resztkowe [V]"},"glp2:iso:mode:0":function(n){return"Oporność ISO"},"glp2:iso:mode:0:label":function(n){return"Wartość nastawy [MΩ]"},"glp2:iso:mode:1":function(n){return"Prąd ISO"},"glp2:iso:mode:1:label":function(n){return"Wartość nastawy [mA]"},"glp2:iso:mode:2":function(n){return"Warystor"},"glp2:iso:mode:2:label":function(n){return"Wartość nastawy [V]"},"glp2:iso:u":function(n){return"Napięcie izolacji [V]"},"glp2:iso:rMax":function(n){return"Maksymalny opór [MΩ]"},"glp2:iso:ramp":function(n){return"Czas rampowy"},"glp2:vis:duration":function(n){return"Czas do potwierdzenia"},"glp2:vis:maxDuration":function(n){return"Czas na potwierdzenie"},"glp2:vis:mode":function(n){return"Tryb potwierdzenia"},"glp2:vis:mode:0":function(n){return"Normalny"},"glp2:vis:mode:1":function(n){return"Stan kontrolowany"},"glp2:vis:goInput":function(n){return"Wejście sukcesu"},"glp2:vis:noGoInput":function(n){return"Wejście porażki"},"glp2:input:1":function(n){return"Start"},"glp2:input:2":function(n){return"Sonda: przycisk 1"},"glp2:input:3":function(n){return"Sonda: przycisk 2"},"glp2:input:4":function(n){return"Sonda: przełącznik"},"glp2:input:5":function(n){return"HV Start"},"glp2:input:6":function(n){return"HV Stop"},"glp2:input:7":function(n){return"HV Pistol (sonda wysokonapięciowa)"},"glp2:input:8":function(n){return"RSP Trigger"},"glp2:input:15":function(n){return"Przełącznik z kluczem 1 (lewy)"},"glp2:input:16":function(n){return"Przełącznik z kluczem 2 (prawy)"},"glp2:input:17":function(n){return"Wejście dodatkowe 1"},"glp2:input:18":function(n){return"Wejście dodatkowe 2"},"glp2:input:19":function(n){return"Wejście dodatkowe 3"},"glp2:input:20":function(n){return"Wejście dodatkowe 4"},"glp2:input:21":function(n){return"Przełącznik oburęczny 1"},"glp2:input:22":function(n){return"Przełącznik oburęczny 2"},"glp2:input:23":function(n){return"Styk bezpieczeństwa HV"},"glp2:input:24":function(n){return"Styk bezpieczeństwa LV"},"glp2:input:25":function(n){return"Przełącznik nożny"},"glp2:input:26":function(n){return"Stop bezpieczeństwa"},"glp2:input:27":function(n){return"Start oburęczny"},"filter:submit":function(n){return"Filtruj programy"},"PROPERTY:name":function(n){return"Nazwa"},"PROPERTY:type":function(n){return"Typ"},"PROPERTY:prodLines":function(n){return"Linie produkcyjne"},"PROPERTY:prodLines:all":function(n){return"Wszystkie"},"PROPERTY:createdAt":function(n){return"Data i czas dodania"},"PROPERTY:updatedAt":function(n){return"Data i czas modyfikacji"},"PROPERTY:startTime":function(n){return"Czas rozruchu"},"PROPERTY:duration":function(n){return"Czas pomiaru"},"PROPERTY:totalTime":function(n){return"Całkowity czas testu"},"PROPERTY:voltage":function(n){return"Napięcie [V]"},"PROPERTY:current":function(n){return"Natężenie [A]"},"PROPERTY:resistance:max":function(n){return"Maksymalny opór [Ω]"},"PROPERTY:power":function(n){return"Moc [W]"},"PROPERTY:power:req":function(n){return"Wymagana moc [W]"},"PROPERTY:power:rel":function(n){return"Tolerancja [%]"},"PROPERTY:power:min":function(n){return"Minimalna moc [W]"},"PROPERTY:power:max":function(n){return"Maksymalna moc [W]"},"PROPERTY:steps":function(n){return"Kroki"},"PROPERTY:waitKind":function(n){return"Kontynuacja"},"PROPERTY:waitKind:manual":function(n){return"po akcji użytkownika"},"PROPERTY:waitKind:auto":function(n){return"po upływie czasu:"},"PROPERTY:label":function(n){return"Definicja testu"},"PROPERTY:mode":function(n){return"Tryb badania"},"PROPERTY:buzzer":function(n){return"Sygnał dźwiękowy"},"PROPERTY:buzzer:0":function(n){return"Wyłączony"},"PROPERTY:buzzer:1":function(n){return"Po sukcesie"},"PROPERTY:lowerTolerance":function(n){return"Dolna granica"},"PROPERTY:upperTolerance":function(n){return"Górna granica"},"PROPERTY:execution":function(n){return"Rodzaj przebiegu"},"PROPERTY:execution:0":function(n){return"Automatyczny"},"PROPERTY:execution:1":function(n){return"Przytrzymaj start"},"PROPERTY:execution:2":function(n){return"Stop przed testem"},"PROPERTY:execution:4":function(n){return"Stop po teście"},"PROPERTY:trigger":function(n){return"Wyzwalacz"},"PROPERTY:trigger:0":function(n){return"Czas rozruchu"},"PROPERTY:trigger:1":function(n){return"Sygnał startu"},"PROPERTY:trigger:2":function(n){return"Mierzona wartość"},"PROPERTY:lampCount":function(n){return"Ilość świetlówek"},"PROPERTY:lampDuration":function(n){return"Czas nieprzerwanego świecenia [s]"},"FORM:ACTION:add":function(n){return"Dodaj program"},"FORM:ACTION:edit":function(n){return"Edytuj program"},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać programu."},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować programu."},"FORM:ERROR:minDuration":function(n){return"Wartość nie może być mniejsza niż 1s."},"FORM:ERROR:minMaxDurations":function(n){return"Czas na potwierdzenie musi być dłuższy od Czasu do potwierdzenia."},"FORM:ERROR:requiredStep":function(n){return"Wybierz przynajmniej jeden krok."},"form:steps:add":function(n){return"Dodaj krok"},"form:steps:placeholder":function(n){return"Wybierz typ kroku..."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia programu"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń program"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany program?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć program <em>"+r.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć programu."}}});