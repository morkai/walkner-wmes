define(["app/nls/locale/en"],function(n){var r={locale:{}};r.locale.en=n;var t=function(n){if(!n)throw new Error("MessageFormat: No data passed to function.")},e=function(n,r){return t(n),n[r]},o=function(n,r,e){return t(n),n[r]in e?e[n[r]]:e.other};return{root:{"BREADCRUMBS:entryList":function(){return"Hourly plans"},"BREADCRUMBS:entryForm":function(){return"Planning"},"BREADCRUMBS:entryDetails":function(){return"Hourly plan"},"BREADCRUMBS:currentEntry":function(){return"Division picking"},"MSG:LOADING_FAILURE":function(){return"Failed to load the hourly plans :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the hourly plan :("},"PAGE_ACTION:currentEntry":function(){return"Plan"},"PAGE_ACTION:print":function(){return"Show printable version"},"PAGE_ACTION:lock":function(){return"Lock entry"},"PAGE_ACTION:edit":function(){return"Edit entry"},"PAGE_ACTION:export":function(){return"Export hourly plans"},"LIST:ACTION:print":function(){return"Show printable version"},"LIST:ACTION:edit":function(){return"Edit entry"},"FILTER:DATE":function(){return"Date:"},"FILTER:LIMIT":function(){return"Limit:"},"FILTER:SHIFT":function(){return"Shift:"},"FILTER:BUTTON":function(){return"Filtruj hourly plans"},"panel:title":function(){return"Hourly plan"},"panel:title:editable":function(){return"Hourly plan form"},"column:flow":function(){return"Production flow"},"column:noPlan":function(){return"No<br>plan?"},"column:level":function(){return"Level"},"property:shift":function(){return"Shift"},"property:date":function(){return"Date"},"msg:lockFailure":function(){return"Failed to lock the hourly plan :("},"print:hdLeft":function(n){return"Hourly plan for "+e(n,"division")},"print:hdRight":function(n){return e(n,"date")+", "+e(n,"shift")+" shift"},"current:panel:title":function(){return"Division picker for hourly plan form"},"current:panel:warning":function(){return"<p>A new entry will be created, if the chosen division won't have an entry for the current shift.</p>"},"current:submit":function(){return"Plan"},"current:msg:offline":function(){return"Cannot plan: no connection to the server :("},"current:msg:failure":function(n){return"Failed to create the hourly plan: "+o(n,"error",{SHIFT_NO:"entry can be created only during the I shift!",AUTH:"no privileges!",INPUT:"invalid division!",other:e(n,"error")})}},pl:!0}});