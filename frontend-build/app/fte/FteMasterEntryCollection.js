define(["app/time","app/user","../core/Collection","./FteMasterEntry"],function(e,t,r,a){"use strict";return r.extend({TYPE:"master",model:a,rqlQuery:function(r){var a=t.getDivision(),n={name:"and",args:[{name:"ge",args:["date",e.getMoment().subtract(7,"days").valueOf()]}]};return a&&"prod"===a.get("type")&&n.args.push({name:"eq",args:[t.data.orgUnitType,t.data.orgUnitId]}),r.Query.fromObject({fields:{subdivision:1,date:1,shift:1,createdAt:1,creator:1},sort:{date:-1},limit:20,selector:n})}})});