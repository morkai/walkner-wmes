// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../core/Collection","./PlanChange"],function(e,r,n){"use strict";return r.extend({model:n,rqlQuery:"sort(date)",getDate:function(r){var n=e.find(this.rqlQuery.selector.args,function(e){return"eq"===e.name&&"plan"===e.args[0]});return n?time.utc.format(n.args[1],r||"YYYY-MM-DD"):null}})});