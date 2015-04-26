// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/i18n","app/user","app/data/aors","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/data/downtimeReasons","app/data/views/renderOrgUnitPath","app/core/templates/userInfo","./decorateProdDowntimeChange"],function(r,e,a,o,t,s,n,i,d,p,l,f){"use strict";return function(s,h){var m=h&&h.longDate?"LLLL":"YYYY-MM-DD, HH:mm:ss",g=s.toJSON();g.statusClassName=s.getCssClassName(),g.statusText=e("prodDowntimes","PROPERTY:status:"+g.status),g.className=g.statusClassName,g.reasonComment&&g.reasonComment.trim().length&&(g.className+=" is-withReasonComment");var u=o.get(g.aor);g.aor=u?u.getLabel():g.aor;var A=i.get(g.prodLine);A&&(g.prodLine=A.getLabel(),g.prodLinePath=p(A,!1,!1));var c=d.get(g.reason);if(g.reason=c?c.getLabel():g.reason,g.startedAt&&g.finishedAt){var C=Date.parse(g.startedAt),D=Date.parse(g.finishedAt),b=Math.round((D-C)/1e3);g.duration=r.toString(b)}else g.duration="-";g.startedAt=r.format(g.startedAt,m),g.finishedAt=g.finishedAt?r.format(g.finishedAt,m):e("prodDowntimes","NO_DATA:finishedAt"),g.corroboratedAt=r.format(g.corroboratedAt,m)||"-",g.order=g.prodShiftOrder?g.orderId+"; "+g.operationNo:e("prodDowntimes","NO_DATA:order"),a.isAllowedTo("PROD_DATA:VIEW")&&g.prodShiftOrder&&(g.order='<a href="#prodShiftOrders/'+g.prodShiftOrder+'">'+g.order+"</a>"),g.date=g.date?r.format(g.date,"YYYY-MM-DD"):"?",g.shift=g.shift?e("core","SHIFT:"+g.shift):"?",g.prodShiftText=g.date+", "+g.shift,a.isAllowedTo("PROD_DATA:VIEW")&&g.prodShift&&(g.prodShiftText='<a href="#prodShifts/'+g.prodShift+'">'+g.prodShiftText+"</a>"),g.masterInfo=l({userInfo:g.master}),g.leaderInfo=l({userInfo:g.leader}),g.operatorInfo=l({userInfo:g.operator}),g.creatorInfo=l({userInfo:g.creator}),g.corroboratorInfo=l({userInfo:g.corroborator});var w=t.get(g.subdivision),I=n.get(g.prodFlow);g.subdivision=w?w.getLabel():"?",g.prodFlow=I?I.getLabel():"?",g.mrpControllers=Array.isArray(g.mrpControllers)&&g.mrpControllers.length?g.mrpControllers.join("; "):"?",g.history=!Array.isArray(g.changes)||h&&h.noHistory===!0?[]:g.changes.map(f);var L=g.changesCount;return L&&h&&h.changesCount&&(L.reason&&(g.reason+=' <span title="'+e("prodDowntimes","changesCount:reason")+'" class="label label-'+(L.reason>=h.maxReasonChanges?"danger":"warning")+'">'+L.reason+"</span>"),L.aor&&(g.aor+=' <span title="'+e("prodDowntimes","changesCount:aor")+'" class="label label-'+(L.aor>=h.maxAorChanges?"danger":"warning")+'">'+L.aor+"</span>")),g}});