define(["../time","../core/Collection","./Test"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:function(t){return t.Query.fromObject({fields:{startedAt:1,finishedAt:1,"program.name":1,result:1,orderNo:1,serialNo:1,prodLine:1},sort:{startedAt:-1},limit:-1337,selector:{name:"and",args:[{name:"ge",args:["startedAt",e.getMoment().startOf("week").subtract(2,"weeks")]}]}})}})});