define(["app/nls/locale/pl"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,u,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[u](n[t]-e))in o?o[t]:o.other},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{"BREADCRUMBS:base":function(n){return"Czas cyklu"},"BREADCRUMBS:browse":function(n){return"Historia sztuk"},"BREADCRUMBS:reports":function(n){return"Raporty"},"BREADCRUMBS:reports:pce":function(n){return"Sztuki"},"BREADCRUMBS:reports:groups":function(n){return"Grupy wyrobów"},"BREADCRUMBS:reports:results":function(n){return"Wyniki"},"PAGE_ACTIONS:orderGroups":function(n){return"Grupy"},"PROPERTY:line":function(n){return"Linia"},"PROPERTY:station":function(n){return"Stanowisko"},"PROPERTY:station:short":function(n){return"St."},"PROPERTY:cart":function(n){return"Wózek"},"PROPERTY:order":function(n){return"Zlecenie"},"PROPERTY:order:_id":function(n){return"Nr zlecenia"},"PROPERTY:order:nc12":function(n){return"12NC wyrobu"},"PROPERTY:order:name":function(n){return"Nazwa wyrobu"},"PROPERTY:order:qty":function(n){return"Ilość do zrobienia"},"PROPERTY:order:workerCount":function(n){return"Ilość osób w zleceniu"},"PROPERTY:order:sapTaktTime":function(n){return"Takt Time (SAP)"},"PROPERTY:pce":function(n){return"Sztuka"},"PROPERTY:pce:short":function(n){return"Szt."},"PROPERTY:startedAt":function(n){return"Czas rozpoczęcia"},"PROPERTY:finishedAt":function(n){return"Czas zakończenia"},"PROPERTY:duration":function(n){return"Czas trwania"},"PROPERTY:durations:total":function(n){return"Całkowity czas trwania"},"PROPERTY:durations:work":function(n){return"Czas pracy"},"PROPERTY:durations:downtime":function(n){return"Czas wszystkich przestojów"},"PROPERTY:durations:scheduled":function(n){return"Czas planowanych przestojów"},"pceReport:chart:title":function(n){return"Czas cyklu"},"pceReport:chart:filename":function(n){return"WMES_CzasCyklu"},"pceReport:filter:orders":function(n){return"Zlecenie/Wyrób"},"pceReport:filter:lines":function(n){return"Linia"},"pceReport:filter:invalid":function(n){return"Podaj zlecenie/wyrób lub datę oraz linię."},"pceReport:column:line":function(n){return"Linia"},"pceReport:column:order":function(n){return"Zlecenie"},"pceReport:column:shift":function(n){return"Zmiana"},"pceReport:column:startedAt":function(n){return"Czas<br>rozp."},"pceReport:column:pce":function(n){return"Sztuka"},"pceReport:column:pce:order":function(n){return"Zl."},"pceReport:column:pce:order:title":function(n){return"Nr sztuki w całym zleceniu"},"pceReport:column:pce:shift":function(n){return"Zm."},"pceReport:column:pce:shift:title":function(n){return"Nr sztuki w zleceniu zmiany produkcyjnej"},"pceReport:column:station":function(n){return r.v(n,"no")},"pceReport:column:min":function(n){return"Min."},"pceReport:column:max":function(n){return"Maks."},"pceReport:metric:min":function(n){return"Minimum"},"pceReport:metric:max":function(n){return"Maksimum"},"pceReport:metric:med":function(n){return"Mediana"},"pceReport:metric:avg":function(n){return"Średnia"},"pceReport:metric:stt":function(n){return"Takt Time SAP"},"groupsReport:chart:title":function(n){return"Czas cyklu"},"groupsReport:chart:filename":function(n){return"WMES_CzasCyklu"},"groupsReport:filter:lines":function(n){return"Linia"},"groupsReport:filter:minMaxQty":function(n){return"Ilość sztuk"},"groupsReport:filter:minQty":function(n){return"Minimalna całkowita ilość sztuk do zrobienia w zleceniu produkcyjnym"},"groupsReport:filter:maxQty":function(n){return"Maksymalna całkowita ilość sztuk do zrobienia w zleceniu produkcyjnym"},"groupsReport:filter:minMaxT":function(n){return"Czas cyklu"},"groupsReport:filter:minT":function(n){return"n - czas cyklu sztuki jest większy lub równy n\nn% - czas cyklu sztuki jest większy lub równy n procentowi wartości Takt Time SAP\n~n - wartość bezwzględna różnicy między Takt Time SAP a czasem cyklu sztuki jest większa lub równa n"},"groupsReport:filter:maxT":function(n){return"n - czas cyklu sztuki jest mniejszy lub równy n\nn% - czas cyklu sztuki jest mniejszy lub równy n procentowi wartości Takt Time SAP\n~n - wartość bezwzględna różnicy między Takt Time SAP a czasem cyklu sztuki jest mniejsza lub równa n"},"groupsReport:column:order":function(n){return"Zlecenie"},"groupsReport:column:nc12":function(n){return"12NC"},"groupsReport:column:name":function(n){return"Nazwa wyrobu"},"groupsReport:column:qty":function(n){return"Ilość"},"groupsReport:column:qtyMatched":function(n){return"Ilość zrobiona z filtrem Czas cyklu"},"groupsReport:column:qtyDone":function(n){return"Ilość zrobiona bez filtra Czas cyklu"},"groupsReport:column:qtyTodo":function(n){return"Całkowita ilość do zrobienia w zleceniu produkcyjnym"},"groupsReport:column:target":function(n){return"Cel"},"groupsReport:column:station":function(n){return r.v(n,"no")},"groupsReport:column:station:title":function(n){return"Takt Time SAP: "+r.v(n,"target")+"\nMediana: "+r.v(n,"med")+"\nŚrednia: "+r.v(n,"avg")+"\nMinimum: "+r.v(n,"min")+"\nMaksimum: "+r.v(n,"max")},"groupsReport:column:total":function(n){return"Suma"},"groupsReport:column:min":function(n){return"Min."},"groupsReport:column:max":function(n){return"Maks."},"groupsReport:metric:min":function(n){return"Minimum"},"groupsReport:metric:max":function(n){return"Maksimum"},"groupsReport:metric:med":function(n){return"Mediana"},"groupsReport:metric:avg":function(n){return"Średnia"},"groupsReport:metric:stt":function(n){return"Takt Time SAP"},"resultsReport:filter:minLineWorkDuration":function(n){return"Min. czas pracy [h]"},"resultsReport:filter:minUpphWorkDuration":function(n){return"Min. UPPH"},"resultsReport:filter:shiftCount":function(n){return"Ilość zmian"},"resultsReport:filter:availableWorkDuration":function(n){return"Czas zmiany [h]"},"resultsReport:filter:minMrpUnbalance":function(n){return"Min. unbalance [%]"},"resultsReport:filter:minMrpBottleneck":function(n){return"Min. wąskie gardło"},"resultsReport:filter:minMrpEfficiency":function(n){return"Min. wydajność [%]"},"resultsReport:vs:title":function(n){return"Performance vs Bottleneck"},"resultsReport:vs:filename":function(n){return"WMES_PerfVsBneck"},"resultsReport:workingLineCount:category":function(n){return"Ilość pracujących linii"},"resultsReport:workingLineCount:series":function(n){return"Ilość linii"},"resultsReport:availableLineUsage:category":function(n){return"Wykorzystanie dostępnych linii"},"resultsReport:availableLineUsage:series":function(n){return"Wykorzystanie linii"},"resultsReport:mrpCount:category":function(n){return"Ilość wszystkich rodzin"},"resultsReport:mrpCount:series":function(n){return"Ilość rodzin"},"resultsReport:unbalancedMrpCount:category":function(n){return"Ilość rodzin z unbalancem"},"resultsReport:unbalancedMrpCount:series":function(n){return"Ilość rodzin"},"resultsReport:bottleneckedMrpCount:category":function(n){return"Ilość rodzin z wąskim gardłem"},"resultsReport:bottleneckedMrpCount:series":function(n){return"Ilość rodzin"},"resultsReport:efficientMrpCount:category":function(n){return"Ilość wydajnych rodzin"},"resultsReport:efficientMrpCount:series":function(n){return"Ilość rodzin"},"resultsReport:avgOutput:title":function(n){return"Weekly Average Output [Units Per Person Hour]"},"resultsReport:avgOutput:filename":function(n){return"WMES_AvgOutput"},"resultsReport:avgOutput:series":function(n){return"UPPH"},"resultsReport:table:mrps":function(n){return"Rodziny"},"resultsReport:table:lines":function(n){return"Linie"},"resultsReport:table:mrp":function(n){return"MRP"},"resultsReport:table:efficiency":function(n){return"Wydajność"},"resultsReport:table:unbalance":function(n){return"Unbalance"},"resultsReport:table:bottleneck":function(n){return"Wąskie gardło"},"resultsReport:table:mrpLines":function(n){return"Linie"},"resultsReport:table:lineMrps":function(n){return"MRP"},"resultsReport:table:workDuration":function(n){return"Czas pracy"},"resultsReport:table:breakDuration":function(n){return"Czas przerw"},"resultsReport:table:usage":function(n){return"Wykorzystanie"},"resultsReport:table:quantityDone":function(n){return"Ilość zrobiona"},"resultsReport:table:st":function(n){return"St."},"resultsReport:table:ct":function(n){return"Czas cyklu"},"resultsReport:table:bn":function(n){return"Ilość wąskich gardeł"}}});