// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./PscsResult"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"sort(-startedAt)&limit(15)"})});