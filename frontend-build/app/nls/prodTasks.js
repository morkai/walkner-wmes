define(["app/nls/locale/en"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,e){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(e||0)},v:function(t,e){return n.c(t,e),t[e]},p:function(t,e,r,o,i){return n.c(t,e),t[e]in i?i[t[e]]:(e=n.lc[o](t[e]-r),e in i?i[e]:i.other)},s:function(t,e,r){return n.c(t,e),t[e]in r?r[t[e]]:r.other}};return{root:{"BREADCRUMBS:browse":function(){return"Production tasks"},"BREADCRUMBS:addForm":function(){return"Adding"},"BREADCRUMBS:editForm":function(){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"MSG:LOADING_FAILURE":function(){return"Failed to load the production task :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the production task :("},"MSG:DELETED":function(t){return"Production task <em>"+n.v(t,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(){return"Add production task"},"PAGE_ACTION:edit":function(){return"Edit production task"},"PAGE_ACTION:delete":function(){return"Delete production task"},"PANEL:TITLE:details":function(){return"Production task's details"},"PANEL:TITLE:addForm":function(){return"Add production task form"},"PANEL:TITLE:editForm":function(){return"Edit production task form"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:parent":function(){return"Parent task"},"PROPERTY:name":function(){return"Name"},"PROPERTY:tags":function(){return"Tags"},"PROPERTY:fteDiv":function(){return"Divide per Division in FTE (other)?"},"PROPERTY:clipColor":function(){return"Color in CLIP"},"PROPERTY:inProd":function(){return"Use in Productivity?"},"FORM:ACTION:add":function(){return"Add production task"},"FORM:ACTION:edit":function(){return"Edit production task"},"FORM:ERROR:addFailure":function(){return"Failed to add the new production task :-("},"FORM:ERROR:editFailure":function(){return"Failed to edit the production task :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Production task deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete production task"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen production task?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(t){return"Are you sure you want to delete the <em>"+n.v(t,"label")+"</em> production task?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the production task :-("}},pl:!0}});