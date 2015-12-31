// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/xiconf/orders",clientUrlRoot:"#xiconf/orders",privilegePrefix:"XICONF",nlsDomain:"xiconfOrders",getStatusClassName:function(){switch(this.get("status")){case-1:return"danger";case 1:return"warning";default:return"success"}}})});