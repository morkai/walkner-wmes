define(["../core/Collection","./WhPendingDelivery"],function(e,n){"use strict";function t(e){return Date.parse(e.get("date"))+":"+e.get("set")}return e.extend({model:n,paginate:!1,initialize:function(){var e=this;e.cached={},e.on("reset",function(){e.forEach(function(n){e.cached[t(n)]=!0})}),e.on("add",function(n){e.cached[t(n)]=!0}),e.on("remove",function(n){delete e.cached[t(n)]})},isPendingSetCart:function(e){return!0===this.cached[t(e)]}})});