define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,o,r,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[r](n[t]-o))in i?i[t]:i.other},s:function(n,t,o){return e.c(n,t),n[t]in o?o[n[t]]:o.other}};return{root:{"BREADCRUMBS:base":function(n){return"Xiconf"},"BREADCRUMBS:browse":function(n){return"Component weights"},"BREADCRUMBS:addForm":function(n){return"Adding"},"BREADCRUMBS:editForm":function(n){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(n){return"Deleting"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the components."},"MSG:LOADING_SINGLE_FAILURE":function(n){return"Failed to load the component."},"MSG:DELETED":function(n){return"Component <em>"+e.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(n){return"Add component"},"PAGE_ACTION:edit":function(n){return"Edit component"},"PAGE_ACTION:delete":function(n){return"Delete component"},"PANEL:TITLE:details":function(n){return"Component details"},"PANEL:TITLE:addForm":function(n){return"Component add form"},"PANEL:TITLE:editForm":function(n){return"Component edit form"},"filter:submit":function(n){return"Filter components"},"PROPERTY:nc12":function(n){return"Component 12NC"},"PROPERTY:description":function(n){return"Description"},"PROPERTY:minWeight":function(n){return"Min. weight [g]"},"PROPERTY:maxWeight":function(n){return"Max. weight [g]"},"FORM:ACTION:add":function(n){return"Add component"},"FORM:ACTION:edit":function(n){return"Edit component"},"FORM:ERROR:addFailure":function(n){return"Failed to add the component."},"FORM:ERROR:editFailure":function(n){return"Failed to edit the component."},"ACTION_FORM:DIALOG_TITLE:delete":function(n){return"component deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(n){return"Delete component"},"ACTION_FORM:MESSAGE:delete":function(n){return"Are you sure you want to delete the selected component?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> component?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(n){return"Failed to delete the component."}},pl:!0}});