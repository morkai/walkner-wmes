define(["app/nls/locale/en"],function(n){var e={locale:{}};e.locale.en=n;var r=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},t=function(n,e){return r(n),n[e]},o=function(n,e,t){return r(n),n[e]in t?t[n[e]]:t.other};return{root:{"breadcrumbs:productionPage":function(){return"Production"},"msg:shiftChange":function(){return"New shift!"},"controls:dashboard":function(){return"Go to dashboard"},"controls:lock":function(){return"Lock the editing"},"controls:unlock":function(){return"Unlock the editing"},"controls:locked":function(){return"Editing locked"},"controls:unlocked":function(){return"Editing unlocked"},"controls:sync":function(){return"Server communication indicator"},"controls:msg:sync:noConnection":function(){return"Cannot unlock: no connection to the server :("},"controls:msg:sync:remoteError":function(){return"Cannot unlock: failed to get the key :("},"controls:msg:sync:success":function(){return"Editing unlocked successfully :)"},"section:data":function(){return"Production data"},"section:history":function(){return"History"},"section:quantities":function(){return"Quantities done"},"section:downtimes":function(){return"Downtimes"},"property:currentTime":function(){return"Current time"},"property:shift":function(){return"Shift"},"property:orgUnit":function(){return"Subdivision"},"property:master":function(){return"Master"},"property:master:change":function(){return"(change)"},"property:master:noData:locked":function(){return"none"},"property:master:noData:unlocked":function(){return"(change master)"},"property:leader":function(){return"Leader"},"property:leader:change":function(){return"(change)"},"property:leader:noData:locked":function(){return"none"},"property:leader:noData:unlocked":function(){return"(change leader)"},"property:operator":function(){return"Operator"},"property:operator:change":function(){return"(change)"},"property:operator:noData:locked":function(){return"none"},"property:operator:noData:unlocked":function(){return"(change operator)"},"property:orderNo":function(){return"Order no"},"property:orderNo:change":function(){return"(change)"},"property:nc12":function(){return"12NC"},"property:nc12:change":function(){return"(change)"},"property:productName":function(){return"Product name"},"property:operationName":function(){return"Operation name"},"property:taktTime":function(){return"Takt [s]"},"property:workerCountSap":function(){return"Worker count as per SAP"},"property:createdAt":function(){return"Started at"},"property:quantityDone":function(){return"Quantity done"},"property:quantityDone:change":function(){return"(change quantity)"},"property:workerCount":function(){return"Worker count"},"property:workerCount:change:data":function(){return"(change count)"},"property:workerCount:change:noData":function(){return"(set count)"},"action:newOrder":function(){return"New order"},"action:continueOrder":function(){return"Continue order"},"action:startDowntime":function(){return"Downtime"},"action:startBreak":function(){return"Break"},"action:endDowntime":function(){return"End downtime"},"action:endWork":function(){return"End work"},"quantities:column:time":function(){return"Time"},"quantities:column:planned":function(){return"Planned [items]"},"quantities:column:actual":function(){return"Actual [items]"},"quantities:change":function(){return"(change)"},"quantities:newValuePlaceholder":function(){return"New quantity..."},"quantityEditor:title":function(){return"Quantity done in an hour"},"quantityEditor:label":function(n){return"Quantity done from "+t(n,"from")+" to "+t(n,"to")+":"},"quantityEditor:submit":function(){return"Set quantity done"},"quantityEditor:cancel":function(){return"Cancel"},"personelPicker:title:master":function(){return"Changing master"},"personelPicker:title:leader":function(){return"Changing leader"},"personelPicker:title:operator":function(){return"Changing operator"},"personelPicker:submit":function(){return"Change user"},"personelPicker:cancel":function(){return"Cancel"},"personelPicker:online:label":function(){return"User:"},"personelPicker:online:placeholder":function(){return"Search by last name or personell ID"},"personelPicker:offline:label":function(){return"User:"},"personelPicker:offline:placeholder":function(){return"User's personell ID"},"personelPicker:offline:warning":function(){return"No connection to the server. You can only enter the user's personell ID."},"newOrderPicker:title":function(){return"Starting a new order"},"newOrderPicker:title:replacing":function(){return"Ending the current order"},"newOrderPicker:title:correcting":function(){return"Correcting the current order"},"newOrderPicker:order:label":function(){return"New order:"},"newOrderPicker:order:placeholder:no":function(){return"Enter the new order's no..."},"newOrderPicker:order:placeholder:nc12":function(){return"Order's 12NC"},"newOrderPicker:operation:label":function(){return"Operation:"},"newOrderPicker:offline:operation:placeholder":function(){return"Operation no"},"newOrderPicker:online:operation:placeholder":function(){return"Choose the new order's operation..."},"newOrderPicker:submit":function(){return"Start order"},"newOrderPicker:submit:replacing":function(){return"End the current order and start a new one"},"newOrderPicker:submit:correcting":function(){return"Correct the current order"},"newOrderPicker:cancel":function(){return"Cancel"},"newOrderPicker:msg:invalidOrderId:no":function(){return"Invalid order no :("},"newOrderPicker:msg:invalidOrderId:nc12":function(){return"Invalid 12NC :("},"newOrderPicker:msg:invalidOperationNo":function(){return"Invalid operation no :("},"newOrderPicker:msg:searchFailure":function(){return"Searching orders failed :("},"newOrderPicker:msg:emptyOrder":function(){return"Order is required."},"newOrderPicker:msg:emptyOperation":function(){return"Operation is required."},"newOrderPicker:online:info:no":function(){return"Enter the order no and choose an operation from the list to start a new order."},"newOrderPicker:online:info:nc12":function(){return"Enter the order's 12NC and choose an operation from the list to start a new order."},"newOrderPicker:offline:warning:no":function(){return"Enter the order no and operation no to start a new order."},"newOrderPicker:offline:warning:nc12":function(){return"Enter the order's 12NC and operation no to start a new order."},"newOrderPicker:checkData:warning":function(){return"Starting a new order will finish the current order. Make sure that the <em>Quantity done</em> and <em>Worker count</em> of the current order have correct values, because after starting a new order, you won't be able to change them."},"newOrderPicker:quantityDone":function(){return"Quantity done in the finished order:"},"newOrderPicker:workerCount":function(){return"Worker count in the finished order:"},"downtimePicker:title:start":function(){return"Starting a new downtime"},"downtimePicker:title:edit":function(){return"Correcting a downtime"},"downtimePicker:submit:start":function(){return"Start downtime"},"downtimePicker:submit:edit":function(){return"Correct downtime"},"downtimePicker:cancel":function(){return"Cancel"},"downtimePicker:reason:label":function(){return"Downtime reason:"},"downtimePicker:reason:placeholder":function(){return"Choose a downtime reason..."},"downtimePicker:reasonComment:label":function(){return"Comment:"},"downtimePicker:reasonComment:placeholder":function(){return"Optional, additional info..."},"downtimePicker:aor:label":function(){return"Area of responsibility:"},"downtimePicker:aor:placeholder":function(){return"Choose an area of responsibility..."},"downtimePicker:msg:emptyReason":function(){return"Downtime reason is required."},"downtimePicker:msg:emptyAor":function(){return"Area of responsibility is required."},"downtimePicker:startedAt":function(){return"Started at"},"downtimePicker:startedAt:now":function(){return"Now"},"prodDowntime:startedAt":function(){return"Started at"},"prodDowntime:finishedAt":function(){return"Finished at"},"prodDowntime:reason":function(){return"Downtime reason"},"prodDowntime:aor":function(){return"Area of responsibility"},"endDowntimeDialog:title":function(){return"Ending downtime confirmation"},"endDowntimeDialog:message":function(){return"<p>Are you sure you want to end the current downtime?</p>"},"endDowntimeDialog:yes":function(){return"End the downtime"},"endDowntimeDialog:no":function(){return"Do not end the downtime"},"continueOrderDialog:title":function(){return"Order continuation confirmation"},"continueOrderDialog:message":function(){return"<p>Are you sure you want to start the currently chosen order?</p>"},"continueOrderDialog:yes":function(){return"Continue the order"},"continueOrderDialog:no":function(){return"Do not continue the order"},"endWorkDialog:title":function(){return"Ending work confirmation"},"endWorkDialog:warning":function(n){return"Ending work will finish "+o(n,"downtime",{"true":"the current downtime and order",other:"the current order"})+". Make sure that the following fields have correct values, because after ending the work, you won't be able to change them."},"endWorkDialog:quantitiesDone":function(n){return"Quantity done in the "+t(n,"hourRange")+" hour:"},"endWorkDialog:quantityDone":function(){return"Quantity done in the current order:"},"endWorkDialog:workerCount":function(){return"Worker count in the current order:"},"endWorkDialog:yes":function(){return"End work"},"endWorkDialog:no":function(){return"Do not end work"},locked:function(){return"Check whether the operator's screen is not running in another window!\n\nIf it's running in another window, then press Cancel and close this window.\n\nIf you want to continue working in this window, then press OK."},"unload:downtime":function(){return"Are you sure you want to close the browser leaving the production line in a state of downtime?\n\nIf you close the browser without Ending work, then the current downtime will be finished at the end of the current shift!"},"unload:order":function(){return"Are you sure you want to close the browser leaving the production line in a state of working?\n\nIf you close the browser without Ending work, then the current order will be finished at the end of the current shift!"}},pl:!0}});