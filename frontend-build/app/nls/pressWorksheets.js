define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,i,o){return n.c(t,e),t[e]in o?o[t[e]]:(e=n.lc[i](t[e]-r))in o?o[e]:o.other},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{root:{"BREADCRUMB:browse":function(t){return"Worksheets"},"PANEL:TITLE:details:orders":function(t){return"Parts"},"filter:submit":function(t){return"Filter"},"filter:date":function(t){return"Date"},"filter:shift":function(t){return"Shift"},"filter:type:any":function(t){return"Any"},"filter:type:mech":function(t){return"Treatment"},"filter:type:paintShop":function(t){return"Paint shop"},"filter:type:optics":function(t){return"Optics"},"filter:mine":function(t){return"Only mine"},"filter:mine:title":function(t){return"Limit the worksheet to those added by you from the newest to the oldest!"},"filter:user:master":function(t){return"Master"},"filter:user:operators":function(t){return"Operator"},"filter:machine":function(t){return"Machine"},"PROPERTY:pressWorksheet":function(t){return"Worksheet"},"PROPERTY:user":function(t){return"User"},"PROPERTY:rid":function(t){return"ID"},"PROPERTY:operators":function(t){return"Operators"},"PROPERTY:operator":function(t){return"Signed operator"},"PROPERTY:master":function(t){return"Signed master"},"PROPERTY:date":function(t){return"Date"},"PROPERTY:shift":function(t){return"Shift"},"PROPERTY:type":function(t){return"Type"},"PROPERTY:type:mech":function(t){return"Treatment"},"PROPERTY:type:paintShop":function(t){return"Paint shop"},"PROPERTY:type:optics":function(t){return"Optics"},"PROPERTY:startedAt":function(t){return"Started at"},"PROPERTY:finishedAt":function(t){return"Finished at"},"PROPERTY:createdAt":function(t){return"Created at"},"PROPERTY:creator":function(t){return"Creator"},"PROPERTY:divisions":function(t){return"Divisions"},"PROPERTY:order.part":function(t){return"Part"},"PROPERTY:order.operation":function(t){return"Operation"},"PROPERTY:order.#":function(t){return"#"},"PROPERTY:order.nc12":function(t){return"12NC"},"PROPERTY:order.name":function(t){return"Part name"},"PROPERTY:order.operationName":function(t){return"Operation name"},"PROPERTY:order.operationNo":function(t){return"Operation no"},"PROPERTY:order.division":function(t){return"Division"},"PROPERTY:order.prodLine":function(t){return"Machine"},"PROPERTY:order.quantityDone":function(t){return"Good qty"},"PROPERTY:order.startedAt":function(t){return"Started at"},"PROPERTY:order.finishedAt":function(t){return"Finished at"},"PROPERTY:order.losses":function(t){return"Losses [items]"},"PROPERTY:order.downtimes":function(t){return"Downtimes by master's instruction [minutes]"},"PROPERTY:order.machineManHours":function(t){return"MH"},"FROM:ACTION:saveOverlapping":function(t){return"Save worksheet with overlapping orders"},"FORM:ERROR:startedAt:boundries":function(t){return"Started at must be within the boundries of the selected shift."},"FORM:ERROR:finishedAt:boundries":function(t){return"Finished at must be within the boundries of the selected shift."},"FORM:ERROR:finishedAt:gt":function(t){return"Finished at must be later than Started at."},"FORM:ERROR:finishedAt:downtime":function(t){return"Total downtime must be less than the order's duration."},"FORM:ERROR:overlapping":function(t){return"Time of the orders on the same machines are overlapping!"},"FORM:ERROR:date":function(t){return"Shift's time cannot be in the future."},"FORM:PLACEHOLDER:part":function(t){return"Search parts by 12NC..."},"FORM:PLACEHOLDER:operation":function(t){return"Choose an operation..."},"FORM:PLACEHOLDER:prodLine":function(t){return"Choose a machine..."},"FORM:focusLastPart":function(t){return"(ALT+Enter focuses the last search field)"},"FORM:typeChangeWarning":function(t){return"<strong>WARNING!</strong> Changing of the type will erase all entered parts!"},"FORM:existingWarning":function(t){return"<strong>WARNING!</strong> "+n.p(t,"count",0,"en",{one:"Worksheet",other:"Worksheets"})+" for the specified Date, Shift and Signed operator already "+n.p(t,"count",0,"en",{one:"exists",other:"exist"})+": "+n.v(t,"links")+"."}},pl:!0}});