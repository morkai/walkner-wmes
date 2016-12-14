// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/data/aors","app/data/prodLines","app/data/downtimeReasons","app/data/views/renderOrgUnitPath","app/core/templates/userInfo"],function(e,r,a,t,o,d,i,n){"use strict";function s(r,t){var o=e.without(Object.keys(t),"_id");return"editOrder"===r&&(o=e.without(o,"mechOrder","orderData"),-1!==o.indexOf("orderId")&&(o=e.without(o,"operationNo"))),o.map(function(e){return a(p[r],"PROPERTY:"+e)}).join(", ")}var p={editShift:"prodShifts",editOrder:"prodShiftOrders",editDowntime:"prodDowntimes"};return function(o){var i=o.toJSON(),p=i.data,c="data:"+i.type,h={};switch(i.type){case"changeShift":h.date=r.format(p.startedProdShift.date,"L"),h.shift=a("core","SHIFT:"+p.startedProdShift.shift);break;case"addShift":h.date=r.format(p.date,"L"),h.shift=a("core","SHIFT:"+p.shift);break;case"changeMaster":case"changeLeader":case"changeOperator":h.name=p?p.label:"-";break;case"changeQuantitiesDone":h.hour=p.hour+1,h.value=p.newValue;break;case"changeOrder":case"correctOrder":case"addOrder":var f=p.orderData&&p.orderData.operations?p.orderData.operations[p.operationNo]:null;h.orderId=p.orderId,h.orderName=p.orderData.name||"?",h.operationNo=p.operationNo,h.operationName=f?f.name:"?";break;case"changeQuantityDone":case"changeWorkerCount":h.value=p.newValue;break;case"startDowntime":case"addDowntime":var u=d.get(p.reason),S=t.get(p.aor);h._id=p._id,h.reason=u?u.getLabel():p.reason,h.aor=S?S.getLabel():p.aor;break;case"editShift":case"editOrder":case"editDowntime":"editDowntime"===i.type&&(h._id=p._id),h.changedProperties=s(i.type,p);break;case"checkSpigot":c+=":"+(p["final"]?"final":"initial"),h.result=p.valid?"valid":"invalid",h.nc12=p.nc12,h.downtimeId=p.prodDowntime;break;case"checkSerialNumber":c+=p.error?":error":"",h.sn=p._id,h.error=p.error;break;case"setNextOrder":e.isEmpty(p.orderNo)&&e.isEmpty(p.orders)?h.queue="-":Array.isArray(p.orders)?h.queue=p.orders.map(function(e){return e.orderNo}).join(", "):h.queue=p.orderNo;break;default:h=p}var m=null;return i.savedAt&&(m=(Date.parse(i.savedAt)-Date.parse(i.createdAt))/1e3),i.data=a("prodLogEntries",c,h),i.type=a("prodLogEntries","type:"+i.type),i.createdAt=r.format(i.createdAt,"L, LTS"),i.creator=n({userInfo:i.creator}),m&&(i.createdAt+=" ("+(0>m?"-":"+")+r.toString(Math.abs(m),!1,!0)+")"),i.prodShift&&(i.prodShift='<a href="#prodShifts/'+i.prodShift._id+'">'+r.format(i.prodShift.date,"L")+", "+a("core","SHIFT:"+i.prodShift.shift)+"</a>"),i.prodShiftOrder?i.prodShiftOrder='<a href="#prodShiftOrders/'+i.prodShiftOrder._id+'">'+i.prodShiftOrder.orderId+", "+i.prodShiftOrder.operationNo+"</a>":i.prodShiftOrder=a("prodLogEntries","noData:prodShiftOrder"),i}});