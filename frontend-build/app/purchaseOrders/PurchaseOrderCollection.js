// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","./PurchaseOrder"],function(e,t,n){return t.extend({model:n,rqlQuery:function(t){var n=e.getMoment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).add("day",1).valueOf();return t.Query.fromObject({fields:{changes:0,"items.prints":0},limit:20,sort:{"items.schedule.date":1},selector:{name:"and",args:[{name:"eq",args:["open",!0]},{name:"lt",args:["items.schedule.date",n]},{name:"populate",args:["vendor"]}]}})}})});