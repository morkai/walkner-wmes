define(["underscore","../user","../data/prodLines","../core/Collection","../core/util/matchesEquals","../core/util/matchesProdLine","./ProdShiftOrder"],function(r,e,t,o,i,s,n){return o.extend({model:n,rqlQuery:function(r){return r.Query.fromObject({fields:{creator:0,losses:0},sort:{startedAt:-1},limit:15,selector:{name:"and",args:[]}})},hasOrMatches:function(r){return this.get(r._id)?!0:s(this.rqlQuery,r.prodLine)&&i(this.rqlQuery,"orderId",r.orderId)&&i(this.rqlQuery,"operationNo",r.operationNo)&&i(this.rqlQuery,"shift",r.shift)}})});