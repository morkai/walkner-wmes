define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,i,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[i](n[r]-e))in o?o[r]:o.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"BREADCRUMBS:base":function(n){return"Paint shop"},"BREADCRUMBS:load":function(n){return"Load"},"BREADCRUMBS:settings":function(n){return"Settings"},"MSG:date:failure":function(n){return"Failed to find date."},"MSG:date:empty":function(n){return"No orders."},"MSG:start:failure":function(n){return"Failed to start order."},"MSG:continue:failure":function(n){return"Failed to continue order."},"MSG:finish:failure":function(n){return"Failed to finish order."},"MSG:reset:failure":function(n){return"Failed to reset order."},"MSG:cancel:failure":function(n){return"Failed to cancel order."},"MSG:deliver:failure":function(n){return"Failed to deliver order."},"MSG:search:failure":function(n){return"Order not found."},"PAGE_ACTIONS:drilling":function(n){return"Drilling"},"PAGE_ACTIONS:load":function(n){return"Load"},"PAGE_ACTIONS:paints":function(n){return"Paints"},"PAGE_ACTIONS:settings":function(n){return"Settings"},"PAGE_ACTIONS:exportPlanExecution":function(n){return"Export plan"},"PROPERTY:order":function(n){return"Order"},"PROPERTY:nc12":function(n){return"Product 12NC"},"PROPERTY:name":function(n){return"Product/component name"},"PROPERTY:qty":function(n){return"Quantity"},"PROPERTY:qtyDone":function(n){return"Quantity painted"},"PROPERTY:qtyDone:drilling":function(n){return"Quantity drilled"},"PROPERTY:qtyPaint":function(n){return"Quantity to paint"},"PROPERTY:qtyPaint:drilling":function(n){return"Quantity to drill"},"PROPERTY:qtyDlv":function(n){return"Quantity to deliver"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:startTime":function(n){return"Assembly time"},"PROPERTY:placement":function(n){return"Placement"},"PROPERTY:no":function(n){return"No"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:startedAt":function(n){return"Started at"},"PROPERTY:finishedAt":function(n){return"Finished at"},"PROPERTY:comment":function(n){return"Comment"},"PROPERTY:cabin":function(n){return"Cabin"},"status:new":function(n){return"Pending"},"status:started":function(n){return"Started"},"status:finished":function(n){return"Finished"},"status:partial":function(n){return"Partial"},"status:cancelled":function(n){return"Cancelled"},"status:delivered":function(n){return"Delivered"},"action:start":function(n){return"Start"},"action:start:cabin":function(n){return"<small>Start</small>Cabin "+t.v(n,"cabin")},"action:finish":function(n){return"Finish"},"action:cancel":function(n){return"Cancel"},"action:reset":function(n){return"Reset"},"action:continue":function(n){return"Continue"},"action:continue:cabin":function(n){return"<small>Continue</small>Cabin "+t.v(n,"cabin")},"action:comment":function(n){return"Comment"},"action:deliver":function(n){return"Deliver"},"datePicker:d0":function(n){return"Today"},"datePicker:d+1":function(n){return"Tomorrow"},"datePicker:d+2":function(n){return"Day after tomorrow"},"datePicker:d-1":function(n){return"Yesterday"},"datePicker:d-2":function(n){return"Day before yesterday"},"datePicker:submit":function(n){return"Pick date"},"datePicker:placeholder:day":function(n){return"dd"},"datePicker:placeholder:month":function(n){return"mm"},"datePicker:placeholder:year":function(n){return"yyyy"},"datePicker:invalid":function(n){return"Enter a valid date."},"paintPicker:select":function(n){return"Pick"},"paintPicker:msp":function(n){return"MSP"},"paintPicker:all":function(n){return"All"},"userPicker:guest":function(n){return"Log in"},"userPicker:logIn":function(n){return"Log in"},"userPicker:logOut":function(n){return"Log out"},"tabs:all":function(n){return"All"},"tabs:dropZone":function(n){return"Drop zone called"},"tabs:paint:all":function(n){return"All paints"},"tabs:paint:msp":function(n){return"MSP paints"},empty:function(n){return"No orders for the specified date."},multiPaint:function(n){return"WARNING! Order with "+t.p(n,"count",0,"en",{one:"a single paint",2:"two paints",other:t.v(n,"count")+" paints"})+"."},noPaints:function(n){return"WARNING! Order with no paints."},drilling:function(n){return"WARNING! Components for drilling."},"orderChanges:change:reset":function(n){return"Reset order."},"orderChanges:change:cancel":function(n){return"Cancelled order."},"orderChanges:change:start":function(n){return t.s(n,"cabin",{1:"Started order in the first cabin.",2:"Started order in the second cabin.",other:"Started order."})},"orderChanges:change:finish":function(n){return"Finished "+t.v(n,"qtyDone")+" PCE"},"orderChanges:change:continue":function(n){return t.s(n,"cabin",{1:"Resumed order in the first cabin",2:"Resumed order in the second cabin",other:"Resumed order."})},"orderChanges:change:deliver":function(n){return"Delivered "+t.v(n,"qtyDlv")+" PCE"},"menu:header:mrp":function(n){return t.v(n,"mrp")},"menu:header:all":function(n){return"All MRPs"},"menu:openOrder":function(n){return"Open "+t.s(n,"orderNo",{parent:"parent order",other:"order "+t.v(n,"orderNo")})},"menu:copyOrder":function(n){return"Copy order no"},"menu:copyOrders":function(n){return"Copy order nos"},"menu:copyOrders:success":function(n){return"List copied to clipboard."},"menu:copyChildOrders":function(n){return"Copy child order nos"},"menu:copyChildOrders:success":function(n){return"List copied to clipboard."},"menu:printOrder":function(n){return"Print order"},"menu:printOrders":function(n){return"Print orders"},"menu:printOrders:all":function(n){return"Print all orders"},"menu:printOrders:mrp":function(n){return"Print "+t.v(n,"mrp")+" orders"},"menu:exportOrders":function(n){return"Export orders"},"menu:exportPaints":function(n){return"Export paints"},"menu:dropZone:true":function(n){return"Recall drop zone"},"menu:dropZone:false":function(n){return"Call drop zone"},"menu:dropZone:failure":function(n){return"Failed to change the drop zone state."},"load:stats:last":function(n){return"Last"},"load:stats:current":function(n){return"Current"},"load:stats:10m":function(n){return"10 minutes"},"load:stats:1h":function(n){return"Hour"},"load:stats:shift":function(n){return"Shift"},"load:stats:8h":function(n){return"8 Hours"},"load:stats:1d":function(n){return"24 hours"},"load:stats:7d":function(n){return"7 days"},"load:stats:30d":function(n){return"30 days"},"load:report:filename":function(n){return"WMES_PaintShopLoad"},"load:report:title":function(n){return"Paint shop load"},"load:report:avgDuration":function(n){return"Average cycle time"},"load:report:count":function(n){return"Count"},"settings:tab:planning":function(n){return"Planning"},"settings:tab:load":function(n){return"Load"},"settings:planning:workCenters":function(n){return"WorkCenters"},"settings:planning:workCenters:help":function(n){return"WorkCenters used during the generation of the paint shop order queue to load paint shop child orders for the planned production orders."},"settings:planning:drillingWorkCenters":function(n){return"Drilling WorkCenters"},"settings:planning:drillingWorkCenters:help":function(n){return"Unpainted orders must have at least one operation with one of the following WorkCenter to be treated as drilling orders."},"settings:planning:mspPaints":function(n){return"MSP paints"},"settings:planning:mspPaints:help":function(n){return"Paints belonging to the MSP group."},"settings:planning:unpaintedMrps":function(n){return"Unpainted MRPs"},"settings:planning:unpaintedMrps:help":function(n){return"Orders with the specified MRPs won't be ignored even if they don't have any paints."},"settings:load:statuses":function(n){return"Statuses"},"settings:load:statuses:from":function(n){return"From [s]"},"settings:load:statuses:to":function(n){return"To [s]"},"settings:load:statuses:icon":function(n){return"Icon"},"settings:load:statuses:color":function(n){return"Color"},"settings:load:statuses:add":function(n){return"Add status"},"mrp:all":function(n){return"All MRPs"},"mrp:KSJ":function(n){return"Drilling"},"planExecutionExport:title":function(n){return"Export plan execution"},"planExecutionExport:date":function(n){return"Date"},"planExecutionExport:mrp":function(n){return"MRP"},"planExecutionExport:submit":function(n){return"Export data"},"planExecutionExport:cancel":function(n){return"Cancel"},"printPage:title":function(n){return"Paint-shop plan for "+t.v(n,"date")},"printPage:title:drilling":function(n){return"Drilling plan for "+t.v(n,"date")},"printPage:hd":function(n){return"Paint-shop plan"},"printPage:hd:drilling":function(n){return"Drilling plan"},"printPage:ft":function(n){return"Paint-shop plan for "+t.v(n,"date")+"."},"printPage:ft:drilling":function(n){return"Drilling plan for "+t.v(n,"date")+"."},"printPage:info":function(n){return"Press <kbd>Ctrl+P</kbd> to start printing."},"printPage:date":function(n){return"Date:"},"printPage:mrp":function(n){return"MRP:"},"printPage:order":function(n){return"Order:"},"printPage:page":function(n){return"Page "+t.v(n,"n")+" of "+t.v(n,"total")},"printPage:printed":function(n){return"Printed on "+t.v(n,"time")+" by "+t.v(n,"user")+" with WMES."}},pl:!0}});