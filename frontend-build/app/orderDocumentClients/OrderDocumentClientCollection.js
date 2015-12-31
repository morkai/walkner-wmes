// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./OrderDocumentClient"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:function(e){return e.Query.fromObject({fields:{},sort:{prodLine:1},limit:20})}})});