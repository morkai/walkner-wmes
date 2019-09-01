define(["../broker","../router","../viewport","../user","../time"],function(a,t,e,n,s){"use strict";var r=["css!app/wh/assets/main","css!app/planning/assets/main","css!app/paintShop/assets/main"],i=["i18n!app/nls/wh","i18n!app/nls/planning"],p=n.auth("LOCAL","WH:VIEW"),o=n.auth("WH:MANAGE","WH:MANAGE:USERS");t.map("/wh/plans/:id",p,function(t){/^-?[0-9]+d$/.test(t.params.id)&&(t.params.id=s.getMoment().subtract(s.getMoment().hours()<6?1:0,"days").startOf("day").add(+t.params.id.replace("d",""),"days").format("YYYY-MM-DD"),a.publish("router.navigate",{url:"/wh/plans/"+t.params.id,replace:!0,trigger:!1}));var n={date:t.params.id,focus:t.query.focus,from:void 0===t.query.from?"06:00":t.query.from,to:void 0===t.query.to?"06:00":t.query.to};["whStatuses","psStatuses"].forEach(function(a){n[a]=void 0===t.query[a]?null:t.query[a].split(",").filter(function(a){return a.length>0})}),e.loadPage(["app/wh/pages/WhPlanPage"].concat(r,i),function(a){return new a(n)})}),t.map("/wh/problems",p,function(){e.loadPage(["app/wh/pages/WhProblemListPage"].concat(r,i),function(a){return new a})}),t.map("/wh/settings",o,function(a){e.loadPage(["app/wh/pages/WhSettingsPage"].concat(i),function(t){return new t({initialTab:a.query.tab})})})});