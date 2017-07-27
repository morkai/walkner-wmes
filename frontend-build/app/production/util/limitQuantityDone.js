// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";return function(t,n,i){t.ajax({url:"/prodSerialNumbers?limit(1)&prodShiftOrder="+i}).done(function(i){i&&i.totalCount&&t.$id(n).attr("min",i.totalCount.toString())})}});