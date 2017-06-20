// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./Document"],function(e,n){"use strict";return e.extend({model:n,parse:function(e){return e.collection&&e.collection.forEach(function(e,n){e.index=n}),e}})});