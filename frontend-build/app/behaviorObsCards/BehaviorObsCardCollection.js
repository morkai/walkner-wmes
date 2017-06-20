// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./BehaviorObsCard"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"limit(20)&sort(-date)"})});