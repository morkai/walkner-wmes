define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,o){return e.c(n,t),n[t]in o?o[n[t]]:(t=e.lc[i](n[t]-r))in o?o[t]:o.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMB:base":function(n){return"WH (new)"},"BREADCRUMB:pickup":function(n){return"Pickup"},"BREADCRUMB:dist:components":function(n){return"FIFO delivery"},"BREADCRUMB:dist:packaging":function(n){return"Packaging delivery"},"BREADCRUMB:delivery:ps":function(n){return"Paint-shop delivery"},"BREADCRUMB:problems":function(n){return"Problems"},"BREADCRUMB:settings":function(n){return"Settings"},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generating the plan...</span>"},"msg:genericFailure":function(n){return"<p>Failed to execute action.</p><p>"+e.v(n,"errorCode")+"</p>"},"msg:connectionFailure":function(n){return"<p>Lost connection while resolving the next action.</p><p>Check whether you're connected to the network and try again.</p>"},"msg:resolvingAction":function(n){return"<p>Resolving the next action for:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:resolveAction:403":function(n){return"<p>No permissions to execute actions.</p>"},"msg:USER_NOT_FOUND":function(n){return"<p>User not found:</p><p>"+e.v(n,"personnelId")+"</p>"},"msg:NO_PENDING_ORDERS":function(n){return"<p>No pending orders found.</p>"},"msg:INVALID_FUNC":function(n){return"<p>Invalid user function.</p>"},"msg:FORCE_SET_ASSIGNED":function(n){return"<p>User already has an open set assigned.</p>"},"msg:delivered":function(n){return"<p>Delivery finished successfully.</p>"},"msg:nothingToDeliver":function(n){return"<p>No carts awaiting delivery.</p>"},"msg:switchingPlan":function(n){return"<p>Switching plan to:</p><p>"+e.v(n,"newDate")+"</p>"},"PAGE_ACTION:dailyPlan":function(n){return"Daily plan"},"PAGE_ACTION:old":function(n){return"Old module"},"PAGE_ACTION:legend":function(n){return"Legend"},"PAGE_ACTION:pickup":function(n){return"Pickup"},"PAGE_ACTION:problems":function(n){return"Problems"},"PAGE_ACTION:settings":function(n){return"Settings"},"PAGE_ACTION:resolveAction:title":function(n){return"Enter a card ID to resolve the next action"},"PAGE_ACTION:resolveAction:placeholder":function(n){return"Card ID"},"filter:whStatuses":function(n){return"Stage"},"filter:psStatuses":function(n){return"Paint-shop status"},"filter:distStatuses":function(n){return"Delivery status"},"filter:date":function(n){return"Plan date"},"filter:startTime":function(n){return"Start"},"filter:orders":function(n){return"Order"},"filter:lines":function(n){return"Line"},"filter:mrps":function(n){return"MRP"},"filter:sets":function(n){return"Set"},"filter:useDarkerTheme":function(n){return"High contrast"},empty:function(n){return"No plan for the specified filters."},"prop:group":function(n){return"Gr."},"prop:no":function(n){return"No"},"prop:shift":function(n){return"Sh."},"prop:plan":function(n){return"Plan"},"prop:date":function(n){return"Date"},"prop:set":function(n){return"Set"},"prop:mrp":function(n){return"MRP"},"prop:line":function(n){return"Line"},"prop:order":function(n){return"Order"},"prop:product":function(n){return"Product"},"prop:planStatus":function(n){return"Status"},"prop:whStatus":function(n){return"Stage"},"prop:fifoStatus":function(n){return"FIFO"},"prop:packStatus":function(n){return"Pack."},"prop:psDistStatus":function(n){return"PS"},"prop:nc12":function(n){return"12NC"},"prop:name":function(n){return"Product name"},"prop:qty":function(n){return"Quantity"},"prop:qtyPlan":function(n){return"Quantity planned"},"prop:qtyTodo":function(n){return"Quantity todo"},"prop:startTime":function(n){return"Start"},"prop:finishTime":function(n){return"Finish"},"prop:time":function(n){return"Time"},"prop:comment":function(n){return"Comment"},"prop:problem":function(n){return"Problem"},"prop:picklist":function(n){return"LP10"},"prop:fmx":function(n){return"FMX"},"prop:kitter":function(n){return"Kitter"},"prop:platformer":function(n){return"Plat."},"prop:packer":function(n){return"Packer"},"prop:painter":function(n){return"PS"},"prop:carts":function(n){return"Carts"},"prop:user":function(n){return"Warehouseman"},"prop:problemArea":function(n){return"Problem area"},"prop:status":function(n){return"Status"},"prop:pickup":function(n){return"Pickup"},"prop:delivery":function(n){return"Delivery"},"prop:startedAt":function(n){return"Started at"},"prop:duration":function(n){return"Duration"},"func:fmx":function(n){return"FMX"},"func:kitter":function(n){return"Kitter"},"func:platformer":function(n){return"Platformer"},"func:packer":function(n){return"Packer"},"func:painter":function(n){return"Paint-shop"},"func:dist-components":function(n){return"FIFO delivery"},"func:dist-packaging":function(n){return"Packaging delivery"},"status:picklistDone:pending":function(n){return"Transaction pending"},"status:picklistDone:progress":function(n){return"Transaction in progress"},"status:picklistDone:success":function(n){return"Transaction completed"},"status:picklistDone:failure":function(n){return"Transaction failed"},"status:pending":function(n){return"Pending"},"status:started":function(n){return"Started"},"status:finished":function(n){return"Finished"},"status:picklist":function(n){return"Picklist"},"status:pickup":function(n){return"Pickup"},"status:problem":function(n){return"Problem"},"status:cancelled":function(n){return"Cancelled"},"status:ignored":function(n){return"Ignored"},"distStatus:pending":function(n){return"Pending"},"distStatus:started":function(n){return"Started"},"distStatus:finished":function(n){return"Finished"},"menu:shiftOrder":function(n){return"Open production shift order"},"menu:copy:all":function(n){return"Copy order list"},"menu:copy:lineGroup":function(n){return"Copy order list for <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:copy:lineGroupNo":function(n){return"Copy order numbers for <em>gr."+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"menu:cancelOrder":function(n){return"Cancel order"},"menu:cancelSet":function(n){return"Cancel set"},"menu:restoreOrder":function(n){return"Restore order"},"menu:restoreSet":function(n){return"Restore set"},"menu:resetOrder":function(n){return"Reset order"},"menu:resetSet":function(n){return"Reset set"},"unassignSet:menu":function(n){return"Unassign user"},"unassignSet:failure":function(n){return"Failed to unassign the user."},"unassignSet:FINISHED":function(n){return"Set is already finished."},"unassignSet:DELIVERED":function(n){return"Set is already delivered."},"settings:tab:planning":function(n){return"Planning"},"settings:tab:pickup":function(n){return"Pickup"},"settings:tab:delivery":function(n){return"Delivery"},"settings:tab:users":function(n){return"Users"},"settings:wh.planning.ignorePsStatus":function(n){return"Ignored paint-shop statuses"},"settings:wh.planning.ignorePsStatus:help":function(n){return"Orders with one of the following statuses will be ignored during creation of a new set."},"settings:wh.planning.psPickupStatus":function(n){return"Paint-shop statuses for pickup"},"settings:wh.planning.psPickupStatus:help":function(n){return"Started set will be ready for pickup by the paint-shop only if all painted orders have one of the following paint-shop statuses."},"settings:wh.planning.psPickupReadyFuncs":function(n){return"Finished functions for paint-shop pickup"},"settings:wh.planning.psPickupReadyFuncs:help":function(n){return"Started set will be ready for pickup by the paint-shop only if the following functions completed pickup in all of the set's painted orders."},"settings:wh.planning.groupDuration":function(n){return"Order group duration [h]"},"settings:wh.planning.groupExtraItems":function(n){return"Minimum quantity in group"},"settings:wh.planning.groupExtraItems:help":function(n){return"If quantity of an order in the first/last group of a given line is lower or equal to the specified value, then that group will be merged with the next/previous group."},"settings:wh.planning.ignoredMrps":function(n){return"Ignored MRPs"},"settings:wh.planning.ignoredMrps:help":function(n){return"Orders with one of the following MRP won't show up on the pickup list."},"settings:wh.planning.enabledMrps":function(n){return"Enabled MRPs"},"settings:wh.planning.enabledMrps:help":function(n){return"Only orders with one of the following MRP will be taken into account when a new set is being created."},"settings:wh.planning.maxSetSize":function(n){return"Maximum number of orders in a set"},"settings:wh.planning.minSetDuration":function(n){return"Minimum set duration [min]"},"settings:wh.planning.minSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes to be extended by an order that exceeds the <em>Order group duration</em>."},"settings:wh.planning.maxSetDuration":function(n){return"Maximum set duration [min]"},"settings:wh.planning.maxSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes."},"settings:wh.planning.maxSetDifference":function(n){return"Maximum set time difference [min]"},"settings:wh.planning.maxSetDifference:help":function(n){return"Set creation will stop, if the difference between the start time of the next potential order to the finish time of the set's last order is greater than the specified number of minutes."},"settings:wh.planning.pendingOnly":function(n){return"Only pending orders"},"settings:wh.planning.pendingOnly:help":function(n){return"If the option is enabled, only pending orders will be used to calculate the <em>Maximum set time difference</em>."},"settings:wh.planning.minPickupDowntime":function(n){return"Maximum time between pickups [s]"},"settings:wh.planning.minPickupDowntime:help":function(n){return"Minimum time that has to pass between an end of the last pickup and a start of the new pickup to register a downtime."},"settings:wh.planning.maxPickupDowntime":function(n){return"Maximum downtime duration [min]"},"settings:wh.planning.maxPickupDowntime:help":function(n){return"If a duration of the potential downtime is greater than the specified value, the downtime is not saved."},"settings:wh.planning.maxSetsPerLine":function(n){return"Maximum number of completed sets per line"},"settings:wh.planning.minTimeForDelivery":function(n){return"Time for delivery [min]"},"settings:wh.planning.minTimeForDelivery:help":function(n){return"Carts for lines which have less available time than the specified value will be marked as awaiting delivery."},"settings:wh.planning.lateDeliveryTime":function(n){return"Time for late delivery [min]"},"settings:wh.planning.lateDeliveryTime:help":function(n){return"Carts for lines which have less available time than the specified value will have a red background."},"settings:wh.planning.minDeliveryDowntime":function(n){return"Maximum time between deliveries [s]"},"settings:wh.planning.minDeliveryDowntime:help":function(n){return"Minimum time that has to pass between an end of the last delivery and a start of the new delivery to register a downtime."},"settings:wh.planning.maxDeliveryDowntime":function(n){return"Maximum downtime duration [min]"},"settings:wh.planning.maxDeliveryDowntime:help":function(n){return"If a duration of the potential downtime is greater than the specified value, the downtime is not saved."},"settings:wh.planning.maxFifoCartsPerDelivery":function(n){return"Maximum FIFO carts per delivery"},"settings:wh.planning.maxFifoCartsPerDelivery:help":function(n){return"Maximum number of FIFO carts that can be assigned for delivery to a user at once."},"settings:wh.planning.maxPackCartsPerDelivery":function(n){return"Maximum packaging carts per delivery"},"settings:wh.planning.maxPackCartsPerDelivery:help":function(n){return"Maximum number of packaging carts that can be assigned for delivery to a user at once."},"settings:wh.planning.maxDeliveryStartTime":function(n){return"Maximum time to order start [min]"},"settings:wh.planning.maxDeliveryStartTime:help":function(n){return"Maximum minutes from now to the planned order start time to mark a cart as pending delivery, if its line is currently not working."},"settings:wh.planning.availableTimeThreshold":function(n){return"Available time threshold [min]"},"settings:wh.planning.availableTimeThreshold:help":function(n){return"When picking a line during creation of a new set, the sum of picked up time and delivered time will be changed to 0, if it's less than the specified number of minutes."},"settings:wh.planning.pickupPriorityThreshold":function(n){return"Priority pickup threshold [min]"},"settings:wh.planning.pickupPriorityThreshold:help":function(n){return"If the sum of completing and completed time of a line after creation of a new set is less that the specified number of minutes, then that line has a priority during new set creation until a set is assigned to that line."},"settings:wh.planning.deliveryFuncs":function(n){return"Delivery functions"},"settings:wh.planning.unassignSetDelay":function(n){return"Auto set unassignment delay [min]"},"settings:wh.planning.unassignSetDelay:help":function(n){return"After the specified number of minutes has elapsed since the start of a new production shift, functions having unfinished sets that were created on previous shifts are automatically unassigned."},"set:title":function(n){return"Set #"+e.v(n,"set")+" for line "+e.v(n,"line")},"set:cartsEditor:carts":function(n){return"Carts..."},"set:cartsEditor:used:error":function(n){return e.p(n,"count",0,"en",{one:"Cart already in use:",other:"Carts already in use:"})},"set:cartsEditor:used:cart":function(n){return e.v(n,"cart")+" ("+e.v(n,"date")+", set "+e.v(n,"set")+")"},"set:problemEditor:problemArea":function(n){return"Problem areas..."},"set:problemEditor:comment":function(n){return"Comment..."},"set:problemEditor:comment:pickup":function(n){return"Set aside to problem area"+e.v(n,"problemArea")+"because of a "+e.s(n,"func",{fmx:"FMX",kitter:"kitter",platformer:"platformer",packer:"packer",painter:"paint-shop",other:e.v(n,"func")})+" pickup problem of "+e.v(n,"qty")+" PCE for "+e.v(n,"line")+" line."},"set:problemEditor:comment:lp10":function(n){return"LP10 problem during pickup of "+e.v(n,"qty")+" PCE for "+e.v(n,"line")+" line."},"menu:picklistDone:success":function(n){return"Transaction succeeded"},"menu:picklistDone:failure":function(n){return"Transaction failed"},"menu:picklistDone:pending":function(n){return"Reset status"},"menu:picklist:require":function(n){return"Picklist printed"},"menu:picklist:ignore":function(n){return"Ignore pickup"},"menu:picklist:pending":function(n){return"Reset status"},"menu:pickup:success":function(n){return"Pickup succeeded"},"menu:pickup:failure":function(n){return"Pickup failed"},"menu:pickup:pending":function(n){return"Reset status"},"menu:pickup:editCarts":function(n){return"Change carts"},"update:failure":function(n){return"Failed to execute action."},"update:FIFO_IGNORED":function(n){return"FIFO pickup cannot be ignored."},"update:ALL_IGNORED":function(n){return"Pickup cannot be ignored completely."},"printLabels:failure":function(n){return"Failed to print labels."},"list:popover:picklist":function(n){return"LP10"},"list:popover:fmx":function(n){return"FMX"},"list:popover:kitter":function(n){return"Kitter"},"list:popover:platformer":function(n){return"Platformer"},"list:popover:packer":function(n){return"Packer"},"list:popover:painter":function(n){return"Paint-shop"},"list:popover:status":function(n){return"Status"},"list:popover:user":function(n){return"Warehouseman"},"list:popover:fifoStatus":function(n){return"FIFO delivery"},"list:popover:packStatus":function(n){return"Packaging delivery"},"list:popover:psDistStatus":function(n){return"Paint-shop delivery"},"list:popover:qty":function(n){return"Quantity"},"list:popover:line":function(n){return"Line"},"problem:empty":function(n){return"No problems!"},"problem:title":function(n){return"Problem details for order "+e.v(n,"orderNo")+" on line "+e.v(n,"line")},"problem:menu:solveProblem":function(n){return"Solve problem"},"problem:menu:resetOrder":function(n){return"Reset order"},"problem:menu:cancelOrder":function(n){return"Cancel order"},"problem:editor:comment":function(n){return"Comment..."},"problem:editor:carts":function(n){return"Carts..."},"problem:editor:resetOrder:yes":function(n){return"Reset order"},"problem:editor:resetOrder:no":function(n){return"Do not reset"},"problem:editor:resetOrder:message":function(n){return"Reset pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"problem:editor:cancelOrder:yes":function(n){return"Cancel order"},"problem:editor:cancelOrder:no":function(n){return"Do not cancel"},"problem:editor:cancelOrder:message":function(n){return"Cancelled pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"problem:editor:solveProblem:yes":function(n){return"Solve problem"},"problem:editor:solveProblem:no":function(n){return"Do not solve"},"problem:editor:solveProblem:message":function(n){return"Solved "+e.s(n,"func",{fmx:"FMX's",kitter:"Kitter's",packer:"Packer's",painter:"Paint-shop's",other:"LP10"})+" problem with a pickup of "+e.v(n,"qty")+" PCE for line "+e.v(n,"line")+"."},"problem:msg:STATE_DLV":function(n){return"Delivered orders cannot be reset."},"downtimePicker:title":function(n){return"Downtime"},"downtimePicker:submit":function(n){return"Choose downtime reason"},"downtimePicker:cancel":function(n){return"Cancel"},"downtimePicker:reason":function(n){return"Downtime reason"},"downtimePicker:comment":function(n){return"Comment"},"pickup:status:full:fmx":function(n){return"FMX"},"pickup:status:full:kitter":function(n){return"Kitter"},"pickup:status:full:platformer":function(n){return"Platformer"},"pickup:status:full:packer":function(n){return"Packer"},"pickup:status:full:painter":function(n){return"Paint-shop"},"pickup:status:short:fmx":function(n){return"FMX"},"pickup:status:short:kitter":function(n){return"Kitter"},"pickup:status:short:platformer":function(n){return"Plat."},"pickup:status:short:packer":function(n){return"Packer"},"pickup:status:short:painter":function(n){return"PS"},"pickup:forceLine:action":function(n){return"Force pickup"},"pickup:forceLine:title":function(n){return"Forcing pickup for line"},"pickup:forceLine:forceLine:label":function(n){return"Force pickup for line"},"pickup:forceLine:forceLine:placeholder":function(n){return"Select a line..."},"pickup:forceLine:redirLine:label":function(n){return"Redirect orders to line"},"pickup:forceLine:redirLine:placeholder":function(n){return"Select a line..."},"pickup:forceLine:forceDelivery":function(n){return"Force delivery after pickup"},"pickup:forceLine:card:label":function(n){return"Card ID"},"pickup:forceLine:card:placeholder":function(n){return"Enter or scan the card ID..."},"pickup:forceLine:submit":function(n){return"Start pickup"},"pickup:stats:sets":function(n){return"Sets"},"pickup:stats:orders":function(n){return"Orders"},"pickup:stats:qty":function(n){return"PCE"},"pickup:stats:pending":function(n){return"Pending"},"pickup:stats:started":function(n){return"Started"},"delivery:title:completed":function(n){return"Completed "+e.s(n,"kind",{components:"FIFO",packaging:"pack.",ps:"PS",other:e.v(n,"kind")})},"delivery:title:pending":function(n){return"Pending"},"delivery:title:delivering":function(n){return"Delivering"},"delivery:set":function(n){return"Set "+e.v(n,"set")},"delivery:set:title":function(n){return"Delivering "+e.s(n,"kind",{components:"FIFO",packaging:"packaging",ps:"paint-shop",other:e.v(n,"kind")})+" carts"},"delivery:set:addCarts":function(n){return"Add carts"},"delivery:set:finish":function(n){return"Finish delivery"},"delivery:set:cancel":function(n){return"Close"},"delivery:set:msg":function(n){return"Scan again to finish the delivery."},"delivery:set:cart":function(n){return"Cart"},"delivery:set:line":function(n){return"Line"},"delivery:set:date":function(n){return"Plan"},"delivery:set:set":function(n){return"Set"},"delivery:set:sapOrders":function(n){return"Orders"},"delivery:set:completedSapOrders":function(n){return"Warning: carts contain orders that are marked as complete in SAP!"},"delivery:forceLine:action":function(n){return"Force delivery"},"delivery:forceLine:title":function(n){return"Delivery for line"},"delivery:forceLine:message":function(n){return"Choose a line and scan yourself to force a delivery to the specified line."},"delivery:forceLine:line":function(n){return"Line"},"delivery:forceLine:card":function(n){return"Card ID"},"delivery:forceLine:submit":function(n){return"Start delivery"},"delivery:stats:sets":function(n){return"Sets"},"delivery:stats:orders":function(n){return"Orders"},"delivery:stats:qty":function(n){return"PCE"},"delivery:stats:time":function(n){return"Prod. time"},"blockedPickup:title":function(n){return"Pickup blocked"},"exportOrders:title":function(n){return"Exporting orders"},"exportOrders:submit":function(n){return"Export orders"},"exportOrders:mrps":function(n){return"MRP"},"exportOrders:mrps:placeholder":function(n){return"All MRP"},"exportOrders:lines":function(n){return"Lines"},"exportOrders:lines:placeholder":function(n){return"All lines"}},pl:!0}});