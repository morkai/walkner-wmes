define(["../broker","../router","../viewport","../user","../time","../core/util/showDeleteFormPage","../core/util/getRelativeDateRange","../core/util/fixRelativeDateInRql","./HourlyPlanCollection"],function(a,e,n,l,r,o,t,i,u){"use strict";var s="css!app/hourlyPlans/assets/main",p="i18n!app/nls/hourlyPlans",P=l.auth("HOURLY_PLANS:VIEW"),d=l.auth("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE");e.map("/hourlyPlans",P,function(a){n.loadPage(["app/hourlyPlans/pages/HourlyPlanListPage","i18n!app/nls/fte",p],function(e){return new e({collection:new u(null,{rqlQuery:i(a.rql,{property:"date",range:!0,shift:!0})})})})}),e.map("/hourlyPlans;settings",l.auth("PROD_DATA:MANAGE"),function(a){n.loadPage(["app/hourlyPlans/pages/PlanningSettingsPage",p],function(e){return new e({initialTab:a.query.tab})})}),e.map("/hourlyPlans;add",d,function(a){n.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanAddFormPage",p],function(e,n){var l=t(a.query.date);return new n({model:new e({date:l?l.from.setHours(6):null})})})}),e.map("/hourlyPlans/:date/:division",P,function(e){var n=e.params.date,l=new u(null,{rqlQuery:"select(_id)&date="+n+"&division="+e.params.division});function o(){a.publish("router.navigate",{url:"/hourlyPlans?sort(-date)&limit(-1337)&date>="+n+"&date<"+r.getMoment(/^[0-9]+$/.test(n)?+n:n).add(1,"days").valueOf()+"&division="+e.params.division,trigger:!0,replace:!0})}l.on("error",o),l.on("sync",function(){1===l.length?a.publish("router.navigate",{url:"/hourlyPlans/"+l.models[0].id,trigger:!0,replace:!0}):o()}),l.fetch({reset:!0})}),e.map("/hourlyPlans/:id",P,function(a){n.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanDetailsPage","css!app/fte/assets/main.css",s,p],function(e,n){return new n({model:new e({_id:a.params.id})})})}),e.map("/hourlyPlans/:id;edit",d,function(a){n.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanEditFormPage",s,p],function(e,n){return new n({model:new e({_id:a.params.id})})})}),e.map("/hourlyPlans/:id;delete",d,o.bind(null,"app/hourlyPlans/HourlyPlan"))});