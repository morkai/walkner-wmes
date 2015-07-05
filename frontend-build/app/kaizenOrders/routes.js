// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./KaizenOrderCollection","./KaizenOrder","./KaizenOrderReport","./pages/KaizenOrderListPage","./pages/KaizenOrderDetailsPage","./pages/KaizenOrderAddFormPage","./pages/KaizenOrderEditFormPage","./pages/KaizenOrderReportPage","i18n!app/nls/reports","i18n!app/nls/kaizenOrders"],function(e,r,a,n,i,d,o,s,t,p,l,m,u){"use strict";var w=n.auth();r.map("/kaizenReport",w,function(e){a.showPage(new u({model:new s({from:+e.query.from||void 0,to:+e.query.to||void 0,interval:e.query.interval})}))}),r.map("/kaizenOrders",w,function(e){a.showPage(new t({collection:new d(null,{rqlQuery:e.rql})}))}),r.map("/kaizenOrders/:id",w,function(e){a.showPage(new p({model:new o({_id:e.params.id})}))}),r.map("/kaizenOrders;add",w,function(){a.showPage(new l({model:new o}))}),r.map("/kaizenOrders/:id;edit",w,function(e){a.showPage(new m({model:new o({_id:e.params.id})}))}),r.map("/kaizenOrders/:id;delete",w,e.partial(i,o,e,e,{baseBreadcrumb:!0}))});