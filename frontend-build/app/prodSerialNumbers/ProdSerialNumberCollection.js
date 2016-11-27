// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./ProdSerialNumber"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"sort(-scannedAt)&limit(20)"})});