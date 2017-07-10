define(["app/nls/locale/en"],function(n){var r={lc:{pl:function(r){return n(r)},en:function(r){return n(r)}},c:function(n,r){if(!n)throw new Error("MessageFormat: Data required for '"+r+"'.")},n:function(n,r,t){if(isNaN(n[r]))throw new Error("MessageFormat: '"+r+"' isn't a number.");return n[r]-(t||0)},v:function(n,t){return r.c(n,t),n[t]},p:function(n,t,e,o,u){return r.c(n,t),n[t]in u?u[n[t]]:(t=r.lc[o](n[t]-e),t in u?u[t]:u.other)},s:function(n,t,e){return r.c(n,t),n[t]in e?e[n[t]]:e.other}};return{root:{"BREADCRUMBS:browse":function(n){return"Invalid orders"},"MSG:LOADING_FAILURE":function(n){return"Failed to load the invalid orders :("},"PAGE_ACTION:check":function(n){return"Check orders"},"PAGE_ACTION:notify":function(n){return"Notify responsible persons"},"PAGE_ACTION:settings":function(n){return"Settings"},"ACTION_FORM:DIALOG_TITLE:ignore":function(n){return"Ignoring order"},"ACTION_FORM:MESSAGE_SPECIFIC:ignore":function(n){return"Are you sure you want to ignore the "+r.v(n,"label")+" order?"},"ACTION_FORM:BUTTON:ignore":function(n){return"Ignore order"},"ACTION_FORM:MESSAGE_FAILURE:ignore":function(n){return"Failed to ignore the order :("},"ACTION_FORM:DIALOG_TITLE:notify":function(n){return"Notifying responsible persons"},"ACTION_FORM:MESSAGE_SPECIFIC:notify":function(n){return"Are you sure you want to send notifications about the following orders: "+r.v(n,"orders")+"?"},"ACTION_FORM:BUTTON:notify":function(n){return"Send notifications"},"ACTION_FORM:MESSAGE_FAILURE:notify":function(n){return"Failed to send notifications :("},"ACTION_FORM:DIALOG_TITLE:check":function(n){return"Checking orders"},"ACTION_FORM:MESSAGE_SPECIFIC:check":function(n){return"Are you sure you want to re-check all orders?"},"ACTION_FORM:BUTTON:check":function(n){return"Check orders"},"ACTION_FORM:MESSAGE_FAILURE:check":function(n){return"Failed to check orders :("},"PROPERTY:orderNo":function(n){return"Order no"},"PROPERTY:productName":function(n){return"Product name"},"PROPERTY:nc12":function(n){return"12NC"},"PROPERTY:mrp":function(n){return"MRP"},"PROPERTY:qty":function(n){return"Quantity"},"PROPERTY:startDate":function(n){return"Start date"},"PROPERTY:status":function(n){return"Status"},"PROPERTY:problem":function(n){return"Problem"},"PROPERTY:solution":function(n){return"Solution"},"PROPERTY:iptStatus":function(n){return"IPT status"},"PROPERTY:iptComment":function(n){return"IPT comment"},"status:invalid":function(n){return"Invalid"},"status:ignored":function(n){return"Ignored"},"status:resolved":function(n){return"Resolved"},"problem:MISSING":function(n){return"No order in the IPT database."},"problem:EMPTY":function(n){return"The IPT order has no operations."},"solution:DONE":function(n){return"Required quantity done."},"solution:STATUS":function(n){return"CNF, DLV or TECO."},"solution:OPERATIONS":function(n){return"Operations showed up."},"filter:submit":function(n){return"Filter orders"},"LIST:ACTION:select":function(n){return"Mark for notification"},"LIST:ACTION:ignore":function(n){return"Ignore"}},pl:!0}});