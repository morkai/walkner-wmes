// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./D8Entry"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"exclude(changes)&limit(20)&sort(-d8OpenDate)"})});