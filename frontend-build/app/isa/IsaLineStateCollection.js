// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./IsaLineState"],function(t,e){"use strict";return t.extend({model:e,parse:function(t){return t.collection.map(e.parse)},comparator:function(t,e){return null===t.attributes.requestedAt?1:null===e.attributes.requestedAt?-1:t.attributes.requestedAt-e.attributes.requestedAt}})});