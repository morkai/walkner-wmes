define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e))in i?i[r]:i.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"BREADCRUMB:browse":function(n){return"MRP Controllers"},"PAGE_ACTION:toggleDeactivated":function(n){return"Hide deactivated"},"PROPERTY:_id":function(n){return"ID"},"PROPERTY:description":function(n){return"Label"},"PROPERTY:division":function(n){return"Division"},"PROPERTY:subdivision":function(n){return"Subdivision"},"PROPERTY:deactivatedAt":function(n){return"Deactivated at"},"PROPERTY:replacedBy":function(n){return"Replaced by"},"PROPERTY:inout":function(n){return"Area"},"inout:-1":function(n){return"Outdoor"},"inout:0":function(n){return"Not applicable"},"inout:1":function(n){return"Indoor"},"ACTION_FORM:delete:NOT_EMPTY":function(n){return"MRP Controller is not empty."},"ownMrps:trigger":function(n){return"mine"},"ownMrps:empty":function(n){return"You don't have any MRPs assigned to your account."},"ownMrps:info":function(n){return"You can assign MRPs by <a href='"+t.v(n,"link")+"'>by editing your account</a> or selecting MRPs from the list below and clicking the button:"},"ownMrps:save":function(n){return"Assign selected MRPs to me"},"select2:noMatches":function(n){return"No matching MRP."},"select2:noMatches:virtual":function(n){return"No matching MRP. Press space to add: "+t.v(n,"mrp")}},pl:!0}});