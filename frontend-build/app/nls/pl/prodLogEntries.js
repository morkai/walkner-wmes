define(["app/nls/locale/pl"],function(r){var e={locale:{}};return e.locale.pl=r,{"BREADCRUMBS:browse":function(){var r="";return r+="Historia operacji na liniach produkcyjnych"},"MSG:LOADING_FAILURE":function(){var r="";return r+="Ładowanie historii operacji nie powiodło się :("},"FILTER:DATE:FROM":function(){var r="";return r+="Od"},"FILTER:DATE:TO":function(){var r="";return r+="Do"},"FILTER:LIMIT":function(){var r="";return r+="Limit"},"FILTER:BUTTON":function(){var r="";return r+="Filtruj historię"},"FILTER:PLACEHOLDER:type":function(){var r="";return r+="Dowolny typ"},"FILTER:PLACEHOLDER:prodLine":function(){var r="";return r+="Dowolna linia produkcyjna"},"PROPERTY:prodLine":function(){var r="";return r+="Linia produkcyjna"},"PROPERTY:type":function(){var r="";return r+="Typ"},"PROPERTY:createdAt":function(){var r="";return r+="Czas operacji"},"PROPERTY:creator":function(){var r="";return r+="Wykonawca operacji"},"PROPERTY:data":function(){var r="";return r+="Dodatkowe informacje"},"PROPERTY:prodShift":function(){var r="";return r+="Zmiana"},"PROPERTY:prodShiftOrder":function(){var r="";return r+="Zlecenie"},"type:changeShift":function(){var r="";return r+="Rozpoczęcie zmiany"},"type:changeMaster":function(){var r="";return r+="Zmiana mistrza"},"type:changeLeader":function(){var r="";return r+="Zmiana lidera"},"type:changeOperator":function(){var r="";return r+="Zmiana operatora"},"type:changeQuantitiesDone":function(){var r="";return r+="Zmiana wykonanej ilości w godzinie"},"type:changeOrder":function(){var r="";return r+="Rozpoczęcie zlecenia"},"type:changeQuantityDone":function(){var r="";return r+="Zmiana wykonanej ilości w zleceniu"},"type:changeWorkerCount":function(){var r="";return r+="Zmiana ilości osób w zleceniu"},"type:finishOrder":function(){var r="";return r+="Zakończenie zlecenia"},"type:startDowntime":function(){var r="";return r+="Rozpoczęcie przestoju"},"type:finishDowntime":function(){var r="";return r+="Zakończenie przestoju"},"type:endWork":function(){var r="";return r+="Zakończenie pracy"},"data:changeShift":function(r){var e="";if(e+="Zmiana <em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.shift,e+="</em> z dnia <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.date,e+="</em>"},"data:changeMaster":function(r){var e="";if(e+="Nowy mistrz: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.name,e+="</em>"},"data:changeLeader":function(r){var e="";if(e+="Nowy lider: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.name,e+="</em>"},"data:changeOperator":function(r){var e="";if(e+="Nowy operator: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.name,e+="</em>"},"data:changeQuantitiesDone":function(r){var e="";if(e+="Wykonana ilość w <em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.hour,e+=".</em> godzinie: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.value,e+="</em>"},"data:changeOrder":function(r){var e="";if(e+="Zlecenie: <em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.orderId,e+="</em> (<em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.orderName,e+="</em>); operacja: <em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.operationNo,e+="</em> (<em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.operationName,e+="</em>)"},"data:changeQuantityDone":function(r){var e="";if(e+="Wykonana ilość w zleceniu: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.value,e+="</em>"},"data:changeWorkerCount":function(r){var e="";if(e+="Ilość osób w zleceniu: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.value,e+="</em>"},"data:finishOrder":function(){var r="";return r+="-"},"data:startDowntime":function(r){var e="";if(e+="Powód: <em>",!r)throw new Error("MessageFormat: No data passed to function.");if(e+=r.reason,e+="</em>; obszar odpowiedzialności: <em>",!r)throw new Error("MessageFormat: No data passed to function.");return e+=r.aor,e+="</em>"},"data:finishDowntime":function(){var r="";return r+="-"},"data:endWork":function(){var r="";return r+="-"},"noData:prodShiftOrder":function(){var r="";return r+="<em>brak zlecenia</em>"}}});