define(["app/time","app/user","./FteLeaderEntryCollection","./FteWhEntry"],function(e,t,r,a){"use strict";return r.extend({TYPE:"wh",model:a,rqlQuery:function(r){var n=t.getDivision(),i={name:"and",args:[{name:"ge",args:["date",e.getMoment().subtract(7,"days").valueOf()]}]};return n&&n.id===a.WH_DIVISION&&i.push({name:"eq",args:[t.data.orgUnitType,t.data.orgUnitId]}),r.Query.fromObject({fields:{subdivision:1,date:1,shift:1,createdAt:1,creator:1,"tasks.functions.id":1},sort:{date:-1},limit:20,selector:i})}})});