define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,o,t,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[t](n[r]-o))in i?i[r]:i.other},s:function(n,r,o){return e.c(n,r),n[r]in o?o[n[r]]:o.other}};return{TITLE:function(n){return"Dokumenty < Wannabe MES"},"controls:emptyOrderNo":function(n){return"Brak zlecenia"},"controls:emptyOrderName":function(n){return"Nie wybrano żadnego zlecenia."},"controls:emptyDocumentNc15":function(n){return"Brak dokumentu"},"controls:emptyDocumentName":function(n){return"Nie wybrano żadnego dokumentu."},"controls:localDocumentNc15":function(n){return"Lokalny dokument"},"controls:localDocumentName":function(n){return"Wybrano lokalny dokument."},"controls:externalDocumentName":function(n){return"Wybrano zewnętrzny dokument."},"controls:openLocalFileDialog":function(n){return"Wybierz plik z dysku lokalnego"},"controls:openSettingsDialog":function(n){return"Zmień ustawienia"},"controls:openLocalOrderDialog":function(n){return"Znajdź zlecenie/dokument"},"controls:reloadDocument":function(n){return"Przeładuj aktualny dokument"},"controls:openDocumentWindow":function(n){return"Otwórz załadowany dokument w nowym oknie"},"controls:toggleAddImprovementButtons":function(n){return"Zgłoś ZPW/sugestię"},"controls:openAddNearMissWindow":function(n){return"Dodaj ZPW"},"controls:openAddSuggestionWindow":function(n){return"Dodaj sugestię"},"controls:openAddObservationWindow":function(n){return"Dodaj obserwację"},"controls:switchApps":function(n){return"Zmień aplikację/Konfiguruj po 3s"},"controls:reboot":function(n){return"Odśwież stronę/Restartuj komputer po 3s"},"controls:shutdown":function(n){return"Wyłącz komputer po 3s"},"controls:filter:ph":function(n){return"Filtruj dokumenty"},"controls:lockUi":function(n){return"Zablokuj interfejs"},"controls:confirm":function(n){return"Potwierdzam zapoznanie<br>się z dokumentem"},"controls:confirm:noStation":function(n){return"Proszę ustawić numer stanowiska pracy."},uiLocked:function(n){return"Interfejs zablokowany.<br>Dotknij tutaj, aby odblokować."},"popup:document":function(n){return"Nie udało się otworzyć dokumentu w nowym oknie.<br>Sprawdź czy wyskakujące okienka są dozwolone w przeglądarce!"},"popup:improvement":function(n){return"Nie udało się otworzyć formularza ZPW/sugestii w nowym oknie.<br>Sprawdź czy wyskakujące okienka są dozwolone w przeglądarce!"},"settings:title":function(n){return"Ustawienia"},"settings:prodLineId":function(n){return"ID linii produkcyjnej"},"settings:prodLineId:help":function(n){return"Linia produkcyjna, do której aplikacja ma się połączyć w celu pobrania aktualnego zlecenia."},"settings:prodLineName":function(n){return"Nazwa linii produkcyjnej"},"settings:prodLineName:help":function(n){return"Nazwa wyświetlana w lewym górnym rogu aplikacji."},"settings:station":function(n){return"Stanowisko"},"settings:prefixFilter:inclusive":function(n){return"Tylko dokumenty z 15NC zaczynającymi się na:"},"settings:prefixFilter:exclusive":function(n){return"Tylko dokumenty z 15NC nie zaczynającymi się na:"},"settings:spigotCheck":function(n){return"Sprawdzanie Spigota"},"settings:login":function(n){return"Login"},"settings:password":function(n){return"Hasło"},"settings:submit":function(n){return"Zapisz ustawienia"},"settings:error:failure":function(n){return"Nie udało się zapisać ustawień."},"settings:error:INVALID_PROD_LINE":function(n){return"Linia produkcyjna o podanym ID nie istnieje!"},"settings:error:INVALID_CREDENTIALS":function(n){return"Nieprawidłowy login/hasło!"},"settings:error:INVALID_LOGIN":function(n){return"Nieprawidłowy login!"},"settings:error:INVALID_PASSWORD":function(n){return"Nieprawidłowe hasło!"},"settings:error:NO_PRIVILEGES":function(n){return"Użytkownik nie ma uprawnienia <em>Aktywacja klienta Dokumenty WMES</em>!"},"settings:msg:localServer:checking":function(n){return"Sprawdzanie dostępności lokalnego serwera HTTP..."},"settings:msg:localServer:success":function(n){return"Lokalny serwer HTTP jest dostępny :)"},"settings:msg:localServer:failure":function(n){return"Lokalny serwer HTTP nie jest dostępny."},"preview:msg:loading:localFile":function(n){return"Ładowanie dokumentu z lokalnego dysku..."},"preview:msg:loading:remoteServer":function(n){return"Ładowanie dokumentu ze zdalnego serwera..."},"preview:msg:loading:localServer":function(n){return"Ładowanie dokumentu z lokalnego serwera..."},"preview:msg:loading:failure":function(n){return"Nie udało się załadować dokumentu."},"localOrderPicker:title":function(n){return"Wyszukiwanie zlecenia/dokumentu"},"localOrderPicker:plannedOrders":function(n){return"Planowane zlecenia"},"localOrderPicker:lastOrders":function(n){return"Ostatnie zlecenia"},"localOrderPicker:orderNo":function(n){return"Numer zlecenia/dokumentu"},"localOrderPicker:submit":function(n){return"Znajdź zlecenie/dokument"},"localOrderPicker:submit:order":function(n){return"Znajdź zlecenie"},"localOrderPicker:submit:document":function(n){return"Znajdź dokument"},"localOrderPicker:error:failure":function(n){return"Nie udało się znaleźć zlecenia/dokumentu."},"localOrderPicker:error:failure:order":function(n){return"Nie udało się znaleźć zlecenia."},"localOrderPicker:error:failure:document":function(n){return"Nie udało się znaleźć dokumentu."},"localOrderPicker:error:NOT_FOUND:order":function(n){return"Zlecenie o podanym numerze nie istnieje."},"localOrderPicker:error:NOT_FOUND:document":function(n){return"Dokument o podanym numerze nie istnieje."},"localOrderPicker:error:DOCUMENT_NOT_FOUND:document":function(n){return"Dokument nie istnieje w katalogu."},"localOrderPicker:error:DOCUMENT_NO_FILES:document":function(n){return"Dokument nie ma żadnych plików."},"localOrderPicker:error:DATE_NOT_FOUND:document":function(n){return"Dokument nie ma pliku pasującego do daty dostępności.<br>Wymagana data dostępności: "+e.v(n,"required")+"<br>Dostępne pliki od: "+e.v(n,"actual")},order:function(n){return"Karta zlecenia"},bom:function(n){return"Lista komponentów"},eto:function(n){return"Konstrukcja na zamówienie"},"bom:filter:ps":function(n){return"Filtruj komponenty"},"spigot:request":function(n){return"Zeskanuj Spigot:<br>"+e.v(n,"component")},"spigot:checking":function(n){return"<i class='fa fa-spinner fa-spin'></i> Sprawdzanie Spigota..."},"spigot:failure":function(n){return"Zeskanowano nieprawidłowy Spigot."},"spigot:success":function(n){return"Zeskanowano prawidłowy Spigot."},"notes:hd":function(n){return"Uwagi do zlecenia"},"notes:ft":function(n){return"Dotknij w dowolnym miejscu, aby ukryć ten komunikat."}}});