define(["../core/Collection","./OrderGroup"],function(e,n){"use strict";return e.extend({model:n,comparator:function(e,n){return e.get("name").localeCompare(n.get("name"),void 0,{numeric:!0,ignorePunctuation:!0})}})});