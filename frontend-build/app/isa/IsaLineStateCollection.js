// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./IsaLineState"],function(e,t){"use strict";return e.extend({model:t,parse:function(e){return e.collection.map(t.parse)},sort:function(e,t){return e.attributes.requestedAt-t.attributes.requestedAt}})});