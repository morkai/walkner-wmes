define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,i,o,r){return t.c(n,e),n[e]in r?r[n[e]]:(e=t.lc[o](n[e]-i),e in r?r[e]:r.other)},s:function(n,e,i){return t.c(n,e),n[e]in i?i[n[e]]:i.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Subdivisions"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the subdivisions :("},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the subdivision :("},"MSG:DELETED":function(n){return"Subdivision <em>"+t.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(n){return"Add subdivision"},"PAGE_ACTION:edit":function(n){return"Edit subdivision"},"PAGE_ACTION:delete":function(n){return"Delete subdivision"},"PANEL:TITLE:details":function(n){return"Subdivision's details"},"PANEL:TITLE:addForm":function(n){return"Add subdivision form"},"PANEL:TITLE:editForm":function(n){return"Edit subdivision form"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:division":function(n){return"Division"},"PROPERTY:name":function(n){return"Name"},"PROPERTY:prodTaskTags":function(n){return"Production task tags"},"PROPERTY:type":function(n){return"Type"},"PROPERTY:aor":function(n){return"Default AOR"},"PROPERTY:autoDowntimes":function(n){return"Auto downtimes"},"autoDowntimes:add":function(n){return"Add auto downtime"},"autoDowntimes:reason":function(n){return"Auto downtime reason"},"autoDowntimes:when":function(n){return"Initialization"},"autoDowntimes:when:initial":function(n){return"only shift start"},"autoDowntimes:when:always":function(n){return"always"},"autoDowntimes:when:time":function(n){return"at: "+t.v(n,"time")},"TYPE:assembly":function(n){return"Assembly"},"TYPE:press":function(n){return"Press"},"TYPE:storage":function(n){return"Warehouse"},"TYPE:paintShop":function(n){return"Paint shop"},"TYPE:other":function(n){return"Other"},"FORM:ACTION:add":function(n){return"Add subdivision"},"FORM:ACTION:edit":function(n){return"Edit subdivision"},"FORM:ERROR:addFailure":function(n){return"Failed to add the new subdivision :-("},"FORM:ERROR:editFailure":function(n){return"Failed to edit the subdivision :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Subdivision deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete subdivision"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen subdivision?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+t.v(n,"label")+"</em> subdivision?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the subdivision :-("}},pl:!0}});