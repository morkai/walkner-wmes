define(["../core/Collection","./Entry"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"exclude(changes)&limit(-1337)&sort(-createdAt)"})});