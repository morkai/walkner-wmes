define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,o,i){return e.c(n,r),n[r]in i?i[n[r]]:(r=e.lc[o](n[r]-t),r in i?i[r]:i.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{"breadcrumbs:base":function(n){return"Operator"},"breadcrumbs:settings":function(n){return"Settings"},"duplicate:title":function(n){return"Duplicate operator form"},"duplicate:message":function(n){return"Detected another operator form already running.<br>Close all other operator forms and click the button below to reload the form in the current window."},"duplicate:button":function(n){return"Reload operator form"},"msg:shiftChange":function(n){return"New shift!"},"msg:locked":function(n){return"Production line was deactivated!"},"controls:dashboard":function(n){return"Go to dashboard"},"controls:lock":function(n){return"Lock the editing"},"controls:unlock":function(n){return"Unlock the editing"},"controls:locked":function(n){return"Editing locked"},"controls:unlocked":function(n){return"Editing unlocked"},"controls:sync":function(n){return"Server communication indicator"},"controls:addNearMiss":function(n){return"Add near miss"},"controls:addSuggestion":function(n){return"Add suggestion"},"controls:msg:sync:noConnection":function(n){return"Cannot unlock: no connection to the server :("},"controls:msg:sync:remoteError":function(n){return"Cannot unlock: failed to get the key :("},"controls:msg:sync:success":function(n){return"Editing unlocked successfully :)"},"controls:msg:popup":function(n){return"The popup window has been blocked :("},"controls:switchApp":function(n){return"Switch apps/Configure after 3s"},"controls:reboot":function(n){return"Refresh page/Restart after 3s"},"controls:shutdown":function(n){return"Shutdown after 3s"},"unlockDialog:title:unlock":function(n){return"Production line activation"},"unlockDialog:title:lock":function(n){return"Production line deactivation"},"unlockDialog:message:unlock":function(n){return"To activate the <em>"+e.v(n,"prodLine")+"</em> production line, enter login and password of a user with the <em>WMES Operator client activation</em> privilege. Production line cannot be activated, if it is currently connected to the server from another computer."},"unlockDialog:message:lock":function(n){return"To deactivate the <em>"+e.v(n,"prodLine")+"</em> production line, enter login and password of a user with the <em>WMES Operator client activation</em> privilege."},"unlockDialog:login":function(n){return"Login"},"unlockDialog:password":function(n){return"Password"},"unlockDialog:prodLine":function(n){return"Production line"},"unlockDialog:unlock":function(n){return"Activate production line"},"unlockDialog:lock":function(n){return"Deactivate production line"},"unlockDialog:error:UNLOCK_FAILURE":function(n){return"Production line activation failed :("},"unlockDialog:error:LOCK_FAILURE":function(n){return"Production line deactivation failed :("},"unlockDialog:error:INVALID_PROD_LINE":function(n){return"Invalid production line!"},"unlockDialog:error:INVALID_LOGIN":function(n){return"Invalid login!"},"unlockDialog:error:INVALID_PASSWORD":function(n){return"Invalid password!"},"unlockDialog:error:NO_PRIVILEGES":function(n){return"Insufficient privileges!"},"unlockDialog:error:ALREADY_UNLOCKED":function(n){return"Production line is currently running on a different computer!"},"unlockDialog:error:DEACTIVATED":function(n){return"Production line is deactivated!"},"section:data":function(n){return"Production data"},"section:history":function(n){return"History"},"section:quantities":function(n){return"Quantities done"},"section:downtimes":function(n){return"Downtimes"},"section:isa":function(n){return"Storage area"},"section:taktTime":function(n){return"Cycle time"},"property:currentTime":function(n){return"Current time"},"property:shift":function(n){return"Shift"},"property:orgUnit":function(n){return"Subdivision"},"property:master":function(n){return"Master"},"property:master:change":function(n){return"(change)"},"property:master:noData:locked":function(n){return"none"},"property:master:noData:unlocked":function(n){return"(change master)"},"property:leader":function(n){return"Leader"},"property:leader:change":function(n){return"(change)"},"property:leader:noData:locked":function(n){return"none"},"property:leader:noData:unlocked":function(n){return"(change leader)"},"property:operator":function(n){return"Operator"},"property:operator:change":function(n){return"(change)"},"property:operator:noData:locked":function(n){return"none"},"property:operator:noData:unlocked":function(n){return"(change operator)"},"property:orderNo":function(n){return"Order no"},"property:orderNo:change":function(n){return"(change)"},"property:nc12":function(n){return"12NC"},"property:nc12:change":function(n){return"(change)"},"property:productName":function(n){return"Product name"},"property:operationName":function(n){return"Operation name"},"property:taktTime":function(n){return"Takt [s]"},"property:lastTaktTime":function(n){return"Cycle [s]"},"property:avgTaktTime":function(n){return"Avg. Cycle [s]"},"property:workerCountSap":function(n){return"Worker count as per SAP"},"property:createdAt":function(n){return"Started at"},"property:totalQuantityDone":function(n){return"Qty done in order"},"property:quantityDone":function(n){return"Quantity done"},"property:quantityDone:change":function(n){return"(change quantity)"},"property:workerCount":function(n){return"Worker count"},"property:workerCount:change:data":function(n){return"(change count)"},"property:workerCount:change:noData":function(n){return"(set count)"},"action:newOrder":function(n){return"New order"},"action:nextOrder":function(n){return"<i class='fa fa-forward' title='Order queue'></i>"},"action:continueOrder":function(n){return"Continue order"},"action:startDowntime":function(n){return"Downtime"},"action:startBreak":function(n){return"Break"},"action:endDowntime":function(n){return"End downtime"},"action:endWork":function(n){return"End work"},"action:emptyPallet":function(n){return"Empty pallet"},"action:fullPallet":function(n){return"Pallet"},"quantities:column:time":function(n){return"Time"},"quantities:column:planned":function(n){return"Planned"},"quantities:column:actual":function(n){return"Actual"},"quantities:unit":function(n){return"PCE"},"quantities:change":function(n){return"(change)"},"quantities:newValuePlaceholder":function(n){return"New quantity..."},"quantityEditor:title":function(n){return"Quantity done in an hour"},"quantityEditor:label":function(n){return"Quantity done from "+e.v(n,"from")+" to "+e.v(n,"to")+":"},"quantityEditor:submit":function(n){return"Set quantity done"},"quantityEditor:cancel":function(n){return"Cancel"},"personelPicker:title:master":function(n){return"Changing master"},"personelPicker:title:leader":function(n){return"Changing leader"},"personelPicker:title:operator":function(n){return"Changing operator"},"personelPicker:submit":function(n){return"Change employee"},"personelPicker:cancel":function(n){return"Cancel"},"personelPicker:list":function(n){return"Employees recently working on this shift:"},"personelPicker:online:label":function(n){return"Employee:"},"personelPicker:online:placeholder":function(n){return"Search by last name or personnel ID"},"personelPicker:offline:label":function(n){return"Employee:"},"personelPicker:offline:placeholder":function(n){return"Employee's personnel ID"},"personelPicker:offline:warning":function(n){return"No connection to the server. You can only enter the employee's personnel ID."},"orderQueue:title":function(n){return"Setting orders queue"},"orderQueue:message:order":function(n){return"Enter an order number and select an operation to enqueue a next order."},"orderQueue:message:queue":function(n){return"Below is the current orders queue."},"orderQueue:message:empty":function(n){return"The orders queue is empty."},"orderQueue:submit":function(n){return"Set orders queue"},"orderQueue:enqueue":function(n){return"Add to queue"},"orderQueue:clear":function(n){return"Clear queue"},"orderQueue:cancel":function(n){return"Cancel"},"orderQueue:order:label":function(n){return"Order"},"orderQueue:order:placeholder":function(n){return"Search the order by its number..."},"orderQueue:operation:label":function(n){return"Operation"},"orderQueue:operation:placeholder":function(n){return"Choose the operation..."},"newOrderPicker:title":function(n){return"Starting a new order"},"newOrderPicker:title:replacing":function(n){return"Ending the current order"},"newOrderPicker:title:correcting":function(n){return"Correcting the current order"},"newOrderPicker:order:label":function(n){return"New order:"},"newOrderPicker:order:placeholder:no":function(n){return"Enter the new order's no..."},"newOrderPicker:order:placeholder:nc12":function(n){return"Order's 12NC"},"newOrderPicker:operation:label":function(n){return"Operation:"},"newOrderPicker:offline:operation:placeholder":function(n){return"Operation no"},"newOrderPicker:online:operation:placeholder":function(n){return"Choose the new order's operation..."},"newOrderPicker:submit":function(n){return"Start order"},"newOrderPicker:submit:replacing":function(n){return"End the current order and start a new one"},"newOrderPicker:submit:correcting":function(n){return"Correct the current order"},"newOrderPicker:cancel":function(n){return"Cancel"},"newOrderPicker:msg:invalidOrderId:no":function(n){return"Invalid order no :("},"newOrderPicker:msg:invalidOrderId:nc12":function(n){return"Invalid 12NC :("},"newOrderPicker:msg:invalidOperationNo":function(n){return"Invalid operation no :("},"newOrderPicker:msg:searchFailure":function(n){return"Searching orders failed :("},"newOrderPicker:msg:emptyOrder":function(n){return"Order is required."},"newOrderPicker:msg:emptyOperation":function(n){return"Operation is required."},"newOrderPicker:msg:noOperations":function(n){return"The selected order doesn't have any operations. You can manually enter a 4-digit operation no."},"newOrderPicker:online:info:no":function(n){return"Enter the order no and choose an operation from the list to start a new order."},"newOrderPicker:online:info:nc12":function(n){return"Enter the order's 12NC and choose an operation from the list to start a new order."},"newOrderPicker:offline:warning:no":function(n){return"Enter the order no and operation no to start a new order."},"newOrderPicker:offline:warning:nc12":function(n){return"Enter the order's 12NC and operation no to start a new order."},"newOrderPicker:checkData:warning":function(n){return"Starting a new order will finish the current order. Make sure that the <em>Quantity done</em> and <em>Worker count</em> of the current order have correct values, because after starting a new order, you won't be able to change them."},"newOrderPicker:quantityDone":function(n){return"Quantity done in the finished order:"},"newOrderPicker:workerCount":function(n){return"Worker count in the finished order:"},"newOrderPicker:spigot:nc12":function(n){return"Spigot component 12NC"},"newOrderPicker:spigot:placeholder":function(n){return"Scan the component's bar code..."},"newOrderPicker:spigot:invalid":function(n){return"Invalid component 12NC!"},"downtimePicker:title:start":function(n){return"Starting a new downtime"},"downtimePicker:title:edit":function(n){return"Correcting a downtime"},"downtimePicker:submit:start":function(n){return"Start downtime"},"downtimePicker:submit:edit":function(n){return"Correct downtime"},"downtimePicker:cancel":function(n){return"Cancel"},"downtimePicker:reason:label":function(n){return"Downtime reason:"},"downtimePicker:reason:placeholder":function(n){return"Choose a downtime reason..."},"downtimePicker:reasonComment:label":function(n){return"Comment:"},"downtimePicker:reasonComment:placeholder":function(n){return"Optional, additional info..."},"downtimePicker:aor:label":function(n){return"Area of responsibility:"},"downtimePicker:aor:placeholder":function(n){return"Choose an area of responsibility..."},"downtimePicker:msg:emptyReason":function(n){return"Downtime reason is required."},"downtimePicker:msg:emptyAor":function(n){return"Area of responsibility is required."},"downtimePicker:startedAt":function(n){return"Started at"},"downtimePicker:startedAt:now":function(n){return"Now"},"prodDowntime:time":function(n){return"Time"},"prodDowntime:reason":function(n){return"Downtime reason"},"prodDowntime:aor":function(n){return"Area of responsibility"},"endDowntimeDialog:title":function(n){return"Ending downtime confirmation"},"endDowntimeDialog:message":function(n){return"<p>Are you sure you want to end the current downtime?</p>"},"endDowntimeDialog:yes":function(n){return"End the downtime"},"endDowntimeDialog:no":function(n){return"Do not end the downtime"},"continueOrderDialog:title":function(n){return"Order continuation confirmation"},"continueOrderDialog:message":function(n){return"<p>Are you sure you want to start the currently chosen order?</p>"},"continueOrderDialog:yes":function(n){return"Continue the order"},"continueOrderDialog:no":function(n){return"Do not continue the order"},"endWorkDialog:title":function(n){return"Ending work confirmation"},"endWorkDialog:warning":function(n){return"Ending work will finish "+e.s(n,"downtime",{"true":"the current downtime and order",other:"the current order"})+". Make sure that the following fields have correct values, because after ending the work, you won't be able to change them."},"endWorkDialog:quantitiesDone":function(n){return"Quantity done in the "+e.v(n,"hourRange")+" hour:"},"endWorkDialog:quantityDone":function(n){return"Quantity done in the current order:"},"endWorkDialog:workerCount":function(n){return"Worker count in the current order:"},"endWorkDialog:yes":function(n){return"End work"},"endWorkDialog:no":function(n){return"Do not end work"},"endWorkDialog:spigot:nc12":function(n){return"Spigot component 12NC"},"endWorkDialog:spigot:placeholder":function(n){return"Scan the component's bar code..."},"endWorkDialog:spigot:invalid":function(n){return"Invalid component 12NC!"},"unload:downtime":function(n){return"Are you sure you want to close the browser leaving the production line in a state of downtime?\n\nIf you close the browser without Ending work, then the current downtime will be finished at the end of the current shift!"},"unload:order":function(n){return"Are you sure you want to close the browser leaving the production line in a state of working?\n\nIf you close the browser without Ending work, then the current order will be finished at the end of the current shift!"},"isa:header":function(n){return"ISA"},"isa:pickup":function(n){return"Pallet<br>pickup"},"isa:deliver":function(n){return"Pallet<br>delivery"},"isa:deliver:specific":function(n){return"Delivery<span class='production-isa-selectedPalletKind'>"+e.v(n,"palletKind")+"</span>"},"isa:cancel:title":function(n){return"Request cancel confirmation"},"isa:cancel:message":function(n){return"<p>Are you sure you want to cancel the chosen pallet "+e.v(n,"requestType")+" request?</p>"},"isa:cancel:yes":function(n){return"Cancel request"},"isa:cancel:no":function(n){return"Leave active"},"isa:status:idle":function(n){return"No request"},"isa:status:new":function(n){return"Waiting for acceptance"},"isa:status:accepted":function(n){return"In progress"},"spigotChecker:title":function(n){return"Checking the Spigot component"},"spigotChecker:name:label":function(n){return"Component name:"},"spigotChecker:nc12:label":function(n){return"Component 12NC:"},"spigotChecker:nc12:placeholder":function(n){return"Scan the component's bar code..."},"spigotChecker:nc12:invalid":function(n){return"Invalid component 12NC!"},"spigotChecker:submit":function(n){return"Check component"},"spigotChecker:success":function(n){return"The scanned component is valid :)"},"autoDowntimes:remainingTime":function(n){return"starts in "+e.v(n,"time")},"snMessage:scannedValue":function(n){return"Scanned value"},"snMessage:orderNo":function(n){return"Order no"},"snMessage:serialNo":function(n){return"Serial no"},"snMessage:UNKNOWN_CODE":function(n){return"The scanned code does not contain a serial number."},"snMessage:INVALID_STATE:idle":function(n){return"Begin an order to enable the SN scanning."},"snMessage:INVALID_STATE:downtime":function(n){return"Finish the downtime to enable SN scanningthe ."},"snMessage:INVALID_ORDER":function(n){return"Scanned SN from a wrong order."},"snMessage:ALREADY_USED":function(n){return"Scanned SN is already registered."},"snMessage:CHECKING":function(n){return"<span class='fa fa-spinner fa-spin'></span><br>Checking the serial number..."},"snMessage:SERVER_FAILURE":function(n){return"Remote server error while checking the serial number."},"snMessage:SHIFT_NOT_FOUND":function(n){return"Line shift not found."},"snMessage:ORDER_NOT_FOUND":function(n){return"Line order not found."},"snMessage:SUCCESS":function(n){return"Serial number successfully registered."},"taktTime:check:button":function(n){return"Check<br>serial number"},"taktTime:check:title":function(n){return"Serial number checking"},"taktTime:check:orderNo":function(n){return"Order no"},"taktTime:check:serialNo":function(n){return"Item no"},"taktTime:check:submit":function(n){return"Check serial number"},"taktTime:check:list":function(n){return"Show serial number list"},"taktTime:check:help":function(n){return"Specify an order no and an item no of the serial number you would like to check. The serial number to check may also be scanned."},"taktTime:check:checking":function(n){return"<i class='fa fa-spinner fa-spin'></i> Checking the serial number..."},"taktTime:check:local":function(n){return"The specified serial number was already scanned on this production line."},"taktTime:check:remote":function(n){return"The specified serial number was already scanned on line: "+e.v(n,"prodLine")},"taktTime:check:notFound":function(n){return"The specified serial number was not scanned yet."},"taktTime:list:title":function(n){return"List of scanned serial numbers"},"settings:tab:operator":function(n){return"Operator"},"settings:tab:downtimes":function(n){return"Downtimes"},"settings:tab:spigot":function(n){return"Spigot check"},"settings:tab:taktTime":function(n){return"Takt Time"},"settings:initialDowntimeWindow":function(n){return"Time to start the initial downtime on a shift [min]"},"settings:rearmDowntimeReason":function(n){return"Downtime reason with Spigot check"},"settings:spigotLines":function(n){return"Production lines with Spigot check"},"settings:spigotPatterns":function(n){return"Select Spigot component matching one of the following patterns"},"settings:spigotNotPatterns":function(n){return"Ignore the selected component, if it also matches any of the following patterns"},"settings:spigotFinish":function(n){return"Force checking of the Spigot during order finish"},"settings:spigotGroups":function(n){return"12NC groups"},"settings:taktTime:enabled":function(n){return"Serial number scanning"},"settings:taktTime:lines":function(n){return"Limit scanning to the following lines:"},"settings:taktTime:ignoredDowntimes":function(n){return"Ignore the following downtime reasons:"},"settings:taktTime:last":function(n){return"Show Cycle Time of the last PCE"},"settings:taktTime:avg":function(n){return"Show average Cycle Time for the current order"},"settings:taktTime:sap":function(n){return"Show Takt Time for the current order"},"settings:taktTime:coeffs":function(n){return"Operation coefficients"},"settings:taktTime:coeffs:help":function(n){return"Each line should contain order's MRP for which the Takt Time coefficients should be adjusted, followed by names of the operation WorkCenters and values of the coefficients. For example: <code class=multiline>*: *=1.053 PIVATIC5=0.9<br>KE6: *=1 OUTDOOR5=1.1</code>"}},pl:!0}});