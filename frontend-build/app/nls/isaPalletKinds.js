define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,t){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(t||0)},v:function(e,t){return n.c(e,t),e[t]},p:function(e,t,r,i,l){return n.c(e,t),e[t]in l?l[e[t]]:(t=n.lc[i](e[t]-r),t in l?l[t]:l.other)},s:function(e,t,r){return n.c(e,t),e[t]in r?r[e[t]]:r.other}};return{root:{"BREADCRUMBS:browse":function(e){return"Pallet kinds"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:LOADING_FAILURE":function(e){return"Failed to load the pallet kinds :("},"MSG:LOADING_SINGLE_FAILURE":function(e){return"Failed to load the pallet kind :("},"MSG:DELETED":function(e){return"Pallet kind <em>"+n.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add pallet kind"},"PAGE_ACTION:edit":function(e){return"Edit pallet kind"},"PAGE_ACTION:delete":function(e){return"Delete pallet kind"},"PANEL:TITLE:details":function(e){return"Pallet kind's details"},"PANEL:TITLE:addForm":function(e){return"Add pallet kind form"},"PANEL:TITLE:editForm":function(e){return"Edit pallet kind form"},"PROPERTY:shortName":function(e){return"Short name"},"PROPERTY:fullName":function(e){return"Full name"},"FORM:ACTION:add":function(e){return"Add pallet kind"},"FORM:ACTION:edit":function(e){return"Edit pallet kind"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new pallet kind :-("},"FORM:ERROR:editFailure":function(e){return"Failed to edit the pallet kind :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Pallet kind deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete pallet kind"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen pallet kind?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> pallet kind?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the pallet kind :-("}},pl:!0}});