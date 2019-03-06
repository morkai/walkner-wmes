define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,i,o){return t.c(n,r),n[r]in o?o[n[r]]:(r=t.lc[i](n[r]-e))in o?o[r]:o.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"BREADCRUMBS:main":function(n){return"Planning"},"BREADCRUMBS:browse":function(n){return"Hourly plans"},"BREADCRUMBS:addForm":function(n){return"Choosing"},"BREADCRUMBS:editForm":function(n){return"Planning"},"BREADCRUMBS:heffLineStates":function(n){return"Hourly efficiency"},"BREADCRUMBS:settings":function(n){return"Settings"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"PAGE_ACTION:print":function(n){return"Print plan"},"PAGE_ACTION:add":function(n){return"Plan"},"PAGE_ACTION:heff":function(n){return"Hourly efficiency"},"PAGE_ACTION:planning":function(n){return"Planning"},"PAGE_ACTION:settings":function(n){return"Settings"},"panel:title":function(n){return"Hourly plan"},"panel:title:editable":function(n){return"Hourly plan edit form"},"panel:info":function(n){return"All changes are saved on-the-fly. Planned quantities will be divided among the working Production lines one minute after the last change!"},"column:flow":function(n){return"Production flow"},"column:noPlan":function(n){return"No<br>plan?"},"column:level":function(n){return"Level"},"property:shift":function(n){return"Shift"},"property:date":function(n){return"Date"},"print:hdLeft":function(n){return"Hourly plan for "+t.v(n,"division")},"print:hdRight":function(n){return t.v(n,"date")+", "+t.v(n,"shift")+" shift"},"addForm:panel:title":function(n){return"Hourly plan find/create form"},"addForm:submit":function(n){return"Plan"},"addForm:msg:offline":function(n){return"Cannot plan: no connection to the server."},"addForm:msg:failure":function(n){return"Failed to find/create the hourly plan for editing: "+t.s(n,"error",{AUTH:"no privileges!",INPUT:"invalid input data!",other:t.v(n,"error")})},"heff:filter:division":function(n){return"Division"},"heff:filter:prodFlows":function(n){return"Flows"},"heff:filter:submit":function(n){return"Filter lines"}},pl:!0}});