// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./Suggestion"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"exclude(changes)&limit(15)&sort(-date)"})});