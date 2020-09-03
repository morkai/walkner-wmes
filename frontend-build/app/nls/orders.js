define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,o,u){return t.c(n,e),n[e]in u?u[n[e]]:(e=t.lc[o](n[e]-r))in u?u[e]:u.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"BREADCRUMB:browse":function(n){return"Production orders"},"BREADCRUMB:settings":function(n){return"Settings"},"PAGE_ACTION:settings":function(n){return"Change settings"},"PAGE_ACTION:print":function(n){return"Print order"},"PAGE_ACTION:openOrdersPrint":function(n){return"Print orders"},"PAGE_ACTION:jump:title":function(n){return"Jump to order by no"},"PAGE_ACTION:jump:placeholder":function(n){return"Order no"},"PAGE_ACTION:cycleTime":function(n){return"Cycle time"},"PAGE_ACTION:notes":function(n){return"Notes"},"PAGE_ACTION:tags":function(n){return"Tags"},"LIST:ACTION:print":function(n){return"Print"},"openOrdersPrint:title":function(n){return"Order printing"},"openOrdersPrint:orders":function(n){return"Enter order numbers:"},"openOrdersPrint:submit":function(n){return"Print orders"},"openOrdersPrint:msg:findFailure":function(n){return"Failed to find orders."},"openOrdersPrint:msg:notFound":function(n){return t.p(n,"count",0,"en",{one:"Order "+t.v(n,"orders")+" doesn't exist.",other:"Orders don't exist: "+t.v(n,"orders")})},"PANEL:TITLE:fap":function(n){return"FAP entries"},"PANEL:TITLE:downtimes":function(n){return"Downtimes"},"PANEL:TITLE:childOrders":function(n){return"Child orders"},"PANEL:TITLE:operations":function(n){return"Operations"},"PANEL:TITLE:documents":function(n){return"Documents"},"PANEL:TITLE:bom":function(n){return"Components"},"PANEL:TITLE:bom:paint":function(n){return"Paint-shop components"},"PANEL:TITLE:eto":function(n){return"ETO"},"PANEL:TITLE:changes":function(n){return"History"},"PANEL:TITLE:notes":function(n){return"Notes"},"PROPERTY:_id":function(n){return"Order no"},"PROPERTY:sapCreatedAt":function(n){return"Created at"},"PROPERTY:createdAt":function(n){return"Imported at"},"PROPERTY:updatedAt":function(n){return"Updated at"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:name":function(n){return"Product name"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qtys":function(n){return"Quantity"},"PROPERTY:qty":function(n){return"Quantity todo"},"PROPERTY:qtyDone":function(n){return"Quantity done"},"PROPERTY:unit":function(n){return"Unit"},"PROPERTY:startDate":function(n){return"Start date (basic)"},"PROPERTY:finishDate":function(n){return"Finish date (basic)"},"PROPERTY:scheduledStartDate":function(n){return"Start date (scheduled)"},"PROPERTY:scheduledFinishDate":function(n){return"Finish date (scheduled)"},"PROPERTY:leadingOrder":function(n){return"Leading order"},"PROPERTY:salesOrder":function(n){return"Sales order"},"PROPERTY:salesOrderItem":function(n){return"Sales order item"},"PROPERTY:priority":function(n){return"Priority"},"PROPERTY:description":function(n){return"Description"},"PROPERTY:soldToParty":function(n){return"Sold-to party"},"PROPERTY:delayReason":function(n){return"Delay reason"},"PROPERTY:delayComponent":function(n){return"Delayed component"},"PROPERTY:statuses":function(n){return"Status"},"PROPERTY:operations":function(n){return"Operations"},"PROPERTY:operations.no":function(n){return"Operation no"},"PROPERTY:operations.workCenter":function(n){return"WorkCenter"},"PROPERTY:operations.name":function(n){return"Name"},"PROPERTY:operations.qty":function(n){return"Quantity"},"PROPERTY:operations.qtyMax":function(n){return"Max."},"PROPERTY:operations.unit":function(n){return"Unit"},"PROPERTY:operations.machineSetupTime":function(n){return"<em>Machine Setup</em> Time"},"PROPERTY:operations.laborSetupTime":function(n){return"<em>Labor Setup</em> Time"},"PROPERTY:operations.machineTime":function(n){return"<em>Machine</em> Time"},"PROPERTY:operations.laborTime":function(n){return"<em>Labor</em> Time"},"PROPERTY:documents":function(n){return"Documents"},"PROPERTY:documents.item":function(n){return"Item"},"PROPERTY:documents.nc15":function(n){return"15NC"},"PROPERTY:documents.name":function(n){return"Document name"},"PROPERTY:bom":function(n){return"Components"},"PROPERTY:bom.orderNo":function(n){return"Order"},"PROPERTY:bom.mrp":function(n){return"MRP"},"PROPERTY:bom.item":function(n){return"Item"},"PROPERTY:bom.nc12":function(n){return"12NC"},"PROPERTY:bom.name":function(n){return"Name"},"PROPERTY:bom.qty":function(n){return"Quantity"},"PROPERTY:bom.unit":function(n){return"Unit"},"PROPERTY:bom.unloadingPoint":function(n){return"Unloading point"},"PROPERTY:bom.supplyArea":function(n){return"Supply area"},"PROPERTY:bom.distStrategy":function(n){return"Dist. strategy"},"PROPERTY:whTime":function(n){return"Drop zone time"},"PROPERTY:whDropZone":function(n){return"Drop zone group"},"PROPERTY:whStatus":function(n){return"Drop zone status"},"PROPERTY:psStatus":function(n){return"Paint-shop status"},"PROPERTY:drillStatus":function(n){return"Drilling status"},"PROPERTY:enteredBy":function(n){return"Entered by"},"PROPERTY:changedBy":function(n){return"Changed by"},"PROPERTY:m4":function(n){return"4M"},"PROPERTY:etoCont":function(n){return"ETO Pilot continuation"},"PROPERTY:notes":function(n){return"Notes"},"PROPERTY:tags":function(n){return"Tags"},"m4:man":function(n){return"Man"},"m4:machine":function(n){return"Machine"},"m4:material":function(n){return"Material"},"m4:method":function(n){return"Method"},"whStatus:unknown":function(n){return"Unknown"},"whStatus:todo":function(n){return"Todo"},"whStatus:done":function(n){return"Done"},"psStatus:unknown":function(n){return"Unknown"},"psStatus:new":function(n){return"Waiting"},"psStatus:started":function(n){return"Started"},"psStatus:startedMsp":function(n){return"Started (MSP)"},"psStatus:partial":function(n){return"Partial"},"psStatus:finished":function(n){return"Finished"},"psStatus:aside":function(n){return"Set aside"},"psStatus:cancelled":function(n){return"Cancelled"},"drillStatus:unknown":function(n){return"Unknown"},"drillStatus:new":function(n){return"Waiting"},"drillStatus:started":function(n){return"Started"},"drillStatus:partial":function(n){return"Partial"},"drillStatus:finished":function(n){return"Finished"},"drillStatus:aside":function(n){return"Set aside"},"drillStatus:cancelled":function(n){return"Cancelled"},"OPERATIONS:NO_DATA":function(n){return"No operations."},"DOCUMENTS:NO_DATA":function(n){return"No documents."},"BOM:NO_DATA":function(n){return"No components."},"ETO:NO_DATA":function(n){return"No ETO."},"NOTES:NO_DATA":function(n){return"No messages."},"changes:NO_DATA":function(n){return"Order was not modified."},"changes:operations":function(n){return t.p(n,"count",0,"en",{one:"1 operation",other:t.n(n,"count")+" operations"})},"changes:documents":function(n){return t.p(n,"count",0,"en",{one:"1 document",other:t.n(n,"count")+" documents"})},"changes:bom":function(n){return t.p(n,"count",0,"en",{one:"1 component",other:t.n(n,"count")+" components"})},"changes:notes":function(n){return t.p(n,"count",0,"en",{one:"1 note",other:t.n(n,"count")+" notes"})},"changes:change":function(n){return"Change #"+t.v(n,"no")},"changes:time":function(n){return"Time"},"changes:user":function(n){return"User"},"changes:property":function(n){return"Property"},"changes:oldValue":function(n){return"Old value"},"changes:newValue":function(n){return"New value"},"changes:qtyMax":function(n){return"Max. quantity for <em>"+t.v(n,"operationNo")+"</em>"},"changes:toggleSystemChanges":function(n){return"Hide system changes"},"changes:timeEditor:error:format":function(n){return"Invalid format. Expected yyyy-mm-dd hh:mm:ss."},"changes:timeEditor:error:min":function(n){return"Value must be after: "+t.v(n,"time")},"changes:timeEditor:error:max":function(n){return"Value must be before: "+t.v(n,"time")},"filter:id:order":function(n){return"Order"},"filter:id:product":function(n){return"Product"},"filter:id:component":function(n){return"Component"},"filter:id:document":function(n){return"Document"},"filter:statuses:in":function(n){return"Required statuses"},"filter:statuses:nin":function(n){return"Ignored statuses"},"filter:submit":function(n){return"Filter orders"},"details:showMoreLink":function(n){return"Show more order details"},"details:opTimes:sap":function(n){return"SAP time"},"details:opTimes:actual":function(n){return"Time with coefficient"},"details:opTimes:summed":function(n){return"Grouped time"},"commentForm:delayReason":function(n){return"New delay reason"},"commentForm:delayComponent":function(n){return"12NC"},"commentForm:source":function(n){return"Source"},"commentForm:source:other":function(n){return"Other"},"commentForm:source:ps":function(n){return"Paint shop"},"commentForm:source:wh":function(n){return"Warehouse"},"commentForm:comment":function(n){return"Comment"},"commentForm:submit:comment":function(n){return"Comment"},"commentForm:submit:edit":function(n){return"Change delay reason"},"settings:tab:operations":function(n){return"Operations"},"settings:tab:documents":function(n){return"Documents"},"settings:tab:iptChecker":function(n){return"IPT checker"},"settings:operations:groups":function(n){return"Operation groups"},"settings:operations:groups:help":function(n){return"Each line should contain operation names which should belong to the same group, separated by the <code>|</code> character. Each operation name may be additionaly filtered to a WorkCenter by adding it after the <code>@</code> character.<br>For example: <code>punching @ PIVATIC5 | bending</code>"},"settings:operations:timeCoeffs":function(n){return"Operation time coefficients"},"settings:operations:timeCoeffs:help":function(n){return"Each line should contain order's MRP for which operation times from SAP should be adjusted, followed by names of the operation times and values of the coefficients.<br>Available time names are: <code>machineSetup</code>, <code>machine</code>, <code>laborSetup</code> and <code>labor</code>.<br>For example: <code>KE3: labor=0.8 machineSetup=1.1</code>"},"settings:documents:excludedMrps":function(n){return"MRPs excluded from the document import"},"settings:documents:extra":function(n){return"Extra documents"},"settings:iptChecker:toBusinessDays":function(n){return"Number of days to check"},"settings:iptChecker:mrps":function(n){return"MRPs to check"},"jumpList:details":function(n){return"Details_1"},"jumpList:fap":function(n){return"FAP entries_2"},"jumpList:downtimes":function(n){return"Downtimes_3"},"jumpList:childOrders":function(n){return"Child orders_4"},"jumpList:operations":function(n){return"Operations_5"},"jumpList:documents":function(n){return"Documents_Q"},"jumpList:notes":function(n){return"Notes_W"},"jumpList:bom":function(n){return"Components_E"},"jumpList:eto":function(n){return"ETO_R"},"jumpList:changes":function(n){return"Changes_T"},"changeQtyMax:link":function(n){return"change"},"notes:edit:button":function(n){return"Assign notes to order"},"notes:edit:title":function(n){return"Assigning notes to order"},"notes:edit:submit":function(n){return"Save notes"},"notes:edit:text":function(n){return"Note text"},"notes:edit:priority":function(n){return"Priority"},"notes:edit:add":function(n){return"Add note"},"notes:edit:clear":function(n){return"Clear all"},"notes:target:docs":function(n){return"Documentation"},"notes:target:ps":function(n){return"Paint-shop"}},pl:!0}});