define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,u,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[u](n[r]-e),r in o?o[r]:o.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"Loading..."},"MSG:LOADING_FAILURE":function(n){return"Loading failed :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Loading failed :("},"MSG:LOG_OUT:FAILURE":function(n){return"Logging out failed :("},"MSG:LOG_OUT:SUCCESS":function(n){return"You are now logged out!"},"PAGE_ACTION:filter":function(n){return"Filter"},"LIST:COLUMN:actions":function(n){return"Actions"},"LIST:NO_DATA":function(n){return"No data."},"LIST:NO_DATA:cell":function(n){return"no data"},"LIST:ACTION:viewDetails":function(n){return"View details"},"LIST:ACTION:edit":function(n){return"Edit"},"LIST:ACTION:delete":function(n){return"Delete"},"LIST:ACTION:print":function(n){return"Print"},"BREADCRUMBS:edit":function(n){return"Editing"},"BREADCRUMBS:delete":function(n){return"Deleting"},"BREADCRUMBS:error":function(n){return"Error "+t.v(n,"code")+": "+t.s(n,"codeStr",{e401:"unauthorized access",e404:"not found",other:"bad request"})},"ERROR:400":function(n){return"The request cannot be fulfilled due to bad syntax :("},"ERROR:401":function(n){return"Unfortunately, you do not have the right privileges to perform the requested action :("},"ERROR:404":function(n){return"The requested resource could not be found :("},"PAGINATION:FIRST_PAGE":function(n){return"First page"},"PAGINATION:PREV_PAGE":function(n){return"Previous page"},"PAGINATION:NEXT_PAGE":function(n){return"Next page"},"PAGINATION:LAST_PAGE":function(n){return"Last page"},"BOOL:true":function(n){return"Yes"},"BOOL:false":function(n){return"No"},"BOOL:null":function(n){return"N/A"},"#":function(n){return"No."},GUEST_USER_NAME:function(n){return"Guest"},"NAVBAR:TOGGLE":function(n){return"Show menu"},"NAVBAR:DASHBOARD":function(n){return"Dashboard"},"NAVBAR:EVENTS":function(n){return"Events"},"NAVBAR:ORDERS":function(n){return"Orders"},"NAVBAR:MECH_ORDERS":function(n){return"Mechanical orders"},"NAVBAR:OTHER_ORDERS":function(n){return"Production orders"},"NAVBAR:EMPTY_ORDERS":function(n){return"Empty orders"},"NAVBAR:LINES":function(n){return"Production lines"},"NAVBAR:USERS":function(n){return"Users"},"NAVBAR:MY_ACCOUNT":function(n){return"My account"},"NAVBAR:UI_LOCALE":function(n){return"UI locale"},"NAVBAR:LOCALE_PL":function(n){return"In Polish"},"NAVBAR:LOCALE_US":function(n){return"In English"},"NAVBAR:LOG_IN":function(n){return"Log in"},"NAVBAR:LOG_OUT":function(n){return"Log out"},"NAVBAR:DICTIONARIES":function(n){return"Dictionaries"},"NAVBAR:ORDER_STATUSES":function(n){return"Order statuses"},"NAVBAR:DELAY_REASONS":function(n){return"Delay reasons"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Downtime reasons"},"NAVBAR:LOSS_REASONS":function(n){return"Loss reasons"},"NAVBAR:AORS":function(n){return"Areas of responsibility"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCenters"},"NAVBAR:COMPANIES":function(n){return"Companies"},"NAVBAR:DIVISIONS":function(n){return"Divisions"},"NAVBAR:SUBDIVISIONS":function(n){return"Subdivisions"},"NAVBAR:MRP_CONTROLLERS":function(n){return"MRP Controllers"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Functions"},"NAVBAR:PROD_FLOWS":function(n){return"Production flows"},"NAVBAR:PROD_TASKS":function(n){return"Production tasks"},"NAVBAR:PROD_LINES":function(n){return"Production lines"},"NAVBAR:HOURLY_PLANS":function(n){return"Hourly plans"},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Production"},"NAVBAR:FTE:LEADER":function(n){return"Other"},"NAVBAR:VIS":function(n){return"Visualization"},"NAVBAR:VIS:STRUCTURE":function(n){return"Org Unit structure"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Worksheets"},"NAVBAR:REPORTS":function(n){return"Reports"},"NAVBAR:REPORTS:1":function(n){return"PROD, EFF, Downtime"},"NAVBAR:REPORTS:2":function(n){return"CLIP"},"NAVBAR:REPORTS:3":function(n){return"OEE"},"NAVBAR:REPORTS:4":function(n){return"Operators"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Warehouse"},"NAVBAR:REPORTS:7":function(n){return"Downtimes in AORs"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planned line utilization"},"NAVBAR:PROD":function(n){return"Production"},"NAVBAR:PROD:DATA":function(n){return"Production data"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Operation log"},"NAVBAR:PROD:SHIFTS":function(n){return"Shifts"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Orders"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Downtimes"},"NAVBAR:PROD:ALERTS":function(n){return"Alerts"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Change requests"},"NAVBAR:PROD:SETTINGS":function(n){return"Settings"},"NAVBAR:PROGRAMMING":function(n){return"Testing"},"NAVBAR:XICONF":function(n){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:CLIENTS":function(n){return"Clients"},"NAVBAR:XICONF:RESULTS":function(n){return"Results"},"NAVBAR:XICONF:ORDERS":function(n){return"Orders"},"NAVBAR:XICONF:HISTORY":function(n){return"History"},"NAVBAR:XICONF:DICTIONARIES":function(n){return"Dictionaries"},"NAVBAR:XICONF:PROGRAMS":function(n){return"Programs"},"NAVBAR:XICONF:HID_LAMPS":function(n){return"HID lamps"},"NAVBAR:XICONF:COMPONENT_WEIGHTS":function(n){return"Component weights"},"NAVBAR:DOCUMENTS":function(n){return"Documentation"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Clients"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Settings"},"NAVBAR:VENDORS":function(n){return"Vendors"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Purchase orders"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Factory layout"},"NAVBAR:MONITORING:LIST":function(n){return"Production line list"},"NAVBAR:VENDOR_NC12S":function(n){return"12NC database"},"NAVBAR:LICENSES":function(n){return"Licenses"},"NAVBAR:ISA_PALLET_KINDS":function(n){return"Pallet kinds"},"NAVBAR:ISA":function(n){return"Intermediate storage areas"},"NAVBAR:OPINION:main":function(n){return"Opinion survey"},"NAVBAR:OPINION:current":function(n){return"Current survey"},"NAVBAR:OPINION:report":function(n){return"Report"},"NAVBAR:OPINION:actions":function(n){return"Corrective actions"},"NAVBAR:OPINION:responses":function(n){return"Responses"},"NAVBAR:OPINION:scanning":function(n){return"Scanning"},"NAVBAR:OPINION:scanTemplates":function(n){return"Templates"},"NAVBAR:OPINION:omrResults":function(n){return"Results"},"NAVBAR:OPINION:dictionaries":function(n){return"Dictionaries"},"NAVBAR:OPINION:surveys":function(n){return"Surveys"},"NAVBAR:OPINION:employers":function(n){return"Employers"},"NAVBAR:OPINION:divisions":function(n){return"Divisions"},"NAVBAR:OPINION:questions":function(n){return"Questions"},"NAVBAR:KAIZEN:main":function(n){return"Near miss"},"NAVBAR:KAIZEN:orders":function(n){return"Entries"},"NAVBAR:KAIZEN:all":function(n){return"All"},"NAVBAR:KAIZEN:open":function(n){return"Only open"},"NAVBAR:KAIZEN:mine":function(n){return"Only mine"},"NAVBAR:KAIZEN:unseen":function(n){return"Only unread"},"NAVBAR:KAIZEN:reports":function(n){return"Reports"},"NAVBAR:KAIZEN:reports:count":function(n){return"Number of entries"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Summary"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Dictionaries"},"NAVBAR:KAIZEN:sections":function(n){return"Sections"},"NAVBAR:KAIZEN:areas":function(n){return"Areas"},"NAVBAR:KAIZEN:categories":function(n){return"Categories"},"NAVBAR:KAIZEN:causes":function(n){return"Causes"},"NAVBAR:KAIZEN:risks":function(n){return"Risks"},"NAVBAR:KAIZEN:help":function(n){return"Help"},"NAVBAR:SUGGESTIONS:main":function(n){return"Suggestions"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Entries"},"NAVBAR:SUGGESTIONS:all":function(n){return"All"},"NAVBAR:SUGGESTIONS:open":function(n){return"Only open"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Only mine"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Only unread"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Reports"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Number of entries"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Summary"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Dictionaries"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Sections"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Categories"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Product families"},"NAVBAR:SUGGESTIONS:help":function(n){return"Help"},"NAVBAR:QI:main":function(n){return"Quality Inspection"},"NAVBAR:QI:results":function(n){return"Results"},"NAVBAR:QI:results:all":function(n){return"All"},"NAVBAR:QI:results:good":function(n){return"Compliant"},"NAVBAR:QI:results:bad":function(n){return"Non-compliant"},"NAVBAR:QI:reports":function(n){return"Reports"},"NAVBAR:QI:reports:count":function(n){return"Count"},"NAVBAR:QI:reports:okRatio":function(n){return"% of OK goods"},"NAVBAR:QI:dictionaries":function(n){return"Dictionaries"},"NAVBAR:QI:kinds":function(n){return"Kinds"},"NAVBAR:QI:errorCategories":function(n){return"Error categories"},"NAVBAR:QI:faults":function(n){return"Faults"},"NAVBAR:QI:actionStatuses":function(n){return"Action statuses"},"NAVBAR:D8:main":function(n){return"8D"},"NAVBAR:D8:orders":function(n){return"Entries"},"NAVBAR:D8:all":function(n){return"All"},"NAVBAR:D8:open":function(n){return"Only open"},"NAVBAR:D8:mine":function(n){return"Only mine"},"NAVBAR:D8:unseen":function(n){return"Only unread"},"NAVBAR:D8:dictionaries":function(n){return"Dictionaries"},"NAVBAR:D8:entrySources":function(n){return"Entry sources"},"NAVBAR:D8:problemSources":function(n){return"Problem sources"},"NAVBAR:SEARCH:help":function(n){return"Search by order no, 12NC or date."},"NAVBAR:SEARCH:empty":function(n){return"No results."},"NAVBAR:SEARCH:fullOrderNo":function(n){return"Order no "+t.v(n,"orderNo")},"NAVBAR:SEARCH:partialOrderNo":function(n){return"Orders no "+t.v(n,"orderNo")+"..."},"NAVBAR:SEARCH:fullNc12":function(n){return"12NC "+t.v(n,"nc12")},"NAVBAR:SEARCH:partialNc12":function(n){return"12NC "+t.v(n,"nc12")+"..."},"NAVBAR:SEARCH:fullNc15":function(n){return"15NC "+t.v(n,"nc15")},"NAVBAR:SEARCH:sapDetails":function(n){return"details from SAP"},"NAVBAR:SEARCH:xiconfDetails":function(n){return"details from the tests db"},"NAVBAR:SEARCH:xiconfResults":function(n){return"test results"},"NAVBAR:SEARCH:prodShiftOrders":function(n){return"list from production lines"},"NAVBAR:SEARCH:prodShiftOrdersList":function(n){return"orders list from production lines"},"NAVBAR:SEARCH:prodDowntimes":function(n){return"list of downtimes"},"NAVBAR:SEARCH:qiResults":function(n){return"QI results"},"NAVBAR:SEARCH:mechOrders":function(n){return"list of mechanical orders"},"NAVBAR:SEARCH:sapOrders":function(n){return"list of orders from SAP"},"NAVBAR:SEARCH:sapOrdersStart":function(n){return"list of orders from SAP by start date"},"NAVBAR:SEARCH:sapOrdersFinish":function(n){return"list of orders from SAP by finish date"},"NAVBAR:SEARCH:sapList":function(n){return"list from SAP"},"NAVBAR:SEARCH:xiconfOrders":function(n){return"orders list from the tests db"},"NAVBAR:SEARCH:xiconfList":function(n){return"list from the tests db"},"NAVBAR:SEARCH:worksheetOrders":function(n){return"orders list from worksheets"},"NAVBAR:SEARCH:fteMaster":function(n){return"list of FTE (production)"},"NAVBAR:SEARCH:fteLeader":function(n){return"list of FTE (other)"},"NAVBAR:SEARCH:hourlyPlans":function(n){return"list of hourly plans"},"NAVBAR:SEARCH:hourlyPlan":function(n){return"hourly plan"},"NAVBAR:SEARCH:prodShifts":function(n){return"list of production shifts"},"NAVBAR:SEARCH:document":function(n){return"documentation file"},"ACTION_FORM:BUTTON":function(n){return"Perform action"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete"},"ACTION_FORM:BUTTON:cancel":function(n){return"Cancel"},"ACTION_FORM:MESSAGE":function(n){return"Are you sure you want to perform the requested action?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Action failed :("},"ORG_UNIT:division":function(n){return"Division"},"ORG_UNIT:subdivision":function(n){return"Subdivision"},"ORG_UNIT:mrpController":function(n){return"MRP Controller"},"ORG_UNIT:prodFlow":function(n){return"Production flow"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Production line"},SHIFT:function(n){return t.v(n,"date")+", "+t.v(n,"shift")},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Any"},QUARTER:function(n){return t.v(n,"quarter")+" quarter "+t.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Any"},"highcharts:contextButtonTitle":function(n){return"Chart's context menu"},"highcharts:downloadJPEG":function(n){return"Save as JPEG"},"highcharts:downloadPDF":function(n){return"Save as PDF"},"highcharts:downloadPNG":function(n){return"Save as PNG"},"highcharts:downloadSVG":function(n){return"Save as SVG"},"highcharts:downloadCSV":function(n){return"Save as CSV"},"highcharts:printChart":function(n){return"Print the chart"},"highcharts:decimalPoint":function(n){return"."},"highcharts:thousandsSep":function(n){return","},"highcharts:noData":function(n){return"No data :("},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Reset the zoom level to 1:1"},"highcharts:loading":function(n){return"Loading..."},"highcharts:months":function(n){return"January_February_March_April_May_June_July_August_September_October_November_December"},"highcharts:shortMonths":function(n){return"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec"},"highcharts:weekdays":function(n){return"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday"},"dataTables:emptyTable":function(n){return"No data."},"dataTables:loadingRecords":function(n){return"Loading..."},"dataTables:loadingFailed":function(n){return"Loading failed :("},"feedback:button:text":function(n){return"Feedback"},"feedback:button:tooltip":function(n){return"Report bugs, notes, opinions or ideas!"},"colorPicker:label":function(n){return"Color"},"filter:date:from":function(n){return"From"},"filter:date:from:info":function(n){return"Data from 06:00 of the selected day"},"filter:date:to":function(n){return"To"},"filter:date:to:info":function(n){return"Data to 06:00 of the selected day"},"filter:shift":function(n){return"Shift"},"filter:submit":function(n){return"Filter"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Show filter"},"filter:hide":function(n){return"Hide filter"},"placeholder:date":function(n){return"yyyy-mm-dd"},"placeholder:time":function(n){return"--:--"},"placeholder:month":function(n){return"yyyy-mm"},"PRINT_PAGE:FT:PAGE_NO":function(n){return"Page <span class=print-page-no>?</span> of <span class=print-page-count>?</span>"},"PRINT_PAGE:FT:INFO":function(n){return"Printout generated at <span class=print-page-date>?</span> by <span class=print-page-user>?</span>."}},pl:!0}});