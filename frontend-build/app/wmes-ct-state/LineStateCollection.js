define(["../core/Collection","./LineState"],function(e,n){"use strict";return e.extend({model:n,paginate:!1,comparator:function(e,n){return e.id.localeCompare(n.id,void 0,{numeric:!0,ignorePunctuation:!0})},parse:function(e){return e},update:function(e){var n=this.get(e.line);n&&n.update(e)}})});