define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,i,o){return e.c(n,r),n[r]in o?o[n[r]]:(r=e.lc[i](n[r]-t),r in o?o[r]:o.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Hourly plans"},"BREADCRUMBS:addForm":function(n){return"Choosing"},"BREADCRUMBS:editForm":function(n){return"Planning"},"BREADCRUMBS:heffLineStates":function(n){return"Hourly efficiency"},"BREADCRUMBS:planning":function(n){return"Planning"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the hourly plans :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the hourly plan :("},"MSG:DELETED":function(n){return"Hourly plan <em>"+e.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:print":function(n){return"Show printable version"},"PAGE_ACTION:add":function(n){return"Plan"},"PAGE_ACTION:edit":function(n){return"Edit hourly plan"},"PAGE_ACTION:delete":function(n){return"Delete hourly plan"},"PAGE_ACTION:export":function(n){return"Export hourly plans"},"PAGE_ACTION:heff":function(n){return"Hourly efficiency"},"PAGE_ACTION:planning":function(n){return"Planning"},"panel:title":function(n){return"Hourly plan"},"panel:title:editable":function(n){return"Hourly plan edit form"},"panel:info":function(n){return"All changes are saved on-the-fly. Planned quantities will be divided among the working Production lines one minute after the last change!"},"column:flow":function(n){return"Production flow"},"column:noPlan":function(n){return"No<br>plan?"},"column:level":function(n){return"Level"},"property:shift":function(n){return"Shift"},"property:date":function(n){return"Date"},"print:hdLeft":function(n){return"Hourly plan for "+e.v(n,"division")},"print:hdRight":function(n){return e.v(n,"date")+", "+e.v(n,"shift")+" shift"},"addForm:panel:title":function(n){return"Hourly plan find/create form"},"addForm:submit":function(n){return"Plan"},"addForm:msg:offline":function(n){return"Cannot plan: no connection to the server :("},"addForm:msg:failure":function(n){return"Failed to find/create the hourly plan for editing: "+e.s(n,"error",{AUTH:"no privileges!",INPUT:"invalid input data!",other:e.v(n,"error")})},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Hourly plan deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete hourly plan"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen hourly plan?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> hourly plan?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the hourly plan :-("},"heff:filter:division":function(n){return"Division"},"heff:filter:prodFlows":function(n){return"Flows"},"heff:filter:submit":function(n){return"Filter lines"},"planning:unit":function(n){return"PCE"},"planning:msg:filesOnly":function(n){return"Only files with an orders queue may be dropped!"},"planning:msg:invalidFile":function(n){return"Dropped an invalid file!"},"planning:msg:upload:failure":function(n){return"Failed to upload the file :("},"planning:msg:upload:success":function(n){return"File was uploaded successfully :)"},"planning:import:title":function(n){return"Orders queue importing"},"planning:import:date":function(n){return"Date"},"planning:import:mrps":function(n){return"MRP Controller (# of orders)"},"planning:import:submit":function(n){return"Import orders queue"},"planning:import:cancel":function(n){return"Cancel"},"planning:filter:date":function(n){return"Date"},"planning:filter:mrp":function(n){return"MRP"},"planning:filter:generatePlans":function(n){return"Recount plans"},"planning:filter:savePlans":function(n){return"Save plans"},"planning:filter:setHourlyPlans":function(n){return"Set hourly quantities"},"planning:toolbar:generatePlan":function(n){return"Recount plan"},"planning:toolbar:savePlan":function(n){return"Save plan"},"planning:toolbar:setHourlyPlan":function(n){return"Set hourly quantities"},"planning:toolbar:printPlan":function(n){return"Print line plan"},"planning:lines:hd":function(n){return"Lines"},"planning:lines:edit":function(n){return"Set available lines"},"planning:lines:division":function(n){return"Division"},"planning:lines:prodFlow":function(n){return"Flow"},"planning:lines:prodLine":function(n){return"Line"},"planning:lines:activeFrom":function(n){return"Active from"},"planning:lines:activeTo":function(n){return"Active to"},"planning:lines:workerCount":function(n){return"Workers"},"planning:orders:hd":function(n){return"Orders"},"planning:orders:edit":function(n){return"Set orders queue"},"planning:orders:_id":function(n){return"Order"},"planning:orders:nc12":function(n){return"12NC"},"planning:orders:name":function(n){return"Product"},"planning:orders:operation":function(n){return"Operation"},"planning:orders:machineTime":function(n){return"Machine Time"},"planning:orders:laborTime":function(n){return"Labor Time"},"planning:orders:qty":function(n){return"Quantity"},"planning:orders:statuses":function(n){return"Status"},"planning:lineOrders:orderNo":function(n){return"Order"},"planning:lineOrders:qty":function(n){return"Quantity"},"planning:lineOrders:pceTime":function(n){return"Time per 1 PCE"},"planning:lineOrders:time":function(n){return"Start-finish time"},"planning:lineOrders:duration":function(n){return"Duration"},"planning:lineOrders:incomplete":function(n){return"("+e.v(n,"qty")+" incomplete)"}},pl:!0}});