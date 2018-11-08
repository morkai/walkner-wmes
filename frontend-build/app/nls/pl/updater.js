define(["app/nls/locale/pl"],function(e){var r={lc:{pl:function(r){return e(r)},en:function(r){return e(r)}},c:function(e,r){if(!e)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(e,r,a){if(isNaN(e[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return e[r]-(a||0)},v:function(e,a){return r.c(e,a),e[a]},p:function(e,a,n,o,i){return r.c(e,a),e[a]in i?i[e[a]]:(a=r.lc[o](e[a]-n))in i?i[a]:i.other},s:function(e,a,n){return r.c(e,a),e[a]in n?n[e[a]]:n.other}};return{"restart:backend":function(e){return"Serwer aplikacji jest restartowany! Komunikacja z serwerem może przez chwilę nie działać..."},"restart:frontend":function(e){return"Dostępna jest nowa wersja aplikacji! <a href='javascript:window.location.reload()'>Kliknij tutaj aby przeładować przeglądarkę</a>..."},"browserUpdate:title":function(e){return"Nieaktualna przeglądarka"},"browserUpdate:failure:header":function(e){return"Nie mogę zaktualizować przeglądarki"},"browserUpdate:failure:message":function(e){return"<ul><li>Jeśli nie możesz sobie pozwolić na zmianę przeglądarki ze względu na problemy ze zgodnością, rozważ zainstalowanie drugiej przeglądarki do codziennego użytku i zachowanie starej ze względu na zgodność.<li>Poproś administratora o zaktualizowanie twojej przeglądarki, jeśli nie możesz zrobić tego samodzielnie.</ul>"},"browserUpdate:message":function(e){return"Twoja przeglądarka jest nieaktualna. W przyszłości Twoja wersja przeglądarki przestanie być wspierana. Zaktualizuj przeglądarkę, by korzystać z tej strony bezpieczniej, szybciej i po prostu sprawniej."},"browserUpdate:windows:message":function(e){return"Kliknij poniższy przycisk, aby pobrać instalator najnowszej wersji przeglądarki:"},"browserUpdate:windows:download":function(e){return"POBIERZ INSTALATOR NA DYSK"},"browserUpdate:android:message":function(e){return"Kliknij poniższy przycisk, aby przejść do aplikacji Google Chrome w sklepie Google Play:"},"browserUpdate:android:download":function(e){return"PRZEJDŹ DO GOOGLE PLAY"},"addressUpdate:title":function(e){return"Nieaktualny adres"},"addressUpdate:message":function(e){return"<p>Jesteś w sieci "+r.s(e,"network",{factory:"fabrycznej",other:"domenowej"})+" i używasz nieaktualnego adresu do systemu WMES.</p><p>Rozważ korzystanie z nowego, łatwiejszego adresu i zaktualizuj wszystkie skróty i zakładki!</p>"},"addressUpdate:old":function(e){return"Stary adres: "+r.v(e,"oldAddress")},"addressUpdate:new":function(e){return"Nowy adres: <a href='"+r.v(e,"newAddress")+"'>"+r.v(e,"newAddress")+"</a>"},"addressUpdate:go":function(e){return"PRZEJDŹ DO NOWEGO ADRESU"}}});