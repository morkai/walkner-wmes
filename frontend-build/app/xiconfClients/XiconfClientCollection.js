// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./XiconfClient"],function(e,n){"use strict";return e.extend({model:n,rqlQuery:function(e){return e.Query.fromObject({fields:{},sort:{prodLine:1},limit:50,selector:{name:"and",args:[{name:"populate",args:["license",["features"]]}]}})},getUsedLicenseIds:function(){var e={};return this.forEach(function(n){var t=n.get("license");t&&t._id?e[t._id]=!0:"string"==typeof t&&(e[t]=!0)}),e}})});