define(["../time","../user","../core/Collection","../core/util/matchesOperType","../core/util/matchesProdLine","../orgUnits/util/limitOrgUnits","./ProdLogEntry"],function(e,t,r,i,n,o,s){"use strict";return r.extend({model:s,rowHeight:!1,rqlQuery:function(t){var r=[{name:"ge",args:["createdAt",e.getMoment().startOf("day").subtract(1,"week").valueOf()]}];return o(r,{divisionType:"prod",subdivisionType:"assembly"}),t.Query.fromObject({sort:{createdAt:-1},limit:-1,selector:{name:"and",args:r}})},matches:function(e){return i(this.rqlQuery,e.types)&&n(this.rqlQuery,e.prodLine)}})});