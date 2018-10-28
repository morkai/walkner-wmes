define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,i,u){return e.c(n,t),n[t]in u?u[n[t]]:(t=e.lc[i](n[t]-r))in u?u[t]:u.other},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMBS:base":function(n){return"QI"},"BREADCRUMBS:browse":function(n){return"Kinds"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the kinds."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the kind."},"MSG:DELETED":function(n){return"Kind <em>"+e.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(n){return"Add kind"},"PAGE_ACTION:edit":function(n){return"Edit kind"},"PAGE_ACTION:delete":function(n){return"Delete kind"},"PANEL:TITLE:details":function(n){return"Kind details"},"PANEL:TITLE:addForm":function(n){return"Add kind form"},"PANEL:TITLE:editForm":function(n){return"Edit kind form"},"PROPERTY:name":function(n){return"Name"},"PROPERTY:division":function(n){return"Division"},"PROPERTY:order":function(n){return"Require order?"},ordersDivision:function(n){return"order's production center"},"FORM:ACTION:add":function(n){return"Add kind"},"FORM:ACTION:edit":function(n){return"Edit kind"},"FORM:ERROR:addFailure":function(n){return"Failed to add the new kind."},"FORM:ERROR:editFailure":function(n){return"Failed to edit the kind."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Kind deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete kind"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen kind?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> kind?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the kind."}},pl:!0}});