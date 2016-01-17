// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./KaizenOrder"],function(e,r,a,n,i,p){"use strict";var d="i18n!app/nls/kaizenOrders",o=n.auth();r.map("/kaizenReport",o,function(e){a.loadPage(["app/kaizenOrders/KaizenOrderReport","app/kaizenOrders/pages/KaizenOrderReportPage","i18n!app/nls/reports",d],function(r,a){return new a({model:r.fromQuery(e.query)})})}),r.map("/kaizenSummaryReport",o,function(e){a.loadPage(["app/kaizenOrders/KaizenOrderSummaryReport","app/kaizenOrders/pages/KaizenOrderSummaryReportPage","i18n!app/nls/reports","i18n!app/nls/suggestions",d],function(r,a){return new a({model:r.fromQuery(e.query)})})}),r.map("/kaizenHelp",function(){a.loadPage(["app/core/View","app/kaizenOrders/templates/help",d],function(e,r){return new e({layoutName:"page",template:r})})}),r.map("/kaizenOrders",o,function(e){a.loadPage(["app/kaizenOrders/KaizenOrderCollection","app/kaizenOrders/pages/KaizenOrderListPage",d],function(r,a){return new a({collection:new r(null,{rqlQuery:e.rql})})})}),r.map("/kaizenOrders/:id",o,function(e){a.loadPage(["app/kaizenOrders/pages/KaizenOrderDetailsPage","app/kaizenOrders/views/KaizenOrderThankYouView",d],function(r,n){var i=new r({model:new p({_id:e.params.id})});return"you"===e.query.thank&&i.once("afterRender",function(){i.broker.publish("router.navigate",{url:"/kaizenOrders/"+i.model.id,trigger:!1,replace:!0}),a.showDialog(new n)}),i})}),r.map("/kaizenOrders;add",o,function(){a.loadPage(["app/kaizenOrders/pages/KaizenOrderAddFormPage",d],function(e){return new e({model:new p})})}),r.map("/kaizenOrders/:id;edit",o,function(e){a.loadPage(["app/kaizenOrders/pages/KaizenOrderEditFormPage",d],function(r){return new r({model:new p({_id:e.params.id})})})}),r.map("/kaizenOrders/:id;delete",o,e.partial(i,p,e,e,{baseBreadcrumb:!0}))});