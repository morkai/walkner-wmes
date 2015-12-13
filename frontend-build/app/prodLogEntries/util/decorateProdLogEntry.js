// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/i18n","app/data/aors","app/data/prodLines","app/data/downtimeReasons","app/data/views/renderOrgUnitPath","app/core/templates/userInfo"],function(a,e,t,r,d,o,i,n){"use strict";function s(e,r){var d=a.without(Object.keys(r),"_id");return"editOrder"===e&&(d=a.without(d,"mechOrder","orderData"),-1!==d.indexOf("orderId")&&(d=a.without(d,"operationNo"))),d.map(function(a){return t(p[e],"PROPERTY:"+a)}).join(", ")}var p={editShift:"prodShifts",editOrder:"prodShiftOrders",editDowntime:"prodDowntimes"};return function(a){var d=a.toJSON(),i={};switch(d.type){case"changeShift":i.date=e.format(d.data.startedProdShift.date,"YYYY-MM-DD"),i.shift=t("core","SHIFT:"+d.data.startedProdShift.shift);break;case"addShift":i.date=e.format(d.data.date,"YYYY-MM-DD"),i.shift=t("core","SHIFT:"+d.data.shift);break;case"changeMaster":case"changeLeader":case"changeOperator":i.name=d.data?d.data.label:"-";break;case"changeQuantitiesDone":i.hour=d.data.hour+1,i.value=d.data.newValue;break;case"changeOrder":case"correctOrder":case"addOrder":var p=d.data.orderData&&d.data.orderData.operations?d.data.orderData.operations[d.data.operationNo]:null;i.orderId=d.data.orderId,i.orderName=d.data.orderData.name||"?",i.operationNo=d.data.operationNo,i.operationName=p?p.name:"?";break;case"changeQuantityDone":case"changeWorkerCount":i.value=d.data.newValue;break;case"startDowntime":case"addDowntime":var h=o.get(d.data.reason),c=r.get(d.data.aor);i._id=d.data._id,i.reason=h?h.getLabel():d.data.reason,i.aor=c?c.getLabel():d.data.aor;break;case"editShift":case"editOrder":case"editDowntime":"editDowntime"===d.type&&(i._id=d.data._id),i.changedProperties=s(d.type,d.data);break;default:i=d.data}var f=null;return d.savedAt&&(f=(Date.parse(d.savedAt)-Date.parse(d.createdAt))/1e3),d.data=t("prodLogEntries","data:"+d.type,i),d.type=t("prodLogEntries","type:"+d.type),d.createdAt=e.format(d.createdAt,"YYYY-MM-DD HH:mm:ss"),d.creator=n({userInfo:d.creator}),f&&(d.createdAt+=" ("+(0>f?"-":"+")+e.toString(Math.abs(f),!1,!0)+")"),d.prodShift&&(d.prodShift='<a href="#prodShifts/'+d.prodShift._id+'">'+e.format(d.prodShift.date,"YYYY-MM-DD")+", "+t("core","SHIFT:"+d.prodShift.shift)+"</a>"),d.prodShiftOrder?d.prodShiftOrder='<a href="#prodShiftOrders/'+d.prodShiftOrder._id+'">'+d.prodShiftOrder.orderId+", "+d.prodShiftOrder.operationNo+"</a>":d.prodShiftOrder=t("prodLogEntries","noData:prodShiftOrder"),d}});