define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{"BREADCRUMBS:base":function(n){return"PSCS"},"BREADCRUMBS:learn":function(n){return"Szkolenie"},"BREADCRUMBS:exam":function(n){return"Test"},"BREADCRUMBS:browse":function(n){return"Wyniki"},"intro:title":function(n){return"PSCS <em>Philips Supply Chain Security</em>"},"intro:learn":function(n){return"Szkolenie"},"intro:exam":function(n){return"Test"},"intro:results":function(n){return"Wyniki"},"exam:next":function(n){return"Przejdź do następnego pytania"},"exam:prev":function(n){return"Wróć do poprzedniego pytania"},"exam:cancel":function(n){return"Przerwij test"},"exam:finish":function(n){return"Zakończ test"},"exam:required":function(n){return"Wybierz jedną z odpowiedzi."},"exam:start:label":function(n){return"W celu rozpoczęcia testu z wiedzy o Bezpieczeństwie Łańcucha Dostaw Philips podaj swój numer kadrowy:"},"exam:start:placeholder":function(n){return"Nr kadrowy"},"exam:start:submit":function(n){return"Rozpocznij test"},"exam:start:required":function(n){return"Nr kadrowy jest wymagany."},"exam:start:failure":function(n){return"Nie udało się rozpocząć testu :-("},"exam:start:USER_NOT_FOUND":function(n){return"Użytkownik o podanym numerze kadrowym nie istnieje."},"exam:start:ALREADY_PASSED":function(n){return"Użytkownik o podanym numerze już zaliczył test."},"exam:failure:label":function(n){return"Niestety, ale test nie został zaliczony :-("},"exam:failure:valid":function(n){return e.s(n,"gender",{female:"Odpowiedziałaś",other:"Odpowiedziałeś"})+" poprawnie na "+e.v(n,"count")+" z 8 pytań."},"exam:failure:learn":function(n){return"Przejrzyj prezentację na temat PSCS."},"exam:failure:test":function(n){return"Spróbuj rozwiązać test ponownie."},"exam:success:p1":function(n){return"Gratulacje!"},"exam:success:p2":function(n){return"Test został zaliczony pomyślnie :-)"},"exam:1:question":function(n){return"Pytanie 1/8 Working area to:"},"exam:1:1":function(n){return"biuro lub obszar przemysłowy, w którym realizowane są czynności bezpośrednio związane z międzynarodowym przepływem towarów (np. transport wyrobów gotowych) i związanych z nimi informacji (np. dokumentacja wysyłkowa), jest to miejsce, z którego następuje bezpośrednia wysyłka wyrobów gotowych do klienta"},"exam:1:2":function(n){return"obszar, gdzie produkty są przygotowywane do międzynarodowego transportu, gdzie są przygotowywane do pakowania, pakowane, przechowywane na polu odkładczym, jednakże bez bezpośredniej wysyłki do klienta"},"exam:2:question":function(n){return"Pytanie 2/8. Celem polityki System Bezpieczeństwa Łańcucha Dostaw jest:"},"exam:2:1":function(n){return"zabezpieczenie w odpowiedni i możliwie skuteczny sposób przepływu towarów w łańcuchu logistycznym"},"exam:2:2":function(n){return"zabezpieczenie wyrobów gotowych przez kradzieżą"},"exam:2:3":function(n){return"zabezpieczenie komponentów i produktów marki Philips przed niekontrolowanym dostępem osób nieupoważnionych"},"exam:3:question":function(n){return"Pytanie 3/8 Wymagania PSCS są związane przede wszystkim z obszarami, które mają bezpośrednią styczność z:"},"exam:3:1":function(n){return"wyrobami gotowymi"},"exam:3:2":function(n){return"transportem"},"exam:3:3":function(n){return"związaną z nimi informacją"},"exam:3:4":function(n){return"wszystkie powyżej"},"exam:4:question":function(n){return"Pytanie 4/8 Compartment to:"},"exam:4:1":function(n){return"biuro lub obszar przemysłowy, w którym realizowane są czynności bezpośrednio związane z międzynarodowym przepływem towarów (np. transport wyrobów gotowych) i związanych z nimi informacji (np. dokumentacja wysyłkowa), jest to miejsce, z którego następuje bezpośrednia wysyłka wyrobów gotowych do klienta"},"exam:4:2":function(n){return"obszar, gdzie produkty są przygotowywane do międzynarodowego transportu, gdzie są przygotowywane do pakowania, pakowane, przechowywane na polu odkładczym, jednakże bez bezpośredniej wysyłki do klienta"},"exam:5:question":function(n){return"Pytanie 5/8 Specjalne strefy bezpieczeństwa wydzielone w obszarach PSCS to:"},"exam:5:1":function(n){return"working area"},"exam:5:2":function(n){return"compartment"},"exam:5:3":function(n){return"wszystkie powyżej"},"exam:6:question":function(n){return"Pytanie 6/8 W obrębie krytycznych obszarów COMPARTMENT i WORKING AREA w szczególności należy zwracać uwagę na:"},"exam:6:1":function(n){return"osoby nieupoważnione do przebywania w strefach PSCS"},"exam:6:2":function(n){return"nieautoryzowane zmiany w opakowaniach wyrobów gotowych"},"exam:6:3":function(n){return"zabezpieczenie fizycznego dostępu do wyrobów gotowych zapakowanych i przygotowanych do wysyłki"},"exam:6:4":function(n){return"wszystkie powyżej"},"exam:7:question":function(n){return"Pytanie 7/8 Strefy PSCS są oznaczone:"},"exam:7:1":function(n){return"specjalną tablicą w kolorze żółtym"},"exam:7:2":function(n){return"specjalną tablicą w kolorze pomarańczowym"},"exam:7:3":function(n){return"specjalną tablicą w kolorze zielonym"},"exam:8:question":function(n){return"Pytanie 8/8 Cele PSCS to:"},"exam:8:1":function(n){return"zapewnienie bezpiecznej dostawy wyrobów do klienta"},"exam:8:2":function(n){return"zapewnienie bezpieczeństwa przyjętych na swój teren dostaw"},"exam:8:3":function(n){return"wszystkie powyżej"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:user":function(n){return"Pracownik"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:duration":function(n){return"Czas trwania"},"PROPERTY:a1":function(n){return"Pyt. 1"},"PROPERTY:a2":function(n){return"Pyt. 2"},"PROPERTY:a3":function(n){return"Pyt. 3"},"PROPERTY:a4":function(n){return"Pyt. 4"},"PROPERTY:a5":function(n){return"Pyt. 5"},"PROPERTY:a6":function(n){return"Pyt. 6"},"PROPERTY:a7":function(n){return"Pyt. 7"},"PROPERTY:a8":function(n){return"Pyt. 8"},"PROPERTY:creator":function(n){return"Użytkownik"},"status:incomplete":function(n){return"Przerwany"},"status:failed":function(n){return"Niezaliczony"},"status:passed":function(n){return"Zaliczony"},"filter:submit":function(n){return"Filtruj wyniki"},"PAGE_ACTION:export":function(n){return"Eksportuj wyniki"},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia wyniku"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń wynik"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybrany wynik?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wynik <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć wyniku :("}}});