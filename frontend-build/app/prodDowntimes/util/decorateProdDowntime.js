define(["underscore","app/time","app/i18n","app/user","app/data/aors","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/data/downtimeReasons","app/orgUnits/util/renderOrgUnitPath","app/core/templates/userInfo","app/orders/util/resolveProductName","./decorateProdDowntimeChange"],function(r,o,a,e,t,s,n,p,d,i,l,m,f,u){"use strict";return function(n,c){var h=e.isAllowedTo("PROD_DATA:VIEW"),g=c&&c.longDate?"LLLL":"L, LTS",A=n.toJSON();A.statusClassName=n.getCssClassName(),A.statusText=a("prodDowntimes","PROPERTY:status:"+A.status),A.className=A.statusClassName,A.reasonComment&&A.reasonComment.trim().length&&(A.className+=" is-withReasonComment");var C=t.get(A.aor);A.aor=C?C.getLabel():A.aor;var b=d.get(A.prodLine);b&&(A.prodLine=b.getLabel(),A.prodLinePath=l(b,!1,!1));var D=i.get(A.reason);A.reason=D?D.getLabel():A.reason,A.duration=n.getDurationString(c&&c.currentTime),A.startedAt=o.format(A.startedAt,g),A.finishedAt=A.finishedAt?o.format(A.finishedAt,g):a("prodDowntimes","NO_DATA:finishedAt"),A.corroboratedAt=o.format(A.corroboratedAt,g)||"",A.order=A.prodShiftOrder?A.orderId+"; "+A.operationNo:a("prodDowntimes","NO_DATA:order"),h&&A.prodShiftOrder&&(A.order='<a href="#prodShiftOrders/'+(A.prodShiftOrder._id||A.prodShiftOrder)+'">'+A.order+"</a>");var w=s.get(A.subdivision),N=p.get(A.prodFlow);A.subdivision=w?w.getLabel():"",A.prodFlow=N?N.getLabel():"",A.mrpControllers=Array.isArray(A.mrpControllers)&&A.mrpControllers.length?A.mrpControllers.join("; "):"";var I=A.prodShiftOrder;if(A.orderData?(A.productName=A.orderData.name,A.productFamily=A.orderData.family,A.orderMrp='<span title="'+A.mrpControllers+'">'+(A.orderData.mrp||"")+"</span>"):A.orderMrp="<em>"+A.mrpControllers+"</em>",I&&I.orderData){var L=I.orderData;A.orderData||(A.productName=f(L),A.productFamily=A.productName.substring(0,6)),L.operations&&L.operations[A.operationNo]&&(A.operationName=L.operations[A.operationNo].name)}A.date=A.date?o.format(A.date,"L"):"?",A.shift=A.shift?a("core","SHIFT:"+A.shift):"?",A.prodShiftText=A.date+", "+A.shift,h&&A.prodShift&&(A.prodShiftText='<a href="#prodShifts/'+A.prodShift+'">'+A.prodShiftText+"</a>"),A.masterInfo=m({userInfo:A.master}),A.leaderInfo=m({userInfo:A.leader}),Array.isArray(A.operators)&&A.operators.length?A.operatorInfo=A.operators.map(function(r){return m({userInfo:r})}).join("; "):A.operatorInfo=m({userInfo:A.operator}),A.creatorInfo=m({userInfo:A.creator}),A.corroboratorInfo=m({userInfo:A.corroborator}),A.history=!Array.isArray(A.changes)||c&&!0===c.noHistory?[]:A.changes.map(u);var S=A.changesCount;return S&&c&&c.changesCount&&(S.reason&&(A.reason+=' <span title="'+a("prodDowntimes","changesCount:reason")+'" class="label label-'+(S.reason>=c.maxReasonChanges?"danger":"warning")+'">'+S.reason+"</span>"),S.aor&&(A.aor+=' <span title="'+a("prodDowntimes","changesCount:aor")+'" class="label label-'+(S.aor>=c.maxAorChanges?"danger":"warning")+'">'+S.aor+"</span>")),A.prodFlowText=A.prodFlow,c&&c.productFamily&&A.productFamily&&(A.prodFlow='<span class="label label-default" title="'+r.escape(A.productName)+'">'+r.escape(A.productFamily)+"</span> "+A.prodFlow),A}});