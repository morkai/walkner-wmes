define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,r){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(r||0)},v:function(t,r){return n.c(t,r),t[r]},p:function(t,r,e,o,i){return n.c(t,r),t[r]in i?i[t[r]]:(r=n.lc[o](t[r]-e))in i?i[r]:i.other},s:function(t,r,e){return n.c(t,r),t[r]in e?e[t[r]]:e.other}};return{root:{"BREADCRUMBS:base":function(t){return"QI"},"BREADCRUMBS:browse":function(t){return"Results"},"BREADCRUMBS:reports:count":function(t){return"Count report"},"BREADCRUMBS:reports:okRatio":function(t){return"% of OK goods report"},"BREADCRUMBS:reports:nokRatio":function(t){return"% of NOK goods report"},"BREADCRUMBS:settings":function(t){return"Settings"},"MSG:comment:failure":function(t){return"Failed to comment the entry."},"PAGE_ACTION:add":function(t){return"Add result"},"PAGE_ACTION:add:ok":function(t){return"Add OK result"},"PAGE_ACTION:add:nok":function(t){return"NOK result"},"PAGE_ACTION:print":function(t){return"Print NOK notification"},"PAGE_ACTION:settings":function(t){return"Settings"},"PANEL:TITLE:details":function(t){return"Result details"},"PANEL:TITLE:details:order":function(t){return"Order"},"PANEL:TITLE:details:inspection":function(t){return"Inspection"},"PANEL:TITLE:details:inspection:nok":function(t){return"NOK details"},"PANEL:TITLE:details:extra":function(t){return"Extra details"},"PANEL:TITLE:details:actions":function(t){return"Corrective actions"},"PANEL:TITLE:details:attachments:ok":function(t){return"OK attachment"},"PANEL:TITLE:details:attachments:nok":function(t){return"NOK attachment"},"PANEL:TITLE:changes":function(t){return"Result changes history"},"PROPERTY:rid":function(t){return"ID"},"PROPERTY:creator":function(t){return"Creator"},"PROPERTY:createdAt":function(t){return"Created at"},"PROPERTY:updater":function(t){return"Updater"},"PROPERTY:updatedAt":function(t){return"Updated at"},"PROPERTY:inspector":function(t){return"Inspector"},"PROPERTY:inspectedAt":function(t){return"Inspection date"},"PROPERTY:nokOwner":function(t){return"NOK owner - shift leader"},"PROPERTY:leader":function(t){return"Team leader"},"PROPERTY:division":function(t){return"Division"},"PROPERTY:line":function(t){return"Line"},"PROPERTY:orderNo":function(t){return"Order no"},"PROPERTY:nc12":function(t){return"12NC"},"PROPERTY:productName":function(t){return"Product name"},"PROPERTY:productFamily":function(t){return"Product family"},"PROPERTY:kind":function(t){return"Inspection kind"},"PROPERTY:fault":function(t){return"Fault"},"PROPERTY:faultCode":function(t){return"Fault code"},"PROPERTY:faultDescription":function(t){return"Fault description"},"PROPERTY:errorCategory":function(t){return"Error category"},"PROPERTY:problem":function(t){return"Error description"},"PROPERTY:immediateActions":function(t){return"Immediate actions"},"PROPERTY:immediateResults":function(t){return"Result"},"PROPERTY:rootCause":function(t){return"Root cause"},"PROPERTY:correctiveActions":function(t){return"Corrective actions"},"PROPERTY:okFile":function(t){return"OK file"},"PROPERTY:nokFile":function(t){return"NOK file"},"PROPERTY:qtyOrder":function(t){return"Order quantity"},"PROPERTY:qtyInspected":function(t){return"Quantity inspected"},"PROPERTY:qtyToFix":function(t){return"Quantity to fix"},"PROPERTY:qtyNok":function(t){return"NOK quantity"},"PROPERTY:qtyNokInspected":function(t){return"Inspected NOK quantity"},"PROPERTY:qtyNokInspected:min":function(t){return"Inspected NOK qty"},"PROPERTY:serialNumbers":function(t){return"Serial number"},"PROPERTY:comment":function(t){return"Comment"},"PROPERTY:ok":function(t){return"Result"},"ok:true":function(t){return"OK"},"ok:false":function(t){return"NOK"},"filter:result":function(t){return"Result"},"filter:result:ok":function(t){return"OK"},"filter:result:nok":function(t){return"NOK"},"filter:order":function(t){return"Order/12NC"},"filter:serialNumbers":function(t){return"Serial number"},"filter:productFamily":function(t){return"Family"},"filter:division":function(t){return"Division"},"filter:line":function(t){return"Line"},"filter:kind":function(t){return"Kind"},"filter:errorCategory":function(t){return"Error category"},"filter:faultCode":function(t){return"Fault code"},"filter:status":function(t){return"Action status"},"filter:inspector":function(t){return"Inspector"},"filter:nokOwner":function(t){return"Shift leader"},"filter:leader":function(t){return"Team leader"},"filter:limit":function(t){return"Results per page"},"filter:submit":function(t){return"Filter results"},"filter:filters":function(t){return"Show additional filters"},"LIST:COLUMN:orderNo":function(t){return"Order"},"LIST:COLUMN:productFamily":function(t){return"Family"},"LIST:COLUMN:inspectedAt":function(t){return"Date"},"LIST:COLUMN:division":function(t){return"Division"},"LIST:COLUMN:nokOwner":function(t){return"Shift leader"},"LIST:COLUMN:qtyOrder":function(t){return"Qty order"},"LIST:COLUMN:qtyInspected":function(t){return"Qty insp."},"LIST:COLUMN:qtyToFix":function(t){return"Qty to&nbsp;fix"},"LIST:COLUMN:qtyNok":function(t){return"Qty NOK"},"LIST:COLUMN:qtyNokInspected":function(t){return"Qty&nbsp;NOK&nbsp;insp."},"FORM:ERROR:upload":function(t){return"Failed to upload the attachments."},"FORM:ERROR:orderNo":function(t){return"Enter a valid order."},"FORM:okFile:new":function(t){return"New OK file"},"FORM:okFile:current":function(t){return"Current OK file"},"FORM:nokFile:new":function(t){return"New NOK file"},"FORM:nokFile:current":function(t){return"Current NOK file"},"FORM:attachments:remove":function(t){return"remove"},"FORM:attachments:update":function(t){return"Select new files only if you want to replace the existing ones."},"correctiveActions:#":function(t){return"#"},"correctiveActions:what":function(t){return"Action"},"correctiveActions:when":function(t){return"When"},"correctiveActions:who":function(t){return"Who"},"correctiveActions:status":function(t){return"Status"},"correctiveActions:add":function(t){return"Add corrective action"},"correctiveActions:empty":function(t){return"No actions."},"history:added":function(t){return"added the result."},"history:submit":function(t){return"Comment"},"history:correctiveActions":function(t){return n.p(t,"count",0,"en",{one:"1 corrective action",other:n.n(t,"count")+" corrective actions"})},"report:title:totalNokCount":function(t){return"Red strip count"},"report:title:nokCountPerDivision":function(t){return"Red strip count per division"},"report:title:nokQtyPerFamily":function(t){return"Number of NOK products"},"report:title:okRatio":function(t){return"Quantity of OK goods per division [%]"},"report:title:nokRatio:total":function(t){return"Total quantity of NOK goods [%]"},"report:title:nokRatio:division":function(t){return"Quantity of NOK goods per division [%]"},"report:series:nokCount":function(t){return"Red strips"},"report:series:maxNokCount":function(t){return"Upper limit"},"report:series:nokQty":function(t){return"NOK quantity"},"report:series:prod":function(t){return"Total"},"report:series:wh":function(t){return"Warehouse"},"report:series:okRatioRef":function(t){return"Target"},"report:series:nokRatioRef":function(t){return"Target"},"report:series:nokRatio":function(t){return"% of NOK goods"},"report:series:qtyInspected":function(t){return"Inspected quantity"},"report:series:qtyNok":function(t){return"NOK quantity"},"report:series:qtyNokInspected":function(t){return"Inspected NOK quantity"},"report:filenames:totalNokCount":function(t){return"WMES_QI_NokCount"},"report:filenames:nokCountPerDivision":function(t){return"WMES_QI_NokCountPerDivision"},"report:filenames:nokQtyPerFamily":function(t){return"WMES_QI_NokQty"},"report:filenames:okRatio":function(t){return"WMES_QI_OkGoods"},"report:filenames:nokRatio:total":function(t){return"WMES_QI_NokGoods_Total"},"report:filenames:nokRatio:division":function(t){return"WMES_QI_NokGoods_Divisions"},"report:column:division":function(t){return"Division"},"report:column:nok":function(t){return"NOK"},"report:column:all":function(t){return"All"},"report:column:ratio":function(t){return"% OK"},"settings:tab:results":function(t){return"Results"},"settings:tab:reports":function(t){return"Reports"},"settings:requiredCount":function(t){return"Daily required inspections number"},"settings:maxNokPerDay":function(t){return"Upper limit of red strips per day"},"settings:okRatioRef":function(t){return"Quantity of OK goods target [%]"},"settings:nokRatioRef":function(t){return"Quantity of NOK goods target [%]"}},pl:!0}});