define(["../broker","../router","../viewport","../user","../time"],function(n,a,e,t,i){"use strict";var p=["css!app/planning/assets/main","css!app/paintShop/assets/main"],r=["i18n!app/nls/planning","i18n!app/nls/paintShop"],l=t.auth("EMBEDDED","PLANNING:VIEW"),s=t.auth("PLANNING:MANAGE"),u=t.auth("WH:VIEW");a.map("/planning/settings/:id",s,function(n){e.loadPage(["app/planning/PlanSettings","app/planning/pages/PlanSettingsPage",p[0],r[0]],function(a,e){return new e({model:new a({_id:n.params.id}),back:"1"===n.query.back})})}),a.map("/planning/changes",l,function(n){e.loadPage(["app/planning/PlanChangesCollection","app/planning/pages/PlanChangesPage",p[0],r[0]],function(a,e){return new e({collection:new a(null,{rqlQuery:n.rql,paginate:!1})})})}),a.map("/planning/plans",l,function(n){e.loadPage(["app/planning/PlanSettingsCollection","app/planning/pages/PlanListPage",p[0],r[0]],function(a,e){return new e({collection:new a(null,{rqlQuery:n.rql,paginate:!1})})})}),a.map("/planning/plans/:id",l,function(a){/^-?[0-9]+d$/.test(a.params.id)&&(a.params.id=i.getMoment().subtract(i.getMoment().hours()<6?1:0,"days").startOf("day").add(+a.params.id.replace("d",""),"days").format("YYYY-MM-DD"),n.publish("router.navigate",{url:"/planning/plans/"+a.params.id,replace:!0,trigger:!1})),e.loadPage(["app/planning/pages/PlanPage"].concat(p,r),function(n){return new n({date:a.params.id,mrps:void 0===a.query.mrps?null:a.query.mrps.split(/[^A-Z0-9]+/i).filter(function(n){return n.length>0})})})}),a.map("/planning/wh/:id",u,function(a){/^-?[0-9]+d$/.test(a.params.id)&&(a.params.id=i.getMoment().subtract(i.getMoment().hours()<6?1:0,"days").startOf("day").add(+a.params.id.replace("d",""),"days").format("YYYY-MM-DD"),n.publish("router.navigate",{url:"/planning/wh/"+a.params.id,replace:!0,trigger:!1}));var t={date:a.params.id,mrps:void 0===a.query.mrps?null:a.query.mrps.split(/[^A-Z0-9]+/i).filter(function(n){return n.length>0}),from:void 0===a.query.from?"06:00":a.query.from,to:void 0===a.query.to?"06:00":a.query.to};["lines","whStatuses","psStatuses"].forEach(function(n){t[n]=void 0===a.query[n]?null:a.query[n].split(",").filter(function(n){return n.length>0})}),e.loadPage(["app/planning/pages/WhPage"].concat(p,r),function(n){return new n(t)})}),a.map("/planning/settings",s,function(n){e.loadPage(["app/planning/pages/PlanningSettingsPage",p[0],r[0]],function(a){return new a({initialTab:n.query.tab})})})});