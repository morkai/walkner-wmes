define(["app/nls/locale/pl"],function(n){var o={lc:{pl:function(o){return n(o)},en:function(o){return n(o)}},c:function(n,o){if(!n)throw new Error("MessageFormat: Data required for '"+o+"'.")},n:function(n,o,t){if(isNaN(n[o]))throw new Error("MessageFormat: '"+o+"' isn't a number.");return n[o]-(t||0)},v:function(n,t){return o.c(n,t),n[t]},p:function(n,t,e,r,i){return o.c(n,t),n[t]in i?i[n[t]]:(t=o.lc[r](n[t]-e),t in i?i[t]:i.other)},s:function(n,t,e){return o.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"bc:base":function(n){return"Baza Kanban"},"msg:update:failure":function(n){return"Zmiana wartości nie powiodła się."},"msg:clipboard:cell":function(n){return"Komórka skopiowana do schowka."},"msg:clipboard:row":function(n){return"Wiersz skopiowany do schowka."},"msg:clipboard:table":function(n){return"Tabela skopiowana do schowka."},"msg:import:started":function(n){return"Rozpoczęto importowanie..."},"msg:import:failure":function(n){return"Importowanie nie powiodło się."},"msg:import:success":function(n){return"Pomyślnie zaimportowano dane."},"msg:import:IN_PROGRESS":function(n){return"Importowanie w toku..."},"msg:import:DISABLED":function(n){return"Importowanie wyłączone."},"msg:discontinued":function(n){return"CCN "+o.v(n,"id")+" jest wycofany."},"pa:import":function(n){return"Importowanie"},"pa:import:sap":function(n){return"Importuj dane z SAP"},"pa:import:sap:title":function(n){return"Ostatnia aktualizacja:\n"+o.v(n,"importedAt")},"pa:import:entries":function(n){return"Importuj dane CCN z pliku"},"pa:import:components":function(n){return"Importuj lokalizacje magazynowe z pliku"},"pa:dictionaries":function(n){return"Słowniki"},"pa:components":function(n){return"Komponenty"},"pa:supplyAreas":function(n){return"Obszary zaopatrzenia"},"pa:containers":function(n){return"Rodzaje pojemników"},"pa:settings":function(n){return"Ustawienia"},"pa:printQueues":function(n){return"Kolejki drukowania"},"menu:sort:asc":function(n){return"Sortuj rosnąco"},"menu:sort:desc":function(n){return"Sortuj malejąco"},"menu:hide":function(n){return"Ukryj kolumnę"},"menu:show":function(n){return"Pokaż kolumny..."},"menu:filter:and":function(n){return"Wszystkie warunki"},"menu:filter:or":function(n){return"Dowolny warunek"},"menu:filter:clear":function(n){return"Wyczyść wszystkie filtry"},"menu:copy:table":function(n){return"Kopiuj tabelę"},"menu:copy:row":function(n){return"Kopiuj rekord"},"menu:copy:cell":function(n){return"Kopiuj komórkę"},"menu:export":function(n){return"Eksportuj tabelę"},"menu:edit":function(n){return"Edytuj komórkę"},"menu:queuePrint":function(n){return"Drukuj etykiety"},"menu:containerImage":function(n){return"Pokaż obraz"},"column:_id":function(n){return"CCN"},"column:nc12":function(n){return"12NC"},"column:description":function(n){return"Nazwa komponentu"},"column:supplyArea":function(n){return"Obszar<br>zaopatrzenia"},"column:family":function(n){return"Rodzina"},"column:kanbanQtyUser":function(n){return"Liczba kanbanów na<br>linię montażową"},"column:kanbanQtyUser:title":function(n){return"Liczba kanbanów na linię montażową"},"column:componentQty":function(n){return"Liczba komponentów<br>w kanbanie"},"column:componentQty:title":function(n){return"Liczba komponentów w kanbanie"},"column:storageBin":function(n){return"Lokalizacja<br>magazynowa<br>(SAP)"},"column:storageBin:title":function(n){return"Lokalizacja magazynowa (SAP)"},"column:newStorageBin":function(n){return"Lokalizacja<br>magazynowa<br>(nowa)"},"column:newStorageBin:title":function(n){return"Lokalizacja magazynowa (nowa)"},"column:kanbanId":function(n){return"Kanban<br>ID"},"column:kanbanIdCount":function(n){return"Ilość Kanban<br>ID w SAP"},"column:kanbanIdCount:title":function(n){return"Ilość Kanban ID w SAP"},"column:lineCount":function(n){return"Ilości linii"},"column:lineCount:title":function(n){return"Ilości linii"},"column:emptyFullCount":function(n){return"Ilość kanbanów na<br>wszystkie linie"},"column:emptyFullCount:title":function(n){return"Ilość kanbanów na wszystkie linie"},"column:stock":function(n){return"Zapas"},"column:stock:title":function(n){return"Zapas"},"column:maxBinQty":function(n){return"Maks. ilość w binie<br>magazynowym"},"column:maxBinQty:title":function(n){return"Maksymalna ilość w binie magazynowym"},"column:minBinQty":function(n){return"Min. ilość w binie<br>magazynowym"},"column:minBinQty:title":function(n){return"Minimalna ilość w binie magazynowym"},"column:replenQty":function(n){return"Ilość uzupełnienia"},"column:replenQty:title":function(n){return"Ilość uzupełnienia"},"column:kind":function(n){return"Rodzaj kanbana"},"column:container":function(n){return"Rodzaj<br>pojemnika"},"column:container:title":function(n){return"Rodzaj pojemnika"},"column:workstations":function(n){return"Stanowisko"},"column:workstation:title":function(n){return"Stanowisko "+o.v(n,"n")},"column:workstationsN":function(n){return"Stanowisko "+o.v(n,"n")},"column:locations":function(n){return"Lokalizacja na linii"},"column:location:title":function(n){return"Lokalizacja na linii - Stanowisko "+o.v(n,"n")},"column:locationsN":function(n){return"Lokalizacja "+o.v(n,"n")},"column:discontinued":function(n){return"Wycofane?"},"column:discontinued:title":function(n){return"Wycofane?"},"column:comment":function(n){return"Komentarz"},"export:fileName":function(n){return"WMES_KANBAN"},"export:sheetName":function(n){return"Baza Kanban"},"export:failure":function(n){return"Eksport tabeli nie powiodł się."},"kind:kk":function(n){return"Karta Kanbanowa"},"kind:pk":function(n){return"Pojemnik Kanban"},"kind:null":function(n){return"Nieokreślony"},"kind:kk:short":function(n){return"KK"},"kind:pk:short":function(n){return"PK"},"kind:null:short":function(n){return""},"container:null":function(n){return"Nieokreślony"},"filters:submit":function(n){return"Filtruj"},"filters:clear":function(n){return"Wyczyść"},"filters:noValue":function(n){return"Brak wartości"},"filters:value:empty":function(n){return"Brak wartości"},"filters:value:valid":function(n){return"Prawidłowe wartości"},"filters:value:invalid":function(n){return"Nieprawidłowe wartości"},"filters:invalid":function(n){return"Nieprawidłowy filtr."},"filters:help:title:text":function(n){return"Filtr tekstowy"},"filters:help:title:numeric":function(n){return"Filtr liczbowy"},"filters:help:title:select-one":function(n){return"Filtr pojedyńczego wyboru"},"filters:help:title:select-multi":function(n){return"Filtr wielokrotnego wyboru"},"filters:help:content:text":function(n){return"<p>Podaj ciąg znaków alfanumerycznych jakie muszą występować w danej wartości tekstowej. Wielkość liter oraz kolejność wyrazów nie ma znaczenia. Na przykład: <code>mtf scr</code></p><p>Jako filtr można podać także wyrażenie regularne. Na przykład: <code>/^opaska/</code>, wybierze wartości zaczynające się od ciągu znaków <code>opaska</code>.</p><p>Wpisz <code>?</code>, aby wybrać tylko puste wartości lub <code>!</code>, aby wybrać tylko nie puste wartości.</p>"},"filters:help:content:numeric":function(n){return"<p>Podaj samą liczbę, aby wybrać rekordy równe danej wartości.</p><p>Przed liczbą można podać także jeden z warunków: <code>=</code> równa się, <code>&lt;&gt;</code> nie równa się, <code>&gt;</code>, <code>&gt=</code>, <code>&lt;</code> oraz <code>&lt;=</code>, na przykład: <code>>= 1337</code>.</p><p>Filtr akceptuje także złożony warunek, zawierający nawiasy oraz operatory logiczne <code>and</code> oraz <code>or</code>. Jako wartość komórki należy użyć znaku <code>$</code>, na przykład:<br><code>$ = 100 or ($ > 200 and $ < 300)</code>.</p><p>Wpisz <code>?</code>, aby wybrać tylko zera lub <code>!</code>, aby wybrać wartości inne niż 0.</p>"},"filters:help:content:select-one":function(n){return"<p>Wybierz jedną wartość z listy klikając na niej lewym przyciskiem myszki.</p><p>Aby odznaczyć wybraną wartość, <i class='fa fa-times'></i> wyczyść filtr.</p>"},"filters:help:content:select-multi":function(n){return"<p>Wybierz jedną wartość z listy klikając na niej lewym przyciskiem myszki (LPM).</p><p>Aby zaznaczyć kilka wartości, kliknij LPM trzymając jednocześnie klawisz <kbd>Ctrl</kbd>.</p><p>Aby odznaczyć wybrane wartości, <i class='fa fa-times'></i> wyczyść filtr.</p>"},"filters:kanbanIds:invalid":function(n){return"Nieprawidłowe"},"filters:kanbanIds:tooFew":function(n){return"Za mało"},"filters:kanbanIds:tooMany":function(n){return"Za dużo"},"search:invalid":function(n){return"Podaj CCN lub 12NC."},"search:invalid:ccn":function(n){return"Nie znaleziono CCN."},"search:invalid:nc12":function(n){return"Nie znaleziono 12NC."},"builder:title":function(n){return"Nowa kolejka drukowania"},"builder:addAll":function(n){return"Dodaj wszystkie"},"builder:no":function(n){return"Lp."},"builder:ccn":function(n){return"CCN"},"builder:lines":function(n){return"Linie montażowe"},"builder:lines:all":function(n){return"Wszystkie"},"builder:kk":function(n){return"KK"},"builder:empty":function(n){return"Pusty"},"builder:full":function(n){return"Pełny"},"builder:wh":function(n){return"Magazyn"},"builder:desc":function(n){return"Opisowa"},"builder:error:noLayout":function(n){return"Wybierz przynajmniej jeden szablon."},"builder:error:noKind":function(n){return"Nieznany rodzaj kanbana."},"builder:error:noKanbanId":function(n){return"Brak ID kanbana dla linii "+o.v(n,"line")+" (pozycja "+o.v(n,"i")+")."},"builder:error:noKanbans":function(n){return"Brak kanbanów."},"builder:submit":function(n){return"Dodaj nową kolejkę drukowania"},"builder:remove":function(n){return"Usuń CCN"},"builder:clear":function(n){return"Wyczyść wszystko"},"builder:newStorageBin":function(n){return"Użyj nowej lokalizacji magazynowej"},"import:components:title":function(n){return"Importowanie lokalizacji magazynowych"},"import:components:file":function(n){return"Plik do importu"},"import:components:submit":function(n){return"Importuj dane"},"import:components:cancel":function(n){return"Anuluj"},"import:components:message":function(n){return"<p>Pierwszy arkusz w pliku powinien zawierać w pierwszym wierszu nazwy kolumn, a w następnych dane komponentu.</p><p>Oczekiwane nazwy kolumn to:</p><ul><li><code>12NC</code> (wymagane)<li><code>Lok*nowa*</code> - lokalizacja magazynowa (nowa)</ul>"},"import:entries:title":function(n){return"Importowanie danych CCN"},"import:entries:file":function(n){return"Plik do importu"},"import:entries:submit":function(n){return"Importuj dane"},"import:entries:cancel":function(n){return"Anuluj"},"import:entries:message":function(n){return"<p>Pierwszy arkusz w pliku powinien zawierać w pierwszym wierszu nazwy kolumn, a w następnych dane CCN.</p><p>Oczekiwane nazwy kolumn to:</p><ul><li><code>CCN</code> (wymagane)<li><code>*pojemnik*</code> - rodzaj pojemnika<li><code>*rodzaj*</code> - rodzaj kanbana<li><code>*wycof*</code> - wycofane<li><code>LSTn</code> - lokalizacja n<li><code>STn</code> - stanowisko n</ul>"}}});