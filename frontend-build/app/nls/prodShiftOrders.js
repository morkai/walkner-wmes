define(["app/nls/locale/en"],function(e){var r={lc:{pl:function(r){return e(r)},en:function(r){return e(r)}},c:function(e,r){if(!e)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(e,r,t){if(isNaN(e[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return e[r]-(t||0)},v:function(e,t){return r.c(e,t),e[t]},p:function(e,t,n,o,u){return r.c(e,t),e[t]in u?u[e[t]]:(t=r.lc[o](e[t]-n),t in u?u[t]:u.other)},s:function(e,t,n){return r.c(e,t),e[t]in n?n[e[t]]:n.other}};return{root:{"BREADCRUMBS:browse":function(e){return"Orders"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the orders :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the order :("},"MSG:DELETED":function(e){return"Order <em>"+r.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:prodLogEntries":function(e){return"Show operation log"},"PAGE_ACTION:prodDowntimes":function(e){return"Show downtimes"},"PAGE_ACTION:export":function(e){return"Export orders"},"PAGE_ACTION:edit":function(e){return"Edit order"},"PAGE_ACTION:delete":function(e){return"Delete order"},"PANEL:TITLE:details":function(e){return"Order's production details"},"PANEL:TITLE:orderDetails":function(e){return"Order's details at the moment of start"},"PANEL:TITLE:losses":function(e){return"Losses"},"PANEL:TITLE:downtimes":function(e){return"Downtimes"},"PANEL:TITLE:addForm":function(e){return"Add order form"},"PANEL:TITLE:editForm":function(e){return"Edit order form"},"FORM:ACTION:add":function(e){return"Add order"},"FORM:ACTION:edit":function(e){return"Edit order"},"FORM:ERROR:addFailure":function(e){return"Failed to add the order :-("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the order :-("},"FORM:ERROR:order":function(e){return"Order is required!"},"FORM:ERROR:operation":function(e){return"Operation is required!"},"FORM:ERROR:startedAt":function(e){return"Started at must be between the shift's time boundries!"},"FORM:ERROR:finishedAt":function(e){return"Finished at must be between the shift's time boundries!"},"FORM:ERROR:times":function(e){return"Finished at must be after Started at!"},"FORM:ERROR:INVALID_CHANGES":function(e){return"Cannot edit the order: no valid changes were detected :("},"FORM:ERROR:INPUT":function(e){return"Invalid input data!"},"FORM:ERROR:OVERLAPPING_ORDERS":function(e){return"Order overlaps with other orders!"},"FORM:ERROR:NOT_EDITABLE":function(e){return"Order isn't finished yet!"},"filter:orderId":function(e){return"Order no/12NC"},"filter:operationNo":function(e){return"Oper. no"},"filter:submit":function(e){return"Filter orders"},"filter:placeholder:type":function(e){return"Any type"},"filter:placeholder:prodLine":function(e){return"Any production line"},"filter:placeholder:orderId":function(e){return"Any order"},"filter:placeholder:operationNo":function(e){return"0000"},"PROPERTY:mrpControllers":function(e){return"MRP Controller"},"PROPERTY:prodFlow":function(e){return"Production flow"},"PROPERTY:prodLine":function(e){return"Production line"},"PROPERTY:creator":function(e){return"Creator"},"PROPERTY:date":function(e){return"Date"},"PROPERTY:shift":function(e){return"Shift"},"PROPERTY:prodShift":function(e){return"Shift"},"PROPERTY:master":function(e){return"Master"},"PROPERTY:leader":function(e){return"Leader"},"PROPERTY:operator":function(e){return"Operator"},"PROPERTY:operators":function(e){return"Operators"},"PROPERTY:startedAt":function(e){return"Started at"},"PROPERTY:finishedAt":function(e){return"Finished at"},"PROPERTY:duration":function(e){return"Duration"},"PROPERTY:quantityDone":function(e){return"Quantity done"},"PROPERTY:quantityDoneSap":function(e){return"Quantity done / as per SAP"},"PROPERTY:workerCount":function(e){return"Worker count"},"PROPERTY:workerCountSap":function(e){return"Worker count / as per SAP"},"PROPERTY:taktTime":function(e){return"Takt Time / wg SAP"},"PROPERTY:order":function(e){return"Order"},"PROPERTY:orderId":function(e){return"Order"},"PROPERTY:operation":function(e){return"Operation"},"PROPERTY:operationNo":function(e){return"Operation"},"PROPERTY:pressWorksheet":function(e){return"Worksheet"},"PROPERTY:efficiency":function(e){return"Efficiency"},"unit:workerCount":function(e){return"persons"},"unit:taktTime":function(e){return"s"},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Order deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete order"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen order?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+r.v(e,"label")+"</em> order?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the order :-("},"changeRequest:delete:messageText":function(e){return"You're in a change request creation mode. The <em>Order</em> will be deleted only after it has been approved by the person responsible.<br><br>Are you sure you want to create the order deletion request?"},"changeRequest:delete:formActionText":function(e){return"Create deletion request"},"changeRequest:commentLabel":function(e){return"Change request comment"},"changeRequest:warning:add":function(e){return"You're in a change request creation mode. The new <em>Order</em> will be created only after it has been approved by the person responsible."},"changeRequest:warning:edit":function(e){return"You're in a change request creation mode. The <em>Order</em> will be updated only after the change has been approved by the person responsible."},"changeRequest:msg:success:add":function(e){return"Order creation request was created successfully."},"changeRequest:msg:success:edit":function(e){return"Order modification request was created successfully."},"changeRequest:msg:success:delete":function(e){return"Order deletion request was created successfully."},"changeRequest:msg:failure:add":function(e){return"Failed to create a new order creation request :-("},"changeRequest:msg:failure:edit":function(e){return"Failed to create a new order modification request :-("},"changeRequest:msg:failure:delete":function(e){return"Failed to create a new order deletion request :-("}},pl:!0}});