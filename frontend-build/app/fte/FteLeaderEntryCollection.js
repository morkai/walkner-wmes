define(["app/time","app/user","../core/Collection","./FteLeaderEntry","./FteWhEntry"],function(e,t,r,a,n){"use strict";return r.extend({TYPE:"leader",model:a,rqlQuery:function(r){var a=t.getDivision(),i={name:"and",args:[{name:"ge",args:["date",e.getMoment().subtract(7,"days").valueOf()]}]};return a&&"prod"!==a.get("type")&&a.id!==n.WH_DIVISION&&i.push({name:"eq",args:[t.data.orgUnitType,t.data.orgUnitId]}),r.Query.fromObject({fields:{subdivision:1,date:1,shift:1,createdAt:1,creator:1,"tasks.functions.id":1},sort:{date:-1},limit:20,selector:i})}})});