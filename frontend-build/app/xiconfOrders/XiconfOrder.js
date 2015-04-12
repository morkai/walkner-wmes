// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/xiconf/orders",clientUrlRoot:"#xiconf/orders",privilegePrefix:"XICONF",nlsDomain:"xiconfOrders",getStatusClassName:function(){switch(this.get("status")){case-1:return"danger";case 1:return"warning";default:return"success"}}})});