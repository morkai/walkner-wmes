// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./pages/MechOrderListPage","./pages/MechOrderDetailsPage","i18n!app/nls/mechOrders"],function(e,r,a,s,n){var d=a.auth("ORDERS:VIEW");e.map("/mechOrders",d,function(e){r.showPage(new s({rql:e.rql}))}),e.map("/mechOrders/:id",d,function(e){r.showPage(new n({modelId:e.params.id}))})});