define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r))in i?i[t]:i.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMB:base":function(n){return"Daily plans"},"BREADCRUMB:wh":function(n){return"WH (old)"},"BREADCRUMB:settings":function(n){return"Settings"},"BREADCRUMB:changes":function(n){return"Change history"},"MSG:LOADING_FAILURE:plan":function(n){return"Failed to load the plan."},"MSG:LOADING_FAILURE:settings":function(n){return"Failed to load the plan settings."},"MSG:LOADING_FAILURE:sapOrders":function(n){return"Failed to load the SAP orders."},"MSG:LOADING_FAILURE:shifts":function(n){return"Failed to load the production shifts."},"MSG:LOADING_FAILURE:lateOrders":function(n){return"Failed to load the late orders."},"MSG:LOADING_FAILURE:shiftOrders":function(n){return"Failed to load the production shift orders."},"MSG:LOADING_FAILURE:delayReasons":function(n){return"Failed to load the delay reasons."},"MSG:LOADING_FAILURE:productionState":function(n){return"Failed to load the production state."},"MSG:GENERATING":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Generating the plan...</span>"},"MSG:export:started":function(n){return"Exporting..."},"MSG:export:failure":function(n){return"Exporting failed."},"PAGE_ACTION:hourlyPlans":function(n){return"Hourly plans"},"PAGE_ACTION:dailyPlan":function(n){return"Daily plan"},"PAGE_ACTION:paintShop":function(n){return"Paint shop"},"PAGE_ACTION:wh":function(n){return"WH"},"PAGE_ACTION:wh:old":function(n){return"Old module"},"PAGE_ACTION:wh:new":function(n){return"New module"},"PAGE_ACTION:wh:problems":function(n){return"Problem list"},"PAGE_ACTION:legend":function(n){return"Legend"},"PAGE_ACTION:changes":function(n){return"Change history"},"PAGE_ACTION:settings":function(n){return"Settings"},"PAGE_ACTION:settings:copy":function(n){return"Copy line settings"},"PAGE_ACTION:toggleChanges:expand":function(n){return"Expand"},"PAGE_ACTION:toggleChanges:collapse":function(n){return"Collapse"},"filter:date":function(n){return"Plan date"},"filter:mrps":function(n){return"All MRP"},"filter:mrps:1":function(n){return"Selected MRP"},"filter:mrps:0":function(n){return"Ignored MRP"},"filter:mrps:mine":function(n){return"Mine"},"filter:mrps:wh":function(n){return"WH"},"filter:mrps:placeholder":function(n){return"All"},"filter:lines":function(n){return"Production lines"},"filter:lines:placeholder":function(n){return"All lines"},"filter:whStatuses":function(n){return"Stage"},"filter:psStatuses":function(n){return"Paint-shop status"},"filter:wrapLists":function(n){return"List wrapping"},"filter:lineOrdersList":function(n){return"<u>O</u>rder list"},"filter:useLatestOrderData":function(n){return"Latest order data"},"filter:useDarkerTheme":function(n){return"High contrast"},"filter:copyOrderList":function(n){return"Copy order list"},"filter:export":function(n){return"Export..."},"filter:export:stats":function(n){return"...stats"},"filter:export:transport":function(n){return"...transport plan"},"filter:stats:quantity":function(n){return"Quantity:"},"filter:stats:manHours":function(n){return"Man-hours:"},"filter:stats:orders":function(n){return"Orders:"},"filter:stats:tooltip:todo":function(n){return"Total of all orders\nin selected MRPs"},"filter:stats:tooltip:late":function(n){return"Total of all\nlate orders\nin selected MRPs"},"filter:stats:tooltip:plan":function(n){return"Total of all\nplanned orders\nin selected MRPs"},"filter:stats:tooltip:remaining":function(n){return"Total of remaining\nin selected MRPs"},"filter:stats:todo":function(n){return"Todo"},"filter:stats:late":function(n){return"Late"},"filter:stats:plan":function(n){return"Plan"},"filter:stats:remaining":function(n){return"Remaining"},"filter:stats:execution":function(n){return"Sequence execution"},"filter:startTime":function(n){return"Start"},"toolbar:printPlan":function(n){return"Print line plan"},"toolbar:printPlan:all":function(n){return"All lines"},"toolbar:showTimes":function(n){return"Show times"},"toolbar:copyOrderList":function(n){return"Copy list of planned orders\nto clipboard"},"toolbar:copyOrderList:0":function(n){return"All shifts"},"toolbar:copyOrderList:1":function(n){return"I shift"},"toolbar:copyOrderList:2":function(n){return"II shift"},"toolbar:copyOrderList:3":function(n){return"III shift"},"toolbar:copyOrderList:success":function(n){return"List copied to clipboard."},"toolbar:toggleLock:true":function(n){return"Unlock MRP"},"toolbar:toggleLock:false":function(n){return"Lock MRP"},"toolbar:stats:quantity":function(n){return"Quantity:"},"toolbar:stats:manHours":function(n){return"Man-hours:"},"toolbar:stats:orders":function(n){return"Orders:"},"toolbar:stats:tooltip:todo":function(n){return"Total of all orders\nin MRP"},"toolbar:stats:tooltip:late":function(n){return"Total of all\nlate orders\nin MRP"},"toolbar:stats:tooltip:plan":function(n){return"Total of all\nplanned orders\nin MRP"},"toolbar:stats:tooltip:remaining":function(n){return"Total of remaining\nin MRP"},"toolbar:stats:tooltip:execution:percent":function(n){return"Percent of execution\nof the planned sequence\nin the whole day"},"toolbar:stats:tooltip:execution:percent:shift":function(n){return"Percent of execution\nof the planned sequence\non shift "+e.v(n,"shiftNo")},"print:workerCount":function(n){return e.v(n,"count")+" "+e.p(n,"count",0,"en",{one:"person",other:"people"})},"print:workerCounts":function(n){return e.v(n,"from")+"-"+e.v(n,"to")+" "+e.p(n,"to",0,"en",{one:"person",other:"people"})},"list:generate":function(n){return"Force<br>plan<br>creation"},"list:mrpCount":function(n){return e.v(n,"str")+" "+e.p(n,"num",0,"en",{one:"family",other:"families"})},"list:lineCount":function(n){return e.v(n,"str")+" "+e.p(n,"num",0,"en",{one:"line",other:"lines"})},"list:orderCount":function(n){return e.v(n,"str")+" "+e.p(n,"num",0,"en",{one:"order",other:"orders"})},"list:quantity":function(n){return e.v(n,"str")+" pce"},"list:manHours":function(n){return e.v(n,"str")+" mh"},"list:from":function(n){return"from "+e.v(n,"time")},"list:to":function(n){return"to "+e.v(n,"time")},empty:function(n){return"No plan for the specified filters."},locked:function(n){return"MRP is locked!"},"toggleLock:title:true":function(n){return"MRP unlocking"},"toggleLock:title:false":function(n){return"MRP locking"},"toggleLock:message:true":function(n){return"<p>Are you sure you want to unlock MRP <em>"+e.v(n,"mrp")+"</em>?</p><p>Unlocking will resume the plan recalculation for that MRP and might change the plan for Warehouse.</p>"},"toggleLock:message:false":function(n){return"<p>Are you sure you want to lock MRP <em>"+e.v(n,"mrp")+"</em>?</p><p>Locking will disable any changes to that MRP and will stop plan recalculation of all lines in the MRP.</p>"},"toggleLock:yes:true":function(n){return"Unlock MRP"},"toggleLock:yes:false":function(n){return"Lock MRP"},"toggleLock:no:true":function(n){return"Leave locked"},"toggleLock:no:false":function(n){return"Leave unlocked"},"lines:hd":function(n){return"Lines"},"lines:division":function(n){return"Division"},"lines:prodFlow":function(n){return"Prod. flow"},"lines:prodLine":function(n){return"Line"},"lines:activeFrom":function(n){return"Active from"},"lines:activeTo":function(n){return"Active to"},"lines:activeTime":function(n){return"Activity time"},"lines:workerCount":function(n){return"Worker count"},"lines:orderPriority":function(n){return"Order priority"},"lines:frozenOrders":function(n){return"Frozen orders"},"lines:mrpPriority":function(n){return"MRP priority"},"lines:menu:header":function(n){return"Line "+e.v(n,"line")},"lines:menu:settings":function(n){return"Change line settings"},"lines:menu:remove":function(n){return"Remove line from MRP"},"lines:menu:remove:title":function(n){return"Removing line from MRP"},"lines:menu:remove:message":function(n){return"<p>Are you sure you want to remove line <em>"+e.v(n,"line")+"</em> from MRP<em>"+e.v(n,"mrp")+"</em>?</p><p>Change will affect only the plan for "+e.v(n,"plan")+".</p>"},"lines:menu:remove:yes":function(n){return"Remove line"},"lines:menu:remove:failure":function(n){return"Failed to remove line from MRP."},"lines:menu:settings:title":function(n){return"Changing line settings"},"lines:menu:settings:submit":function(n){return"Save settings"},"lines:menu:settings:line":function(n){return"Production line"},"lines:menu:settings:applyToAllMrps":function(n){return"Set the same <em>Worker count</em> and <em>Order priority</em> for line "+e.v(n,"line")+" in all assigned MRPs, and not only for "+e.v(n,"mrp")+"."},"lines:menu:settings:failure":function(n){return"Failed to change line settings."},"lines:menu:mrpPriority":function(n){return"Change available lines"},"lines:menu:mrpPriority:title":function(n){return"Changing available lines"},"lines:menu:mrpPriority:submit":function(n){return"Save MRP priorities"},"lines:menu:mrpPriority:failure":function(n){return"Failed to change available lines."},"lines:menu:mrpPriority:line":function(n){return"New line"},"lines:menu:mrpPriority:line:placeholder":function(n){return"Select a production line..."},"lines:menu:workerCount":function(n){return"Change worker count"},"lines:menu:workerCount:title":function(n){return"Changing worker count"},"lines:menu:workerCount:submit":function(n){return"Save worker count"},"lines:menu:workerCount:failure":function(n){return"Failed to change the worker count."},"lines:menu:orderPriority":function(n){return"Change order priority"},"lines:menu:orderPriority:title":function(n){return"Changing order priority"},"lines:menu:orderPriority:submit":function(n){return"Save order priority"},"lines:menu:orderPriority:failure":function(n){return"Failed to save the order priority."},"lines:menu:freezeOrders":function(n){return"Freeze orders"},"lines:menu:freezeOrders:title":function(n){return"Freezing orders"},"lines:menu:freezeOrders:line":function(n){return"Lines"},"lines:menu:freezeOrders:availableOrders":function(n){return"Available orders"},"lines:menu:freezeOrders:frozenOrders":function(n){return"Frozen orders"},"lines:menu:freezeOrders:no":function(n){return"#"},"lines:menu:freezeOrders:order":function(n){return"Order"},"lines:menu:freezeOrders:quantity":function(n){return"Quantity"},"lines:menu:freezeOrders:actions":function(n){return"Actions"},"lines:menu:freezeOrders:submit":function(n){return"Freeze orders"},"lines:menu:freezeOrders:failure":function(n){return"Failed to freeze orders."},"lines:menu:freezeOrders:shift:1":function(n){return"I shift"},"lines:menu:freezeOrders:shift:2":function(n){return"I and II shifts"},"lines:menu:freezeOrders:shift:3":function(n){return"all shifts"},"orders:hd":function(n){return"Orders"},"orders:_id":function(n){return"Order no"},"orders:date":function(n){return"Date"},"orders:delayReason":function(n){return"Reason"},"orders:kind":function(n){return"Kind"},"orders:quantityDone":function(n){return"Quantity done"},"orders:quantityTodo":function(n){return"Quantity todo"},"orders:quantityPlan":function(n){return"Quantity to plan"},"orders:incomplete":function(n){return"Incomplete quantity"},"orders:hardComponent":function(n){return"Difficult component"},"orders:nc12":function(n){return"12NC"},"orders:name":function(n){return"Name"},"orders:operation":function(n){return"Operation"},"orders:machineTime":function(n){return"Machine Time"},"orders:laborTime":function(n){return"Labor Time"},"orders:manHours":function(n){return"Man-hours"},"orders:qty":function(n){return"Quantity"},"orders:mrp":function(n){return"MRP"},"orders:statuses":function(n){return"Status"},"orders:ignored":function(n){return"Ignored"},"orders:urgent":function(n){return"Urgent"},"orders:pinned":function(n){return"Pinned"},"orders:eto":function(n){return"ETO"},"orders:priority":function(n){return e.s(n,"priority",{E:"ETO Pilot",E:"ETO Pilot continuation",other:"Order priority"})},"orders:lines":function(n){return"Line"},"orders:source:plan":function(n){return"Planned"},"orders:source:added":function(n){return"Added"},"orders:source:incomplete":function(n){return"Incomplete"},"orders:source:late":function(n){return"Late"},"orders:psStatus:unknown":function(n){return"Not painted"},"orders:psStatus:new":function(n){return"Painting pending"},"orders:psStatus:started":function(n){return"Painting started"},"orders:psStatus:partial":function(n){return"Painted partially"},"orders:psStatus:finished":function(n){return"Painting finished"},"orders:psStatus:cancelled":function(n){return"Painting cancelled"},"orders:whStatus:unknown":function(n){return"Unspecified"},"orders:whStatus:todo":function(n){return"Todo"},"orders:whStatus:done":function(n){return"Done"},"orders:dropZone":function(n){return e.v(n,"group")+" on "+e.v(n,"time")},"orders:qty:incomplete":function(n){return"("+e.v(n,"qty")+" incomplete)"},"orders:late":function(n){return"Late"},"orders:customQuantity":function(n){return"Changed quantity"},"orders:comment":function(n){return"Last comment"},"orders:menu:header":function(n){return"Order "+e.v(n,"order")},"orders:menu:sapOrder":function(n){return"Open SAP order details"},"orders:menu:shiftOrder":function(n){return"Open line order details"},"orders:menu:comment":function(n){return"Comment order"},"orders:menu:urgent":function(n){return"Mark order as urgent"},"orders:menu:urgent:title":function(n){return"Urgent order"},"orders:menu:urgent:message":function(n){return"<p>Are you sure you want to mark the order <em>"+e.v(n,"order")+"</em> as <strong>urgent</strong>?</p><p>Urgent orders are planned at the beginning of the plan, ignoring the order priority.</p>"},"orders:menu:urgent:yes":function(n){return"Mark as urgent"},"orders:menu:urgent:failure":function(n){return"Failed to mark the order as urgent."},"orders:menu:unurgent":function(n){return"Mark as not urgent"},"orders:menu:unurgent:message":function(n){return"<p>Are you sure you want to mark the order <em>"+e.v(n,"order")+"</em> as <strong>not urgent</strong>?</p><p>Not urgent orders are planned according to the order priority.</p>"},"orders:menu:unurgent:yes":function(n){return"Mark as not urgent"},"orders:menu:ignore":function(n){return"Ignore order"},"orders:menu:ignore:title":function(n){return"Ignoring order"},"orders:menu:ignore:message":function(n){return"<p>Are you sure you want to ignore order <em>"+e.v(n,"order")+"</em>?</p><p>Ignored orders are not taken into consideration during planning.</p>"},"orders:menu:ignore:yes":function(n){return"Ignore order"},"orders:menu:ignore:failure":function(n){return"Failed to ignore order."},"orders:menu:unignore":function(n){return"Stop ignoring order"},"orders:menu:unignore:message":function(n){return"<p>Are you sure you want to stop ignoring order <em>"+e.v(n,"order")+"</em>?</p><p>Order will return to the planning queue.</p>"},"orders:menu:unignore:yes":function(n){return"Stop ignoring order"},"orders:menu:quantity":function(n){return"Change order quantity"},"orders:menu:quantity:title":function(n){return"Changing order quantity"},"orders:menu:quantity:quantityTodo":function(n){return"Quantity todo:"},"orders:menu:quantity:quantityDone":function(n){return"Quantity done:"},"orders:menu:quantity:quantityRemaining":function(n){return"Quantity remaining:"},"orders:menu:quantity:quantityPlan":function(n){return"Quantity to plan:"},"orders:menu:quantity:help":function(n){return"Be default, <em>Quantity to plan</em> is equal to <em>Quantity todo</em> or <em>Quantity remaining</em>, if the <em>Plan according to the remaining quantity</em> setting is enabled. This value can be overwritten here."},"orders:menu:quantity:submit":function(n){return"Save quantity to plan"},"orders:menu:quantity:failure":function(n){return"Failed to change the quantity"},"orders:menu:lines":function(n){return"Change pin to line"},"orders:menu:lines:title":function(n){return"Changing pin to line"},"orders:menu:lines:submit":function(n){return"Save pin to line"},"orders:menu:lines:failure":function(n){return"Failed to pin to line."},"orders:menu:lines:urgent":function(n){return"Urgent"},"orders:menu:add":function(n){return"Add order"},"orders:menu:remove":function(n){return"Remove order"},"orders:menu:remove:title":function(n){return"Removing order"},"orders:menu:remove:message":function(n){return"<p>Are you sure you want to remove the order <em>"+e.v(n,"order")+"</em> from the queue of the current plan?</p>"},"orders:menu:remove:yes":function(n){return"Remove order"},"orders:menu:remove:failure":function(n){return"Failed to remove order."},"orders:menu:dropZone":function(n){return"Set drop zone"},"orders:menu:dropZone:title":function(n){return"Setting drop zone"},"orders:menu:dropZone:submit":function(n){return"Set drop zone"},"orders:menu:dropZone:failure":function(n){return"Failed to set the drop zone."},"orders:menu:dropZone:dropZone":function(n){return"Drop zone group"},"orders:menu:dropZone:time":function(n){return"Time"},"orders:menu:dropZone:status":function(n){return"Status"},"orders:menu:dropZone:orders":function(n){return"Orders to change"},"orders:menu:dropZone:comment":function(n){return"Optional WH comment"},"orders:add":function(n){return"Add order"},"orders:add:title":function(n){return"Adding order"},"orders:add:submit":function(n){return"Add order"},"orders:add:failure":function(n){return"Failed to add order."},"orders:add:invalidOrderNo":function(n){return"Enter a valid, 9-digit order number."},"orders:add:searching":function(n){return"<i class='fa fa-spinner fa-spin'></i><span>Looking for order...</span>"},"orders:add:searchFailed":function(n){return"<i class='fa fa-spinner'></i><span>Failed searching for order.</span>"},"orders:add:ORDER_NOT_FOUND":function(n){return"Order doesn't exist."},"orders:add:alreadyExists":function(n){return"Order already exists in the current plan."},"orders:add:future":function(n){return"Order is planned for the future."},"orders:add:undefinedMrp":function(n){return"Order MRP is not defined in the current plan."},"orders:add:requiredStatus":function(n){return"Order doesn't have the required statuses."},"orders:add:ignoredStatus":function(n){return"Order has ignored statuses."},"orders:add:orderNo":function(n){return"Order no"},"orders:add:urgent":function(n){return"Urgent"},"orders:add:plans":function(n){return"Planned on"},"lateOrders:hd":function(n){return"Late"},"lateOrders:action":function(n){return"Add late orders"},"lateOrders:add:title":function(n){return"Adding late orders"},"lateOrders:add:failure":function(n){return"Failed to add late orders."},"lateOrders:add:orders":function(n){return"Late orders:"},"lateOrders:add:submit":function(n){return"Add late orders"},"lineOrders:orderNo":function(n){return"Order no"},"lineOrders:unit":function(n){return"PCE"},"lineOrders:qty:planned":function(n){return"Quantity planned"},"lineOrders:qty:done":function(n){return"Quantity done"},"lineOrders:qty:remaining":function(n){return"Quantity remaining"},"lineOrders:qty:total":function(n){return"Total quantity"},"lineOrders:qty:incomplete":function(n){return"Incomplete quantity"},"lineOrders:pceTime":function(n){return"PCE time"},"lineOrders:manHours":function(n){return"Man-hours"},"lineOrders:time":function(n){return"Start-end time"},"lineOrders:duration":function(n){return"Duration"},"lineOrders:incomplete":function(n){return"("+e.v(n,"qty")+" incomplete)"},"lineOrders:downtimeReason":function(n){return"Downtime reason"},"lineOrders:comment":function(n){return"Last comment"},"lineOrders:list:group":function(n){return"Gr."},"lineOrders:list:no":function(n){return"No"},"lineOrders:list:shift":function(n){return"Sh."},"lineOrders:list:mrp":function(n){return"MRP"},"lineOrders:list:orderNo":function(n){return"Order"},"lineOrders:list:nc12":function(n){return"12NC"},"lineOrders:list:name":function(n){return"Product name"},"lineOrders:list:qtyPlan":function(n){return"Quantity planned"},"lineOrders:list:qtyTodo":function(n){return"Quantity todo"},"lineOrders:list:qty:header":function(n){return"Quantity"},"lineOrders:list:qty:value":function(n){return e.v(n,"plan")+" of "+e.v(n,"todo")},"lineOrders:list:startTime":function(n){return"Start"},"lineOrders:list:finishTime":function(n){return"Finish"},"lineOrders:list:status":function(n){return"Status"},"lineOrders:list:lines":function(n){return"Lines"},"lineOrders:list:line":function(n){return"Line"},"lineOrders:list:dropZone":function(n){return"Drop zone"},"lineOrders:list:whStatus":function(n){return"Stage"},"lineOrders:list:comment":function(n){return"Last comment"},"lineOrders:menu:copy":function(n){return"Copy order list"},"lineOrders:menu:copy:success":function(n){return"Order list copied to clipboard."},"wh:menu:copy:lineGroup":function(n){return"Copy order list <em>"+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"wh:menu:copy:lineGroupNo":function(n){return"Copy order numbers <em>"+e.v(n,"group")+". "+e.v(n,"line")+"</em>"},"wh:menu:export":function(n){return"Export orders"},"wh:status:all":function(n){return"All"},"wh:status:0":function(n){return"Unspecified"},"wh:status:1":function(n){return"List"},"wh:status:2":function(n){return"Buffer"},"wh:status:3":function(n){return e.p(n,"qtySent",0,"en",{0:"Distribution",other:"Sent "+e.v(n,"qtySent")+" szt."})},"wh:sent:comment":function(n){return"Sent "+e.v(n,"qtySent")+" PCE to line "+e.v(n,"line")+" "+e.v(n,"date")+" at "+e.v(n,"time")+"."},"wh:sent:label":function(n){return"Quantity<br>Sent:"},"wh:export:fileName":function(n){return"WMES_PLAN_WH_"+e.v(n,"date")},"wh:export:sheetName":function(n){return"WH plan "+e.v(n,"date")},"stats:export:title":function(n){return"Exporting stats"},"stats:export:mrps":function(n){return"MRP"},"stats:export:lines":function(n){return"Lines"},"stats:export:submit":function(n){return"Export stats"},"stats:export:fileName":function(n){return"WMES_Plan_Execution_"+e.v(n,"from")+"_"+e.v(n,"to")},"stats:export:sheetName":function(n){return"Plan exec. "+e.v(n,"from")+"-"+e.v(n,"to")},"stats:date":function(n){return"Date"},"stats:mrp":function(n){return"MRP"},"stats:line":function(n){return"Line"},"stats:orderCount":function(n){return"Order count"},"stats:quantity":function(n){return"Quantity"},"stats:manHours":function(n){return"Man-hours"},"stats:hourlyPlan":function(n){return"Hourly plan"},"transport:export:title":function(n){return"Exporting transport plan"},"transport:export:mrps":function(n){return"MRP"},"transport:export:lines":function(n){return"Lines"},"transport:export:submit":function(n){return"Export transport plan"},"transport:export:fileName":function(n){return"WMES_Plan_Transport"},"transport:export:sheetName":function(n){return"Plan trans. "+e.v(n,"from")+"-"+e.v(n,"to")},"transport:date":function(n){return"Date"},"transport:time":function(n){return"Time"},"transport:shiftNo":function(n){return"Shift"},"transport:line":function(n){return"Line"},"transport:mrp":function(n){return"MRP"},"transport:orderNo":function(n){return"Production order"},"transport:salesOrderNo":function(n){return"Sales order"},"transport:salesOrderItem":function(n){return"Sales order item"},"transport:quantity":function(n){return"Quantity"},"orderStatus:planned":function(n){return"Planned"},"orderStatus:unplanned":function(n){return"Not planned"},"orderStatus:incomplete":function(n){return"Incomplete"},"orderStatus:started":function(n){return"Started"},"orderStatus:completed":function(n){return"Completed"},"orderStatus:surplus":function(n){return"Surplus"},"orderPriority:unclassified":function(n){return"Unclassified"},"orderPriority:small":function(n){return"Small"},"orderPriority:easy":function(n){return"Easy"},"orderPriority:hard":function(n){return"Difficult"},"settings:title":function(n){return"Plan settings edit form"},"settings:msg:success":function(n){return"Settings saved successfully."},"settings:msg:failure":function(n){return"Failed to save the settings!"},"settings:submit":function(n){return"Save settings"},"settings:forceWorkDay":function(n){return"Force work day"},"settings:forceWorkDay:help":function(n){return"Treat this date as a working day (plan will be generated even if there are no orders for the specified date)."},"settings:freezeHour":function(n){return"Order freeze hour"},"settings:freezeHour:help":function(n){return"Hour after which the planned orders will be automatically frozen. Orders are frozen after the first SAP order import up to 30 minutes before the specified hour (if the import occurs), or after the first plan recalculation after the specified hour. For example, given a plan for 2018-01-12 with Freeze hour set to 23, the orders will be frozen 2018-01-11 at 22:45, if at 22:45 SAP orders will be imported or after the first manual plan change after hour 23:00."},"settings:lateHour":function(n){return"Late order start hour"},"settings:lateHour:help":function(n){return"Hour from which the manually added, urgent orders (late) can be planned."},"settings:etoPilotHour":function(n){return"ETO pilot start hour"},"settings:etoPilotHour:help":function(n){return"Hour from which orders with the <em>E</em> priority (ETO pilot) can be planned."},"settings:schedulingRate":function(n){return"Scheduling rate"},"settings:schedulingRate:help":function(n){return"Coefficient that changes the time required to do a single PCE: <code>OrderLaborTime / 100 / LineWorkerCount * 3600 * SchedulingRate</code>"},"settings:requiredStatuses":function(n){return"Required statuses"},"settings:requiredStatuses:help":function(n){return"List of all statuses that an order must have to be taken into consideration during planning."},"settings:ignoredStatuses":function(n){return"Ignored statuses"},"settings:ignoredStatuses:help":function(n){return"List of statuses that an order must not have to be taken into consideration during planning."},"settings:completedStatuses":function(n){return"Completed order statuses"},"settings:completedStatuses:help":function(n){return"List of ignored statuses that determine whether an order is completed. Order with these statuses will remain in the plan, but won't be planned on lines."},"settings:ignoredWorkCenters":function(n){return"Ignored WorkCenters"},"settings:ignoredWorkCenters:help":function(n){return"List of WorkCenters that the chosen order's operation must not have to be taken into consideration during planning."},"settings:ignoreCompleted":function(n){return"Ignore completed orders"},"settings:ignoreCompleted:help":function(n){return"Orders with <em>Total quantity done</em> greater or equal to <em>Total quantity todo</em> will not be taken into consideration during planning."},"settings:useRemainingQuantity":function(n){return"Plan according to the remaining quantity"},"settings:useRemainingQuantity:help":function(n){return"Use the order's <em>Remaining quantity</em> instead of <em>Total quantity todo</em>. Remaining quantity is equal to <em>Total quantity todo</em> minus <em>Total quantity done</em>."},"settings:hardComponents":function(n){return"Difficult components"},"settings:hardComponents:help":function(n){return"A <em>Big</em> order will be classified as <em>Difficult</em> if it contains one of the following components."},"settings:line":function(n){return"Line settings"},"settings:line:placeholder":function(n){return"Production line..."},"settings:mrpPriority":function(n){return"MRP priority"},"settings:mrpPriority:help":function(n){return"List of order MRPs that can be done on this line. Order matters."},"settings:mrpPriority:placeholder":function(n){return"MRP controllers..."},"settings:activeTime":function(n){return"Activity time"},"settings:activeTime:help":function(n){return"Time of line availability on a given day. The value applies to all assigned MRP controllers."},"settings:mrp":function(n){return"MRP controller settings"},"settings:mrp:help":function(n){return"Select an MRP controller for which you want to define settings"},"settings:mrp:placeholder":function(n){return"MRP controller..."},"settings:limitSmallOrders":function(n){return"Limit small orders"},"settings:limitSmallOrders:help":function(n){return"During the first planning pass, the number of small orders that can be placed on a single line is limited by the number of lines that accept small orders. For example, MRP has 30 small orders and 5 lines that accept small orders. If the option is disabled, the first line will be completely filled with small orders. If the option is enabled, then each line will have 30/5=6 small orders."},"settings:extraOrderSeconds":function(n){return"Extra order duration"},"settings:extraOrderSeconds:help":function(n){return"Number of seconds added to each planned order except the one stared at the beginning of the production shift."},"settings:extraShiftSeconds":function(n){return"Time to start the shift"},"settings:extraShiftSeconds:1":function(n){return"Time to start the I shift"},"settings:extraShiftSeconds:2":function(n){return"Time to start the II shift"},"settings:extraShiftSeconds:3":function(n){return"Time to start the III shift"},"settings:extraShiftSeconds:help":function(n){return"Number of seconds added to the first order at the beginning of the production shift."},"settings:bigOrderQuantity":function(n){return"Big order"},"settings:bigOrderQuantity:help":function(n){return"Minimum quantity todo, after which the order is classified as <em>Big</em>. Big orders can be <em>Easy</em> or <em>Difficult</em>."},"settings:hardOrderManHours":function(n){return"Difficult order"},"settings:hardOrderManHours:help":function(n){return"Minimum number of man-hours, after which a <em>Big</em> order is classified as <em>Difficult</em>."},"settings:splitOrderQuantity":function(n){return"Order split quantity"},"settings:splitOrderQuantity:help":function(n){return"Minimum quantity todo, after which a <em>Big</em> order is split into multiple parts."},"settings:maxSplitLineCount":function(n){return"Order parts"},"settings:maxSplitLineCount:help":function(n){return"Maximum number of lines for which a <em>Big</em> order can be split. Zero - maximum available number of lines."},"settings:mrpLine":function(n){return"Line in MRP settings"},"settings:mrpLine:help":function(n){return"Select a line for which you want to define settings in the context of the selected MRP controller."},"settings:mrpLine:placeholder":function(n){return"Production line..."},"settings:workerCount":function(n){return"Worker count"},"settings:workerCount:shift":function(n){return"shift "+e.v(n,"shiftNo")+":"},"settings:orderPriority":function(n){return"Order priority"},"settings:orderPriority:help":function(n){return"Order of production orders based on their classification: small, easy, difficult. Easy and difficult orders are also big."},"settings:groups":function(n){return"Groups"},"settings:groups:no":function(n){return"No"},"settings:groups:splitOrderQuantity":function(n){return"Split quantity"},"settings:groups:lines":function(n){return"Lines"},"settings:groups:components":function(n){return"Components"},"settings:groups:add":function(n){return"Add group"},"settings:groups:remove":function(n){return"Remove group"},"settings:locked":function(n){return"Locked"},"settings:tab:wh":function(n){return"Warehouse"},"settings:wh:groupDuration":function(n){return"Order group duration [h]"},"settings:wh:groupExtraItems":function(n){return"Minimum quantity in group"},"settings:wh:groupExtraItems:help":function(n){return"If quantity of an order in the first/last group of a given line is lower or equal to the specified value, then that group will be merged with the next/previous group."},"settings:wh:sortByLines":function(n){return"Sort orders in groups by line"},"settings:wh:ignoredMrps":function(n){return"Ignored MRP (in the old module)"},"settings:wh:newIncludedMrps":function(n){return"Enabled MRP (in the new module)"},"changes:hd":function(n){return"<span class='planning-change-when'>"+e.v(n,"when")+"</span> by <span class='planning-change-who'>"+e.v(n,"who")+"</span>: <span class='planning-change-what'>"+e.v(n,"what")+"</span>"},"changes:what:settings":function(n){return e.v(n,"count")+" setting "+e.p(n,"count",0,"en",{one:"change",other:"changes"})},"changes:what:addedOrders":function(n){return e.v(n,"count")+" added "+e.p(n,"count",0,"en",{one:"order",other:"orders"})},"changes:what:changedOrders":function(n){return e.v(n,"count")+" changed "+e.p(n,"count",0,"en",{one:"order",other:"orders"})},"changes:what:removedOrders":function(n){return e.v(n,"count")+" deleted "+e.p(n,"count",0,"en",{one:"order",other:"orders"})},"changes:what:changedLines":function(n){return e.v(n,"count")+" changed "+e.p(n,"count",0,"en",{one:"line plan",other:"line plans"})},"changes:removedOrders:REQUIRED_STATUS":function(n){return"No required status: "+e.v(n,"requiredStatus")+"."},"changes:removedOrders:IGNORED_STATUS":function(n){return"Ignored status: "+e.v(n,"ignoredStatus")+"."},"changes:removedOrders:MISSING_ORDER":function(n){return"Missing SAP order for the given day."},"changes:removedOrders:INCOMPLETE_DONE":function(n){return"Incomplete order from the previous day was completed."},"changes:settings:lines:remove":function(n){return"Removed line <em>"+e.v(n,"line")+"</em>"},"changes:settings:mrps:remove":function(n){return"Removed MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:mrpLines:remove":function(n){return"Removed line <em>"+e.v(n,"line")+"</em> from MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:lines:change":function(n){return"Changed line <em>"+e.v(n,"line")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:mrps:change":function(n){return"Changed MRP <em>"+e.v(n,"mrp")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:mrpLines:change":function(n){return"Changed line <em>"+e.v(n,"line")+"</em> in MRP <em>"+e.v(n,"mrp")+"</em>: <em>"+e.v(n,"property")+"</em>: "},"changes:settings:lines:add":function(n){return"Added line <em>"+e.v(n,"line")+"</em>"},"changes:settings:mrps:add":function(n){return"Added MRP <em>"+e.v(n,"mrp")+"</em>"},"changes:settings:mrpLines:add":function(n){return"Added line <em>"+e.v(n,"line")+"</em> to MRP <em>"+e.v(n,"mrp")+"</em>"},"copySettings:title":function(n){return"Copying line settings"},"copySettings:submit":function(n){return"Copy settings"},"copySettings:source":function(n){return"Source plan"},"copySettings:target":function(n){return"Target plans"},"copySettings:target:all":function(n){return"All"},"copySettings:target:empty":function(n){return"No target plans."},"copySettings:mrps:all":function(n){return"All"},"copySettings:mrps:in":function(n){return"All selected MRPs"},"copySettings:mrps:nin":function(n){return"All but the selected MRPs"},"copySettings:mrps:empty":function(n){return"No MRPs to copy are selected."},"copySettings:what":function(n){return"Copy"},"copySettings:what:empty":function(n){return"No settings to copy are selected."},"copySettings:what:workerCount":function(n){return"Worker counts"},"copySettings:what:activeTime":function(n){return"Activity times"},"copySettings:what:orderPriority":function(n){return"Order priorities"},"copySettings:failure:fetchSettings":function(n){return"Failed to fetch settings for "+e.v(n,"plan")+"."}},pl:!0}});