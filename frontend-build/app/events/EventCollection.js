define(["moment","../core/Collection","./Event"],function(e,t,r){return t.extend({model:r,rqlQuery:function(t){var r=e().hours(0).minutes(0).seconds(0).milliseconds(0).subtract("days",7).valueOf();return t.Query.fromObject({fields:{type:1,severity:1,user:1,time:1,data:1},sort:{time:-1},limit:25,selector:{name:"and",args:[{name:"ge",args:["time",r]}]}})}})});