define(["app/user","../core/Collection","./FteLeaderEntry"],function(e,t,i){return t.extend({model:i,rqlQuery:function(t){var i;return"unspecified"!==e.data.orgUnitType&&(i={name:"and",args:[{name:"eq",args:[e.data.orgUnitType,e.data.orgUnitId]}]}),t.Query.fromObject({fields:{subdivision:1,date:1,shift:1,locked:1},sort:{date:-1},limit:15,selector:i})}})});