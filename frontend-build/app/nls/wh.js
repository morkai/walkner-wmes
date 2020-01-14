define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,o,i){return t.c(n,e),n[e]in i?i[n[e]]:(e=t.lc[o](n[e]-r))in i?i[e]:i.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"BREADCRUMB:base":function(n){return"WH (new)"},"BREADCRUMB:pickup":function(n){return"Pickup"},"BREADCRUMB:problems":function(n){return"Problems"},"BREADCRUMB:settings":function(n){return"Settings"},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generating the plan...</span>"},"msg:genericFailure":function(n){return"<p>Failed to execute action.</p><p>"+t.v(n,"errorCode")+"</p>"},"msg:connectionFailure":function(n){return"<p>Lost connection while resolving the next action.</p><p>Check whether you're connected to the network and try again.</p>"},"msg:resolvingAction":function(n){return"<p>Resolving the next action for:</p><p>"+t.v(n,"personnelId")+"</p>"},"msg:resolveAction:403":function(n){return"<p>No permissions to execute actions.</p>"},"msg:USER_NOT_FOUND":function(n){return"<p>User not found:</p><p>"+t.v(n,"personnelId")+"</p>"},"msg:NO_PENDING_ORDERS":function(n){return"<p>No pending orders found.</p>"},"PAGE_ACTION:dailyPlan":function(n){return"Daily plan"},"PAGE_ACTION:old":function(n){return"Old module"},"PAGE_ACTION:legend":function(n){return"Legend"},"PAGE_ACTION:pickup":function(n){return"Pickup"},"PAGE_ACTION:problems":function(n){return"Problems"},"PAGE_ACTION:settings":function(n){return"Settings"},"PAGE_ACTION:resolveAction:title":function(n){return"Enter a card ID to resolve the next action"},"PAGE_ACTION:resolveAction:placeholder":function(n){return"Card ID"},"filter:whStatuses":function(n){return"Stage"},"filter:psStatuses":function(n){return"Paint-shop status"},"filter:date":function(n){return"Plan date"},"filter:startTime":function(n){return"Start"},"filter:useDarkerTheme":function(n){return"High contrast"},empty:function(n){return"No plan for the specified filters."},"prop:group":function(n){return"Gr."},"prop:no":function(n){return"No"},"prop:shift":function(n){return"Sh."},"prop:date":function(n){return"Date"},"prop:set":function(n){return"Set"},"prop:mrp":function(n){return"MRP"},"prop:line":function(n){return"Line"},"prop:order":function(n){return"Order"},"prop:product":function(n){return"Product"},"prop:planStatus":function(n){return"Status"},"prop:whStatus":function(n){return"Stage"},"prop:nc12":function(n){return"12NC"},"prop:name":function(n){return"Product name"},"prop:qty":function(n){return"Quantity"},"prop:qtyPlan":function(n){return"Quantity planned"},"prop:qtyTodo":function(n){return"Quantity todo"},"prop:startTime":function(n){return"Start"},"prop:finishTime":function(n){return"Finish"},"prop:time":function(n){return"Time"},"prop:comment":function(n){return"Comment"},"prop:problem":function(n){return"Problem"},"prop:picklist":function(n){return"LP10"},"prop:fmx":function(n){return"FMX"},"prop:kitter":function(n){return"Kitter"},"prop:packer":function(n){return"Packer"},"prop:carts":function(n){return"Carts"},"prop:user":function(n){return"Warehouseman"},"prop:problemArea":function(n){return"Problem area"},"prop:status":function(n){return"Status"},"func:fmx":function(n){return"FMX"},"func:kitter":function(n){return"Kitter"},"func:packer":function(n){return"Packer"},"status:picklistDone:null":function(n){return"Transaction pending"},"status:picklistDone:true":function(n){return"Transaction completed"},"status:picklistDone:false":function(n){return"Transaction failed"},"status:pending":function(n){return"Pending"},"status:started":function(n){return"Started"},"status:finished":function(n){return"Finished"},"status:picklist":function(n){return"Picklist"},"status:pickup":function(n){return"Pickup"},"status:problem":function(n){return"Problem"},"status:cancelled":function(n){return"Cancelled"},"menu:shiftOrder":function(n){return"Open production shift order"},"menu:copy:all":function(n){return"Copy order list"},"menu:copy:lineGroup":function(n){return"Copy order list for <em>gr."+t.v(n,"group")+". "+t.v(n,"line")+"</em>"},"menu:copy:lineGroupNo":function(n){return"Copy order numbers for <em>gr."+t.v(n,"group")+". "+t.v(n,"line")+"</em>"},"menu:cancelOrder":function(n){return"Cancel order"},"menu:cancelSet":function(n){return"Cancel set"},"menu:restoreOrder":function(n){return"Restore order"},"menu:restoreSet":function(n){return"Restore set"},"menu:resetOrder":function(n){return"Reset order"},"menu:resetSet":function(n){return"Reset set"},"settings:tab:planning":function(n){return"Planning"},"settings:planning:ignorePsStatus":function(n){return"Ignore paint-shop status during completion"},"settings:planning:groupDuration":function(n){return"Order group duration [h]"},"settings:wh:groupExtraItems":function(n){return"Minimum quantity in group"},"settings:wh:groupExtraItems:help":function(n){return"If quantity of an order in the first/last group of a given line is lower or equal to the specified value, then that group will be merged with the next/previous group."},"settings:planning:ignoredMrps":function(n){return"Ignored MRPs"},"settings:planning:maxSetSize":function(n){return"Maximum number of orders in a set"},"settings:planning:minSetDuration":function(n){return"Minimum set duration [min]"},"settings:planning:minSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes to be extended by an order that exceeds the <em>Order group duration</em>."},"settings:planning:maxSetDuration":function(n){return"Maximum set duration [min]"},"settings:planning:maxSetDuration:help":function(n){return"Set duration cannot exceed the specified number of minutes."},"settings:planning:maxSetDifference":function(n){return"Maximum set time difference [min]"},"settings:planning:maxSetDifference:help":function(n){return"Set creation will stop, if the difference between the start time of the next potential order to the finish time of the set's last order is greater than the specified number of minutes."},"settings:tab:users":function(n){return"Users"},"settings:users:fmx":function(n){return"FMX"},"settings:users:kitter":function(n){return"Kitter"},"settings:users:packer":function(n){return"Packer"},"set:title":function(n){return"Order set no "+t.v(n,"set")+" for line "+t.v(n,"line")},"set:cartsEditor:carts":function(n){return"Carts..."},"set:problemEditor:problemArea":function(n){return"Problem areas..."},"set:problemEditor:comment":function(n){return"Comment..."},"menu:picklistDone:true":function(n){return"Transaction succeeded"},"menu:picklistDone:false":function(n){return"Transaction failed"},"menu:picklistDone:null":function(n){return"Reset status"},"menu:picklist:require":function(n){return"Picklist printed"},"menu:picklist:ignore":function(n){return"Ignore pickup"},"menu:picklist:pending":function(n){return"Reset status"},"menu:pickup:success":function(n){return"Pickup succeeded"},"menu:pickup:failure":function(n){return"Pickup failed"},"menu:pickup:pending":function(n){return"Reset status"},"update:failure":function(n){return"Failed to execute action."},"printLabels:failure":function(n){return"Failed to print labels."},"list:popover:picklist":function(n){return"LP10"},"list:popover:fmx":function(n){return"FMX"},"list:popover:kitter":function(n){return"Kitter"},"list:popover:packer":function(n){return"Packer"},"list:popover:status":function(n){return"Status"},"list:popover:user":function(n){return"Warehouseman"},"problem:empty":function(n){return"No problems!"},"problem:title":function(n){return"Problem details for order "+t.v(n,"orderNo")+" on line "+t.v(n,"line")},"problem:menu:solveProblem":function(n){return"Solve problem"},"problem:menu:cancelOrder":function(n){return"Cancel order"},"problem:editor:comment":function(n){return"Comment..."},"problem:editor:carts":function(n){return"Carts..."},"problem:editor:cancelOrder:yes":function(n){return"Cancel order"},"problem:editor:cancelOrder:no":function(n){return"Do not cancel"},"problem:editor:cancelOrder:message":function(n){return"Cancelled pickup of "+t.v(n,"qty")+" PCE for line "+t.v(n,"line")+"."},"problem:editor:solveProblem:yes":function(n){return"Solve problem"},"problem:editor:solveProblem:no":function(n){return"Do not solve"},"problem:editor:solveProblem:message":function(n){return"Solved "+t.s(n,"func",{fmx:"FMX's",kitter:"Kitter's",packer:"Packer's",other:"LP10"})+" problem with a pickup of "+t.v(n,"qty")+" PCE for line "+t.v(n,"line")+"."}},pl:!0}});