define(["../broker","../router","../viewport","../user","../time","./pages/WhPlanPage","./pages/WhProblemListPage","i18n!app/nls/planning","i18n!app/nls/wh"],function(a,e,t,n,s,r,i){"use strict";var p=n.auth("LOCAL","WH:VIEW"),o=n.auth("WH:MANAGE");e.map("/wh/plans/:id",p,function(e){/^-?[0-9]+d$/.test(e.params.id)&&(e.params.id=s.getMoment().subtract(s.getMoment().hours()<6?1:0,"days").startOf("day").add(+e.params.id.replace("d",""),"days").format("YYYY-MM-DD"),a.publish("router.navigate",{url:"/wh/plans/"+e.params.id,replace:!0,trigger:!1})),t.showPage(new r({date:e.params.id,focus:e.query.focus}))}),e.map("/wh/problems",p,function(){t.showPage(new i)}),e.map("/wh/settings",o,function(a){t.loadPage("app/wh/pages/WhSettingsPage",function(e){return new e({initialTab:a.query.tab})})})});