define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,i,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[i](n[r]-t),r in o?o[r]:o.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Badanie Opinia"},"BREADCRUMBS:browse":function(n){return"Badania"},"BREADCRUMBS:addForm":function(n){return"Dodawanie"},"BREADCRUMBS:editForm":function(n){return"Edycja"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Usuwanie"},"BREADCRUMBS:report":function(n){return"Raport"},"BREADCRUMBS:settings":function(n){return"Ustawienia"},"navbar:main":function(n){return"Badanie Opinia"},"navbar:current":function(n){return"Aktualne badanie"},"navbar:report":function(n){return"Raport"},"navbar:actions":function(n){return"Akcje naprawcze"},"navbar:responses":function(n){return"Odpowiedzi"},"navbar:scanning":function(n){return"Skanowanie"},"navbar:scanTemplates":function(n){return"Szablony"},"navbar:omrResults":function(n){return"Wyniki"},"navbar:dictionaries":function(n){return"Słowniki"},"navbar:surveys":function(n){return"Badania"},"navbar:employers":function(n){return"Pracodawcy"},"navbar:divisions":function(n){return"Wydziały"},"navbar:questions":function(n){return"Pytania"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie badań nie powiodło się :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie badania nie powiodło się :("},"MSG:DELETED":function(n){return"Badanie <em>"+e.v(n,"label")+"</em> zostało usunięte."},"PAGE_ACTION:print":function(n){return"Wersja do druku"},"PAGE_ACTION:add":function(n){return"Dodaj badanie"},"PAGE_ACTION:edit":function(n){return"Edytuj badanie"},"PAGE_ACTION:editEmployeeCount":function(n){return"Edytuj zatrudnienie"},"PAGE_ACTION:delete":function(n){return"Usuń badanie"},"PAGE_ACTION:settings":function(n){return"Ustawienia"},"LIST:ACTION:print":function(n){return"Pokaż wersję do druku"},"PANEL:TITLE:details":function(n){return"Szczegóły badania"},"PANEL:TITLE:addForm":function(n){return"Formularz dodawania badania"},"PANEL:TITLE:editForm":function(n){return"Formularz edycji badania"},"PANEL:TITLE:editEmployeeCountForm":function(n){return"Formularz edycji zatrudnienia w trakcie badania"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:label":function(n){return"Etykieta"},"PROPERTY:startDate":function(n){return"Data rozpoczęcia"},"PROPERTY:endDate":function(n){return"Data zakończenia"},"PROPERTY:intro":function(n){return"Wstęp"},"PROPERTY:employers":function(n){return"Pracodawcy"},"PROPERTY:employers._id":function(n){return"ID"},"PROPERTY:employers.full":function(n){return"Pełna nazwa"},"PROPERTY:employers.short":function(n){return"Krótka nazwa"},"PROPERTY:superiors":function(n){return"Przełożeni"},"PROPERTY:superiors.full":function(n){return"Pełna nazwa"},"PROPERTY:superiors.short":function(n){return"Krótka nazwa"},"PROPERTY:superiors.division":function(n){return"Wydział"},"PROPERTY:questions":function(n){return"Pytania"},"PROPERTY:questions._id":function(n){return"ID"},"PROPERTY:questions.short":function(n){return"Krótka treść"},"PROPERTY:questions.full":function(n){return"Pełna treść"},"PROPERTY:employeeCount":function(n){return"Zatrudnienie"},"PROPERTY:employeeCount.division":function(n){return"Wydział"},"PROPERTY:employeeCount.employer":function(n){return"Pracodawca"},"PROPERTY:employeeCount.count":function(n){return"Ilość pracowników"},"FORM:ACTION:add":function(n){return"Dodaj badanie"},"FORM:ACTION:edit":function(n){return"Edytuj badanie"},"FORM:ACTION:editEmployeeCount":function(n){return"Edytuj zatrudnienie"},"FORM:ACTION:preview":function(n){return"Wygeneruj podgląd (ALT+P)"},"FORM:ERROR:previewFailure":function(n){return"Nie udało się wygenerować podglądu :("},"FORM:ERROR:previewPopupBlocked":function(n){return"Wyskakujące okienko podglądu zostało zablokowane :("},"FORM:ERROR:addFailure":function(n){return"Nie udało się dodać badania :("},"FORM:ERROR:editFailure":function(n){return"Nie udało się zmodyfikować badania :("},"form:placeholder:employers":function(n){return"Wybierz opcje dostępne do zaznaczenia w pytaniu Jestem pracownikiem..."},"form:placeholder:questions":function(n){return"Wybierz pytania ankiety..."},"form:help:_id":function(n){return"Unikalny identyfikator badania wykorzystywany do łatwiejszej identyfikacji danych powiązanych z tym badaniem. Dozwolone są tylko znaki alfanumeryczne, myślnik oraz podkreślenie (A-Z0-9-_). Na przykład, rok i miesiąc rozpoczęcia badania: 2015-07. Wartości tej nie będzie można zmienić po dodaniu."},"form:help:label":function(n){return"Krótka etykieta badania wyświetlana między innymi na wykresach porównawczych. Na przykład, rok i miesiąc badania: Lipiec 2015."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia badania"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń badanie"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrane badanie?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć badanie <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć badania :("},"report:filter:surveys":function(n){return"Badania"},"report:filter:divisions":function(n){return"Wydziały"},"report:filter:superiors":function(n){return"Przełożeni"},"report:filter:employers":function(n){return"Pracodawcy"},"report:responseCount:title":function(n){return"Ilość respondentów/Zatrudnienie/Respondencja"},"report:responseCount:survey":function(n){return"Badanie"},"report:responseCountByDivision:title":function(n){return"Ilość respondentów wg Wydziałów z podziałem na Pracodawcę"},"report:responseCountByDivision:series":function(n){return"Ilość respondentów"},"report:responseCountByDivision:filename":function(n){return"Opinia_IloscRespondentowWgWydzialow"},"report:responseCountBySuperior:title":function(n){return"Ilość respondentów wg Przełożonych z podziałem na Pracodawcę"},"report:responseCountBySuperior:series":function(n){return"Ilość respondentów"},"report:responseCountBySuperior:filename":function(n){return"Opinia_IloscRespondentowWgPrzelozonych"},"report:responsePercentBySurvey:title":function(n){return"Respondencja w wybranych Badaniach [%]"},"report:responsePercentBySurvey:filename":function(n){return"Opinia_RespondencjaWgBadan"},"report:responsePercentByDivision:title":function(n){return"Respondencja w wybranych Wydziałach [%]"},"report:responsePercentByDivision:filename":function(n){return"Opinia_RespondencjaWgWydzialow"},"report:answerCountTotal:title":function(n){return"Wyniki ankiety [ilość]"},"report:answerCountTotal:filename":function(n){return"Opinia_WynikiAnkiety"},"report:answerCountBySurvey:title:normal":function(n){return"Wyniki ankiety wg Badań [ilość]"},"report:answerCountBySurvey:title:percent":function(n){return"Wyniki ankiety wg Badań [%]"},"report:answerCountBySurvey:filename":function(n){return"Opinia_WynikiAnkietyWgBadan"},"report:answerCountBySuperior:title:normal":function(n){return"Wyniki ankiety wg Przełożonych [ilość]"},"report:answerCountBySuperior:title:percent":function(n){return"Wyniki ankiety wg Przełożonych [%]"},"report:answerCountBySuperior:filename":function(n){return"Opinia_WynikiAnkietyWgPrzelozonych"},"report:positiveAnswerPercentBySurvey:title":function(n){return"Średnia ocen pozytywnych w wybranych Badaniach [%]"},"report:positiveAnswerPercentBySurvey:filename":function(n){return"Opinia_SredniaOcenWgBadan"},"report:positiveAnswerPercentByDivision:title":function(n){return"Średnia ocen pozytywnych w wybranych Wydziałach [%]"},"report:positiveAnswerPercentByDivision:filename":function(n){return"Opinia_SredniaOcenWgWydzialow"},"report:answer:yes":function(n){return"Zgadzam się"},"report:answer:na":function(n){return"Nie mam zdania"},"report:answer:no":function(n){return"Nie zgadzam się"},"report:refValue":function(n){return"Cel"},"settings:tab:reports":function(n){return"Raporty"},"settings:positiveAnswersReference":function(n){return"Wartość referencyjna średniej ocen pozytywnych [%]"},"settings:responseReference":function(n){return"Wartość referencyjna respondencji [%]"}}});