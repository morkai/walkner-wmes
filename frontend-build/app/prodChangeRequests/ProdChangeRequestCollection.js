define(["underscore","../user","../core/Collection","../orgUnits/util/limitOrgUnits","./ProdChangeRequest"],function(e,r,t,n,s){"use strict";return t.extend({model:s,rowHeight:!1,rqlQuery:function(e){var r=[{name:"eq",args:["status","new"]}];return n(r,{subdivision:!1,divisionType:"prod"}),e.Query.fromObject({limit:20,sort:{prodLine:1,_id:1},selector:{name:"and",args:r}})},isNewStatus:function(){return e.some(this.rqlQuery.selector.args,function(e){return"status"===e.args[0]&&"new"===e.args[1]})}})});