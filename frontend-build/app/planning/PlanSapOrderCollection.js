// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./PlanSapOrder"],function(n,i){"use strict";return n.extend({model:i,initialize:function(n,i){this.plan=i&&i.plan},url:function(){return"/planning/sapOrders/"+this.plan.id}})});