define(["app/nls/locale/pl"],function(n){var r={locale:{}};return r.locale.pl=n,{"BREADCRUMBS:entryList":function(){var n="";return n+="Plany godzinowe"},"BREADCRUMBS:entryForm":function(){var n="";return n+="Planowanie"},"BREADCRUMBS:entryDetails":function(){var n="";return n+="Plan godzinowy"},"BREADCRUMBS:currentEntry":function(){var n="";return n+="Wybór wydziału"},"MSG:LOADING_FAILURE":function(){var n="";return n+="Ładowanie planów godzinowych nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(){var n="";return n+="Ładowanie planu godzinowego nie powiodło się :("},"PAGE_ACTION:currentEntry":function(){var n="";return n+="Planuj"},"PAGE_ACTION:print":function(){var n="";return n+="Pokaż wersję do druku"},"PAGE_ACTION:lock":function(){var n="";return n+="Zamknij wpis"},"PAGE_ACTION:edit":function(){var n="";return n+="Edytuj wpis"},"LIST:ACTION:print":function(){var n="";return n+="Pokaż wersję do druku"},"LIST:ACTION:edit":function(){var n="";return n+="Edytuj wpis"},"FILTER:DATE":function(){var n="";return n+="Data:"},"FILTER:LIMIT":function(){var n="";return n+="Limit:"},"FILTER:SHIFT":function(){var n="";return n+="Zmiana:"},"FILTER:SHIFT:ANY":function(){var n="";return n+="Dowolna"},"FILTER:BUTTON":function(){var n="";return n+="Filtruj plany"},"panel:title":function(){var n="";return n+="Plan godzinowy"},"panel:title:editable":function(){var n="";return n+="Formularz planu godzinowego"},"column:flow":function(){var n="";return n+="Przepływ"},"column:noPlan":function(){var n="";return n+="Brak<br>planu?"},"column:level":function(){var n="";return n+="Poziom"},"property:shift":function(){var n="";return n+="Zmiana:"},"property:date":function(){var n="";return n+="Data:"},"msg:lockFailure":function(){var n="";return n+="Nie udało się zamknąć wpisu :("},"print:hdLeft":function(n){var r="";if(r+="Plan godzinowy dla ",!n)throw new Error("MessageFormat: No data passed to function.");return r+=n.division},"print:hdRight":function(n){var r="";if(!n)throw new Error("MessageFormat: No data passed to function.");if(r+=n.date,r+=", ",!n)throw new Error("MessageFormat: No data passed to function.");return r+=n.shift,r+=" zmiana"},"current:panel:title":function(){var n="";return n+="Formularz wyboru wydziału do planów godzinowych"},"current:panel:warning":function(){var n="";return n+="<p>Jeżeli wybrany wydział nie będzie miał wpisu dla aktualnej zmiany, zostanie utworzony nowy wpis.</p>"},"current:submit":function(){var n="";return n+="Planuj"},"current:msg:offline":function(){var n="";return n+="Nie można planować: brak połączenia z serwerem :("},"current:msg:failure":function(){var n="";return n+="Nie udało się utworzyć wpisu :("}}});