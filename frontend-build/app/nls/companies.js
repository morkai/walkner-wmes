define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[o](n[t]-r))in u?u[t]:u.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Companies"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the companies."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the company."},"MSG:DELETED":function(n){return"Company <em>"+e.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(n){return"Add company"},"PAGE_ACTION:edit":function(n){return"Edit company"},"PAGE_ACTION:delete":function(n){return"Delete company"},"PANEL:TITLE:details":function(n){return"Company's details"},"PANEL:TITLE:addForm":function(n){return"Add company form"},"PANEL:TITLE:editForm":function(n){return"Edit company form"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:name":function(n){return"Name"},"PROPERTY:shortName":function(n){return"Short name"},"PROPERTY:color":function(n){return"Color"},"FORM:ACTION:add":function(n){return"Add company"},"FORM:ACTION:edit":function(n){return"Edit company"},"FORM:ERROR:addFailure":function(n){return"Failed to add the new company."},"FORM:ERROR:editFailure":function(n){return"Failed to edit the company."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Company deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete company"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen company?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> company?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the company."}},pl:!0}});