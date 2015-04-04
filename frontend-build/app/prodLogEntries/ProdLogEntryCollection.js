// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../data/prodLines","../core/Collection","../core/util/matchesOperType","../core/util/matchesProdLine","./ProdLogEntry"],function(e,r,t,n,o,i){"use strict";return t.extend({model:i,rqlQuery:function(e){return e.Query.fromObject({fields:{},sort:{createdAt:-1},limit:20,selector:{name:"and",args:[]}})},matches:function(e){return n(this.rqlQuery,e.types)&&o(this.rqlQuery,e.prodLine)}})});