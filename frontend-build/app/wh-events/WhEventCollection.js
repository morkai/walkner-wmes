define(["app/time","app/core/Collection","./WhEvent"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:function(t){return t.Query.fromObject({sort:{time:-1},limit:20,selector:{name:"and",args:[{name:"ge",args:["time",e.getMoment().startOf("day").subtract(7,"days").hours(6).valueOf()]}]}})}})});