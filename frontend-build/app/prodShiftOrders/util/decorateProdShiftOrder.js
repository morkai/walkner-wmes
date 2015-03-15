// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/user","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/data/views/renderOrgUnitPath","app/core/util/getShiftStartInfo","app/core/templates/userInfo"],function(r,e,t,o,a,i,d,n,s,p){return function(a,d){var n=a.toJSON(),f=Date.parse(n.startedAt),m=Date.parse(n.finishedAt);if(n.date)n.date=r.format(n.date,"YYYY-MM-DD");else{var l=s(n.startedAt);n.date=l.moment.format("YYYY-MM-DD"),n.shift=l.shift}if(n.shift=e("core","SHIFT:"+n.shift),n.startedAt=r.format(n.startedAt,"HH:mm:ss"),n.finishedAt=r.format(n.finishedAt,"HH:mm:ss"),n.duration=m?r.toString((m-f)/1e3):"-",n.creator=p({userInfo:n.creator}),d.orgUnits){var h=o.get(n.subdivision),u=i.get(n.prodFlow);n.subdivision=h?h.getLabel():"?",n.prodFlow=u?u.getLabel():"?",n.mrpControllers=Array.isArray(n.mrpControllers)&&n.mrpControllers.length?n.mrpControllers.join("; "):"?"}if(n.prodShift=n.prodShift?'<a href="#prodShifts/'+n.prodShift+'">'+n.date+", "+n.shift+"</a>":n.date+", "+n.shift,n.orderData){var c=(n.orderData.operations||{})[n.operationNo]||{};n.order=n.orderId+": <em>"+(n.orderData.name||"?")+"</em>",n.operation=n.operationNo+": <em>"+(c.name||"?")+"</em>"}else n.order=n.orderId,n.operation=n.operationNo;return d.orderUrl&&t.isAllowedTo("ORDERS:VIEW")&&(n.orderUrl="#"+(n.mechOrder?"mechOrders":"orders")+"/"+encodeURIComponent(n.orderId)),n.taktTimeSap=a.getTaktTime(),n.taktTime=a.getActualTaktTime(),n.workerCountSap=a.getWorkerCountSap(),n.efficiency=Math.round(100*a.getEfficiency())+"%",n}});