define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,u,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[u](n[r]-e),r in o?o[r]:o.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{APP_NAME:function(n){return"WMES"},TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"Loading..."},"MSG:LOADING_FAILURE":function(n){return"Loading failed."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Loading failed."},"MSG:SAVING":function(n){return"Saving..."},"MSG:SAVING_FAILURE":function(n){return"Saving failed."},"MSG:LOG_OUT:FAILURE":function(n){return"Logging out failed."},"MSG:LOG_OUT:SUCCESS":function(n){return"You are now logged out!"},"MSG:POPUP_BLOCKED":function(n){return"Popup window was blocked."},"PAGE_ACTION:filter":function(n){return"Filter"},"PAGE_ACTION:export:csv":function(n){return"Export to CSV"},"PAGE_ACTION:export:xlsx":function(n){return"Export to XLSX"},"LIST:COLUMN:actions":function(n){return"Actions"},"LIST:NO_DATA":function(n){return"No data."},"LIST:NO_DATA:cell":function(n){return""},"LIST:ACTION:viewDetails":function(n){return"View details"},"LIST:ACTION:edit":function(n){return"Edit"},"LIST:ACTION:delete":function(n){return"Delete"},"LIST:ACTION:print":function(n){return"Print"},"BREADCRUMBS:edit":function(n){return"Editing"},"BREADCRUMBS:delete":function(n){return"Deleting"},"ERROR:notify:message":function(n){return"Click here to notify the admin about the error."},"ERROR:notify:success":function(n){return"The admin was notified!"},"ERROR:notify:failure":function(n){return"Failed to notify the admin."},"ERROR:notify:subject":function(n){return"["+t.v(n,"APP_NAME")+"] Error "+t.v(n,"code")+" from "+t.v(n,"user")},"ERROR:0:title":function(n){return"Error during loading"},"ERROR:0:message":function(n){return"Unexpected error during the execution of the request. Check whether you have a connection to the network and <a href=# data-reload>reload the page</a>."},"ERROR:400:title":function(n){return"Error 400: bad request"},"ERROR:400:message":function(n){return"The request cannot be fulfilled due to bad syntax."},"ERROR:403:title":function(n){return"Error 403: forbidden"},"ERROR:403:message":function(n){return"You do not have the right privileges to perform the requested action."},"ERROR:404:title":function(n){return"Error 404: not found"},"ERROR:404:message":function(n){return"The requested resource could not be found."},"ERROR:500:title":function(n){return"Error 500: internal server error"},"ERROR:500:message":function(n){return"Server encountered an unexpected condition that prevented it from completing the request."},"PAGINATION:FIRST_PAGE":function(n){return"First page"},"PAGINATION:PREV_PAGE":function(n){return"Previous page"},"PAGINATION:NEXT_PAGE":function(n){return"Next page"},"PAGINATION:LAST_PAGE":function(n){return"Last page"},"BOOL:true":function(n){return"Yes"},"BOOL:false":function(n){return"No"},"BOOL:null":function(n){return"N/A"},"#":function(n){return"No."},GUEST_USER_NAME:function(n){return"Guest"},"NAVBAR:TOGGLE":function(n){return"Show menu"},"NAVBAR:DASHBOARD":function(n){return"Dashboard"},"NAVBAR:EVENTS":function(n){return"Events"},"NAVBAR:ORDERS":function(n){return"Orders"},"NAVBAR:MECH_ORDERS":function(n){return"Mechanical orders"},"NAVBAR:OTHER_ORDERS":function(n){return"Production orders"},"NAVBAR:EMPTY_ORDERS":function(n){return"Empty WMES orders"},"NAVBAR:LINES":function(n){return"Production lines"},"NAVBAR:USERS":function(n){return"Users"},"NAVBAR:MY_ACCOUNT":function(n){return"My account"},"NAVBAR:UI_LOCALE":function(n){return"UI locale"},"NAVBAR:LOCALE_PL":function(n){return"In Polish"},"NAVBAR:LOCALE_US":function(n){return"In English"},"NAVBAR:LOG_IN":function(n){return"Log in"},"NAVBAR:LOG_OUT":function(n){return"Log out"},"NAVBAR:DICTIONARIES":function(n){return"Dictionaries"},"NAVBAR:TOOLS":function(n){return"Tools"},"NAVBAR:ORDER_STATUSES":function(n){return"Order statuses"},"NAVBAR:DELAY_REASONS":function(n){return"Delay reasons"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Downtime reasons"},"NAVBAR:LOSS_REASONS":function(n){return"Loss reasons"},"NAVBAR:AORS":function(n){return"Areas of responsibility"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCenters"},"NAVBAR:COMPANIES":function(n){return"Companies"},"NAVBAR:DIVISIONS":function(n){return"Divisions"},"NAVBAR:SUBDIVISIONS":function(n){return"Subdivisions"},"NAVBAR:MRP_CONTROLLERS":function(n){return"MRP Controllers"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Functions"},"NAVBAR:PROD_FLOWS":function(n){return"Production flows"},"NAVBAR:PROD_TASKS":function(n){return"Production tasks"},"NAVBAR:PROD_LINES":function(n){return"Production lines"},"NAVBAR:PLANNING:main":function(n){return"Planning"},"NAVBAR:PLANNING:hourly":function(n){return"Hourly plans"},"NAVBAR:PLANNING:daily":function(n){return"Daily plans"},"NAVBAR:PLANNING:paintShop":function(n){return"Paint shop"},"NAVBAR:PLANNING:paintShop:load":function(n){return"Load"},"NAVBAR:PLANNING:wh":function(n){return"Warehouse"},"NAVBAR:PLANNING:all":function(n){return"All"},"NAVBAR:PLANNING:-1d":function(n){return"Yesterday"},"NAVBAR:PLANNING:0d":function(n){return"Today"},"NAVBAR:PLANNING:1d":function(n){return"Tomorrow"},"NAVBAR:PLANNING:2d":function(n){return"Day after tomorrow"},"NAVBAR:PLANNING:2d:help":function(n){return"Plan available around 17:00."},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Production"},"NAVBAR:FTE:WH":function(n){return"Warehouse"},"NAVBAR:FTE:LEADER":function(n){return"Other"},"NAVBAR:FTE:SETTINGS":function(n){return"Settings"},"NAVBAR:VIS":function(n){return"Visualization"},"NAVBAR:VIS:STRUCTURE":function(n){return"Org Unit structure"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Worksheets"},"NAVBAR:REPORTS":function(n){return"Reports"},"NAVBAR:REPORTS:1":function(n){return"PROD, EFF, Downtime"},"NAVBAR:REPORTS:2":function(n){return"CLIP (old)"},"NAVBAR:REPORTS:clip":function(n){return"CLIP (new)"},"NAVBAR:REPORTS:3":function(n){return"OEE"},"NAVBAR:REPORTS:4":function(n){return"Operators"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Warehouse"},"NAVBAR:REPORTS:7":function(n){return"Downtimes in AORs"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planned line utilization"},"NAVBAR:PROD":function(n){return"Production"},"NAVBAR:PROD:DATA":function(n){return"Production data"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Operation log"},"NAVBAR:PROD:SHIFTS":function(n){return"Shifts"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Orders"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Downtimes"},"NAVBAR:PROD:ALERTS":function(n){return"Alerts"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Change requests"},"NAVBAR:PROD:SERIAL_NUMBERS":function(n){return"Serial numbers"},"NAVBAR:PROD:SETTINGS":function(n){return"Settings"},"NAVBAR:PROGRAMMING":function(n){return"Testing"},"NAVBAR:XICONF":function(n){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:CLIENTS":function(n){return"Clients"},"NAVBAR:XICONF:RESULTS":function(n){return"Results"},"NAVBAR:XICONF:ORDERS":function(n){return"Orders"},"NAVBAR:XICONF:HISTORY":function(n){return"History"},"NAVBAR:XICONF:DICTIONARIES":function(n){return"Dictionaries"},"NAVBAR:XICONF:PROGRAMS":function(n){return"Programs"},"NAVBAR:XICONF:HID_LAMPS":function(n){return"HID lamps"},"NAVBAR:XICONF:COMPONENT_WEIGHTS":function(n){return"Component weights"},"NAVBAR:DOCUMENTS":function(n){return"Documentation"},"NAVBAR:DOCUMENTS:TREE":function(n){return"Documents"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Clients"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Settings"},"NAVBAR:VENDORS":function(n){return"Vendors"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Purchase orders"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Factory layout"},"NAVBAR:MONITORING:LIST":function(n){return"Production line list"},"NAVBAR:VENDOR_NC12S":function(n){return"12NC database"},"NAVBAR:LICENSES":function(n){return"Licenses"},"NAVBAR:ISA_PALLET_KINDS":function(n){return"Pallet kinds"},"NAVBAR:ISA":function(n){return"Intermediate storage areas"},"NAVBAR:INVALID_ORDERS":function(n){return"Invalid IPT orders"},"NAVBAR:IPT_CHECK":function(n){return"IPT orders checker"},"NAVBAR:SAP_LABOR_TIME_FIXER":function(n){return"Labor Time fixer"},"NAVBAR:PRINTERS":function(n){return"Printers"},"NAVBAR:OPINION:main":function(n){return"Opinion survey"},"NAVBAR:OPINION:current":function(n){return"Current survey"},"NAVBAR:OPINION:report":function(n){return"Report"},"NAVBAR:OPINION:actions":function(n){return"Corrective actions"},"NAVBAR:OPINION:responses":function(n){return"Responses"},"NAVBAR:OPINION:scanning":function(n){return"Scanning"},"NAVBAR:OPINION:scanTemplates":function(n){return"Templates"},"NAVBAR:OPINION:omrResults":function(n){return"Results"},"NAVBAR:OPINION:dictionaries":function(n){return"Dictionaries"},"NAVBAR:OPINION:surveys":function(n){return"Surveys"},"NAVBAR:OPINION:employers":function(n){return"Employers"},"NAVBAR:OPINION:divisions":function(n){return"Divisions"},"NAVBAR:OPINION:questions":function(n){return"Questions"},"NAVBAR:KAIZEN:main":function(n){return"Near miss"},"NAVBAR:KAIZEN:orders":function(n){return"Entries"},"NAVBAR:KAIZEN:all":function(n){return"All"},"NAVBAR:KAIZEN:open":function(n){return"Only open"},"NAVBAR:KAIZEN:mine":function(n){return"Only mine"},"NAVBAR:KAIZEN:unseen":function(n){return"Only unread"},"NAVBAR:KAIZEN:reports":function(n){return"Reports"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Summary"},"NAVBAR:KAIZEN:reports:engagement":function(n){return"Engagement"},"NAVBAR:KAIZEN:reports:metrics":function(n){return"Metrics"},"NAVBAR:KAIZEN:reports:count":function(n){return"Number of Near Misses"},"NAVBAR:KAIZEN:reports:observations":function(n){return"Number of Observations"},"NAVBAR:KAIZEN:reports:minutes":function(n){return"Number of Minutes"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Dictionaries"},"NAVBAR:KAIZEN:sections":function(n){return"Sections"},"NAVBAR:KAIZEN:areas":function(n){return"Areas"},"NAVBAR:KAIZEN:categories":function(n){return"Categories"},"NAVBAR:KAIZEN:causes":function(n){return"Causes"},"NAVBAR:KAIZEN:risks":function(n){return"Risks"},"NAVBAR:KAIZEN:behaviours":function(n){return"Behaviours"},"NAVBAR:KAIZEN:help":function(n){return"Help"},"NAVBAR:KAIZEN:observations":function(n){return"Observations"},"NAVBAR:KAIZEN:minutesForSafety":function(n){return"Minutes for Safety"},"NAVBAR:SUGGESTIONS:main":function(n){return"Suggestions"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Entries"},"NAVBAR:SUGGESTIONS:all":function(n){return"All"},"NAVBAR:SUGGESTIONS:open":function(n){return"Only open"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Only mine"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Only unread"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Reports"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Number of entries"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Summary"},"NAVBAR:SUGGESTIONS:reports:engagement":function(n){return"Engagement"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Dictionaries"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Sections"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Categories"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Product families"},"NAVBAR:SUGGESTIONS:help":function(n){return"Help"},"NAVBAR:QI:main":function(n){return"Quality Inspection"},"NAVBAR:QI:results":function(n){return"Results"},"NAVBAR:QI:results:all":function(n){return"All"},"NAVBAR:QI:results:good":function(n){return"Compliant"},"NAVBAR:QI:results:bad":function(n){return"Non-compliant"},"NAVBAR:QI:reports":function(n){return"Reports"},"NAVBAR:QI:reports:count":function(n){return"Count"},"NAVBAR:QI:reports:okRatio":function(n){return"% of OK goods"},"NAVBAR:QI:reports:nokRatio":function(n){return"% of NOK goods"},"NAVBAR:QI:dictionaries":function(n){return"Dictionaries"},"NAVBAR:QI:kinds":function(n){return"Kinds"},"NAVBAR:QI:errorCategories":function(n){return"Error categories"},"NAVBAR:QI:faults":function(n){return"Faults"},"NAVBAR:QI:actionStatuses":function(n){return"Action statuses"},"NAVBAR:D8:main":function(n){return"8D"},"NAVBAR:D8:entries":function(n){return"Entries"},"NAVBAR:D8:all":function(n){return"All"},"NAVBAR:D8:open":function(n){return"Only open"},"NAVBAR:D8:mine":function(n){return"Only mine"},"NAVBAR:D8:unseen":function(n){return"Only unread"},"NAVBAR:D8:dictionaries":function(n){return"Dictionaries"},"NAVBAR:D8:areas":function(n){return"Areas"},"NAVBAR:D8:entrySources":function(n){return"Entry sources"},"NAVBAR:D8:problemSources":function(n){return"Problem sources"},"NAVBAR:kanban":function(n){return"Kanban DB"},"NAVBAR:SEARCH:help":function(n){return"Search by order no, 12NC or date."},"NAVBAR:SEARCH:empty":function(n){return"No results."},"NAVBAR:SEARCH:fullOrderNo":function(n){return"Order no "+t.v(n,"orderNo")},"NAVBAR:SEARCH:partialOrderNo":function(n){return"Orders no "+t.v(n,"orderNo")+"..."},"NAVBAR:SEARCH:fullNc12":function(n){return"12NC "+t.v(n,"nc12")},"NAVBAR:SEARCH:partialNc12":function(n){return"12NC "+t.v(n,"nc12")+"..."},"NAVBAR:SEARCH:fullNc15":function(n){return"15NC "+t.v(n,"nc15")},"NAVBAR:SEARCH:sapDetails":function(n){return"details from SAP"},"NAVBAR:SEARCH:xiconfDetails":function(n){return"details from the tests db"},"NAVBAR:SEARCH:xiconfResults":function(n){return"test results"},"NAVBAR:SEARCH:prodShiftOrders":function(n){return"list from production lines"},"NAVBAR:SEARCH:prodShiftOrdersList":function(n){return"orders list from production lines"},"NAVBAR:SEARCH:prodDowntimes":function(n){return"list of downtimes"},"NAVBAR:SEARCH:qiResults":function(n){return"QI results"},"NAVBAR:SEARCH:mechOrders":function(n){return"list of mechanical orders"},"NAVBAR:SEARCH:sapOrders":function(n){return"list of orders from SAP"},"NAVBAR:SEARCH:sapOrdersStart":function(n){return"list of orders from SAP by start date"},"NAVBAR:SEARCH:sapOrdersFinish":function(n){return"list of orders from SAP by finish date"},"NAVBAR:SEARCH:sapList":function(n){return"list from SAP"},"NAVBAR:SEARCH:xiconfOrders":function(n){return"orders list from the tests db"},"NAVBAR:SEARCH:xiconfList":function(n){return"list from the tests db"},"NAVBAR:SEARCH:worksheetOrders":function(n){return"orders list from worksheets"},"NAVBAR:SEARCH:fte:master":function(n){return"list of FTE (production)"},"NAVBAR:SEARCH:fte:wh":function(n){return"list of FTE (warehouse)"},"NAVBAR:SEARCH:fte:leader":function(n){return"list of FTE (other)"},"NAVBAR:SEARCH:hourlyPlans":function(n){return"list of hourly plans"},"NAVBAR:SEARCH:hourlyPlan":function(n){return"hourly plan"},"NAVBAR:SEARCH:prodShifts":function(n){return"list of production shifts"},"NAVBAR:SEARCH:document":function(n){return"document"},"NAVBAR:SEARCH:documentFile":function(n){return"documentation file"},"NAVBAR:SEARCH:entryId":function(n){return"Entry no "+t.v(n,"entryId")},"NAVBAR:SEARCH:kaizenOrders":function(n){return"Near miss"},"NAVBAR:SEARCH:suggestions":function(n){return"Suggestion"},"NAVBAR:SEARCH:behaviorObsCards":function(n){return"Observation"},"NAVBAR:SEARCH:minutesForSafetyCards":function(n){return"Minutes"},"NAVBAR:SEARCH:d8":function(n){return"8D"},"NAVBAR:SEARCH:qi":function(n){return"Quality Inspection"},"NAVBAR:SEARCH:plan:prod":function(n){return"production plan"},"NAVBAR:SEARCH:plan:wh":function(n){return"warehouse plan"},"NAVBAR:SEARCH:plan:ps":function(n){return"paint shop plan"},"NAVBAR:mor":function(n){return"Matrix of responsibility"},"ACTION_FORM:BUTTON":function(n){return"Perform action"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete"},"ACTION_FORM:BUTTON:cancel":function(n){return"Cancel"},"ACTION_FORM:MESSAGE":function(n){return"Are you sure you want to perform the requested action?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Action failed."},"ORG_UNIT:division":function(n){return"Division"},"ORG_UNIT:subdivision":function(n){return"Subdivision"},"ORG_UNIT:mrpController":function(n){return"MRP Controller"},"ORG_UNIT:mrpControllers":function(n){return"MRP Controller"},"ORG_UNIT:prodFlow":function(n){return"Production flow"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Production line"},SHIFT:function(n){return t.v(n,"date")+", "+t.v(n,"shift")},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Any"},QUARTER:function(n){return t.v(n,"quarter")+" quarter "+t.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Any"},"highcharts:contextButtonTitle":function(n){return"Chart's context menu"},"highcharts:downloadJPEG":function(n){return"Save as JPEG"},"highcharts:downloadPDF":function(n){return"Save as PDF"},"highcharts:downloadPNG":function(n){return"Save as PNG"},"highcharts:downloadSVG":function(n){return"Save as SVG"},"highcharts:downloadCSV":function(n){return"Save as CSV"},"highcharts:printChart":function(n){return"Print the chart"},"highcharts:decimalPoint":function(n){return"."},"highcharts:thousandsSep":function(n){return","},"highcharts:noData":function(n){return"No data."},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Reset the zoom level to 1:1"},"highcharts:loading":function(n){return"Loading..."},"highcharts:months":function(n){return"January_February_March_April_May_June_July_August_September_October_November_December"},"highcharts:shortMonths":function(n){return"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec"},"highcharts:weekdays":function(n){return"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday"},"dataTables:emptyTable":function(n){return"No data."},"dataTables:loadingRecords":function(n){return"Loading..."},"dataTables:loadingFailed":function(n){return"Loading failed."},"feedback:button:text":function(n){return"Feedback"},"feedback:button:tooltip":function(n){return"Report bugs, notes, opinions or ideas!"},"colorPicker:label":function(n){return"Color"},"filter:date:from":function(n){return"From"},"filter:date:from:info":function(n){return"Data from 06:00 of the selected day"},"filter:date:to":function(n){return"To"},"filter:date:to:info":function(n){return"Data to 06:00 of the selected day"},"filter:shift":function(n){return"Shift"},"filter:submit":function(n){return"Filter"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Show filter"},"filter:hide":function(n){return"Hide filter"},"placeholder:date":function(n){return"yyyy-mm-dd"},"placeholder:time":function(n){return"--:--"},"placeholder:month":function(n){return"yyyy-mm"},"PRINT_PAGE:FT:PAGE_NO":function(n){return"Page <span class=print-page-no>?</span> of <span class=print-page-count>?</span>"},"PRINT_PAGE:FT:INFO":function(n){return"Printout generated at <span class=print-page-date>?</span> by <span class=print-page-user>?</span>."},"html2pdf:progress":function(n){return"Generating the printout..."},"html2pdf:failure":function(n){return"Printout generation failed."},"html2pdf:printing":function(n){return"Sending the printout to the printer..."},"html2pdf:printing:success":function(n){return"Printout was successfully sent to the printer."},"html2pdf:printing:failure":function(n){return"Sending the printout to the printer failed."}},pl:!0}});