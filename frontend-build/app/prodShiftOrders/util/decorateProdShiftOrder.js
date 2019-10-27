define(["app/time","app/i18n","app/user","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/orgUnits/util/renderOrgUnitPath","app/core/util/getShiftStartInfo","app/core/templates/userInfo","app/orders/util/resolveProductName"],function(r,e,t,o,a,i,d,p,n,s,f){"use strict";return function(a,d){var p=a.toJSON(),m=Date.parse(p.startedAt),c=Date.parse(p.finishedAt);if(p.date)p.date=r.format(p.date,"L");else{var l=n(p.startedAt);p.date=l.moment.format("L"),p.shift=l.no}if(p.shift=e("core","SHIFT:"+p.shift),p.startedAt=r.format(p.startedAt,"LTS"),p.finishedAt=r.format(p.finishedAt,"LTS"),p.duration=c?r.toString((c-m)/1e3,!d.details):"",p.creator=s({userInfo:p.creator}),d.orgUnits){var u=o.get(p.subdivision),h=i.get(p.prodFlow);p.subdivision=u?u.getLabel():"?",p.prodFlow=h?h.getLabel():"?",p.mrpControllers=Array.isArray(p.mrpControllers)&&p.mrpControllers.length?p.mrpControllers.join(" "):""}if(p.prodShift=p.prodShift?'<a href="#prodShifts/'+p.prodShift+'">'+p.date+", "+p.shift+"</a>":p.date+", "+p.shift,p.orderData){var T=(p.orderData.operations||{})[p.operationNo]||{};p.productName=f(p.orderData),p.operationName=T.name||"",p.order=p.orderId,p.operation=p.operationNo,p.productName&&(p.order+=": "+p.productName),p.operationName&&(p.operation+=": "+p.operationName),p.product=p.productName,p.orderData.nc12&&p.orderData.nc12!==p.orderId&&(p.product=p.orderData.nc12+": "+p.product)}else p.productName="",p.operationName="",p.order=p.orderId,p.operation=p.operationNo;d.orderUrl&&t.isAllowedTo("ORDERS:VIEW")&&(p.orderUrl="#"+(p.mechOrder?"mechOrders":"orders")+"/"+encodeURIComponent(p.orderId)),p.taktTimeOk=a.isTaktTimeOk(),p.taktTimeSap=a.getTaktTime(),p.taktTime=a.getActualTaktTime(),p.taktTimeEff=a.getTaktTimeEfficiency(),p.workerCountSap=a.getWorkerCountSap(),p.efficiency="";var g=a.getEfficiency();return g?p.efficiency=Math.round(100*g)+"%":p.taktTimeEff&&(p.efficiency=p.taktTimeEff+"%"),p}});