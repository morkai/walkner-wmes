// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./PlanOrder"],function(n,e){"use strict";return n.extend({model:e,initialize:function(n,e){this.plan=e&&e.plan},getGroupedByMrp:function(){var n={};return this.forEach(function(e){var t=e.get("mrp");n[t]||(n[t]=[]),n[t].push(e)}),n}})});