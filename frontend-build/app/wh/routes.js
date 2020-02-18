define(["../broker","../router","../viewport","../user","../time"],function(a,t,n,e,s){"use strict";var r=["css!app/wh/assets/main","css!app/planning/assets/main","css!app/paintShop/assets/main"],p=["i18n!app/nls/wh","i18n!app/nls/planning","i18n!app/nls/paintShop"],i=e.auth("LOCAL","WH:VIEW"),o=e.auth("WH:MANAGE","WH:MANAGE:USERS");t.map("/wh/plans/:id",i,function(t){/^-?[0-9]+d$/.test(t.params.id)&&(t.params.id=s.getMoment().subtract(s.getMoment().hours()<6?1:0,"days").startOf("day").add(+t.params.id.replace("d",""),"days").format("YYYY-MM-DD"),a.publish("router.navigate",{url:"/wh/plans/"+t.params.id,replace:!0,trigger:!1}));var e={date:t.params.id,focus:t.query.focus,from:void 0===t.query.from?"06:00":t.query.from,to:void 0===t.query.to?"06:00":t.query.to};["whStatuses","psStatuses"].forEach(function(a){e[a]=void 0===t.query[a]?null:t.query[a].split(",").filter(function(a){return a.length>0})}),n.loadPage(["app/wh/pages/WhPlanPage"].concat(r,p),function(a){return new a(e)})}),t.map("/wh/problems",i,function(){n.loadPage(["app/wh/pages/WhProblemListPage"].concat(r,p),function(a){return new a})}),t.map("/wh/settings",o,function(a){n.loadPage(["app/wh/pages/WhSettingsPage"].concat(p),function(t){return new t({initialTab:a.query.tab})})})});