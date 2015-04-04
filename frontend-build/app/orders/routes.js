// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./pages/OrderListPage","./pages/OrderDetailsPage","i18n!app/nls/orders"],function(e,r,a,s,i){"use strict";var n=a.auth("ORDERS:VIEW");e.map("/orders",n,function(e){r.showPage(new s({rql:e.rql}))}),e.map("/orders/:id",function(e){r.showPage(new i({modelId:e.params.id}))})});