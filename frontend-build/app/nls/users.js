define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,r){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(r||0)},v:function(n,r){return e.c(n,r),n[r]},p:function(n,r,t,u,E){return e.c(n,r),n[r]in E?E[n[r]]:(r=e.lc[u](n[r]-t),r in E?E[r]:E.other)},s:function(n,r,t){return e.c(n,r),n[r]in t?t[n[r]]:t.other}};return{root:{"BREADCRUMBS:browse":function(){return"Users"},"BREADCRUMBS:addForm":function(){return"Adding"},"BREADCRUMBS:editForm":function(){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"breadcrumbs:logIn":function(){return"Log in form"},"MSG:LOADING_FAILURE":function(){return"Failed to load the users :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the user :("},"MSG:DELETED":function(n){return"User <em>"+e.v(n,"label")+"</em> was deleted."},"MSG:SYNCED":function(){return"Users were synchronized successfully :)"},"MSG:SYNC_FAILURE":function(){return"Failed to synchronize the users :("},"PAGE_ACTION:add":function(){return"Add user"},"PAGE_ACTION:edit":function(){return"Edit user"},"PAGE_ACTION:editAccount":function(){return"Edit account"},"PAGE_ACTION:delete":function(){return"Delete user"},"PAGE_ACTION:sync":function(){return"Synchronize with the AC database"},"PANEL:TITLE:details":function(){return"User's details"},"PANEL:TITLE:addForm":function(){return"Add user form"},"PANEL:TITLE:editForm":function(){return"Edit user form"},"filter:submit":function(){return"Filter users"},"filter:placeholder:personellId":function(){return"Any personnel ID"},"filter:placeholder:lastName":function(){return"Any last name"},"PROPERTY:login":function(){return"Login"},"PROPERTY:password":function(){return"Password"},"PROPERTY:password2":function(){return"Confirm password"},"PROPERTY:email":function(){return"E-mail address"},"PROPERTY:privileges":function(){return"Privileges"},"PROPERTY:prodFunction":function(){return"Production function"},"PROPERTY:aors":function(){return"Areas of responsibility"},"PROPERTY:company":function(){return"Companies"},"PROPERTY:kdDivision":function(){return"Division (AC)"},"PROPERTY:personellId":function(){return"Personell ID"},"PROPERTY:card":function(){return"Card no"},"PROPERTY:name":function(){return"Name"},"PROPERTY:firstName":function(){return"First name"},"PROPERTY:lastName":function(){return"Last name"},"PROPERTY:registerDate":function(){return"Register date"},"PROPERTY:kdPosition":function(){return"Position (AC)"},"PROPERTY:active":function(){return"Active?"},"PROPERTY:orgUnit":function(){return"Org Unit"},"PROPERTY:vendor":function(){return"Vendor"},"PROPERTY:gender":function(){return"Gender"},"ACTIVE:true":function(){return"Yes"},"ACTIVE:false":function(){return"No"},"gender:female":function(){return"Female"},"gender:male":function(){return"Male"},"FORM:ACTION:add":function(){return"Add user"},"FORM:ACTION:edit":function(){return"Edit user"},"FORM:ERROR:passwordMismatch":function(){return"The specified password do not match."},"FORM:ERROR:addFailure":function(){return"Failed to add the user :-("},"FORM:ERROR:editFailure":function(){return"Failed to edit the user :-("},"NO_DATA:aors":function(){return"All"},"NO_DATA:company":function(){return"Unspecified"},"NO_DATA:prodFunction":function(){return"Unspecified"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"User deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete user"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen user?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> user?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the user :-("},"PRIVILEGE:ORDERS:VIEW":function(){return"Orders: view"},"PRIVILEGE:ORDERS:MANAGE":function(){return"Orders: manage"},"PRIVILEGE:EVENTS:VIEW":function(){return"Events: view"},"PRIVILEGE:EVENTS:MANAGE":function(){return"Events: manage"},"PRIVILEGE:USERS:VIEW":function(){return"Users: view"},"PRIVILEGE:USERS:MANAGE":function(){return"Users: manage"},"PRIVILEGE:DICTIONARIES:VIEW":function(){return"Dictionaries: view"},"PRIVILEGE:DICTIONARIES:MANAGE":function(){return"Dictionaries: manage"},"PRIVILEGE:FTE:MASTER:VIEW":function(){return"FTE (production): view"},"PRIVILEGE:FTE:MASTER:MANAGE":function(){return"FTE (production): manage"},"PRIVILEGE:FTE:MASTER:ALL":function(){return"FTE (production): access to all divisions"},"PRIVILEGE:FTE:LEADER:VIEW":function(){return"FTE (distribution): view"},"PRIVILEGE:FTE:LEADER:MANAGE":function(){return"FTE (distribution): manage"},"PRIVILEGE:FTE:LEADER:ALL":function(){return"FTE (distribution): access to all divisions"},"PRIVILEGE:HOURLY_PLANS:VIEW":function(){return"Hourly plans: view"},"PRIVILEGE:HOURLY_PLANS:MANAGE":function(){return"Hourly plans: manage"},"PRIVILEGE:HOURLY_PLANS:ALL":function(){return"Hourly plans: access to all divisions"},"PRIVILEGE:PROD_DOWNTIMES:VIEW":function(){return"Downtimes: view"},"PRIVILEGE:PROD_DOWNTIMES:MANAGE":function(){return"Downtimes: corroboration"},"PRIVILEGE:PROD_DOWNTIMES:ALL":function(){return"Downtimes: access to all divisions"},"PRIVILEGE:PRESS_WORKSHEETS:VIEW":function(){return"Worksheets: view"},"PRIVILEGE:PRESS_WORKSHEETS:MANAGE":function(){return"Worksheets: manage"},"PRIVILEGE:PROD_DATA:VIEW":function(){return"Production data: view"},"PRIVILEGE:PROD_DATA:MANAGE":function(){return"Production data: manage"},"PRIVILEGE:PROD_DATA:CHANGES:REQUEST":function(){return"Production data changes: request"},"PRIVILEGE:PROD_DATA:CHANGES:MANAGE":function(){return"Production data changes: manage"},"PRIVILEGE:REPORTS:VIEW":function(){return"Reports: view all"},"PRIVILEGE:REPORTS:MANAGE":function(){return"Reports: manage"},"PRIVILEGE:REPORTS:1:VIEW":function(){return"Reports: PROD, EFF, Downtime"},"PRIVILEGE:REPORTS:2:VIEW":function(){return"Reports: CLIP"},"PRIVILEGE:REPORTS:3:VIEW":function(){return"Reports: OEE"},"PRIVILEGE:REPORTS:4:VIEW":function(){return"Reports: Operators"},"PRIVILEGE:REPORTS:5:VIEW":function(){return"Reports: HR"},"PRIVILEGE:REPORTS:6:VIEW":function(){return"Reports: Warehouse"},"PRIVILEGE:REPORTS:7:VIEW":function(){return"Reports: Downtimes in AORs"},"PRIVILEGE:XICONF:VIEW":function(){return"Xiconf: view"},"PRIVILEGE:XICONF:MANAGE":function(){return"Xiconf: manage"},"PRIVILEGE:XICONF:NOTIFY":function(){return"Xiconf: notify"},"PRIVILEGE:ICPO:VIEW":function(){return"ICPO: view"},"PRIVILEGE:ICPO:MANAGE":function(){return"ICPO: manage"},"PRIVILEGE:PURCHASE_ORDERS:VIEW":function(){return"Purchase orders: view"},"PRIVILEGE:PURCHASE_ORDERS:MANAGE":function(){return"Purchase orders: manage"},"PRIVILEGE:FACTORY_LAYOUT:MANAGE":function(){return"Monitoring: manage"},"PRIVILEGE:VENDOR_NC12S:VIEW":function(){return"12NC database: view"},"PRIVILEGE:VENDOR_NC12S:MANAGE":function(){return"12NC database: manage"},"PRIVILEGE:KAIZEN:MANAGE":function(){return"Kaizen: manage orders"},"PRIVILEGE:KAIZEN:DICTIONARIES:VIEW":function(){return"Kaizen: view dictionaries"},"PRIVILEGE:KAIZEN:DICTIONARIES:MANAGE":function(){return"Kaizen: manage dictionaries"},"PRIVILEGE:OPERATOR:ACTIVATE":function(){return"WMES Operator: client activation"},"PRIVILEGE:DOCUMENTS:VIEW":function(){return"WMES Documents: view"},"PRIVILEGE:DOCUMENTS:MANAGE":function(){return"WMES Documents: manage"},"PRIVILEGE:DOCUMENTS:ACTIVATE":function(){return"WMES Documents: client activation"},"select2:placeholder":function(){return"Search by last name or personnel ID..."},"select2:users:system":function(){return"System"}},pl:!0}});