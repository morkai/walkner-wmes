// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./QiResult"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"limit(20)&sort(-inspectedAt,-rid)",hasAnyNokResult:function(){return this.some(function(e){return!e.get("ok")})}})});