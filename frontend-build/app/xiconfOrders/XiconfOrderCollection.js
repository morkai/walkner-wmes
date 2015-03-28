// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","./XiconfOrder"],function(e,t,r){return t.extend({model:r,rqlQuery:function(t){return t.Query.fromObject({fields:{items:0},sort:{reqDate:-1},limit:20,selector:{name:"and",args:[{name:"lt",args:["reqDate",e.getMoment().startOf("day").add(1,"days").valueOf()]},{name:"eq",args:["status",-1]}]}})}})});