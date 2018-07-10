define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,o){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(o||0)},v:function(n,o){return t.c(n,o),n[o]},p:function(n,o,r,e,i){return t.c(n,o),n[o]in i?i[n[o]]:(o=t.lc[e](n[o]-r),o in i?i[o]:i.other)},s:function(n,o,r){return t.c(n,o),n[o]in r?r[n[o]]:r.other}};return{"bc:base":function(n){return"Baza Kanban"},"msg:update:failure":function(n){return"Zmiana wartości nie powiodła się."},"msg:clipboard:cell":function(n){return"Komórka skopiowana do schowka."},"msg:clipboard:row":function(n){return"Wiersz skopiowany do schowka."},"msg:clipboard:table":function(n){return"Tabela skopiowana do schowka."},"msg:import:started":function(n){return"Rozpoczęto importowanie..."},"msg:import:failure":function(n){return"Importowanie nie powiodło się."},"msg:import:success":function(n){return"Pomyślnie zaimportowane dane z SAP."},"msg:import:IN_PROGRESS":function(n){return"Importowanie w toku..."},"msg:import:DISABLED":function(n){return"Importowanie wyłączone."},"pa:import":function(n){return"Importuj z SAP"},"pa:components":function(n){return"Komponenty"},"pa:supplyAreas":function(n){return"Obszary zaopatrzenia"},"pa:settings":function(n){return"Ustawienia"},"menu:sort:asc":function(n){return"Sortuj rosnąco"},"menu:sort:desc":function(n){return"Sortuj malejąco"},"menu:hide":function(n){return"Ukryj kolumnę"},"menu:show":function(n){return"Pokaż kolumny..."},"menu:filter:and":function(n){return"Wszystkie warunki"},"menu:filter:or":function(n){return"Dowolny warunek"},"menu:filter:clear":function(n){return"Wyczyść wszystkie filtry"},"menu:copy:table":function(n){return"Kopiuj tabelę"},"menu:copy:row":function(n){return"Kopiuj rekord"},"menu:copy:cell":function(n){return"Kopiuj komórkę"},"menu:export":function(n){return"Eksportuj tabelę"},"menu:edit":function(n){return"Edytuj komórkę"},"column:_id":function(n){return"CCN"},"column:nc12":function(n){return"12NC"},"column:description":function(n){return"Nazwa komponentu"},"column:supplyArea":function(n){return"Obszar<br>zaopatrzenia"},"column:family":function(n){return"Rodzina"},"column:kanbanQtyUser":function(n){return"Liczba kanbanów na<br>linię montażową"},"column:kanbanQtyUser:title":function(n){return"Liczba kanbanów na linię montażową"},"column:componentQty":function(n){return"Liczba komponentów<br>w kanbanie"},"column:componentQty:title":function(n){return"Liczba komponentów w kanbanie"},"column:storageBin":function(n){return"Lokalizacja<br>magazynowa"},"column:storageBin:title":function(n){return"Lokalizacja magazynowa"},"column:kanbanIdEmpty":function(n){return"Nr<br>Pusty"},"column:kanbanIdFull":function(n){return"Nr<br>Pełny"},"column:lineCount":function(n){return"Ilości linii"},"column:lineCount:title":function(n){return"Ilości linii"},"column:emptyFullCount":function(n){return"Ilość kanbanów na<br>wszystkie linie"},"column:emptyFullCount:title":function(n){return"Ilość kanbanów na wszystkie linie"},"column:stock":function(n){return"Zapas"},"column:stock:title":function(n){return"Zapas"},"column:maxBinQty":function(n){return"Maks. ilość w binie<br>magazynowym"},"column:maxBinQty:title":function(n){return"Maksymalna ilość w binie magazynowym"},"column:minBinQty":function(n){return"Min. ilość w binie<br>magazynowym"},"column:minBinQty:title":function(n){return"Minimalna ilość w binie magazynowym"},"column:replenQty":function(n){return"Ilość uzupełnienia"},"column:replenQty:title":function(n){return"Ilość uzupełnienia"},"column:kind":function(n){return"Rodzaj kanbana"},"column:kind:title":function(n){return"Rodzaj kanbana"},"column:workstations":function(n){return"Stanowisko"},"column:workstation:title":function(n){return"Stanowisko "+t.v(n,"n")},"column:workstationsN":function(n){return"Stanowisko "+t.v(n,"n")},"column:locations":function(n){return"Lokalizacja na linii"},"column:location:title":function(n){return"Lokalizacja na linii - Stanowisko "+t.v(n,"n")},"column:locationsN":function(n){return"Lokalizacja "+t.v(n,"n")},"column:discontinued":function(n){return"Wycofane?"},"column:discontinued:title":function(n){return"Wycofane?"},"column:comment":function(n){return"Komentarz"},"export:fileName":function(n){return"WMES_KANBAN"},"export:sheetName":function(n){return"Baza Kanban"},"export:failure":function(n){return"Eksport tabeli nie powiodł się."},"kind:kk":function(n){return"Karta Kanbanowa"},"kind:pk":function(n){return"Pojemnik Kanban"},"kind:null":function(n){return"Nieokreślony"},"kind:kk:short":function(n){return"KK"},"kind:pk:short":function(n){return"PK"},"kind:null:short":function(n){return""},"filters:submit":function(n){return"Filtruj"},"filters:clear":function(n){return"Wyczyść"},"filters:noValue":function(n){return"Brak wartości"},"filters:value:empty":function(n){return"Brak wartości"},"filters:value:valid":function(n){return"Prawidłowe wartości"},"filters:value:invalid":function(n){return"Nieprawidłowe wartości"},"filters:invalid":function(n){return"Nieprawidłowy filtr."},"filters:help:title:text":function(n){return"Filtr tekstowy"},"filters:help:title:numeric":function(n){return"Filtr liczbowy"},"filters:help:title:select-one":function(n){return"Filtr pojedyńczego wyboru"},"filters:help:title:select-multi":function(n){return"Filtr wielokrotnego wyboru"},"filters:help:content:text":function(n){return"<p>Podaj ciąg znaków alfanumerycznych jakie muszą występować w danej wartości tekstowej. Wielkość liter oraz kolejność wyrazów nie ma znaczenia. Na przykład: <code>mtf scr</code></p><p>Jako filtr można podać także wyrażenie regularne. Na przykład: <code>/^opaska/</code>, wybierze wartości zaczynające się od ciągu znaków <code>opaska</code>.</p><p>Aby wybrać puste wartości, jako wartość filtru wpisz <code>?</code>.</p>"},"filters:help:content:numeric":function(n){return"<p>Podaj samą liczbę, aby wybrać rekordy równe danej wartości.</p><p>Przed liczbą można podać także jeden z warunków: <code>=</code> równa się, <code>&lt;&gt;</code> nie równa się, <code>&gt;</code>, <code>&gt=</code>, <code>&lt;</code> oraz <code>&lt;=</code>, na przykład: <code>>= 1337</code>.</p><p>Filtr akceptuje także złożony warunek, zawierający nawiasy oraz operatory logiczne <code>and</code> oraz <code>or</code>. Jako wartość komórki należy użyć znaku <code>$</code>, na przykład:<br><code>$ = 100 or ($ > 200 and $ < 300)</code>.</p><p>Aby wybrać puste wartości, jako wartość filtru wpisz <code>?</code>.</p>"},"filters:help:content:select-one":function(n){return"<p>Wybierz jedną wartość z listy klikając na niej lewym przyciskiem myszki.</p><p>Aby odznaczyć wybraną wartość, <i class='fa fa-times'></i> wyczyść filtr.</p>"},"filters:help:content:select-multi":function(n){return"<p>Wybierz jedną wartość z listy klikając na niej lewym przyciskiem myszki (LPM).</p><p>Aby zaznaczyć kilka wartości, kliknij LPM trzymając jednocześnie klawisz <kbd>Ctrl</kbd>.</p><p>Aby odznaczyć wybrane wartości, <i class='fa fa-times'></i> wyczyść filtr.</p>"},"search:invalid":function(n){return"Podaj CCN lub 12NC."},"search:invalid:ccn":function(n){return"Nie znaleziono CCN."},"search:invalid:nc12":function(n){return"Nie znaleziono 12NC."}}});