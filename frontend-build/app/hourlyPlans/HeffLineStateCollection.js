define(["../user","../core/Collection","./HeffLineState"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:function(t){var r,i=e.getDivision();return i&&"prod"===i.get("type")&&(r={name:"and",args:[{name:"eq",args:["division",i.id]}]}),t.Query.fromObject({sort:{date:-1},limit:1e3,selector:r})}})});