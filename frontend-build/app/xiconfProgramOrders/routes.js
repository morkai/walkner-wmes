// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/xiconf","i18n!app/nls/xiconfProgramOrders"],function(r,o,n){var e=n.auth("XICONF:VIEW");r.map("/xiconf/programOrders",e,function(r){o.loadPage(["app/xiconfProgramOrders/XiconfProgramOrderCollection","app/xiconfProgramOrders/pages/XiconfProgramOrderListPage"],function(o,n){return new n({collection:new o(null,{rqlQuery:r.rql})})})}),r.map("/xiconf/programOrders/:id",e,function(r){o.loadPage(["app/xiconfProgramOrders/XiconfProgramOrder","app/xiconfProgramOrders/pages/XiconfProgramOrderDetailsPage"],function(o,n){return new n({model:new o({_id:r.params.id})})})})});