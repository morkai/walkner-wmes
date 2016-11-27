define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,r){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(r||0)},v:function(n,r){return t.c(n,r),n[r]},p:function(n,r,e,o,i){return t.c(n,r),n[r]in i?i[n[r]]:(r=t.lc[o](n[r]-e),r in i?i[r]:i.other)},s:function(n,r,e){return t.c(n,r),n[r]in e?e[n[r]]:e.other}};return{root:{"bc:layout":function(n){return"Monitoring"},"bc:list":function(n){return"Production lines"},"bc:settings":function(n){return"Settings"},"pa:settings":function(n){return"Change settings"},"pa:layout:fullscreen":function(n){return"Fullscreen mode"},"pa:layout:edit":function(n){return"Edit layout"},"pa:layout:live":function(n){return"Publish"},"prop:master":function(n){return"Master"},"prop:leader":function(n){return"Leader"},"prop:operator":function(n){return"Operator"},"prop:shift":function(n){return"Shift"},"prop:order":function(n){return"Order"},"prop:nc12":function(n){return"12NC"},"prop:downtime":function(n){return"Downtime"},"prop:lastOrder":function(n){return"Last order"},"prop:lastNc12":function(n){return"Last 12NC"},"prop:lastDowntime":function(n){return"Last downtime"},"prop:qty":function(n){return"Quantities done"},qty:function(n){return t.v(n,"actual")+" of "+t.v(n,"planned")},"statuses:online":function(n){return"Online"},"statuses:online:title":function(n){return"Production lines connected to the server."},"statuses:offline":function(n){return"Offline"},"statuses:offline:title":function(n){return"Production lines not connected to the server. Data may be inaccurate."},"states:idle":function(n){return"Idle"},"states:working":function(n){return"Work"},"states:downtime":function(n){return"Downtime"},"options:picker":function(n){return"Pick production lines"},"options:save":function(n){return"Save display options"},"options:saved":function(n){return"Display options were saved successfully!"},"options:blacklisted":function(n){return"Ignored"},"options:loadHistory":function(n){return"Show history"},"options:resetHistory":function(n){return"Show current data"},noProdLines:function(n){return"No matching production lines :("},loadingHistoryData:function(n){return"Loading data..."},"msg:historyDataRange":function(n){return"Cannot load more than seven days of data at once :("},"picker:title":function(n){return"Production line picker"},"picker:submit":function(n){return"Pick"},"popover:order":function(n){return"Order:"},"popover:operation":function(n){return"Operation:"},"popover:duration":function(n){return"Duration:"},"popover:quantityDone":function(n){return"Quantity done:"},"popover:workerCount":function(n){return"Workers (SAP):"},"popover:taktTime":function(n){return"Takt Time:"},"popover:cycleTime":function(n){return"Cycle Time (IPT):"},"popover:avgCycleTime":function(n){return"Avg. Cycle Time:"},"popover:downtime":function(n){return"Downtime:"},"popover:aor":function(n){return"AOR:"},"settings:tab:blacklist":function(n){return"Ignored org units"},"settings:tab:divisionColors":function(n){return"Division colors"},"settings:tab:other":function(n){return"Other"},"settings:extendedDowntimeDelay":function(n){return"Extended downtime [min]"}},pl:!0}});