define(["underscore","../time","../core/Collection","./IcpoResult"],function(s,r,e,t){"use strict";return e.extend({model:t,rqlQuery:function(s){var e=r.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(7,"days").valueOf();return s.Query.fromObject({fields:{serviceTag:1,driver:1,gprs:1,led:1,startedAt:1,finishedAt:1,duration:1,result:1,srcId:1},sort:{startedAt:-1},limit:20,selector:{name:"and",args:[{name:"ge",args:["startedAt",e]}]}})},initialize:function(){this.srcIds=null},parse:function(r){if(Array.isArray(r.srcIds)){var t=null===this.srcIds,i=!s.isEqual(r.srcIds,this.srcIds);this.srcIds=r.srcIds,!t&&i&&this.trigger("change:srcIds")}return e.prototype.parse.call(this,r)}})});