define(["app/nls/locale/pl"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,o){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(o||0)},v:function(e,o){return n.c(e,o),e[o]},p:function(e,o,t,r,u){return n.c(e,o),e[o]in u?u[e[o]]:(o=n.lc[r](e[o]-t))in u?u[o]:u.other},s:function(e,o,t){return n.c(e,o),e[o]in t?t[e[o]]:t.other}};return{"BREADCRUMB:base":function(e){return"Dokumentacja"},"BREADCRUMB:root":function(e){return"Dokumenty"},"MSG:LOADING_FAILURE:folders":function(e){return"Ładowanie folderów nie powiodło się."},"MSG:LOADING_FAILURE:files":function(e){return"Ładowanie plików nie powiodło się."},"MSG:fileNotFound":function(e){return"Dokument "+n.v(e,"nc15")+" nie istnieje."},"MSG:canNotMarkSearchResult":function(e){return"Nie można oznaczyć wyszukanego dokumentu znajdującego się w wielu katalogach."},"PAGE_ACTION:settings":function(e){return"Ustawienia"},"toolbar:displayMode:tiles":function(e){return"Kafelki"},"toolbar:displayMode:list":function(e){return"Lista"},"toolbar:copyToClipboard":function(e){return"Kopiuj do schowka"},"toolbar:copyToClipboard:success":function(e){return"Skopiowano do schowka!"},"toolbar:folderCount":function(e){return"Ilość podkatalogów w aktualnym katalogu"},"toolbar:fileCount":function(e){return"Ilość plików w aktualnym katalogu"},"toolbar:markedFileCount":function(e){return"Ilość oznaczonych plików"},"toolbar:removeMarkedFiles":function(e){return"Przenieś oznaczone pliki do śmietnika"},"toolbar:unlinkMarkedFiles":function(e){return"Usuń przypisania oznaczonych plików do aktualnego katalogu"},"toolbar:recoverMarkedFiles":function(e){return"Przywróć oznaczone pliki"},"toolbar:search:title":function(e){return"Szukaj dokumentów po 15NC"},"toolbar:search:placeholder":function(e){return"15NC..."},"toolbar:editMarkedFiles":function(e){return"Edytuj najnowsze pliki"},"path:searchResults":function(e){return"Wyniki wyszukiwania dla <code>"+n.v(e,"searchPhrase")+"</code>"},"folders:newFolder:placeholder":function(e){return"Nowy katalog..."},"folders:msg:addFolder:failure":function(e){return"Nie udało się stworzyć nowego katalogu."},"folders:msg:moveFolder:failure":function(e){return"Nie udało się przenieść katalogu."},"folders:msg:removeFolder:failure":function(e){return"Nie udało się usunąć katalogu."},"folders:msg:recoverFolder:failure":function(e){return"Nie udało się przywrócić katalogu."},"folders:msg:renameFolder:failure":function(e){return"Nie udało się zmienić nazwy katalogu."},"files:empty":function(e){return"Wybrany katalog jest pusty."},"files:noResults":function(e){return"Nie znaleziono żadnych pasujących dokumentów."},"files:nc15":function(e){return"15NC"},"files:name":function(e){return"Nazwa"},"files:folders":function(e){return"Katalogi"},"files:files":function(e){return"Pliki"},"files:files:date":function(e){return"od "+n.v(e,"date")},"files:date":function(e){return"Data dostępności"},"files:preview":function(e){return"Pokaż dokument"},"files:changes":function(e){return"Pokaż zmiany"},"files:recover":function(e){return"Przywróć dokument"},"files:edit":function(e){return"Edytuj dokument"},"files:edit:specificFile":function(e){return"Edytuj plik "+n.v(e,"date")},"files:edit:latestFile":function(e){return"Edytuj najnowszy plik"},"files:remove":function(e){return"Usuń dokument"},"files:close":function(e){return"Zamknij"},"files:sub:true":function(e){return"Przestań obserwować"},"files:sub:false":function(e){return"Obserwuj dokument"},"files:sub:failure":function(e){return"Zmiana subskrypcji nie powiodła się."},"files:updatedAt":function(e){return"Ostatnia zmiana"},"files:updatedAt:value":function(e){return n.v(e,"user")+"<br>"+n.v(e,"date")},"files:mrps":function(e){return"MRP"},"files:mrps:help":function(e){return"Kontrolery MRP, do których dany dokument jest przypisany.\nJeżeli zlecenie ma jeden ze zdefiniowanych MRP, to ten dokument będzie dodany do listy w przeglądarce dokumentów.\nANY pasuje do każdego MRP."},"files:mrps:any":function(e){return"Dowolne"},"files:components":function(e){return"Komponenty"},"files:components:help":function(e){return"Komponenty, do których dany dokument jest przypisany.\nJeżeli zlecenie ma jeden ze zdefiniowanych komponentów, to ten dokument będzie dodany do listy w przeglądarce dokumentów."},"files:components:addByName":function(e){return"Dodaj po nazwie lub nieistniejący"},"files:components:addByName:placeholder":function(e){return"12NC lub nazwa komponentu..."},"files:stations":function(e){return"Stanowiska"},"files:confirmable":function(e){return"Wymagaj potwierdzenia przez operatora"},"files:msg:nc15:copied":function(e){return"15NC skopiowano do schowka."},"files:msg:nc15:set":function(e){return"15NC ustawiono w pliku do załadowania."},"unlinkFiles:title":function(e){return"Usuwanie przypisania dokumentów"},"unlinkFiles:submit":function(e){return"Usuń przypisania"},"unlinkFiles:message":function(e){return"<p>Czy na pewno chcesz usunąć przypisania oznaczonych dokumentów do aktualnego katalogu?</p>"},"unlinkFiles:remove":function(e){return"<p>Niektóre z wybranych dokumentów znajdują się tylko w aktualnym katalogu:</p>"},"unlinkFiles:remove:0":function(e){return"ignoruj dokumenty znajdujące się w tylko jednym katalogu."},"unlinkFiles:remove:1":function(e){return"przenieś dokumenty znajdujące się w tylko jednym katalogu do Śmietnika."},"unlinkFiles:msg:success":function(e){return"Przypisania zostały usunięte pomyślnie."},"unlinkFiles:msg:failure":function(e){return"Nie udało się usunąć przypisań dokumentów."},"removeFiles:title":function(e){return"Usuwanie dokumentów"},"removeFiles:submit":function(e){return"Usuń dokumenty"},"removeFiles:message:remove":function(e){return"<p>Czy na pewno chcesz usunąć oznaczone dokumenty?</p><p>Usunięte dokumenty zostanią przeniesione do Śmietnika.</p>"},"removeFiles:message:purge":function(e){return"<p>Czy na pewno chcesz usunąć oznaczone dokumenty?</p><p>Dokumenty znajdujące się w innych katalogach niż Śmietnik zostaną usunięte tylko ze Śmietnika.</p><p>Dokumenty znajdujące się tylko w Śmietniku zostaną usunięte całkowicie i bezpowrotnie.</p>"},"removeFiles:msg:success":function(e){return"Dokumenty zostały usunięte pomyślnie."},"removeFiles:msg:failure":function(e){return"Nie udało się usunąć dokumentów."},"removeFile:title":function(e){return"Usuwanie dokumentu"},"removeFile:purge":function(e){return"Usuń dokument"},"removeFile:remove":function(e){return"Przenieś do śmietnika"},"removeFile:unlink":function(e){return"Usuń przypisanie"},"removeFile:cancel":function(e){return"Anuluj"},"removeFile:message:single":function(e){return"<p>Czy na pewno chcesz usunąć dokument "+n.v(e,"nc15")+"?</p><p>Usunięty dokument zostanie przeniesiony do Śmietnika.</p>"},"removeFile:message:multiple":function(e){return"<p>Dokument "+n.v(e,"nc15")+" znajduje się w wielu katalogach.</p><p>Możesz usunąć przypisanie do aktualnego katalogu lub przenieść dokument do Śmietnika.</p>"},"removeFile:message:single:purge":function(e){return"<p>Czy na pewno chcesz bezpowrotnie usunąć dokument "+n.v(e,"nc15")+"?</p>"},"removeFile:message:multiple:purge":function(e){return"<p>Dokument "+n.v(e,"nc15")+" znajduje się w wielu katalogach.</p><p>Możesz usunąć przypisanie do aktualnego katalogu lub usunąć dokument całkowicie i bezpowrotnie.</p>"},"removeFile:msg:success":function(e){return"Dokument został usunięty pomyślnie."},"removeFile:msg:failure":function(e){return"Nie udało się usunąć dokumentu."},"recoverFiles:title":function(e){return"Przywracanie dokumentów"},"recoverFiles:submit":function(e){return"Przywróć dokumenty"},"recoverFiles:message":function(e){return"<p>Czy na pewno chcesz przywrócić oznaczone dokumenty?</p>"},"recoverFiles:remove":function(e){return"<p>Niektóre z wybranych dokumentów znajdują się w katalogach, które już nie istnieją:</p>"},"recoverFiles:remove:0":function(e){return"ignoruj te dokumenty, których nie da się przywrócić do starych katalogów."},"recoverFiles:remove:1":function(e){return"usuń te dokumenty."},"recoverFiles:msg:success":function(e){return"Dokumenty zostały przywrócone pomyślnie."},"recoverFiles:msg:failure":function(e){return"Nie udało się przywrócić dokumentów."},"recoverFile:title":function(e){return"Przywracanie dokumentu"},"recoverFile:yes":function(e){return"Przywróć dokument"},"recoverFile:cancel":function(e){return"Anuluj"},"recoverFile:message":function(e){return"<p>Czy na pewno chcesz przywrócić dokument "+n.v(e,"nc15")+"?</p>"},"recoverFile:msg:success":function(e){return"Dokument został przywrócony pomyślnie."},"recoverFile:msg:failure":function(e){return"Nie udało się przywrócić dokumentu."},"editFile:title":function(e){return"Edycja dokumentu"},"editFile:submit":function(e){return"Edytuj dokument"},"editFile:cancel":function(e){return"Anuluj"},"editFile:openFile:original":function(e){return"Otwórz źródłowy dokument"},"editFile:openFile:img":function(e){return"Otwórz dokument przekonwertowany na obrazki"},"editFile:forceConvert":function(e){return"Wymuś ponowną konwersję dokumentu PDF na obrazki"},"editFile:forceConvert:failure":function(e){return"Wymuszanie konwersji nie powiodło się."},"editFile:msg:success":function(e){return"Dokument został zmieniony pomyślnie."},"editFile:msg:failure":function(e){return"Nie udało się zmienić dokumentu."},"purgeFolder:title":function(e){return"Usuwanie katalogu"},"purgeFolder:title:trash":function(e){return"Opróżnianie Śmietnika"},"purgeFolder:submit":function(e){return"Usuń katalog"},"purgeFolder:submit:trash":function(e){return"Opróżnij Śmietnik"},"purgeFolder:message":function(e){return"<p>Czy na pewno chcesz bezpowrotnie usunąć katalog <em>"+n.v(e,"folder")+"</em>?</p>"},"purgeFolder:message:trash":function(e){return"<p>Czy na pewno chcesz bezpowrotnie opróżnić Śmietnik?</p>"},"purgeFolder:msg:success":function(e){return"Katalog został usunięty pomyślnie."},"purgeFolder:msg:success:trash":function(e){return"Śmietnik został opróżniony pomyślnie."},"purgeFolder:msg:failure":function(e){return"Nie udało się przywrócić dokumentów."},"purgeFolder:msg:failure:trash":function(e){return"Nie udało się opróżnić Śmietnika."},"contextMenu:expandFolder":function(e){return"Rozwiń"},"contextMenu:expandFolders":function(e){return"Rozwiń wszystko"},"contextMenu:expandFolders:all":function(e){return"Rozwiń wszystko"},"contextMenu:collapseFolder":function(e){return"Zwiń"},"contextMenu:collapseFolders":function(e){return"Zwiń wszystko"},"contextMenu:collapseFolders:all":function(e){return"Zwiń wszystko"},"contextMenu:newFolder":function(e){return"Nowy katalog"},"contextMenu:newSubFolder":function(e){return"Nowy podkatalog"},"contextMenu:renameFolder":function(e){return"Zmień nazwę"},"contextMenu:removeFolder":function(e){return"Usuń"},"contextMenu:cutFolder":function(e){return"Wytnij"},"contextMenu:moveFolder":function(e){return"Przenieś <em>"+n.v(e,"folder")+"</em>"},"contextMenu:recoverFolder":function(e){return"Przywróć"},"upload:nc15:placeholder":function(e){return"15NC..."},"upload:name:placeholder":function(e){return"Nazwa dokumentu"},"uploads:setDate":function(e){return"Ustaw daty obowiązywania"},"uploads:submit":function(e){return"Zapisz dokumenty"},"uploads:clear":function(e){return"Wyczyść listę"},"uploads:msg:notAllowed":function(e){return"Nie masz uprawnień do dodawania plików."},"uploads:msg:noFolder":function(e){return"Nie można dodawać plików do głównego katalogu."},"uploads:msg:folderIsTrash":function(e){return"Nie można dodawać plików do śmietnika."},"uploads:error:INVALID_TYPE":function(e){return"Nieprawidłowy typ pliku."},"uploads:error:INVALID_RESPONSE":function(e){return"Nieprawidłowa odpowiedź serwera."},"uploads:error:INVALID_DYNAMIC_NC15":function(e){return"Nie można dodawać nowych dokumentów z prefiksem 000."},"uploads:error:UNKNOWN_ERROR":function(e){return"Nieoczekiwany błąd podczas ładowania pliku."},"fileChanges:time":function(e){return"Czas zmiany"},"fileChanges:user":function(e){return"Użytkownik"},"fileChanges:type":function(e){return"Akcja"},"fileChanges:type:fileAdded":function(e){return"Dodanie"},"fileChanges:type:fileEdited":function(e){return"Edycja"},"fileChanges:type:fileRemoved":function(e){return"Śmietnik"},"fileChanges:type:fileRecovered":function(e){return"Przywrócenie"},"fileChanges:type:filePurged":function(e){return"Usunięcie"}}});