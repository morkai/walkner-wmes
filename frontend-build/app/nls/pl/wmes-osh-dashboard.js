define(["app/nls/locale/pl"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,r){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(r||0)},v:function(t,r){return n.c(t,r),t[r]},p:function(t,r,e,i,u){return n.c(t,r),t[r]in u?u[t[r]]:(r=n.lc[i](t[r]-e))in u?u[r]:u.other},s:function(t,r,e){return n.c(t,r),t[r]in e?e[t[r]]:e.other}};return{"breadcrumbs:logIn":function(t){return"Logowanie do systemu"},"metrics:total:allCount":function(t){return"wszystkich<br>zgłoszeń"},"metrics:total:openCount":function(t){return"otwartych<br>zgłoszeń"},"metrics:total:monthCount":function(t){return"wszystkich<br>w miesiącu"},"metrics:user:allCount":function(t){return"wszystkich<br>Twoich"},"metrics:user:openCount":function(t){return"otwartych<br>Twoich"},"metrics:user:monthCount":function(t){return"Twoich<br>w miesiącu"},"top10:title":function(t){return"Najaktywniejsi "+n.p(t,"month",0,"pl",{1:"w styczniu",2:"w lutym",3:"w marcu",4:"w kwietniu",5:"w maju",6:"w czerwcu",7:"w lipcu",8:"w sierpniu",9:"we wrześniu",10:"w październiku",11:"w listopadzie",12:"w grudniu",other:"w miesiącu"})},"top10:loading":function(t){return"Ładowanie danych..."},"top10:empty":function(t){return"Brak zgłoszeń w danym miesiącu."},"addButton:nearMiss":function(t){return"Zgłoś<br>ZPW!"},"addButton:kaizen":function(t){return"Zgłoś<br>kaizen!"},"addButton:action":function(t){return"Zarejestruj akcję!"},"addButton:observation":function(t){return"Zarejestruj obserwację!"},"addButton:testing":function(t){return"(wersja testowa)"},"list:rid":function(t){return"ID"},"list:status":function(t){return"Status"},"list:subject":function(t){return"Temat"},"list:noData:nearMiss":function(t){return"Nie uczestniczysz w żadnych otwartych zgłoszeniach ZPW."},"list:noData:kaizen":function(t){return"Nie uczestniczysz w żadnych otwartych zgłoszeniach kaizen."}}});