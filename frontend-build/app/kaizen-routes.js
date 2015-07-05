// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["./broker","./router","./companies/routes","./divisions/routes","./events/routes","./prodFunctions/routes","./subdivisions/routes","./users/routes","./kaizenOrders/routes","./kaizenSections/routes","./kaizenAreas/routes","./kaizenCategories/routes","./kaizenCauses/routes","./kaizenRisks/routes"],function(e,s){"use strict";s.map("/",function(){e.publish("router.navigate",{url:"/kaizenOrders?observers.user.id=mine&sort(-createdAt)&limit(15)",trigger:!0,replace:!0})})});