define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,u){return t.c(n,r),n[r]in u?u[n[r]]:(r=t.lc[o](n[r]-e))in u?u[r]:u.other},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"breadcrumbs:logIn":function(n){return"Login to the system"},"metrics:total:allCount":function(n){return"all<br>entries"},"metrics:total:openCount":function(n){return"open<br>entries"},"metrics:total:monthCount":function(n){return"all<br>in a month"},"metrics:user:allCount":function(n){return"all<br>yours"},"metrics:user:openCount":function(n){return"yours<br>open"},"metrics:user:monthCount":function(n){return"yours<br>in a month"},"top10:title":function(n){return"Most active in "+t.p(n,"month",0,"en",{1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December",other:"a month"})},"top10:loading":function(n){return"Loading..."},"top10:empty":function(n){return"No entries."},"addButton:nearMiss":function(n){return"Add a new<br>near miss!"},"addButton:kaizen":function(n){return"Add a new<br>kaizen!"},"addButton:action":function(n){return"Add a new action!"},"addButton:observation":function(n){return"Add a new observation!"},"addButton:testing":function(n){return"(test version)"},"list:rid":function(n){return"ID"},"list:status":function(n){return"Status"},"list:subject":function(n){return"Subject"},"list:noData:nearMiss":function(n){return"You're not participating in any open near miss entries."},"list:noData:kaizen":function(n){return"You're not participating in any open kaizen entries."}},pl:!0}});