define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,o,s){return n.c(e,t),e[t]in s?s[e[t]]:(t=n.lc[o](e[t]-r),t in s?s[t]:s.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:browse":function(e){return"Loss reasons"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the loss reasons :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the loss reason :("},"MSG:DELETED":function(e){return"Loss reason <em>"+n.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add loss reason"},"PAGE_ACTION:edit":function(e){return"Edit loss reason"},"PAGE_ACTION:delete":function(e){return"Delete loss reason"},"PANEL:TITLE:details":function(e){return"Loss reason's details"},"PANEL:TITLE:addForm":function(e){return"Add loss reason form"},"PANEL:TITLE:editForm":function(e){return"Edit loss reason form"},"PROPERTY:_id":function(e){return"ID"},"PROPERTY:label":function(e){return"Label"},"PROPERTY:position":function(e){return"Position in Worksheet"},"FORM:ACTION:add":function(e){return"Add loss reason"},"FORM:ACTION:edit":function(e){return"Edit loss reason"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new loss reason :-("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the loss reason :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Loss reason deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete loss reason"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen loss reason?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> loss reason?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the loss reason :-("}},pl:!0}});