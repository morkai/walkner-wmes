// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./pages/OrderListPage","./pages/OrderDetailsPage","i18n!app/nls/orders"],function(e,r,a,n,s){"use strict";var t=a.auth("ORDERS:VIEW"),i=a.auth("ORDERS:MANAGE");e.map("/orders",t,function(e){r.showPage(new n({rql:e.rql}))}),e.map("/orders/:id",function(e){r.showPage(new s({modelId:e.params.id}))}),e.map("/orders;settings",i,function(e){r.loadPage("app/orders/pages/OrderSettingsPage",function(r){return new r({initialTab:e.query.tab})})})});