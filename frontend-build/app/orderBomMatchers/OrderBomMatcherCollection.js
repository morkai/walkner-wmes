// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./OrderBomMatcher"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"sort(description)&limit(20)"})});