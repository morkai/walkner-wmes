// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/View","../views/QzPrintHelpView"],function(e,i,n){"use strict";return i.extend({layoutName:"page",breadcrumbs:[e.bound("purchaseOrders","qzPrint:bc:help")],initialize:function(){this.view=new n}})});