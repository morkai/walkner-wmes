// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../router","../viewport","../user","../time","../core/util/showDeleteFormPage","./HourlyPlan","./HourlyPlanCollection"],function(a,n,e,l,r,o,i,t){"use strict";var u="i18n!app/nls/hourlyPlans",s=l.auth("HOURLY_PLANS:VIEW"),d=l.auth("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE");n.map("/hourlyPlans",s,function(a){e.loadPage(["app/hourlyPlans/pages/HourlyPlanListPage","i18n!app/nls/fte",u],function(n){return new n({rql:a.rql})})}),n.map("/hourlyPlans;add",d,function(){e.loadPage(["app/hourlyPlans/pages/HourlyPlanAddFormPage",u],function(a){return new a})}),n.map("/hourlyPlans/:date/:division",s,function(n){function e(){a.publish("router.navigate",{url:"/hourlyPlans?sort(-date)&limit(20)&date>="+n.params.date+"&date<"+r.getMoment(+n.params.date).add(1,"days").valueOf()+"&division="+n.params.division,trigger:!0,replace:!0})}var l=new t(null,{rqlQuery:"select(_id)&date="+n.params.date+"&division="+n.params.division});l.on("error",e),l.on("sync",function(){1===l.length?a.publish("router.navigate",{url:"/hourlyPlans/"+l.models[0].id,trigger:!0,replace:!0}):e()}),l.fetch({reset:!0})}),n.map("/hourlyPlans/:id",s,function(a){e.loadPage(["app/hourlyPlans/pages/HourlyPlanDetailsPage",u],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;edit",d,function(a){e.loadPage(["app/hourlyPlans/pages/HourlyPlanEditFormPage",u],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;print",s,function(a){e.loadPage(["app/hourlyPlans/pages/HourlyPlanDetailsPrintablePage",u],function(n){return new n({modelId:a.params.id})})}),n.map("/hourlyPlans/:id;delete",d,o.bind(null,i))});