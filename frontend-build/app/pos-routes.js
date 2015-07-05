// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["./broker","./router","./events/routes","./purchaseOrders/routes","./users/routes","./vendors/routes","./vendorNc12s/routes"],function(r,e){"use strict";e.map("/",function(){r.publish("router.navigate",{url:"/purchaseOrders",trigger:!0,replace:!0})})});