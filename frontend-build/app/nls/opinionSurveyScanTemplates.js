define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,u,a){return t.c(e,n),e[n]in a?a[e[n]]:(n=t.lc[u](e[n]-r),n in a?a[n]:a.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:base":function(e){return"Opinion survey"},"BREADCRUMBS:browse":function(e){return"Scan templates"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the scan templates :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the scan template :("},"MSG:DELETED":function(e){return"Scan template <em>"+t.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add scan template"},"PAGE_ACTION:edit":function(e){return"Edit scan template"},"PAGE_ACTION:delete":function(e){return"Delete scan template"},"PANEL:TITLE:details":function(e){return"Scan template's details"},"PANEL:TITLE:addForm":function(e){return"Add scan template form"},"PANEL:TITLE:editForm":function(e){return"Edit scan template form"},"PROPERTY:":function(e){return""},"FORM:ACTION:add":function(e){return"Add scan template"},"FORM:ACTION:edit":function(e){return"Edit scan template"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new scan template :("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the scan template :("},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Scan template deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete scan template"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen scan template?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+t.v(e,"label")+"</em> scan template?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the scan template :-("}},pl:!0}});