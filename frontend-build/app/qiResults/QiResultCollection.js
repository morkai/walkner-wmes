define(["../time","../core/Collection","./QiResult"],function(e,t,n){"use strict";return t.extend({model:n,theadHeight:2,rowHeight:2,rqlQuery:function(t){return t.Query.fromObject({fields:{},sort:{inspectedAt:-1},limit:-1337,selector:{name:"and",args:[{name:"ge",args:["inspectedAt",e.getMoment().startOf("day").subtract(14,"days").valueOf()]}]}})},hasAnyNokResult:function(){return this.some(function(e){return!e.get("ok")})}})});