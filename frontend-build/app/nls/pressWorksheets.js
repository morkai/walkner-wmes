define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,o,i){return t.c(e,n),e[n]in i?i[e[n]]:(n=t.lc[o](e[n]-r),n in i?i[n]:i.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:browse":function(){return"Worksheets"},"BREADCRUMBS:details":function(){return"Worksheet"},"BREADCRUMBS:addForm":function(){return"Adding"},"BREADCRUMBS:editForm":function(){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"MSG:LOADING_FAILURE":function(){return"Failed to load the worksheets :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the worksheet :("},"MSG:DELETED":function(e){return"Worksheet <em>"+t.v(e,"label")+"</em> was deleted."},"MSG:jump:404":function(e){return"Couldn't find a worksheet with ID <em>"+t.v(e,"rid")+"</em> :("},"PAGE_ACTION:add":function(){return"Add worksheet"},"PAGE_ACTION:edit":function(){return"Edit worksheet"},"PAGE_ACTION:delete":function(){return"Delete worksheet"},"PAGE_ACTION:jump:title":function(){return"Jump to worksheet by ID"},"PAGE_ACTION:jump:placeholder":function(){return"Worksheet ID"},"PANEL:TITLE:details":function(){return"Worksheet's details"},"PANEL:TITLE:addForm":function(){return"Add worksheet form"},"PANEL:TITLE:editForm":function(){return"Edit worksheet form"},"PANEL:TITLE:details:orders":function(){return"Parts"},"filter:submit":function(){return"Filter worksheets"},"filter:date":function(){return"Date"},"filter:shift":function(){return"Shift"},"filter:type:any":function(){return"Any"},"filter:type:mech":function(){return"Treatment"},"filter:type:paintShop":function(){return"Paint shop"},"filter:type:optics":function(){return"Optics"},"filter:mine":function(){return"Only mine"},"filter:mine:title":function(){return"Limit the worksheet to those added by you from the newest to the oldest!"},"filter:user:master":function(){return"Master"},"filter:user:operators":function(){return"Operator"},"PROPERTY:pressWorksheet":function(){return"Worksheet"},"PROPERTY:user":function(){return"User"},"PROPERTY:rid":function(){return"ID"},"PROPERTY:operators":function(){return"Operators"},"PROPERTY:operator":function(){return"Signed operator"},"PROPERTY:master":function(){return"Signed master"},"PROPERTY:date":function(){return"Date"},"PROPERTY:shift":function(){return"Shift"},"PROPERTY:type":function(){return"Type"},"PROPERTY:type:mech":function(){return"Treatment"},"PROPERTY:type:paintShop":function(){return"Paint shop"},"PROPERTY:type:optics":function(){return"Optics"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:createdAt":function(){return"Created at"},"PROPERTY:creator":function(){return"Creator"},"PROPERTY:divisions":function(){return"Divisions"},"PROPERTY:order.part":function(){return"Part"},"PROPERTY:order.operation":function(){return"Operation"},"PROPERTY:order.#":function(){return"#"},"PROPERTY:order.nc12":function(){return"12NC"},"PROPERTY:order.name":function(){return"Part name"},"PROPERTY:order.operationName":function(){return"Operation name"},"PROPERTY:order.operationNo":function(){return"Operation no"},"PROPERTY:order.division":function(){return"Division"},"PROPERTY:order.prodLine":function(){return"Machine"},"PROPERTY:order.quantityDone":function(){return"Good qty"},"PROPERTY:order.startedAt":function(){return"Started at"},"PROPERTY:order.finishedAt":function(){return"Finished at"},"PROPERTY:order.losses":function(){return"Losses [items]"},"PROPERTY:order.downtimes":function(){return"Downtimes by master's instruction [minutes]"},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Worksheet deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete worksheet"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen worksheet?<br><br>Along with the worksheet, all Orders and Downtimes defined in it will be deleted."},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+t.v(e,"label")+"</em> worksheet? Along with the worksheet, all Orders and Downtimes defined in it will be deleted."},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the worksheet :-("},"FORM:ACTION:add":function(){return"Add worksheet"},"FORM:ACTION:edit":function(){return"Edit worksheet"},"FROM:ACTION:saveOverlapping":function(){return"Save worksheet with overlapping orders"},"FORM:ERROR:addFailure":function(){return"Failed to add the worksheet :-("},"FORM:ERROR:editFailure":function(){return"Failed to edit the worksheet :-("},"FORM:ERROR:startedAt:boundries":function(){return"Started at must be within the boundries of the selected shift."},"FORM:ERROR:finishedAt:boundries":function(){return"Finished at must be within the boundries of the selected shift."},"FORM:ERROR:finishedAt:gt":function(){return"Finished at must be later than Started at."},"FORM:ERROR:finishedAt:downtime":function(){return"Total downtime must be less than the order's duration."},"FORM:ERROR:overlapping":function(){return"Time of the orders on the same machines are overlapping!"},"FORM:ERROR:date":function(){return"Shift's time cannot be in the future."},"FORM:PLACEHOLDER:part":function(){return"Search parts by 12NC..."},"FORM:PLACEHOLDER:operation":function(){return"Choose an operation..."},"FORM:PLACEHOLDER:prodLine":function(){return"Choose a machine..."},"FORM:focusLastPart":function(){return"(ALT+Enter focuses the last search field)"},"FORM:typeChangeWarning":function(){return"<strong>WARNING!</strong> Changing of the type will erase all entered parts!"},"FORM:existingWarning":function(e){return"<strong>WARNING!</strong> "+t.p(e,"count",0,"en",{one:"Worksheet",other:"Worksheets"})+" for the specified Date, Shift and Signed operator already "+t.p(e,"count",0,"en",{one:"exists",other:"exist"})+": "+t.v(e,"links")+"."}},pl:!0}});