// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/View","app/changelog/templates/list"],function(e,n,t){"use strict";return n.extend({layoutName:"page",template:t,breadcrumbs:function(){return[e.bound("changelog","breadcrumbs:browse")]},initialize:function(){},afterRender:function(){}})});