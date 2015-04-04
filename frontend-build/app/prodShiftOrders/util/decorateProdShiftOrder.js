// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/user","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/data/views/renderOrgUnitPath","app/core/util/getShiftStartInfo","app/core/templates/userInfo"],function(r,e,t,o,a,i,d,s,n,p){"use strict";return function(a,d){var s=a.toJSON(),f=Date.parse(s.startedAt),m=Date.parse(s.finishedAt);if(s.date)s.date=r.format(s.date,"YYYY-MM-DD");else{var l=n(s.startedAt);s.date=l.moment.format("YYYY-MM-DD"),s.shift=l.shift}if(s.shift=e("core","SHIFT:"+s.shift),s.startedAt=r.format(s.startedAt,"HH:mm:ss"),s.finishedAt=r.format(s.finishedAt,"HH:mm:ss"),s.duration=m?r.toString((m-f)/1e3):"-",s.creator=p({userInfo:s.creator}),d.orgUnits){var h=o.get(s.subdivision),u=i.get(s.prodFlow);s.subdivision=h?h.getLabel():"?",s.prodFlow=u?u.getLabel():"?",s.mrpControllers=Array.isArray(s.mrpControllers)&&s.mrpControllers.length?s.mrpControllers.join("; "):"?"}if(s.prodShift=s.prodShift?'<a href="#prodShifts/'+s.prodShift+'">'+s.date+", "+s.shift+"</a>":s.date+", "+s.shift,s.orderData){var c=(s.orderData.operations||{})[s.operationNo]||{};s.order=s.orderId+": <em>"+(s.orderData.name||"?")+"</em>",s.operation=s.operationNo+": <em>"+(c.name||"?")+"</em>"}else s.order=s.orderId,s.operation=s.operationNo;return d.orderUrl&&t.isAllowedTo("ORDERS:VIEW")&&(s.orderUrl="#"+(s.mechOrder?"mechOrders":"orders")+"/"+encodeURIComponent(s.orderId)),s.taktTimeSap=a.getTaktTime(),s.taktTime=a.getActualTaktTime(),s.workerCountSap=a.getWorkerCountSap(),s.efficiency=Math.round(100*a.getEfficiency())+"%",s}});