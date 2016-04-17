// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./ProdDowntimeAlert"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(name)&sort(name)&limit(20)"})});