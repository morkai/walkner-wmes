define(["app/user","../core/Collection","./HourlyPlan"],function(e,t,n){return t.extend({model:n,rqlQuery:function(t){var n,i=e.getDivision();return i&&(n={name:"and",args:[{name:"eq",args:["division",i.id]}]}),t.Query.fromObject({fields:{division:1,date:1,shift:1,locked:1},sort:{date:-1,shift:-1},limit:15,selector:n})}})});