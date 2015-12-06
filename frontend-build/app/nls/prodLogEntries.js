define(["app/nls/locale/en"],function(e){var t={lc:{pl:function(t){return e(t)},en:function(t){return e(t)}},c:function(e,t){if(!e)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(e,t,n){if(isNaN(e[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return e[t]-(n||0)},v:function(e,n){return t.c(e,n),e[n]},p:function(e,n,r,o,i){return t.c(e,n),e[n]in i?i[e[n]]:(n=t.lc[o](e[n]-r),n in i?i[n]:i.other)},s:function(e,n,r){return t.c(e,n),e[n]in r?r[e[n]]:r.other}};return{root:{"BREADCRUMBS:browse":function(){return"Operation log"},"MSG:LOADING_FAILURE":function(){return"Failed to load the operation log :("},"filter:submit":function(){return"Filter operations"},"filter:placeholder:type":function(){return"Any type"},"filter:placeholder:prodLine":function(){return"Any production line"},"PROPERTY:prodLine":function(){return"Production line"},"PROPERTY:type":function(){return"Type"},"PROPERTY:createdAt":function(){return"Created at"},"PROPERTY:creator":function(){return"Creator"},"PROPERTY:data":function(){return"Additional info"},"PROPERTY:prodShift":function(){return"Shift"},"PROPERTY:prodShiftOrder":function(){return"Order"},"type:changeShift":function(){return"Shift start"},"type:changeMaster":function(){return"Master change"},"type:changeLeader":function(){return"Leader change"},"type:changeOperator":function(){return"Operator change"},"type:changeQuantitiesDone":function(){return"Quantities done in an hour change"},"type:changeOrder":function(){return"Order start"},"type:changeQuantityDone":function(){return"Order's quantity done change"},"type:changeWorkerCount":function(){return"Order's worker count change"},"type:correctOrder":function(){return"Order correction"},"type:finishOrder":function(){return"Order finish"},"type:startDowntime":function(){return"Downtime start"},"type:finishDowntime":function(){return"Downtime finish"},"type:corroborateDowntime":function(){return"Downtime corroboration"},"type:endWork":function(){return"End of work"},"type:editShift":function(){return"Shift edit"},"type:editOrder":function(){return"Order edit"},"type:editDowntime":function(){return"Downtime edit"},"type:deleteShift":function(){return"Shift deletion"},"type:deleteDowntime":function(){return"Downtime deletion"},"type:deleteOrder":function(){return"Order deletion"},"type:addShift":function(){return"Shift addition"},"type:addOrder":function(){return"Order addition"},"type:addDowntime":function(){return"Downtime addition"},"type:notifyDowntimeAlert":function(){return"Downtime notification"},"type:finishDowntimeAlert":function(){return"Downtime alert finish"},"data:changeShift":function(e){return"Shift <em>"+t.v(e,"shift")+"</em> on <em>"+t.v(e,"date")+"</em>"},"data:addShift":function(e){return"Shift <em>"+t.v(e,"shift")+"</em> on <em>"+t.v(e,"date")+"</em>"},"data:changeMaster":function(e){return"New master: <em>"+t.v(e,"name")+"</em>"},"data:changeLeader":function(e){return"New leader: <em>"+t.v(e,"name")+"</em>"},"data:changeOperator":function(e){return"New operator: <em>"+t.v(e,"name")+"</em>"},"data:changeQuantitiesDone":function(e){return"Quantity done in the <em>"+t.v(e,"hour")+".</em> hour: <em>"+t.v(e,"value")+"</em>"},"data:changeOrder":function(e){return"Order: <em>"+t.v(e,"orderId")+"</em> (<em>"+t.v(e,"orderName")+"</em>); operation: <em>"+t.v(e,"operationNo")+"</em> (<em>"+t.v(e,"operationName")+"</em>)"},"data:addOrder":function(e){return"Order: <em>"+t.v(e,"orderId")+"</em> (<em>"+t.v(e,"orderName")+"</em>); operation: <em>"+t.v(e,"operationNo")+"</em> (<em>"+t.v(e,"operationName")+"</em>)"},"data:changeQuantityDone":function(e){return"Quantity done in the order: <em>"+t.v(e,"value")+"</em>"},"data:changeWorkerCount":function(e){return"Worker count in the order: <em>"+t.v(e,"value")+"</em>"},"data:correctOrder":function(e){return"Order: <em>"+t.v(e,"orderId")+"</em> (<em>"+t.v(e,"orderName")+"</em>); operation: <em>"+t.v(e,"operationNo")+"</em> (<em>"+t.v(e,"operationName")+"</em>)"},"data:finishOrder":function(){return"-"},"data:startDowntime":function(e){return"<a href='#prodDowntimes/"+t.v(e,"_id")+"'>Reason: <em>"+t.v(e,"reason")+"</em>; AOR: <em>"+t.v(e,"aor")+"</em></a>"},"data:addDowntime":function(e){return"<a href='#prodDowntimes/"+t.v(e,"_id")+"'>Reason: <em>"+t.v(e,"reason")+"</em>; AOR: <em>"+t.v(e,"aor")+"</em></a>"},"data:finishDowntime":function(e){return"Finished <a href='#prodDowntimes/"+t.v(e,"_id")+"'>downtime</a>."},"data:corroborateDowntime":function(e){return t.s(e,"status",{confirmed:"Confirmed",rejected:"Rejected",other:"Corroborated"})+" <a href='#prodDowntimes/"+t.v(e,"_id")+"'>downtime</a>."},"data:endWork":function(){return"-"},"data:editShift":function(e){return"Changed attributes: <em>"+t.v(e,"changedProperties")+"</em>"},"data:editOrder":function(e){return"Changed attributes: <em>"+t.v(e,"changedProperties")+"</em>"},"data:editDowntime":function(e){return"Changed attributes of <a href='#prodDowntimes/"+t.v(e,"_id")+"'>downtime</a>: <em>"+t.v(e,"changedProperties")+"</em>"},"data:deleteShift":function(){return"-"},"data:deleteDowntime":function(e){return"Deleted downtime <em>"+t.v(e,"rid")+"</em>"},"data:deleteOrder":function(e){return"Deleted order <em>"+t.v(e,"orderId")+"; "+t.v(e,"operationNo")+"</em>"},"data:notifyDowntimeAlert":function(e){return"Sent notifications about <a href='#prodDowntimes/"+t.v(e,"downtimeId")+"'>downtime</a> as a part of alert: <a href='#prodDowntimeAlerts/"+t.v(e,"alertId")+"'>"+t.v(e,"alertName")+"</a>"},"data:finishDowntimeAlert":function(e){return"Finished <a href='#prodDowntimes/"+t.v(e,"downtimeId")+"'>downtime</a> alert: <a href='#prodDowntimeAlerts/"+t.v(e,"alertId")+"'>"+t.v(e,"alertName")+"</a>"},"noData:prodShiftOrder":function(){return"<em>no order</em>"}},pl:!0}});