define(["app/nls/locale/en"],function(n){var e={locale:{}};e.locale.en=n;var t=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},r=function(n,e){return t(n),n[e]},o=function(n,e,r){return t(n),n[e]in r?r[n[e]]:r.other};return{root:{"BREADCRUMBS:browse":function(){return"Hourly plans"},"BREADCRUMBS:addForm":function(){return"Choosing"},"BREADCRUMBS:editForm":function(){return"Planning"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"MSG:LOADING_FAILURE":function(){return"Failed to load the hourly plans :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the hourly plan :("},"MSG:DELETED":function(n){return"Hourly plan <em>"+r(n,"label")+"</em> was deleted."},"PAGE_ACTION:print":function(){return"Show printable version"},"PAGE_ACTION:add":function(){return"Plan"},"PAGE_ACTION:edit":function(){return"Edit hourly plan"},"PAGE_ACTION:delete":function(){return"Delete hourly plan"},"PAGE_ACTION:export":function(){return"Export hourly plans"},"FILTER:DATE":function(){return"Date:"},"FILTER:LIMIT":function(){return"Limit:"},"FILTER:SHIFT":function(){return"Shift:"},"FILTER:BUTTON":function(){return"Filter hourly plans"},"panel:title":function(){return"Hourly plan"},"panel:title:editable":function(){return"Hourly plan edit form"},"panel:info":function(){return"All changes are saved on-the-fly. Planned quantities will be divided among the working Production lines one minute after the last change!"},"column:flow":function(){return"Production flow"},"column:noPlan":function(){return"No<br>plan?"},"column:level":function(){return"Level"},"property:shift":function(){return"Shift"},"property:date":function(){return"Date"},"print:hdLeft":function(n){return"Hourly plan for "+r(n,"division")},"print:hdRight":function(n){return r(n,"date")+", "+r(n,"shift")+" shift"},"addForm:panel:title":function(){return"Hourly plan find/create form"},"addForm:submit":function(){return"Plan"},"addForm:msg:offline":function(){return"Cannot plan: no connection to the server :("},"addForm:msg:failure":function(n){return"Failed to find/create the hourly plan for editing: "+o(n,"error",{AUTH:"no privileges!",INPUT:"invalid input data!",other:r(n,"error")})},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Hourly plan deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete hourly plan"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen hourly plan?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+r(n,"label")+"</em> hourly plan?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the hourly plan :-("}},pl:!0}});