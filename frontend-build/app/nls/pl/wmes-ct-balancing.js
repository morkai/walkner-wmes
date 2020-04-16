define(["app/nls/locale/pl"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e))in i?i[r]:i.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{"BREADCRUMB:base":function(n){return"Czas cyklu"},"BREADCRUMB:browse":function(n){return"Balansowanie"},"PROPERTY:line":function(n){return"Linia"},"PROPERTY:station":function(n){return"Stanowisko"},"PROPERTY:station:short":function(n){return"St."},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:order:_id":function(n){return"Nr zlecenia"},"PROPERTY:order:nc12":function(n){return"12NC wyrobu"},"PROPERTY:order:name":function(n){return"Nazwa wyrobu"},"PROPERTY:order:mrp":function(n){return"MRP"},"PROPERTY:order:qty":function(n){return"Ilość do zrobienia"},"PROPERTY:order:workerCount":function(n){return"Ilość osób w zleceniu"},"PROPERTY:order:sapTaktTime":function(n){return"Takt Time (SAP)"},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:d":function(n){return"Czas trwania"},"PROPERTY:stt":function(n){return"% TT"},"PROPERTY:comment":function(n){return"Komentarz"},"filter:product":function(n){return"Zlecenie/Wyrób"},"filter:d:title":function(n){return"Wartość absolutna, np. 10s\nlub\nrelatywna w stosunku do taktu, np. 10%"},"balancing:title:idle":function(n){return"Balansowanie"},"balancing:title:started":function(n){return"Rozpoczęto pomiar..."},"balancing:title:finished":function(n){return"Zakończono pomiar"},"pceReport:chart:filename":function(n){return"WMES_CT_BALANCING"},"pceReport:chart:title":function(n){return"Balansowanie"},"pceReport:station":function(n){return t.p(n,"no",0,"pl",{0:"Wszystkie",other:"Stanowisko "+t.v(n,"no")})},"pceReport:metric:min":function(n){return"Minimum"},"pceReport:metric:max":function(n){return"Maksimum"},"pceReport:metric:avg":function(n){return"Średnia"},"pceReport:metric:med":function(n){return"Mediana"},"pceReport:metric:stt":function(n){return"Takt Time (SAP)"}}});