// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./XData"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"exclude(data)&sort(-createdAt)&limit(15)"})});