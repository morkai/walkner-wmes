define(["../core/Collection","./ProdDowntimeAlert"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(name)&sort(name)&limit(-1337)"})});