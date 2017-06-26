// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../data/prodLines","../core/Collection","../core/util/matchesProdLine","../core/util/matchesEquals","./ProdShift"],function(e,t,r,i,s,n){"use strict";return r.extend({model:n,rqlQuery:function(t){return t.Query.fromObject({fields:{},sort:{date:-1},limit:20,selector:{name:"and",args:[{name:"ge",args:["date",e.getMoment().subtract(1,"months").startOf("day").valueOf()]}]}})},hasOrMatches:function(e){return!!this.get(e._id)||i(this.rqlQuery,e.prodLine)&&s(this.rqlQuery,"shift",e.shift)}})});