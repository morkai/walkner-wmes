define(["../core/Collection","./Program"],function(e,n){"use strict";return e.extend({model:n,rqlQuery:"select(name,kind)&sort(name)&limit(-1337)"})});