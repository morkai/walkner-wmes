// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./KaizenCategory"],function(n,t){"use strict";return n.extend({model:t,comparator:"position",inNearMiss:function(){return this.filter(function(n){return n.get("inNearMiss")})},inSuggestion:function(){return this.filter(function(n){return n.get("inSuggestion")})}})});