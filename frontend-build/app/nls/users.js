define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,i,u){return e.c(n,r),n[r]in u?u[n[r]]:(r=e.lc[i](n[r]-t),r in u?u[r]:u.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Users"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:myAccount":function(n){return"My account"},"BREADCRUMBS:settings":function(n){return"Settings"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"breadcrumbs:logIn":function(n){return"Log in form"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the users."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the user."},"MSG:DELETED":function(n){return"User <em>"+e.v(n,"label")+"</em> was deleted."},"MSG:SYNCED":function(n){return"Users were synchronized successfully :)"},"MSG:SYNC_FAILURE":function(n){return"Failed to synchronize the users."},"PAGE_ACTION:add":function(n){return"Add user"},"PAGE_ACTION:edit":function(n){return"Edit user"},"PAGE_ACTION:editAccount":function(n){return"Edit account"},"PAGE_ACTION:delete":function(n){return"Delete user"},"PAGE_ACTION:sync":function(n){return"Synchronize with the AC database"},"PAGE_ACTION:settings":function(n){return"Settings"},"PANEL:TITLE:details:basic":function(n){return"Basic information"},"PANEL:TITLE:details:contact":function(n){return"Concat information"},"PANEL:TITLE:details:extra":function(n){return"Additional information"},"PANEL:TITLE:details:privileges":function(n){return"Privileges"},"PANEL:TITLE:addForm":function(n){return"Add user form"},"PANEL:TITLE:editForm":function(n){return"Edit user form"},"filter:submit":function(n){return"Filter users"},"PROPERTY:login":function(n){return"Login"},"PROPERTY:password":function(n){return"Password"},"PROPERTY:newPassword":function(n){return"New password"},"PROPERTY:password2":function(n){return"Confirm password"},"PROPERTY:email":function(n){return"E-mail address"},"PROPERTY:privileges":function(n){return"Privileges"},"PROPERTY:prodFunction":function(n){return"Production function"},"PROPERTY:aors":function(n){return"Areas of responsibility"},"PROPERTY:company":function(n){return"Companies"},"PROPERTY:kdId":function(n){return"ID (AC)"},"PROPERTY:kdDivision":function(n){return"Division (AC)"},"PROPERTY:personellId":function(n){return"Personell ID"},"PROPERTY:card":function(n){return"Card no"},"PROPERTY:name":function(n){return"Name"},"PROPERTY:firstName":function(n){return"First name"},"PROPERTY:lastName":function(n){return"Last name"},"PROPERTY:registerDate":function(n){return"Register date"},"PROPERTY:kdPosition":function(n){return"Position (AC)"},"PROPERTY:active":function(n){return"Active account?"},"PROPERTY:orgUnit":function(n){return"Org Unit"},"PROPERTY:vendor":function(n){return"Vendor"},"PROPERTY:gender":function(n){return"Gender"},"PROPERTY:mobile":function(n){return"Mobile phone numbers"},"PROPERTY:mrps":function(n){return"My MRPs"},"active:true":function(n){return"Yes"},"active:false":function(n){return"No"},"gender:female":function(n){return"Female"},"gender:male":function(n){return"Male"},"FORM:ACTION:add":function(n){return"Add user"},"FORM:ACTION:edit":function(n){return"Edit user"},"FORM:ERROR:passwordMismatch":function(n){return"The specified password do not match."},"FORM:ERROR:addFailure":function(n){return"Failed to add the user."},"FORM:ERROR:editFailure":function(n){return"Failed to edit the user."},"FORM:ERROR:LOGIN_USED":function(n){return"The specified login is already used in another active account."},"FORM:HELP:password":function(n){return"Enter a new password only if you want to change the current password."},"FORM:mobile:from":function(n){return"available from"},"FORM:mobile:to":function(n){return"to"},"FORM:mobile:empty":function(n){return"No mobile numbers defined."},"FORM:mobile:item":function(n){return e.v(n,"number")+" from "+e.v(n,"fromTime")+" to "+e.v(n,"toTime")},"FORM:copyPrivileges:success":function(n){return"Privileges copied to clipboard :)"},"NO_DATA:aors":function(n){return"All"},"NO_DATA:company":function(n){return"Unspecified"},"NO_DATA:prodFunction":function(n){return"Unspecified"},"NO_DATA:vendor":function(n){return"All"},"DETAILS:mobile:item":function(n){return e.v(n,"number")+" from "+e.v(n,"fromTime")+" to "+e.v(n,"toTime")},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"User deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete user"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen user?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> user?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the user."},"PRIVILEGE:ORDERS:VIEW":function(n){return"Orders: view"},"PRIVILEGE:ORDERS:MANAGE":function(n){return"Orders: manage"},"PRIVILEGE:EVENTS:VIEW":function(n){return"Events: view"},"PRIVILEGE:EVENTS:MANAGE":function(n){return"Events: manage"},"PRIVILEGE:USERS:VIEW":function(n){return"Users: view"},"PRIVILEGE:USERS:MANAGE":function(n){return"Users: manage"},"PRIVILEGE:DICTIONARIES:VIEW":function(n){return"Dictionaries: view"},"PRIVILEGE:DICTIONARIES:MANAGE":function(n){return"Dictionaries: manage"},"PRIVILEGE:FTE:MASTER:VIEW":function(n){return"FTE (production): view"},"PRIVILEGE:FTE:MASTER:MANAGE":function(n){return"FTE (production): manage"},"PRIVILEGE:FTE:MASTER:ALL":function(n){return"FTE (production): access to all divisions"},"PRIVILEGE:FTE:LEADER:VIEW":function(n){return"FTE (other): view"},"PRIVILEGE:FTE:LEADER:MANAGE":function(n){return"FTE (other): manage"},"PRIVILEGE:FTE:LEADER:ALL":function(n){return"FTE (other): access to all divisions"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(n){return"Hourly plans: view"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(n){return"Hourly plans: manage"},"PRIVILEGE:HOURLY_PLANS:ALL":function(n){return"Hourly plans: access to all divisions"},"PRIVILEGE:PLANNING:VIEW":function(n){return"Daily plans: view"},"PRIVILEGE:PLANNING:MANAGE":function(n){return"Daily plans: manage"},"PRIVILEGE:PLANNING:PLANNER":function(n){return"Daily plans: planner"},"PRIVILEGE:PLANNING:WHMAN":function(n){return"Daily plans: warehouseman"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(n){return"Downtimes: view"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(n){return"Downtimes: corroboration"},"PRIVILEGE:PROD_DOWNTIMES:ALL":function(n){return"Downtimes: access to all divisions"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:VIEW":function(n){return"Alerts: view"},"PRIVILEGE:PROD_DOWNTIME_ALERTS:MANAGE":function(n){return"Alerts: manage"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(n){return"Worksheets: view"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(n){return"Worksheets: manage"},"PRIVILEGE:PROD_DATA:VIEW":function(n){return"Production data: view"},"PRIVILEGE:PROD_DATA:VIEW:EFF":function(n){return"Production data: efficiency"},"PRIVILEGE:PROD_DATA:MANAGE":function(n){return"Production data: manage"},"PRIVILEGE:PROD_DATA:MANAGE:SPIGOT_ONLY":function(n){return"Only change lines with spigot"},"PRIVILEGE:PROD_DATA:CHANGES:REQUEST":function(n){return"Production data changes: request"},"PRIVILEGE:PROD_DATA:CHANGES:MANAGE":function(n){return"Production data changes: manage"},"PRIVILEGE:REPORTS:VIEW":function(n){return"Reports: view all"},"PRIVILEGE:REPORTS:MANAGE":function(n){return"Reports: manage"},"PRIVILEGE:REPORTS:1:VIEW":function(n){return"Reports: PROD, EFF, Downtime"},"PRIVILEGE:REPORTS:2:VIEW":function(n){return"Reports: CLIP"},"PRIVILEGE:REPORTS:3:VIEW":function(n){return"Reports: OEE"},"PRIVILEGE:REPORTS:4:VIEW":function(n){return"Reports: Operators"},"PRIVILEGE:REPORTS:5:VIEW":function(n){return"Reports: HR"},"PRIVILEGE:REPORTS:6:VIEW":function(n){return"Reports: Warehouse"},"PRIVILEGE:REPORTS:7:VIEW":function(n){return"Reports: Downtimes in AORs"},"PRIVILEGE:REPORTS:8:VIEW":function(n){return"Reports: Lean"},"PRIVILEGE:REPORTS:9:VIEW":function(n){return"Reports: Planned line utilization"},"PRIVILEGE:XICONF:VIEW":function(n){return"Xiconf: view"},"PRIVILEGE:XICONF:MANAGE":function(n){return"Xiconf: manage"},"PRIVILEGE:XICONF:NOTIFY":function(n){return"Xiconf: notify"},"PRIVILEGE:ICPO:VIEW":function(n){return"ICPO: view"},"PRIVILEGE:ICPO:MANAGE":function(n){return"ICPO: manage"},"PRIVILEGE:PURCHASE_ORDERS:VIEW":function(n){return"Purchase orders: view"},"PRIVILEGE:PURCHASE_ORDERS:MANAGE":function(n){return"Purchase orders: manage"},"PRIVILEGE:FACTORY_LAYOUT:MANAGE":function(n){return"Monitoring: manage"},"PRIVILEGE:VENDOR_NC12S:VIEW":function(n){return"12NC database: view"},"PRIVILEGE:VENDOR_NC12S:MANAGE":function(n){return"12NC database: manage"},"PRIVILEGE:KAIZEN:MANAGE":function(n){return"Near miss: manage entries"},"PRIVILEGE:KAIZEN:DICTIONARIES:VIEW":function(n){return"Near miss/Suggestions: view dictionaries"},"PRIVILEGE:KAIZEN:DICTIONARIES:MANAGE":function(n){return"Near miss/Suggestions: manage dictionaries"},"PRIVILEGE:SUGGESTIONS:MANAGE":function(n){return"Suggestions: manage entries"},"PRIVILEGE:OPERATOR:ACTIVATE":function(n){return"WMES Operator: client activation"},"PRIVILEGE:DOCUMENTS:VIEW":function(n){return"WMES Documents: view"},"PRIVILEGE:DOCUMENTS:MANAGE":function(n){return"WMES Documents: manage"},"PRIVILEGE:DOCUMENTS:ACTIVATE":function(n){return"WMES Documents: client activation"},"PRIVILEGE:OPINION_SURVEYS:MANAGE":function(n){return"Opinion surveys: manage"},"PRIVILEGE:ISA:VIEW":function(n){return"ISA: view"},"PRIVILEGE:ISA:MANAGE":function(n){return"ISA: manage"},"PRIVILEGE:ISA:WHMAN":function(n){return"ISA: warehouseman"},"PRIVILEGE:QI:INSPECTOR":function(n){return"QI: inspector"},"PRIVILEGE:QI:SPECIALIST":function(n){return"QI: specialist"},"PRIVILEGE:QI:RESULTS:VIEW":function(n){return"QI: view results"},"PRIVILEGE:QI:RESULTS:MANAGE":function(n){return"QI: manage results"},"PRIVILEGE:QI:DICTIONARIES:VIEW":function(n){return"QI: view dictionaries"},"PRIVILEGE:QI:DICTIONARIES:MANAGE":function(n){return"QI: manage dictionaries"},"PRIVILEGE:PSCS:VIEW":function(n){return"PSCS: view"},"PRIVILEGE:PSCS:MANAGE":function(n){return"PSCS: manage"},"PRIVILEGE:D8:VIEW":function(n){return"QI: view entries"},"PRIVILEGE:D8:MANAGE":function(n){return"QI: manage entries"},"PRIVILEGE:D8:LEADER":function(n){return"QI: leader"},"PRIVILEGE:D8:DICTIONARIES:VIEW":function(n){return"QI: view dictionaries"},"PRIVILEGE:D8:DICTIONARIES:MANAGE":function(n){return"QI: manage dictionaries"},"PRIVILEGE:MOR:MANAGE":function(n){return"Matrix of responsibility: manage"},"PRIVILEGE:MOR:MANAGE:USERS":function(n){return"Matrix of responsibility: edit users"},"PRIVILEGE:PAINT_SHOP:VIEW":function(n){return"Paint shop: view"},"PRIVILEGE:PAINT_SHOP:MANAGE":function(n){return"Paint shop: manage"},"PRIVILEGE:PAINT_SHOP:PAINTER":function(n){return"Paint shop: painter"},"PRIVILEGE:PAINT_SHOP:DROP_ZONES":function(n){return"Paint shop: toggle drop zone"},"select2:placeholder":function(n){return"Search by last name or personnel ID..."},"select2:users:system":function(n){return"System"},"LOG_IN_FORM:TITLE:LOG_IN":function(n){return"Log in form"},"LOG_IN_FORM:TITLE:RESET":function(n){return"Password reset form"},"LOG_IN_FORM:LABEL:LOGIN":function(n){return"Login"},"LOG_IN_FORM:LABEL:PASSWORD":function(n){return"Password"},"LOG_IN_FORM:LABEL:NEW_PASSWORD":function(n){return"New password"},"LOG_IN_FORM:SUBMIT:LOG_IN":function(n){return"Log in"},"LOG_IN_FORM:SUBMIT:RESET":function(n){return"Reset password"},"LOG_IN_FORM:LINK:LOG_IN":function(n){return"Log in"},"LOG_IN_FORM:LINK:RESET":function(n){return"Forgot your password?"},"LOG_IN_FORM:RESET:SUBJECT":function(n){return"["+e.v(n,"APP_NAME")+"] password reset"},"LOG_IN_FORM:RESET:TEXT":function(n){return"We've received a request to reset your password for the "+e.v(n,"APP_NAME")+" app.\n\nTo change your password, please click this link:\n"+e.v(n,"resetUrl")+"\n\nPassword reset links are valid for only 24 hours. If the link expires, you will need to submit a new request here: "+e.v(n,"appUrl")+"\n\nIf you didn't request a change, please disregard this e-mail and your password will stay the same.\n\nContact your superior or an administrator if you need help or have questions.\n\nSincerely, the support team."},"LOG_IN_FORM:RESET:MSG:NOT_FOUND":function(n){return"User not found."},"LOG_IN_FORM:RESET:MSG:INVALID_EMAIL":function(n){return"User doesn't have an e-mail address."},"LOG_IN_FORM:RESET:MSG:FAILURE":function(n){return"Failed to reset the password."},"LOG_IN_FORM:RESET:MSG:SUCCESS":function(n){return"Check your e-mail!"},"settings:tab:presence":function(n){return"Access control"},"settings:presence:hardware":function(n){return"Hardware"}},pl:!0}});