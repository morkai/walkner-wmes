define(["../time","../core/Collection","../core/util/matchesDate","../core/util/matchesEquals","./ProdSerialNumber"],function(e,r,t,n,o){"use strict";return r.extend({model:o,rowHeight:!1,rqlQuery:function(r){return r.Query.fromObject({fields:{},sort:{scannedAt:-1},limit:-1337,selector:{name:"and",args:[{name:"ge",args:["scannedAt",e.getMoment().subtract(1,"week").startOf("day").valueOf()]}]}})},matches:function(e){var r=this.rqlQuery;return t(r,"scannedAt",e.scannedAt)&&n(r,"serialNo",e.serialNo)&&n(r,"orderNo",e.orderNo)&&n(r,"prodLine",e.prodLine)}})});