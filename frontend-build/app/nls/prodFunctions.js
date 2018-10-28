define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,u,i){return t.c(n,e),n[e]in i?i[n[e]]:(e=t.lc[u](n[e]-r))in i?i[e]:i.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Functions"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the functions."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the function."},"MSG:DELETED":function(n){return"Function <em>"+t.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(n){return"Add function"},"PAGE_ACTION:edit":function(n){return"Edit function"},"PAGE_ACTION:delete":function(n){return"Delete function"},"PANEL:TITLE:details":function(n){return"Function's details"},"PANEL:TITLE:addForm":function(n){return"Add function form"},"PANEL:TITLE:editForm":function(n){return"Edit function form"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:label":function(n){return"Label"},"PROPERTY:direct":function(n){return"DIRECT/INDIRECT"},"PROPERTY:dirIndirRatio":function(n){return"DIR/INDIR [%]"},"PROPERTY:color":function(n){return"Color"},"direct:true":function(n){return"DIRECT"},"direct:false":function(n){return"INDIRECT"},"FORM:ACTION:add":function(n){return"Add function"},"FORM:ACTION:edit":function(n){return"Edit function"},"FORM:ERROR:addFailure":function(n){return"Failed to add the new function."},"FORM:ERROR:editFailure":function(n){return"Failed to edit the function."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"Function deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete function"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the chosen function?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+t.v(n,"label")+"</em> function?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the function."}},pl:!0}});