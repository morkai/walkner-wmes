define(["app/user"],function(A){"use strict";return function(){return A.isAllowedTo("PROD_DATA:CHANGES:REQUEST")&&!A.isAllowedTo("PROD_DATA:MANAGE")}});