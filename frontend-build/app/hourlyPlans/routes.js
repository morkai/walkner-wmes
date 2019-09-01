define(["../broker","../router","../viewport","../user","../time","../core/util/showDeleteFormPage","../core/util/getRelativeDateRange","../core/util/fixRelativeDateInRql","./HourlyPlanCollection"],function(a,n,e,l,r,o,t,i,u){"use strict";var s="css!app/hourlyPlans/assets/main",p="i18n!app/nls/hourlyPlans",P=l.auth("HOURLY_PLANS:VIEW"),d=l.auth("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE");n.map("/hourlyPlans",P,function(a){e.loadPage(["app/hourlyPlans/pages/HourlyPlanListPage","i18n!app/nls/fte",p],function(n){return new n({collection:new u(null,{rqlQuery:i(a.rql,{property:"date",range:!0,shift:!0})})})})}),n.map("/hourlyPlans;settings",l.auth("PROD_DATA:MANAGE"),function(a){e.loadPage(["app/hourlyPlans/pages/PlanningSettingsPage",p],function(n){return new n({initialTab:a.query.tab})})}),n.map("/hourlyPlans;add",d,function(a){e.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanAddFormPage",p],function(n,e){var l=t(a.query.date);return new e({model:new n({date:l?l.from.setHours(6):null})})})}),n.map("/hourlyPlans/:date/:division",P,function(n){var e=n.params.date,l=new u(null,{rqlQuery:"select(_id)&date="+e+"&division="+n.params.division});function o(){a.publish("router.navigate",{url:"/hourlyPlans?sort(-date)&limit(-1337)&date>="+e+"&date<"+r.getMoment(/^[0-9]+$/.test(e)?+e:e).add(1,"days").valueOf()+"&division="+n.params.division,trigger:!0,replace:!0})}l.on("error",o),l.on("sync",function(){1===l.length?a.publish("router.navigate",{url:"/hourlyPlans/"+l.models[0].id,trigger:!0,replace:!0}):o()}),l.fetch({reset:!0})}),n.map("/hourlyPlans/:id",P,function(a){e.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanDetailsPage",s,p],function(n,e){return new e({model:new n({_id:a.params.id})})})}),n.map("/hourlyPlans/:id;edit",d,function(a){e.loadPage(["app/hourlyPlans/HourlyPlan","app/hourlyPlans/pages/HourlyPlanEditFormPage",s,p],function(n,e){return new e({model:new n({_id:a.params.id})})})}),n.map("/hourlyPlans/:id;delete",d,o.bind(null,"app/hourlyPlans/HourlyPlan"))});