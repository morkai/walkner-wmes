// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./DowntimeReason"],function(i,n){"use strict";return i.extend({model:n,rqlQuery:"sort(_id)",comparator:"_id",findBySubdivisionType:function(i){return this.filter(function(n){return-1!==n.get("subdivisionTypes").indexOf(i)})},findFirstBreakIdBySubdivisionType:function(i){var n=this.find(function(n){return"break"!==n.get("type")?!1:-1!==n.get("subdivisionTypes").indexOf(i)});return n?n.id:null}})});