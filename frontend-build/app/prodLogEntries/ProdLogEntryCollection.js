// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","../core/util/matchesOperType","../core/util/matchesProdLine","./ProdLogEntry"],function(e,t,r,n,o){"use strict";return t.extend({model:o,rqlQuery:function(t){return t.Query.fromObject({sort:{createdAt:-1},limit:20,selector:{name:"and",args:[{name:"ge",args:["createdAt",e.getMoment().startOf("day").subtract(1,"week")]}]}})},matches:function(e){return r(this.rqlQuery,e.types)&&n(this.rqlQuery,e.prodLine)}})});