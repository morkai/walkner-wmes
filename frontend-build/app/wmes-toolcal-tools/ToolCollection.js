define(["../core/Collection","./Tool"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"exclude(changes)&limit(20)&sort(nextDate)&status=in-use"})});