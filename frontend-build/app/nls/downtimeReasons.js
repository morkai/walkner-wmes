define(["app/nls/locale/en"],function(n){var e={lc:{pl:function(e){return n(e)},en:function(e){return n(e)}},c:function(n,e){if(!n)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(n,e,t){if(isNaN(n[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return n[e]-(t||0)},v:function(n,t){return e.c(n,t),n[t]},p:function(n,t,r,o,i){return e.c(n,t),n[t]in i?i[n[t]]:(t=e.lc[o](n[t]-r),t in i?i[t]:i.other)},s:function(n,t,r){return e.c(n,t),n[t]in r?r[n[t]]:r.other}};return{root:{"BREADCRUMBS:browse":function(){return"Downtime reasons"},"BREADCRUMBS:addForm":function(){return"Adding"},"BREADCRUMBS:editForm":function(){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(){return"Deleting"},"MSG:LOADING_FAILURE":function(){return"Failed to load thedowntime reasons :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the downtime reason :("},"MSG:DELETED":function(n){return"Downtime reason <em>"+e.v(n,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(){return"Add downtime reason"},"PAGE_ACTION:edit":function(){return"Edit downtime reason"},"PAGE_ACTION:delete":function(){return"Delete downtime reason"},"PANEL:TITLE:details":function(){return"Downtime reason's details"},"PANEL:TITLE:addForm":function(){return"Add downtime reason form"},"PANEL:TITLE:editForm":function(){return"Edit downtime reason form"},"PROPERTY:_id":function(){return"ID"},"PROPERTY:label":function(){return"Label"},"PROPERTY:type":function(){return"Type"},"PROPERTY:subdivisionTypes":function(){return"Subdivision types"},"PROPERTY:opticsPosition":function(){return"Position in Worksheet (optics)"},"PROPERTY:pressPosition":function(){return"Position in Worksheet (other)"},"PROPERTY:scheduled":function(){return"Scheduled?"},"PROPERTY:auto":function(){return"Auto confirmation?"},"PROPERTY:color":function(){return"Value color"},"PROPERTY:refValue":function(){return"Reference [FTE]"},"PROPERTY:refColor":function(){return"Reference color"},"PROPERTY:aors":function(){return"Areas of responsibility"},"PROPERTY:defaultAor":function(){return"Default subdivision AOR only"},"aors:all":function(){return"All"},"type:other":function(){return"Other"},"type:malfunction":function(){return"Malfunction"},"type:renovation":function(){return"Inspection/renovation"},"type:maintenance":function(){return"Maintenance"},"type:adjusting":function(){return"Adjusting/rearmament"},"type:break":function(){return"Break"},"type:otherWorks":function(){return"Other works"},"subdivisionType:none":function(){return"None"},"subdivisionType:assembly":function(){return"Assembly"},"subdivisionType:press":function(){return"Press"},"FORM:ACTION:add":function(){return"Add downtime reason"},"FORM:ACTION:edit":function(){return"Edit downtime reason"},"FORM:ERROR:addFailure":function(){return"Failed to add the new downtime reason :-("},"FORM:ERROR:editFailure":function(){return"Failed to edit the downtime reason :-("},"ACTION_FORM:DIALOG_TITLE:delete":function(){return"Downtime reason deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(){return"Delete downtime reason"},"ACTION_FORM:MESSAGE:delete":function(){return"Are you sure you want to delete the chosen downtime reason?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(n){return"Are you sure you want to delete the <em>"+e.v(n,"label")+"</em> downtime reason?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(){return"Failed to delete the downtime reason :-("}},pl:!0}});