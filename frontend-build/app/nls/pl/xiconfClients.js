define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,a,i){return t.c(n,e),n[e]in i?i[n[e]]:(e=t.lc[a](n[e]-r))in i?i[e]:i.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{"BREADCRUMB:base":function(n){return"Xiconf"},"BREADCRUMB:browse":function(n){return"Klienci"},"MSG:NO_APPS_TO_UPDATE":function(n){return"Nie ma żadnych aplikacji do zaktualizowania."},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:prodLine":function(n){return"Linia"},"PROPERTY:license":function(n){return"Licencja"},"PROPERTY:features":function(n){return"Opcje"},"PROPERTY:appVersion":function(n){return"Wersja aplikacji"},"PROPERTY:mowVersion":function(n){return"Wersja MultiOne"},"PROPERTY:coreScannerDriver":function(n){return"CoreScanner"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:lastSeenAt":function(n){return"Ostatnio widziany"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:remoteAddress":function(n){return"Adres IP"},"status:online":function(n){return"Online"},"status:offline":function(n){return"Offline"},"coreScannerDriver:true":function(n){return"Istnieje"},"coreScannerDriver:false":function(n){return"Nie istnieje"},"page:update":function(n){return"Aktualizuj aplikacje"},"page:settings":function(n){return"Ustawienia"},"list:goToDashboard":function(n){return"Przejdź do ekranu głównego"},"list:goToSettings":function(n){return"Przejdź do ustawień"},"list:downloadVNC":function(n){return"Pobierz konfigurację TightVNC"},"list:restart":function(n){return"Restartuj aplikację"},"list:update":function(n){return"Aktualizuj aplikację"},"filter:submit":function(n){return"Filtruj klientów"},"restartDialog:title":function(n){return"Restartowanie aplikacji"},"restartDialog:message":function(n){return"Czy na pewno chcesz zrestartować aplikację <em>"+t.v(n,"client")+"</em>?<br><br>Aplikacja zostanie zrestartowana zaraz po zakończeniu aktualnego programowania."},"restartDialog:yes":function(n){return"Restartuj aplikację"},"restartDialog:no":function(n){return"Anuluj"},"updateDialog:title":function(n){return"Aktualizacja aplikacji"},"updateDialog:message":function(n){return"Czy na pewno chcesz zaktualizować aplikację <em>"+t.v(n,"client")+"</em>?<br><br>Aplikacja zostanie zaktualizowana zaraz po zakończeniu aktualnego programowania."},"updateDialog:yes":function(n){return"Aktualizuj aplikację"},"updateDialog:no":function(n){return"Anuluj"},"updateAllDialog:title":function(n){return"Aktualizacja wszystkich aplikacji"},"updateAllDialog:message":function(n){return"Czy na pewno chcesz zaktualizować wszystkie aplikację?<br><br>Aplikacja zostaną zaktualizowana zaraz po zakończeniu aktualnego programowania."},"updateAllDialog:yes":function(n){return"Aktualizuj aplikacje"},"updateAllDialog:no":function(n){return"Anuluj"},"licensePicker:title":function(n){return"Wybór licencji klienta"}}});