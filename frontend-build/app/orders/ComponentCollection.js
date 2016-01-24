// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./Component"],function(n,e){"use strict";return n.extend({model:e,parse:function(n){return n.collection&&n.collection.forEach(function(n,e){n.index=e}),n}})});