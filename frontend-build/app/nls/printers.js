define(["app/nls/locale/en"],function(e){var n={lc:{pl:function(n){return e(n)},en:function(n){return e(n)}},c:function(e,n){if(!e)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(e,n,r){if(isNaN(e[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return e[n]-(r||0)},v:function(e,r){return n.c(e,r),e[r]},p:function(e,r,t,u,i){return n.c(e,r),e[r]in i?i[e[r]]:(r=n.lc[u](e[r]-t),r in i?i[r]:i.other)},s:function(e,r,t){return n.c(e,r),e[r]in t?t[e[r]]:t.other}};return{root:{"BREADCRUMBS:browse":function(e){return"Printers"},"BREADCRUMBS:addForm":function(e){return"Adding"},"BREADCRUMBS:editForm":function(e){return"Editing"},"BREADCRUMBS:ACTION_FORM:delete":function(e){return"Deleting"},"MSG:DELETED":function(e){return"Printer <em>"+n.v(e,"label")+"</em> was deleted."},"PAGE_ACTION:add":function(e){return"Add printer"},"PAGE_ACTION:edit":function(e){return"Edit printer"},"PAGE_ACTION:delete":function(e){return"Delete printer"},"PANEL:TITLE:details":function(e){return"Printer's details"},"PANEL:TITLE:addForm":function(e){return"Add printer form"},"PANEL:TITLE:editForm":function(e){return"Edit printer form"},"PROPERTY:name":function(e){return"Name"},"PROPERTY:label":function(e){return"Label"},"PROPERTY:tags":function(e){return"Tags"},"FORM:ACTION:add":function(e){return"Add printer"},"FORM:ACTION:edit":function(e){return"Edit printer"},"FORM:ERROR:addFailure":function(e){return"Failed to add the new printer."},"FORM:ERROR:editFailure":function(e){return"Failed to edit the printer."},"ACTION_FORM:DIALOG_TITLE:delete":function(e){return"Printer deletion confirmation"},"ACTION_FORM:BUTTON:delete":function(e){return"Delete printer"},"ACTION_FORM:MESSAGE:delete":function(e){return"Are you sure you want to delete the chosen printer?"},"ACTION_FORM:MESSAGE_SPECIFIC:delete":function(e){return"Are you sure you want to delete the <em>"+n.v(e,"label")+"</em> printer?"},"ACTION_FORM:MESSAGE_FAILURE:delete":function(e){return"Failed to delete the printer."},"menu:header":function(e){return"Printers"},"menu:browser":function(e){return"In the browser..."},"select:label":function(e){return"Printer"},"select:placeholder":function(e){return"Choose a printer..."},"select:browser":function(e){return"In the browser..."},"tags:orders":function(e){return"Orders"},"tags:qi":function(e){return"QI"},"tags:planning":function(e){return"Daily plans"},"tags:hourlyPlans":function(e){return"Hourly plans"},"tags:paintShop":function(e){return"Paint-shop"},"tags:fte/production":function(e){return"FTE (production)"},"tags:fte/warehouse":function(e){return" FTE (warehouse)"},"tags:fte/other":function(e){return"FTE (other)"}},pl:!0}});