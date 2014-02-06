define(["app/time","app/i18n","app/user","app/data/aors","app/data/subdivisions","app/data/mrpControllers","app/data/prodFlows","app/data/prodLines","app/data/downtimeReasons","app/data/views/renderOrgUnitPath","app/core/templates/userInfo","i18n!app/nls/prodDowntimes"],function(r,e,t,o,a,s,d,i,n,p,f){return function(s){var m=s.toJSON();m.statusClassName=s.getCssClassName(),m.className=m.statusClassName,m.reasonComment&&m.reasonComment.trim().length&&(m.className+=" is-withReasonComment");var l=o.get(m.aor);m.aor=l?l.getLabel():m.aor;var h=i.get(m.prodLine);h&&(m.prodLine=h.getLabel(),m.prodLinePath=p(h,!1,!1));var A=n.get(m.reason);if(m.reason=A?A.getLabel():m.reason,m.startedAt&&m.finishedAt){var u=Date.parse(m.startedAt),D=Date.parse(m.finishedAt),Y=Math.round((D-u)/1e3);m.duration=r.toString(Y)}else m.duration="-";m.startedAt=r.format(m.startedAt,"YYYY-MM-DD HH:mm:ss"),m.finishedAt=m.finishedAt?r.format(m.finishedAt,"YYYY-MM-DD HH:mm:ss"):e("prodDowntimes","NO_DATA:finishedAt"),m.corroboratedAt=r.format(m.corroboratedAt,"YYYY-MM-DD HH:mm:ss")||"-",m.order=m.prodShiftOrder?m.orderId+"; "+m.operationNo:e("prodDowntimes","NO_DATA:order"),t.isAllowedTo("PROD_DATA:VIEW")&&m.prodShiftOrder&&(m.order='<a href="#prodShiftOrders/'+m.prodShiftOrder+'">'+m.order+"</a>"),m.date=m.date?r.format(m.date,"YYYY-MM-DD"):"?",m.shift=m.shift?e("core","SHIFT:"+m.shift):"?",m.prodShiftText=m.date+", "+m.shift,t.isAllowedTo("PROD_DATA:VIEW")&&m.prodShiftText&&(m.prodShiftText='<a href="#prodShifts/'+m.prodShift+'">'+m.prodShiftText+"</a>"),m.masterInfo=f({userInfo:m.master}),m.leaderInfo=f({userInfo:m.leader}),m.operatorInfo=f({userInfo:m.operator}),m.creatorInfo=f({userInfo:m.creator}),m.corroboratorInfo=f({userInfo:m.corroborator});var g=a.get(m.subdivision),I=d.get(m.prodFlow);return m.subdivision=g?g.getLabel():"?",m.prodFlow=I?I.getLabel():"?",m.mrpControllers=Array.isArray(m.mrpControllers)&&m.mrpControllers.length?m.mrpControllers.join("; "):"?",m}});