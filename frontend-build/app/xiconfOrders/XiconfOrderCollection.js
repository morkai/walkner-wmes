// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../core/Collection","./XiconfOrder"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:function(t){return t.Query.fromObject({fields:{items:0},sort:{reqDate:-1},limit:20,selector:{name:"and",args:[{name:"lt",args:["reqDate",e.getMoment().startOf("day").add(1,"days").valueOf()]}]}})}})});