// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../router","../viewport","../user","../time","../core/util/showDeleteFormPage","./HourlyPlan","./HourlyPlanCollection"],function(a,n,l,e,r,o,i,u){"use strict";var t="i18n!app/nls/hourlyPlans",s=e.auth("HOURLY_PLANS:VIEW"),p=e.auth("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE");n.map("/hourlyPlans",s,function(a){l.loadPage(["app/hourlyPlans/HourlyPlanCollection","app/hourlyPlans/pages/HourlyPlanListPage","i18n!app/nls/fte",t],function(n,l){return new l({collection:new n(null,{rqlQuery:a.rql})})})}),n.map("/hourlyPlans;heff",p,function(a){l.loadPage(["app/hourlyPlans/HeffLineStateCollection","app/hourlyPlans/pages/HeffLineStatePage",t],function(n,l){return new l({collection:new n(null,{rqlQuery:a.rql})})})}),n.map("/hourlyPlans;planning",p,function(a){l.loadPage(["app/hourlyPlans/DailyMrpPlanCollection","app/hourlyPlans/pages/PlanningPage",t],function(n,l){return new l({model:new n(null,{rqlQuery:a.rql,paginate:!1})})})}),n.map("/hourlyPlans;add",p,function(){l.loadPage(["app/hourlyPlans/pages/HourlyPlanAddFormPage",t],function(a){return new a})}),n.map("/hourlyPlans/:date/:division",s,function(n){function l(){a.publish("router.navigate",{url:"/hourlyPlans?sort(-date)&limit(20)&date>="+n.params.date+"&date<"+r.getMoment(+n.params.date).add(1,"days").valueOf()+"&division="+n.params.division,trigger:!0,replace:!0})}var e=new u(null,{rqlQuery:"select(_id)&date="+n.params.date+"&division="+n.params.division});e.on("error",l),e.on("sync",function(){1===e.length?a.publish("router.navigate",{url:"/hourlyPlans/"+e.models[0].id,trigger:!0,replace:!0}):l()}),e.fetch({reset:!0})}),n.map("/hourlyPlans/:id",s,function(a){l.loadPage(["app/hourlyPlans/pages/HourlyPlanDetailsPage",t],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;edit",p,function(a){l.loadPage(["app/hourlyPlans/pages/HourlyPlanEditFormPage",t],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;print",s,function(a){l.loadPage(["app/hourlyPlans/pages/HourlyPlanDetailsPrintablePage",t],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;delete",p,o.bind(null,i))});