define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,o,i){return t.c(n,e),n[e]in i?i[n[e]]:(e=t.lc[o](n[e]-r),e in i?i[e]:i.other)},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Production orders"},"BREADCRUMBS:settings":function(n){return"Settings"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the orders :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the order details :("},"MSG:jump:404":function(n){return"Couldn't find an order with no <em>"+t.v(n,"rid")+"</em> :("},"PAGE_ACTION:settings":function(n){return"Change settings"},"PAGE_ACTION:print":function(n){return"Print order"},"PAGE_ACTION:openOrdersPrint":function(n){return"Print orders"},"PAGE_ACTION:jump:title":function(n){return"Jump to order by no"},"PAGE_ACTION:jump:placeholder":function(n){return"Order no"},"LIST:ACTION:print":function(n){return"Print"},"openOrdersPrint:title":function(n){return"Order printing"},"openOrdersPrint:orders":function(n){return"Enter order numbers:"},"openOrdersPrint:submit":function(n){return"Print orders"},"openOrdersPrint:msg:findFailure":function(n){return"Failed to find orders :-("},"openOrdersPrint:msg:notFound":function(n){return t.p(n,"count",0,"en",{one:"Order "+t.v(n,"orders")+" doesn't exist.",other:"Orders don't exist: "+t.v(n,"orders")})},"PANEL:TITLE:details":function(n){return"Order's details"},"PANEL:TITLE:operations":function(n){return"Order's operations"},"PANEL:TITLE:documents":function(n){return"Order's documents"},"PANEL:TITLE:bom":function(n){return"Order's components"},"PANEL:TITLE:bom:paint":function(n){return"Order's paint components"},"PANEL:TITLE:eto":function(n){return"Order's ETO"},"PANEL:TITLE:changes":function(n){return"Change log"},"PROPERTY:_id":function(n){return"Order no"},"PROPERTY:sapCreatedAt":function(n){return"Created at"},"PROPERTY:createdAt":function(n){return"Imported at"},"PROPERTY:updatedAt":function(n){return"Updated at"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:name":function(n){return"Product name"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qtys":function(n){return"Quantity"},"PROPERTY:qty":function(n){return"Quantity todo"},"PROPERTY:qtyDone":function(n){return"Quantity done"},"PROPERTY:unit":function(n){return"Unit"},"PROPERTY:startDate":function(n){return"Start date (basic)"},"PROPERTY:finishDate":function(n){return"Finish date (basic)"},"PROPERTY:scheduledStartDate":function(n){return"Start date (scheduled)"},"PROPERTY:scheduledFinishDate":function(n){return"Finish date (scheduled)"},"PROPERTY:leadingOrder":function(n){return"Leading order"},"PROPERTY:salesOrder":function(n){return"Sales order"},"PROPERTY:salesOrderItem":function(n){return"Sales order item"},"PROPERTY:priority":function(n){return"Priority"},"PROPERTY:description":function(n){return"Description"},"PROPERTY:soldToParty":function(n){return"Sold-to party"},"PROPERTY:delayReason":function(n){return"Delay reason"},"PROPERTY:statuses":function(n){return"Status"},"PROPERTY:operations":function(n){return"Operations"},"PROPERTY:operations.no":function(n){return"Operation no"},"PROPERTY:operations.workCenter":function(n){return"WorkCenter"},"PROPERTY:operations.name":function(n){return"Name"},"PROPERTY:operations.qty":function(n){return"Quantity"},"PROPERTY:operations.unit":function(n){return"Unit"},"PROPERTY:operations.machineSetupTime":function(n){return"<em>Machine Setup</em> Time"},"PROPERTY:operations.laborSetupTime":function(n){return"<em>Labor Setup</em> Time"},"PROPERTY:operations.machineTime":function(n){return"<em>Machine</em> Time"},"PROPERTY:operations.laborTime":function(n){return"<em>Labor</em> Time"},"PROPERTY:documents":function(n){return"Documents"},"PROPERTY:documents.item":function(n){return"Item"},"PROPERTY:documents.nc15":function(n){return"15NC"},"PROPERTY:documents.name":function(n){return"Document name"},"PROPERTY:bom":function(n){return"Components"},"PROPERTY:bom.item":function(n){return"Item"},"PROPERTY:bom.nc12":function(n){return"12NC"},"PROPERTY:bom.name":function(n){return"Name"},"PROPERTY:bom.qty":function(n){return"Quantity"},"PROPERTY:bom.unit":function(n){return"Unit"},"PROPERTY:bom.unloadingPoint":function(n){return"Unloading point"},"OPERATIONS:NO_DATA":function(n){return"Order does not have any operations."},"DOCUMENTS:NO_DATA":function(n){return"Order does not have any linked documents."},"BOM:NO_DATA":function(n){return"Order does not have any components."},"ETO:NO_DATA":function(n){return"There is no ETO for this order's 12NC."},"CHANGES:NO_DATA":function(n){return"Order was not modified."},"CHANGES:operations":function(n){return t.p(n,"count",0,"en",{one:"1 operation",other:t.n(n,"count")+" operations"})},"CHANGES:documents":function(n){return t.p(n,"count",0,"en",{one:"1 document",other:t.n(n,"count")+" documents"})},"CHANGES:bom":function(n){return t.p(n,"count",0,"en",{one:"1 component",other:t.n(n,"count")+" components"})},"CHANGES:time":function(n){return"Time"},"CHANGES:user":function(n){return"User"},"CHANGES:property":function(n){return"Property"},"CHANGES:oldValue":function(n){return"Old value"},"CHANGES:newValue":function(n){return"New value"},"filter:placeholder:_id":function(n){return"Any order no"},"filter:placeholder:nc12":function(n){return"Any 12NC"},"filter:submit":function(n){return"Filter orders"},"details:showMoreLink":function(n){return"Show more order details"},"details:opTimes:sap":function(n){return"SAP time"},"details:opTimes:actual":function(n){return"Time with coefficient"},"details:opTimes:summed":function(n){return"Grouped time"},"commentForm:delayReason":function(n){return"New delay reason"},"commentForm:comment":function(n){return"Comment"},"commentForm:submit:comment":function(n){return"Comment"},"commentForm:submit:edit":function(n){return"Change delay reason"},"settings:tab:operations":function(n){return"Operations"},"settings:tab:documents":function(n){return"Documents"},"settings:operations:groups":function(n){return"Operation groups"},"settings:operations:groups:help":function(n){return"Each line should contain operation names which should belong to the same group, separated by the <code>|</code> character. Each operation name may be additionaly filtered to a WorkCenter by adding it after the <code>@</code> character.<br>For example: <code>punching @ PIVATIC5 | bending</code>"},"settings:operations:timeCoeffs":function(n){return"Operation time coefficients"},"settings:operations:timeCoeffs:help":function(n){return"Each line should contain order's MRP for which operation times from SAP should be adjusted, followed by names of the operation times and values of the coefficients.<br>Available time names are: <code>machineSetup</code>, <code>machine</code>, <code>laborSetup</code> and <code>labor</code>.<br>For example: <code>KE3: labor=0.8 machineSetup=1.1</code>"},"settings:documents:path":function(n){return"Path to a directory with the document files"},"settings:documents:extra":function(n){return"Extra documents"},"settings:documents:remoteServer":function(n){return"Document search engine server"},"settings:documents:useCatalog":function(n){return"Use the WMES document catalog for serving document files"},"jumpList:details":function(n){return"Details"},"jumpList:operations":function(n){return"Operations"},"jumpList:documents":function(n){return"Documents"},"jumpList:bom":function(n){return"Components"},"jumpList:eto":function(n){return"ETO"},"jumpList:changes":function(n){return"Changes"}},pl:!0}});