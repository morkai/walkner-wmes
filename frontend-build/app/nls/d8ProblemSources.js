define(["app/nls/locale/en"],function(e){var r={lc:{pl:function(r){return e(r)},en:function(r){return e(r)}},c:function(e,r){if(!e)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(e,r,n){if(isNaN(e[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return e[r]-(n||0)},v:function(e,n){return r.c(e,n),e[n]},p:function(e,n,t,o,u){return r.c(e,n),e[n]in u?u[e[n]]:(n=r.lc[o](e[n]-t))in u?u[n]:u.other},s:function(e,n,t){return r.c(e,n),e[n]in t?t[e[n]]:t.other}};return{root:{"BREADCRUMBS:base":function(e){return"8D"},"BREADCRUMBS:browse":function(e){return"Problem sources"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the problem sources."},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the problem source."},"MSG:DELETED":function(e){return"Problem source <em>"+r.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add problem source"},"PAGE_ACTION:edit":function(e){return"Edit problem source"},"PAGE_ACTION:delete":function(e){return"Delete problem source"},"PANEL:TITLE:details":function(e){return"Problem source details"},"PANEL:TITLE:addForm":function(e){return"Problem source add form"},"PANEL:TITLE:editForm":function(e){return"Problem source edit form"},"PROPERTY:_id":function(e){return"ID"},"PROPERTY:name":function(e){return"Name"},"PROPERTY:position":function(e){return"Position"},"FORM:ACTION:add":function(e){return"Add problem source"},"FORM:ACTION:edit":function(e){return"Edit problem source"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new problem source."},"FORM:ERROR:editFailure":function(e){return"Failed to edit the problem source."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Problem source deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete problem source"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen problem source?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+r.v(e,"label")+"</em> problem source?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the problem source."}},pl:!0}});