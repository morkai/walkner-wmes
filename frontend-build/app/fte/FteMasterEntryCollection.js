define(["app/user","../core/Collection","./FteMasterEntry"],function(e,t,r){return t.extend({model:r,rqlQuery:function(t){var r;return"unspecified"!==e.data.orgUnitType&&(r={name:"and",args:[{name:"eq",args:[e.data.orgUnitType,e.data.orgUnitId]}]}),t.Query.fromObject({fields:{subdivision:1,date:1,shift:1,locked:1},sort:{date:-1},limit:15,selector:r})}})});