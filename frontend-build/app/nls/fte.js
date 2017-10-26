define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,u,o){return t.c(e,n),e[n]in o?o[e[n]]:(n=t.lc[u](e[n]-r),n in o?o[n]:o.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"FTE"},"BREADCRUMBS:leader:browse":function(e){return"FTE (other)"},"BREADCRUMBS:master:browse":function(e){return"FTE (production)"},"BREADCRUMBS:addForm":function(e){return"Choosing"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:details":function(e){return"Resources"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"BREADCRUMBS:settings":function(e){return"Settings"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the FTE data :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the specific FTE data :("},"MSG:DELETED":function(e){return"FTE entry <em>"+t.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:print":function(e){return"Show printable version"},"PAGE_ACTION:add":function(e){return"Allocate resources"},"PAGE_ACTION:edit":function(e){return"Edit entry"},"PAGE_ACTION:delete":function(e){return"Delete entry"},"PAGE_ACTION:export":function(e){return"Export entries"},"PAGE_ACTION:settings":function(e){return"Settings"},"PAGE_ACTION:changeRequest:save":function(e){return"Create change request"},"PAGE_ACTION:changeRequest:cancel":function(e){return"Cancel"},"LIST:ACTION:requestChange":function(e){return"Create change request"},"filter:date":function(e){return"Date"},"filter:shift":function(e){return"Shift"},"filter:submit":function(e){return"Filter entries"},"addForm:panel:title":function(e){return"FTE entry find/create form"},"addForm:copy":function(e){return"Copy the values from the previous entry for the specified shift."},"addForm:submit":function(e){return"Allocate resources"},"addForm:msg:offline":function(e){return"Cannot allocate FTE: no connection with the server :("},"addForm:msg:failure":function(e){return"Failed to find/create the FTE entry for editing: "+t.s(e,"error",{AUTH:"no privileges!",INPUT:"invalid input data!",other:t.v(e,"error")})},"property:date":function(e){return"Date"},"property:shift":function(e){return"Shift"},label:function(e){return t.v(e,"subdivision")+", "+t.v(e,"date")+", "+t.v(e,"shift")+" shift"},"panel:info":function(e){return"All changes are saved on-the-fly."},"leaderEntry:panel:title":function(e){return"Resource allocation"},"leaderEntry:panel:title:editable":function(e){return"Resource allocation form"},"leaderEntry:column:task":function(e){return"Production task"},"leaderEntry:column:taskTotal":function(e){return"Total"},"leaderEntry:column:companyTotal":function(e){return"Total"},"masterEntry:tasksPanel:title":function(e){return"Resource allocation"},"masterEntry:tasksPanel:title:editable":function(e){return"Resource allocation form"},"masterEntry:absencePanel:title":function(e){return"Personnel absence"},"masterEntry:absencePanel:title:editable":function(e){return"Personnel absence form"},"masterEntry:column:task":function(e){return"Production flow/<em>Production task</em>"},"masterEntry:column:noPlan":function(e){return"No plan?"},"masterEntry:column:total":function(e){return"Total"},"masterEntry:column:demand":function(e){return"Demand"},"masterEntry:column:supply":function(e){return"Supply"},"masterEntry:column:shortage":function(e){return"Shortage"},"print:hdLeft":function(e){return"FTE allocated to "+t.v(e,"subdivision")},"print:hdRight":function(e){return t.v(e,"date")+", "+t.v(e,"shift")+" shift"},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"FTE entry deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete FTE entry"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen FTE entry?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+t.v(e,"label")+"</em> FTE entry?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the FTE entry :-("},"settings:tab:general":function(e){return"General"},"settings:tab:structure":function(e){return"Structure"},"settings:general:absenceTasks":function(e){return"Tasks counted as absence"},"settings:structure:subdivision:placeholder":function(e){return"Select a subdivision to set its FTE entry structure"},"settings:structure:prodFunction":function(e){return"Function"},"settings:structure:prodFunction:placeholder":function(e){return"Select a function"},"settings:structure:companies":function(e){return"Employers"},"settings:structure:companies:placeholder":function(e){return"Select a company"},"changeRequest:warning:edit":function(e){return"You're in a production data change request mode. The FTE entry will be updated only after confirmation by the person responsible."},"changeRequest:comment:placeholder":function(e){return"Optional comment..."},"changeRequest:msg:success:edit":function(e){return"FTE edit request created successfully."},"changeRequest:msg:failure:edit":function(e){return"Failed to create the FTE edit request."}},pl:!0}});