define(["app/nls/locale/pl"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,i,r,a){return e.c(n,t),n[t]in a?a[n[t]]:(t=e.lc[r](n[t]-i),t in a?a[t]:a.other)},s:function(n,t,i){return e.c(n,t),n[t]in i?i[n[t]]:i.other}};return{"BREADCRUMBS:base":function(n){return"Xiconf"},"BREADCRUMBS:browse":function(n){return"Klienci"},"MSG:LOADING_FAILURE":function(n){return"Ładowanie klientów nie powiodło się."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Ładowanie klienta nie powiodło się."},"MSG:NO_APPS_TO_UPDATE":function(n){return"Nie ma żadnych aplikacji do zaktualizowania."},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:prodLine":function(n){return"Linia"},"PROPERTY:license":function(n){return"Licencja"},"PROPERTY:features":function(n){return"Opcje"},"PROPERTY:appVersion":function(n){return"Wersja aplikacji"},"PROPERTY:mowVersion":function(n){return"Wersja MultiOne"},"PROPERTY:coreScannerDriver":function(n){return"CoreScanner"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:lastSeenAt":function(n){return"Ostatnio widziany"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:remoteAddress":function(n){return"Adres IP"},"status:online":function(n){return"Online"},"status:offline":function(n){return"Offline"},"coreScannerDriver:true":function(n){return"Istnieje"},"coreScannerDriver:false":function(n){return"Nie istnieje"},"page:update":function(n){return"Aktualizuj aplikacje"},"page:settings":function(n){return"Zmień ustawienia"},"list:goToDashboard":function(n){return"Przejdź do ekranu głównego"},"list:goToSettings":function(n){return"Przejdź do ustawień"},"list:downloadVNC":function(n){return"Pobierz konfigurację TightVNC"},"list:restart":function(n){return"Restartuj aplikację"},"list:update":function(n){return"Aktualizuj aplikację"},"filter:submit":function(n){return"Filtruj klientów"},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Potwierdzenie usunięcia klienta"},"ACTION_FORM:BUTTON:delete":function(n){return"Usuń klietna"},"ACTION_FORM:MESSAGE:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć wybranego klienta?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Czy na pewno chcesz bezpowrotnie usunąć klienta <em>"+e.v(n,"label")+"</em>?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Nie udało się usunąć klienta."},"restartDialog:title":function(n){return"Restartowanie aplikacji"},"restartDialog:message":function(n){return"Czy na pewno chcesz zrestartować aplikację <em>"+e.v(n,"client")+"</em>?<br><br>Aplikacja zostanie zrestartowana zaraz po zakończeniu aktualnego programowania."},"restartDialog:yes":function(n){return"Restartuj aplikację"},"restartDialog:no":function(n){return"Anuluj"},"updateDialog:title":function(n){return"Aktualizacja aplikacji"},"updateDialog:message":function(n){return"Czy na pewno chcesz zaktualizować aplikację <em>"+e.v(n,"client")+"</em>?<br><br>Aplikacja zostanie zaktualizowana zaraz po zakończeniu aktualnego programowania."},"updateDialog:yes":function(n){return"Aktualizuj aplikację"},"updateDialog:no":function(n){return"Anuluj"},"updateAllDialog:title":function(n){return"Aktualizacja wszystkich aplikacji"},"updateAllDialog:message":function(n){return"Czy na pewno chcesz zaktualizować wszystkie aplikację?<br><br>Aplikacja zostaną zaktualizowana zaraz po zakończeniu aktualnego programowania."},"updateAllDialog:yes":function(n){return"Aktualizuj aplikacje"},"updateAllDialog:no":function(n){return"Anuluj"},"licensePicker:title":function(n){return"Wybór licencji klienta"}}});