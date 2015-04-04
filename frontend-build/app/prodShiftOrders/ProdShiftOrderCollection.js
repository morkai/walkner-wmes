// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../data/prodLines","../core/Collection","../core/util/matchesEquals","../core/util/matchesProdLine","./ProdShiftOrder"],function(r,e,t,o,i){"use strict";return e.extend({model:i,rqlQuery:function(r){return r.Query.fromObject({fields:{creator:0,losses:0},sort:{startedAt:-1},limit:15,selector:{name:"and",args:[]}})},hasOrMatches:function(r){return this.get(r._id)?!0:o(this.rqlQuery,r.prodLine)&&t(this.rqlQuery,"orderId",r.orderId)&&t(this.rqlQuery,"operationNo",r.operationNo)&&t(this.rqlQuery,"shift",r.shift)}})});