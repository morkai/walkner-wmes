// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./User"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"&sort(+lastName,+firstName)&limit(20)"})});