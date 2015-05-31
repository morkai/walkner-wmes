// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./KaizenCategory"],function(n,t){"use strict";return n.extend({model:t,comparator:"position",inNearMiss:function(){return this.filter(function(n){return n.get("inNearMiss")})},inSuggestion:function(){return this.filter(function(n){return n.get("inSuggestion")})}})});