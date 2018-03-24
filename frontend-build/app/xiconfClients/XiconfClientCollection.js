// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./XiconfClient"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:function(e){return e.Query.fromObject({fields:{},sort:{prodLine:1},limit:100,selector:{name:"and",args:[{name:"populate",args:["license",["features"]]}]}})},comparator:function(e,r){if(e=e.get("prodLine")||"",r=r.get("prodLine")||"",e===r)return 0;var t=e.match(/^(.*?)([0-9]+)?$/),n=r.match(/^(.*?)([0-9]+)?$/);return t[1]!==n[1]?t[1].localeCompare(n[1]):+(t[2]||0)<+(n[2]||0)?-1:1},getUsedLicenseIds:function(){var e={};return this.forEach(function(r){var t=r.get("license");t&&t._id?e[t._id]=!0:"string"==typeof t&&(e[t]=!0)}),e}})});