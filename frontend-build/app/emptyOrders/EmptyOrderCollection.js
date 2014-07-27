// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","./EmptyOrder"],function(e,t,r){return t.extend({model:r,rqlQuery:function(t){var r=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return t.Query.fromObject({fields:{nc12:1,mrp:1,startDate:1,finishDate:1},sort:{startDate:-1,finishDate:-1},limit:15,selector:{name:"and",args:[{name:"ge",args:["startDate",r.valueOf()]},{name:"le",args:["startDate",r.valueOf()]}]}})}})});