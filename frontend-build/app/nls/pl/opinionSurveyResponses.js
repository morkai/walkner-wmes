define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,e){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(e||0)},v:function(n,e){return r.c(n,e),n[e]},p:function(n,e,t,i,o){return r.c(n,e),n[e]in o?o[n[e]]:(e=r.lc[i](n[e]-t))in o?o[e]:o.other},s:function(n,e,t){return r.c(n,e),n[e]in t?t[n[e]]:t.other}};return{"BREADCRUMBS:base":function(n){return"Badanie Opinia"},"BREADCRUMBS:browse":function(n){return"Odpowiedzi"},"BREADCRUMBS:details":function(n){return"Odpowiedź"},"PANEL:TITLE:answers":function(n){return"Odpowiedzi do ankiety"},"PANEL:TITLE:comment":function(n){return"Komentarz"},"PROPERTY:creator":function(n){return"Dodający"},"PROPERTY:createdAt":function(n){return"Czas dodania"},"PROPERTY:comment":function(n){return"Komentarz"},"PROPERTY:survey":function(n){return"Badanie"},"PROPERTY:division":function(n){return"Wydział"},"PROPERTY:superior":function(n){return"Przełożony"},"PROPERTY:employer":function(n){return"Pracodawca"},"PROPERTY:answer":function(n){return"Odpowiedź"},"form:preview:tab":function(n){return"Strona "+r.v(n,"pageNumber")},"filter:submit":function(n){return"Filtruj"},noComment:function(n){return"Brak komentarza."},"answer:yes":function(n){return"Zgadzam się"},"answer:no":function(n){return"Nie zgadzam się"},"answer:na":function(n){return"Nie mam zdania"},"answer:null":function(n){return"?"}}});