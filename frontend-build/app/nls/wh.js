define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[i](n[t]-r))in o?o[t]:o.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMB:base":function(n){return"WH (new)"},"BREADCRUMB:pickup":function(n){return"Pickup"},"BREADCRUMB:dist:components":function(n){return"FIFO delivery"},"BREADCRUMB:dist:packaging":function(n){return"Packaging delivery"},"BREADCRUMB:problems":function(n){return"Problems"},"BREADCRUMB:settings":function(n){return"Settings"},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generating the plan...</span>"},"msg:genericFailure":function(n){return"<p>Failed to execute action.</p><p>"+e.v(n,"errorCode")+"</p>"},"msg:connectionFailure":function(n){return"<p>Lost connection while resolving the next action.</p><p>Check whether you're connected to the network and try again.</p>"},"msg:resolvingAction":function(n){return"<p>Resolving the next action for:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:resolveAction:403":function(n){return"<p>No permissions to execute actions.</p>"},"msg:USER_NOT_FOUND":function(n){return"<p>User not found:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:NO_PENDING_ORDERS":function(n){return"<p>No pending orders found.</p>"},"msg:INVALID_FUNC":function(n){return"<p>Invalid user function.</p>"},"msg:delivered":function(n){return"<p>Delivery finished successfully.</p>"},"msg:nothingToDeliver":function(n){return"<p>No carts awaiting delivery.</p>"},"msg:switchingPlan":function(n){return"<p>Switching plan to:</p><p>"+e.v(n,"newDate")+"</p>"},"PAGE_ACTION:dailyPlan":function(n){return"Daily plan"},"PAGE_ACTION:old":function(n){return"Old module"},"PAGE_ACTION:legend":function(n){return"Legend"},"PAGE_ACTION:pickup":function(n){return"Pickup"},"PAGE_ACTION:problems":function(n){return"Problems"},"PAGE_ACTION:settings":function(n){return"Settings"},"PAGE_ACTION:resolveAction:title":function(n){return"Enter a card ID to resolve the next action"},"PAGE_ACTION:resolveAction:placeholder":function(n){return"Card ID"},"filter:whStatuses":function(n){return"Stage"},"filter:psStatuses":function(n){return"Paint-shop status"},"filter:date":function(n){return"Plan date"},"filter:startTime":function(n){return"Start"},"filter:useDarkerTheme":function(n){return"High contrast"},empty:function(n){return"No plan for the specified filters."},"prop:group":function(n){return"Gr."},"prop:no":function(n){return"No"},"prop:shift":function(n){return"Sh."},"prop:date":function(n){return"Date"},"prop:set":function(n){return"Set"},"prop:mrp":function(n){return"MRP"},"prop:line":function(n){return"Line"},"prop:order":function(n){return"Order"},"prop:product":function(n){return"Product"},"prop:planStatus":function(n){return"Status"},"prop:whStatus":function(n){return"Stage"},"prop:fifoStatus":function(n){return"FIFO"},"prop:packStatus":function(n){return"Pack."},"prop:nc12":function(n){return"12NC"},"prop:name":function(n){return"Product name"},"prop:qty":function(n){return"Quantity"},"prop:qtyPlan":function(n){return"Quantity planned"},"prop:qtyTodo":function(n){return"Quantity todo"},"prop:startTime":function(n){return"Start"},"prop:finishTime":function(n){return"Finish"},"prop:time":function(n){return"Time"},"prop:comment":function(n){return"Comment"},"prop:problem":function(n){return"Problem"},"prop:picklist":function(n){return"LP10"},"prop:fmx":function(n){return"FMX"},"prop:kitter":function(n){return"Kitter"},"prop:platformer":function(n){return"Plat."},"prop:packer":function(n){return"Packer"},"prop:carts":function(n){return"Carts"},"prop:user":function(n){return"Warehouseman"},"prop:problemArea":function(n){return"Problem area"},"prop:status":function(n){return"Status"},"prop:pickup":function(n){return"Pickup"},"prop:delivery":function(n){return"Delivery"},"func:fmx":function(n){return"FMX"},"func:kitter":function(n){return"Kitter"},"func:platformer":function(n){return"Platformowy"},"func:packer":function(n){return"Packer"},"func:dist-components":function(n){return"FIFO delivery"},"func:dist-packaging":function(n){return"Packaging delivery"},"status:picklistDone:pending":function(n){return"Transaction pending"},"status:picklistDone:progress":function(n){return"Transaction in progress"},"status:picklistDone:success":function(n){return"Transaction completed"},"status:picklistDone:failure":function(n){return"Transaction failed"},"status:pending":function(n){return"Pending"},"status:started":function(n){return"Started"},"status:finished":function(n){return"Finished"},"status:picklist":function(n){return"Picklist"},"status:pickup":function(n){return"Pickup"},"status:problem":function(n){return"Problem"},"status:cancelled":function(n){return"Cancelled"},"status:ignored":function(n){return"Ignored"},"menu:shiftOrder":function(n){return"Open production shift order"},"menu:copy:all":function(n){return"Copy order list"},"menu:copy:lineGroup":function(n){return"Copy order list for <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:copy:lineGroupNo":function(n){return"Copy order numbers for <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:cancelOrder":function(n){return"Cancel order"},"menu:cancelSet":function(n){return"Cancel set"},"menu:restoreOrder":function(n){return"Restore order"},"menu:restoreSet":function(n){return"Restore set"},"menu:resetOrder":function(n){return"Reset order"},"menu:resetSet":function(n){return"Reset set"},"settings:tab:planning":function(n){return"Planning"},"settings:tab:pickup":function(n){return"Pickup"},"settings:tab:delivery":function(n){return"Delivery"},"settings:tab:users":function(n){return"Users"},"settings:planning:ignorePsStatus":function(n){return"Ignore paint-shop status during completion"},"settings:planning:groupDuration":function(n){return"Order group duration [h]"},"settings:planning:groupExtraItems":function(n){return"Minimum quantity in group"},"settings:planning:groupExtraItems:help":function(n){return"If quantity of an order in the first/last group of a given line is lower or equal to the specified value, then that group will be merged with the next/previous group."},"settings:planning:ignoredMrps":function(n){return"Ignored MRPs"},"settings:planning:ignoredMrps:help":function(n){return"Orders with one of the following MRP won't show up on the pickup list."},"settings:planning:enabledMrps":function(n){return"Enabled MRPs"},"settings:planning:enabledMrps:help":function(n){return"Only orders with one of the following MRP will be taken into account when a new set is being created."},"settings:planning:maxSetSize":function(n){return"Maximum number of orders in a set"},"settings:planning:minSetDuration":function(n){return"Minimum set duration [min]"},"settings:planning:minSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes to be extended by an order that exceeds the <em>Order group duration</em>."},"settings:planning:maxSetDuration":function(n){return"Maximum set duration [min]"},"settings:planning:maxSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes."},"settings:planning:maxSetDifference":function(n){return"Maximum set time difference [min]"},"settings:planning:maxSetDifference:help":function(n){return"Set creation will stop, if the difference between the start time of the next potential order to the finish time of the set's last order is greater than the specified number of minutes."},"settings:planning:minPickupDowntime":function(n){return"Maximum time between pickups [s]"},"settings:planning:minPickupDowntime:help":function(n){return"Minimum time that has to pass between an end of the last pickup and a start of the new pickup to register a downtime."},"settings:planning:maxPickupDowntime":function(n){return"Maximum downtime duration [min]"},"settings:planning:maxPickupDowntime:help":function(n){return"If a duration of the potential downtime is greater than the specified value, the downtime is not saved."},"settings:planning:maxSetsPerLine":function(n){return"Maximum number of completed sets per line"},"settings:planning:minTimeForDelivery":function(n){return"Time for delivery [min]"},"settings:planning:minTimeForDelivery:help":function(n){return"Carts for lines which have less available time than the specified value will be marked as awaiting delivery."},"settings:planning:lateDeliveryTime":function(n){return"Time for late delivery [min]"},"settings:planning:lateDeliveryTime:help":function(n){return"Carts for lines which have less available time than the specified value will have a red background."},"settings:planning:minDeliveryDowntime":function(n){return"Maximum time between deliveries [s]"},"settings:planning:minDeliveryDowntime:help":function(n){return"Minimum time that has to pass between an end of the last delivery and a start of the new delivery to register a downtime."},"settings:planning:maxDeliveryDowntime":function(n){return"Maximum downtime duration [min]"},"settings:planning:maxDeliveryDowntime:help":function(n){return"If a duration of the potential downtime is greater than the specified value, the downtime is not saved."},"settings:planning:maxSetCartsPerDelivery":function(n){return"Maximum FIFO carts per delivery"},"settings:planning:maxSetCartsPerDelivery:help":function(n){return"Maximum number of FIFO carts that can be assigned for delivery to a user at once."},"settings:planning:maxDeliveryStartTime":function(n){return"Maximum time to order start [min]"},"settings:planning:maxDeliveryStartTime:help":function(n){return"Maximum minutes from now to the planned order start time to mark a cart as pending delivery, if its line is currently not working."},"set:title":function(n){return"Order set no "+e.v(n,"set")+" for line "+e.v(n,"line")},"set:cartsEditor:carts":function(n){return"Carts..."},"set:cartsEditor:used:error":function(n){return e.p(n,"count",0,"en",{one:"Cart already in use:",other:"Carts already in use:"})},"set:cartsEditor:used:cart":function(n){return e.v(n,"cart")+" ("+e.v(n,"date")+", set "+e.v(n,"set")+")"},"set:problemEditor:problemArea":function(n){return"Problem areas..."},"set:problemEditor:comment":function(n){return"Comment..."},"menu:picklistDone:success":function(n){return"Transaction succeeded"},"menu:picklistDone:failure":function(n){return"Transaction failed"},"menu:picklistDone:pending":function(n){return"Reset status"},"menu:picklist:require":function(n){return"Picklist printed"},"menu:picklist:ignore":function(n){return"Ignore pickup"},"menu:picklist:pending":function(n){return"Reset status"},"menu:pickup:success":function(n){return"Pickup succeeded"},"menu:pickup:failure":function(n){return"Pickup failed"},"menu:pickup:pending":function(n){return"Reset status"},"menu:pickup:editCarts":function(n){return"Change carts"},"update:failure":function(n){return"Failed to execute action."},"update:FIFO_IGNORED":function(n){return"FIFO pickup cannot be ignored."},"update:ALL_IGNORED":function(n){return"Pickup cannot be ignored completely."},"printLabels:failure":function(n){return"Failed to print labels."},"list:popover:picklist":function(n){return"LP10"},"list:popover:fmx":function(n){return"FMX"},"list:popover:kitter":function(n){return"Kitter"},"list:popover:platformer":function(n){return"Platformer"},"list:popover:packer":function(n){return"Packer"},"list:popover:status":function(n){return"Status"},"list:popover:user":function(n){return"Warehouseman"},"list:popover:fifoStatus":function(n){return"FIFO delivery"},"list:popover:packStatus":function(n){return"Packaging delivery"},"list:popover:qty":function(n){return"Quantity"},"list:popover:line":function(n){return"Line"},"problem:empty":function(n){return"No problems!"},"problem:title":function(n){return"Problem details for order "+e.v(n,"orderNo")+" on line "+e.v(n,"line")},"problem:menu:solveProblem":function(n){return"Solve problem"},"problem:menu:resetOrder":function(n){return"Reset order"},"problem:menu:cancelOrder":function(n){return"Cancel order"},"problem:editor:comment":function(n){return"Comment..."},"problem:editor:carts":function(n){return"Carts..."},"problem:editor:resetOrder:yes":function(n){return"Reset order"},"problem:editor:resetOrder:no":function(n){return"Do not reset"},"problem:editor:resetOrder:message":function(n){return"Reset pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"problem:editor:cancelOrder:yes":function(n){return"Cancel order"},"problem:editor:cancelOrder:no":function(n){return"Do not cancel"},"problem:editor:cancelOrder:message":function(n){return"Cancelled pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"problem:editor:solveProblem:yes":function(n){return"Solve problem"},"problem:editor:solveProblem:no":function(n){return"Do not solve"},"problem:editor:solveProblem:message":function(n){return"Solved "+e.s(n,"func",{fmx:"FMX's",kitter:"Kitter's",packer:"Packer's",other:"LP10"})+" problem with a pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"downtimePicker:title":function(n){return"Downtime"},"downtimePicker:submit":function(n){return"Choose downtime reason"},"downtimePicker:cancel":function(n){return"Cancel"},"downtimePicker:reason":function(n){return"Downtime reason"},"downtimePicker:comment":function(n){return"Comment"},"pickup:status:fmx":function(n){return"FMX"},"pickup:status:kitter":function(n){return"Kitter"},"pickup:status:platformer":function(n){return"Platformer"},"pickup:status:packer":function(n){return"Packer"},"delivery:title:completed":function(n){return"Completed "+e.s(n,"kind",{components:"FIFO",packaging:"pack.",other:""})},"delivery:title:pending":function(n){return"Pending"},"delivery:title:delivering":function(n){return"Delivering"},"delivery:set":function(n){return"Set "+e.v(n,"set")},"delivery:set:title":function(n){return"Delivering "+e.s(n,"kind",{components:"FIFO",packaging:"packaging",other:""})+" carts"},"delivery:set:finish":function(n){return"Finish delivery"},"delivery:set:cancel":function(n){return"Close"},"delivery:set:msg":function(n){return"Scan again to finish the delivery."},"delivery:set:cart":function(n){return"Cart"},"delivery:set:line":function(n){return"Line"},"delivery:set:date":function(n){return"Plan"},"delivery:set:set":function(n){return"Set"},"delivery:set:sapOrders":function(n){return"Orders"}},pl:!0}});