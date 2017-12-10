define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,i,u){return n.c(e,t),e[t]in u?u[e[t]]:(t=n.lc[i](e[t]-r),t in u?u[t]:u.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"Improvements"},"BREADCRUMBS:browse":function(e){return"Risks"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the risks."},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the risk."},"MSG:DELETED":function(e){return"Risk <em>"+n.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add risk"},"PAGE_ACTION:edit":function(e){return"Edit risk"},"PAGE_ACTION:delete":function(e){return"Delete risk"},"PANEL:TITLE:details":function(e){return"Risk's details"},"PANEL:TITLE:addForm":function(e){return"Add risk form"},"PANEL:TITLE:editForm":function(e){return"Edit risk form"},"PROPERTY:_id":function(e){return"ID"},"PROPERTY:name":function(e){return"Name"},"PROPERTY:description":function(e){return"Description"},"PROPERTY:position":function(e){return"Position"},"FORM:ACTION:add":function(e){return"Add risk"},"FORM:ACTION:edit":function(e){return"Edit risk"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new risk."},"FORM:ERROR:editFailure":function(e){return"Failed to edit the risk."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Risk deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete risk"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen risk?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> risk?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the risk."}},pl:!0}});