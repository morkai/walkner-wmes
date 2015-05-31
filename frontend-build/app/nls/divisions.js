define(["app/nls/locale/en"],function(n){var i={lc:{pl:function(i){return n(i)},en:function(i){return n(i)}},c:function(n,i){if(!n)throw new Error("MessageFormat: Data required for '"+i+"'.")},n:function(n,i,e){if(isNaN(n[i]))throw new Error("MessageFormat: '"+i+"' isn't a number.");return n[i]-(e||0)},v:function(n,e){return i.c(n,e),n[e]},p:function(n,e,t,r,o){return i.c(n,e),n[e]in o?o[n[e]]:(e=i.lc[r](n[e]-t),e in o?o[e]:o.other)},s:function(n,e,t){return i.c(n,e),n[e]in t?t[n[e]]:t.other}};return{root:{"BREADCRUMBS:browse":function(){return"Divisions"},"BREADCRUMBS:addForm":function(){return"Adding"},"BREADCRUMBS:editForm":function(){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"MSG:LOADING_FAILURE":function(){return"Failed to load the divisions :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the division :("},"MSG:DELETED":function(n){return"Division <em>"+i.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(){return"Add division"},"PAGE_ACTION:edit":function(){return"Edit division"},"PAGE_ACTION:delete":function(){return"Delete division"},"PANEL:TITLE:details":function(){return"Division's details"},"PANEL:TITLE:addForm":function(){return"Add division form"},"PANEL:TITLE:editForm":function(){return"Edit division form"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:description":function(){return"Description"},"PROPERTY:type":function(){return"Type"},"TYPE:prod":function(){return"Production"},"TYPE:dist":function(){return"Distribution"},"TYPE:other":function(){return"Other"},"FORM:ACTION:add":function(){return"Add division"},"FORM:ACTION:edit":function(){return"Edit division"},"FORM:ERROR:addFailure":function(){return"Failed to add the new division :-("},"FORM:ERROR:editFailure":function(){return"Failed to edit the division :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Division deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete division"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen division?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+i.v(n,"label")+"</em> division?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the division :-("}},pl:!0}});