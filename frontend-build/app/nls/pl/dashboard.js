define(["app/nls/locale/pl"],function(t){var n={lc:{pl:function(n){return t(n)},en:function(n){return t(n)}},c:function(t,n){if(!t)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(t,n,r){if(isNaN(t[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return t[n]-(r||0)},v:function(t,r){return n.c(t,r),t[r]},p:function(t,r,u,e,i){return n.c(t,r),t[r]in i?i[t[r]]:(r=n.lc[e](t[r]-u),r in i?i[r]:i.other)},s:function(t,r,u){return n.c(t,r),t[r]in u?u[t[r]]:u.other}};return{"breadcrumbs:logIn":function(t){return"Logowanie do systemu"},"metrics:total:allCount":function(t){return"wszystkich<br>zgłoszeń"},"metrics:total:openCount":function(t){return"otwartych<br>zgłoszeń"},"metrics:total:monthCount":function(t){return"wszystkich<br>w miesiącu"},"metrics:user:allCount":function(t){return"wszystkich<br>Twoich"},"metrics:user:openCount":function(t){return"otwartych<br>Twoich"},"metrics:user:monthCount":function(t){return"Twoich<br>w miesiącu"},"top10:title":function(t){return"Najaktywniejsi "+n.p(t,"month",0,"pl",{1:"w styczniu",2:"w lutym",3:"w marcu",4:"w kwietniu",5:"w maju",6:"w czerwcu",7:"w lipcu",8:"w sierpniu",9:"we wrześniu",10:"w październiku",11:"w listopadzie",12:"w grudniu",other:"w miesiącu"})},"top10:loading":function(t){return"Ładowanie danych..."},"top10:empty":function(t){return"Brak zgłoszeń w danym miesiącu :("},"addButton:nearMiss":function(t){return"Zgłoś<br>ZPW!"},"addButton:suggestion":function(t){return"Zgłoś<br>sugestię!"},"addButton:observation":function(t){return"Zarejestruj obserwację!"},"list:rid":function(t){return"ID"},"list:status":function(t){return"Status"},"list:subject":function(t){return"Temat"},"list:noData:nearMiss":function(t){return"Nie uczestniczysz w żadnych otwartych zgłoszeniach ZPW :("},"list:noData:suggestion":function(t){return"Nie uczestniczysz w żadnych otwartych zgłoszeniach usprawnień :("},"status:new":function(t){return"Nowe"},"status:accepted":function(t){return"Zaakceptowane"},"status:todo":function(t){return"Do realizacji"},"status:inProgress":function(t){return"W realizacji"},"status:cancelled":function(t){return"Anulowane"},"status:finished":function(t){return"Zakończone"},"status:paused":function(t){return"Wstrzymane"}}});