define(["app/nls/locale/en"],function(t){var e={lc:{pl:function(e){return t(e)},en:function(e){return t(e)}},c:function(t,e){if(!t)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(t,e,n){if(isNaN(t[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return t[e]-(n||0)},v:function(t,n){return e.c(t,n),t[n]},p:function(t,n,r,o,u){return e.c(t,n),t[n]in u?u[t[n]]:(n=e.lc[o](t[n]-r),n in u?u[n]:u.other)},s:function(t,n,r){return e.c(t,n),t[n]in r?r[t[n]]:r.other}};return{root:{"BREADCRUMBS:base":function(t){return"FTE"},"BREADCRUMBS:leader:browse":function(t){return"FTE (other)"},"BREADCRUMBS:master:browse":function(t){return"FTE (production)"},"BREADCRUMBS:addForm":function(t){return"Choosing"},"BREADCRUMBS:editForm":function(t){return"Editing"},"BREADCRUMBS:details":function(t){return"Resources"},"BREADCRUMBS:ACTION_FORM:delete":function(t){return"Deleting"},"BREADCRUMBS:settings":function(t){return"Settings"},"MSG:LOADING_FAILURE":function(t){return"Failed to load the FTE data :("},"MSG:LOADING_SINGLE_FAILURE":function(t){return"Failed to load the specific FTE data :("},"MSG:DELETED":function(t){return"FTE entry <em>"+e.v(t,"label")+"</em> was deleted."},"PAGE_ACTION:print":function(t){return"Show printable version"},"PAGE_ACTION:add":function(t){return"Allocate resources"},"PAGE_ACTION:edit":function(t){return"Edit entry"},"PAGE_ACTION:delete":function(t){return"Delete entry"},"PAGE_ACTION:export":function(t){return"Export entries"},"PAGE_ACTION:settings":function(t){return"Settings"},"PAGE_ACTION:changeRequest:save":function(t){return"Create change request"},"PAGE_ACTION:changeRequest:cancel":function(t){return"Cancel"},"LIST:ACTION:requestChange":function(t){return"Create change request"},"filter:date":function(t){return"Date"},"filter:shift":function(t){return"Shift"},"filter:submit":function(t){return"Filter entries"},"addForm:panel:title":function(t){return"FTE entry find/create form"},"addForm:copy":function(t){return"Copy the values from the previous entry for the specified shift."},"addForm:submit":function(t){return"Allocate resources"},"addForm:msg:offline":function(t){return"Cannot allocate FTE: no connection with the server :("},"addForm:msg:failure":function(t){return"Failed to find/create the FTE entry for editing: "+e.s(t,"error",{AUTH:"no privileges!",INPUT:"invalid input data!",other:e.v(t,"error")})},"property:date":function(t){return"Date"},"property:shift":function(t){return"Shift"},label:function(t){return e.v(t,"subdivision")+", "+e.v(t,"date")+", "+e.v(t,"shift")+" shift"},"panel:info":function(t){return"All changes are saved on-the-fly."},"leaderEntry:panel:title":function(t){return"Resource allocation"},"leaderEntry:panel:title:editable":function(t){return"Resource allocation form"},"leaderEntry:column:task":function(t){return"Production task"},"leaderEntry:column:taskTotal":function(t){return"Total"},"leaderEntry:column:companyTotal":function(t){return"Total"},"masterEntry:tasksPanel:title":function(t){return"Resource allocation"},"masterEntry:tasksPanel:title:editable":function(t){return"Resource allocation form"},"masterEntry:absencePanel:title":function(t){return"Personnel absence"},"masterEntry:absencePanel:title:editable":function(t){return"Personnel absence form"},"masterEntry:column:task":function(t){return"Production flow/<em>Production task</em>"},"masterEntry:column:noPlan":function(t){return"No plan?"},"masterEntry:column:total":function(t){return"Total"},"print:hdLeft":function(t){return"FTE allocated to "+e.v(t,"subdivision")},"print:hdRight":function(t){return e.v(t,"date")+", "+e.v(t,"shift")+" shift"},"ACTION_FORM:DIALOG_TITLE:delete":function(t){return"FTE entry deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(t){return"Delete FTE entry"},"ACTION_FORM:MESSAGE:delete":function(t){return"Are you sure you want to delete the chosen FTE entry?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Are you sure you want to delete the <em>"+e.v(t,"label")+"</em> FTE entry?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(t){return"Failed to delete the FTE entry :-("},"settings:tab:structure":function(t){return"Strcuture"},"settings:structure:subdivision:placeholder":function(t){return"Select a subdivision to set its FTE entry structure"},"settings:structure:prodFunction":function(t){return"Function"},"settings:structure:prodFunction:placeholder":function(t){return"Select a function"},"settings:structure:companies":function(t){return"Employers"},"settings:structure:companies:placeholder":function(t){return"Select a company"}},pl:!0}});