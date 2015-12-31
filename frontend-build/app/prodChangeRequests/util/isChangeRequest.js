// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user"],function(A){"use strict";return function(){return A.isAllowedTo("PROD_DATA:CHANGES:REQUEST")&&!A.isAllowedTo("PROD_DATA:MANAGE")}});