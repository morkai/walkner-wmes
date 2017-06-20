// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/View","../views/QzPrintHelpView"],function(e,i,n){"use strict";return i.extend({layoutName:"page",breadcrumbs:[e.bound("purchaseOrders","qzPrint:bc:help")],initialize:function(){this.view=new n}})});