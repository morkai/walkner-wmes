// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./XiconfProgram"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(name,type,prodLines,updatedAt,steps)&limit(20)&sort(name)"})});