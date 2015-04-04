// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../data/prodLines","../core/Collection","../core/util/matchesProdLine","../core/util/matchesEquals","./ProdShift"],function(e,r,t,i,o){"use strict";return r.extend({model:o,rqlQuery:function(e){return e.Query.fromObject({fields:{mrpControllers:1,prodFlow:1,prodLine:1,date:1,shift:1,createdAt:1,creator:1},sort:{createdAt:-1},limit:15,selector:{name:"and",args:[]}})},hasOrMatches:function(e){return this.get(e._id)?!0:t(this.rqlQuery,e.prodLine)&&i(this.rqlQuery,"shift",e.shift)}})});