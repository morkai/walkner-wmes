define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,u,o){return n.c(e,t),e[t]in o?o[e[t]]:(t=n.lc[u](e[t]-r),t in o?o[t]:o.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"Planned line utilization"},"BREADCRUMBS:browse":function(e){return"CAG groups"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the CAG groups."},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the CAG group."},"MSG:DELETED":function(e){return"CAG group <em>"+n.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add CAG group"},"PAGE_ACTION:edit":function(e){return"Edit CAG group"},"PAGE_ACTION:delete":function(e){return"Delete CAG group"},"PANEL:TITLE:details":function(e){return"CAG group details"},"PANEL:TITLE:addForm":function(e){return"Add CAG group form"},"PANEL:TITLE:editForm":function(e){return"Edit CAG group form"},"PROPERTY:_id":function(e){return"ID"},"PROPERTY:name":function(e){return"Name"},"PROPERTY:color":function(e){return"Color"},"PROPERTY:cags":function(e){return"CAGs"},"FORM:ACTION:add":function(e){return"Add CAG group"},"FORM:ACTION:edit":function(e){return"Edit CAG group"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new CAG group."},"FORM:ERROR:editFailure":function(e){return"Failed to edit the CAG group."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"CAG group deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete CAG group"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen CAG group?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> CAG group?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the CAG group."}},pl:!0}});