// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./PaintShopEvent"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"sort(-time)&limit(0)"},{forOrder:function(e){return new this(null,{rqlQuery:"sort(time)&limit(0)&order="+e})}})});