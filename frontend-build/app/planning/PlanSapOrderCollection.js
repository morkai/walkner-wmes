// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./PlanSapOrder"],function(n,i){"use strict";return n.extend({model:i,initialize:function(n,i){this.plan=i&&i.plan,this.mrp=i&&i.mrp},url:function(){var n="/planning/sapOrders/"+this.plan.id;return this.mrp&&(n+="?mrp="+this.mrp),n}})});