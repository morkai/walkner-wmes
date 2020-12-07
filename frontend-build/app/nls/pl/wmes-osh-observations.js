define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,o,t,i){return r.c(n,e),n[e]in i?i[n[e]]:(e=r.lc[t](n[e]-o))in i?i[e]:i.other},s:function(n,e,o){return r.c(n,e),n[e]in o?o[n[e]]:o.other}};return{"BREADCRUMB:browse":function(n){return"Obserwacje"},"PROPERTY:rid":function(n){return"ID"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:createdAt":function(n){return"Czas zgłoszenia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:duration":function(n){return"Czas trwania"},"PROPERTY:creator":function(n){return"Obserwator"},"PROPERTY:coordinators":function(n){return"Koordynatorzy"},"PROPERTY:userWorkplace":function(n){return"Zakład obserwatora"},"PROPERTY:userDepartment":function(n){return"Wydział obserwatora"},"PROPERTY:division":function(n){return"Dywizja"},"PROPERTY:workplace":function(n){return"Zakład"},"PROPERTY:department":function(n){return"Wydział"},"PROPERTY:building":function(n){return"Budynek"},"PROPERTY:location":function(n){return"Obszar"},"PROPERTY:station":function(n){return"Stanowisko"},"PROPERTY:locationPath":function(n){return"Miejsce obserwacji"},"PROPERTY:date":function(n){return"Czas obserwacji"},"PROPERTY:company":function(n){return"Firma obserwowanego"},"PROPERTY:companyName":function(n){return"Nazwa firmy"},"PROPERTY:observationKind":function(n){return"Rodzaj"},"PROPERTY:subject":function(n){return"Temat"},"PROPERTY:behaviors":function(n){return"Obserwacje zachowań"},"PROPERTY:behaviors.category":function(n){return"Kategoria"},"PROPERTY:behaviors.safe":function(n){return"Bezpieczne"},"PROPERTY:behaviors.risky":function(n){return"Ryzykowne"},"PROPERTY:behaviors.what":function(n){return"Co zaobserwowano?"},"PROPERTY:behaviors.why":function(n){return"Co aktywowało ryzykowne zachowanie?"},"PROPERTY:behaviors.easy":function(n){return"Łatwe"},"PROPERTY:behaviors.hard":function(n){return"Trudne"},"PROPERTY:behaviors.resolution":function(n){return"Zgłoszenie"},"PROPERTY:workConditions":function(n){return"Ryzykowne warunki w miejscu pracy"},"PROPERTY:workConditions.category":function(n){return"Kategoria"},"PROPERTY:workConditions.safe":function(n){return"Bezpieczne"},"PROPERTY:workConditions.risky":function(n){return"Ryzykowne"},"PROPERTY:workConditions.what":function(n){return"Co zauważono?"},"PROPERTY:workConditions.why":function(n){return"Jaka była przyczyna powstania ryzyka?"},"PROPERTY:workConditions.easy":function(n){return"Łatwe"},"PROPERTY:workConditions.hard":function(n){return"Trudne"},"PROPERTY:workConditions.resolution":function(n){return"Zgłoszenie"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:attachments":function(n){return"Załączniki"},"PROPERTY:relations":function(n){return"Powiązania"},"filter:user:mine":function(n){return"Moje"},"filter:user:others":function(n){return"Użytkownik"},"details:general":function(n){return"Podstawowe informacje"},"details:users":function(n){return"Użytkownicy"},"details:extra":function(n){return"Dodatkowe informacje"},"details:date:format":function(n){return"LL, [godz.] H"},"details:observations:safeRisky":function(n){return"Bezpieczne /<br>Ryzykowne"},"details:observations:easyHard":function(n){return"Łatwe /<br>Trudne"},"safe:true":function(n){return"Bezpieczne"},"safe:false":function(n){return"Ryzykowne"},"easy:null":function(n){return""},"easy:true":function(n){return"Łatwe"},"easy:false":function(n){return"Trudne"},"FORM:ACTION:add":function(n){return"Dodaj nową kartę obserwacji"},"FRM:ERROR:empty":function(n){return"Opisz przynajmniej jedną obserwację zachowań lub warunków pracy."},"FORM:placeholder:noUserWorkplace":function(n){return"Wybierz zakład obserwatora..."},"FORM:placeholder:noWorkplace":function(n){return"Wybierz zakład..."},"FORM:placeholder:noDepartment":function(n){return"Wybierz wydział..."},"FORM:placeholder:noBuilding":function(n){return"Wybierz budynek..."},"FORM:placeholder:noLocation":function(n){return"Wybierz obszar..."},"FORM:company:label":function(n){return"Osoba obserwowana zatrudniona przez"},"FORM:company:name":function(n){return"Nazwa firmy"},"FORM:company:other":function(n){return"Inna firma..."},"FORM:time:placeholder":function(n){return"gg"},"FORM:time:title":function(n){return"Godzina przeprowadzenia obserwacji"},"FORM:categories:duplicate":function(n){return"Dodaj kolejną pozycję z tej kategorii"},"FORM:categories:remove":function(n){return"Usuń kategorię"},"FORM:resolution:show":function(n){return"Pokaż szczegóły zgłoszenia"},"FORM:resolution:add":function(n){return"Dodaj nowe zgłoszenie"},"FORM:resolution:placeholder:unspecified":function(n){return""},"FORM:resolution:placeholder:nearMiss":function(n){return"ZPW..."},"FORM:resolution:placeholder:kaizen":function(n){return"Kaizen..."},"FORM:resolution:title:kaizen":function(n){return"Dodawanie nowego kaizena"},"FORM:resolution:title:nearMiss":function(n){return"Dodawanie nowego ZPW"},"FORM:resolution:error:loading":function(n){return"Ładowanie zgłoszenia..."},"FORM:resolution:error:notFound":function(n){return"Zgłoszenie nie istnieje."},"FORM:resolution:error:finished":function(n){return"Zgłoszenie jest już zakończone."},"FORM:resolution:error:duplicate":function(n){return"Zgłoszenie nie może się powtarzać."},"FORM:resolution:error:failure":function(n){return"Sprawdzanie zgłoszenia nie powiodło się."},easyConfirmed:function(n){return"„Łatwe” do zmiany zachowania omówiono z osobą obserwowaną i uzyskano potwierdzenie pracy w sposób bezpieczny."},"history:observations":function(n){return r.v(n,"count")+" "+r.p(n,"count",0,"pl",{one:"obserwacja",few:"obserwacje",other:"obserwacji"})},"history:workConditions":function(n){return"Warunki w miejscu pracy"},"resolution:add":function(n){return"Dodaj"},"resolution:subject":function(n){return"Temat"},"resolution:status":function(n){return"Status"},"resolution:createdAt":function(n){return"Czas zgłoszenia"},"resolution:creator":function(n){return"Osoba zgłaszająca"}}});