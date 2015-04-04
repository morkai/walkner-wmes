// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","./PurchaseOrder"],function(e,r,t){"use strict";return r.extend({model:t,rqlQuery:function(r){var t=e.getMoment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).add(1,"days").valueOf();return r.Query.fromObject({fields:{changes:0,"items.prints":0},limit:20,sort:{scheduledAt:1},selector:{name:"and",args:[{name:"eq",args:["open",!0]},{name:"lt",args:["scheduledAt",t]},{name:"populate",args:["vendor"]}]}})}})});