define(["app/nls/locale/en"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,u,o){return r.c(n,t),n[t]in o?o[n[t]]:(t=r.lc[u](n[t]-e),t in o?o[t]:o.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{root:{TITLE:function(n){return"Wannabe MES"},"MSG:LOADING":function(n){return"Loading..."},"MSG:LOADING_FAILURE":function(n){return"Loading failed :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Loading failed :("},"MSG:LOG_OUT:FAILURE":function(n){return"Logging out failed :("},"MSG:LOG_OUT:SUCCESS":function(n){return"You are now logged out!"},"PAGE_ACTION:filter":function(n){return"Filter"},"LIST:COLUMN:actions":function(n){return"Actions"},"LIST:NO_DATA":function(n){return"No data."},"LIST:NO_DATA:cell":function(n){return"no data"},"LIST:ACTION:viewDetails":function(n){return"View details"},"LIST:ACTION:edit":function(n){return"Edit"},"LIST:ACTION:delete":function(n){return"Delete"},"LIST:ACTION:print":function(n){return"Print"},"BREADCRUMBS:edit":function(n){return"Editing"},"BREADCRUMBS:delete":function(n){return"Deleting"},"BREADCRUMBS:error":function(n){return"Error "+r.v(n,"code")+": "+r.s(n,"codeStr",{e401:"unauthorized access",e404:"not found",other:"bad request"})},"ERROR:400":function(n){return"The request cannot be fulfilled due to bad syntax :("},"ERROR:401":function(n){return"Unfortunately, you do not have the right privileges to perform the requested action :("},"ERROR:404":function(n){return"The requested resource could not be found :("},"PAGINATION:FIRST_PAGE":function(n){return"First page"},"PAGINATION:PREV_PAGE":function(n){return"Previous page"},"PAGINATION:NEXT_PAGE":function(n){return"Next page"},"PAGINATION:LAST_PAGE":function(n){return"Last page"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Log in form"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Password reset form"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Password"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"New password"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Log in"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Reset password"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Log in"},"LOG_IN_FORM:LINK:RESET":function(n){return"Forgot your password?"},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"WMES password reset"},"LOG_IN_FORM:RESET:TEXT":function(n){return"We've received a request to reset your WMES account password.\n\nTo change your password, please click this link:\n"+r.v(n,"resetUrl")+"\n\nPassword reset links are valid for only 24 hours. If the link expires, you will need to submit a new request here: "+r.v(n,"appUrl")+"\n\nIf you didn't request a change, please discregard this e-mail and your password will stay the same.\n\nContact your superior or WMES administrator if you need help or have questions.\n\nSincerely, WMES support team."},"LOG_IN_FORM:RESET:MSG:NOT_FOUND":function(n){return"Użytkownik o podanym loginie nie istnieje :-("},"LOG_IN_FORM:RESET:MSG:INVALID_EMAIL":function(n){return"Użytkownik nie ma ustawionego adresu e-mail :-("},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Nie udało się zresetować hasła :-("},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Sprawdź swojego e-maila!"},"BOOL:true":function(n){return"Yes"},"BOOL:false":function(n){return"No"},"BOOL:null":function(n){return"N/A"},"#":function(n){return"No."},GUEST_USER_NAME:function(n){return"Guest"},"NAVBAR:TOGGLE":function(n){return"Show menu"},"NAVBAR:DASHBOARD":function(n){return"Dashboard"},"NAVBAR:EVENTS":function(n){return"Events"},"NAVBAR:ORDERS":function(n){return"Orders"},"NAVBAR:MECH_ORDERS":function(n){return"Mechanical orders"},"NAVBAR:OTHER_ORDERS":function(n){return"Production orders"},"NAVBAR:EMPTY_ORDERS":function(n){return"Empty orders"},"NAVBAR:LINES":function(n){return"Production lines"},"NAVBAR:USERS":function(n){return"Users"},"NAVBAR:MY_ACCOUNT":function(n){return"My account"},"NAVBAR:UI_LOCALE":function(n){return"UI locale"},"NAVBAR:LOCALE_PL":function(n){return"In Polish"},"NAVBAR:LOCALE_US":function(n){return"In English"},"NAVBAR:LOG_IN":function(n){return"Log in"},"NAVBAR:LOG_OUT":function(n){return"Log out"},"NAVBAR:DICTIONARIES":function(n){return"Dictionaries"},"NAVBAR:ORDER_STATUSES":function(n){return"Order statuses"},"NAVBAR:DELAY_REASONS":function(n){return"Delay reasons"},"NAVBAR:DOWNTIME_REASONS":function(n){return"Downtime reasons"},"NAVBAR:LOSS_REASONS":function(n){return"Loss reasons"},"NAVBAR:AORS":function(n){return"Areas of responsibility"},"NAVBAR:WORK_CENTERS":function(n){return"WorkCenters"},"NAVBAR:COMPANIES":function(n){return"Companies"},"NAVBAR:DIVISIONS":function(n){return"Divisions"},"NAVBAR:SUBDIVISIONS":function(n){return"Subdivisions"},"NAVBAR:MRP_CONTROLLERS":function(n){return"MRP Controllers"},"NAVBAR:PROD_FUNCTIONS":function(n){return"Functions"},"NAVBAR:PROD_FLOWS":function(n){return"Production flows"},"NAVBAR:PROD_TASKS":function(n){return"Production tasks"},"NAVBAR:PROD_LINES":function(n){return"Production lines"},"NAVBAR:HOURLY_PLANS":function(n){return"Hourly plans"},"NAVBAR:FTE":function(n){return"FTE"},"NAVBAR:FTE:MASTER":function(n){return"Production"},"NAVBAR:FTE:MASTER:LIST":function(n){return"Entries"},"NAVBAR:FTE:MASTER:CURRENT":function(n){return"Allocation"},"NAVBAR:FTE:LEADER":function(n){return"Warehouse"},"NAVBAR:FTE:LEADER:LIST":function(n){return"Entries"},"NAVBAR:FTE:LEADER:CURRENT":function(n){return"Allocation"},"NAVBAR:VIS":function(n){return"Visualization"},"NAVBAR:VIS:STRUCTURE":function(n){return"Org Unit structure"},"NAVBAR:PRESS_WORKSHEETS":function(n){return"Worksheets"},"NAVBAR:REPORTS":function(n){return"Reports"},"NAVBAR:REPORTS:1":function(n){return"PROD, EFF, Downtime"},"NAVBAR:REPORTS:2":function(n){return"CLIP"},"NAVBAR:REPORTS:3":function(n){return"OEE"},"NAVBAR:REPORTS:4":function(n){return"Operators"},"NAVBAR:REPORTS:5":function(n){return"HR"},"NAVBAR:REPORTS:6":function(n){return"Warehouse"},"NAVBAR:REPORTS:7":function(n){return"Downtimes in AORs"},"NAVBAR:REPORTS:8":function(n){return"Lean"},"NAVBAR:REPORTS:9":function(n){return"Planned line utilization"},"NAVBAR:PROD":function(n){return"Production"},"NAVBAR:PROD:DATA":function(n){return"Production data"},"NAVBAR:PROD:LOG_ENTRIES":function(n){return"Operation log"},"NAVBAR:PROD:SHIFTS":function(n){return"Shifts"},"NAVBAR:PROD:SHIFT_ORDERS":function(n){return"Orders"},"NAVBAR:PROD:DOWNTIMES":function(n){return"Downtimes"},"NAVBAR:PROD:ALERTS":function(n){return"Alerts"},"NAVBAR:PROD:CHANGE_REQUESTS":function(n){return"Change requests"},"NAVBAR:PROGRAMMING":function(n){return"Testing"},"NAVBAR:XICONF":function(n){return"Xiconf <em>(MultiOne)</em>"},"NAVBAR:XICONF:PROGRAMS":function(n){return"Programs"},"NAVBAR:XICONF:ORDERS":function(n){return"Orders"},"NAVBAR:XICONF:RESULTS":function(n){return"Results"},"NAVBAR:XICONF:CLIENTS":function(n){return"Clients"},"NAVBAR:DOCUMENTS":function(n){return"Documentation"},"NAVBAR:DOCUMENTS:CLIENTS":function(n){return"Clients"},"NAVBAR:DOCUMENTS:SETTINGS":function(n){return"Settings"},"NAVBAR:VENDORS":function(n){return"Vendors"},"NAVBAR:PURCHASE_ORDERS":function(n){return"Purchase orders"},"NAVBAR:MONITORING":function(n){return"Monitoring"},"NAVBAR:MONITORING:LAYOUT":function(n){return"Factory layout"},"NAVBAR:MONITORING:LIST":function(n){return"Production line list"},"NAVBAR:VENDOR_NC12S":function(n){return"12NC database"},"NAVBAR:LICENSES":function(n){return"Licenses"},"NAVBAR:OPINION:main":function(n){return"Opinion survey"},"NAVBAR:OPINION:current":function(n){return"Current survey"},"NAVBAR:OPINION:report":function(n){return"Report"},"NAVBAR:OPINION:actions":function(n){return"Corrective actions"},"NAVBAR:OPINION:responses":function(n){return"Responses"},"NAVBAR:OPINION:scanning":function(n){return"Scanning"},"NAVBAR:OPINION:scanTemplates":function(n){return"Templates"},"NAVBAR:OPINION:omrResults":function(n){return"Results"},"NAVBAR:OPINION:dictionaries":function(n){return"Dictionaries"},"NAVBAR:OPINION:surveys":function(n){return"Surveys"},"NAVBAR:OPINION:employers":function(n){return"Employers"},"NAVBAR:OPINION:divisions":function(n){return"Divisions"},"NAVBAR:OPINION:questions":function(n){return"Questions"},"NAVBAR:KAIZEN:main":function(n){return"Near miss"},"NAVBAR:KAIZEN:orders":function(n){return"Entries"},"NAVBAR:KAIZEN:all":function(n){return"All"},"NAVBAR:KAIZEN:open":function(n){return"Only open"},"NAVBAR:KAIZEN:mine":function(n){return"Only mine"},"NAVBAR:KAIZEN:unseen":function(n){return"Only unread"},"NAVBAR:KAIZEN:reports":function(n){return"Reports"},"NAVBAR:KAIZEN:reports:count":function(n){return"Number of entries"},"NAVBAR:KAIZEN:reports:summary":function(n){return"Summary"},"NAVBAR:KAIZEN:dictionaries":function(n){return"Dictionaries"},"NAVBAR:KAIZEN:sections":function(n){return"Sections"},"NAVBAR:KAIZEN:areas":function(n){return"Areas"},"NAVBAR:KAIZEN:categories":function(n){return"Categories"},"NAVBAR:KAIZEN:causes":function(n){return"Causes"},"NAVBAR:KAIZEN:risks":function(n){return"Risks"},"NAVBAR:KAIZEN:help":function(n){return"Help"},"NAVBAR:SUGGESTIONS:main":function(n){return"Suggestions"},"NAVBAR:SUGGESTIONS:orders":function(n){return"Entries"},"NAVBAR:SUGGESTIONS:all":function(n){return"All"},"NAVBAR:SUGGESTIONS:open":function(n){return"Only open"},"NAVBAR:SUGGESTIONS:mine":function(n){return"Only mine"},"NAVBAR:SUGGESTIONS:unseen":function(n){return"Only unread"},"NAVBAR:SUGGESTIONS:reports":function(n){return"Reports"},"NAVBAR:SUGGESTIONS:reports:count":function(n){return"Number of entries"},"NAVBAR:SUGGESTIONS:reports:summary":function(n){return"Summary"},"NAVBAR:SUGGESTIONS:dictionaries":function(n){return"Dictionaries"},"NAVBAR:SUGGESTIONS:sections":function(n){return"Sections"},"NAVBAR:SUGGESTIONS:categories":function(n){return"Categories"},"NAVBAR:SUGGESTIONS:productFamilies":function(n){return"Product families"},"NAVBAR:SUGGESTIONS:help":function(n){return"Help"},"ACTION_FORM:BUTTON":function(n){return"Perform action"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete"},"ACTION_FORM:BUTTON:cancel":function(n){return"Cancel"},"ACTION_FORM:MESSAGE":function(n){return"Are you sure you want to perform the requested action?"},"ACTION_FORM:MESSAGE:failure":function(n){return"Action failed :("},"ORG_UNIT:division":function(n){return"Division"},"ORG_UNIT:subdivision":function(n){return"Subdivision"},"ORG_UNIT:mrpController":function(n){return"MRP Controller"},"ORG_UNIT:prodFlow":function(n){return"Production flow"},"ORG_UNIT:workCenter":function(n){return"WorkCenter"},"ORG_UNIT:prodLine":function(n){return"Production line"},SHIFT:function(n){return r.v(n,"date")+", "+r.v(n,"shift")},"SHIFT:1":function(n){return"I"},"SHIFT:2":function(n){return"II"},"SHIFT:3":function(n){return"III"},"SHIFT:0":function(n){return"Any"},QUARTER:function(n){return r.v(n,"quarter")+" quarter "+r.v(n,"year")},"QUARTER:1":function(n){return"I"},"QUARTER:2":function(n){return"II"},"QUARTER:3":function(n){return"III"},"QUARTER:4":function(n){return"IV"},"QUARTER:0":function(n){return"Any"},"highcharts:contextButtonTitle":function(n){return"Chart's context menu"},"highcharts:downloadJPEG":function(n){return"Save as JPEG"},"highcharts:downloadPDF":function(n){return"Save as PDF"},"highcharts:downloadPNG":function(n){return"Save as PNG"},"highcharts:downloadSVG":function(n){return"Save as SVG"},"highcharts:downloadCSV":function(n){return"Save as CSV"},"highcharts:printChart":function(n){return"Print the chart"},"highcharts:decimalPoint":function(n){return"."},"highcharts:thousandsSep":function(n){return","},"highcharts:noData":function(n){return"No data :("},"highcharts:resetZoom":function(n){return"1:1"},"highcharts:resetZoomTitle":function(n){return"Reset the zoom level to 1:1"},"highcharts:loading":function(n){return"Loading..."},"highcharts:months":function(n){return"January_February_March_April_May_June_July_August_September_October_November_December"},"highcharts:shortMonths":function(n){return"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec"},"highcharts:weekdays":function(n){return"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday"},"dataTables:emptyTable":function(n){return"No data."},"dataTables:loadingRecords":function(n){return"Loading..."},"dataTables:loadingFailed":function(n){return"Loading failed :("},"feedback:button:text":function(n){return"Feedback"},"feedback:button:tooltip":function(n){return"Report bugs, notes, opinions or ideas!"},"colorPicker:label":function(n){return"Color"},"filter:date:from":function(n){return"From"},"filter:date:from:info":function(n){return"Data from 06:00 of the selected day"},"filter:date:to":function(n){return"To"},"filter:date:to:info":function(n){return"Data to 06:00 of the selected day"},"filter:shift":function(n){return"Shift"},"filter:submit":function(n){return"Filter"},"filter:limit":function(n){return"Limit"},"filter:show":function(n){return"Show filter"},"filter:hide":function(n){return"Hide filter"},"placeholder:date":function(n){return"yyyy-mm-dd"},"placeholder:time":function(n){return"--:--"}},pl:!0}});