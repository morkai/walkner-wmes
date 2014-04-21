// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./pages/EmptyOrderListPage","./pages/EmptyOrderPrintableListPage","i18n!app/nls/emptyOrders"],function(e,r,t,n,p){var a=t.auth("ORDERS:VIEW");e.map("/emptyOrders",a,function(e){r.showPage(new n({rql:e.rql}))}),e.map("/emptyOrders;print",a,function(e){r.showPage(new p({rql:e.rql}))})});