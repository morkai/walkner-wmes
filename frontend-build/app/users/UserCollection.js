// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./User"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(personellId,lastName,firstName,login,company,orgUnitType,orgUnitId,prodFunction)&sort(+lastName,+firstName)&limit(20)"})});