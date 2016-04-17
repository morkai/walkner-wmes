// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./MechOrder"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:function(e){return e.Query.fromObject({fields:{name:1,mrp:1,materialNorm:1},limit:20,sort:{_id:1}})}})});