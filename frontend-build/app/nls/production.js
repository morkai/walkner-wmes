define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,o,i){return n.c(e,t),e[t]in i?i[e[t]]:(t=n.lc[o](e[t]-r))in i?i[t]:i.other},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"breadcrumbs:base":function(e){return"Operator"},"breadcrumbs:settings":function(e){return"Settings"},"duplicate:title":function(e){return"Duplicate operator form"},"duplicate:message":function(e){return"Detected another operator form already running.<br>Close all other operator forms and click the button below to reload the form in the current window."},"duplicate:button":function(e){return"Reload operator form"},"msg:shiftChange":function(e){return"New shift!"},"msg:locked":function(e){return"Production line was deactivated!"},"controls:dashboard":function(e){return"Go to dashboard"},"controls:lock":function(e){return"Lock the line"},"controls:unlock":function(e){return"Unlock the line"},"controls:locked":function(e){return"Line locked"},"controls:unlocked":function(e){return"Line unlocked"},"controls:sync":function(e){return"Server communication indicator"},"controls:addNearMiss":function(e){return"Add near miss"},"controls:addSuggestion":function(e){return"Add suggestion"},"controls:addObservation":function(e){return"Add observation"},"controls:msg:sync:noConnection":function(e){return"Cannot unlock: no connection to the server."},"controls:msg:sync:remoteError":function(e){return"Cannot unlock: failed to get the key."},"controls:msg:sync:success":function(e){return"Line unlocked successfully."},"controls:msg:popup":function(e){return"The popup window has been blocked."},"controls:mor":function(e){return"Matrix of responsibility"},"unlockDialog:title:unlock":function(e){return"Production line activation"},"unlockDialog:title:lock":function(e){return"Production line deactivation"},"unlockDialog:message:unlock":function(e){return"To activate the <em>"+n.v(e,"prodLine")+"</em> production line, enter login and password of a user with the <em>WMES Operator client activation</em> privilege. Production line cannot be activated, if it is currently connected to the server from another computer."},"unlockDialog:message:lock":function(e){return"To deactivate the <em>"+n.v(e,"prodLine")+"</em> production line, enter login and password of a user with the <em>WMES Operator client activation</em> privilege."},"unlockDialog:login":function(e){return"Login"},"unlockDialog:password":function(e){return"Password"},"unlockDialog:prodLine":function(e){return"Production line"},"unlockDialog:unlock":function(e){return"Activate production line"},"unlockDialog:lock":function(e){return"Deactivate production line"},"unlockDialog:error:UNLOCK_FAILURE":function(e){return"Production line activation failed."},"unlockDialog:error:LOCK_FAILURE":function(e){return"Production line deactivation failed."},"unlockDialog:error:INVALID_PROD_LINE":function(e){return"Invalid production line!"},"unlockDialog:error:INVALID_LOGIN":function(e){return"Invalid login!"},"unlockDialog:error:INVALID_PASSWORD":function(e){return"Invalid password!"},"unlockDialog:error:NO_PRIVILEGES":function(e){return"Insufficient privileges!"},"unlockDialog:error:ALREADY_UNLOCKED":function(e){return"Production line is currently running on a different computer!"},"unlockDialog:error:DEACTIVATED":function(e){return"Production line is deactivated!"},"section:data":function(e){return"Production data"},"section:history":function(e){return"History"},"section:quantities":function(e){return"Quantities done"},"section:downtimes":function(e){return"Downtimes"},"section:isa":function(e){return"Storage area"},"section:taktTime":function(e){return"Cycle time"},"property:currentTime":function(e){return"Current time"},"property:shift":function(e){return"Shift"},"property:orgUnit":function(e){return"Subdivision"},"property:master":function(e){return"Master"},"property:master:change":function(e){return"(change)"},"property:master:noData:locked":function(e){return"none"},"property:master:noData:unlocked":function(e){return"(change master)"},"property:leader":function(e){return"Leader"},"property:leader:change":function(e){return"(change)"},"property:leader:noData:locked":function(e){return"none"},"property:leader:noData:unlocked":function(e){return"(change leader)"},"property:operator":function(e){return"Operator"},"property:operator:change":function(e){return"(change)"},"property:operator:noData:locked":function(e){return"none"},"property:operator:noData:unlocked":function(e){return"(change operator)"},"property:orderNo":function(e){return"Order no"},"property:orderNo:change":function(e){return"(change)"},"property:nc12":function(e){return"12NC"},"property:nc12:change":function(e){return"(change)"},"property:productName":function(e){return"Product name"},"property:operationName":function(e){return"Operation name"},"property:taktTime":function(e){return"Takt [s]"},"property:taktTime:checkSn":function(e){return"(check SN)"},"property:lastTaktTime":function(e){return"Cycle [s]"},"property:avgTaktTime":function(e){return"Avg. Cycle [s]"},"property:workerCountSap":function(e){return"Worker count as per SAP"},"property:createdAt":function(e){return"Started at"},"property:totalQuantityDone":function(e){return"Qty done in order"},"property:quantityDone":function(e){return"Quantity done"},"property:quantityDone:change":function(e){return"(change quantity)"},"property:workerCount":function(e){return"Worker count"},"property:workerCount:change:data":function(e){return"(change count)"},"property:workerCount:change:noData":function(e){return"(set count)"},"action:newOrder":function(e){return"New order"},"action:nextOrder":function(e){return"<i class='fa fa-forward' title='Order queue'></i>"},"action:continueOrder":function(e){return"Continue order"},"action:startDowntime":function(e){return"Downtime"},"action:startBreak":function(e){return"Break"},"action:endDowntime":function(e){return"End downtime"},"action:endWork":function(e){return"End work"},"action:emptyPallet":function(e){return"Empty pallet"},"action:fullPallet":function(e){return"Pallet"},"quantities:column:time":function(e){return"Time"},"quantities:column:planned":function(e){return"Planned"},"quantities:column:actual":function(e){return"Actual"},"quantities:unit":function(e){return"PCE"},"quantities:change":function(e){return"(change)"},"quantities:newValuePlaceholder":function(e){return"New quantity..."},"quantityEditor:title":function(e){return"Quantity done in an hour"},"quantityEditor:label:hour":function(e){return"Time:"},"quantityEditor:label:value":function(e){return"Quantity done:"},"quantityEditor:submit":function(e){return"Set quantity done"},"quantityEditor:cancel":function(e){return"Cancel"},"quantityEditor:maxQuantity":function(e){return"Value cannot be greater than "+n.v(e,"max")+"."},"personnelPicker:title:master":function(e){return"Changing master"},"personnelPicker:title:leader":function(e){return"Changing leader"},"personnelPicker:title:operator":function(e){return"Changing operator"},"personnelPicker:submit":function(e){return"Set employee"},"personnelPicker:cancel":function(e){return"Cancel"},"personnelPicker:recent":function(e){return"Employees working on this shift recently:"},"personnelPicker:matching":function(e){return"Matching employees:"},"personnelPicker:tooShort":function(e){return"Enter at least three initial letters of the employee's last name."},"personnelPicker:notFound":function(e){return"No matching employees were found."},"personnelPicker:online:label":function(e){return"Employee:"},"personnelPicker:offline:label":function(e){return"Employee:"},"personnelPicker:offline:warning":function(e){return"No connection to the server. You can only enter the employee's personnel ID."},"personnelPicker:embedded:label":function(e){return"Search employees by last name:"},"multiPersonnelPicker:title:operator":function(e){return"Changing operators"},"multiPersonnelPicker:submit":function(e){return"Set employees"},"multiPersonnelPicker:cancel":function(e){return"Cancel"},"multiPersonnelPicker:pick":function(e){return"Add employee"},"multiPersonnelPicker:back":function(e){return"Back to list"},"multiPersonnelPicker:recent":function(e){return"Employees working on this shift recently:"},"multiPersonnelPicker:matches":function(e){return"Matching employees:"},"multiPersonnelPicker:tooShort":function(e){return"Enter at least three initial letters of the employee's last name."},"multiPersonnelPicker:notFound":function(e){return"No matching employees were found."},"multiPersonnelPicker:empty":function(e){return"No employees were set for the current shift yet."},"multiPersonnelPicker:picked":function(e){return"Selected employees:"},"multiPersonnelPicker:online:label":function(e){return"New employee:"},"multiPersonnelPicker:offline:label":function(e){return"New employee's personnel ID:"},"multiPersonnelPicker:offline:warning":function(e){return"No connection to the server. You can only enter the employee's personnel ID."},"multiPersonnelPicker:embedded:label":function(e){return"Search employees by last name:"},"orderQueue:title":function(e){return"Setting orders queue"},"orderQueue:message:order":function(e){return"Enter an order number and select an operation to enqueue a next order."},"orderQueue:message:queue":function(e){return"Below is the current orders queue."},"orderQueue:message:empty":function(e){return"The orders queue is empty."},"orderQueue:submit":function(e){return"Set orders queue"},"orderQueue:enqueue":function(e){return"Add to queue"},"orderQueue:clear":function(e){return"Clear queue"},"orderQueue:cancel":function(e){return"Cancel"},"orderQueue:order:label":function(e){return"Order"},"orderQueue:order:placeholder":function(e){return"Search the order by its number..."},"orderQueue:operation:label":function(e){return"Operation"},"orderQueue:operation:placeholder":function(e){return"Choose the operation..."},"newOrderPicker:title":function(e){return"Starting a new order"},"newOrderPicker:title:replacing":function(e){return"Ending the current order"},"newOrderPicker:title:correcting":function(e){return"Correcting the current order"},"newOrderPicker:order:label:no":function(e){return"New order's number:"},"newOrderPicker:order:label:nc12":function(e){return"New order's 12NC:"},"newOrderPicker:order:placeholder:no":function(e){return"Enter the new order's no..."},"newOrderPicker:order:placeholder:nc12":function(e){return"Enter the new order's 12NC..."},"newOrderPicker:order:tooShort":function(e){return"Enter a full, 9-digit order number."},"newOrderPicker:order:notFound":function(e){return"The specified order doesn't exist."},"newOrderPicker:operation:label:online":function(e){return"Operation:"},"newOrderPicker:operation:label:offline":function(e){return"Operation number:"},"newOrderPicker:operation:placeholder":function(e){return"Choose the new order's operation..."},"newOrderPicker:submit":function(e){return"Start order"},"newOrderPicker:submit:replacing":function(e){return"Start order"},"newOrderPicker:submit:correcting":function(e){return"Correct order"},"newOrderPicker:cancel":function(e){return"Cancel"},"newOrderPicker:msg:invalidOrderId:no":function(e){return"Invalid order no."},"newOrderPicker:msg:invalidOrderId:nc12":function(e){return"Invalid 12NC."},"newOrderPicker:msg:invalidOperationNo":function(e){return"Invalid operation no."},"newOrderPicker:msg:searchFailure":function(e){return"Searching orders failed."},"newOrderPicker:msg:emptyOrder":function(e){return"Order is required."},"newOrderPicker:msg:emptyOperation":function(e){return"Operation is required."},"newOrderPicker:msg:noOperations":function(e){return"The selected order doesn't have any operations. You can manually enter a 4-digit operation no."},"newOrderPicker:online:info:no":function(e){return"Enter the order no and choose an operation from the list to start a new order."},"newOrderPicker:online:info:nc12":function(e){return"Enter the order's 12NC and choose an operation from the list to start a new order."},"newOrderPicker:offline:warning:no":function(e){return"Enter the order no and operation no to start a new order."},"newOrderPicker:offline:warning:nc12":function(e){return"Enter the order's 12NC and operation no to start a new order."},"newOrderPicker:checkData:warning":function(e){return"Starting a new order will finish the current order. Make sure that the <em>Quantity done</em> and <em>Worker count</em> of the current order have correct values, because after starting a new order, you won't be able to change them."},"newOrderPicker:quantityDone":function(e){return"Quantity done in the finished order:"},"newOrderPicker:workerCount":function(e){return"Worker count in the finished order:"},"newOrderPicker:newWorkerCount":function(e){return"Worker count:"},"newOrderPicker:spigot:nc12":function(e){return"Spigot component 12NC"},"newOrderPicker:spigot:placeholder":function(e){return"Scan the component's bar code..."},"newOrderPicker:spigot:invalid":function(e){return"Invalid component 12NC!"},"error:min":function(e){return"Value cannot be less than "+n.v(e,"min")+"."},"error:max":function(e){return"Value cannot be greater than "+n.v(e,"max")+"."},"downtimePicker:title:start":function(e){return"Starting a new downtime"},"downtimePicker:title:edit":function(e){return"Correcting a downtime"},"downtimePicker:submit:start":function(e){return"Start downtime"},"downtimePicker:submit:edit":function(e){return"Correct downtime"},"downtimePicker:cancel":function(e){return"Cancel"},"downtimePicker:reason:label":function(e){return"Downtime reason:"},"downtimePicker:reason:placeholder":function(e){return"Choose a downtime reason..."},"downtimePicker:reasonFilter:placeholder":function(e){return"Downtime reason..."},"downtimePicker:reasonComment:label":function(e){return"Comment:"},"downtimePicker:reasonComment:placeholder":function(e){return"Optional, additional info..."},"downtimePicker:aor:label":function(e){return"Area of responsibility:"},"downtimePicker:aor:placeholder":function(e){return"Choose an area of responsibility..."},"downtimePicker:aorFilter:placeholder":function(e){return"Area of responsibility..."},"downtimePicker:msg:emptyReason":function(e){return"Downtime reason is required."},"downtimePicker:msg:emptyAor":function(e){return"Area of responsibility is required."},"downtimePicker:startedAt":function(e){return"Started at"},"downtimePicker:startedAt:now":function(e){return"Now"},"prodDowntime:time":function(e){return"Time"},"prodDowntime:reason":function(e){return"Downtime reason"},"prodDowntime:aor":function(e){return"Area of responsibility"},"endDowntimeDialog:title":function(e){return"Ending downtime confirmation"},"endDowntimeDialog:message":function(e){return"<p>Are you sure you want to end the current downtime?</p>"},"endDowntimeDialog:yes":function(e){return"End the downtime"},"endDowntimeDialog:no":function(e){return"Do not end the downtime"},"continueOrderDialog:title":function(e){return"Order continuation confirmation"},"continueOrderDialog:message":function(e){return"<p>Are you sure you want to start the currently chosen order?</p>"},"continueOrderDialog:yes":function(e){return"Continue the order"},"continueOrderDialog:no":function(e){return"Do not continue the order"},"endWorkDialog:title":function(e){return"Ending work confirmation"},"endWorkDialog:warning":function(e){return"Ending work will finish "+n.s(e,"downtime",{true:"the current downtime and order",other:"the current order"})+". Make sure that the following fields have correct values, because after ending the work, you won't be able to change them."},"endWorkDialog:quantitiesDone":function(e){return"Quantity done in the "+n.v(e,"hourRange")+" hour:"},"endWorkDialog:quantityDone":function(e){return"Quantity done in the current order:"},"endWorkDialog:workerCount":function(e){return"Worker count in the current order:"},"endWorkDialog:yes":function(e){return"End work"},"endWorkDialog:no":function(e){return"Do not end work"},"endWorkDialog:spigot:nc12":function(e){return"Spigot component 12NC"},"endWorkDialog:spigot:placeholder":function(e){return"Scan the component's bar code..."},"endWorkDialog:spigot:invalid":function(e){return"Invalid component 12NC!"},"propertyEditorDialog:title:quantityDone":function(e){return"Changing quantity done"},"propertyEditorDialog:label:quantityDone":function(e){return"Quantity done in the current order"},"propertyEditorDialog:title:workerCount":function(e){return"Changing worker count"},"propertyEditorDialog:label:workerCount":function(e){return"Worker count in the current order"},"propertyEditorDialog:yes":function(e){return"Set value"},"propertyEditorDialog:no":function(e){return"Cancel"},"unload:downtime":function(e){return"Are you sure you want to close the browser leaving the production line in a state of downtime?\n\nIf you close the browser without Ending work, then the current downtime will be finished at the end of the current shift!"},"unload:order":function(e){return"Are you sure you want to close the browser leaving the production line in a state of working?\n\nIf you close the browser without Ending work, then the current order will be finished at the end of the current shift!"},"isa:header":function(e){return"ISA"},"isa:pickup":function(e){return"Pallet<br>pickup"},"isa:deliver":function(e){return"Pallet<br>delivery"},"isa:deliver:specific":function(e){return"Delivery <span class='production-isa-selectedQty'>"+n.v(e,"qty")+"x</span><span class='production-isa-selectedPalletKind'>"+n.v(e,"palletKind")+"</span>"},"isa:deliver:title":function(e){return"Pallet delivery"},"isa:deliver:qty":function(e){return"Pallet quantity"},"isa:deliver:palletKind":function(e){return"Pallet kind"},"isa:deliver:submit":function(e){return"Request delivery"},"isa:deliver:cancel":function(e){return"Cancel"},"isa:cancel:title":function(e){return"Request cancel confirmation"},"isa:cancel:message":function(e){return"<p>Are you sure you want to cancel the chosen pallet "+n.v(e,"requestType")+" request?</p>"},"isa:cancel:yes":function(e){return"Cancel request"},"isa:cancel:no":function(e){return"Leave active"},"isa:status:idle":function(e){return"No request"},"isa:status:new":function(e){return"Waiting for acceptance"},"isa:status:accepted":function(e){return"In progress"},"spigotChecker:title":function(e){return"Checking the Spigot component"},"spigotChecker:name:label":function(e){return"Component name:"},"spigotChecker:nc12:label":function(e){return"Component 12NC:"},"spigotChecker:nc12:placeholder":function(e){return"Scan the component's bar code..."},"spigotChecker:nc12:invalid":function(e){return"Invalid component 12NC!"},"spigotChecker:submit":function(e){return"Check component"},"spigotChecker:success":function(e){return"The scanned component is valid."},"autoDowntimes:remainingTime":function(e){return"starts in "+n.v(e,"time")},"snMessage:scannedValue":function(e){return"Scanned value"},"snMessage:orderNo":function(e){return"Order no"},"snMessage:serialNo":function(e){return"Serial no"},"snMessage:UNKNOWN_CODE":function(e){return"The scanned code does not contain a serial number."},"snMessage:INVALID_LINE":function(e){return"Invalid production line."},"snMessage:INVALID_LINE_STATE":function(e){return"Invalid production shift or order."},"snMessage:INVALID_STATE:idle":function(e){return"Begin an order to enable the SN scanning."},"snMessage:INVALID_STATE:downtime":function(e){return"Finish the downtime to enable SN scanningthe ."},"snMessage:INVALID_ORDER":function(e){return"Scanned SN from a wrong order."},"snMessage:ALREADY_USED":function(e){return"Scanned SN is already registered."},"snMessage:CHECKING":function(e){return"<span class='fa fa-spinner fa-spin'></span><br>Checking the serial number..."},"snMessage:SERVER_FAILURE":function(e){return"Remote server error while checking the serial number."},"snMessage:SHIFT_NOT_FOUND":function(e){return"Line shift not found."},"snMessage:ORDER_NOT_FOUND":function(e){return"Line order not found."},"snMessage:STANDARD_LABEL":function(e){return"The virtual SN cannot be used in this order."},"snMessage:SUCCESS":function(e){return"Serial number successfully registered."},"bomChecker:title":function(e){return"Checking components"},"bomChecker:message:todo":function(e){return"Scan the component label."},"bomChecker:message:checking":function(e){return"Checking the component..."},"bomChecker:message:success":function(e){return"Correct component!"},"bomChecker:message:failure":function(e){return"Failed to check the component."},"bomChecker:message:todo:sn":function(e){return"Scan the product label."},"bomChecker:message:checking:sn":function(e){return"Checking the serial number..."},"bomChecker:message:success:sn":function(e){return"Correct serial number!"},"bomChecker:message:failure:sn":function(e){return"Failed to check the serial number."},"bomChecker:message:nc12":function(e){return"12NC mismatch: "+n.v(e,"nc12")},"bomChecker:message:used":function(e){return"Code already used in: "+n.v(e,"psn")},"bomChecker:message:used:sn":function(e){return"Serial number already used."},"snMessage:BOM_CHECKER:NO_MATCH":function(e){return"Code does not match any component."},"taktTime:check:button":function(e){return"Check<br>serial number"},"taktTime:check:title":function(e){return"Serial number checking"},"taktTime:check:orderNo":function(e){return"Order no"},"taktTime:check:serialNo":function(e){return"Item no"},"taktTime:check:submit":function(e){return"Check serial number"},"taktTime:check:list":function(e){return"Show serial number list"},"taktTime:check:help":function(e){return"Specify an order no and an item no of the serial number you would like to check. The serial number to check may also be scanned."},"taktTime:check:checking":function(e){return"<i class='fa fa-spinner fa-spin'></i> Checking the serial number..."},"taktTime:check:local":function(e){return"The specified serial number was already scanned on this production line."},"taktTime:check:remote":function(e){return"The specified serial number was already scanned on line: "+n.v(e,"prodLine")},"taktTime:check:notFound":function(e){return"The specified serial number was not scanned yet."},"taktTime:list:title":function(e){return"List of scanned serial numbers"},"execution:todo":function(e){return"Plan"},"execution:done":function(e){return"Done"},"execution:order:label":function(e){return n.v(e,"orderId")+", "+n.v(e,"quantityDone")+" PCE"},"execution:order:orderNo":function(e){return"Order"},"execution:order:operationNo":function(e){return"Operation"},"execution:order:startedAt":function(e){return"Started at"},"execution:order:finishedAt":function(e){return"Finished at"},"execution:order:quantityDone":function(e){return"Quantity"},"execution:order:workerCount":function(e){return"Worker count"},"execution:downtime:label":function(e){return n.v(e,"reason")},"execution:downtime:reason":function(e){return"Reason"},"execution:downtime:aor":function(e){return"AOR"},"execution:downtime:startedAt":function(e){return"Started at"},"execution:downtime:finishedAt":function(e){return"Finished at"},"settings:tab:operator":function(e){return"Operator"},"settings:tab:downtimes":function(e){return"Downtimes"},"settings:tab:spigot":function(e){return"Spigot check"},"settings:tab:bomChecker":function(e){return"Component check"},"settings:tab:taktTime":function(e){return"Takt Time"},"settings:initialDowntimeWindow":function(e){return"Time to start the initial downtime on a shift [min]"},"settings:rearmDowntimeReason":function(e){return"Downtime reason with Spigot check"},"settings:spigotLines":function(e){return"Production lines with Spigot check"},"settings:spigotPatterns":function(e){return"Select Spigot component matching one of the following patterns"},"settings:spigotNotPatterns":function(e){return"Ignore the selected component, if it also matches any of the following patterns"},"settings:spigotFinish":function(e){return"Force checking of the Spigot during order finish"},"settings:spigotGroups":function(e){return"12NC groups of Spigots"},"settings:spigotGroups:help":function(e){return"Assignment of Spigot component 12NCs to 12NCs scanned by the Operators. Required format: <code>$scanned_12NC: $spigot_12NC_1, $spigot_12NC_2, ...</code> (each scanned 12NC must be on a separate line)."},"settings:spigotInsertGroups":function(e){return"12NC groups of Inserts"},"settings:spigotInsertGroups:help":function(e){return"Assignment of product 12NCs to 12NCs scanned by the Operators. Required format: <code>$scanned_12NC: $product_NC12_1, $product_NC12_2, ...</code> (each scanned 12NC must be on a separate line)."},"settings:taktTime:enabled":function(e){return"Serial number scanning"},"settings:taktTime:lines":function(e){return"Ignore scanning on the following lines:"},"settings:taktTime:ignoredDowntimes":function(e){return"Ignore the following downtime reasons:"},"settings:taktTime:last":function(e){return"Show Cycle Time of the last PCE"},"settings:taktTime:avg":function(e){return"Show average Cycle Time for the current order"},"settings:taktTime:sap":function(e){return"Show Takt Time for the current order"},"settings:taktTime:smiley":function(e){return"Show smiley"},"settings:taktTime:coeffs":function(e){return"Operation coefficients"},"settings:taktTime:coeffs:help":function(e){return"Each line should contain order's MRP for which the Takt Time coefficients should be adjusted, followed by names of the operation WorkCenters and values of the coefficients. For example: <code class=multiline>*: *=1.053 PIVATIC5=0.9<br>KE6: *=1 OUTDOOR5=1.1</code>"},"settings:lineAutoDowntimes":function(e){return"Automatic downtimes"},"settings:lineAutoDowntimes:groups:placeholder":function(e){return"Choose an existing production line group to change its auto downtimes."},"settings:lineAutoDowntimes:groups:label":function(e){return"Auto downtime groups"},"settings:lineAutoDowntimes:group:label":function(e){return"Group name"},"settings:lineAutoDowntimes:reasons:placeholder":function(e){return"Choose a new auto downtime reason"},"settings:lineAutoDowntimes:lines:label":function(e){return"Production lines in the group"},"settings:lineAutoDowntimes:reason":function(e){return"Auto downtime reason"},"settings:lineAutoDowntimes:init":function(e){return"Initialization"},"settings:lineAutoDowntimes:when:initial":function(e){return"only shift start"},"settings:lineAutoDowntimes:when:always":function(e){return"always"},"settings:lineAutoDowntimes:when:time":function(e){return"at:"}},pl:!0}});