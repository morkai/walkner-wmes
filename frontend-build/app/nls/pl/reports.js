define(["app/nls/locale/pl"],function(n){var r={locale:{}};r.locale.pl=n;var t=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},e=function(n,r){return t(n),n[r]};return{"BREADCRUMBS:reports":function(){return"Raporty"},"BREADCRUMBS:metricRefs":function(){return"Wartości referencyjne"},"BREADCRUMBS:divisions":function(){return"Wydziały"},"BREADCRUMBS:1":function(){return"Wskaźniki"},"BREADCRUMBS:2":function(){return"CLIP"},"BREADCRUMBS:3":function(){return"Wykorzystanie zasobów"},"BREADCRUMBS:4":function(){return"Operatorzy"},"PAGE_ACTION:editMetricRefs":function(){return"Zmień wartości referencyjne"},"1:pageTitle":function(){return"Wskaźniki"},"2:pageTitle":function(){return"CLIP"},"charts:title:overall":function(){return"ML"},"coeffs:quantityDone":function(){return"Sztuki"},"coeffs:downtime":function(){return"Przestoje"},"coeffs:efficiency":function(){return"Wydajność"},"coeffs:productivity":function(){return"Produktywność"},"metrics:clip:orderCount":function(){return"Ilość zleceń"},"metrics:clip:production":function(){return"CLIP Produkcja"},"metrics:clip:endToEnd":function(){return"CLIP End2End"},"downtimesByAor:title":function(){return"Czas przestojów - obszary odp."},"downtimesByAor:seriesName":function(){return"Czas przestojów"},"downtimesByAor:press:shortText":function(){return"TKP"},"downtimesByAor:press:longText":function(){return"Tłocznia (karta pracy)"},"downtimesByReason:title":function(){return"Czas przestojów - przyczyny"},"downtimesByReason:seriesName":function(){return"Czas przestojów"},quantitySuffix:function(){return" szt."},"dirIndir:title":function(){return"DIR/INDIR"},"dirIndir:seriesName":function(){return"FTE"},"effIneff:title":function(){return"Podział zasobów"},"effIneff:seriesName":function(){return"FTE"},"effIneff:category:value":function(){return"I/E"},"effIneff:category:dirIndir":function(){return"D/I"},"effIneff:category:other":function(){return"..."},"effIneff:name:value":function(){return"INEFF/EFF"},"effIneff:name:dirIndir":function(){return"DIRECT/INDIRECT"},"effIneff:name:other":function(){return"Inne"},"tooltipHeaderFormat:year":function(){return"YYYY"},"tooltipHeaderFormat:month":function(){return"YYYY MMMM"},"tooltipHeaderFormat:week":function(){return"wo [tydzień] (LL)"},"tooltipHeaderFormat:day":function(){return"LL"},"tooltipHeaderFormat:shift":function(n){return"LL[, "+e(n,"shift")+" zmiana]"},"tooltipHeaderFormat:hour":function(){return"LLL"},"filter:mode":function(){return"Tryb"},"filter:mode:online":function(){return"Online"},"filter:mode:date":function(){return"Zadany okres czasu"},"filter:from":function(){return"Od: "},"filter:to":function(){return"Do: "},"filter:interval":function(){return"Podział czasu"},"filter:interval:year":function(){return"rok"},"filter:interval:month":function(){return"mc"},"filter:interval:week":function(){return"tydz"},"filter:interval:day":function(){return"dzień"},"filter:interval:shift":function(){return"zm"},"filter:interval:hour":function(){return"godz"},"filter:interval:title:year":function(){return"Rok"},"filter:interval:title:month":function(){return"Miesiąc"},"filter:interval:title:week":function(){return"Tydzień"},"filter:interval:title:day":function(){return"Dzień"},"filter:interval:title:shift":function(){return"Zmiana"},"filter:interval:title:hour":function(){return"Godzina"},"filter:subdivisionType":function(){return"Typ działu"},"filter:subdivisionType:prod":function(){return"Montaż"},"filter:subdivisionType:press":function(){return"Tłocznia"},"filter:submit":function(){return"Filtruj raport"},"filter:submit:currentShift":function(){return"Aktualna zmiana"},"filter:submit:prevShift":function(){return"Poprzednia zmiana"},"filter:submit:today":function(){return"Dzisiaj"},"filter:submit:yesterday":function(){return"Wczoraj"},"filter:submit:currentWeek":function(){return"Aktualny tydzień"},"filter:submit:prevWeek":function(){return"Poprzedni tydzień"},"filter:submit:currentMonth":function(){return"Aktualny miesiąc"},"filter:submit:prevMonth":function(){return"Poprzedni miesiąc"},"filter:submit:currentYear":function(){return"Aktualny rok"},"filter:submit:prevYear":function(){return"Poprzedni rok"},"filter:divisions":function(){return"Wydział"},"filter:majorMalfunction":function(){return"Poważna awaria [h]"},"metricRefs:efficiency":function(){return"Wydajność"},"metricRefs:productivity":function(){return"Produktywność"},"metricRefs:overall":function(){return"ML"},"metricRefs:overall:prod":function(){return"Montaż"},"metricRefs:overall:press":function(){return"Tłocznia"},"oee:table:loading":function(){return"Ładowanie..."},"oee:table:loadingFailed":function(){return"Ładowanie nie powiodło się :("},"oee:no":function(){return"Lp."},"oee:division":function(){return"Wydział"},"oee:prodLine":function(){return"Nazwa maszyny"},"oee:inventoryNo":function(){return"Nr inwent."},"oee:totalAvailability":function(){return"Dyspoz. maszyn całkowita [h]"},"oee:operationalAvailability:h":function(){return"Dyspoz. maszyn oper. [h]"},"oee:operationalAvailability:%":function(){return"Dyspoz. maszyn oper. [%]"},"oee:exploitation:h":function(){return"Wykorz. maszyn [h]"},"oee:exploitation:%":function(){return"Wykorz. maszyn [%]"},"oee:oee":function(){return"OEE [%]"},"oee:adjusting:duration":function(){return"Czas ustaw. / przezbr. [h]"},"oee:maintenance:duration":function(){return"Czas konserw. [h]"},"oee:renovation:duration":function(){return"Czas przeglądów / remontów [h]"},"oee:malfunction:duration":function(){return"Czas wszystkich awarii [h]"},"oee:malfunction:count":function(){return"Ilość wszystkich awarii [szt]"},"oee:majorMalfunction:count":function(){return"Ilość poważnych awarii [szt]"},"oee:mttr":function(){return"MTTR [h]"},"oee:mtbf":function(){return"MTBF [h]"},"operator:filter:mode:shift":function(){return"Zmiana"},"operator:filter:mode:masters":function(){return"Mistrzowie"},"operator:filter:mode:operators":function(){return"Operatorzy"},"operator:effAndProd:title":function(){return"Wydajność/Produktywność"},"operator:efficiency:byDivision":function(n){return"Wydajność "+e(n,"division")},"operator:efficiency":function(){return"Wydajność operatorów"},"operator:productivity":function(){return"Produktywność operatorów"},"operator:workTimes:title":function(){return"Przepracowany czas/Przestoje"},"operator:workTimes:total":function(){return"Całkowity przepracowany czas"},"operator:workTimes:sap":function(){return"Czas przepracowany (SAP)"},"operator:workTimes:otherWorks":function(){return"Czas innych prac"},"operator:workTimes:downtime":function(){return"Czas przestoju"},"operator:machineTimes:title":function(){return"Maszyny - czas pracy/czasy przezbrojeń"},"operator:machineTimes:machineMedian":function(){return"Mediana przezbrojeń maszyny"},"operator:machineTimes:work":function(){return"Czas przepracowany"},"operator:machineTimes:operatorMedian":function(){return"Mediana przezbrojeń operatorów"},"operator:quantities:title":function(){return"Ilości wykonane/Straty materiałowe"},"operator:quantities:good":function(){return"Dobre"},"operator:quantities:bad":function(){return"Wadliwe"},"operator:quantities:total":function(){return"Suma"},"operator:quantities:loss":function(){return"Straty"},"filenames:1:coeffs":function(){return"WMES_Wskazniki_WydProd"},"filenames:1:downtimesByAor":function(){return"WMES_Przestoje_ObszOdp"},"filenames:1:downtimesByReason":function(){return"WMES_Przestoje_Powody"},"filenames:2:clip":function(){return"WMES_CLIP"},"filenames:2:dirIndir":function(){return"WMES_DirIndir"},"filenames:2:effIneff":function(){return"WMES_PodzialZasobow"},"filenames:3:oee":function(){return"WMES_WykZas_OEE"},"filenames:3:downtime":function(){return"WMES_WykZas_Przestoje"},"filenames:4:effAndProd":function(){return"WMES_Operatorzy_WydProd"},"filenames:4:workTimes":function(){return"WMES_Operatorzy_CzasPracy"},"filenames:4:machineTimes":function(){return"WMES_Operatorzy_CzasPrzezbr"},"filenames:4:quantities":function(){return"WMES_Operatorzy_WykIlosci"}}});