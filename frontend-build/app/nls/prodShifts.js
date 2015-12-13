define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,i,o){return t.c(e,n),e[n]in o?o[e[n]]:(n=t.lc[i](e[n]-r),n in o?o[n]:o.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:browse":function(e){return"Shifts"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the shifts :-("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the shift :-("},"MSG:DELETED":function(e){return"Shift <em>"+t.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:prodLogEntries":function(e){return"Show operation log"},"PAGE_ACTION:export":function(e){return"Export shifts"},"PAGE_ACTION:add":function(e){return"Add shift"},"PAGE_ACTION:edit":function(e){return"Edit shift"},"PAGE_ACTION:delete":function(e){return"Delete shift"},"PANEL:TITLE:details":function(e){return"Shift's details"},"PANEL:TITLE:addForm":function(e){return"Add shift form"},"PANEL:TITLE:editForm":function(e){return"Edit shift form"},"filter:submit":function(e){return"Filter shifts"},"filter:placeholder:prodLine":function(e){return"Any production line"},"PROPERTY:mrpControllers":function(e){return"MRP Controller"},"PROPERTY:prodFlow":function(e){return"Production flow"},"PROPERTY:prodLine":function(e){return"Production line"},"PROPERTY:type":function(e){return"Type"},"PROPERTY:createdAt":function(e){return"Created at"},"PROPERTY:creator":function(e){return"Creator"},"PROPERTY:date":function(e){return"Date"},"PROPERTY:shift":function(e){return"Shift"},"PROPERTY:master":function(e){return"Master"},"PROPERTY:leader":function(e){return"Leader"},"PROPERTY:operator":function(e){return"Operator"},"PROPERTY:operators":function(e){return"Operators"},"PROPERTY:quantitiesDone":function(e){return"Quantities done"},"PROPERTY:quantitiesDone:hour":function(e){return"Hour"},"PROPERTY:quantitiesDone:planned":function(e){return"Planned"},"PROPERTY:quantitiesDone:actual":function(e){return"Actual"},"PROPERTY:totalQuantityDone":function(e){return"Quantity done"},"FORM:ACTION:add":function(e){return"Add shift"},"FORM:ACTION:edit":function(e){return"Edit shift"},"FORM:ERROR:addFailure":function(e){return"Failed to add the shift :-("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the shift :-("},"FORM:ERROR:INVALID_CHANGES":function(e){return"Cannot edit the shift: no valid changes were detected :-("},"FORM:ERROR:INPUT":function(e){return"Invalid input data!"},"FORM:ERROR:NOT_EDITABLE":function(e){return"The specified shift didn't end yet!"},"FORM:ERROR:EXISTING":function(e){return"The specified shift already exists!"},totalQuantityDone:function(e){return t.v(e,"actual")+" of "+t.v(e,"planned")},"timeline:title":function(e){return"Timeline"},"timeline:action:addOrder":function(e){return"Add order"},"timeline:action:addDowntime":function(e){return"Add downtime"},"timeline:action:editOrder":function(e){return"Edit order"},"timeline:action:editDowntime":function(e){return"Edit downtime"},"timeline:action:deleteOrder":function(e){return"Delete order"},"timeline:action:deleteDowntime":function(e){return"Delete downtime"},"timeline:popover:idle":function(e){return"Idle"},"timeline:popover:working":function(e){return"Order"},"timeline:popover:downtime":function(e){return"Downtime"},"timeline:popover:startedAt":function(e){return"Started at"},"timeline:popover:finishedAt":function(e){return"Finished at"},"timeline:popover:duration":function(e){return"Duration"},"timeline:popover:order":function(e){return"Order"},"timeline:popover:operation":function(e){return"Operation"},"timeline:popover:reason":function(e){return"Reason"},"timeline:popover:aor":function(e){return"AOR"},"timeline:popover:workerCount":function(e){return"Worker count"},"timeline:popover:quantityDone":function(e){return"Quantiy done"},"timeline:popover:efficiency":function(e){return"Efficiency"},"charts:quantitiesDone:title":function(e){return"Quantities done in specific hours"},"charts:quantitiesDone:unit":function(e){return" items"},"charts:quantitiesDone:series:planned":function(e){return"Planned"},"charts:quantitiesDone:series:actual":function(e){return"Actual"},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Shift deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete shift"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen shift?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+t.v(e,"label")+"</em> shift?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the shift :-("},"changeRequest:delete:messageText":function(e){return"You're in a change request creation mode. The <em>Production shift</em> will be deleted only after it has been approved by the person responsible.<br><br>Are you sure you want to create the shift deletion request?"},"changeRequest:delete:formActionText":function(e){return"Create deletion request"},"changeRequest:commentLabel":function(e){return"Change request comment"},"changeRequest:warning:add":function(e){return"You're in a change request creation mode. The new <em>Production shift</em> will be created only after it has been approved by the person responsible."},"changeRequest:warning:edit":function(e){return"You're in a change request creation mode. The new <em>Production shift</em> will be updated only after it has been approved by the person responsible."},"changeRequest:msg:success:add":function(e){return"Production shift creation request was created successfully."},"changeRequest:msg:success:edit":function(e){return"Production shift modification request was created successfully."},"changeRequest:msg:success:delete":function(e){return"Production shift deletion request was created successfully."},"changeRequest:msg:failure:add":function(e){return"Failed to create a new production shift creation request :-("},"changeRequest:msg:failure:edit":function(e){return"Failed to create a new production shift modification request :-("},"changeRequest:msg:failure:delete":function(e){return"Failed to create a new production shift deletion request :-("}},pl:!0}});