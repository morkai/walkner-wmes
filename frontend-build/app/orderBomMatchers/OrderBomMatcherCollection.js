define(["../core/Collection","./OrderBomMatcher"],function(e,r){"use strict";return e.extend({model:r,rqlQuery:"sort(description)&limit(-1)"})});