// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../broker","../router","../viewport","../user","../prodChangeRequests/util/createShowDeleteFormPage","./ProdDowntime","./ProdDowntimeCollection","./pages/ProdDowntimeListPage","./pages/ProdDowntimeDetailsPage","./pages/ProdDowntimeEditFormPage","i18n!app/nls/prodDowntimes"],function(e,o,r,t,n,a,i,s,d,m){"use strict";var p=t.auth("LOCAL","PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW"),w=t.auth("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST");o.map("/prodDowntimes",p,function(e){r.showPage(new s({collection:new i(null,{rqlQuery:e.rql})}))}),o.map("/prodDowntimes;alerts",function(){var o=new i;o.rqlQuery.selector.args.forEach(function(e){"in"===e.name&&"status"===e.args[0]&&(e.name="eq",e.args=["alerts.active",!0])}),e.publish("router.navigate",{url:"#prodDowntimes?"+o.rqlQuery,trigger:!0,replace:!0})}),o.map("/prodDowntimes/:id",function(e){r.showPage(new d({model:new a({_id:e.params.id}),corroborate:"1"===e.query.corroborate}))}),o.map("/prodDowntimes/:id;edit",w,function(e){r.showPage(new m({model:new a({_id:e.params.id})}))}),o.map("/prodDowntimes/:id;delete",w,n(a)),o.map("/prodDowntimes;settings",w,function(e){r.loadPage("app/prodDowntimes/pages/ProdDowntimeSettingsPage",function(o){return new o({initialTab:e.query.tab})})})});