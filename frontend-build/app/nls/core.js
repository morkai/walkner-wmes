define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,u,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[u](n[r]-e),r in o?o[r]:o.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{TITLE:function(){return"Wannabe MES"},"MSG:LOADING":function(){return"Loading..."},"MSG:LOADING_FAILURE":function(){return"Loading failed :("},"MSG:LOG_OUT:FAILURE":function(){return"Logging out failed :("},"MSG:LOG_OUT:SUCCESS":function(){return"You are now logged out!"},"PAGE_ACTION:filter":function(){return"Filter"},"LIST:COLUMN:actions":function(){return"Actions"},"LIST:NO_DATA":function(){return"No data."},"LIST:NO_DATA:cell":function(){return"no data"},"LIST:ACTION:viewDetails":function(){return"View details"},"LIST:ACTION:edit":function(){return"Edit"},"LIST:ACTION:delete":function(){return"Delete"},"LIST:ACTION:print":function(){return"Print"},"BREADCRUMBS:edit":function(){return"Editing"},"BREADCRUMBS:delete":function(){return"Deleting"},"BREADCRUMBS:error":function(n){return"Error "+t.v(n,"code")+": "+t.s(n,"codeStr",{e401:"unauthorized access",e404:"not found",other:"bad request"})},"ERROR:400":function(){return"The request cannot be fulfilled due to bad syntax :("},"ERROR:401":function(){return"Unfortunately, you do not have the right privileges to perform the requested action :("},"ERROR:404":function(){return"The requested resource could not be found :("},"PAGINATION:FIRST_PAGE":function(){return"First page"},"PAGINATION:PREV_PAGE":function(){return"Previous page"},"PAGINATION:NEXT_PAGE":function(){return"Next page"},"PAGINATION:LAST_PAGE":function(){return"Last page"},"LOG_IN_FORM:DIALOG_TITLE":function(){return"Log in form"},"LOG_IN_FORM:LABEL:LOGIN":function(){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(){return"Password"},"LOG_IN_FORM:LABEL:SUBMIT":function(){return"Log in"},"BOOL:true":function(){return"Yes"},"BOOL:false":function(){return"No"},"BOOL:null":function(){return"N/A"},"#":function(){return"No."},GUEST_USER_NAME:function(){return"Guest"},"NAVBAR:TOGGLE":function(){return"Show menu"},"NAVBAR:DASHBOARD":function(){return"Dashboard"},"NAVBAR:EVENTS":function(){return"Events"},"NAVBAR:ORDERS":function(){return"Orders"},"NAVBAR:MECH_ORDERS":function(){return"Mechanical orders"},"NAVBAR:OTHER_ORDERS":function(){return"Production orders"},"NAVBAR:EMPTY_ORDERS":function(){return"Empty orders"},"NAVBAR:LINES":function(){return"Production lines"},"NAVBAR:USERS":function(){return"Users"},"NAVBAR:MY_ACCOUNT":function(){return"My account"},"NAVBAR:UI_LOCALE":function(){return"UI locale"},"NAVBAR:LOCALE_PL":function(){return"In Polish"},"NAVBAR:LOCALE_US":function(){return"In English"},"NAVBAR:LOG_IN":function(){return"Log in"},"NAVBAR:LOG_OUT":function(){return"Log out"},"NAVBAR:DICTIONARIES":function(){return"Dictionaries"},"NAVBAR:ORDER_STATUSES":function(){return"Order statuses"},"NAVBAR:DOWNTIME_REASONS":function(){return"Downtime reasons"},"NAVBAR:LOSS_REASONS":function(){return"Loss reasons"},"NAVBAR:AORS":function(){return"Areas of responsibility"},"NAVBAR:WORK_CENTERS":function(){return"WorkCenters"},"NAVBAR:COMPANIES":function(){return"Companies"},"NAVBAR:DIVISIONS":function(){return"Divisions"},"NAVBAR:SUBDIVISIONS":function(){return"Subdivisions"},"NAVBAR:MRP_CONTROLLERS":function(){return"MRP Controllers"},"NAVBAR:PROD_FUNCTIONS":function(){return"Production functions"},"NAVBAR:PROD_FLOWS":function(){return"Production flows"},"NAVBAR:PROD_TASKS":function(){return"Production tasks"},"NAVBAR:PROD_LINES":function(){return"Production lines"},"NAVBAR:HOURLY_PLANS":function(){return"Hourly plans"},"NAVBAR:FTE":function(){return"FTE"},"NAVBAR:FTE:MASTER":function(){return"Production"},"NAVBAR:FTE:MASTER:LIST":function(){return"Entries"},"NAVBAR:FTE:MASTER:CURRENT":function(){return"Allocation"},"NAVBAR:FTE:LEADER":function(){return"Warehouse"},"NAVBAR:FTE:LEADER:LIST":function(){return"Entries"},"NAVBAR:FTE:LEADER:CURRENT":function(){return"Allocation"},"NAVBAR:VIS":function(){return"Visualization"},"NAVBAR:VIS:STRUCTURE":function(){return"Org Unit structure"},"NAVBAR:PRESS_WORKSHEETS":function(){return"Worksheets"},"NAVBAR:REPORTS":function(){return"Reports"},"NAVBAR:REPORTS:1":function(){return"PROD, EFF, Downtime"},"NAVBAR:REPORTS:2":function(){return"CLIP"},"NAVBAR:REPORTS:3":function(){return"OEE"},"NAVBAR:REPORTS:4":function(){return"Operators"},"NAVBAR:REPORTS:5":function(){return"HR"},"NAVBAR:REPORTS:6":function(){return"Warehouse"},"NAVBAR:PROD":function(){return"Production"},"NAVBAR:PROD:DATA":function(){return"Production data"},"NAVBAR:PROD:LOG_ENTRIES":function(){return"Operation log"},"NAVBAR:PROD:SHIFTS":function(){return"Shifts"},"NAVBAR:PROD:SHIFT_ORDERS":function(){return"Orders"},"NAVBAR:PROD:DOWNTIMES":function(){return"Downtimes"},"NAVBAR:PROGRAMMING":function(){return"Programming"},"NAVBAR:XICONF":function(){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:PROGRAMS":function(){return"Programs"},"NAVBAR:XICONF:ORDERS":function(){return"Orders"},"NAVBAR:XICONF:RESULTS":function(){return"Results"},"NAVBAR:ICPO":function(){return"ICPO <em>(GPRS)</em>"},"NAVBAR:ICPO:RESULTS":function(){return"Results"},"NAVBAR:VENDORS":function(){return"Vendors"},"NAVBAR:PURCHASE_ORDERS":function(){return"Purchase orders"},"NAVBAR:MONITORING":function(){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(){return"Factory layout"},"NAVBAR:MONITORING:LIST":function(){return"Production line list"},"NAVBAR:VENDOR_NC12S":function(){return"12NC database"},"ACTION_FORM:BUTTON":function(){return"Perform action"},"ACTION_FORM:BUTTON:delete":function(){return"Delete"},"ACTION_FORM:BUTTON:cancel":function(){return"Cancel"},"ACTION_FORM:MESSAGE":function(){return"Are you sure you want to perform the requested action?"},"ACTION_FORM:MESSAGE:failure":function(){return"Action failed :("},"ORG_UNIT:division":function(){return"Division"},"ORG_UNIT:subdivision":function(){return"Subdivision"},"ORG_UNIT:mrpController":function(){return"MRP Controller"},"ORG_UNIT:prodFlow":function(){return"Production flow"},"ORG_UNIT:workCenter":function(){return"WorkCenter"},"ORG_UNIT:prodLine":function(){return"Production line"},SHIFT:function(n){return t.v(n,"date")+", "+t.v(n,"shift")},"SHIFT:1":function(){return"I"},"SHIFT:2":function(){return"II"},"SHIFT:3":function(){return"III"},"SHIFT:0":function(){return"Any"},QUARTER:function(n){return t.v(n,"quarter")+" quarter "+t.v(n,"year")},"QUARTER:1":function(){return"I"},"QUARTER:2":function(){return"II"},"QUARTER:3":function(){return"III"},"QUARTER:4":function(){return"IV"},"QUARTER:0":function(){return"Any"},"highcharts:contextButtonTitle":function(){return"Chart's context menu"},"highcharts:downloadJPEG":function(){return"Save as JPEG"},"highcharts:downloadPDF":function(){return"Save as PDF"},"highcharts:downloadPNG":function(){return"Save as PNG"},"highcharts:downloadSVG":function(){return"Save as SVG"},"highcharts:downloadCSV":function(){return"Save as CSV"},"highcharts:printChart":function(){return"Print the chart"},"highcharts:decimalPoint":function(){return"."},"highcharts:thousandsSep":function(){return","},"highcharts:noData":function(){return"No data :("},"highcharts:resetZoom":function(){return"1:1"},"highcharts:resetZoomTitle":function(){return"Reset the zoom level to 1:1"},"highcharts:loading":function(){return"Loading..."},"highcharts:months":function(){return"January_February_March_April_May_June_July_August_September_October_November_December"},"highcharts:shortMonths":function(){return"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec"},"highcharts:weekdays":function(){return"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday"},"dataTables:emptyTable":function(){return"No data."},"dataTables:loadingRecords":function(){return"Loading..."},"dataTables:loadingFailed":function(){return"Loading failed :("},"feedback:button:text":function(){return"Feedback"},"feedback:button:tooltip":function(){return"Report bugs, notes, opinions or ideas!"},"colorPicker:label":function(){return"Color"},"filter:date:from":function(){return"From"},"filter:date:from:info":function(){return"Data from 06:00 of the selected day"},"filter:date:to":function(){return"To"},"filter:date:to:info":function(){return"Data to 06:00 of the selected day"},"filter:submit":function(){return"Filter"},"filter:limit":function(){return"Limit"}},pl:!0}});