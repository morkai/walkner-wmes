define(["../broker","../router","../viewport","../user","../time","./Plan","./PlanSettings","./PlanSettingsCollection","./PlanChangesCollection","./pages/PlanPage","./pages/PlanListPage","./pages/PlanSettingsPage","./pages/PlanChangesPage","./pages/WhPage","i18n!app/nls/planning"],function(n,a,e,t,r,i,s,l,u,p,g,o,d,m){"use strict";var c=t.auth("PLANNING:VIEW"),f=t.auth("PLANNING:MANAGE"),h=t.auth("WH:VIEW");a.map("/planning/settings/:id",f,function(n){e.showPage(new o({model:new s({_id:n.params.id}),back:"1"===n.query.back}))}),a.map("/planning/changes",c,function(n){e.showPage(new d({collection:new u(null,{rqlQuery:n.rql,paginate:!1})}))}),a.map("/planning/plans",c,function(n){e.showPage(new g({collection:new l(null,{rqlQuery:n.rql,paginate:!1})}))}),a.map("/planning/plans/:id",c,function(a){/^-?[0-9]+d$/.test(a.params.id)&&(a.params.id=r.getMoment().subtract(r.getMoment().hours()<6?1:0,"days").startOf("day").add(+a.params.id.replace("d",""),"days").format("YYYY-MM-DD"),n.publish("router.navigate",{url:"/planning/plans/"+a.params.id,replace:!0,trigger:!1})),e.showPage(new p({date:a.params.id,mrps:void 0===a.query.mrps?null:a.query.mrps.split(/[^A-Z0-9]+/i).filter(function(n){return n.length>0})}))}),a.map("/planning/wh/:id",h,function(a){/^-?[0-9]+d$/.test(a.params.id)&&(a.params.id=r.getMoment().subtract(r.getMoment().hours()<6?1:0,"days").startOf("day").add(+a.params.id.replace("d",""),"days").format("YYYY-MM-DD"),n.publish("router.navigate",{url:"/planning/wh/"+a.params.id,replace:!0,trigger:!1})),e.showPage(new m({date:a.params.id,mrps:void 0===a.query.mrps?null:a.query.mrps.split(/[^A-Z0-9]+/i).filter(function(n){return n.length>0}),lines:void 0===a.query.lines?null:a.query.lines.split(",").filter(function(n){return n.length>0}),whStatuses:void 0===a.query.whStatuses?null:a.query.whStatuses.split(",").filter(function(n){return n.length>0}),from:void 0===a.query.from?"06:00":a.query.from,to:void 0===a.query.to?"06:00":a.query.to}))}),a.map("/planning/settings",f,function(n){e.loadPage("app/planning/pages/PlanningSettingsPage",function(a){return new a({initialTab:n.query.tab})})}),e.once("afterRender",function n(){var a=e.currentLayout.getView(".navbar");if(a){var t=r.getMoment(),i=t.hours(),s=t.day();a.$(".planning-navbar-2d").toggleClass("disabled",(1===s||2===s||3===s)&&i<17)}setTimeout(n,6e4)})});