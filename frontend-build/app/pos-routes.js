// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["./broker","./router","./events/routes","./purchaseOrders/routes","./users/routes","./vendors/routes","./vendorNc12s/routes"],function(r,e){"use strict";e.map("/",function(){r.publish("router.navigate",{url:"/purchaseOrders",trigger:!0,replace:!0})})});