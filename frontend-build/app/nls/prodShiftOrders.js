define(["app/nls/locale/en"],function(r){var n={locale:{}};n.locale.en=r;var t=function(r){if(!r)throw new Error("MessageFormat: No data passed to function.")},e=function(r,n){return t(r),r[n]};return{root:{"BREADCRUMBS:browse":function(){return"Orders"},"BREADCRUMBS:details":function(r){return e(r,"order")+"; "+e(r,"operation")},"BREADCRUMBS:editForm":function(){return"Editing"},"MSG:LOADING_FAILURE":function(){return"Failed to load the orders :("},"PAGE_ACTION:prodLogEntries":function(){return"Show operation log"},"PAGE_ACTION:prodDowntimes":function(){return"Show downtimes"},"PAGE_ACTION:export":function(){return"Export orders"},"PAGE_ACTION:edit":function(){return"Edit order"},"PANEL:TITLE:details":function(){return"Order's production details"},"PANEL:TITLE:orderDetails":function(){return"Order's details at the moment of start"},"PANEL:TITLE:losses":function(){return"Losses"},"PANEL:TITLE:downtimes":function(){return"Downtimes"},"FORM:ACTION:edit":function(){return"Edit order"},"FORM:ERROR:editFailure":function(){return"Failed to edit the order :-("},"FORM:ERROR:order":function(){return"Order is required!"},"FORM:ERROR:operation":function(){return"Operation is required!"},"FORM:ERROR:startedAt":function(){return"Started at must be between the shift's time boundries!"},"FORM:ERROR:finishedAt":function(){return"Finished at must be between the shift's time boundries!"},"FORM:ERROR:times":function(){return"Finished at must be after Started at!"},"FORM:ERROR:INVALID_CHANGES":function(){return"Cannot edit the order: no valid changes were detected :("},"FORM:PLACEHOLDER:personnel":function(){return"Search by last name or personell ID..."},"FILTER:orderId":function(){return"Order no/12NC"},"FILTER:operationNo":function(){return"Oper. no"},"FILTER:DATE:FROM":function(){return"From"},"FILTER:DATE:TO":function(){return"To"},"FILTER:LIMIT":function(){return"Limit"},"FILTER:BUTTON":function(){return"Filter orders"},"FILTER:PLACEHOLDER:type":function(){return"Any type"},"FILTER:PLACEHOLDER:prodLine":function(){return"Any production line"},"FILTER:PLACEHOLDER:orderId":function(){return"Any order"},"FILTER:PLACEHOLDER:operationNo":function(){return"0000"},"PROPERTY:mrpControllers":function(){return"MRP Controller"},"PROPERTY:prodFlow":function(){return"Production flow"},"PROPERTY:prodLine":function(){return"Production line"},"PROPERTY:creator":function(){return"Creator"},"PROPERTY:date":function(){return"Date"},"PROPERTY:shift":function(){return"Shift"},"PROPERTY:prodShift":function(){return"Shift"},"PROPERTY:master":function(){return"Master"},"PROPERTY:leader":function(){return"Leader"},"PROPERTY:operator":function(){return"Operator"},"PROPERTY:operators":function(){return"Operators"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:quantityDone":function(){return"Quantity done"},"PROPERTY:quantityDoneSap":function(){return"Quantity done / as per SAP"},"PROPERTY:workerCount":function(){return"Worker count"},"PROPERTY:workerCountSap":function(){return"Worker count / as per SAP"},"PROPERTY:taktTime":function(){return"Takt Time / wg SAP"},"PROPERTY:order":function(){return"Order"},"PROPERTY:orderId":function(){return"Order"},"PROPERTY:operation":function(){return"Operation"},"PROPERTY:operationNo":function(){return"Operation"},"PROPERTY:pressWorksheet":function(){return"Worksheet"},"unit:workerCount":function(){return"persons"},"unit:taktTime":function(){return"s"}},pl:!0}});